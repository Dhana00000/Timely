"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Event, EventInsert, Expense, ExpenseInsert, Habit, HabitInsert } from "@/lib/database.types";
import { useAuth } from "./AuthContext";

// Demo data
const demoEvents: Event[] = [
    {
        id: "1",
        user_id: "demo-user-id",
        title: "Design Review with Sarah",
        description: "Review the new dashboard designs",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
        location: "Zoom",
        color: "#0a84ff",
        is_all_day: false,
        created_at: new Date().toISOString(),
    },
    {
        id: "2",
        user_id: "demo-user-id",
        title: "Lunch with Team",
        description: "Weekly team lunch",
        start_time: new Date(Date.now() + 7200000).toISOString(),
        end_time: new Date(Date.now() + 10800000).toISOString(),
        location: "The Local Kitchen",
        color: "#30d158",
        is_all_day: false,
        created_at: new Date().toISOString(),
    },
];

const demoExpenses: Expense[] = [
    { id: "1", user_id: "demo-user-id", amount: 45.20, description: "Grocery Shopping", category: "Food", type: "expense", date: new Date().toISOString().split("T")[0], created_at: new Date().toISOString() },
    { id: "2", user_id: "demo-user-id", amount: 25.00, description: "Payment from John", category: "Transfer", type: "income", date: new Date().toISOString().split("T")[0], created_at: new Date().toISOString() },
    { id: "3", user_id: "demo-user-id", amount: 18.50, description: "Uber Ride", category: "Transport", type: "expense", date: new Date().toISOString().split("T")[0], created_at: new Date().toISOString() },
];

const demoHabits: (Habit & { completed: boolean; streak: number })[] = [
    { id: "1", user_id: "demo-user-id", name: "Gym Workout", icon: "💪", color: "#f59e0b", frequency: "daily", created_at: new Date().toISOString(), completed: true, streak: 12 },
    { id: "2", user_id: "demo-user-id", name: "Read 30 mins", icon: "📚", color: "#3b82f6", frequency: "daily", created_at: new Date().toISOString(), completed: false, streak: 8 },
    { id: "3", user_id: "demo-user-id", name: "Meditation", icon: "🧘", color: "#8b5cf6", frequency: "daily", created_at: new Date().toISOString(), completed: false, streak: 3 },
    { id: "4", user_id: "demo-user-id", name: "Drink Water", icon: "💧", color: "#06b6d4", frequency: "daily", created_at: new Date().toISOString(), completed: true, streak: 24 },
];

interface DataContextType {
    // Events
    events: Event[];
    createEvent: (event: Omit<EventInsert, "user_id">) => Promise<Event | null>;
    updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    addEventLocally: (event: Event) => void; // Add event to local state

    // Expenses
    expenses: Expense[];
    addExpense: (expense: Omit<ExpenseInsert, "user_id">) => Promise<Expense | null>;
    addExpenseLocally: (expense: Expense) => void; // Add expense to local state
    deleteExpense: (id: string) => Promise<void>;

    // Habits
    habits: (Habit & { completed: boolean; streak: number })[];
    addHabit: (habit: Omit<HabitInsert, "user_id">) => Promise<Habit | null>;
    addHabitLocally: (habit: Habit & { completed: boolean; streak: number }) => void; // Add habit to local state
    toggleHabit: (id: string) => Promise<void>;
    deleteHabit: (id: string) => Promise<void>;

    // Loading states
    loading: boolean;
    refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const isConfigured = isSupabaseConfigured();

    console.log('🔵 DataProvider initialized - user:', user);
    console.log('🔵 Is Supabase configured:', isConfigured);

    // Start with empty arrays when Supabase is configured, demo data only for unconfigured mode
    const [events, setEvents] = useState<Event[]>(isConfigured ? [] : demoEvents);
    const [expenses, setExpenses] = useState<Expense[]>(isConfigured ? [] : demoExpenses);
    const [habits, setHabits] = useState<(Habit & { completed: boolean; streak: number })[]>(isConfigured ? [] : demoHabits);
    const [loading, setLoading] = useState(isConfigured);
    const [hasLoadedData, setHasLoadedData] = useState(false);

