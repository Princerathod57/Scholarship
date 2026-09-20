// Firebase admin configuration for server-side use only
let adminAuth: any = null;

export const getAdminAuth = async () => {
  if (adminAuth) return adminAuth;
  
  // Only initialize on server side
  if (typeof window !== 'undefined') {
    console.warn('Firebase Admin should not be used on client side');
    return null;
  }
  
  try {
    const admin = await import('firebase-admin');
    
    // Check if required environment variables are present
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('Firebase Admin credentials not properly configured. OTP functionality will be disabled.');
      return null;
    }    let adminApp;
    if (!admin.apps.length) {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      adminApp = admin.apps[0] || null;
    }

    if (!adminApp) {
      throw new Error('Failed to initialize Firebase Admin app');
    }

    adminAuth = admin.auth(adminApp);
    console.log('Firebase Admin initialized successfully');
    return adminAuth;
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    console.warn('Firebase Admin failed to initialize. OTP functionality will be disabled.');
    return null;
  }
};
