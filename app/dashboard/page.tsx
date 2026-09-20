"use client"
import React from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, FileText, ClipboardList, GraduationCap, ExternalLink, TrendingUp, Calendar, Award, Zap, ArrowRight } from "lucide-react"
import StudentDashboard from "@/app/student/dashboard/page"
import { useGetApplications } from "@/app/features/applications/use-get-applications"
import { useGetStudents } from "@/app/features/students/use-get-students" 
import { useGetScholarships } from "@/app/features/scholarships/use-get-scholarships"
import { useGetMessages } from "@/app/features/messages"

const DashboardPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Fetch real data
  const { data: applicationsData, isLoading: applicationsLoading } = useGetApplications()
  const { data: studentsData, isLoading: studentsLoading } = useGetStudents()
  const { data: scholarshipsData, isLoading: scholarshipsLoading } = useGetScholarships()
  const { data: messagesData, isLoading: messagesLoading } = useGetMessages(session?.user?.id, false)

  // Calculate real statistics
  const applications = applicationsData?.data || []
  const students = studentsData?.data || []
  const scholarships = scholarshipsData?.data || []
  const messages = messagesData?.data || []

  const adminStats = {
    totalApplications: applications.length,
    applicationGrowth: applications.filter((app: any) => {
      const createdDate = new Date(app.createdAt)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return createdDate >= thirtyDaysAgo
    }).length,
    activeStudents: students.filter((student: any) => student.status === 'ACTIVE' || !student.status).length,
    studentGrowth: students.filter((student: any) => {
      const createdDate = new Date(student.createdAt || student.enrollmentDate)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return createdDate >= thirtyDaysAgo
    }).length,
    scholarshipPrograms: scholarships.length,
    activeScholarships: scholarships.filter((s: any) => s.status === 'ACTIVE').length,
    awardsDistributed: applications.filter((app: any) => app.status === 'APPROVED').length,
    recentAwards: applications.filter((app: any) => {
      if (app.status !== 'APPROVED') return false
      const approvedDate = new Date(app.updatedAt)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return approvedDate >= thirtyDaysAgo
    }).length
  }

  // Faculty-specific stats
  const currentUserId = session?.user?.id
  const facultyApplications = applications.filter((app: any) => 
    app.student?.advisor?.id === currentUserId || 
    app.student?.advisorId === currentUserId
  )
  const facultyStudents = students.filter((student: any) => 
    student.advisor?.id === currentUserId || 
    student.advisorId === currentUserId
  )
  const unreadMessages = messages.filter((msg: any) => !msg.read && msg.recipientId === currentUserId)
  const pendingRecommendations = facultyApplications.filter((app: any) => 
    app.status === 'PENDING' || app.status === 'UNDER_REVIEW'
  )

  const facultyStats = {
    activeAdvisees: facultyStudents.length,
    newAdviseesThisSemester: facultyStudents.filter((student: any) => {
      const enrolledDate = new Date(student.createdAt || student.enrollmentDate)
      const semesterStart = new Date(new Date().getFullYear(), new Date().getMonth() - 4) // Rough semester calculation
      return enrolledDate >= semesterStart
    }).length,
    totalAwards: facultyApplications.filter((app: any) => app.status === 'APPROVED').length,
    awardsThisYear: facultyApplications.filter((app: any) => {
      if (app.status !== 'APPROVED') return false
      const approvedDate = new Date(app.updatedAt)
      const yearStart = new Date(new Date().getFullYear(), 0, 1)
      return approvedDate >= yearStart
    }).length,
    pendingRecommendations: pendingRecommendations.length,
    activeApplications: facultyApplications.filter((app: any) => 
      app.status === 'PENDING' || app.status === 'UNDER_REVIEW' || app.status === 'SUBMITTED'
    ).length,
    submittedApplications: facultyApplications.filter((app: any) => app.status === 'SUBMITTED').length
  }

  const isLoading = applicationsLoading || studentsLoading || scholarshipsLoading

  // Handle loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/20 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Loading your dashboard</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Preparing your personalized experience...</p>
          </div>
        </div>
      </div>
    )
  }

  // Redirect to login if no session
  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  // Route to appropriate dashboard based on user role
  const userRole = session?.user?.role

  switch (userRole) {
    case 'STUDENT':
      return <StudentDashboard />
    case 'ADMIN':
    case 'FINANCIAL_AID_OFFICER':
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
          <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 md:p-8 text-white shadow-2xl">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-blue-100 text-base md:text-lg font-medium">
                      Scholarship Management System
                    </p>
                    <p className="text-blue-200 max-w-2xl text-sm md:text-base">
                      Welcome to your comprehensive admin panel. Monitor applications, manage students, and oversee scholarship programs with powerful tools and insights.
                    </p>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Award className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-20 md:-right-40 -top-20 md:-top-40 w-40 md:w-80 h-40 md:h-80 bg-white/5 rounded-full"></div>
              <div className="absolute -left-10 md:-left-20 -bottom-10 md:-bottom-20 w-30 md:w-60 h-30 md:h-60 bg-white/5 rounded-full"></div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Applications</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">{adminStats.totalApplications.toLocaleString()}</p>
                      <div className="flex items-center space-x-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">+{adminStats.applicationGrowth} this month</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-slate-700 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Students</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">{adminStats.activeStudents.toLocaleString()}</p>
                      <div className="flex items-center space-x-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">+{adminStats.studentGrowth} this month</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-700 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Scholarship Programs</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">{adminStats.scholarshipPrograms}</p>
                      <div className="flex items-center space-x-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">{adminStats.activeScholarships} active</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-orange-50 dark:from-slate-800 dark:to-slate-700 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Awards Distributed</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">{adminStats.awardsDistributed}</p>
                      <div className="flex items-center space-x-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">+{adminStats.recentAwards} this month</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Trophy className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 hover:scale-105 overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <ClipboardList className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">Applications</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Review and manage scholarship applications</p>
                    </div>
                    <Link href="/applications" className="block">
                      <Button className="w-full group-hover:bg-blue-700 transition-colors duration-300">
                        Manage Applications
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 hover:scale-105 overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">Students</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">View and manage student records</p>
                    </div>
                    <Link href="/students" className="block">
                      <Button variant="outline" className="w-full group-hover:bg-green-50 group-hover:border-green-300 transition-colors duration-300">
                        View Students
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 hover:scale-105 overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">Scholarships</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Manage scholarship programs</p>
                    </div>
                    <Link href="/scholarships" className="block">
                      <Button variant="outline" className="w-full group-hover:bg-purple-50 group-hover:border-purple-300 transition-colors duration-300">
                        View Programs
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 hover:scale-105 overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">Awards</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Track scholarship awards and recipients</p>
                    </div>
                    <Link href="/awards" className="block">
                      <Button variant="outline" className="w-full group-hover:bg-orange-50 group-hover:border-orange-300 transition-colors duration-300">
                        View Awards
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )
    case 'FACULTY':
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
          <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 md:p-8 text-white shadow-2xl">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                      <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                        Faculty Portal
                      </Badge>
                      <Badge className="bg-green-500/20 text-green-100 border-green-300/30">
                        Online
                      </Badge>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Welcome back, {session?.user?.name}</h1>
                    <p className="text-indigo-100 text-base md:text-lg font-medium">
                      Faculty Dashboard
                    </p>
                    <p className="text-indigo-200 max-w-2xl text-sm md:text-base">
                      Manage your advisees, track scholarship applications, and write recommendations with our comprehensive faculty tools.
                    </p>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-32 h-32 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <GraduationCap className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-16 md:-right-32 -top-16 md:-top-32 w-32 md:w-64 h-32 md:h-64 bg-white/5 rounded-full"></div>
              <div className="absolute -left-8 md:-left-16 -bottom-8 md:-bottom-16 w-24 md:w-48 h-24 md:h-48 bg-white/5 rounded-full"></div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-4">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Advisees</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">{facultyStats.activeAdvisees}</p>
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium">{facultyStats.newAdviseesThisSemester} new this semester</span>
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-slate-700 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Awards</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">{facultyStats.totalAwards}</p>
                      <div className="flex items-center space-x-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">+{facultyStats.awardsThisYear} this year</span>
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Trophy className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-orange-50 dark:from-slate-800 dark:to-slate-700 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Recommendations</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">{facultyStats.pendingRecommendations}</p>
                      <div className="flex items-center space-x-1 text-orange-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">Due this week</span>
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-700 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Applications</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">{facultyStats.activeApplications}</p>
                      <div className="flex items-center space-x-1 text-purple-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">{facultyStats.submittedApplications} submitted</span>
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <ClipboardList className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
              <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white dark:bg-slate-800 hover:scale-105 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white">Student Advisees</h3>
                        <Badge variant="secondary" className="text-xs">{facultyStats.activeAdvisees} Active</Badge>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      View and manage your student advisees, track their scholarship applications, send messages, and monitor their academic progress.
                    </p>
                    <Link href="/faculty/advisees" className="block">
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        View All Advisees
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white dark:bg-slate-800 hover:scale-105 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-600"></div>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white">Recommendations</h3>
                        <Badge variant="destructive" className="text-xs">{facultyStats.pendingRecommendations} Pending</Badge>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Write and manage recommendation letters for your students' scholarship applications with our streamlined process.
                    </p>
                    <Link href="/faculty/recommendations" className="block">
                      <Button variant="outline" className="w-full border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 text-orange-600 transition-all duration-300">
                        Manage Recommendations
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white dark:bg-slate-800 hover:scale-105 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <GraduationCap className="w-8 h-8 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white">Scholarship Programs</h3>
                        <Badge variant="secondary" className="text-xs">{adminStats.scholarshipPrograms} Available</Badge>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Browse scholarship programs and track your advisees' applications, awards, and success rates across different programs.
                    </p>
                    <Link href="/faculty/scholarships" className="block">
                      <Button variant="outline" className="w-full border-2 border-green-200 hover:bg-green-50 hover:border-green-300 text-green-600 transition-all duration-300">
                        View Programs
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )
    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-center p-8">
            <div className="space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome to Your Dashboard</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Your personalized experience is being prepared
                </p>
                <p className="text-slate-500 dark:text-slate-500 max-w-md mx-auto">
                  If you continue to see this message, please contact your system administrator for assistance with account setup.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
                  Contact Support
                </Button>
                <Button variant="outline" className="border-2">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
  }
}

export default DashboardPage
