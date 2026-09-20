import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")

    // Get recent applications
    const recentApplications = await prisma.application.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc"
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
            name: true
          }
        }
      }
    })

    // Get recent awards
    const recentAwards = await prisma.award.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc"
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
    })

    // Get recent disbursements
    const recentDisbursements = await prisma.disbursement.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
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
    })

    // Get recent students
    const recentStudents = await prisma.student.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        program: {
          select: {
            name: true
          }
        }
      }
    })

    // Combine and format all activities
    const activities = [
      ...recentApplications.map(app => ({
        id: app.id,
        type: 'APPLICATION',
        title: 'New scholarship application submitted',
        description: `${app.student.user.name || app.student.user.email} applied for ${app.scholarship.name}`,
        createdAt: app.createdAt
      })),
      ...recentAwards.map(award => ({
        id: award.id,
        type: 'AWARD',
        title: 'Scholarship award approved',
        description: `${award.application.scholarship.name} awarded to ${award.student.user.name || award.student.user.email} - $${award.awardedAmount.toLocaleString()}`,
        createdAt: award.createdAt
      })),
      ...recentDisbursements.map(disbursement => ({
        id: disbursement.id,
        type: 'DISBURSEMENT',
        title: 'Disbursement completed',
        description: `$${disbursement.amount.toLocaleString()} disbursed to ${disbursement.award.student.user.name || disbursement.award.student.user.email}`,
        createdAt: disbursement.createdAt
      })),
      ...recentStudents.map(student => ({
        id: student.id,
        type: 'STUDENT',
        title: 'New student registered',
        description: `${student.user.name || student.user.email} joined ${student.program?.name || 'the system'}`,
        createdAt: student.createdAt
      }))
    ]

    // Sort by creation date and limit
    const sortedActivities = activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)

    return NextResponse.json({
      data: sortedActivities
    })

  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
