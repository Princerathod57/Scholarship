import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected! Found ${userCount} users`);
    
    // Test finding the demo admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@university.edu' }
    });
    
    if (adminUser) {
      console.log('✅ Demo admin user found:', {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        printName: adminUser.printName,
        isFirstLogin: adminUser.isFirstLogin,
        hasPassword: !!adminUser.password,
        passwordValue: adminUser.password // This will show the actual password for debugging
      });
    } else {
      console.log('❌ Demo admin user not found');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
