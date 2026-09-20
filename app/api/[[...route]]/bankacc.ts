import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";

// Create Schema for both institutional and student bank accounts
const BankAccountSchema = z.object({
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z.string().min(6, "Account number must be at least 6 digits"),
  routingNumber: z.string().optional(),
  branchName: z.string().min(2).optional(),
  accountType: z.string().optional(),
  isInstitutional: z.boolean().default(false),
  studentId: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// Update Schema
const BankAccountUpdateSchema = z.object({
  bankName: z.string().min(2).optional(),
  accountNumber: z.string().min(6).optional(),
  routingNumber: z.string().optional(),
  branchName: z.string().optional(),
  accountType: z.string().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional()
});

const app = new Hono()
  .get("/", async (c) => {
    try {
      const { studentId, isInstitutional, isActive } = c.req.query();
      
      const where: any = {};
      
      if (studentId) {
        where.studentId = studentId;
      }
      
      if (isInstitutional !== undefined) {
        where.isInstitutional = isInstitutional === "true";
      }
      
      if (isActive !== undefined) {
        where.isActive = isActive === "true";
      }

      const accounts = await prisma.bankAccount.findMany({
        where,
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              },
              program: {
                select: {
                  name: true,
                  code: true
                }
              }
            }
          }
        },
        orderBy: [
          { isDefault: "desc" },
          { createdAt: "desc" }
        ]
      });

      return c.json({ data: accounts });
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      return c.json({ error: "Failed to fetch bank accounts" }, 500);
    }
  })
  .get("/institutional", async (c) => {
    try {
      const accounts = await prisma.bankAccount.findMany({
        where: {
          isInstitutional: true,
          isActive: true
        },
        orderBy: [
          { isDefault: "desc" },
          { bankName: "asc" }
        ]
      });

      return c.json({ data: accounts });
    } catch (error) {
      console.error("Error fetching institutional bank accounts:", error);
      return c.json({ error: "Failed to fetch institutional bank accounts" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const account = await prisma.bankAccount.findUnique({
        where: { id },
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              },
              program: {
                select: {
                  name: true,
                  code: true
                }
              }
            }
          },
          studentDisbursements: {
            select: {
              id: true,
              amount: true,
              disbursementDate: true
            },
            orderBy: {
              disbursementDate: "desc"
            },
            take: 10
          },
          institutionDisbursements: {
            select: {
              id: true,
              amount: true,
              disbursementDate: true
            },
            orderBy: {
              disbursementDate: "desc"
            },
            take: 10
          }
        }
      });

      if (!account) {
        return c.json({ error: "Bank account not found" }, 404);
      }

      return c.json({ data: account });
    } catch (error) {
      console.error("Error fetching bank account:", error);
      return c.json({ error: "Failed to fetch bank account" }, 500);
    }
  })
  .post("/", zValidator("json", BankAccountSchema), async (c) => {
    const data = c.req.valid("json");

    try {
      // Validate student exists if studentId is provided
      if (data.studentId) {
        const student = await prisma.student.findUnique({
          where: { id: data.studentId }
        });

        if (!student) {
          return c.json({ error: "Student not found" }, 404);
        }

        // Institutional accounts cannot have studentId
        if (data.isInstitutional) {
          return c.json({ error: "Institutional accounts cannot be linked to students" }, 400);
        }
      } else if (!data.isInstitutional) {
        return c.json({ error: "Non-institutional accounts must be linked to a student" }, 400);
      }

      // Handle default account logic
      if (data.isDefault) {
        const whereClause: any = {};
        
        if (data.isInstitutional) {
          whereClause.isInstitutional = true;
        } else if (data.studentId) {
          whereClause.studentId = data.studentId;
        }

        // Unset other default accounts in the same category
        await prisma.bankAccount.updateMany({
          where: whereClause,
          data: { isDefault: false }
        });
      }

      const newAccount = await prisma.bankAccount.create({
        data,
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      return c.json({ data: newAccount }, 201);
    } catch (error) {
      console.error("Error creating bank account:", error);
      return c.json({ error: "Failed to create bank account" }, 500);
    }
  })
  .patch("/:id", zValidator("json", BankAccountUpdateSchema), async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");

    try {
      const account = await prisma.bankAccount.findUnique({
        where: { id }
      });

      if (!account) {
        return c.json({ error: "Bank account not found" }, 404);
      }

      // Handle default account logic
      if (data.isDefault) {
        const whereClause: any = {};
        
        if (account.isInstitutional) {
          whereClause.isInstitutional = true;
        } else if (account.studentId) {
          whereClause.studentId = account.studentId;
        }

        // Unset other default accounts
        await prisma.bankAccount.updateMany({
          where: {
            ...whereClause,
            id: { not: id }
          },
          data: { isDefault: false }
        });
      }

      const updatedAccount = await prisma.bankAccount.update({
        where: { id },
        data,
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      return c.json({ data: updatedAccount });
    } catch (error) {
      console.error("Error updating bank account:", error);
      return c.json({ error: "Failed to update bank account" }, 500);
    }
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const account = await prisma.bankAccount.findUnique({
        where: { id },
        include: {
          studentDisbursements: { take: 1 },
          institutionDisbursements: { take: 1 }
        }
      });

      if (!account) {
        return c.json({ error: "Bank account not found" }, 404);
      }

      // Cannot delete account with disbursements
      if (account.studentDisbursements.length > 0 || account.institutionDisbursements.length > 0) {
        return c.json({ 
          error: "Cannot delete bank account with existing disbursements" 
        }, 400);
      }

      await prisma.bankAccount.delete({
        where: { id }
      });

      return c.json({ message: "Bank account deleted successfully" });
    } catch (error) {
      console.error("Error deleting bank account:", error);
      return c.json({ error: "Failed to delete bank account" }, 500);
    }
  })
  .patch("/:id/deactivate", async (c) => {
    const id = c.req.param("id");

    try {
      const account = await prisma.bankAccount.findUnique({
        where: { id }
      });

      if (!account) {
        return c.json({ error: "Bank account not found" }, 404);
      }

      const updatedAccount = await prisma.bankAccount.update({
        where: { id },
        data: { 
          isActive: false,
          isDefault: false // Remove default status when deactivating
        }
      });

      return c.json({ 
        data: updatedAccount,
        message: "Bank account deactivated successfully" 
      });
    } catch (error) {
      console.error("Error deactivating bank account:", error);
      return c.json({ error: "Failed to deactivate bank account" }, 500);
    }
  });

export default app;
