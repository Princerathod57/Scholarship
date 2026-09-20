import { ReactNode } from "react";

interface FacultyLayoutProps {
  children: ReactNode;
}

export default function FacultyLayout({ children }: FacultyLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto py-6">
        {children}
      </div>
    </div>
  );
}
