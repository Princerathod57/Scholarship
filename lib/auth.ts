
'use client'

import { signOut, useSession } from "next-auth/react";

export const useAuth = () => {
    const { data: session } = useSession();
  
    const isAuthenticated = () => {
        // Check if the session exists and has a user
        return session && session.user;
    }       

    const isAdmin = () => {
        // Check if the user has an admin role
        return session && session.user && session.user.role === 'ADMIN';
    };       
    
    const isFinancialAidOfficer = () => {
        // Check if the user has a financial aid officer role
        return session && session.user && session.user.role === 'FINANCIAL_AID_OFFICER';
    }   

    const isStudent = () => {
        // Check if the user has a student role
        return session && session.user && session.user.role === 'STUDENT';
    }   

    const isFaculty = () => {
        // Check if the user has a faculty role
        return session && session.user && session.user.role === 'FACULTY';
    }

    // Legacy role checkers for backward compatibility
    const isAccountant = () => {
        // Map old accountant role to financial aid officer
        return isFinancialAidOfficer();
    }   

    const isPromoter = () => {
        // Legacy promoter role - no longer applicable in scholarship system
        return false;
    }   

    const logout = () => {
        // Implement logout functionality
        if (session) {
            signOut({
                callbackUrl: '/',
                redirect: true,
            });
        }
    }   
    
    return {
        isAuthenticated,
        isAdmin,
        isFinancialAidOfficer,
        isStudent,
        isFaculty,
        isAccountant, // Legacy support
        isPromoter,   // Legacy support
        logout,
        user: session ? session.user : null,
        hasPermission: (type: string) => {
            // TODO: Implement proper permission checking based on user permissions
            // For now, return basic role-based permissions
            if (isAdmin()) return true;
            if (isFinancialAidOfficer()) {
                // Financial Aid Officers can manage applications, awards, disbursements
                const allowedPermissions = [
                    'VIEW_STUDENTS', 'MANAGE_STUDENTS',
                    'VIEW_APPLICATIONS', 'PROCESS_APPLICATIONS',
                    'VIEW_AWARDS', 'MANAGE_AWARDS',
                    'VIEW_DISBURSEMENTS', 'CREATE_DISBURSEMENTS',
                    'VIEW_SCHOLARSHIPS', 'MANAGE_SCHOLARSHIPS',
                    'VIEW_PROGRAMS', 'VIEW_FUNDS'
                ];
                return allowedPermissions.includes(type);
            }
            if (isStudent()) {
                // Students can only view their own data and apply for scholarships
                const allowedPermissions = [
                    'VIEW_OWN_APPLICATIONS', 'CREATE_APPLICATIONS',
                    'VIEW_OWN_AWARDS', 'VIEW_SCHOLARSHIPS',
                    'UPLOAD_DOCUMENTS'
                ];
                return allowedPermissions.includes(type);
            }
            if (isFaculty()) {
                // Faculty can view their advisees' information
                const allowedPermissions = [
                    'VIEW_ADVISEES', 'VIEW_SCHOLARSHIP_STATUS'
                ];
                return allowedPermissions.includes(type);
            }
            return false;
        }
    };
}