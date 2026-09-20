import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to generate random date within range
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to generate random amount
const randomAmount = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to pick random item from array
const randomPick = <T>(arr: readonly T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data in reverse order of dependencies
  console.log('🧹 Clearing existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.disbursement.deleteMany();
  await prisma.award.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.application.deleteMany();
  await prisma.scholarship.deleteMany();
  await prisma.fund.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.student.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.userPermission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.program.deleteMany();
  await prisma.series.deleteMany();

  // 1. Create Permissions
  console.log('👮 Creating permissions...');
  const permissions = await Promise.all([
    prisma.permission.create({
      data: {
        name: 'Manage Users',
        description: 'Create, update, and delete user accounts',
        code: 'MANAGE_USERS',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'Manage Students',
        description: 'Create, update, and delete student records',
        code: 'MANAGE_STUDENTS',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'Manage Scholarships',
        description: 'Create, update, and delete scholarships',
        code: 'MANAGE_SCHOLARSHIPS',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'Manage Applications',
        description: 'Review and approve scholarship applications',
        code: 'MANAGE_APPLICATIONS',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'Manage Awards',
        description: 'Create and manage scholarship awards',
        code: 'MANAGE_AWARDS',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'Manage Disbursements',
        description: 'Process and manage disbursements',
        code: 'MANAGE_DISBURSEMENTS',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'View Reports',
        description: 'Access and view system reports',
        code: 'VIEW_REPORTS',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'Manage Settings',
        description: 'Configure system settings',
        code: 'MANAGE_SETTINGS',
      },
    }),
  ]);

  // 2. Create Series for ID generation
  console.log('🔢 Creating ID series...');
  const applicationSeries = await prisma.series.create({
    data: {
      name: 'Application Series',
      prefix: 'APP',
      description: 'Series for application IDs',
      format: '{prefix}-{year}-{number:3}',
      lastNumber: 150,
      isDefault: true,
    },
  });

  const awardSeries = await prisma.series.create({
    data: {
      name: 'Award Series',
      prefix: 'AWD',
      description: 'Series for award IDs',
      format: '{prefix}-{year}-{number:3}',
      lastNumber: 89,
    },
  });

  const disbursementSeries = await prisma.series.create({
    data: {
      name: 'Disbursement Series',
      prefix: 'DIS',
      description: 'Series for disbursement IDs',
      format: '{prefix}-{year}-{number:3}',
      lastNumber: 234,
    },
  });

  // 3. Create Programs
  console.log('🎓 Creating academic programs...');
  const programs = await Promise.all([
    prisma.program.create({
      data: {
        name: 'Computer Science',
        description: 'Bachelor of Science in Computer Science program focusing on software development, algorithms, and system design',
        code: 'CS',
        department: 'School of Engineering',
        status: 'ACTIVE',
      },
    }),
    prisma.program.create({
      data: {
        name: 'Business Administration',
        description: 'Master of Business Administration program with concentrations in finance, marketing, and operations',
        code: 'MBA',
        department: 'School of Business',
        status: 'ACTIVE',
      },
    }),
    prisma.program.create({
      data: {
        name: 'Biology',
        description: 'Bachelor of Science in Biology with pre-med track and research opportunities',
        code: 'BIO',
        department: 'School of Sciences',
        status: 'ACTIVE',
      },
    }),
    prisma.program.create({
      data: {
        name: 'Engineering',
        description: 'Bachelor of Engineering with specializations in mechanical, electrical, and civil engineering',
        code: 'ENG',
        department: 'School of Engineering',
        status: 'ACTIVE',
      },
    }),
    prisma.program.create({
      data: {
        name: 'Psychology',
        description: 'Bachelor of Arts in Psychology with clinical and research tracks',
        code: 'PSY',
        department: 'School of Liberal Arts',
        status: 'ACTIVE',
      },
    }),
    prisma.program.create({
      data: {
        name: 'Nursing',
        description: 'Bachelor of Science in Nursing with clinical rotations and specialty tracks',
        code: 'NUR',
        department: 'School of Health Sciences',
        status: 'ACTIVE',
      },
    }),
  ]);

  // 4. Create Users
  console.log('👥 Creating users...');
  const hashedPassword = await hash('password123', 12);

  // Create admin users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Sarah Johnson',
      email: 'admin@university.edu',
      password: hashedPassword,
      role: 'ADMIN',
      printName: 'Sarah Johnson, PhD',
      phone: '+1-555-0101',
      whatsapp: '+1-555-0101',
      address: '123 Admin Building, University Campus',
      isFirstLogin: false,
    },
  });

  const financialAidOfficer = await prisma.user.create({
    data: {
      name: 'Michael Chen',
      email: 'financial.aid@university.edu',
      password: hashedPassword,
      role: 'FINANCIAL_AID_OFFICER',
      printName: 'Michael Chen, MS',
      phone: '+1-555-0102',
      whatsapp: '+1-555-0102',
      address: '456 Financial Aid Office, University Campus',
      isFirstLogin: false,
    },
  });

  // Create faculty users
  const facultyUsers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@university.edu',
        password: hashedPassword,
        role: 'FACULTY',
        printName: 'Dr. Emily Rodriguez, PhD',
        phone: '+1-555-0201',
        address: '789 Faculty Building, University Campus',
        isFirstLogin: false,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Prof. James Wilson',
        email: 'james.wilson@university.edu',
        password: hashedPassword,
        role: 'FACULTY',
        printName: 'Prof. James Wilson, PhD',
        phone: '+1-555-0202',
        address: '101 Engineering Building, University Campus',
        isFirstLogin: false,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Dr. Maria Garcia',
        email: 'maria.garcia@university.edu',
        password: hashedPassword,
        role: 'FACULTY',
        printName: 'Dr. Maria Garcia, MD, PhD',
        phone: '+1-555-0203',
        address: '202 Science Building, University Campus',
        isFirstLogin: false,
      },
    }),
  ]);

  // Create student users
  const studentNames = [
    'Alex Thompson', 'Jessica Williams', 'David Kim', 'Emma Davis', 'Ryan Martinez',
    'Sophia Brown', 'Lucas Anderson', 'Olivia Taylor', 'Ethan Wilson', 'Ava Johnson',
    'Mason Garcia', 'Isabella Rodriguez', 'Logan Martinez', 'Mia Hernandez', 'Noah Lopez',
    'Charlotte Gonzalez', 'Liam Perez', 'Amelia Sanchez', 'William Ramirez', 'Harper Torres',
    'Benjamin Flores', 'Evelyn Rivera', 'Elijah Gomez', 'Abigail Diaz', 'James Reyes',
    'Emily Morales', 'Alexander Cruz', 'Elizabeth Ortiz', 'Michael Ramos', 'Sofia Castillo',
  ];

  const studentUsers = await Promise.all(
    studentNames.map((name, index) => {
      const email = name.toLowerCase().replace(' ', '.') + '@student.university.edu';
      return prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'STUDENT',
          phone: `+1-555-0${(300 + index).toString().padStart(3, '0')}`,
          isFirstLogin: Math.random() > 0.7, // 30% still on first login
        },
      });
    })
  );

  // 5. Create Faculty records
  console.log('🏫 Creating faculty records...');
  const faculty = await Promise.all([
    prisma.faculty.create({
      data: {
        userId: facultyUsers[0].id,
        facultyId: 'FAC001',
        department: 'Computer Science',
        position: 'Associate Professor',
        hireDate: new Date('2018-08-15'),
      },
    }),
    prisma.faculty.create({
      data: {
        userId: facultyUsers[1].id,
        facultyId: 'FAC002',
        department: 'Engineering',
        position: 'Professor',
        hireDate: new Date('2015-01-10'),
      },
    }),
    prisma.faculty.create({
      data: {
        userId: facultyUsers[2].id,
        facultyId: 'FAC003',
        department: 'Biology',
        position: 'Assistant Professor',
        hireDate: new Date('2020-09-01'),
      },
    }),
  ]);

  // 6. Create Students
  console.log('🎒 Creating student records...');
  const students = await Promise.all(
    studentUsers.map((user, index) => {
      const program = randomPick(programs);
      const enrollmentYear = 2020 + Math.floor(Math.random() * 5);
      return prisma.student.create({
        data: {
          userId: user.id,
          studentId: `STU${(2024001 + index).toString()}`,
          programId: program.id,
          gpa: parseFloat((2.5 + Math.random() * 1.5).toFixed(2)),
          enrollmentDate: new Date(`${enrollmentYear}-08-${Math.floor(Math.random() * 28) + 1}`),
          isActive: Math.random() > 0.05, // 95% active
        },
      });
    })
  );

  // 7. Create User Permissions
  console.log('🔐 Assigning permissions...');
  // Admin gets all permissions
  await Promise.all(
    permissions.map(permission =>
      prisma.userPermission.create({
        data: {
          userId: adminUser.id,
          permissionId: permission.id,
        },
      })
    )
  );

  // Financial Aid Officer gets specific permissions
  const financialAidPermissions = permissions.filter(p => 
    ['MANAGE_APPLICATIONS', 'MANAGE_AWARDS', 'MANAGE_DISBURSEMENTS', 'VIEW_REPORTS'].includes(p.code)
  );
  await Promise.all(
    financialAidPermissions.map(permission =>
      prisma.userPermission.create({
        data: {
          userId: financialAidOfficer.id,
          permissionId: permission.id,
        },
      })
    )
  );

  // 8. Create Funds
  console.log('💰 Creating scholarship funds...');
  const funds = await Promise.all([
    ...programs.map(program =>
      prisma.fund.create({
        data: {
          name: `${program.name} Excellence Fund`,
          description: `Scholarship fund for outstanding ${program.name} students`,
          programId: program.id,
          totalAmount: randomAmount(100000, 500000),
          availableAmount: randomAmount(50000, 200000),
          committedAmount: randomAmount(20000, 80000),
          disbursedAmount: randomAmount(10000, 50000),
        },
      })
    ),
    // Create some general funds
    prisma.fund.create({
      data: {
        name: 'General Merit Scholarship Fund',
        description: 'General fund for merit-based scholarships across all programs',
        programId: programs[0].id, // Computer Science
        totalAmount: 750000,
        availableAmount: 300000,
        committedAmount: 250000,
        disbursedAmount: 200000,
      },
    }),
    prisma.fund.create({
      data: {
        name: 'Need-Based Financial Aid Fund',
        description: 'Fund specifically for students with demonstrated financial need',
        programId: programs[1].id, // Business Administration
        totalAmount: 600000,
        availableAmount: 180000,
        committedAmount: 220000,
        disbursedAmount: 200000,
      },
    }),
    prisma.fund.create({
      data: {
        name: 'Alumni Endowment Fund',
        description: 'Endowment fund established by alumni contributions',
        programId: programs[2].id, // Biology
        totalAmount: 1000000,
        availableAmount: 400000,
        committedAmount: 300000,
        disbursedAmount: 300000,
      },
    }),
  ]);

  // 9. Create Scholarships
  console.log('🏆 Creating scholarships...');
  const scholarshipData = [
    {
      name: 'Dean\'s Excellence Scholarship',
      description: 'Awarded to students with exceptional academic performance and leadership qualities',
      category: 'MERIT_BASED',
      amount: 5000,
      requirements: 'Minimum GPA of 3.8, demonstrated leadership experience, full-time enrollment',
    },
    {
      name: 'First-Generation Student Grant',
      description: 'Supporting first-generation college students in their academic journey',
      category: 'NEED_BASED',
      amount: 3000,
      requirements: 'First-generation college student status, demonstrated financial need',
    },
    {
      name: 'STEM Innovation Award',
      description: 'Encouraging innovation and research in Science, Technology, Engineering, and Mathematics',
      category: 'DEPARTMENTAL',
      amount: 7500,
      requirements: 'STEM major, research project or internship experience, minimum GPA of 3.5',
    },
    {
      name: 'Community Service Scholarship',
      description: 'Recognizing students who make significant contributions to their community',
      category: 'OTHER',
      amount: 2500,
      requirements: 'Minimum 100 hours of community service, essay on community impact',
    },
    {
      name: 'Alumni Legacy Scholarship',
      description: 'Supporting children and grandchildren of university alumni',
      category: 'ALUMNI',
      amount: 4000,
      requirements: 'Alumni family member, good academic standing, personal statement',
    },
    {
      name: 'Athletic Achievement Award',
      description: 'Supporting student-athletes who excel in both academics and athletics',
      category: 'ATHLETIC',
      amount: 6000,
      requirements: 'Varsity sport participation, minimum GPA of 3.0, coach recommendation',
    },
    {
      name: 'Diversity and Inclusion Scholarship',
      description: 'Promoting diversity and inclusion within the university community',
      category: 'DIVERSITY',
      amount: 3500,
      requirements: 'Commitment to diversity and inclusion, personal statement, academic merit',
    },
    {
      name: 'Research Excellence Grant',
      description: 'Supporting undergraduate research initiatives and scholarly activities',
      category: 'RESEARCH',
      amount: 5500,
      requirements: 'Research proposal, faculty mentor, minimum GPA of 3.7',
    },
  ];

  const scholarships = await Promise.all(
    scholarshipData.map(scholarship => {
      const fund = randomPick(funds);
      const program = Math.random() > 0.3 ? randomPick(programs) : null; // 70% program-specific
      return prisma.scholarship.create({
        data: {
          ...scholarship,
          category: scholarship.category as any,
          fundId: fund.id,
          programId: program?.id,
          applicationDeadline: randomDate(new Date('2024-12-01'), new Date('2025-03-31')),
          isRenewable: Math.random() > 0.6, // 40% renewable
          maxRenewals: Math.random() > 0.6 ? Math.floor(Math.random() * 3) + 1 : null,
          status: 'ACTIVE',
        },
      });
    })
  );

  // 10. Create Bank Accounts
  console.log('🏦 Creating bank accounts...');
  const bankNames = ['Chase Bank', 'Bank of America', 'Wells Fargo', 'CitiBank', 'TD Bank', 'PNC Bank'];
  
  // Institution bank accounts
  const institutionBankAccounts = await Promise.all([
    prisma.bankAccount.create({
      data: {
        bankName: 'University Federal Credit Union',
        accountNumber: '1234567890',
        routingNumber: '123456789',
        branchName: 'Main Campus Branch',
        accountType: 'Checking',
        isInstitutional: true,
        isDefault: true,
        isActive: true,
      },
    }),
    prisma.bankAccount.create({
      data: {
        bankName: 'State Bank & Trust',
        accountNumber: '9876543210',
        routingNumber: '987654321',
        branchName: 'University District',
        accountType: 'Checking',
        isInstitutional: true,
        isDefault: false,
        isActive: true,
      },
    }),
  ]);

  // Student bank accounts
  const studentBankAccounts = await Promise.all(
    students.slice(0, 20).map((student, index) => { // Create bank accounts for first 20 students
      return prisma.bankAccount.create({
        data: {
          bankName: randomPick(bankNames),
          accountNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          routingNumber: `${Math.floor(Math.random() * 900000000) + 100000000}`,
          branchName: `Branch ${Math.floor(Math.random() * 100) + 1}`,
          accountType: randomPick(['Checking', 'Savings']),
          isInstitutional: false,
          studentId: student.id,
          isDefault: true,
          isActive: true,
        },
      });
    })
  );

  // 11. Create Applications
  console.log('📝 Creating scholarship applications...');
  const applicationStatuses: ('PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW')[] = ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'];
  const essays = [
    'I am passionate about my field of study and believe this scholarship will help me achieve my academic goals and contribute meaningfully to my community. My commitment to excellence and dedication to learning make me an ideal candidate for this opportunity.',
    'As a first-generation college student, I understand the value of education and am committed to excellence in all my endeavors. This scholarship would provide crucial support for my academic journey and help me achieve my dreams of making a positive impact in my field.',
    'My research interests align perfectly with the university\'s mission, and I am dedicated to making a positive impact through innovative thinking and collaborative work. I have demonstrated my commitment through previous projects and community involvement.',
    'Through my extensive community service experience, I have learned the importance of giving back to society and using my education to help others. This scholarship would enable me to continue my studies while maintaining my commitment to service.',
    'This scholarship opportunity represents a crucial step in my journey toward academic and professional success. My academic achievements, leadership experience, and clear career goals demonstrate my readiness to make the most of this investment in my future.',
  ];

  const applications = [];
  for (let i = 0; i < 150; i++) {
    const student = randomPick(students);
    const scholarship = randomPick(scholarships);
    const status = randomPick(applicationStatuses);
    
    const application = await prisma.application.create({
      data: {
        applicationId: `APP-2024-${(i + 1).toString().padStart(3, '0')}`,
        studentId: student.id,
        scholarshipId: scholarship.id,
        status,
        appliedAmount: scholarship.isVariableAmount ? randomAmount(1000, scholarship.amount) : scholarship.amount,
        essay: randomPick(essays),
        reviewNotes: status !== 'PENDING' ? 'Application reviewed and processed according to established criteria. All requirements have been thoroughly evaluated.' : null,
        reviewedBy: status !== 'PENDING' ? financialAidOfficer.id : null,
        reviewedAt: status !== 'PENDING' ? randomDate(new Date('2024-01-01'), new Date()) : null,
        createdBy: Math.random() > 0.8 ? financialAidOfficer.id : null, // 20% created by officer
        submittedAt: randomDate(new Date('2024-01-01'), new Date()),
      },
    });
    applications.push(application);
  }

  // 12. Create Awards (for approved applications)
  console.log('🏅 Creating awards...');
  const approvedApplications = applications.filter(app => app.status === 'APPROVED');
  const awards = await Promise.all(
    approvedApplications.slice(0, 89).map((application, index) => { // Create 89 awards
      const scholarship = scholarships.find(s => s.id === application.scholarshipId)!;
      const fund = funds.find(f => f.id === scholarship.fundId)!;
      const awardedAmount = application.appliedAmount || scholarship.amount;
      
      return prisma.award.create({
        data: {
          awardId: `AWD-2024-${(index + 1).toString().padStart(3, '0')}`,
          applicationId: application.id,
          studentId: application.studentId,
          scholarshipId: application.scholarshipId,
          fundId: fund.id,
          awardedAmount,
          remainingBalance: Math.random() > 0.3 ? awardedAmount * (0.3 + Math.random() * 0.7) : 0, // 70% have remaining balance
          status: randomPick(['ACTIVE', 'DISBURSED', 'PARTIALLY_DISBURSED']),
          awardDate: randomDate(new Date('2024-02-01'), new Date()),
          expiryDate: randomDate(new Date('2025-05-01'), new Date('2026-05-01')),
          terms: 'Maintain minimum GPA of 3.0, full-time enrollment required, progress toward degree completion',
          isMultiTerm: Math.random() > 0.7, // 30% multi-term
        },
      });
    })
  );

  // 13. Create Disbursements
  console.log('💸 Creating disbursements...');
  const disbursements = [];
  for (let i = 0; i < Math.min(234, awards.length * 3); i++) {
    const award = randomPick(awards);
    const disbursementAmount = Math.min(
      award.remainingBalance || award.awardedAmount,
      award.awardedAmount * (0.1 + Math.random() * 0.4) // 10-50% of award amount
    );
    
    if (disbursementAmount > 100) { // Only create disbursements for meaningful amounts
      const method = randomPick(['DIRECT_DEPOSIT', 'CHECK'] as const);
      const studentBankAccount = studentBankAccounts.find(ba => ba.studentId === award.studentId);
      
      const disbursement = await prisma.disbursement.create({
        data: {
          disbursementId: `DIS-2024-${(i + 1).toString().padStart(3, '0')}`,
          awardId: award.id,
          amount: disbursementAmount,
          method,
          studentBankAccountId: method === 'DIRECT_DEPOSIT' ? studentBankAccount?.id : null,
          institutionBankAccountId: randomPick(institutionBankAccounts).id,
          checkNumber: method === 'CHECK' ? `CHK${Math.floor(Math.random() * 900000) + 100000}` : null,
          reference: `REF${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          notes: 'Disbursement processed successfully and funds transferred to recipient',
          disbursementDate: randomDate(new Date('2024-03-01'), new Date()),
          createdBy: financialAidOfficer.id,
        },
      });
      disbursements.push(disbursement);

      // Update award remaining balance
      await prisma.award.update({
        where: { id: award.id },
        data: {
          remainingBalance: Math.max(0, (award.remainingBalance || award.awardedAmount) - disbursementAmount),
        },
      });
    }
  }

  // 14. Create Recommendations
  console.log('📝 Creating recommendations...');
  const recommendations = [];
  
  // Create recommendations for some applications from faculty to students
  for (let i = 0; i < Math.min(15, applications.length); i++) {
    const application = applications[i];
    const facultyRecord = randomPick(faculty);
    const facultyUser = facultyUsers.find(u => u.id === facultyRecord.userId);
    const student = students.find(s => s.id === application.studentId);
    const studentUser = studentUsers.find(u => u.id === student?.userId);
    const scholarship = scholarships.find(s => s.id === application.scholarshipId);
    
    if (student && studentUser && facultyUser && scholarship) {
      const statuses = ['DRAFT', 'SUBMITTED', 'APPROVED'] as const;
      const status = randomPick(statuses);
      
      const recommendation = await prisma.recommendation.create({
        data: {
          facultyId: facultyRecord.id,
          studentId: student.id,
          applicationId: application.id,
          scholarshipId: scholarship.id,
          title: `Recommendation for ${scholarship.name}`,
          content: status === 'DRAFT' ? '' : `Dear Selection Committee,

I am writing to provide my strongest recommendation for ${studentUser.name} for the ${scholarship.name}. As a faculty member at our institution, I have had the privilege of working with ${studentUser.name} and can confidently attest to their exceptional academic performance and character.

${studentUser.name} has consistently demonstrated outstanding academic abilities, maintaining a GPA of ${(student.gpa || 3.5).toFixed(2)}. Their dedication to learning and intellectual curiosity make them an ideal candidate for this scholarship.

Beyond academics, ${studentUser.name} shows remarkable leadership potential and commitment to community service. They have been actively involved in various campus activities and have shown exceptional maturity in their approach to both academic and personal challenges.

I give ${studentUser.name} my highest recommendation without reservation. I am confident they will make excellent use of this scholarship opportunity and continue to excel in their academic pursuits.

Sincerely,
${facultyUser.name}
Faculty Advisor`,
          status,
          submittedAt: status === 'SUBMITTED' || status === 'APPROVED' ? randomDate(new Date('2024-01-01'), new Date()) : null,
        },
      });
      
      recommendations.push(recommendation);
    }
  }

  // 15. Create Audit Logs
  console.log('📋 Creating audit logs...');
  const auditActions: ('CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'DISBURSE')[] = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'DISBURSE'];
  const entityTypes = ['User', 'Student', 'Application', 'Award', 'Disbursement', 'Scholarship', 'Fund', 'Program'];
  
  for (let i = 0; i < 500; i++) {
    await prisma.auditLog.create({
      data: {
        userId: randomPick([adminUser.id, financialAidOfficer.id, ...facultyUsers.map(f => f.id)]),
        action: randomPick(auditActions),
        entityType: randomPick(entityTypes),
        entityId: `entity_${Math.floor(Math.random() * 1000) + 1}`,
        details: {
          description: 'Automated audit log entry for system activity tracking',
          action: randomPick(auditActions),
          entityType: randomPick(entityTypes),
          previousValue: Math.random() > 0.5 ? 'previous_state' : null,
          newValue: 'updated_state',
          timestamp: new Date().toISOString(),
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        timestamp: randomDate(new Date('2024-01-01'), new Date()),
      },
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log('📊 Summary:');
  console.log(`   - ${permissions.length} permissions created`);
  console.log(`   - 3 ID series created`);
  console.log(`   - ${programs.length} programs created`);
  console.log(`   - ${studentUsers.length + 2 + facultyUsers.length} users created`);
  console.log(`   - ${students.length} students created`);
  console.log(`   - ${faculty.length} faculty created`);
  console.log(`   - ${funds.length} funds created`);
  console.log(`   - ${scholarships.length} scholarships created`);
  console.log(`   - ${institutionBankAccounts.length + studentBankAccounts.length} bank accounts created`);
  console.log(`   - ${applications.length} applications created`);
  console.log(`   - ${awards.length} awards created`);
  console.log(`   - ${recommendations.length} recommendations created`);
  console.log(`   - ${disbursements.length} disbursements created`);
  console.log(`   - 500 audit logs created`);
  console.log('');
  console.log('🚀 Ready to use! Login credentials:');
  console.log(`   Admin: admin@university.edu / password123`);
  console.log(`   Financial Aid: financial.aid@university.edu / password123`);
  console.log(`   Faculty: emily.rodriguez@university.edu / password123`);
  console.log(`   Students: Use any student email (e.g., alex.thompson@student.university.edu) / password123`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
