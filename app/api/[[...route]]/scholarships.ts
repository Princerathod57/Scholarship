import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ScholarshipCategory, ScholarshipStatus } from "@prisma/client";

const app = new Hono()
  .get("/", async (c) => {
    try {
      const { status, category, programId, fundId } = c.req.query();
      
      const where: any = {};
      
      if (status) {
        where.status = status as ScholarshipStatus;
      }
      
      if (category) {
        where.category = category as ScholarshipCategory;
      }
      
      if (programId) {
        where.programId = programId;
      }
      
      if (fundId) {
        where.fundId = fundId;
      }

      const scholarships = await prisma.scholarship.findMany({
        where,
        include: {
          fund: {
            select: {
              name: true,
              availableAmount: true
            }
          },
          program: {
            select: {
              name: true,
              code: true
            }
          },
          applications: {
            select: {
              id: true,
              status: true,
              appliedAmount: true
            }
          }
        },
        orderBy: [
          { status: "asc" },
          { name: "asc" }
        ]
      });

      const scholarshipsWithSummary = scholarships.map((scholarship: any) => ({
        ...scholarship,
        applicationCount: scholarship.applications.length,
        pendingApplications: scholarship.applications.filter((a: any) => a.status === "PENDING").length,
        approvedApplications: scholarship.applications.filter((a: any) => a.status === "APPROVED").length,
        totalAppliedAmount: scholarship.applications
          .filter((a: any) => a.appliedAmount)
          .reduce((sum: number, a: any) => sum + (a.appliedAmount || 0), 0),
        applications: undefined // Remove detailed applications from list view
      }));

      return c.json({ data: scholarshipsWithSummary });
    } catch (error) {
      console.error("Error fetching scholarships:", error);
      return c.json({ error: "Failed to fetch scholarships" }, 500);
    }
  })
  .get("/categories", async (c) => {
    try {
      const categories = Object.values(ScholarshipCategory);
      return c.json({ data: categories });
    } catch (error) {
      console.error("Error fetching scholarship categories:", error);
      return c.json({ error: "Failed to fetch categories" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const scholarship = await prisma.scholarship.findUnique({
        where: { id },
        include: {
          fund: true,
          program: true,
          applications: {
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
              documents: {
                select: {
                  id: true,
                  fileName: true,
                  originalFileName: true
                }
              }
            },
            orderBy: {
              createdAt: "desc"
            }
          }
        }
      });

      if (!scholarship) {
        return c.json({ error: "Scholarship not found" }, 404);
      }

      return c.json({ data: scholarship });
    } catch (error) {
      console.error("Error fetching scholarship:", error);
      return c.json({ error: "Failed to fetch scholarship" }, 500);
    }
  })
  .get("/active/public", async (c) => {
    try {
      // Public endpoint for active scholarships (for student application portal)
      const scholarships = await prisma.scholarship.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { applicationDeadline: null },
            { applicationDeadline: { gte: new Date() } }
          ]
        },
        include: {
          fund: {
            select: {
              name: true,
              availableAmount: true
            }
          },
          program: {
            select: {
              name: true,
              code: true,
              department: true
            }
          }
        },
        orderBy: [
          { applicationDeadline: "asc" },
          { name: "asc" }
        ]
      });

      // Only return essential information for public view
      const publicScholarships = scholarships.map(scholarship => ({
        id: scholarship.id,
        name: scholarship.name,
        description: scholarship.description,
        category: scholarship.category,
        amount: scholarship.amount,
        isVariableAmount: scholarship.isVariableAmount,
        minAmount: scholarship.minAmount,
        maxAmount: scholarship.maxAmount,
        requirements: scholarship.requirements,
        applicationDeadline: scholarship.applicationDeadline,
        isRenewable: scholarship.isRenewable,
        maxRenewals: scholarship.maxRenewals,
        fund: scholarship.fund,
        program: scholarship.program
      }));

      return c.json({ data: publicScholarships });
    } catch (error) {
      console.error("Error fetching public scholarships:", error);
      return c.json({ error: "Failed to fetch scholarships" }, 500);
    }
  })
  .post("/", 
    zValidator("json", z.object({
      name: z.string().min(1, "Scholarship name is required"),
      description: z.string().optional(),
      category: z.nativeEnum(ScholarshipCategory),
      amount: z.number().min(0, "Amount must be positive"),
      isVariableAmount: z.boolean().optional(),
      minAmount: z.number().min(0).optional(),
      maxAmount: z.number().min(0).optional(),
      fundId: z.string().min(1, "Fund ID is required"),
      programId: z.string().optional(),
      requirements: z.string().optional(),
      applicationDeadline: z.string().datetime().optional(),
      isRenewable: z.boolean().optional(),
      maxRenewals: z.number().min(0).optional()
    })),
    async (c) => {
      const data = c.req.valid("json");

      try {
        // Verify fund exists and has sufficient balance
        const fund = await prisma.fund.findUnique({
          where: { id: data.fundId }
        });

        if (!fund) {
          return c.json({ error: "Fund not found" }, 404);
        }

        // Verify program exists if provided
        if (data.programId) {
          const program = await prisma.program.findUnique({
            where: { id: data.programId }
          });

          if (!program) {
            return c.json({ error: "Program not found" }, 404);
          }
        }

        // Validate amount constraints for variable amounts
        if (data.isVariableAmount) {
          if (!data.minAmount || !data.maxAmount) {
            return c.json({ 
              error: "Min and max amounts are required for variable amount scholarships" 
            }, 400);
          }
          
          if (data.minAmount >= data.maxAmount) {
            return c.json({ 
              error: "Min amount must be less than max amount" 
            }, 400);
          }
        }

        const scholarship = await prisma.scholarship.create({
          data: {
            ...data,
            applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null
          },
          include: {
            fund: {
              select: {
                name: true
              }
            },
            program: {
              select: {
                name: true,
                code: true
              }
            }
          }
        });

        return c.json({ data: scholarship }, 201);
      } catch (error) {
        console.error("Error creating scholarship:", error);
        return c.json({ error: "Failed to create scholarship" }, 500);
      }
    }
  )
  .patch("/:id",
    zValidator("json", z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      category: z.nativeEnum(ScholarshipCategory).optional(),
      amount: z.number().min(0).optional(),
      isVariableAmount: z.boolean().optional(),
      minAmount: z.number().min(0).optional(),
      maxAmount: z.number().min(0).optional(),
      requirements: z.string().optional(),
      applicationDeadline: z.string().datetime().optional(),
      status: z.nativeEnum(ScholarshipStatus).optional(),
      isRenewable: z.boolean().optional(),
      maxRenewals: z.number().min(0).optional()
    })),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      try {
        const existingScholarship = await prisma.scholarship.findUnique({
          where: { id }
        });

        if (!existingScholarship) {
          return c.json({ error: "Scholarship not found" }, 404);
        }

        // Validate amount constraints for variable amounts
        if (data.isVariableAmount !== undefined && data.isVariableAmount) {
          const minAmount = data.minAmount ?? existingScholarship.minAmount;
          const maxAmount = data.maxAmount ?? existingScholarship.maxAmount;
          
          if (!minAmount || !maxAmount) {
            return c.json({ 
              error: "Min and max amounts are required for variable amount scholarships" 
            }, 400);
          }
          
          if (minAmount >= maxAmount) {
            return c.json({ 
              error: "Min amount must be less than max amount" 
            }, 400);
          }
        }

        const updateData = {
          ...data,
          applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : undefined
        };

        const scholarship = await prisma.scholarship.update({
          where: { id },
          data: updateData,
          include: {
            fund: {
              select: {
                name: true
              }
            },
            program: {
              select: {
                name: true,
                code: true
              }
            }
          }
        });

        return c.json({ data: scholarship });
      } catch (error) {
        console.error("Error updating scholarship:", error);
        return c.json({ error: "Failed to update scholarship" }, 500);
      }
    }
  )
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      // Check if scholarship has applications
      const scholarship = await prisma.scholarship.findUnique({
        where: { id },
        include: {
          applications: { take: 1 }
        }
      });

      if (!scholarship) {
        return c.json({ error: "Scholarship not found" }, 404);
      }

      if (scholarship.applications.length > 0) {
        return c.json({ 
          error: "Cannot delete scholarship with existing applications" 
        }, 400);
      }

      await prisma.scholarship.delete({
        where: { id }
      });

      return c.json({ message: "Scholarship deleted successfully" });
    } catch (error) {
      console.error("Error deleting scholarship:", error);
      return c.json({ error: "Failed to delete scholarship" }, 500);
    }
  });

export default app;
