"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetApplications } from "@/app/features/applications/use-get-applications";
import { useGetStudents } from "@/app/features/students/use-get-students";
import { useSession } from "next-auth/react";
import { ClipboardList, Eye, FileText, Calendar, Award } from "lucide-react";
import Link from "next/link";

// Simple date formatting function
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function StudentApplicationsPage() {
  const { data: session } = useSession();
  const { data: studentsResponse } = useGetStudents();
  
  // Find current student
  const students = studentsResponse?.data || [];
  const currentStudent = students?.find((s: any) => s.user.email === session?.user?.email);
  
  const { data: applicationsResponse, isLoading } = useGetApplications({
    studentId: currentStudent?.id
  });

  // Extract applications array from the API response
  const applications = applicationsResponse?.data || [];
  
  // Filter out draft applications
  const myApplications = applications?.filter((app: any) => app.status !== 'DRAFT') || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your applications...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList className="h-6 w-6" />
        <h1 className="text-3xl font-bold">My Applications</h1>
      </div>

      {myApplications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground mb-4 text-center">
              You haven't submitted any scholarship applications yet.
            </p>
            <Link href="/student/browse-scholarships">
              <Button>
                Browse Available Scholarships
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {myApplications.map((application: any) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Application #{application.id.slice(0, 8)}
                    </CardTitle>
                    <CardDescription>
                      Submitted on {formatDate(application.submittedAt)}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(application.status)}>
                    {application.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="text-sm">{application.status.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(application.submittedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                    <p className="text-sm">{formatDate(application.updatedAt)}</p>
                  </div>
                </div>
                
                {application.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm bg-muted p-2 rounded">{application.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link href={`/student/applications/${application.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  {application.status === 'PENDING' && (
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      Edit Application
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
