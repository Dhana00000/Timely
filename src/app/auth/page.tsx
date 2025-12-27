"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import styles from "./page.module.css";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { signIn, signUp, isConfigured } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (!isConfigured) {
                // Demo mode - check if new user (signup)
                if (!isLogin) {
                    router.push("/onboarding");
                } else {
                    router.push("/dashboard");
                }
                return;
            }

            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) throw error;
                router.push("/dashboard");
            } else {
                const { error } = await signUp(email, password, name);
                if (error) throw error;
                // New users go to onboarding
                router.push("/onboarding");
            }
        } catch (err: any) {
            // Provide helpful error messages
            let errorMessage = err.message || "Authentication failed";

            // Check for specific Supabase errors
            if (errorMessage.includes("confirmation") || errorMessage.includes("email")) {
                errorMessage = "Email confirmation is currently limited. Please use Social Login (Google/Outlook) or contact support.";
            } else if (errorMessage.includes("already registered") || errorMessage.includes("already exists")) {
                errorMessage = "This email is already registered. Try signing in instead.";
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: "google" | "azure") => {
        setError("");
        setLoading(true);

        try {
            if (!isConfigured) {
                // Demo mode
                router.push("/dashboard");
                return;
            }

            if (provider === "google") {
                // Use AuthContext's signInWithGoogle which has proper account picker params
                const { signInWithGoogle } = await import("@/contexts/AuthContext").then(m => ({ signInWithGoogle: null }));

                // Sign out first to force fresh account selection
                await supabase.auth.signOut();

                const { error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/dashboard`,
                        scopes: "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events",
                        queryParams: {
                            access_type: "offline",
                            prompt: "select_account consent",
                        },
                    },
                });
                if (error) throw error;
            } else {
                // Azure/Outlook OAuth
                await supabase.auth.signOut();

                const { error } = await supabase.auth.signInWithOAuth({
                    provider: "azure",
                    options: {
                        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/dashboard`,
                        scopes: "openid profile email",
                        queryParams: {
                            prompt: "select_account",
                        },
                    },
                });
                if (error) throw error;
            }
        } catch (err: any) {
            // Provide helpful error messages for OAuth
            let errorMessage = err.message || "Social login failed";

            if (errorMessage.includes("provider is not enabled") || errorMessage.includes("Unsupported provider")) {
                errorMessage = `${provider === 'google' ? 'Google' : 'Outlook'} OAuth is not enabled yet. Please enable it in your Supabase Dashboard → Authentication → Providers, or use email/password signup.`;
            } else if (errorMessage.includes("redirect")) {
                errorMessage = "OAuth redirect URL mismatch. Check your provider configuration.";
            }

            setError(errorMessage);
            setLoading(false);
        }
    };

    const handleDemoLogin = () => {
        router.push("/dashboard");
    };

    return (
        <div className={styles.container}>
            {/* Left - Brand */}
            <div className={styles.brand}>
                <div className={styles.brandBackground} />
                <div className={styles.brandContent}>
                    <div className={styles.logoWrapper}>
                        <div className={styles.calendarIconWrapper}>
                            <Calendar className={styles.calendarIcon} size={48} strokeWidth={1.5} />
                        </div>
                        <span className={styles.logoText}>Timely</span>
                    </div>
                    <h1 className={styles.tagline}>Your Life, In Sync.</h1>
                    <p className={styles.description}>
                        The intelligent operating system that harmonizes your time, money, and habits into one seamless flow.
                    </p>
                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>✨</span> Intelligent Scheduling
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>💎</span> Financial Clarity
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>🌱</span> Habit Mastery
                        </div>
                    </div>
                </div>
            </div>

            {/* Right - Auth Form */}
            <div className={styles.auth}>
                <div className={styles.authCard}>
                    <h2 className={styles.authTitle}>
                        {isLogin ? "Welcome back" : "Create account"}
                    </h2>
                    <p className={styles.authSubtitle}>
                        {isLogin
                            ? "Sign in to continue to Timely"
                            : "Start your productivity journey"
                        }
                    </p>

                    {error && (
                        <div className={styles.error}>{error}</div>
                    )}

                    {/* Social Logins */}
                    <div className={styles.socialButtons}>
                        <button
                            className={styles.socialBtn}
                            onClick={() => handleSocialLogin("google")}
                            disabled={loading}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>
                        <button
                            className={styles.socialBtn}
                            onClick={() => handleSocialLogin("azure")}
                            disabled={loading}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="#00A4EF" d="M11.4 2L2 11.4V22h9.6L22 12.6V2H11.4z" />
                            </svg>
                            Continue with Outlook
                        </button>
                    </div>

                    <div className={styles.divider}>
                        <span>or</span>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {!isLogin && (
                            <div className={styles.inputGroup}>
                                <User size={18} className={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="Full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={!isLogin}
                                    className={styles.input}
                                />
                            </div>
                        )}
                        <div className={styles.inputGroup}>
                            <Mail size={18} className={styles.inputIcon} />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                autoComplete={isLogin ? "current-password" : "new-password"}
                                className={styles.input}
                            />
                            <button
                                type="button"
                                className={styles.showPassword}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {isLogin && (
                            <button type="button" className={styles.forgotBtn}>
                                Forgot password?
                            </button>
                        )}

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 size={20} className={styles.spinner} />
                            ) : (
                                <>
                                    {isLogin ? "Sign in" : "Create account"}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className={styles.switchAuth}>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? "Sign up" : "Sign in"}
                        </button>
                    </div>

                    {/* Demo Mode */}
                    <button className={styles.demoBtn} onClick={handleDemoLogin}>
                        Try demo mode →
                    </button>
                </div>
            </div>
        </div>
    );
}
