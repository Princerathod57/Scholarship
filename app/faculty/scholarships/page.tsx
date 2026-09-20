"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetScholarships } from "@/app/features/scholarships/use-get-scholarships";
import { useGetApplications } from "@/app/features/applications/use-get-applications";
import { useGetStudents } from "@/app/features/students/use-get-students";
import { GraduationCap, Search, BookOpen, Users, DollarSign, Calendar, Award, TrendingUp, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";

// Simple date formatting function
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Simple currency formatting function
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default function FacultyScholarshipsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: session } = useSession();
  
  const { data: scholarships, isLoading: scholarshipsLoading, error: scholarshipsError } = useGetScholarships({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { data: applicationsData, isLoading: applicationsLoading, error: applicationsError } = useGetApplications();
  const { data: studentsData, isLoading: studentsLoading, error: studentsError } = useGetStudents();

  const isLoading = scholarshipsLoading || applicationsLoading || studentsLoading;
  const hasError = scholarshipsError || applicationsError || studentsError;

  // Get real data
  const scholarshipsList = scholarships?.data || [];
  const applications = applicationsData?.data || [];
  const students = studentsData?.data || [];

  // Calculate real statistics with better data validation
  const statistics = {
    totalScholarships: scholarshipsList.length,
    activeScholarships: scholarshipsList.filter((s: any) => s?.status === 'ACTIVE').length,
    totalAwardees: applications.filter((app: any) => app?.status === 'APPROVED').length,
    averageGpa: students.length > 0 
      ? (students.reduce((sum: number, student: any) => sum + (student?.gpa || 0), 0) / students.length).toFixed(2)
      : '0.00',
    totalFunding: scholarshipsList.reduce((sum: number, s: any) => sum + (s?.amount || 0), 0),
    pendingApplications: applications.filter((app: any) => app?.status === 'PENDING' || app?.status === 'UNDER_REVIEW').length,
  };

  // Get recent activity from all applications with better data validation
  const recentActivity = applications
    .filter((app: any) => app?.submittedAt || app?.createdAt) // Only include apps with valid dates
    .sort((a: any, b: any) => new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime())
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading scholarship data...</p>
        </div>
      </div>
    );
  }

  // Handle error states
  if (hasError && !isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Failed to load scholarship data. Please try again.</p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const filteredScholarships = scholarships?.data || [];

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'default';
      case 'CLOSED':
      case 'INACTIVE':
        return 'secondary';
      case 'DRAFT':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Scholarship Programs Overview</h1>
        </div>
        <Link href="/faculty/recommendations">
          <Button variant="outline">
            Manage Recommendations
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{statistics.totalScholarships}</p>
                <p className="text-xs text-muted-foreground">Total Programs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{statistics.activeScholarships}</p>
                <p className="text-xs text-muted-foreground">Active Programs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{statistics.totalAwardees}</p>
                <p className="text-xs text-muted-foreground">Total Awardees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{statistics.averageGpa}</p>
                <p className="text-xs text-muted-foreground">Avg GPA</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-lg font-bold">{formatCurrency(statistics.totalFunding).replace('.00', '')}</p>
                <p className="text-xs text-muted-foreground">Total Funding</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{statistics.pendingApplications}</p>
                <p className="text-xs text-muted-foreground">Pending Apps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Programs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scholarship programs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates from scholarship programs and applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent application activity.</p>
            ) : (
              recentActivity.map((activity: any, index: number) => (
                <div key={activity?.id || index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {activity?.status === 'APPROVED' ? (
                    <Award className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : activity?.status === 'PENDING' ? (
                    <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
                  ) : activity?.status === 'UNDER_REVIEW' ? (
                    <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                  ) : (
                    <Calendar className="h-5 w-5 text-orange-500 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {activity.student?.user?.name || 'Student'} {
                        activity?.status === 'APPROVED' ? 'was awarded' : 
                        activity?.status === 'REJECTED' ? 'was declined for' :
                        activity?.status === 'UNDER_REVIEW' ? 'is under review for' :
                        'applied for'
                      } {activity.scholarship?.name || 'scholarship'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.submittedAt || activity.createdAt)} • Status: {activity?.status || 'Unknown'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scholarship Programs List */}
      {filteredScholarships.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Programs Found</h3>
            <p className="text-muted-foreground mb-4 text-center">
              {search ? "No scholarship programs match your search." : "No scholarship programs available."}
            </p>
            <Button onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredScholarships.map((scholarship: any) => (
            <Card key={scholarship?.id || Math.random()} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {scholarship?.name || 'Untitled Scholarship'}
                    </CardTitle>
                    <CardDescription>
                      {scholarship?.description || 'No description available'}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(scholarship?.status)}>
                    {scholarship?.status || 'Unknown'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Award Amount</p>
                    <p className="text-sm font-semibold text-green-600">
                      {scholarship?.isVariableAmount 
                        ? `${formatCurrency(scholarship?.minAmount || 0)} - ${formatCurrency(scholarship?.maxAmount || scholarship?.amount || 0)}`
                        : formatCurrency(scholarship?.amount || 0)
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recipients</p>
                    <p className="text-sm">{scholarship?.maxRecipients || 'Multiple'} students</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Application Deadline</p>
                    <p className="text-sm">
                      {scholarship?.applicationDeadline ? formatDate(scholarship.applicationDeadline) : 'Rolling'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Applications</p>
                    <p className="text-sm">
                      {applications.filter((app: any) => 
                        app?.scholarshipId === scholarship?.id
                      ).length} total
                      <span className="text-muted-foreground ml-1">
                        ({applications.filter((app: any) => 
                          app?.scholarshipId === scholarship?.id && 
                          (app?.status === 'PENDING' || app?.status === 'UNDER_REVIEW')
                        ).length} pending)
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/scholarships/${scholarship?.id}`}>
                    <Button variant="outline" size="sm" disabled={!scholarship?.id}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/applications?scholarshipId=${scholarship?.id}&scholarshipName=${encodeURIComponent(scholarship?.name || '')}`}>
                    <Button variant="outline" size="sm" disabled={!scholarship?.id}>
                      View Applications
                    </Button>
                  </Link>
                  <Link href={`/awards?scholarshipId=${scholarship?.id}&scholarshipName=${encodeURIComponent(scholarship?.name || '')}`}>
                    <Button variant="outline" size="sm" disabled={!scholarship?.id}>
                      View Recipients
                    </Button>
                  </Link>
                  <Link href="/faculty/recommendations">
                    <Button variant="outline" size="sm">
                      Recommendations
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
