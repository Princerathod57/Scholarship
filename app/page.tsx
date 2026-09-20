'use client';

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { 
  GraduationCap, 
  Users, 
  Award, 
  BookOpen, 
  ArrowRight, 
  Search,
  DollarSign,
  FileText,
  Shield,
  Zap,
  Heart
} from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { Suspense } from "react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function HomePageContent() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  const params = useSearchParams();
  const error = params.get("error");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Don't render anything if already authenticated - let middleware handle redirects
  if(isAuthenticated()) {
    return null;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      callbackUrl: "/dashboard",
      redirectTo: "/dashboard",
    });
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-700 py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">
                {process.env.NEXT_PUBLIC_INSTITUTION_NAME || "University"} Scholarship Portal
              </h1>
            </div>
            <div className="text-white text-sm">
              <span className="opacity-90">Empowering Education Through Scholarships</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-5xl font-bold tracking-tight text-gray-900">
                      Unlock Your 
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        {" "}Educational Dreams
                      </span>
                    </h2>
                    <p className="text-xl text-gray-600 leading-relaxed">
                      Comprehensive scholarship and grant management system designed to connect 
                      deserving students with educational opportunities and funding.
                    </p>
                  </div>

                  {/* Feature Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <Search className="h-6 w-6 text-blue-600 mb-2" />
                        <CardTitle className="text-lg">Easy Discovery</CardTitle>
                        <CardDescription>
                          Find scholarships tailored to your profile and academic goals
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <Zap className="h-6 w-6 text-purple-600 mb-2" />
                        <CardTitle className="text-lg">Quick Applications</CardTitle>
                        <CardDescription>
                          Streamlined application process with document management
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <Shield className="h-6 w-6 text-green-600 mb-2" />
                        <CardTitle className="text-lg">Secure & Transparent</CardTitle>
                        <CardDescription>
                          Safe, auditable processes with real-time status tracking
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <Heart className="h-6 w-6 text-red-600 mb-2" />
                        <CardTitle className="text-lg">Support System</CardTitle>
                        <CardDescription>
                          Dedicated support for students throughout their journey
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 pt-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">500+</div>
                      <div className="text-sm text-gray-600">Active Scholarships</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">$2M+</div>
                      <div className="text-sm text-gray-600">Awarded Annually</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">95%</div>
                      <div className="text-sm text-gray-600">Student Satisfaction</div>
                    </div>
                  </div>
                </div>

                {/* Right Content - Login Form */}
                <div className="flex justify-center lg:justify-end">
                  <Card className="w-full max-w-md bg-white shadow-xl border-0">
                    <CardHeader className="text-center pb-6">
                      <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                      <CardDescription className="text-base">
                        Sign in to access your scholarship portal
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="student@university.edu" 
                                    type="email"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="Enter your password" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {!!error && (
                            <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
                              <TriangleAlert className="size-4" />
                              <p>Invalid email or password</p>
                            </div>
                          )}

                          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            Sign In <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </form>
                      </Form>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 pt-6">
                      <div className="text-sm text-muted-foreground text-center w-full">
                        Demo Access:
                      </div>
                      
                      <div className="space-y-2 w-full">
                        <div className="flex justify-between items-center p-3 rounded-lg border bg-gray-50">
                          <div>
                            <div className="font-medium text-sm">Administrator</div>
                            <div className="text-xs text-gray-600">admin@university.edu / admin123</div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => {
                            form.setValue("email", "admin@university.edu");
                            form.setValue("password", "admin123");
                          }}>
                            Use
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 rounded-lg border bg-gray-50">
                          <div>
                            <div className="font-medium text-sm">Financial Aid Officer</div>
                            <div className="text-xs text-gray-600">officer@university.edu / officer123</div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => {
                            form.setValue("email", "officer@university.edu");
                            form.setValue("password", "officer123");
                          }}>
                            Use
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 rounded-lg border bg-gray-50">
                          <div>
                            <div className="font-medium text-sm">Student</div>
                            <div className="text-xs text-gray-600">student@university.edu / student123</div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => {
                            form.setValue("email", "student@university.edu");
                            form.setValue("password", "student123");
                          }}>
                            Use
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground pt-4">
                        <a href="/forgot-password" className="hover:text-blue-600 transition-colors">
                          Forgot Password?
                        </a>
                        <span>|</span>
                        <a href="/register" className="hover:text-blue-600 transition-colors">
                          Create Account
                        </a>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Choose Our Scholarship Portal?
                </h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Built specifically for educational institutions to manage scholarships, 
                  grants, and financial aid with transparency and efficiency.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center group">
                  <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Student Management</h4>
                  <p className="text-gray-600 text-sm">
                    Comprehensive student profiles with academic tracking and eligibility management.
                  </p>
                </div>

                <div className="text-center group">
                  <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Award Processing</h4>
                  <p className="text-gray-600 text-sm">
                    Automated award calculations and disbursement tracking with audit trails.
                  </p>
                </div>

                <div className="text-center group">
                  <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Document Management</h4>
                  <p className="text-gray-600 text-sm">
                    Secure document storage and verification with digital signatures.
                  </p>
                </div>

                <div className="text-center group">
                  <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                    <DollarSign className="h-8 w-8 text-orange-600" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Fund Management</h4>
                  <p className="text-gray-600 text-sm">
                    Complete financial oversight with budget tracking and reporting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <GraduationCap className="h-6 w-6" />
                  <span className="text-lg font-semibold">
                    {process.env.NEXT_PUBLIC_INSTITUTION_NAME || "University"} Scholarships
                  </span>
                </div>
                <p className="text-gray-400 mb-4">
                  Empowering students through accessible education funding and comprehensive 
                  scholarship management.
                </p>
                <div className="text-sm text-gray-400">
                  <p>Support: {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "scholarships@university.edu"}</p>
                  <p>Phone: {process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+1-555-123-4567"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="/scholarships" className="hover:text-white transition-colors">Browse Scholarships</a></li>
                  <li><a href="/apply" className="hover:text-white transition-colors">Apply Now</a></li>
                  <li><a href="/requirements" className="hover:text-white transition-colors">Requirements</a></li>
                  <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="/guide" className="hover:text-white transition-colors">Application Guide</a></li>
                  <li><a href="/deadlines" className="hover:text-white transition-colors">Important Dates</a></li>
                  <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>
                &copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_INSTITUTION_NAME || "University"} 
                Scholarship Management System. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}