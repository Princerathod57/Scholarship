"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetApplications } from "@/app/features/applications/use-get-applications";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, FileText, Award, Calendar, DollarSign, User, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ApplicationDetailsPage() {
  const { applicationId } = useParams();
  const router = useRouter();

  const { data: applicationsData, isLoading } = useGetApplications();
  const applications = applicationsData?.data || [];
  const application = applications.find((app: any) => app.id === applicationId);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Application not found. Please check the URL or browse your applications.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/student/applications">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/student/applications">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Application Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application #{application.applicationId || application.id.slice(0, 8)}
                </CardTitle>
                <CardDescription>
                  Submitted on {formatDate(application.submittedAt || application.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(application.status)}
                    <span className="font-medium">Status: {application.status.replace('_', ' ')}</span>
                  </div>
                  <Badge variant={getStatusBadgeVariant(application.status)}>
                    {application.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Scholarship Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Scholarship Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{application.scholarship?.name}</h3>
                    <p className="text-muted-foreground">{application.scholarship?.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Amount</p>
                      <p className="text-lg font-semibold text-green-600">
                        {application.appliedAmount 
                          ? formatCurrency(application.appliedAmount)
                          : formatCurrency(application.scholarship?.amount || 0)
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Category</p>
                      <p className="text-sm">{application.scholarship?.category?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Program</p>
                      <p className="text-sm">{application.student?.program?.name || 'Any Program'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Essay */}
            {application.essay && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Personal Statement / Essay
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{application.essay}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Notes */}
            {application.reviewNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Review Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">{application.reviewNotes}</p>
                    {application.reviewedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Reviewed on {formatDate(application.reviewedAt)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Application Submitted</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(application.submittedAt || application.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {application.status === 'UNDER_REVIEW' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Under Review</p>
                        <p className="text-xs text-muted-foreground">
                          Application is being reviewed
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {(application.status === 'APPROVED' || application.status === 'REJECTED') && application.reviewedAt && (
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        application.status === 'APPROVED' ? 'bg-green-600' : 'bg-red-600'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium">
                          {application.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(application.reviewedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Award Information */}
            {application.award && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Award Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Award ID</p>
                      <p className="text-sm font-mono">{application.award.awardId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Awarded Amount</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(application.award.awardedAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge variant="default">{application.award.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Applicant Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Student Name</p>
                    <p className="text-sm">{application.student?.user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Student ID</p>
                    <p className="text-sm font-mono">{application.student?.studentId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Program</p>
                    <p className="text-sm">{application.student?.program?.name}</p>
                  </div>
                  {application.student?.gpa && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">GPA</p>
                      <p className="text-sm">{application.student.gpa.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