    // Internal refresh function
    const refreshDataInternal = async () => {
        if (!isConfigured || !user) return;

        console.log('🟡 refreshDataInternal called for user:', user.id);
        setLoading(true);
        try {
            // Fetch events
            const { data: eventsData, error: eventsError } = await supabase
                .from("events")
                .select("*")
                .eq("user_id", user.id)
                .order("start_time", { ascending: true });

            console.log('📊 Events fetched:', eventsData?.length || 0, 'Error:', eventsError);
            if (eventsData) setEvents(eventsData as Event[]);

            // Fetch expenses
            const { data: expensesData, error: expensesError } = await supabase
                .from("expenses")
                .select("*")
                .eq("user_id", user.id)
                .order("date", { ascending: false });

            console.log('📊 Expenses fetched:', expensesData?.length || 0, 'Error:', expensesError);
            if (expensesData) setExpenses(expensesData as Expense[]);

            // Fetch habits with completions
            const { data: habitsData, error: habitsError } = await supabase
                .from("habits")
                .select("*")
                .eq("user_id", user.id);

            console.log('📊 Habits fetched:', habitsData?.length || 0, 'Error:', habitsError);
            if (habitsData) {
                const today = new Date().toISOString().split("T")[0];
                const habitsWithStatus = await Promise.all(
                    (habitsData as Habit[]).map(async (habit) => {
                        const { data: completions } = await supabase
                            .from("habit_completions")
                            .select("*")
                            .eq("habit_id", habit.id)
                            .order("completed_at", { ascending: false });

                        const completed = (completions as { completed_at: string }[] | null)?.some(c => c.completed_at === today) ?? false;
                        const streak = completions?.length ?? 0;
                        return { ...habit, completed, streak };
                    })
                );
                setHabits(habitsWithStatus);
            }
            console.log('✅ Data refresh complete');
        } catch (error) {
            console.error('❌ Error refreshing data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Track user changes and load data when user becomes authenticated
    useEffect(() => {
        console.log('🔵 User state changed:', user);

        // When user becomes authenticated and we haven't loaded data yet, fetch real data
        if (user && isConfigured && !hasLoadedData) {
            console.log('🟢 User authenticated, fetching real data from Supabase...');
            setHasLoadedData(true);
            refreshDataInternal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, isConfigured, hasLoadedData]);

    const refreshData = useCallback(async () => {
        await refreshDataInternal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConfigured, user]);

    // Events
    const createEvent = async (event: Omit<EventInsert, "user_id">): Promise<Event | null> => {
        console.log('🔵 createEvent called with:', event);
        console.log('🔵 Current user:', user);

        if (!user) {
            console.error('❌ No user found - cannot create event');
            return null;
        }

        const newEvent: Event = {
            id: crypto.randomUUID(),
            user_id: user.id,
            ...event,
            color: event.color || "#0a84ff",
            is_all_day: event.is_all_day || false,
            created_at: new Date().toISOString(),
        } as Event;

        console.log('🔵 New event object:', newEvent);
        console.log('🔵 Is Supabase configured:', isConfigured);

        if (isConfigured) {
            const { data, error } = await supabase.from("events").insert(newEvent as any).select().single();
            if (error) {
                console.error('❌ Supabase error:', error);
                return null;
            }
            console.log('✅ Event created in Supabase:', data);
            setEvents(prev => {
                const updated = [...prev, data as Event];
                console.log('🟢 Updated events array (length):', updated.length);
                return updated;
            });
            return data as Event;
        } else {
            console.log('✅ Creating event in demo mode');
            setEvents(prev => {
                const updated = [...prev, newEvent];
                console.log('🔵 Updated events array:', updated);
                console.log('🔵 Total events now:', updated.length);
                return updated;
            });
            return newEvent;
        }
    };

    const updateEvent = async (id: string, updates: Partial<Event>) => {
        if (isConfigured) {
            await supabase.from("events").update(updates as any).eq("id", id);
        }
        setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    };

    const deleteEvent = async (id: string) => {
        if (isConfigured) {
            await supabase.from("events").delete().eq("id", id);
        }
        setEvents(prev => prev.filter(e => e.id !== id));
    };

    // Expenses
    const addExpense = async (expense: Omit<ExpenseInsert, "user_id">): Promise<Expense | null> => {
        if (!user) return null;

        const newExpense: Expense = {
            id: crypto.randomUUID(),
            user_id: user.id,
            ...expense,
            category: expense.category || "General",
            type: expense.type || "expense",
            date: expense.date || new Date().toISOString().split("T")[0],
            created_at: new Date().toISOString(),
        } as Expense;

        if (isConfigured) {
            const { data, error } = await supabase.from("expenses").insert(newExpense as any).select().single();
            if (error) { console.error(error); return null; }
            setExpenses(prev => [data as Expense, ...prev]);
            return data as Expense;
        } else {
            setExpenses(prev => [newExpense, ...prev]);
            return newExpense;
        }
    };

    const deleteExpense = async (id: string) => {
        if (isConfigured) {
            await supabase.from("expenses").delete().eq("id", id);
        }
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    // Habits
    const addHabit = async (habit: Omit<HabitInsert, "user_id">): Promise<Habit | null> => {
        if (!user) return null;

        const newHabit: Habit = {
            id: crypto.randomUUID(),
            user_id: user.id,
            ...habit,
            icon: habit.icon || "🎯",
            color: habit.color || "#30d158",
            frequency: habit.frequency || "daily",
            created_at: new Date().toISOString(),
        } as Habit;

        if (isConfigured) {
            const { data, error } = await supabase.from("habits").insert(newHabit as any).select().single();
            if (error) { console.error(error); return null; }
            setHabits(prev => [...prev, { ...(data as Habit), completed: false, streak: 0 }]);
            return data as Habit;
        } else {
            setHabits(prev => [...prev, { ...newHabit, completed: false, streak: 0 }]);
            return newHabit;
        }
    };

    const toggleHabit = async (id: string) => {
        const habit = habits.find(h => h.id === id);
        if (!habit) return;

        const today = new Date().toISOString().split("T")[0];

        if (isConfigured) {
            if (habit.completed) {
                await supabase.from("habit_completions").delete().eq("habit_id", id).eq("completed_at", today);
            } else {
                await supabase.from("habit_completions").insert({ habit_id: id, completed_at: today } as any);
            }
        }

        setHabits(prev => prev.map(h =>
            h.id === id
                ? { ...h, completed: !h.completed, streak: !h.completed ? h.streak + 1 : Math.max(0, h.streak - 1) }
                : h
        ));
    };

    const deleteHabit = async (id: string) => {
        if (isConfigured) {
            await supabase.from("habit_completions").delete().eq("habit_id", id);
            await supabase.from("habits").delete().eq("id", id);
        }
        setHabits(prev => prev.filter(h => h.id !== id));
    };

    // Local add functions - for adding items directly to state without Supabase
    const addEventLocally = (event: Event) => {
        setEvents(prev => [...prev, event]);
    };

    const addExpenseLocally = (expense: Expense) => {
        setExpenses(prev => [expense, ...prev]);
    };

    const addHabitLocally = (habit: Habit & { completed: boolean; streak: number }) => {
        setHabits(prev => [...prev, habit]);
    };

    return (
        <DataContext.Provider value={{
            events, createEvent, updateEvent, deleteEvent, addEventLocally,
            expenses, addExpense, addExpenseLocally, deleteExpense,
            habits, addHabit, addHabitLocally, toggleHabit, deleteHabit,
            loading, refreshData,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
}
