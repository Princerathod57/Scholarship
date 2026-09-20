import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import prisma from "@/lib/prisma";

const app = new Hono();

// Validation schemas
const createStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  studentId: z.string().min(1, "Student ID is required"),
  programId: z.string().optional(),
  gpa: z.number().min(0).max(4).optional(),
  enrollmentDate: z.string().datetime().optional(),
  graduationDate: z.string().datetime().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const updateStudentSchema = createStudentSchema.partial();

// GET /api/students - List all students
app.get("/", async (c) => {
  try {
    const { page = "1", limit = "10", search, programId } = c.req.query();
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { studentId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (programId) {
      where.programId = programId;
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true,
              isFirstLogin: true,
              createdAt: true,
            },
          },
          program: {
            select: {
              id: true,
              name: true,
              code: true,
              department: true,
            },
          },
          awards: {
            select: {
              id: true,
              awardId: true,
              awardedAmount: true,
              remainingBalance: true,
              status: true,
              awardDate: true,
            },
          },
          _count: {
            select: {
              applications: true,
              awards: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);

    return c.json({
      data: students,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return c.json({ error: "Failed to fetch students" }, 500);
  }
});

// GET /api/students/:id - Get student by ID
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            isFirstLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        program: {
          include: {
            funds: {
              select: {
                id: true,
                name: true,
                availableAmount: true,
              },
            },
          },
        },
        applications: {
          include: {
            scholarship: {
              select: {
                id: true,
                name: true,
                category: true,
                amount: true,
              },
            },
            award: {
              select: {
                id: true,
                awardId: true,
                awardedAmount: true,
                remainingBalance: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        awards: {
          include: {
            disbursements: {
              select: {
                id: true,
                disbursementId: true,
                amount: true,
                method: true,
                disbursementDate: true,
              },
              orderBy: { disbursementDate: 'desc' },
            },
          },
          orderBy: { awardDate: 'desc' },
        },
        bankAccounts: {
          where: { isActive: true },
          select: {
            id: true,
            bankName: true,
            accountNumber: true,
            accountType: true,
            isDefault: true,
          },
        },
      },
    });

    if (!student) {
      return c.json({ error: "Student not found" }, 404);
    }

    return c.json({ data: student });
  } catch (error) {
    console.error("Error fetching student:", error);
    return c.json({ error: "Failed to fetch student" }, 500);
  }
});

// POST /api/students - Create new student
app.post("/", zValidator("json", createStudentSchema), async (c) => {
  try {
    const data = c.req.valid("json");

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    // Create user and student in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: tempPassword, // Will be hashed by the application
          role: "STUDENT",
          phone: data.phone,
          address: data.address,
        },
      });

      // Create student
      const student = await tx.student.create({
        data: {
          userId: user.id,
          studentId: data.studentId,
          programId: data.programId,
          gpa: data.gpa,
          enrollmentDate: data.enrollmentDate ? new Date(data.enrollmentDate) : undefined,
          graduationDate: data.graduationDate ? new Date(data.graduationDate) : undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true,
              createdAt: true,
            },
          },
          program: {
            select: {
              id: true,
              name: true,
              code: true,
              department: true,
            },
          },
        },
      });

      return { student, tempPassword };
    });

    // Log audit trail
    // TODO: Add audit log entry

    return c.json({
      data: result.student,
      tempPassword: result.tempPassword,
      message: "Student created successfully. Please provide the temporary password to the student.",
    }, 201);
  } catch (error: any) {
    console.error("Error creating student:", error);
    
    if (error?.code === 'P2002') {
      if (error?.meta?.target?.includes('email')) {
        return c.json({ error: "Email already exists" }, 400);
      }
      if (error?.meta?.target?.includes('student_id')) {
        return c.json({ error: "Student ID already exists" }, 400);
      }
    }
    
    return c.json({ error: "Failed to create student" }, 500);
  }
});

