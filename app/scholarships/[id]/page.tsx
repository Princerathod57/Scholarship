"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetScholarship } from "@/app/features/scholarships/use-get-scholarship";
import { useGetApplications } from "@/app/features/applications/use-get-applications";
import { 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  Award,
  ArrowLeft,
  FileText,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

// Simple date formatting function
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
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

export default function ScholarshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scholarshipId = params.id as string;

  const { data: scholarshipData, isLoading: scholarshipLoading, error: scholarshipError } = useGetScholarship(scholarshipId);
  const { data: applicationsData, isLoading: applicationsLoading } = useGetApplications();

  const scholarship = scholarshipData?.data;
  const applications = applicationsData?.data || [];

  // Filter applications for this scholarship
  const scholarshipApplications = applications.filter((app: any) => app?.scholarshipId === scholarshipId);
  const approvedApplications = scholarshipApplications.filter((app: any) => app?.status === 'APPROVED');
  const pendingApplications = scholarshipApplications.filter((app: any) => 
    app?.status === 'PENDING' || app?.status === 'UNDER_REVIEW'
  );

  if (scholarshipLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading scholarship details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (scholarshipError || !scholarship) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {scholarshipError ? "Failed to load scholarship details." : "Scholarship not found."}
            </p>
            <Button onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Scholarship Details</h1>
        </div>
      </div>

      {/* Main Scholarship Information */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{scholarship.name}</CardTitle>
              <CardDescription className="text-base mt-2">
                {scholarship.description || 'No description available'}
              </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(scholarship.status)} className="text-sm">
              {scholarship.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Award Amount</p>
                <p className="text-lg font-semibold text-green-600">
                  {scholarship.isVariableAmount 
                    ? `${formatCurrency(scholarship.minAmount || 0)} - ${formatCurrency(scholarship.maxAmount || scholarship.amount || 0)}`
                    : formatCurrency(scholarship.amount || 0)
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Max Recipients</p>
                <p className="text-lg font-semibold">{scholarship.maxRecipients || 'Multiple'} students</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Application Deadline</p>
                <p className="text-lg font-semibold">
                  {scholarship.applicationDeadline ? formatDate(scholarship.applicationDeadline) : 'Rolling'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <p className="text-lg font-semibold">{scholarshipApplications.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{scholarshipApplications.length}</p>
                <p className="text-muted-foreground">Total Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{pendingApplications.length}</p>
                <p className="text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{approvedApplications.length}</p>
                <p className="text-muted-foreground">Recipients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Details */}
      {(scholarship.requirements || scholarship.eligibilityCriteria) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Requirements & Eligibility</CardTitle>
          </CardHeader>
          <CardContent>
            {scholarship.requirements && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Requirements:</h4>
                <p className="text-muted-foreground">{scholarship.requirements}</p>
              </div>
            )}
            {scholarship.eligibilityCriteria && (
              <div>
                <h4 className="font-semibold mb-2">Eligibility Criteria:</h4>
                <p className="text-muted-foreground">{scholarship.eligibilityCriteria}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Applications & Recipients</CardTitle>
          <CardDescription>
            View and manage applications and awards for this scholarship
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Link href={`/applications?scholarshipId=${scholarship.id}&scholarshipName=${encodeURIComponent(scholarship.name)}`}>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                View Applications ({scholarshipApplications.length})
              </Button>
            </Link>
            <Link href={`/awards?scholarshipId=${scholarship.id}&scholarshipName=${encodeURIComponent(scholarship.name)}`}>
              <Button variant="outline">
                <Award className="h-4 w-4 mr-2" />
                View Recipients ({approvedApplications.length})
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
