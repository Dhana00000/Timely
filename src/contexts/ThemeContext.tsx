"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("system");
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
    const [mounted, setMounted] = useState(false);

    // Initialize theme from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("timely-theme") as Theme | null;
        if (stored && ["light", "dark", "system"].includes(stored)) {
            setTheme(stored);
        }
        setMounted(true);
    }, []);

    // Resolve actual theme based on preference
    useEffect(() => {
        const resolveTheme = () => {
            if (theme === "system") {
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                setResolvedTheme(prefersDark ? "dark" : "light");
            } else {
                setResolvedTheme(theme);
            }
        };

        resolveTheme();

        // Listen for system preference changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (theme === "system") {
                resolveTheme();
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    // Apply theme to document
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        root.setAttribute("data-theme", resolvedTheme);

        // Also set class for Tailwind compatibility
        root.classList.remove("light", "dark");
        root.classList.add(resolvedTheme);

        // Store preference
        localStorage.setItem("timely-theme", theme);
    }, [theme, resolvedTheme, mounted]);

    const handleSetTheme = (newTheme: Theme) => {
        setTheme(newTheme);
    };

    // Prevent flash of wrong theme
    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme: handleSetTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
