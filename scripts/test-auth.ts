import { signIn } from '@/auth';

async function testAuth() {
  try {
    console.log('🔍 Testing authentication...');
    
    // Test with the demo admin user
    const result = await signIn('credentials', {
      email: 'admin@university.edu',
      password: 'admin123',
      redirect: false
    });
    
    console.log('✅ Auth result:', result);
    
  } catch (error) {
    console.error('❌ Auth test failed:', error);
  }
}

testAuth();
