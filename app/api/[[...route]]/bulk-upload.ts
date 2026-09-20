import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import db from "@/lib/prisma";
import * as XLSX from "xlsx";

// Schema for bulk upload data in scholarship domain
const BulkUploadSchema = z.object({
  excelData: z.string(), // Base64 encoded Excel file
  type: z.enum(["students", "programs", "scholarships", "funds"]),
  batchSize: z.number().optional().default(50),
});

// Helper function to process a single row for different entity types
async function processRow(row: any[], rowNumber: number, type: string, results: any) {
  try {
    if (type === "students") {
      return await processStudentRow(row, rowNumber, results);
    } else if (type === "programs") {
      return await processProgramRow(row, rowNumber, results);
    } else if (type === "scholarships") {
      return await processScholarshipRow(row, rowNumber, results);
    } else if (type === "funds") {
      return await processFundRow(row, rowNumber, results);
    }
    
    results.errors.push({
      row: rowNumber,
      error: "Unsupported entity type",
      data: { type }
    });
    results.failed++;
    return null;
  } catch (error) {
    results.errors.push({
      row: rowNumber,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      data: row
    });
    results.failed++;
    return null;
  }
}

// Process student row (studentId, name, email, program code)
async function processStudentRow(row: any[], rowNumber: number, results: any) {
  const studentId = row[0]?.toString()?.trim();
  const name = row[1]?.toString()?.trim();
  const email = row[2]?.toString()?.trim();
  const programCode = row[3]?.toString()?.trim();

  // Validation
  if (!studentId || !name || !email) {
    results.errors.push({
      row: rowNumber,
      error: "Student ID, name, and email are required",
      data: { studentId, name, email }
    });
    results.failed++;
    return null;
  }

  // Check if student already exists
  const existing = await db.student.findFirst({
    where: { 
      OR: [
        { studentId },
        { user: { email } }
      ]
    }
  });

  if (existing) {
    results.errors.push({
      row: rowNumber,
      error: "Student with this ID or email already exists",
      data: { studentId, email }
    });
    results.failed++;
    return null;
  }

  // Find program if provided
  let programId: string | null = null;
  if (programCode) {
    const program = await db.program.findFirst({
      where: { code: { equals: programCode, mode: "insensitive" } }
    });
    if (program) {
      programId = program.id;
    }
  }

  // Create user account for student
  const user = await db.user.create({
    data: {
      name,
      email,
      password: "temp123", // Temporary password, should be changed on first login
      role: "STUDENT",
      isFirstLogin: true
    }
  });

  const student = await db.student.create({
    data: {
      studentId,
      userId: user.id,
      programId,
      isActive: true
    }
  });

  results.success++;
  return student;
}

// Process program row (name, description, code, department)
async function processProgramRow(row: any[], rowNumber: number, results: any) {
  const name = row[0]?.toString()?.trim();
  const description = row[1]?.toString()?.trim();
  const code = row[2]?.toString()?.trim();
  const department = row[3]?.toString()?.trim();

  if (!name || !code) {
    results.errors.push({
      row: rowNumber,
      error: "Program name and code are required",
      data: { name, code }
    });
    results.failed++;
    return null;
  }

  const existing = await db.program.findFirst({
    where: { 
      OR: [
        { name: { equals: name, mode: "insensitive" } },
        { code: { equals: code, mode: "insensitive" } }
      ]
    }
  });

  if (existing) {
    results.errors.push({
      row: rowNumber,
      error: "Program with this name or code already exists",
      data: { name, code }
    });
    results.failed++;
    return null;
  }

  const program = await db.program.create({
    data: {
      name,
      description: description || null,
      code,
      department: department || null,
      status: "ACTIVE"
    }
  });

  results.success++;
  return program;
}

// Process scholarship row (name, description, fundName, amount, requirements)
async function processScholarshipRow(row: any[], rowNumber: number, results: any) {
  const name = row[0]?.toString()?.trim();
  const description = row[1]?.toString()?.trim();
  const fundName = row[2]?.toString()?.trim();
  const amount = parseFloat(row[3]?.toString() || "0");
  const requirements = row[4]?.toString()?.trim();

  if (!name || !fundName || !amount) {
    results.errors.push({
      row: rowNumber,
      error: "Scholarship name, fund name, and amount are required",
      data: { name, fundName, amount }
    });
    results.failed++;
    return null;
  }

  // Find fund by name
  const fund = await db.fund.findFirst({
    where: { name: { equals: fundName, mode: "insensitive" } }
  });

  if (!fund) {
    results.errors.push({
      row: rowNumber,
      error: "Fund not found",
      data: { fundName }
    });
    results.failed++;
    return null;
  }

  const existing = await db.scholarship.findFirst({
    where: { name: { equals: name, mode: "insensitive" } }
  });

  if (existing) {
    results.errors.push({
      row: rowNumber,
      error: "Scholarship with this name already exists",
      data: { name }
    });
    results.failed++;
    return null;
  }

  const scholarship = await db.scholarship.create({
    data: {
      name,
      description: description || null,
      fundId: fund.id,
      programId: fund.programId, // Link to same program as fund
      amount,
      category: "MERIT_BASED", // Default category
      requirements: requirements || null,
      status: "ACTIVE",
      applicationDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    }
  });

  results.success++;
  return scholarship;
}

