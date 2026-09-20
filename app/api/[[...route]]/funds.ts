import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import prisma from "@/lib/prisma";

const app = new Hono()
  .get("/", async (c) => {
    try {
      const { programId } = c.req.query();
      
      const where: any = {};
      if (programId) {
        where.programId = programId;
      }

      const funds = await prisma.fund.findMany({
        where,
        include: {
          program: {
            select: {
              name: true,
              code: true
            }
          },
          scholarships: {
            select: {
              id: true,
              name: true,
              status: true
            }
          },
          awards: {
            select: {
              id: true,
              awardedAmount: true,
              status: true
            }
          }
        },
        orderBy: {
          name: "asc"
        }
      });

      const fundsWithSummary = funds.map((fund: any) => ({
        ...fund,
        activeScholarships: fund.scholarships.filter((s: any) => s.status === "ACTIVE").length,
        totalAwards: fund.awards.length,
        totalAwarded: fund.awards.reduce((sum: number, award: any) => sum + award.awardedAmount, 0),
        utilisationPercentage: fund.totalAmount > 0 ? 
          ((fund.totalAmount - fund.availableAmount) / fund.totalAmount) * 100 : 0,
        scholarships: undefined,
        awards: undefined
      }));

      return c.json({ data: fundsWithSummary });
    } catch (error) {
      console.error("Error fetching funds:", error);
      return c.json({ error: "Failed to fetch funds" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const fund = await prisma.fund.findUnique({
        where: { id },
        include: {
          program: true,
          scholarships: {
            include: {
              applications: {
                select: {
                  id: true,
                  status: true,
                  appliedAmount: true
                }
              }
            }
          },
          awards: {
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
              disbursements: {
                select: {
                  id: true,
                  amount: true,
                  disbursementDate: true
                }
              }
            }
          }
        }
      });

      if (!fund) {
        return c.json({ error: "Fund not found" }, 404);
      }

      return c.json({ data: fund });
    } catch (error) {
      console.error("Error fetching fund:", error);
      return c.json({ error: "Failed to fetch fund" }, 500);
    }
  })
  .post("/", 
    zValidator("json", z.object({
      name: z.string().min(1, "Fund name is required"),
      description: z.string().optional(),
      programId: z.string().min(1, "Program ID is required"),
      totalAmount: z.number().min(0, "Total amount must be positive"),
      availableAmount: z.number().min(0, "Available amount must be positive")
    })),
    async (c) => {
      const data = c.req.valid("json");

      try {
        // Verify program exists
        const program = await prisma.program.findUnique({
          where: { id: data.programId }
        });

        if (!program) {
          return c.json({ error: "Program not found" }, 404);
        }

        // Ensure available amount doesn't exceed total amount
        if (data.availableAmount > data.totalAmount) {
          return c.json({ 
            error: "Available amount cannot exceed total amount" 
          }, 400);
        }

        const fund = await prisma.fund.create({
          data: {
            ...data,
            committedAmount: 0,
            disbursedAmount: 0
          },
          include: {
            program: {
              select: {
                name: true,
                code: true
              }
            }
          }
        });

        return c.json({ data: fund }, 201);
      } catch (error) {
        console.error("Error creating fund:", error);
        return c.json({ error: "Failed to create fund" }, 500);
      }
    }
  )
  .patch("/:id",
    zValidator("json", z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      totalAmount: z.number().min(0).optional(),
      availableAmount: z.number().min(0).optional()
    })),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      try {
        const existingFund = await prisma.fund.findUnique({
          where: { id }
        });

        if (!existingFund) {
          return c.json({ error: "Fund not found" }, 404);
        }

        // Validate amounts if they're being updated
        const newTotalAmount = data.totalAmount ?? existingFund.totalAmount;
        const newAvailableAmount = data.availableAmount ?? existingFund.availableAmount;

        if (newAvailableAmount > newTotalAmount) {
          return c.json({ 
            error: "Available amount cannot exceed total amount" 
          }, 400);
        }

        // Ensure we don't reduce total amount below committed + disbursed
        const minimumTotal = existingFund.committedAmount + existingFund.disbursedAmount;
        if (newTotalAmount < minimumTotal) {
          return c.json({ 
            error: `Total amount cannot be less than ${minimumTotal} (committed + disbursed amounts)` 
          }, 400);
        }

        const fund = await prisma.fund.update({
          where: { id },
          data,
          include: {
            program: {
              select: {
                name: true,
                code: true
              }
            }
          }
        });

        return c.json({ data: fund });
      } catch (error) {
        console.error("Error updating fund:", error);
        return c.json({ error: "Failed to update fund" }, 500);
      }
    }
  )
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      // Check if fund has scholarships or awards
      const fund = await prisma.fund.findUnique({
        where: { id },
        include: {
          scholarships: { take: 1 },
          awards: { take: 1 }
        }
      });

      if (!fund) {
        return c.json({ error: "Fund not found" }, 404);
      }

      if (fund.scholarships.length > 0 || fund.awards.length > 0) {
        return c.json({ 
          error: "Cannot delete fund with associated scholarships or awards" 
        }, 400);
      }

      await prisma.fund.delete({
        where: { id }
      });

      return c.json({ message: "Fund deleted successfully" });
    } catch (error) {
      console.error("Error deleting fund:", error);
      return c.json({ error: "Failed to delete fund" }, 500);
    }
  })
  .get("/:id/summary", async (c) => {
    const id = c.req.param("id");

    try {
      const fund = await prisma.fund.findUnique({
        where: { id },
        include: {
          program: {
            select: {
              name: true,
              code: true
            }
          },
          scholarships: true,
          awards: {
            include: {
              disbursements: {
                select: {
                  amount: true
                }
              }
            }
          }
        }
      });

      if (!fund) {
        return c.json({ error: "Fund not found" }, 404);
      }

      const summary = {
        fund: {
          id: fund.id,
          name: fund.name,
          program: fund.program
        },
        financial: {
          totalAmount: fund.totalAmount,
          availableAmount: fund.availableAmount,
          committedAmount: fund.committedAmount,
          disbursedAmount: fund.disbursedAmount,
          utilisationPercentage: fund.totalAmount > 0 ? 
            ((fund.totalAmount - fund.availableAmount) / fund.totalAmount) * 100 : 0
        },
        statistics: {
          totalScholarships: fund.scholarships.length,
          activeScholarships: fund.scholarships.filter(s => s.status === "ACTIVE").length,
          totalAwards: fund.awards.length,
          totalDisbursements: fund.awards.reduce((total: number, award: any) => 
            total + award.disbursements.length, 0
          )
        }
      };

      return c.json({ data: summary });
    } catch (error) {
      console.error("Error fetching fund summary:", error);
      return c.json({ error: "Failed to fetch fund summary" }, 500);
    }
  });

export default app;
