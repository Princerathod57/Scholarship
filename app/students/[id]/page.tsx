"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetStudent } from "@/app/features/students/use-get-student";
import { useGetApplications } from "@/app/features/applications/use-get-applications";
import { useGetAwards } from "@/app/features/awards/use-get-awards";
import { 
  User, 
  Calendar, 
  GraduationCap, 
  Mail, 
  Phone,
  MapPin,
  ArrowLeft,
  FileText,
  Award,
  TrendingUp,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle
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

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { data: studentData, isLoading: studentLoading, error: studentError } = useGetStudent(studentId);
  const { data: applicationsData, isLoading: applicationsLoading } = useGetApplications();
  const { data: awardsData, isLoading: awardsLoading } = useGetAwards();

  const student = studentData?.data;
  const applications = applicationsData?.data || [];
  const awards = awardsData?.data || [];

  // Filter applications and awards for this student
  const studentApplications = applications.filter((app: any) => app?.studentId === studentId);
  const studentAwards = awards.filter((award: any) => award?.studentId === studentId);
  
  const approvedApplications = studentApplications.filter((app: any) => app?.status === 'APPROVED');
  const pendingApplications = studentApplications.filter((app: any) => 
    app?.status === 'PENDING' || app?.status === 'UNDER_REVIEW'
  );
  const rejectedApplications = studentApplications.filter((app: any) => app?.status === 'REJECTED');

  // Calculate total award amount
  const totalAwardAmount = studentAwards.reduce((sum: number, award: any) => sum + (award?.amount || 0), 0);

  if (studentLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading student profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (studentError || !student) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {studentError ? "Failed to load student profile." : "Student not found."}
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
      case 'APPROVED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'UNDER_REVIEW':
        return 'outline';
      case 'REJECTED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      case 'UNDER_REVIEW':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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
          <User className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Student Profile</h1>
        </div>
      </div>

      {/* Student Information */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <User className="h-6 w-6" />
                {student.user?.name || 'Student Name Not Available'}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Student ID: {student.studentId || student.id}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              Active Student
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Contact Information */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Information
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{student.user?.email || 'Email not available'}</span>
                </div>
                {student.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{student.phone}</span>
                  </div>
                )}
                {student.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{student.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Academic Information
              </h4>
              <div className="space-y-2">
                {student.gpa && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GPA:</span>
                    <span className="font-medium">{student.gpa}</span>
                  </div>
                )}
                {student.major && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Major:</span>
                    <span className="font-medium">{student.major}</span>
                  </div>
                )}
                {student.graduationDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Graduation:</span>
                    <span className="font-medium">{formatDate(student.graduationDate)}</span>
                  </div>
                )}
                {student.academicYear && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Academic Year:</span>
                    <span className="font-medium">{student.academicYear}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Financial Information
              </h4>
              <div className="space-y-2">
                {student.expectedFamilyContribution && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">EFC:</span>
                    <span className="font-medium">{formatCurrency(student.expectedFamilyContribution)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Awards:</span>
                  <span className="font-medium text-green-600">{formatCurrency(totalAwardAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{studentApplications.length}</p>
                <p className="text-muted-foreground">Total Applications</p>
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
                <p className="text-muted-foreground">Approved</p>
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
                <p className="text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{studentAwards.length}</p>
                <p className="text-muted-foreground">Awards</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Applications
          </CardTitle>
          <CardDescription>
            Latest scholarship applications submitted by this student
          </CardDescription>
        </CardHeader>
        <CardContent>
          {studentApplications.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No applications found.</p>
          ) : (
            <div className="space-y-3">
              {studentApplications.slice(0, 5).map((application: any) => (
                <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(application.status)}
                    <div>
                      <p className="font-medium">{application.scholarship?.name || 'Scholarship Name'}</p>
                      <p className="text-sm text-muted-foreground">
                        Applied: {formatDate(application.submittedAt || application.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(application.status)}>
                      {application.status}
                    </Badge>
                    <Link href={`/applications?scholarshipId=${application.scholarshipId}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Awards */}
      {studentAwards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Awards & Scholarships
            </CardTitle>
            <CardDescription>
              Scholarships awarded to this student
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studentAwards.map((award: any) => (
                <div key={award.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{award.scholarship?.name || 'Scholarship Name'}</p>
                      <p className="text-sm text-muted-foreground">
                        Awarded: {formatDate(award.awardedAt || award.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-600">
                      {formatCurrency(award.amount || 0)}
                    </span>
                    <Link href={`/awards?scholarshipId=${award.scholarshipId}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
