import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";

// Validation schema for series creation
const SeriesSchema = z.object({
  name: z.string().min(2, "Series name is required"),
  prefix: z.string()
    .min(2, "Prefix must be at least 2 characters")
    .regex(/^[A-Z0-9-]+$/, "Prefix must contain only uppercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  format: z.string().optional()
});

// Validation schema for updating series
const SeriesUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  prefix: z.string().optional(),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  format: z.string().optional(),
  lastNumber: z.number().min(0).optional()
});

const app = new Hono()
  .get("/", async (c) => {
    try {
      const allSeries = await prisma.series.findMany({
        orderBy: [
          { isDefault: 'desc' },
          { name: 'asc' }
        ]
      });
      
      return c.json({ data: allSeries });
    } catch (error) {
      console.error('Error fetching series:', error);
      return c.json({ error: "Failed to fetch series" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const series = await prisma.series.findUnique({
        where: { id }
      });

      if (!series) {
        return c.json({ error: "Series not found" }, 404);
      }

      return c.json({ data: series });
    } catch (error) {
      console.error('Error fetching series:', error);
      return c.json({ error: "Failed to fetch series" }, 500);
    }
  })
  .post("/", zValidator("json", SeriesSchema), async (c) => {
    const data = c.req.valid("json");

    try {
      // Check if a series with this name or prefix already exists
      const existingSeries = await prisma.series.findFirst({
        where: {
          OR: [
            { name: data.name },
            { prefix: data.prefix }
          ]
        }
      });
      
      if (existingSeries) {
        return c.json({ 
          error: existingSeries.name === data.name 
            ? "Series name already exists" 
            : "Series prefix already exists" 
        }, 400);
      }

      // If this series is set as default, unset others
      if (data.isDefault) {
        await prisma.series.updateMany({
          data: { isDefault: false }
        });
      }

      const newSeries = await prisma.series.create({
        data: {
          ...data,
          lastNumber: 0
        }
      });

      return c.json({ data: newSeries }, 201);
    } catch (error) {
      console.error('Error creating series:', error);
      return c.json({ error: "Failed to create series" }, 500);
    }
  })
  .patch("/:id", zValidator("json", SeriesUpdateSchema), async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");

    try {
      const existingSeries = await prisma.series.findUnique({
        where: { id }
      });

      if (!existingSeries) {
        return c.json({ error: "Series not found" }, 404);
      }

      // Check for conflicts with name or prefix
      if (data.name || data.prefix) {
        const conflictSeries = await prisma.series.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              {
                OR: [
                  ...(data.name ? [{ name: data.name }] : []),
                  ...(data.prefix ? [{ prefix: data.prefix }] : [])
                ]
              }
            ]
          }
        });

        if (conflictSeries) {
          return c.json({ 
            error: conflictSeries.name === data.name 
              ? "Series name already exists" 
              : "Series prefix already exists" 
          }, 400);
        }
      }

      // If this series is set as default, unset others
      if (data.isDefault) {
        await prisma.series.updateMany({
          where: { id: { not: id } },
          data: { isDefault: false }
        });
      }

      const updatedSeries = await prisma.series.update({
        where: { id },
        data
      });

      return c.json({ data: updatedSeries });
    } catch (error) {
      console.error('Error updating series:', error);
      return c.json({ error: "Failed to update series" }, 500);
    }
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const series = await prisma.series.findUnique({
        where: { id }
      });

      if (!series) {
        return c.json({ error: "Series not found" }, 404);
      }

      // Cannot delete if lastNumber > 0 (series has been used)
      if (series.lastNumber > 0) {
        return c.json({ 
          error: "Cannot delete series that has been used to generate IDs" 
        }, 400);
      }

      await prisma.series.delete({
        where: { id }
      });

      return c.json({ message: "Series deleted successfully" });
    } catch (error) {
      console.error('Error deleting series:', error);
      return c.json({ error: "Failed to delete series" }, 500);
    }
  })
  .post("/:id/generate", async (c) => {
    const id = c.req.param("id");

    try {
      const series = await prisma.series.findUnique({
        where: { id }
      });

      if (!series) {
        return c.json({ error: "Series not found" }, 404);
      }

      const nextNumber = series.lastNumber + 1;
      const year = new Date().getFullYear();
      
      // Use format if provided, otherwise use default format
      const format = series.format || "{prefix}-{year}-{number:3}";
      
      let generatedId = format
        .replace("{prefix}", series.prefix)
        .replace("{year}", year.toString())
        .replace("{number:3}", nextNumber.toString().padStart(3, '0'))
        .replace("{number}", nextNumber.toString());

      // Update the series lastNumber
      const updatedSeries = await prisma.series.update({
        where: { id },
        data: { lastNumber: nextNumber }
      });

      return c.json({ 
        data: {
          generatedId,
          series: updatedSeries,
          nextNumber
        }
      });
    } catch (error) {
      console.error('Error generating ID:', error);
      return c.json({ error: "Failed to generate ID" }, 500);
    }
  })
  .get("/default/:type", async (c) => {
    const type = c.req.param("type");

    try {
      // Map type to series name
      const seriesNameMap: { [key: string]: string } = {
        "application": "Application Series",
        "award": "Award Series", 
        "disbursement": "Disbursement Series"
      };

      const seriesName = seriesNameMap[type];
      if (!seriesName) {
        return c.json({ error: "Invalid series type" }, 400);
      }

      const series = await prisma.series.findFirst({
        where: { name: seriesName }
      });

      if (!series) {
        return c.json({ error: `${seriesName} not found` }, 404);
      }

      return c.json({ data: series });
    } catch (error) {
      console.error('Error fetching default series:', error);
      return c.json({ error: "Failed to fetch default series" }, 500);
    }
  });

export default app;
