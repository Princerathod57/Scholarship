import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Ensure this route is always dynamic

export async function POST(req: NextRequest) {
  try {
    console.log('Login API called');
    const { email, password } = await req.json();
    console.log(`Login attempt for email: ${email}`);
    
    // Validate inputs
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }    // Verify password (direct comparison, no hashing)
    const passwordMatch = password === user.password;
    
    if (!passwordMatch) {
      console.log(`Password verification failed for ${email}`);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
      console.log(`Login successful for ${email}`);
    
    try {
      // Get user permissions and related profile data
      const userPermissions = await db.userPermission.findMany({
        where: { userId: user.id },
        include: { permission: true }
      });

      // Get student profile if user is a student
      let studentProfile = null;
      if (user.role === 'STUDENT') {
        studentProfile = await db.student.findUnique({
          where: { userId: user.id },
          include: {
            program: {
              select: { name: true, code: true }
            }
          }
        });
      }

      // Get faculty profile if user is faculty
      let facultyProfile = null;
      if (user.role === 'FACULTY') {
        facultyProfile = await db.faculty.findUnique({
          where: { userId: user.id }
        });
      }
      
      // Create session token (in a real app, you'd set cookies/JWT)
      // For this example, we'll just return user info (excluding password)
      const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json({
        message: 'Login successful',
        user: {
          ...userWithoutPassword,
          student: studentProfile,
          faculty: facultyProfile,
          permissions: userPermissions.map(up => up.permission.code),
          redirectTo: '/dashboard'
        },
      }, { status: 200 });
    } catch (dbError) {
      console.error('Database error during login:', dbError);
      
      // Even if there's an error getting profile/permissions, still log the user in
      // with basic information
      const { password: _, ...userWithoutPassword } = user;
      
      return NextResponse.json({
        message: 'Login successful with limited information',
        user: userWithoutPassword,
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error in login:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
