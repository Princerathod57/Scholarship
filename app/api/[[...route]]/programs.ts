import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ProgramStatus } from "@prisma/client";

const app = new Hono()
  .get("/", async (c) => {
    try {
      const programs = await prisma.program.findMany({
        include: {
          students: {
            select: {
              id: true
            }
          },
          funds: {
            select: {
              id: true,
              totalAmount: true,
              availableAmount: true
            }
          },
          scholarships: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        },
        orderBy: {
          name: "asc"
        }
      });

      const programsWithCounts = programs.map((program: any) => ({
        ...program,
        studentCount: program.students.length,
        totalFunds: program.funds.reduce((sum: number, fund: any) => sum + fund.totalAmount, 0),
        availableFunds: program.funds.reduce((sum: number, fund: any) => sum + fund.availableAmount, 0),
        scholarshipCount: program.scholarships.filter((s: any) => s.status === "ACTIVE").length,
        students: undefined, // Remove from response
        funds: undefined,
        scholarships: undefined
      }));

      return c.json({ data: programsWithCounts });
    } catch (error) {
      console.error("Error fetching programs:", error);
      return c.json({ error: "Failed to fetch programs" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const program = await prisma.program.findUnique({
        where: { id },
        include: {
          students: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          funds: true,
          scholarships: {
            include: {
              applications: {
                select: {
                  id: true,
                  status: true
                }
              }
            }
          }
        }
      });

      if (!program) {
        return c.json({ error: "Program not found" }, 404);
      }

      return c.json({ data: program });
    } catch (error) {
      console.error("Error fetching program:", error);
      return c.json({ error: "Failed to fetch program" }, 500);
    }
  })
  .post("/", 
    zValidator("json", z.object({
      name: z.string().min(1, "Program name is required"),
      description: z.string().optional(),
      code: z.string().min(1, "Program code is required").max(10),
      department: z.string().optional(),
      status: z.nativeEnum(ProgramStatus).optional()
    })),
    async (c) => {
      const data = c.req.valid("json");

      try {
        // Check if code already exists
        const existingProgram = await prisma.program.findUnique({
          where: { code: data.code }
        });

        if (existingProgram) {
          return c.json({ error: "Program code already exists" }, 400);
        }

        const program = await prisma.program.create({
          data
        });

        return c.json({ data: program }, 201);
      } catch (error) {
        console.error("Error creating program:", error);
        return c.json({ error: "Failed to create program" }, 500);
      }
    }
  )
  .patch("/:id",
    zValidator("json", z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      code: z.string().min(1).max(10).optional(),
      department: z.string().optional(),
      status: z.nativeEnum(ProgramStatus).optional()
    })),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      try {
        // If updating code, check for conflicts
        if (data.code) {
          const existingProgram = await prisma.program.findFirst({
            where: {
              code: data.code,
              id: { not: id }
            }
          });

          if (existingProgram) {
            return c.json({ error: "Program code already exists" }, 400);
          }
        }

        const program = await prisma.program.update({
          where: { id },
          data
        });

        return c.json({ data: program });
      } catch (error) {
        console.error("Error updating program:", error);
        return c.json({ error: "Failed to update program" }, 500);
      }
    }
  )
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      // Check if program has students or funds
      const program = await prisma.program.findUnique({
        where: { id },
        include: {
          students: { take: 1 },
          funds: { take: 1 },
          scholarships: { take: 1 }
        }
      });

      if (!program) {
        return c.json({ error: "Program not found" }, 404);
      }

      if (program.students.length > 0 || program.funds.length > 0 || program.scholarships.length > 0) {
        return c.json({ 
          error: "Cannot delete program with associated students, funds, or scholarships" 
        }, 400);
      }

      await prisma.program.delete({
        where: { id }
      });

      return c.json({ message: "Program deleted successfully" });
    } catch (error) {
      console.error("Error deleting program:", error);
      return c.json({ error: "Failed to delete program" }, 500);
    }
  });

export default app;
