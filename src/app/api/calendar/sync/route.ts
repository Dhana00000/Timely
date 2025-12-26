import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
    fetchGoogleCalendarEvents,
    googleEventToTimelyEvent,
    GoogleCalendarEvent,
} from "@/lib/google-calendar";

// Create server-side Supabase client
function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

export async function POST(request: NextRequest) {
    try {
        const { userId, accessToken } = await request.json();

        if (!userId || !accessToken) {
            return NextResponse.json(
                { error: "Missing userId or accessToken" },
                { status: 400 }
            );
        }

        console.log("🔄 Starting calendar sync for user:", userId);
        console.log("🔑 Access token preview:", accessToken.substring(0, 20) + "...");

        // Fetch events from Google Calendar
        let googleEvents;
        try {
            googleEvents = await fetchGoogleCalendarEvents(accessToken);
            console.log(`📅 Fetched ${googleEvents.length} events from Google Calendar`);
        } catch (fetchError) {
            console.error("❌ Google Calendar API error:", fetchError);
            const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);

            // Provide helpful error message
            if (errorMessage.includes("invalid_token") || errorMessage.includes("Invalid Credentials")) {
                return NextResponse.json({
                    error: "Google access token expired or invalid. Please sign out and sign back in with Google.",
                    details: errorMessage
                }, { status: 401 });
            }

            if (errorMessage.includes("Access Not Configured") || errorMessage.includes("has not been used")) {
                return NextResponse.json({
                    error: "Google Calendar API is not enabled. Please enable it in Google Cloud Console.",
                    details: errorMessage
                }, { status: 403 });
            }

            return NextResponse.json({
                error: "Failed to fetch events from Google Calendar",
                details: errorMessage
            }, { status: 500 });
        }

        if (googleEvents.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No events found in Google Calendar",
                synced: 0,
            });
        }

        const supabase = getSupabase();

        // Get existing events with google_event_id to avoid duplicates
        const { data: existingEvents } = await supabase
            .from("events")
            .select("google_event_id")
            .eq("user_id", userId)
            .not("google_event_id", "is", null);

        const existingGoogleIds = new Set(
            existingEvents?.map((e: { google_event_id: string }) => e.google_event_id) || []
        );

        // Convert and filter new events
        const newEvents = googleEvents
            .filter((ge: GoogleCalendarEvent) => !existingGoogleIds.has(ge.id))
            .map((ge: GoogleCalendarEvent) => googleEventToTimelyEvent(ge, userId));

        console.log(`➕ ${newEvents.length} new events to sync`);

        if (newEvents.length > 0) {
            // Insert new events into Supabase
            const { error } = await supabase.from("events").insert(newEvents);

            if (error) {
                console.error("❌ Error inserting events:", error);
                return NextResponse.json(
                    { error: "Failed to save events to database", details: error.message },
                    { status: 500 }
                );
            }
        }

        console.log("✅ Calendar sync complete");

        return NextResponse.json({
            success: true,
            message: `Synced ${newEvents.length} new events from Google Calendar`,
            synced: newEvents.length,
            total: googleEvents.length,
        });
    } catch (error) {
        console.error("❌ Calendar sync error:", error);
        return NextResponse.json(
            {
                error: "Failed to sync calendar",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

// GET endpoint to check sync status
export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Count synced events
    const { count, error } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .not("google_event_id", "is", null);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        syncedEventsCount: count || 0,
    });
}
