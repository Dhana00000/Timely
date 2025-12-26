export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            events: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string | null
                    start_time: string
                    end_time: string | null
                    location: string | null
                    color: string
                    is_all_day: boolean
                    notes?: string | null // Smart notes content
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description?: string | null
                    start_time: string
                    end_time?: string | null
                    location?: string | null
                    color?: string
                    is_all_day?: boolean
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    start_time?: string
                    end_time?: string | null
                    location?: string | null
                    color?: string
                    is_all_day?: boolean
                    created_at?: string
                }
            }
            expenses: {
                Row: {
                    id: string
                    user_id: string
                    amount: number
                    description: string
                    category: string
                    type: "expense" | "income"
                    date: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    amount: number
                    description: string
                    category?: string
                    type?: "expense" | "income"
                    date?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    amount?: number
                    description?: string
                    category?: string
                    type?: "expense" | "income"
                    date?: string
                    created_at?: string
                }
            }
            habits: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    icon: string
                    color: string
                    frequency: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    icon?: string
                    color?: string
                    frequency?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    icon?: string
                    color?: string
                    frequency?: string
                    created_at?: string
                }
            }
            habit_completions: {
                Row: {
                    id: string
                    habit_id: string
                    completed_at: string
                }
                Insert: {
                    id?: string
                    habit_id: string
                    completed_at?: string
                }
                Update: {
                    id?: string
                    habit_id?: string
                    completed_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Convenience types
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];
export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type HabitInsert = Database["public"]["Tables"]["habits"]["Insert"];
export type HabitCompletion = Database["public"]["Tables"]["habit_completions"]["Row"];
