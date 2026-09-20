import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { AwardStatus } from "@prisma/client";

const app = new Hono()
  .get("/", async (c) => {
    try {
      const { status, studentId, fundId, page = "1", limit = "10" } = c.req.query();
      
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      
      if (status) {
        where.status = status as AwardStatus;
      }
      
      if (studentId) {
        where.studentId = studentId;
      }
      
      if (fundId) {
        where.fundId = fundId;
      }

      const [awards, total] = await Promise.all([
        prisma.award.findMany({
          where,
          skip,
          take: limitNum,
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
            fund: {
              select: {
                name: true
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
            },
            disbursements: {
              select: {
                id: true,
                amount: true,
                disbursementDate: true,
                method: true
              },
              orderBy: {
                disbursementDate: "desc"
              }
            }
          },
          orderBy: {
            awardDate: "desc"
          }
        }),
        prisma.award.count({ where })
      ]);

      const awardsWithSummary = awards.map((award: any) => ({
        ...award,
        totalDisbursed: award.disbursements.reduce((sum: number, d: any) => sum + d.amount, 0),
        disbursementCount: award.disbursements.length,
        lastDisbursement: award.disbursements[0] || null
      }));

      return c.json({ 
        data: awardsWithSummary,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error("Error fetching awards:", error);
      return c.json({ error: "Failed to fetch awards" }, 500);
    }
  })
  .get("/statistics", async (c) => {
    try {
      const [totalAwards, activeAwards, totalAwarded, totalDisbursed] = await Promise.all([
        prisma.award.count(),
        prisma.award.count({ where: { status: "ACTIVE" } }),
        prisma.award.aggregate({
          _sum: { awardedAmount: true }
        }),
        prisma.disbursement.aggregate({
          _sum: { amount: true }
        })
      ]);

      const statistics = {
        totalAwards,
        activeAwards,
        disbursedAwards: await prisma.award.count({ where: { status: "DISBURSED" } }),
        totalAwarded: totalAwarded._sum.awardedAmount || 0,
        totalDisbursed: totalDisbursed._sum.amount || 0,
        pendingDisbursement: (totalAwarded._sum.awardedAmount || 0) - (totalDisbursed._sum.amount || 0)
      };

      return c.json({ data: statistics });
    } catch (error) {
      console.error("Error fetching award statistics:", error);
      return c.json({ error: "Failed to fetch statistics" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const award = await prisma.award.findUnique({
        where: { id },
        include: {
          student: {
            include: {
              user: true,
              program: true,
              bankAccounts: {
                where: { isActive: true }
              }
            }
          },
          fund: true,
          application: {
            include: {
              scholarship: true,
              documents: {
                select: {
                  id: true,
                  fileName: true,
                  originalFileName: true,
                  fileUrl: true
                }
              }
            }
          },
          disbursements: {
            include: {
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
              }
            },
            orderBy: {
              disbursementDate: "desc"
            }
          }
        }
      });

      if (!award) {
        return c.json({ error: "Award not found" }, 404);
      }

      return c.json({ data: award });
    } catch (error) {
      console.error("Error fetching award:", error);
      return c.json({ error: "Failed to fetch award" }, 500);
    }
  })
  .patch("/:id/status",
    zValidator("json", z.object({
      status: z.nativeEnum(AwardStatus),
      terms: z.string().optional(),
      expiryDate: z.string().datetime().optional()
    })),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      try {
        const award = await prisma.award.findUnique({
          where: { id }
        });

        if (!award) {
          return c.json({ error: "Award not found" }, 404);
        }

        const updateData = {
          status: data.status,
          terms: data.terms,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined
        };

        const updatedAward = await prisma.award.update({
          where: { id },
          data: updateData,
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
        });

        return c.json({ data: updatedAward });
      } catch (error) {
        console.error("Error updating award status:", error);
        return c.json({ error: "Failed to update award status" }, 500);
      }
    }
  )
  .patch("/:id",
    zValidator("json", z.object({
      terms: z.string().optional(),
      expiryDate: z.string().datetime().optional(),
      isMultiTerm: z.boolean().optional()
    })),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      try {
        const award = await prisma.award.findUnique({
          where: { id }
        });

        if (!award) {
          return c.json({ error: "Award not found" }, 404);
        }

        const updateData = {
          terms: data.terms,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
          isMultiTerm: data.isMultiTerm
        };

        const updatedAward = await prisma.award.update({
          where: { id },
          data: updateData,
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
        });

        return c.json({ data: updatedAward });
      } catch (error) {
        console.error("Error updating award:", error);
        return c.json({ error: "Failed to update award" }, 500);
      }
    }
  )
  .get("/:id/disbursements", async (c) => {
    const id = c.req.param("id");

    try {
      const award = await prisma.award.findUnique({
        where: { id }
      });

      if (!award) {
        return c.json({ error: "Award not found" }, 404);
      }

      const disbursements = await prisma.disbursement.findMany({
        where: { awardId: id },
        include: {
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
      });

      return c.json({ data: disbursements });
    } catch (error) {
      console.error("Error fetching award disbursements:", error);
      return c.json({ error: "Failed to fetch disbursements" }, 500);
    }
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const award = await prisma.award.findUnique({
        where: { id },
        include: {
          disbursements: { take: 1 }
        }
      });

      if (!award) {
        return c.json({ error: "Award not found" }, 404);
      }

      // Cannot delete award if it has disbursements
      if (award.disbursements.length > 0) {
        return c.json({ 
          error: "Cannot delete award with existing disbursements" 
        }, 400);
      }

      // If award is being deleted, we need to return the funds to the fund
      await prisma.$transaction(async (tx) => {
        // Return funds
        await tx.fund.update({
          where: { id: award.fundId },
          data: {
            availableAmount: { increment: award.awardedAmount },
            committedAmount: { decrement: award.awardedAmount }
          }
        });

        // Delete award
        await tx.award.delete({
          where: { id }
        });
      });

      return c.json({ message: "Award deleted successfully and funds returned" });
    } catch (error) {
      console.error("Error deleting award:", error);
      return c.json({ error: "Failed to delete award" }, 500);
    }
  });

export default app;
