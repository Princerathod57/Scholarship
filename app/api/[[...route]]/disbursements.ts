import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { DisbursementMethod } from "@prisma/client";

const app = new Hono()
  .get("/", async (c) => {
    try {
      const { awardId, studentId, method, page = "1", limit = "10" } = c.req.query();
      
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      
      if (awardId) {
        where.awardId = awardId;
      }
      
      if (method) {
        where.method = method as DisbursementMethod;
      }

      if (studentId) {
        where.award = { studentId };
      }

      const [disbursements, total] = await Promise.all([
        prisma.disbursement.findMany({
          where,
          skip,
          take: limitNum,
          include: {
            award: {
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
                application: {
                  include: {
                    scholarship: {
                      select: {
                        name: true,
                        category: true
                      }
                    }
                  }
                }
              }
            },
            studentBankAccount: {
              select: {
                bankName: true,
                accountNumber: true,
                accountType: true
              }
            },
            institutionBankAccount: {
              select: {
                bankName: true,
                accountNumber: true,
                accountType: true
              }
            },
            creator: {
              select: {
                name: true,
                email: true
              }
            },
            documents: {
              select: {
                id: true,
                fileName: true,
                originalFileName: true
              }
            }
          },
          orderBy: {
            disbursementDate: "desc"
          }
        }),
        prisma.disbursement.count({ where })
      ]);

      return c.json({ 
        data: disbursements,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error("Error fetching disbursements:", error);
      return c.json({ error: "Failed to fetch disbursements" }, 500);
    }
  })
  .get("/statistics", async (c) => {
    try {
      const [totalDisbursements, totalAmount, directDepositCount, checkCount] = await Promise.all([
        prisma.disbursement.count(),
        prisma.disbursement.aggregate({
          _sum: { amount: true }
        }),
        prisma.disbursement.count({ where: { method: "DIRECT_DEPOSIT" } }),
        prisma.disbursement.count({ where: { method: "CHECK" } })
      ]);

      const currentMonth = new Date();
      currentMonth.setDate(1);
      const thisMonthCount = await prisma.disbursement.count({
        where: {
          disbursementDate: {
            gte: currentMonth
          }
        }
      });

      const thisMonthAmount = await prisma.disbursement.aggregate({
        where: {
          disbursementDate: {
            gte: currentMonth
          }
        },
        _sum: { amount: true }
      });

      const statistics = {
        totalDisbursements,
        totalAmount: totalAmount._sum.amount || 0,
        directDepositCount,
        checkCount,
        thisMonthCount,
        thisMonthAmount: thisMonthAmount._sum.amount || 0,
        averageAmount: totalDisbursements > 0 ? (totalAmount._sum.amount || 0) / totalDisbursements : 0
      };

      return c.json({ data: statistics });
    } catch (error) {
      console.error("Error fetching disbursement statistics:", error);
      return c.json({ error: "Failed to fetch statistics" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const disbursement = await prisma.disbursement.findUnique({
        where: { id },
        include: {
          award: {
            include: {
              student: {
                include: {
                  user: true,
                  program: true
                }
              },
              application: {
                include: {
                  scholarship: true
                }
              },
              fund: true
            }
          },
          studentBankAccount: true,
          institutionBankAccount: true,
          creator: {
            select: {
              name: true,
              email: true,
              role: true
            }
          },
          documents: {
            select: {
              id: true,
              fileName: true,
              originalFileName: true,
              fileUrl: true,
              description: true
            }
          }
        }
      });

      if (!disbursement) {
        return c.json({ error: "Disbursement not found" }, 404);
      }

      return c.json({ data: disbursement });
    } catch (error) {
      console.error("Error fetching disbursement:", error);
      return c.json({ error: "Failed to fetch disbursement" }, 500);
    }
  })
  .post("/", 
    zValidator("json", z.object({
      awardId: z.string().min(1, "Award ID is required"),
      amount: z.number().min(0.01, "Amount must be greater than 0"),
      method: z.nativeEnum(DisbursementMethod),
      studentBankAccountId: z.string().optional(),
      institutionBankAccountId: z.string().optional(),
      checkNumber: z.string().optional(),
      reference: z.string().optional(),
      notes: z.string().optional(),
      disbursementDate: z.string().datetime().optional(),
      createdBy: z.string().min(1, "Created by is required")
    })),
    async (c) => {
      const data = c.req.valid("json");

      try {
        // Verify award exists and has sufficient balance
        const award = await prisma.award.findUnique({
          where: { id: data.awardId },
          include: {
            fund: true,
            student: {
              include: {
                bankAccounts: {
                  where: { isActive: true }
                }
              }
            }
          }
        });

        if (!award) {
          return c.json({ error: "Award not found" }, 404);
        }

        if (award.remainingBalance < data.amount) {
          return c.json({ 
            error: `Insufficient award balance. Available: ${award.remainingBalance}` 
          }, 400);
        }

        // Validate payment method requirements
        if (data.method === "DIRECT_DEPOSIT") {
          if (!data.studentBankAccountId) {
            return c.json({ error: "Student bank account is required for direct deposit" }, 400);
          }

          // Verify bank account exists and belongs to the student
          const bankAccount = await prisma.bankAccount.findFirst({
            where: {
              id: data.studentBankAccountId,
              studentId: award.studentId,
              isActive: true
            }
          });

          if (!bankAccount) {
            return c.json({ error: "Invalid or inactive student bank account" }, 400);
          }
        }

        if (data.method === "CHECK" && !data.checkNumber) {
          return c.json({ error: "Check number is required for check disbursement" }, 400);
        }

        // Generate disbursement ID
        const disbursementIdSeries = await prisma.series.findFirst({
          where: { name: "Disbursement Series" }
        });

        let disbursementId = "";
        if (disbursementIdSeries) {
          const nextNumber = disbursementIdSeries.lastNumber + 1;
          const year = new Date().getFullYear();
          disbursementId = `DIS-${year}-${nextNumber.toString().padStart(3, '0')}`;
          
          await prisma.series.update({
            where: { id: disbursementIdSeries.id },
            data: { lastNumber: nextNumber }
          });
        } else {
          disbursementId = `DIS-${Date.now()}`;
        }

        // Create disbursement and update award/fund in transaction
        const disbursement = await prisma.$transaction(async (tx) => {
          // Create disbursement
          const newDisbursement = await tx.disbursement.create({
            data: {
              disbursementId,
              awardId: data.awardId,
              amount: data.amount,
              method: data.method,
              studentBankAccountId: data.studentBankAccountId,
              institutionBankAccountId: data.institutionBankAccountId,
              checkNumber: data.checkNumber,
              reference: data.reference,
              notes: data.notes,
              disbursementDate: data.disbursementDate ? new Date(data.disbursementDate) : new Date(),
              createdBy: data.createdBy
            }
          });

          // Update award remaining balance
          const newRemainingBalance = award.remainingBalance - data.amount;
          const newStatus = newRemainingBalance === 0 ? "DISBURSED" : 
                           newRemainingBalance < award.awardedAmount ? "PARTIALLY_DISBURSED" : "ACTIVE";

          await tx.award.update({
            where: { id: data.awardId },
            data: {
              remainingBalance: newRemainingBalance,
              status: newStatus
            }
          });

          // Update fund amounts
          await tx.fund.update({
            where: { id: award.fundId },
            data: {
              committedAmount: { decrement: data.amount },
              disbursedAmount: { increment: data.amount }
            }
          });

          return newDisbursement;
        });

        // Fetch complete disbursement data
        const completeDisbursement = await prisma.disbursement.findUnique({
          where: { id: disbursement.id },
          include: {
            award: {
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
                },
                application: {
                  include: {
                    scholarship: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            },
            studentBankAccount: {
              select: {
                bankName: true,
                accountType: true
              }
            }
          }
        });

        return c.json({ data: completeDisbursement }, 201);
      } catch (error) {
        console.error("Error creating disbursement:", error);
        return c.json({ error: "Failed to create disbursement" }, 500);
      }
    }
  )
  .patch("/:id",
    zValidator("json", z.object({
      reference: z.string().optional(),
      notes: z.string().optional(),
      disbursementDate: z.string().datetime().optional()
    })),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      try {
        const disbursement = await prisma.disbursement.findUnique({
          where: { id }
        });

        if (!disbursement) {
          return c.json({ error: "Disbursement not found" }, 404);
        }

        const updateData = {
          reference: data.reference,
          notes: data.notes,
          disbursementDate: data.disbursementDate ? new Date(data.disbursementDate) : undefined
        };

        const updatedDisbursement = await prisma.disbursement.update({
          where: { id },
          data: updateData,
          include: {
            award: {
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
            }
          }
        });

        return c.json({ data: updatedDisbursement });
      } catch (error) {
        console.error("Error updating disbursement:", error);
        return c.json({ error: "Failed to update disbursement" }, 500);
      }
    }
  )
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const disbursement = await prisma.disbursement.findUnique({
        where: { id },
        include: {
          award: {
            include: {
              fund: true
            }
          },
          documents: true
        }
      });

      if (!disbursement) {
        return c.json({ error: "Disbursement not found" }, 404);
      }

      // Cannot delete disbursement older than 30 days (business rule)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (disbursement.disbursementDate < thirtyDaysAgo) {
        return c.json({ 
          error: "Cannot delete disbursement older than 30 days" 
        }, 400);
      }

      // Delete in transaction to revert award and fund balances
      await prisma.$transaction(async (tx) => {
        // Delete associated documents first if any
        if (disbursement.documents.length > 0) {
          await tx.document.deleteMany({
            where: { disbursementId: id }
          });
        }

        // Restore award balance
        const newRemainingBalance = disbursement.award.remainingBalance + disbursement.amount;
        const newStatus = newRemainingBalance === disbursement.award.awardedAmount ? "ACTIVE" : "PARTIALLY_DISBURSED";

        await tx.award.update({
          where: { id: disbursement.awardId },
          data: {
            remainingBalance: newRemainingBalance,
            status: newStatus
          }
        });

        // Restore fund amounts
        await tx.fund.update({
          where: { id: disbursement.award.fundId },
          data: {
            committedAmount: { increment: disbursement.amount },
            disbursedAmount: { decrement: disbursement.amount }
          }
        });

        // Delete disbursement
        await tx.disbursement.delete({
          where: { id }
        });
      });

      return c.json({ message: "Disbursement deleted successfully and balances restored" });
    } catch (error) {
      console.error("Error deleting disbursement:", error);
      return c.json({ error: "Failed to delete disbursement" }, 500);
    }
  })
  .get("/methods", async (c) => {
    try {
      const methods = Object.values(DisbursementMethod);
      return c.json({ data: methods });
    } catch (error) {
      console.error("Error fetching disbursement methods:", error);
      return c.json({ error: "Failed to fetch methods" }, 500);
    }
  });

export default app;
