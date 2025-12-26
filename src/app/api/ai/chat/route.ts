import { NextRequest, NextResponse } from "next/server";
import { parseNaturalLanguage, formatConfirmation } from "@/lib/nlp-parser";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { generateLumiResponse } from "@/lib/gemini";

export async function POST(request: NextRequest) {
    try {
        const { message, userId } = await request.json();

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        console.log("[Lumi] Processing:", message, "UserId:", userId);

        // Parse the natural language input
        const parsed = parseNaturalLanguage(message);
        console.log("[Lumi] Parsed:", JSON.stringify(parsed, null, 2));

        // Handle GREETING queries
        if (parsed.type === 'query' && parsed.queryType === 'greeting') {
            const greetings = [
                "Hi! 👋 I'm Lumi, your personal AI assistant!",
                "Hello! 🌟 Ready to help organize your life!",
                "Hey there! ✨ What can I do for you today?",
                "Hi! 💫 Let's make today productive!",
            ];
            const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

            return NextResponse.json({
                response: `${randomGreeting}\n\nI can help you:\n• Schedule events and meetings\n• Log expenses\n• Track habits\n• Check your calendar\n\nTry saying something like "Schedule meeting tomorrow at 3pm" or "What's on my calendar today?"`
            });
        }

        // Handle CALENDAR queries
        if (parsed.type === 'query' && parsed.queryType === 'calendar') {
            console.log("[Lumi] Processing calendar query, queryDate:", parsed.queryDate);

            // Demo mode
            if (!userId || userId === "demo-user-id") {
                return NextResponse.json({
                    response: "📅 You have 3 events today:\n• Design Review with Sarah (2:00 PM)\n• Lunch with Team (12:00 PM)\n• Focus Time (3:00 PM)\n\nVisit your calendar to see more details! (demo)"
                });
            }

            // Real user - fetch from Supabase
            if (isSupabaseConfigured()) {
                try {
                    // Use parsed queryDate or default to today
                    const queryDate = parsed.queryDate ? new Date(parsed.queryDate) : new Date();
                    queryDate.setHours(0, 0, 0, 0);
                    const nextDay = new Date(queryDate);
                    nextDay.setDate(nextDay.getDate() + 1);

                    const dateLabel = queryDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                    });

                    console.log(`[Lumi] Fetching events from ${queryDate.toISOString()} to ${nextDay.toISOString()}`);

                    const { data: events, error } = await supabase
                        .from("events")
                        .select("*")
                        .eq("user_id", userId)
                        .gte("start_time", queryDate.toISOString())
                        .lt("start_time", nextDay.toISOString())
                        .order("start_time", { ascending: true });

                    if (error) {
                        console.error("[Lumi] Error fetching events:", error);
                        return NextResponse.json({
                            response: "I had trouble checking your calendar. Try again?"
                        });
                    }

                    if (!events || events.length === 0) {
                        return NextResponse.json({
                            response: `📅 You have no events scheduled for ${dateLabel}. Would you like to schedule something?`
                        });
                    }

                    const eventList = events.map((e: { title: string; start_time: string }) => {
                        const time = new Date(e.start_time).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                        });
                        return `• ${e.title} (${time})`;
                    }).join("\n");

                    return NextResponse.json({
                        response: `📅 You have ${events.length} event${events.length > 1 ? 's' : ''} on ${dateLabel}:\n${eventList}\n\nCheck your calendar for more details!`
                    });
                } catch (err) {
                    console.error("[Lumi] Calendar fetch error:", err);
                    return NextResponse.json({
                        response: "I had trouble reading your calendar. Try again?"
                    });
                }
            }
        }

        // Handle EVENT creation
        if (parsed.type === 'event' && parsed.startTime && parsed.title) {
            console.log("[Lumi] Creating event...");

            if (!userId) {
                return NextResponse.json({
                    response: "Please log in first so I can save your events!"
                });
            }

            if (userId === "demo-user-id") {
                console.log("[Lumi] Demo mode: creating local event");
                const startDate = new Date(parsed.startTime);
                const endDate = parsed.endTime || new Date(startDate.getTime() + 3600000);

                const eventData = {
                    id: `event-${Date.now()}`,
                    user_id: userId,
                    title: parsed.title,
                    description: `Created by Lumi from: "${message}"`,
                    start_time: startDate.toISOString(),
                    end_time: endDate.toISOString(),
                    location: parsed.location || null,
                    color: "#0071e3",
                    is_all_day: false,
                    created_at: new Date().toISOString(),
                };

                const formattedTime = startDate.toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                });

                return NextResponse.json({
                    response: `✅ Scheduled "${parsed.title}" for ${formattedTime}!`,
                    event: eventData,
                    type: "event_created"
                });
            }
            if (isSupabaseConfigured()) {
                const eventData: {
                    user_id: string;
                    title: string;
                    start_time: string;
                    end_time: string;
                    location: string | null;
                    description: string;
                    color: string;
                    is_all_day: boolean;
                } = {
                    user_id: userId,
                    title: parsed.title,
                    start_time: parsed.startTime.toISOString(),
                    end_time: parsed.endTime?.toISOString() || new Date(parsed.startTime.getTime() + 3600000).toISOString(),
                    location: parsed.location || null,
                    description: `Created by Lumi from: "${message}"`,
                    color: "#0071e3",
                    is_all_day: false,
                };

                console.log("[Lumi] Inserting event:", eventData);

                const { data, error } = await supabase
                    .from("events")
                    .insert(eventData as any)
                    .select()
                    .single();

                if (error) {
                    console.error("[Lumi] Supabase error:", error);
                    return NextResponse.json({
                        response: "I had trouble saving that event. Try again?"
                    });
                }

                console.log("[Lumi] Event created successfully:", data);

                const startDate = new Date(eventData.start_time);
                const formattedTime = startDate.toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                });

                return NextResponse.json({
                    response: `✅ Scheduled "${parsed.title}" for ${formattedTime}! Check your calendar.`
                });
            } else {
                console.log("[Lumi] Supabase not configured");
                return NextResponse.json({
                    response: "Event created! (Demo mode - configure Supabase to save)"
                });
            }
        }

        // Handle EXPENSE logging
        if (parsed.type === 'expense' && parsed.amount) {
            console.log("[Lumi] Logging expense...");

            if (!userId) {
                return NextResponse.json({
                    response: "Please log in first so I can track your expenses!"
                });
            }

            // Demo mode bypass
            if (userId === "demo-user-id") {
                console.log("[Lumi] Demo mode: creating local expense");
                const expenseData = {
                    id: `expense-${Date.now()}`,
                    user_id: userId,
                    amount: parsed.amount,
                    description: parsed.description || "Expense",
                    category: parsed.category || "General",
                    type: "expense" as const,
                    date: new Date().toISOString().split("T")[0],
                    created_at: new Date().toISOString(),
                };
                return NextResponse.json({
                    response: `💰 Logged $${parsed.amount.toFixed(2)}${parsed.description ? ` for ${parsed.description}` : ''}!`,
                    expense: expenseData,
                    type: "expense_created"
                });
            }
            if (isSupabaseConfigured()) {
                const { error } = await supabase.from("expenses").insert({
                    user_id: userId,
                    amount: parsed.amount,
                    description: parsed.description || "Expense",
                    category: parsed.category || "General",
                    type: "expense",
                    date: new Date().toISOString().split("T")[0],
                } as any);

                if (error) {
                    console.error("[Lumi] Expense error:", error);
                    return NextResponse.json({
                        response: "I couldn't log that expense. Try again?"
                    });
                }

                return NextResponse.json({
                    response: `💰 Logged $${parsed.amount.toFixed(2)}${parsed.description ? ` for ${parsed.description}` : ''}!`
                });
            }
        }

        // Handle HABIT creation
        if (parsed.type === 'habit' && parsed.title) {
            console.log("[Lumi] Creating habit...");

            if (!userId) {
                return NextResponse.json({
                    response: "Please log in first so I can track your habits!"
                });
            }

            // Demo mode bypass
            if (userId === "demo-user-id") {
                console.log("[Lumi] Demo mode: creating local habit");
                const habitData = {
                    id: `habit-${Date.now()}`,
                    user_id: userId,
                    name: parsed.title,
                    icon: "🎯",
                    color: "#30d158",
                    frequency: "daily",
                    created_at: new Date().toISOString(),
                };
                return NextResponse.json({
                    response: `🎯 Created "${parsed.title}" habit! Start tracking it now.`,
                    habit: habitData,
                    type: "habit_created"
                });
            }
            if (isSupabaseConfigured()) {
                const { error } = await supabase.from("habits").insert({
                    user_id: userId,
                    name: parsed.title,
                    frequency: "daily",
                    icon: "🎯",
                    color: "#30d158",
                } as any);

                if (error) {
                    console.error("[Lumi] Habit error:", error);
                    return NextResponse.json({
                        response: "I couldn't create that habit. Try again?"
                    });
                }

                return NextResponse.json({
                    response: `🎯 Created "${parsed.title}" habit! Check your habits page to start tracking.`
                });
            }
        }

        // Use Gemini for natural conversation, queries, and unclear inputs
        console.log("[Lumi] Using Gemini for response");
        try {
            const aiResponse = await generateLumiResponse(message);
            return NextResponse.json({
                response: aiResponse
            });
        } catch (error) {
            console.error("[Lumi] Gemini error:", error);
            // Fallback if Gemini fails
            if (parsed.clarificationNeeded && parsed.clarificationNeeded.length > 0) {
                return NextResponse.json({
                    response: parsed.clarificationNeeded[0]
                });
            }
            return NextResponse.json({
                response: "I can help you:\n• Schedule events (try: 'meeting tomorrow 3pm')\n• Log expenses (try: 'spent $45 on lunch')\n• Track habits (try: 'create gym habit')\n\nWhat would you like to do?"
            });
        }

    } catch (error: any) {
        console.error("[Lumi] ERROR:", error);
        return NextResponse.json(
            { response: "I'm having trouble. Could you try again?" },
            { status: 200 }
        );
    }
}

