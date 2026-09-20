import { z } from "zod";

import Credentials from "next-auth/providers/credentials";
import db from "./lib/prisma";

import { NextAuthConfig } from "next-auth";

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's name. */
      id: string;
      name: string;
      email: string;
      role: string | null;
      image: string;
      printName: string | null;
      isFirstLogin: boolean;
    };
  }
  
  interface User {
    id: string;
    name: string;
    email: string;
    role: string | null;
    printName: string | null;
    isFirstLogin: boolean;
    image?: string;
    password?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: string | null;
    printName: string | null;
    isFirstLogin: boolean;
  }
}
export default {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const validatedFields = CredentialsSchema.safeParse(credentials);

          if (!validatedFields.success) {
            return null;
          }

          const { email, password } = validatedFields.data;
          
          // Special case for OTP-verified users
          if (password === "otp-verified") {
            try {
              const user = await db.user.findUnique({
                where: { email: email },
              });

              if (!user) {
                return null;
              }

              // For OTP-verified users, return the user directly
              return user;
            } catch (error) {
              console.error('Database error in OTP verification:', error);
              return null;
            }
          }

          // Special case for promoter password-verified users
          if (password === "promoter-password-verified") {
            try {
              const user = await db.user.findUnique({
                where: { email: email },
              });

              if (!user) {
                return null;
              }

              // For password-verified promoters, return the user directly
              return user;
            } catch (error) {
              console.error('Database error in promoter verification:', error);
              return null;
            }
          }

          // Regular password authentication
          try {
            // Test database connection first
            console.log('Attempting database connection for user lookup...');
            
            const user = await db.user.findUnique({
              where: { email: email }, // Look up the user by email
            });

            // If no user or no password is found, return null
            if (!user || !user.password) {
              console.log('User not found or no password:', { email, userExists: !!user, hasPassword: !!user?.password });
              return null;
            }

            // Compare the password directly (no hashing)
            const passwordsMatch = password === user.password;
            console.log('Password match result:', { email, passwordsMatch });

            // If passwords don't match, return null
            if (!passwordsMatch) {
              return null;
            }

            // Return the user if authentication is successful
            console.log('Authentication successful for:', user.email);
            return user;
          } catch (error) {
            console.error('Database error in password verification:', error);
            
            // Check if it's a connection error
            if (error instanceof Error) {
              if (error.message.includes('DNS resolution') || 
                  error.message.includes('connection') || 
                  error.message.includes('timeout')) {
                console.error('Database connection issue detected. Please check:');
                console.error('1. MongoDB Atlas cluster is running');
                console.error('2. Network connectivity');
                console.error('3. DATABASE_URL in .env file');
                console.error('4. IP whitelist in MongoDB Atlas');
              }
            }
            
            return null;
          }
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),

    // GitHub,
    // Google
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      try {
        // Initial sign in
        if (user) {
          console.log('JWT callback - user data:', {
            id: user.id,
            email: user.email,
            role: user.role,
            printName: user.printName,
            isFirstLogin: user.isFirstLogin
          });
          
          token.id = user.id;
          token.role = user.role;
          token.printName = user.printName;
          token.isFirstLogin = user.isFirstLogin;
        }
        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        // Return a minimal token to prevent crashes
        return { id: '', role: null, printName: null, isFirstLogin: false };
      }
    },
    async session({ session, token }) {
      try {
        // Send properties to the client
        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.role = (token.role as string) || null;
          session.user.printName = (token.printName as string) || null;
          session.user.isFirstLogin = Boolean(token.isFirstLogin);
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
    async redirect({ url, baseUrl }) {
      // Handle redirects after sign in
      // If the url is relative, append it to baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // If the url is absolute and on the same origin, return it
      else if (new URL(url).origin === baseUrl) return url;
      // Default to dashboard for successful logins
      return `${baseUrl}/dashboard`;
    },
  },
} satisfies NextAuthConfig;