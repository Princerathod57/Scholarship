import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

const app = new Hono()
  .get("/", async (c) => {
    try {
      const { status, studentId, scholarshipId, page = "1", limit = "10" } = c.req.query();
      
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      
      if (status) {
        where.status = status as ApplicationStatus;
      }
      
      if (studentId) {
        where.studentId = studentId;
      }
      
      if (scholarshipId) {
        where.scholarshipId = scholarshipId;
      }

      const [applications, total] = await Promise.all([
        prisma.application.findMany({
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
            scholarship: {
              select: {
                name: true,
                category: true,
                amount: true,
                isVariableAmount: true,
                minAmount: true,
                maxAmount: true
              }
            },
            documents: {
              select: {
                id: true,
                fileName: true,
                originalFileName: true
              }
            },
            award: {
              select: {
                id: true,
                awardId: true,
                awardedAmount: true,
                status: true
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        }),
        prisma.application.count({ where })
      ]);

      return c.json({ 
        data: applications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error("Error fetching applications:", error);
      return c.json({ error: "Failed to fetch applications" }, 500);
    }
  })
  .get("/statistics", async (c) => {
    try {
      const [totalApplications, pendingApplications, approvedApplications, rejectedApplications] = await Promise.all([
        prisma.application.count(),
        prisma.application.count({ where: { status: "PENDING" } }),
        prisma.application.count({ where: { status: "APPROVED" } }),
        prisma.application.count({ where: { status: "REJECTED" } })
      ]);

      const statistics = {
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        underReviewApplications: await prisma.application.count({ where: { status: "UNDER_REVIEW" } })
      };

      return c.json({ data: statistics });
    } catch (error) {
      console.error("Error fetching application statistics:", error);
      return c.json({ error: "Failed to fetch statistics" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                  address: true
                }
              },
              program: true,
              bankAccounts: {
                where: { isActive: true },
                select: {
                  id: true,
                  bankName: true,
                  accountNumber: true,
                  accountType: true,
                  isDefault: true
                }
              }
            }
          },
          scholarship: {
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
              }
            }
          },
          documents: true,
          award: {
            include: {
              disbursements: {
                select: {
                  id: true,
                  amount: true,
                  disbursementDate: true,
                  method: true
                }
              }
            }
          },
          creator: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      if (!application) {
        return c.json({ error: "Application not found" }, 404);
      }

      return c.json({ data: application });
    } catch (error) {
      console.error("Error fetching application:", error);
      return c.json({ error: "Failed to fetch application" }, 500);
    }
  })
  .post("/", 
    zValidator("json", z.object({
      studentId: z.string().min(1, "Student ID is required"),
      scholarshipId: z.string().min(1, "Scholarship ID is required"),
      appliedAmount: z.number().min(0).optional(),
      essay: z.string().optional(),
      createdBy: z.string().optional()
    })),
    async (c) => {
      const data = c.req.valid("json");

      try {
        // Verify student exists
        const student = await prisma.student.findUnique({
          where: { id: data.studentId }
        });

        if (!student) {
          return c.json({ error: "Student not found" }, 404);
        }

        // Verify scholarship exists and is active
        const scholarship = await prisma.scholarship.findUnique({
          where: { id: data.scholarshipId },
          include: {
            fund: true
          }
        });

        if (!scholarship) {
          return c.json({ error: "Scholarship not found" }, 404);
        }

        if (scholarship.status !== "ACTIVE") {
          return c.json({ error: "Scholarship is not active" }, 400);
        }

        // Check if application deadline has passed
        if (scholarship.applicationDeadline && new Date() > scholarship.applicationDeadline) {
          return c.json({ error: "Application deadline has passed" }, 400);
        }

        // Check for existing application
        const existingApplication = await prisma.application.findFirst({
          where: {
            studentId: data.studentId,
            scholarshipId: data.scholarshipId
          }
        });

        if (existingApplication) {
          return c.json({ error: "Application already exists for this scholarship" }, 400);
        }

        // Validate applied amount for variable scholarships
        if (scholarship.isVariableAmount) {
          if (!data.appliedAmount) {
            return c.json({ error: "Applied amount is required for variable amount scholarships" }, 400);
          }
          
          if (data.appliedAmount < (scholarship.minAmount || 0) || 
              data.appliedAmount > (scholarship.maxAmount || scholarship.amount)) {
            return c.json({ 
              error: `Applied amount must be between ${scholarship.minAmount} and ${scholarship.maxAmount}` 
            }, 400);
          }
        }

        // Generate application ID
        const applicationIdSeries = await prisma.series.findFirst({
          where: { name: "Application Series" }
        });

        let applicationId = "";
        if (applicationIdSeries) {
          const nextNumber = applicationIdSeries.lastNumber + 1;
          const year = new Date().getFullYear();
          applicationId = `APP-${year}-${nextNumber.toString().padStart(3, '0')}`;
          
          // Update series
          await prisma.series.update({
            where: { id: applicationIdSeries.id },
            data: { lastNumber: nextNumber }
          });
        } else {
          applicationId = `APP-${Date.now()}`;
        }

        const application = await prisma.application.create({
          data: {
            applicationId,
            studentId: data.studentId,
            scholarshipId: data.scholarshipId,
            appliedAmount: data.appliedAmount,
            essay: data.essay,
            createdBy: data.createdBy,
            submittedAt: new Date()
          },
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
        });

        return c.json({ data: application }, 201);
      } catch (error) {
        console.error("Error creating application:", error);
        return c.json({ error: "Failed to create application" }, 500);
      }
    }
  )
  .patch("/:id/status",
    zValidator("json", z.object({
      status: z.nativeEnum(ApplicationStatus),
      reviewNotes: z.string().optional(),
      reviewedBy: z.string().optional()
    })),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      try {
        const application = await prisma.application.findUnique({
          where: { id },
          include: {
            scholarship: {
              include: {
                fund: true
              }
            }
          }
        });

        if (!application) {
          return c.json({ error: "Application not found" }, 404);
        }

        // If approving, create an award
        if (data.status === "APPROVED" && application.status !== "APPROVED") {
          const awardAmount = application.appliedAmount || application.scholarship.amount;
          
          // Check fund availability
          if (application.scholarship.fund.availableAmount < awardAmount) {
            return c.json({ error: "Insufficient funds available for this award" }, 400);
          }

          // Generate award ID
          const awardIdSeries = await prisma.series.findFirst({
            where: { name: "Award Series" }
          });

          let awardId = "";
          if (awardIdSeries) {
            const nextNumber = awardIdSeries.lastNumber + 1;
            const year = new Date().getFullYear();
            awardId = `AWD-${year}-${nextNumber.toString().padStart(3, '0')}`;
            
            await prisma.series.update({
              where: { id: awardIdSeries.id },
              data: { lastNumber: nextNumber }
            });
          } else {
            awardId = `AWD-${Date.now()}`;
          }

          // Create award and update fund in transaction
          await prisma.$transaction(async (tx) => {
            // Create award
            await tx.award.create({
              data: {
                awardId,
                applicationId: application.id,
                studentId: application.studentId,
                scholarshipId: application.scholarshipId,
                fundId: application.scholarship.fundId,
                awardedAmount: awardAmount,
                remainingBalance: awardAmount,
                awardDate: new Date()
              }
            });

            // Update fund amounts
            await tx.fund.update({
              where: { id: application.scholarship.fundId },
              data: {
                availableAmount: { decrement: awardAmount },
                committedAmount: { increment: awardAmount }
              }
            });

            // Update application status
            await tx.application.update({
              where: { id },
              data: {
                status: data.status,
                reviewNotes: data.reviewNotes,
                reviewedBy: data.reviewedBy,
                reviewedAt: new Date()
              }
            });
          });
        } else {
          // Just update application status
          await prisma.application.update({
            where: { id },
            data: {
              status: data.status,
              reviewNotes: data.reviewNotes,
              reviewedBy: data.reviewedBy,
              reviewedAt: new Date()
            }
          });
        }

        // Fetch updated application
        const updatedApplication = await prisma.application.findUnique({
          where: { id },
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
            },
            award: {
              select: {
                id: true,
                awardId: true,
                awardedAmount: true
              }
            }
          }
        });

        return c.json({ data: updatedApplication });
      } catch (error) {
        console.error("Error updating application status:", error);
        return c.json({ error: "Failed to update application status" }, 500);
      }
    }
  )
  .patch("/:id",
    zValidator("json", z.object({
      essay: z.string().optional(),
      appliedAmount: z.number().min(0).optional()
    })),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      try {
        const application = await prisma.application.findUnique({
          where: { id },
          include: {
            scholarship: true
          }
        });

        if (!application) {
          return c.json({ error: "Application not found" }, 404);
        }

        // Only allow editing if application is still pending
        if (application.status !== "PENDING") {
          return c.json({ error: "Cannot edit application that has been reviewed" }, 400);
        }

        // Validate applied amount if provided
        if (data.appliedAmount && application.scholarship.isVariableAmount) {
          if (data.appliedAmount < (application.scholarship.minAmount || 0) || 
              data.appliedAmount > (application.scholarship.maxAmount || application.scholarship.amount)) {
            return c.json({ 
              error: `Applied amount must be between ${application.scholarship.minAmount} and ${application.scholarship.maxAmount}` 
            }, 400);
          }
        }

        const updatedApplication = await prisma.application.update({
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
            },
            scholarship: {
              select: {
                name: true,
                category: true
              }
            }
          }
        });

        return c.json({ data: updatedApplication });
      } catch (error) {
        console.error("Error updating application:", error);
        return c.json({ error: "Failed to update application" }, 500);
      }
    }
  )
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          award: true,
          documents: true
        }
      });

      if (!application) {
        return c.json({ error: "Application not found" }, 404);
      }

      // Don't allow deleting approved applications or applications with awards
      if (application.status === 'APPROVED' || application.award) {
        return c.json({ 
          error: "Cannot delete approved application or application with an award" 
        }, 400);
      }

      // Delete associated documents first if any
      if (application.documents.length > 0) {
        await prisma.document.deleteMany({
          where: { applicationId: id }
        });
      }

      await prisma.application.delete({
        where: { id }
      });

      return c.json({ message: "Application deleted successfully" });
    } catch (error) {
      console.error("Error deleting application:", error);
      return c.json({ error: "Failed to delete application" }, 500);
    }
  })
  .post("/:id/approve",
    zValidator("json", z.object({
      awardedAmount: z.number().optional(),
      reviewNotes: z.string().optional()
    })),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      try {
        const application = await prisma.application.findUnique({
          where: { id },
          include: {
            scholarship: {
              include: {
                fund: true
              }
            }
          }
        });

        if (!application) {
          return c.json({ error: "Application not found" }, 404);
        }

        if (application.status === 'APPROVED') {
          return c.json({ error: "Application is already approved" }, 400);
        }

        const awardAmount = data.awardedAmount || application.appliedAmount || application.scholarship.amount;
        
        // Check fund availability
        if (application.scholarship.fund.availableAmount < awardAmount) {
          return c.json({ error: "Insufficient funds available for this award" }, 400);
        }

        // Generate award ID
        const awardIdSeries = await prisma.series.findFirst({
          where: { name: "Award Series" }
        });

        let awardId = "";
        if (awardIdSeries) {
          const nextNumber = awardIdSeries.lastNumber + 1;
          const year = new Date().getFullYear();
          awardId = `AWD-${year}-${nextNumber.toString().padStart(3, '0')}`;
          
          await prisma.series.update({
            where: { id: awardIdSeries.id },
            data: { lastNumber: nextNumber }
          });
        } else {
          awardId = `AWD-${Date.now()}`;
        }

        // Create award and update application in transaction
        await prisma.$transaction(async (tx) => {
          // Create award
          await tx.award.create({
            data: {
              awardId,
              applicationId: application.id,
              studentId: application.studentId,
              scholarshipId: application.scholarshipId,
              fundId: application.scholarship.fundId,
              awardedAmount: awardAmount,
              remainingBalance: awardAmount,
              awardDate: new Date()
            }
          });

          // Update fund amounts
          await tx.fund.update({
            where: { id: application.scholarship.fundId },
            data: {
              availableAmount: { decrement: awardAmount },
              committedAmount: { increment: awardAmount }
            }
          });

          // Update application status
          await tx.application.update({
            where: { id },
            data: {
              status: 'APPROVED',
              reviewNotes: data.reviewNotes,
              reviewedAt: new Date()
            }
          });
        });

        const updatedApplication = await prisma.application.findUnique({
          where: { id },
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
            },
            award: {
              select: {
                id: true,
                awardId: true,
                awardedAmount: true
              }
            }
          }
        });

        return c.json({ data: updatedApplication });
      } catch (error) {
        console.error("Error approving application:", error);
        return c.json({ error: "Failed to approve application" }, 500);
      }
    }
  )
  .post("/:id/reject",
    zValidator("json", z.object({
      reason: z.string().min(1, "Reason is required"),
      reviewNotes: z.string().optional()
    })),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      try {
        const application = await prisma.application.findUnique({
          where: { id }
        });

        if (!application) {
          return c.json({ error: "Application not found" }, 404);
        }

        if (application.status === 'REJECTED') {
          return c.json({ error: "Application is already rejected" }, 400);
        }

        if (application.status === 'APPROVED') {
          return c.json({ error: "Cannot reject an approved application" }, 400);
        }

        const updatedApplication = await prisma.application.update({
          where: { id },
          data: {
            status: 'REJECTED',
            reviewNotes: data.reviewNotes || data.reason,
            reviewedAt: new Date()
          },
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
        });

        return c.json({ data: updatedApplication });
      } catch (error) {
        console.error("Error rejecting application:", error);
        return c.json({ error: "Failed to reject application" }, 500);
      }
    }
  );

export default app;
