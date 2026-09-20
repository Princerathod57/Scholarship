import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createStudentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  studentId: z.string().min(1, "Student ID is required"),
  programId: z.string().optional(),
  gpa: z.number().min(0).max(4.0).optional(),
  enrollmentDate: z.string().optional(),
  graduationDate: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// GET /api/students - Get all students with pagination and search
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { user: { name: { contains: search, mode: "insensitive" as const } } },
            { user: { email: { contains: search, mode: "insensitive" as const } } },
            { studentId: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          user: true,
          program: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.student.count({
        where,
      }),
    ]);

    return NextResponse.json({
      data: students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "FINANCIAL_AID_OFFICER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createStudentSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Check if student ID already exists
    const existingStudentId = await prisma.student.findFirst({
      where: { studentId: validatedData.studentId },
    });

    if (existingStudentId) {
      return NextResponse.json(
        { error: "A student with this ID already exists" },
        { status: 400 }
      );
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create the user and student in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the user first
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          role: "STUDENT",
          phone: validatedData.phone || null,
          address: validatedData.address || null,
          isFirstLogin: true, // Flag to force password change on first login
        },
      });

      // Create the student record
      const student = await tx.student.create({
        data: {
          userId: user.id,
          studentId: validatedData.studentId,
          programId: validatedData.programId || null,
          gpa: validatedData.gpa || null,
          enrollmentDate: validatedData.enrollmentDate 
            ? new Date(validatedData.enrollmentDate) 
            : null,
          graduationDate: validatedData.graduationDate 
            ? new Date(validatedData.graduationDate) 
            : null,
        },
        include: {
          user: true,
          program: true,
        },
      });

      return { user, student };
    });

    // Log the creation
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "STUDENT",
        entityId: result.student.id,
        userId: session.user.id,
        details: {
          studentName: result.user.name,
          studentId: result.student.studentId,
          email: result.user.email,
        },
      },
    });

    return NextResponse.json({
      ...result.student,
      tempPassword, // Include temporary password in response
    });
  } catch (error) {
    console.error("Error creating student:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
