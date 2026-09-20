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

    const now = new Date()

    // Get upcoming scholarship deadlines
    const scholarshipDeadlines = await prisma.scholarship.findMany({
      where: {
        applicationDeadline: {
          gte: now
        },
        status: "ACTIVE"
      },
      orderBy: {
        applicationDeadline: "asc"
      },
      take: limit,
      select: {
        id: true,
        name: true,
        applicationDeadline: true
      }
    })

    // Format deadlines for the frontend
    const deadlines = scholarshipDeadlines
      .filter(scholarship => scholarship.applicationDeadline)
      .map(scholarship => ({
        id: scholarship.id,
        title: scholarship.name,
        type: "Application deadline",
        deadline: scholarship.applicationDeadline
      }))

    return NextResponse.json({
      data: deadlines
    })

  } catch (error) {
    console.error("Error fetching upcoming deadlines:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
