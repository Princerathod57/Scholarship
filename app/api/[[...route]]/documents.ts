import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import prisma from "@/lib/prisma";

const app = new Hono()
  .get("/", async (c) => {
    try {
      const { applicationId, disbursementId, uploadedBy, page = "1", limit = "10" } = c.req.query();
      
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      
      if (applicationId) {
        where.applicationId = applicationId;
      }
      
      if (disbursementId) {
        where.disbursementId = disbursementId;
      }
      
      if (uploadedBy) {
        where.uploadedBy = uploadedBy;
      }

      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          where,
          skip,
          take: limitNum,
          include: {
            application: {
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
                scholarship: {
                  select: {
                    name: true
                  }
                }
              }
            },
            disbursement: {
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
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        }),
        prisma.document.count({ where })
      ]);

      return c.json({ 
        data: documents,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error("Error fetching documents:", error);
      return c.json({ error: "Failed to fetch documents" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          application: {
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
              scholarship: {
                select: {
                  name: true,
                  category: true
                }
              }
            }
          },
          disbursement: {
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
              }
            }
          }
        }
      });

      if (!document) {
        return c.json({ error: "Document not found" }, 404);
      }

      return c.json({ data: document });
    } catch (error) {
      console.error("Error fetching document:", error);
      return c.json({ error: "Failed to fetch document" }, 500);
    }
  })
  .post("/", 
    zValidator("json", z.object({
      fileName: z.string().min(1, "File name is required"),
      originalFileName: z.string().min(1, "Original file name is required"),
      fileUrl: z.string().url("Valid file URL is required"),
      fileSize: z.number().min(1).optional(),
      mimeType: z.string().optional(),
      description: z.string().optional(),
      applicationId: z.string().optional(),
      disbursementId: z.string().optional(),
      uploadedBy: z.string().min(1, "Uploaded by is required")
    })),
    async (c) => {
      const data = c.req.valid("json");

      try {
        // Validate that either applicationId or disbursementId is provided
        if (!data.applicationId && !data.disbursementId) {
          return c.json({ 
            error: "Either application ID or disbursement ID must be provided" 
          }, 400);
        }

        // Verify application exists if provided
        if (data.applicationId) {
          const application = await prisma.application.findUnique({
            where: { id: data.applicationId }
          });

          if (!application) {
            return c.json({ error: "Application not found" }, 404);
          }
        }

        // Verify disbursement exists if provided
        if (data.disbursementId) {
          const disbursement = await prisma.disbursement.findUnique({
            where: { id: data.disbursementId }
          });

          if (!disbursement) {
            return c.json({ error: "Disbursement not found" }, 404);
          }
        }

        const document = await prisma.document.create({
          data,
          include: {
            application: {
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
                scholarship: {
                  select: {
                    name: true
                  }
                }
              }
            },
            disbursement: {
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
            }
          }
        });

        return c.json({ data: document }, 201);
      } catch (error) {
        console.error("Error creating document:", error);
        return c.json({ error: "Failed to create document" }, 500);
      }
    }
  )
  .patch("/:id",
    zValidator("json", z.object({
      description: z.string().optional(),
      fileName: z.string().min(1).optional()
    })),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      try {
        const document = await prisma.document.findUnique({
          where: { id }
        });

        if (!document) {
          return c.json({ error: "Document not found" }, 404);
        }

        const updatedDocument = await prisma.document.update({
          where: { id },
          data,
          include: {
            application: {
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

        return c.json({ data: updatedDocument });
      } catch (error) {
        console.error("Error updating document:", error);
        return c.json({ error: "Failed to update document" }, 500);
      }
    }
  )
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          application: true,
          disbursement: true
        }
      });

      if (!document) {
        return c.json({ error: "Document not found" }, 404);
      }

      // Check if document can be deleted based on business rules
      if (document.application && document.application.status === "APPROVED") {
        return c.json({ 
          error: "Cannot delete documents from approved applications" 
        }, 400);
      }

      if (document.disbursement) {
        // Cannot delete disbursement documents older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        if (document.disbursement.disbursementDate < thirtyDaysAgo) {
          return c.json({ 
            error: "Cannot delete documents from disbursements older than 30 days" 
          }, 400);
        }
      }

      await prisma.document.delete({
        where: { id }
      });

      return c.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      return c.json({ error: "Failed to delete document" }, 500);
    }
  })
  .get("/application/:applicationId", async (c) => {
    const applicationId = c.req.param("applicationId");

    try {
      const documents = await prisma.document.findMany({
        where: { applicationId },
        orderBy: {
          createdAt: "asc"
        }
      });

      return c.json({ data: documents });
    } catch (error) {
      console.error("Error fetching application documents:", error);
      return c.json({ error: "Failed to fetch application documents" }, 500);
    }
  })
  .get("/disbursement/:disbursementId", async (c) => {
    const disbursementId = c.req.param("disbursementId");

    try {
      const documents = await prisma.document.findMany({
        where: { disbursementId },
        orderBy: {
          createdAt: "asc"
        }
      });

      return c.json({ data: documents });
    } catch (error) {
      console.error("Error fetching disbursement documents:", error);
      return c.json({ error: "Failed to fetch disbursement documents" }, 500);
    }
  })
  .get("/statistics", async (c) => {
    try {
      const [totalDocuments, applicationDocuments, disbursementDocuments] = await Promise.all([
        prisma.document.count(),
        prisma.document.count({ where: { applicationId: { not: null } } }),
        prisma.document.count({ where: { disbursementId: { not: null } } })
      ]);

      const totalSize = await prisma.document.aggregate({
        _sum: { fileSize: true }
      });

      const statistics = {
        totalDocuments,
        applicationDocuments,
        disbursementDocuments,
        totalSizeBytes: totalSize._sum.fileSize || 0,
        averageSizeBytes: totalDocuments > 0 ? (totalSize._sum.fileSize || 0) / totalDocuments : 0
      };

      return c.json({ data: statistics });
    } catch (error) {
      console.error("Error fetching document statistics:", error);
      return c.json({ error: "Failed to fetch statistics" }, 500);
    }
  });

export default app;
