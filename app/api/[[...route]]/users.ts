import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import sendEmail from "@/lib/email";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6).optional(),
  role: z.nativeEnum(UserRole),
  printName: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  // Student-specific fields
  studentId: z.string().optional(),
  programId: z.string().optional(),
  gpa: z.number().min(0).max(4).optional(),
  enrollmentDate: z.string().datetime().optional(),
  graduationDate: z.string().datetime().optional(),
  // Faculty-specific fields
  facultyId: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  hireDate: z.string().datetime().optional()
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  printName: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  role: z.nativeEnum(UserRole).optional()
});

const changePasswordSchema = z.object({
  userId: z.string(),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

const app = new Hono()
  .get("/", async (c) => {
    try {
      const { role, search, page = "1", limit = "10" } = c.req.query();
      
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      
      if (role) {
        where.role = role as UserRole;
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limitNum,
          include: {
            permissions: {
              include: {
                permission: true
              }
            },
            student: {
              include: {
                program: {
                  select: {
                    name: true,
                    code: true
                  }
                }
              }
            },
            faculty: true
          },
          orderBy: {
            createdAt: "desc"
          }
        }),
        prisma.user.count({ where })
      ]);

      const sanitizedUsers = users.map(user => ({
        ...user,
        password: undefined // Remove password from response
      }));

      return c.json({ 
        data: sanitizedUsers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return c.json({ error: "Failed to fetch users" }, 500);
    }
  })
  .get("/roles", async (c) => {
    try {
      const roles = Object.values(UserRole);
      return c.json({ data: roles });
    } catch (error) {
      console.error("Error fetching user roles:", error);
      return c.json({ error: "Failed to fetch roles" }, 500);
    }
  })
  .get("/statistics", async (c) => {
    try {
      const [totalUsers, adminCount, financialAidOfficerCount, studentCount, facultyCount] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.user.count({ where: { role: "FINANCIAL_AID_OFFICER" } }),
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.user.count({ where: { role: "FACULTY" } })
      ]);

      const statistics = {
        totalUsers,
        adminCount,
        financialAidOfficerCount,
        studentCount,
        facultyCount,
        activeUsers: await prisma.user.count({ 
          where: { 
            OR: [
              { student: { isActive: true } },
              { role: { not: "STUDENT" } }
            ]
          }
        })
      };

      return c.json({ data: statistics });
    } catch (error) {
      console.error("Error fetching user statistics:", error);
      return c.json({ error: "Failed to fetch statistics" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          permissions: {
            include: {
              permission: true
            }
          },
          student: {
            include: {
              program: true,
              applications: {
                include: {
                  scholarship: {
                    select: {
                      name: true,
                      category: true
                    }
                  }
                },
                orderBy: {
                  createdAt: "desc"
                }
              },
              awards: {
                include: {
                  application: {
                    include: {
                      scholarship: {
                        select: {
                          name: true
                        }
                      }
                    }
                  }
                },
                orderBy: {
                  awardDate: "desc"
                }
              },
              bankAccounts: {
                where: { isActive: true }
              }
            }
          },
          faculty: true
        }
      });

      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      const sanitizedUser = {
        ...user,
        password: undefined // Remove password from response
      };

      return c.json({ data: sanitizedUser });
    } catch (error) {
      console.error("Error fetching user:", error);
      return c.json({ error: "Failed to fetch user" }, 500);
    }
  })
  .post("/", zValidator("json", createUserSchema), async (c) => {
    const data = c.req.valid("json");

    try {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        return c.json({ error: "Email already in use" }, 400);
      }

      // For students, check if studentId is unique
      if (data.role === "STUDENT" && data.studentId) {
        const existingStudent = await prisma.student.findUnique({
          where: { studentId: data.studentId }
        });

        if (existingStudent) {
          return c.json({ error: "Student ID already in use" }, 400);
        }
      }

      // For faculty, check if facultyId is unique
      if (data.role === "FACULTY" && data.facultyId) {
        const existingFaculty = await prisma.faculty.findUnique({
          where: { facultyId: data.facultyId }
        });

        if (existingFaculty) {
          return c.json({ error: "Faculty ID already in use" }, 400);
        }
      }

      // Generate a secure password if not provided
      let password: string;
      if (data.password) {
        password = data.password;
      } else {
        const { generateSecurePassword } = await import("@/lib/utils");
        password = generateSecurePassword();
      }

      // Create user and related entities in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the user
        const user = await tx.user.create({
          data: {
            name: data.name,
            email: data.email,
            password: password, // Store as-is for now (should implement proper hashing)
            role: data.role,
            printName: data.printName,
            phone: data.phone,
            whatsapp: data.whatsapp,
            address: data.address
          }
        });

        // Create permissions if provided
        if (data.permissions && data.permissions.length > 0) {
          const permissionRecords = await tx.permission.findMany({
            where: { code: { in: data.permissions } }
          });

          await tx.userPermission.createMany({
            data: permissionRecords.map(perm => ({
              userId: user.id,
              permissionId: perm.id
            }))
          });
        }

        // Create student record if role is STUDENT
        if (data.role === "STUDENT") {
          await tx.student.create({
            data: {
              userId: user.id,
              studentId: data.studentId || `STU-${Date.now()}`,
              programId: data.programId,
              gpa: data.gpa,
              enrollmentDate: data.enrollmentDate ? new Date(data.enrollmentDate) : null,
              graduationDate: data.graduationDate ? new Date(data.graduationDate) : null
            }
          });
        }

        // Create faculty record if role is FACULTY
        if (data.role === "FACULTY") {
          await tx.faculty.create({
            data: {
              userId: user.id,
              facultyId: data.facultyId || `FAC-${Date.now()}`,
              department: data.department,
              position: data.position,
              hireDate: data.hireDate ? new Date(data.hireDate) : null
            }
          });
        }

        return user;
      });

      // Send email with credentials if password was generated
      if (!data.password) {
        try {
          await sendEmail(data.email, password);
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
          // Don't fail the user creation if email fails
        }
      }

      return c.json({
        data: {
          ...result,
          password: undefined // Don't return password in response
        },
        message: "User created successfully",
        generatedPassword: !data.password ? password : undefined
      }, 201);
    } catch (error) {
      console.error("Error creating user:", error);
      return c.json({ error: "Failed to create user" }, 500);
    }
  })
  .patch("/:id", zValidator("json", updateUserSchema), async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");

    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      // Check if email is being changed and is not already in use
      if (data.email && data.email !== user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: data.email }
        });

        if (existingUser) {
          return c.json({ error: "Email already in use" }, 400);
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data,
        include: {
          permissions: {
            include: {
              permission: true
            }
          },
          student: true,
          faculty: true
        }
      });

      return c.json({
        data: {
          ...updatedUser,
          password: undefined // Remove password from response
        }
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return c.json({ error: "Failed to update user" }, 500);
    }
  })
  .patch("/:id/password", zValidator("json", changePasswordSchema), async (c) => {
    const id = c.req.param("id");
    const { newPassword } = c.req.valid("json");

    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      await prisma.user.update({
        where: { id },
        data: {
          password: newPassword,
          isFirstLogin: false
        }
      });

      return c.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      return c.json({ error: "Failed to update password" }, 500);
    }
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          student: {
            include: {
              applications: { take: 1 },
              awards: { take: 1 }
            }
          }
        }
      });

      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      // Cannot delete users with scholarship data
      if (user.student && (user.student.applications.length > 0 || user.student.awards.length > 0)) {
        return c.json({ 
          error: "Cannot delete student with existing applications or awards" 
        }, 400);
      }

      // Delete user and cascade will handle related records
      await prisma.user.delete({
        where: { id }
      });

      return c.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      return c.json({ error: "Failed to delete user" }, 500);
    }
  });

export default app;
