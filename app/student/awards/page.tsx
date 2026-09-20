"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetAwards } from "@/app/features/awards/use-get-awards";
import { useGetStudents } from "@/app/features/students/use-get-students";
import { useSession } from "next-auth/react";
import { Trophy, Eye, Calendar, DollarSign, Award, GraduationCap } from "lucide-react";

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

export default function StudentAwardsPage() {
  const { data: session } = useSession();
  const { data: studentsResponse } = useGetStudents();
  
  // Find current student
  const students = studentsResponse?.data || [];
  const currentStudent = students?.find((s: any) => s.user.email === session?.user?.email);
  
  const { data: awardsResponse, isLoading } = useGetAwards({
    studentId: currentStudent?.id
  });

  // Extract awards array from API response
  const awards = awardsResponse?.data || [];
  
  // Filter awards for current student
  const myAwards = awards?.filter((award: any) => award.status === 'ACTIVE') || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your awards...</p>
        </div>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'COMPLETED':
        return 'secondary';
      case 'SUSPENDED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h1 className="text-3xl font-bold">My Awards</h1>
      </div>

      {myAwards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Awards Yet</h3>
            <p className="text-muted-foreground mb-4 text-center">
              You haven't received any scholarship awards yet. Keep applying!
            </p>
            <Button>
              Browse Available Scholarships
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {myAwards.map((award: any) => (
            <Card key={award.id} className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Award #{award.id.slice(0, 8)}
                    </CardTitle>
                    <CardDescription>
                      Awarded on {formatDate(award.awardedAt)}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(award.status)}>
                    {award.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Amount</p>
                    <p className="text-lg font-semibold text-green-600 flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatCurrency(award.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="text-sm">{award.status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Awarded Date</p>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(award.awardedAt)}
                    </p>
                  </div>
                </div>
                
                {award.academicYear && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Academic Year</p>
                    <p className="text-sm bg-muted p-2 rounded flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {award.academicYear}
                    </p>
                  </div>
                )}

                {award.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm bg-muted p-2 rounded">{award.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    Payment Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
