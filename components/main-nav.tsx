"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  LayoutDashboard, 
  BookOpen, 
  DollarSign, 
  ClipboardList, 
  Users, 
  Building2, 
  FileText, 
  Tags, 
  GraduationCap,
  Trophy,
  CreditCard,
  FolderOpen,
  Settings,
  Wallet,
  Database,
  Award,
  Target,
  BarChart3,
  Search,
  Briefcase,
  Home,
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/lib/auth";
 

export function MainNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { isAuthenticated, isAdmin, isFinancialAidOfficer, isStudent, isFaculty, user } = useAuth();
  
  const routes = isStudent() ? [
    // Student-specific navigation
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Applications",
      href: "/student/applications", 
      icon: ClipboardList,
    },
    {
      name: "My Awards",
      href: "/student/awards",
      icon: Trophy,
    },
    {
      name: "Browse Scholarships",
      href: "/student/browse-scholarships",
      icon: BookOpen,
    },
    {
      name: "Documents",
      href: "/student/documents",
      icon: FolderOpen,
    },
  ] : isFaculty() ? [
    // Faculty-specific navigation
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Student Advisees",
      href: "/faculty/advisees",
      icon: Users,
    },
    {
      name: "Scholarship Programs",
      href: "/faculty/scholarships",
      icon: GraduationCap,
    },
    {
      name: "Recommendations",
      href: "/faculty/recommendations",
      icon: FileText,
    },
  ] : [
    // Admin and Financial Aid Officer navigation
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Applications",
      href: "/applications",
      icon: ClipboardList,
    },
    {
      name: "Awards",
      href: "/awards",
      icon: Trophy,
    },
    {
      name: "Students",
      href: "/students",
      icon: Users,
    },
    {
      name: "Scholarships",
      href: "/scholarships",
      icon: GraduationCap,
    },
    {
      name: "Programs",
      href: "/programs",
      icon: BookOpen,
    },
    {
      name: "Disbursements",
      href: "/disbursements",
      icon: CreditCard,
    },
    ...(isAdmin()
      ? [
          {
            name: "Settings",
            href: "/settings",
            icon: Settings,
            submenu: [
              {
                name: "Bank Accounts",
                href: "/settings/bank-accounts",
                icon: Building2,
              },
              {
                name: "Funding Sources",
                href: "/settings/funds",
                icon: Wallet,
              },
              {
                name: "ID Series Management",
                href: "/settings/series",
                icon: Database,
              },
              {
                name: "Audit Logs",
                href: "/audit",
                icon: FileText,
              },
            ]
          },
        ]
      : []),
  ];

  return (
    <div className="flex-1 flex justify-center w-full max-w-full overflow-hidden">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 w-full max-w-full overflow-hidden justify-center">
        {isAuthenticated() ? (
          <div className="flex items-center space-x-1 lg:space-x-2 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl p-2 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm shadow-lg max-w-full overflow-hidden flex-shrink min-w-0">
            {routes.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.href || (route.submenu && route.submenu.some((item: any) => pathname === item.href));
              
              // Handle routes with submenus (like Settings)
              if (route.submenu) {
                return (
                  <DropdownMenu key={route.href}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "px-2 lg:px-3 py-2.5 pr-4 lg:pr-5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-1 lg:gap-2 relative group min-w-fit flex-shrink-0",
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-105 border border-blue-400/20"
                            : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-700 dark:hover:to-slate-600 hover:shadow-md hover:scale-105 border border-transparent hover:border-slate-300/50 dark:hover:border-slate-600/50"
                        )}
                      >
                        <Icon className={cn(
                          "transition-all duration-300",
                          isActive ? "h-5 w-5" : "h-4 w-4"
                        )} />
                        <span className="hidden lg:inline">{route.name}</span>
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-2xl rounded-xl">
                      <DropdownMenuItem asChild>
                        <Link href={route.href} className="flex items-center gap-2 w-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 rounded-lg m-1 p-2 transition-all duration-200">
                          <Settings className="h-4 w-4" />
                          Settings Overview
                        </Link>
                      </DropdownMenuItem>
                      {route.submenu.map((submenuItem: any) => {
                        const SubmenuIcon = submenuItem.icon;
                        return (
                          <DropdownMenuItem key={submenuItem.href} asChild>
                            <Link href={submenuItem.href} className="flex items-center gap-2 w-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 rounded-lg m-1 p-2 transition-all duration-200">
                              <SubmenuIcon className="h-4 w-4" />
                              {submenuItem.name}
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }
              
              // Handle regular routes
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "px-2 lg:px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-1 lg:gap-2 relative group min-w-fit flex-shrink-0",
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-105 border border-blue-400/20"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-700 dark:hover:to-slate-600 hover:shadow-md hover:scale-105 border border-transparent hover:border-slate-300/50 dark:hover:border-slate-600/50"
                  )}
                >
                  <Icon className={cn(
                    "transition-all duration-300",
                    isActive ? "h-5 w-5" : "h-4 w-4"
                  )} />
                  <span className="hidden lg:inline">{route.name}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl p-2 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm shadow-lg max-w-full overflow-hidden flex-shrink min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="px-2 lg:px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-1 lg:gap-2 relative group min-w-fit flex-shrink-0 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 hover:shadow-md hover:scale-105 border border-transparent hover:border-blue-300/50 dark:hover:border-blue-600/50"
              asChild
            >
              <Link href="/login">
                <Home className="h-4 w-4 transition-all duration-300" />
                <span className="hidden lg:inline">Login</span>
              </Link>
            </Button>
          </div>
        )}
      </nav>

      {/* Mobile Navigation - Hamburger Menu */}
      <div className="md:hidden flex items-center">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="p-6 pb-4 border-b">
              <SheetTitle className="text-left flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Scholarship Portal
                </span>
              </SheetTitle>
              <SheetDescription className="text-left text-sm text-muted-foreground">
                Excellence in Education
              </SheetDescription>
            </SheetHeader>
            
            <div className="flex flex-col p-4 space-y-2">
              {isAuthenticated() ? (
                <>
                  {/* Mobile Navigation Items */}
                  {routes.map((route) => {
                    const Icon = route.icon;
                    const isActive = pathname === route.href || (route.submenu && route.submenu.some((item: any) => pathname === item.href));
                    
                    if (route.submenu) {
                      return (
                        <div key={route.href} className="space-y-1">
                          <Link
                            href={route.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 w-full text-left",
                              isActive
                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                                : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-700 dark:hover:to-slate-600"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{route.name}</span>
                          </Link>
                          {route.submenu.map((submenuItem: any) => {
                            const SubmenuIcon = submenuItem.icon;
                            const isSubmenuActive = pathname === submenuItem.href;
                            return (
                              <Link
                                key={submenuItem.href}
                                href={submenuItem.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 px-6 py-2 rounded-xl transition-all duration-300 w-full text-left ml-4",
                                  isSubmenuActive
                                    ? "bg-gradient-to-r from-blue-400 to-purple-500 text-white"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                )}
                              >
                                <SubmenuIcon className="h-4 w-4" />
                                <span className="text-sm">{submenuItem.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      );
                    }
                    
                    return (
                      <Link
                        key={route.href}
                        href={route.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 w-full text-left",
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                            : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-700 dark:hover:to-slate-600"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{route.name}</span>
                      </Link>
                    );
                  })}
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl w-full text-left text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 transition-all duration-300"
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Login</span>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}