// PATCH /api/students/:id - Update student
app.patch("/:id", zValidator("json", updateStudentSchema), async (c) => {
  try {
    const id = c.req.param("id");
    const data = c.req.valid("json");

    const result = await prisma.$transaction(async (tx) => {
      // First get the student to find the user ID
      const existingStudent = await tx.student.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existingStudent) {
        throw new Error("Student not found");
      }

      // Update user data
      if (data.name || data.email || data.phone || data.address) {
        await tx.user.update({
          where: { id: existingStudent.userId },
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
          },
        });
      }

      // Update student data
      const studentUpdateData: any = {};
      if (data.studentId) studentUpdateData.studentId = data.studentId;
      if (data.programId) studentUpdateData.programId = data.programId;
      if (data.gpa !== undefined) studentUpdateData.gpa = data.gpa;
      if (data.enrollmentDate) studentUpdateData.enrollmentDate = new Date(data.enrollmentDate);
      if (data.graduationDate) studentUpdateData.graduationDate = new Date(data.graduationDate);

      const student = await tx.student.update({
        where: { id },
        data: studentUpdateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true,
            },
          },
          program: {
            select: {
              id: true,
              name: true,
              code: true,
              department: true,
            },
          },
        },
      });

      return student;
    });

    return c.json({ data: result });
  } catch (error) {
    console.error("Error updating student:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as any).code === 'P2002'
    ) {
      if ((error as any).meta?.target?.includes('email')) {
        return c.json({ error: "Email already exists" }, 400);
      }
      if ((error as any).meta?.target?.includes('student_id')) {
        return c.json({ error: "Student ID already exists" }, 400);
      }
    }

    return c.json({ error: "Failed to update student" }, 500);
  }
});

// DELETE /api/students/:id - Deactivate student
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const student = await prisma.student.update({
      where: { id },
      data: { isActive: false },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return c.json({ 
      data: student,
      message: "Student deactivated successfully" 
    });
  } catch (error) {
    console.error("Error deactivating student:", error);
    return c.json({ error: "Failed to deactivate student" }, 500);
  }
});

// GET /api/students/:id/financial-summary - Get student's financial summary
app.get("/:id/financial-summary", async (c) => {
  try {
    const id = c.req.param("id");

    const summary = await prisma.student.findUnique({
      where: { id },
      select: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        awards: {
          select: {
            id: true,
            awardId: true,
            awardedAmount: true,
            remainingBalance: true,
            status: true,
            awardDate: true,
            expiryDate: true,
            disbursements: {
              select: {
                amount: true,
                disbursementDate: true,
                method: true,
              },
              orderBy: { disbursementDate: 'desc' },
            },
          },
          orderBy: { awardDate: 'desc' },
        },
        applications: {
          where: {
            status: { in: ['PENDING', 'UNDER_REVIEW'] },
          },
          select: {
            id: true,
            applicationId: true,
            status: true,
            appliedAmount: true,
            scholarship: {
              select: {
                name: true,
                amount: true,
              },
            },
          },
        },
      },
    });

    if (!summary) {
      return c.json({ error: "Student not found" }, 404);
    }

    // Calculate totals
    const totalAwarded = summary.awards.reduce((sum, award) => sum + award.awardedAmount, 0);
    const totalDisbursed = summary.awards.reduce((sum, award) => 
      sum + award.disbursements.reduce((disbSum, disb) => disbSum + disb.amount, 0), 0
    );
    const totalRemaining = summary.awards.reduce((sum, award) => sum + award.remainingBalance, 0);

    return c.json({
      data: {
        student: summary,
        summary: {
          totalAwarded,
          totalDisbursed,
          totalRemaining,
          activeAwards: summary.awards.filter(a => a.status === 'ACTIVE').length,
          pendingApplications: summary.applications.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching financial summary:", error);
    return c.json({ error: "Failed to fetch financial summary" }, 500);
  }
});

export default app;
