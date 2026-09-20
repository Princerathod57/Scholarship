import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDemoUsers() {
  console.log('🧪 Creating demo users for testing...');

  try {
    // Create demo admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@university.edu' },
      update: {},
      create: {
        email: 'admin@university.edu',
        name: 'System Administrator',
        printName: 'Admin User',
        password: 'admin123', // Plain text password for demo
        role: 'ADMIN',
        isFirstLogin: false,
      },
    });
    console.log('✅ Admin user created:', adminUser.email);

    // Create demo student user
    const studentUser = await prisma.user.upsert({
      where: { email: 'student@university.edu' },
      update: {},
      create: {
        email: 'student@university.edu',
        name: 'Demo Student',
        printName: 'Student User',
        password: 'student123', // Plain text password for demo
        role: 'STUDENT',
        isFirstLogin: false,
      },
    });
    console.log('✅ Student user created:', studentUser.email);

    // Create demo faculty user
    const facultyUser = await prisma.user.upsert({
      where: { email: 'faculty@university.edu' },
      update: {},
      create: {
        email: 'faculty@university.edu',
        name: 'Demo Faculty',
        printName: 'Faculty User',
        password: 'faculty123', // Plain text password for demo
        role: 'FACULTY',
        isFirstLogin: false,
      },
    });
    console.log('✅ Faculty user created:', facultyUser.email);

    // Create demo financial aid officer
    const finaidUser = await prisma.user.upsert({
      where: { email: 'finaid@university.edu' },
      update: {},
      create: {
        email: 'finaid@university.edu',
        name: 'Financial Aid Officer',
        printName: 'FinAid User',
        password: 'finaid123', // Plain text password for demo
        role: 'FINANCIAL_AID_OFFICER',
        isFirstLogin: false,
      },
    });
    console.log('✅ Financial Aid Officer created:', finaidUser.email);

    console.log('\n🎉 Demo users created successfully!');
    console.log('\nDemo Login Credentials:');
    console.log('========================');
    console.log('Admin: admin@university.edu / admin123');
    console.log('Student: student@university.edu / student123');
    console.log('Faculty: faculty@university.edu / faculty123');
    console.log('Financial Aid: finaid@university.edu / finaid123');

  } catch (error) {
    console.error('❌ Error creating demo users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createDemoUsers();