// Process fund row (name, description, programName, totalAmount)
async function processFundRow(row: any[], rowNumber: number, results: any) {
  const name = row[0]?.toString()?.trim();
  const description = row[1]?.toString()?.trim();
  const programName = row[2]?.toString()?.trim();
  const totalAmount = parseFloat(row[3]?.toString() || "0");

  if (!name || !programName || !totalAmount) {
    results.errors.push({
      row: rowNumber,
      error: "Fund name, program name, and total amount are required",
      data: { name, programName, totalAmount }
    });
    results.failed++;
    return null;
  }

  // Find program by name
  const program = await db.program.findFirst({
    where: { name: { equals: programName, mode: "insensitive" } }
  });

  if (!program) {
    results.errors.push({
      row: rowNumber,
      error: "Program not found",
      data: { programName }
    });
    results.failed++;
    return null;
  }

  const existing = await db.fund.findFirst({
    where: { name: { equals: name, mode: "insensitive" } }
  });

  if (existing) {
    results.errors.push({
      row: rowNumber,
      error: "Fund with this name already exists",
      data: { name }
    });
    results.failed++;
    return null;
  }

  const fund = await db.fund.create({
    data: {
      name,
      description: description || null,
      programId: program.id,
      totalAmount,
      availableAmount: totalAmount
    }
  });

  results.success++;
  return fund;
}

const app = new Hono()

  // POST bulk upload
  .post("/", zValidator("json", BulkUploadSchema), async (c) => {
    try {
      const { excelData, type, batchSize } = c.req.valid("json");

      // Decode base64 and parse Excel
      const buffer = Buffer.from(excelData, "base64");
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!data || data.length < 2) {
        return c.json({ error: "Excel file must contain header row and at least one data row" }, 400);
      }

      const rows = data.slice(1) as any[][]; // Skip header row
      const results = {
        success: 0,
        failed: 0,
        errors: [] as any[],
        total: rows.length,
        type
      };

      // Process in batches
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        
        const batchPromises = batch.map((row, index) => 
          processRow(row, i + index + 2, type, results) // +2 for header row and 1-based indexing
        );

        await Promise.allSettled(batchPromises);
      }

      const statusCode = results.failed > 0 ? 207 : 200; // 207 Multi-Status for partial success

      return c.json({
        success: true,
        message: `Bulk upload completed. ${results.success} successful, ${results.failed} failed.`,
        results
      }, statusCode);

    } catch (error) {
      console.error("Bulk upload error:", error);
      return c.json({ 
        error: "Failed to process bulk upload",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 500);
    }
  })

  // GET template download
  .get("/template/:type", async (c) => {
    const type = c.req.param("type");
    
    let headers: string[] = [];
    let sampleData: string[] = [];

    switch (type) {
      case "students":
        headers = ["Student ID", "Name", "Email", "Program Code"];
        sampleData = ["STU001", "John Doe", "john.doe@example.com", "CS"];
        break;
      case "programs":
        headers = ["Name", "Description", "Code", "Department"];
        sampleData = ["Computer Science", "Bachelor of Computer Science program", "CS", "Engineering"];
        break;
      case "scholarships":
        headers = ["Name", "Description", "Fund Name", "Amount", "Requirements"];
        sampleData = ["Academic Excellence Award", "For outstanding students", "CS Merit Fund", "5000", "GPA >= 3.5"];
        break;
      case "funds":
        headers = ["Name", "Description", "Program Name", "Total Amount"];
        sampleData = ["CS Merit Fund", "Fund for computer science merit scholarships", "Computer Science", "100000"];
        break;
      default:
        return c.json({ error: "Invalid template type" }, 400);
    }

    // Create Excel workbook
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    // Generate buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Return file
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${type}_template.xlsx"`
      }
    });
  })

  // GET upload history (if we want to track upload batches)
  .get("/history", async (c) => {
    try {
      // For now, return audit logs related to bulk operations
      const bulkAuditLogs = await db.auditLog.findMany({
        where: {
          action: "CREATE",
          entityType: {
            in: ["STUDENT", "PROGRAM", "SCHOLARSHIP", "FUND"]
          }
        },
        orderBy: { timestamp: "desc" },
        take: 50,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      return c.json({
        success: true,
        history: bulkAuditLogs
      });
    } catch (error) {
      console.error("Upload history error:", error);
      return c.json({ error: "Failed to fetch upload history" }, 500);
    }
  });

export default app;
