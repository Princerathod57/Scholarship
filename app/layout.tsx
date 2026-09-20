 
import { auth } from '@/auth'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/lib/provider'
import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import { Inter } from 'next/font/google'
import { MainNav } from '@/components/main-nav'
import { UserInfo } from '@/components/user-info'
import { ModeToggle } from '@/components/mode-toggle'
import { Notifications } from '@/components/notifications'
import Link from 'next/link'
import { HydrationBoundary } from '@/components/hydration-boundary'
import { HydrationInit } from '@/components/hydration-init'
import { GraduationCap, Sparkles } from 'lucide-react'
import './globals.css'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin'] })

 export const metadata: Metadata = {
  title: 'Student Scholarship Management System',
  description: 'Comprehensive scholarship and grant management platform for students, faculty, and administrators',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error('Auth error in layout:', error);
    // Continue without session if auth fails
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`} >
        <SessionProvider session={session} >
        <HydrationInit />
        <ThemeProvider attribute="class" defaultTheme="light">
          <Providers>
             <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm overflow-hidden">
                    <div className="w-full max-w-full px-4 md:px-6 overflow-hidden">
                      <div className="flex h-16 items-center justify-between gap-2 md:gap-4 w-full max-w-full overflow-hidden">
                        <Link href="/" className="flex-shrink-0">
                        <div className="flex items-center gap-2 md:gap-3 cursor-pointer group">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-sm group-hover:blur-md transition-all duration-300"></div>
                            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-1.5 md:p-2 rounded-lg group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300">
                              <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight group-hover:from-blue-700 group-hover:via-purple-700 group-hover:to-indigo-700 transition-all duration-300">
                              Scholarship Portal
                            </h1>
                            <div className="hidden sm:flex items-center gap-1 -mt-1">
                              <Sparkles className="h-3 w-3 text-purple-500 group-hover:text-purple-600 transition-colors duration-300" />
                              <span className="text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors duration-300">Excellence in Education</span>
                            </div>
                          </div>
                        </div>
                        </Link>
                        <MainNav />
                        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 px-2 md:px-3">
                          <HydrationBoundary>
                            <Notifications />
                            <ModeToggle />
                            <UserInfo />
                          </HydrationBoundary>
                        </div>
                      </div>
                    </div>
            </div>
            <main className="flex-1 w-full">
              <div className="w-full px-4 md:px-6 py-4 md:py-6">
                {children}
              </div>
            </main>
            <footer className="border-t border-border/40 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm">
              <div className="w-full flex flex-col sm:flex-row h-auto sm:h-14 items-center justify-between px-4 py-3 sm:py-0 lg:px-6 gap-2 sm:gap-0">
                <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  &copy; {new Date().getFullYear()} Student Scholarship Management System
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Built by HM
                </p>
              </div>
            </footer>
            <Toaster />
          </Providers>
        </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
