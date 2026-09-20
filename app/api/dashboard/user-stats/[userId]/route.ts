import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await params

    // Check if user is requesting their own stats or if they're an admin
    if (session.user.id !== userId && session.user.role !== 'ADMIN' && session.user.role !== 'FINANCIAL_AID_OFFICER') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get student record
    const student = await prisma.student.findFirst({
      where: {
        userId: userId
      }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Get applications count
    const applications = await prisma.application.count({
      where: {
        studentId: student.id
      }
    })

    // Get awards count
    const awards = await prisma.award.count({
      where: {
        studentId: student.id,
        status: "ACTIVE"
      }
    })

    // Get total received amount (from disbursements)
    const disbursements = await prisma.disbursement.aggregate({
      _sum: {
        amount: true
      },
      where: {
        award: {
          studentId: student.id
        }
      }
    })

    const totalReceived = disbursements._sum?.amount || 0

    return NextResponse.json({
      applications,
      awards,
      totalReceived: Number(totalReceived)
    })

  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
