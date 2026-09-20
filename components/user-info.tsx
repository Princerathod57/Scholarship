"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Shield, Calendar, LogOut } from "lucide-react";
import Link from "next/link";

export function UserInfo() {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  
  if (!user) return null;
  
  // Get initials from name or printName, fallback to "U" for "User"
  const initials = user?.printName?.substring(0, 2) || 
                  user?.name?.substring(0, 2) || 
                  "U";

  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'destructive';
      case 'FACULTY':
        return 'default';
      case 'STUDENT':
        return 'secondary';
      case 'FINANCIAL_AID_OFFICER':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatRole = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'FINANCIAL_AID_OFFICER':
        return 'Financial Aid Officer';
      default:
        return role?.charAt(0).toUpperCase() + role?.slice(1).toLowerCase();
    }
  };
  
  return (
    <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:scale-105"
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user.name || 'User'}</h3>
              <Badge variant={getRoleBadgeVariant(user.role || '')} className="mt-1">
                {formatRole(user.role || '')}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Your profile information and account details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-muted-foreground">{formatRole(user.role || '')}</p>
                </div>
              </div>
              
              {user.id && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">User ID</p>
                    <p className="text-sm text-muted-foreground font-mono">{user.id.slice(0, 8)}...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex flex-col gap-2">
            <Link href="/change-password" onClick={() => setProfileOpen(false)}>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </Link>
            
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => {
                logout();
                setProfileOpen(false);
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}