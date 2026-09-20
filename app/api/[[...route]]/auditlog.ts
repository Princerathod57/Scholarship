import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import db from "@/lib/prisma";

// Create AuditLog Schema for scholarship management
const AuditLogSchema = z.object({
  userId: z.string().min(1),
  action: z.enum(["CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT", "DISBURSE"]),
  entityType: z.enum([
    "STUDENT", "PROGRAM", "FUND", "SCHOLARSHIP", "APPLICATION", 
    "AWARD", "DISBURSEMENT", "DOCUMENT", "USER", "BANK_ACCOUNT"
  ]),
  entityId: z.string().min(1),
  details: z.record(z.any()).default({}), // Required JSON object with default empty object
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

const app = new Hono()

  // Get all audit logs with filtering and pagination
  .get("/", async (c) => {
    try {
      const { userId, entityType, action, startDate, endDate, limit = "50", offset = "0" } = c.req.query();
      
      const whereClause: any = {};
      
      if (userId) whereClause.userId = userId;
      if (entityType) whereClause.entityType = entityType;
      if (action) whereClause.action = action;
      if (startDate || endDate) {
        whereClause.timestamp = {};
        if (startDate) whereClause.timestamp.gte = new Date(startDate);
        if (endDate) whereClause.timestamp.lte = new Date(endDate);
      }

      const [logs, total] = await Promise.all([
        db.auditLog.findMany({
          where: whereClause,
          orderBy: { timestamp: "desc" },
          include: { 
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          },
          take: parseInt(limit),
          skip: parseInt(offset),
        }),
        db.auditLog.count({ where: whereClause })
      ]);

      return c.json({ 
        success: true, 
        logs,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      });
    } catch (error) {
      console.error("Audit log fetch error:", error);
      return c.json({ error: "Failed to fetch audit logs" }, 500);
    }
  })

  // Get audit log statistics
  .get("/stats", async (c) => {
    try {
      const { startDate, endDate } = c.req.query();
      
      const whereClause: any = {};
      if (startDate || endDate) {
        whereClause.timestamp = {};
        if (startDate) whereClause.timestamp.gte = new Date(startDate);
        if (endDate) whereClause.timestamp.lte = new Date(endDate);
      }

      const [
        totalLogs,
        actionStats,
        entityStats,
        recentActivity
      ] = await Promise.all([
        db.auditLog.count({ where: whereClause }),
        db.auditLog.groupBy({
          by: ['action'],
          where: whereClause,
          _count: { action: true },
        }),
        db.auditLog.groupBy({
          by: ['entityType'],
          where: whereClause,
          _count: { entityType: true },
        }),
        db.auditLog.findMany({
          where: whereClause,
          orderBy: { timestamp: "desc" },
          take: 10,
          include: {
            user: {
              select: {
                name: true,
                email: true,
                role: true
              }
            }
          }
        })
      ]);

      return c.json({
        success: true,
        stats: {
          totalLogs,
          actionStats: actionStats.map(item => ({
            action: item.action,
            count: item._count.action
          })),
          entityStats: entityStats.map(item => ({
            entityType: item.entityType,
            count: item._count.entityType
          })),
          recentActivity
        }
      });
    } catch (error) {
      console.error("Audit stats error:", error);
      return c.json({ error: "Failed to fetch audit statistics" }, 500);
    }
  })

  // Create an audit log entry
  .post("/", zValidator("json", AuditLogSchema), async (c) => {
    try {
      const data = c.req.valid("json");

      const newLog = await db.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          details: data.details,
        },
      });

      return c.json({ success: true, log: newLog }, 201);
    } catch (error) {
      return c.json({ error: "Failed to create audit log" }, 500);
    }
  })

  // Get a specific audit log
  .get("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const log = await db.auditLog.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!log) return c.json({ error: "Audit log not found" }, 404);
      return c.json({ success: true, log });
    } catch (error) {
      return c.json({ error: "Failed to fetch audit log" }, 500);
    }
  })

  // Delete a specific audit log
  .delete("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const log = await db.auditLog.findUnique({ where: { id } });

      if (!log) return c.json({ error: "Audit log not found" }, 404);

      await db.auditLog.delete({ where: { id } });

      return c.json({ success: true, message: "Audit log deleted successfully" });
    } catch (error) {
      return c.json({ error: "Failed to delete audit log" }, 500);
    }
  });

export default app;
