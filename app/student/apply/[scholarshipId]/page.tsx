"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGetScholarships } from "@/app/features/scholarships/use-get-scholarships";
import { useCreateApplication } from "@/app/features/applications/use-create-application";
import { useGetStudents } from "@/app/features/students/use-get-students";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, FileText, DollarSign, Award, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ApplyScholarshipPage() {
  const { scholarshipId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [appliedAmount, setAppliedAmount] = useState("");
  const [essay, setEssay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: scholarshipsData, isLoading: isLoadingScholarships } = useGetScholarships();
  const { data: studentsData, isLoading: isLoadingStudents } = useGetStudents();
  const createApplicationMutation = useCreateApplication();

  const scholarships = scholarshipsData?.data || [];
  const scholarship = scholarships?.find((s: any) => s.id === scholarshipId);
  const students = studentsData?.data || [];
  
  // Try both email matching approaches to be more flexible
  const currentStudent = students?.find((s: any) => 
    s.user?.email === session?.user?.email || 
    s.user?.email?.toLowerCase() === session?.user?.email?.toLowerCase()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentStudent) {
      toast.error("Student profile not found. Please contact administrator.");
      return;
    }

    if (!scholarship) {
      toast.error("Scholarship not found.");
      return;
    }

    if (!essay.trim()) {
      toast.error("Please provide an essay for your application.");
      return;
    }

    const amount = parseFloat(appliedAmount);
    if (scholarship.isVariableAmount) {
      if (!amount || amount <= 0) {
        toast.error("Please enter a valid amount.");
        return;
      }
      if (scholarship.minAmount && amount < scholarship.minAmount) {
        toast.error(`Amount must be at least ${formatCurrency(scholarship.minAmount)}.`);
        return;
      }
      if (scholarship.maxAmount && amount > scholarship.maxAmount) {
        toast.error(`Amount cannot exceed ${formatCurrency(scholarship.maxAmount)}.`);
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      await createApplicationMutation.mutateAsync({
        scholarshipId: scholarship.id,
        studentId: currentStudent.id,
        appliedAmount: scholarship.isVariableAmount ? amount : undefined,
        essay: essay.trim(),
      });
      
      toast.success("Application submitted successfully!");
      router.push("/student/applications");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingScholarships || isLoadingStudents) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-2xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Scholarship not found. Please check the URL or browse available scholarships.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/student/browse-scholarships">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse Scholarships
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentStudent) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-2xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Student Profile Missing</strong><br />
              Your user account exists, but you don't have a student profile yet. This is required to apply for scholarships.
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What you need to do:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Contact the scholarship administrator</li>
                <li>Provide them with your account details below</li>
                <li>Ask them to create your student profile</li>
                <li>Once created, you can apply for scholarships</li>
              </ol>
            </div>
            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Your Account Information:</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Email:</strong> {session?.user?.email}</p>
                <p><strong>Name:</strong> {session?.user?.name}</p>
                <p><strong>User Role:</strong> {session?.user?.role}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/student/browse-scholarships">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Scholarships
                </Button>
              </Link>
              <Link href="/student/dashboard">
                <Button variant="outline">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isDeadlinePassed = scholarship.applicationDeadline && new Date() > new Date(scholarship.applicationDeadline);

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/student/browse-scholarships">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scholarships
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {scholarship.name}
            </CardTitle>
            <CardDescription>{scholarship.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p className="text-lg font-semibold">
                  {scholarship.isVariableAmount 
                    ? `${formatCurrency(scholarship.minAmount || 0)} - ${formatCurrency(scholarship.maxAmount || scholarship.amount)}`
                    : formatCurrency(scholarship.amount)
                  }
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p className="text-sm">{scholarship.category.replace('_', ' ')}</p>
              </div>
              {scholarship.applicationDeadline && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Application Deadline</p>
                  <p className="text-sm">{new Date(scholarship.applicationDeadline).toLocaleDateString()}</p>
                </div>
              )}
              {scholarship.requirements && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Requirements</p>
                  <p className="text-sm">{scholarship.requirements}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {isDeadlinePassed ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The application deadline for this scholarship has passed.
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Submit Application
              </CardTitle>
              <CardDescription>
                Please complete all required fields to submit your application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {scholarship.isVariableAmount && (
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Requested Amount *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min={scholarship.minAmount || 0}
                      max={scholarship.maxAmount || scholarship.amount}
                      value={appliedAmount}
                      onChange={(e) => setAppliedAmount(e.target.value)}
                      placeholder={`Enter amount (${formatCurrency(scholarship.minAmount || 0)} - ${formatCurrency(scholarship.maxAmount || scholarship.amount)})`}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      You can request between {formatCurrency(scholarship.minAmount || 0)} and {formatCurrency(scholarship.maxAmount || scholarship.amount)}.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="essay">Personal Statement / Essay *</Label>
                  <Textarea
                    id="essay"
                    value={essay}
                    onChange={(e) => setEssay(e.target.value)}
                    placeholder="Please describe why you are applying for this scholarship, your academic goals, and how this scholarship will help you achieve them. Include any relevant experiences, achievements, or circumstances that support your application."
                    className="min-h-[200px]"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 100 characters required. Current: {essay.length}
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || essay.length < 100}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                  <Link href="/student/browse-scholarships">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
