"use client";

import Link from "next/link";
import { 
  Settings, 
  Building2, 
  Wallet, 
  Database, 
  Receipt, 
  Tags, 
  DollarSign,
  ChevronRight,
  Shield,
  Users,
  CreditCard,
  Briefcase
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const settingsPages = [
  {
    title: "Bank Accounts",
    description: "Manage institutional bank accounts and financial information",
    href: "/settings/bank-accounts",
    icon: Building2,
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50",
    iconColor: "text-blue-600"
  },
  {
    title: "Funding Sources",
    description: "Configure funding sources and financial allocations",
    href: "/settings/funds",
    icon: Wallet,
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50",
    iconColor: "text-green-600"
  },
  {
    title: "ID Series Management",
    description: "Manage ID series for various system entities",
    href: "/settings/series",
    icon: Database,
    color: "from-purple-500 to-indigo-500",
    bgColor: "from-purple-50 to-indigo-50",
    iconColor: "text-purple-600"
  }
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Modern Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl" />
          <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    System Settings
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Configure and manage system-wide settings and preferences
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {settingsPages.map((setting) => {
            const Icon = setting.icon;
            return (
              <Link key={setting.href} href={setting.href}>
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 group cursor-pointer h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className={`bg-gradient-to-r ${setting.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`h-6 w-6 ${setting.iconColor}`} />
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg font-semibold group-hover:text-indigo-600 transition-colors">
                        {setting.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {setting.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Configure settings</span>
                      <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${setting.color}`} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Additional Settings Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-900/20 border-blue-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Shield className="h-5 w-5" />
                System Administration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
                These settings require administrator privileges. Changes made here will affect the entire system and all users.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-900/20 border-purple-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Users className="h-5 w-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-600 dark:text-purple-400 leading-relaxed">
                Contact your system administrator if you need assistance with any of these settings or have questions about configuration.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common settings tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/settings/bank-accounts" className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group">
                <Building2 className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-700 group-hover:text-blue-800">Add Bank Account</div>
                  <div className="text-xs text-blue-600">Set up new financial account</div>
                </div>
              </Link>
              
              <Link href="/settings/funds" className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors group">
                <Wallet className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-700 group-hover:text-green-800">Create Fund</div>
                  <div className="text-xs text-green-600">Configure funding source</div>
                </div>
              </Link>
              
              <Link href="/settings/series" className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors group">
                <Database className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium text-purple-700 group-hover:text-purple-800">Manage IDs</div>
                  <div className="text-xs text-purple-600">Configure ID series</div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
