import { auth } from '@/auth';

export default async function AuthTestPage() {
  const session = await auth();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      {session ? (
        <div className="bg-green-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">✅ Authenticated</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="bg-red-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">❌ Not Authenticated</h2>
          <p>Please log in to see session data.</p>
        </div>
      )}
      
      <div className="mt-4">
        <h3 className="font-semibold">Test Login Credentials:</h3>
        <p>Email: admin@university.edu</p>
        <p>Password: admin123</p>
      </div>
    </div>
  );
}
