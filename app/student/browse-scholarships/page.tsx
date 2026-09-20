"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetScholarships } from "@/app/features/scholarships/use-get-scholarships";
import { Search, BookOpen, Calendar, DollarSign, Users, ExternalLink, Filter } from "lucide-react";
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

export default function BrowseScholarshipsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const { data: scholarshipsData, isLoading } = useGetScholarships({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading scholarships...</p>
        </div>
      </div>
    );
  }

  const scholarships = scholarshipsData?.data || [];
  const availableScholarships = scholarships?.filter((scholarship: any) => 
    scholarship.status === 'ACTIVE' || scholarship.status === 'OPEN'
  ) || [];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'OPEN':
        return 'default';
      case 'CLOSED':
        return 'secondary';
      case 'DRAFT':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Browse Scholarships</h1>
      </div>

      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scholarships..."
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
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="academic">Academic Merit</SelectItem>
                <SelectItem value="need-based">Need-Based</SelectItem>
                <SelectItem value="athletic">Athletic</SelectItem>
                <SelectItem value="community">Community Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {availableScholarships.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Scholarships Available</h3>
            <p className="text-muted-foreground mb-4 text-center">
              There are no scholarships matching your current filters.
            </p>
            <Button onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setCategoryFilter("all");
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {availableScholarships.map((scholarship: any) => (
            <Card key={scholarship.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {scholarship.name}
                    </CardTitle>
                    <CardDescription>
                      {scholarship.description}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(scholarship.status)}>
                    {scholarship.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Award Amount</p>
                    <p className="text-lg font-semibold text-green-600 flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {scholarship.maxAmount ? formatCurrency(scholarship.maxAmount) : 'Varies'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Application Deadline</p>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {scholarship.applicationDeadline ? formatDate(scholarship.applicationDeadline) : 'Rolling'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Awards Available</p>
                    <p className="text-sm flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {scholarship.maxRecipients || 'Multiple'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="text-sm">{scholarship.category || 'General'}</p>
                  </div>
                </div>
                
                {scholarship.eligibilityCriteria && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Eligibility Criteria</p>
                    <p className="text-sm bg-muted p-3 rounded">{scholarship.eligibilityCriteria}</p>
                  </div>
                )}

                {scholarship.requirements && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Requirements</p>
                    <p className="text-sm bg-muted p-3 rounded">{scholarship.requirements}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link href={`/student/apply/${scholarship.id}`}>
                    <Button>
                      Apply Now
                    </Button>
                  </Link>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Details
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
