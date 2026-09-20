import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import prisma from "@/lib/prisma";

const app = new Hono()
  .get("/", async (c) => {
    try {
      // TODO: Add authentication to get current faculty member
      // For now, get all recommendations
      const recommendations = await prisma.recommendation.findMany({
        include: {
          faculty: {
            include: { user: true }
          },
          student: {
            include: { user: true }
          },
          application: {
            include: { scholarship: true }
          },
          scholarship: true
        },
        orderBy: { createdAt: "desc" }
      });

      return c.json({ data: recommendations });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      return c.json({ error: "Failed to fetch recommendations" }, 500);
    }
  })
  .post("/", 
    zValidator("json", z.object({
      facultyId: z.string(),
      studentId: z.string(),
      applicationId: z.string().optional(),
      scholarshipId: z.string().optional(),
      title: z.string(),
      content: z.string().min(100, "Recommendation must be at least 100 characters"),
      status: z.enum(["DRAFT", "SUBMITTED"]).default("DRAFT")
    })),
    async (c) => {
      try {
        const body = c.req.valid("json");

        // Verify faculty exists
        const faculty = await prisma.faculty.findUnique({
          where: { id: body.facultyId }
        });

        if (!faculty) {
          return c.json({ error: "Faculty not found" }, 404);
        }

        // Verify student exists
        const student = await prisma.student.findUnique({
          where: { id: body.studentId }
        });

        if (!student) {
          return c.json({ error: "Student not found" }, 404);
        }

        // Verify application exists if provided
        if (body.applicationId) {
          const application = await prisma.application.findUnique({
            where: { id: body.applicationId }
          });

          if (!application) {
            return c.json({ error: "Application not found" }, 404);
          }
        }

        // Verify scholarship exists if provided
        if (body.scholarshipId) {
          const scholarship = await prisma.scholarship.findUnique({
            where: { id: body.scholarshipId }
          });

          if (!scholarship) {
            return c.json({ error: "Scholarship not found" }, 404);
          }
        }

        const recommendation = await prisma.recommendation.create({
          data: {
            facultyId: body.facultyId,
            studentId: body.studentId,
            applicationId: body.applicationId,
            scholarshipId: body.scholarshipId,
            title: body.title,
            content: body.content,
            status: body.status,
            submittedAt: body.status === "SUBMITTED" ? new Date() : null
          },
          include: {
            faculty: {
              include: { user: true }
            },
            student: {
              include: { user: true }
            },
            application: {
              include: { scholarship: true }
            },
            scholarship: true
          }
        });

        return c.json({ data: recommendation });
      } catch (error) {
        console.error("Error creating recommendation:", error);
        return c.json({ error: "Failed to create recommendation" }, 500);
      }
    }
  )
  .get("/:id", async (c) => {
    try {
      const id = c.req.param("id");

      const recommendation = await prisma.recommendation.findUnique({
        where: { id },
        include: {
          faculty: {
            include: { user: true }
          },
          student: {
            include: { user: true }
          },
          application: {
            include: { scholarship: true }
          },
          scholarship: true
        }
      });

      if (!recommendation) {
        return c.json({ error: "Recommendation not found" }, 404);
      }

      return c.json({ data: recommendation });
    } catch (error) {
      console.error("Error fetching recommendation:", error);
      return c.json({ error: "Failed to fetch recommendation" }, 500);
    }
  })
  .patch("/:id",
    zValidator("json", z.object({
      title: z.string().optional(),
      content: z.string().min(100, "Recommendation must be at least 100 characters").optional(),
      status: z.enum(["DRAFT", "SUBMITTED"]).optional()
    })),
    async (c) => {
      try {
        const id = c.req.param("id");
        const body = c.req.valid("json");

        // Check if recommendation exists
        const existingRecommendation = await prisma.recommendation.findUnique({
          where: { id }
        });

        if (!existingRecommendation) {
          return c.json({ error: "Recommendation not found" }, 404);
        }

        // Don't allow editing submitted recommendations (except to re-submit)
        if (existingRecommendation.status === "SUBMITTED" && body.status !== "SUBMITTED") {
          return c.json({ error: "Cannot edit submitted recommendation" }, 400);
        }

        const updateData: any = {};
        if (body.title) updateData.title = body.title;
        if (body.content) updateData.content = body.content;
        if (body.status) {
          updateData.status = body.status;
          if (body.status === "SUBMITTED") {
            updateData.submittedAt = new Date();
          }
        }

        const recommendation = await prisma.recommendation.update({
          where: { id },
          data: updateData,
          include: {
            faculty: {
              include: { user: true }
            },
            student: {
              include: { user: true }
            },
            application: {
              include: { scholarship: true }
            },
            scholarship: true
          }
        });

        return c.json({ data: recommendation });
      } catch (error) {
        console.error("Error updating recommendation:", error);
        return c.json({ error: "Failed to update recommendation" }, 500);
      }
    }
  )
  .delete("/:id", async (c) => {
    try {
      const id = c.req.param("id");

      // Check if recommendation exists
      const existingRecommendation = await prisma.recommendation.findUnique({
        where: { id }
      });

      if (!existingRecommendation) {
        return c.json({ error: "Recommendation not found" }, 404);
      }

      // Don't allow deleting submitted recommendations
      if (existingRecommendation.status === "SUBMITTED") {
        return c.json({ error: "Cannot delete submitted recommendation" }, 400);
      }

      await prisma.recommendation.delete({
        where: { id }
      });

      return c.json({ message: "Recommendation deleted successfully" });
    } catch (error) {
      console.error("Error deleting recommendation:", error);
      return c.json({ error: "Failed to delete recommendation" }, 500);
    }
  });

export default app;
