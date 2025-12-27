"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
    children: React.ReactNode;
}

/**
 * AuthGuard - Protects routes from unauthenticated access
 * Redirects to /auth if user is not logged in
 */
export default function AuthGuard({ children }: AuthGuardProps) {
    const { user, loading, isConfigured } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Only redirect after loading is complete
        if (!loading && !user) {
            console.log("[AuthGuard] No user found, redirecting to /auth");
            router.replace("/auth");
        }
    }, [user, loading, router]);

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                background: "var(--color-bg-base, #000)",
                color: "var(--color-text-primary, #fff)",
                gap: "1rem",
            }}>
                <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
                <p>Verifying authentication...</p>
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // If no user after loading, show redirect message (brief moment before redirect)
    if (!user) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                background: "var(--color-bg-base, #000)",
                color: "var(--color-text-primary, #fff)",
                gap: "1rem",
            }}>
                <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
                <p>Please log in to continue...</p>
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // User is authenticated - render protected content
    return <>{children}</>;
}
