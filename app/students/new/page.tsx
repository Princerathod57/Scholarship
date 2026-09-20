"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, GraduationCap, UserPlus, Sparkles, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

import { useCreateStudent } from "@/app/features/students";
import { useGetPrograms } from "@/app/features/programs";

const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  studentId: z.string().min(1, "Student ID is required"),
  programId: z.string().optional(),
  gpa: z.number().min(0).max(4.0).optional(),
  enrollmentDate: z.string().optional(),
  graduationDate: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

export default function NewStudentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createStudent = useCreateStudent();
  const { data: programsData, isLoading: programsLoading } = useGetPrograms();

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      email: "",
      studentId: "",
      programId: "",
      gpa: undefined,
      enrollmentDate: "",
      graduationDate: "",
      phone: "",
      address: "",
    },
  });

  const handleSubmit = async (data: StudentFormData) => {
    try {
      // Convert string dates to proper format if provided
      const submitData = {
        ...data,
        gpa: data.gpa || undefined,
        enrollmentDate: data.enrollmentDate 
          ? new Date(data.enrollmentDate).toISOString() 
          : undefined,
        graduationDate: data.graduationDate 
          ? new Date(data.graduationDate).toISOString() 
          : undefined,
        programId: data.programId || undefined,
      };

      await createStudent.mutateAsync(submitData);
      toast({
        title: "Success",
        description: "Student created successfully",
      });
      router.push("/students");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create student",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" asChild className="h-12 w-12 rounded-xl hover:bg-white/80">
            <Link href="/students">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
              <UserPlus className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Add New Student
              </h1>
              <p className="text-muted-foreground text-lg flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4 text-blue-500" />
                Create a new student record in the system
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600">
                  <User className="h-6 w-6" />
                </div>
                Student Information
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Enter the student's personal and academic details to create their profile
              </CardDescription>
            </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600">
                      <User className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Full Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              className="h-12 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="studentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Student ID *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="STU001" 
                              className="h-12 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">
                            Unique identifier for the student
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">Email Address *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                            <Input 
                              placeholder="john.doe@university.edu" 
                              className="h-12 pl-12 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs text-gray-500 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          This will be used for login and notifications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                              <Input 
                                placeholder="+1 (555) 123-4567" 
                                className="h-12 pl-12 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="programId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Academic Program</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200">
                                <SelectValue placeholder="Select a program" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {programsData?.data?.map((program: any) => (
                                  <SelectItem key={program.id} value={program.id} className="rounded-lg">
                                    {program.name} ({program.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                            <Textarea 
                              placeholder="123 University Ave, City, State 12345"
                              className="pl-12 resize-none rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
                              rows={3}
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Academic Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Academic Information</h3>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="gpa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">GPA</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              min="0"
                              max="4.0"
                              placeholder="3.50"
                              className="h-12 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">
                            Current GPA (0.0 - 4.0)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="enrollmentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Enrollment Date</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                              <Input 
                                type="date" 
                                className="h-12 pl-12 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="graduationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Expected Graduation</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                              <Input 
                                type="date" 
                                className="h-12 pl-12 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
                  <Button type="button" variant="outline" asChild className="h-12 px-8 rounded-xl border-gray-300 hover:bg-gray-50 transition-all duration-200">
                    <Link href="/students">Cancel</Link>
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createStudent.isPending}
                    className="h-12 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 min-w-[140px]"
                  >
                    {createStudent.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Create Student
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
