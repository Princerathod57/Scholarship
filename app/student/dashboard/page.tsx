"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetApplications } from "@/app/features/applications/use-get-applications";
import { useGetStudents } from "@/app/features/students/use-get-students";
import { useGetScholarships } from "@/app/features/scholarships/use-get-scholarships";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  ClipboardList, 
  Award, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye,
  Plus,
  User,
  GraduationCap,
  Mail,
  Phone,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const { data: applicationsData, isLoading: isLoadingApplications } = useGetApplications();
  const { data: studentsData, isLoading: isLoadingStudents } = useGetStudents();
  const { data: scholarshipsData, isLoading: isLoadingScholarships } = useGetScholarships();

  const applications = applicationsData?.data || [];
  const students = studentsData?.data || [];
  const scholarships = scholarshipsData?.data || [];
  const currentStudent = students?.find((s: any) => s.user.email === session?.user?.email);
  const studentApplications = applications.filter((app: any) => app.student?.user?.email === session?.user?.email);
  const availableScholarships = scholarships?.filter((s: any) => s.status === 'ACTIVE') || [];

  const isLoading = isLoadingApplications || isLoadingStudents || isLoadingScholarships;

  // Check if student profile exists
  if (!isLoading && !currentStudent) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                Student Profile Required
              </CardTitle>
              <CardDescription className="text-orange-700">
                Your user account exists, but you need a student profile to access scholarship features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-2">What to do next:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-orange-800">
                  <li>Contact the scholarship administrator</li>
                  <li>Ask them to create your student profile</li>
                  <li>Provide your account email: <strong>{session?.user?.email}</strong></li>
                </ol>
              </div>
              <div className="flex gap-3">
                <Link href="/student/browse-scholarships">
                  <Button variant="outline">View Available Scholarships</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalApplications = studentApplications.length;
  const pendingApplications = studentApplications.filter((app: any) => app.status === 'PENDING' || app.status === 'UNDER_REVIEW').length;
  const approvedApplications = studentApplications.filter((app: any) => app.status === 'APPROVED').length;
  const rejectedApplications = studentApplications.filter((app: any) => app.status === 'REJECTED').length;
  const totalAwardAmount = studentApplications
    .filter((app: any) => app.award)
    .reduce((sum: number, app: any) => sum + (app.award?.awardedAmount || 0), 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'UNDER_REVIEW':
        return <Eye className="h-4 w-4 text-blue-600" />;
      case 'PENDING':
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      case 'PENDING':
        return 'secondary';
      case 'UNDER_REVIEW':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32 mt-1" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session?.user?.name || 'Student'}! Here's your scholarship overview.
            </p>
          </div>
          <Link href="/student/browse-scholarships">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Apply for Scholarships
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                Applications submitted
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApplications}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting decision
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedApplications}</div>
              <p className="text-xs text-muted-foreground">
                Scholarships awarded
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Awards</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalAwardAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total scholarship amount
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Recent Applications
                  </CardTitle>
                  <Link href="/student/applications">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  Your latest scholarship applications and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {studentApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">No applications yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Start by browsing available scholarships
                    </p>
                    <Link href="/student/browse-scholarships">
                      <Button className="mt-4">
                        Browse Scholarships
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentApplications.slice(0, 5).map((application: any) => (
                      <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Award className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{application.scholarship?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Submitted {formatDate(application.submittedAt || application.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={getStatusBadgeVariant(application.status)}>
                            {getStatusIcon(application.status)}
                            <span className="ml-1">{application.status.replace('_', ' ')}</span>
                          </Badge>
                          <Link href={`/student/applications/${application.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Student Profile */}
            {currentStudent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{currentStudent.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {currentStudent.studentId}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{currentStudent.user.email}</span>
                      </div>
                      
                      {currentStudent.user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{currentStudent.user.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span>{currentStudent.program?.name}</span>
                      </div>
                      
                      {currentStudent.gpa && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>GPA: {currentStudent.gpa.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Scholarships */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Available Scholarships
                </CardTitle>
                <CardDescription>
                  {availableScholarships.length} scholarships available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableScholarships.slice(0, 3).map((scholarship: any) => (
                    <div key={scholarship.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">{scholarship.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {scholarship.category.replace('_', ' ')}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(scholarship.amount)}
                        </span>
                        <Link href={`/student/apply/${scholarship.id}`}>
                          <Button size="sm" variant="outline">
                            Apply
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  <Link href="/student/browse-scholarships">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Scholarships
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Awards */}
            {approvedApplications > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Recent Awards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {studentApplications
                      .filter((app: any) => app.award)
                      .slice(0, 3)
                      .map((application: any) => (
                        <div key={application.id} className="p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                          <h4 className="font-medium text-sm">{application.scholarship?.name}</h4>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-semibold text-green-600">
                              {formatCurrency(application.award.awardedAmount)}
                            </span>
                            <Badge variant="default" className="text-xs">
                              {application.award.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
