import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total students count
    const totalStudents = await prisma.student.count()
    
    // Get student growth (compare with last month)
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    
    const studentsLastMonth = await prisma.student.count({
      where: {
        createdAt: {
          lt: lastMonth
        }
      }
    })
    
    const studentGrowth = studentsLastMonth > 0 
      ? Math.round(((totalStudents - studentsLastMonth) / studentsLastMonth) * 100)
      : 0

    // Get active scholarships count
    const activeScholarships = await prisma.scholarship.count({
      where: {
        status: "ACTIVE"
      }
    })

    // Get new scholarships this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    
    const newScholarships = await prisma.scholarship.count({
      where: {
        createdAt: {
          gte: thisMonth
        }
      }
    })

    // Get pending applications count
    const pendingApplications = await prisma.application.count({
      where: {
        status: "PENDING"
      }
    })

    // Get total awards count
    const totalAwards = await prisma.award.count()

    // Get total disbursed amount
    const disbursements = await prisma.disbursement.aggregate({
      _sum: {
        amount: true
      }
    })

    const totalDisbursed = disbursements._sum?.amount || 0

    return NextResponse.json({
      totalStudents,
      studentGrowth,
      activeScholarships,
      newScholarships,
      pendingApplications,
      totalAwards,
      totalDisbursed: Number(totalDisbursed)
    })

  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
