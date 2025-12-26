"use client";

// Google Calendar API service
// Uses the user's Google OAuth token to access their calendar

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

export interface GoogleCalendarEvent {
    id: string;
    summary: string;
    description?: string;
    location?: string;
    start: {
        dateTime?: string;
        date?: string;
        timeZone?: string;
    };
    end: {
        dateTime?: string;
        date?: string;
        timeZone?: string;
    };
    colorId?: string;
}

export interface CalendarListEntry {
    id: string;
    summary: string;
    primary?: boolean;
    backgroundColor?: string;
}

// Get access token from Supabase session
export async function getGoogleAccessToken(): Promise<string | null> {
    // This will be called from API routes where we have access to the session
    // For client-side, we need to use the API endpoint
    return null;
}

// Fetch user's calendar events from Google Calendar
export async function fetchGoogleCalendarEvents(
    accessToken: string,
    calendarId: string = "primary",
    timeMin?: Date,
    timeMax?: Date
): Promise<GoogleCalendarEvent[]> {
    const params = new URLSearchParams({
        maxResults: "250",
        singleEvents: "true",
        orderBy: "startTime",
    });

    if (timeMin) {
        params.set("timeMin", timeMin.toISOString());
    } else {
        // Default: events from 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        params.set("timeMin", thirtyDaysAgo.toISOString());
    }

    if (timeMax) {
        params.set("timeMax", timeMax.toISOString());
    } else {
        // Default: events up to 90 days in the future
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
        params.set("timeMax", ninetyDaysFromNow.toISOString());
    }

    const response = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        const error = await response.json();
        console.error("Google Calendar API error:", error);
        throw new Error(error.error?.message || "Failed to fetch calendar events");
    }

    const data = await response.json();
    return data.items || [];
}

// Create event in Google Calendar
export async function createGoogleCalendarEvent(
    accessToken: string,
    event: {
        summary: string;
        description?: string;
        location?: string;
        start: { dateTime: string; timeZone?: string };
        end: { dateTime: string; timeZone?: string };
    },
    calendarId: string = "primary"
): Promise<GoogleCalendarEvent> {
    const response = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(event),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        console.error("Google Calendar API error:", error);
        throw new Error(error.error?.message || "Failed to create calendar event");
    }

    return response.json();
}

// Update event in Google Calendar
export async function updateGoogleCalendarEvent(
    accessToken: string,
    eventId: string,
    event: Partial<{
        summary: string;
        description?: string;
        location?: string;
        start: { dateTime: string; timeZone?: string };
        end: { dateTime: string; timeZone?: string };
    }>,
    calendarId: string = "primary"
): Promise<GoogleCalendarEvent> {
    const response = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(event),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        console.error("Google Calendar API error:", error);
        throw new Error(error.error?.message || "Failed to update calendar event");
    }

    return response.json();
}

// Delete event from Google Calendar
export async function deleteGoogleCalendarEvent(
    accessToken: string,
    eventId: string,
    calendarId: string = "primary"
): Promise<void> {
    const response = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok && response.status !== 404) {
        const error = await response.json();
        console.error("Google Calendar API error:", error);
        throw new Error(error.error?.message || "Failed to delete calendar event");
    }
}

// Get list of user's calendars
export async function getCalendarList(accessToken: string): Promise<CalendarListEntry[]> {
    const response = await fetch(`${GOOGLE_CALENDAR_API}/users/me/calendarList`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        console.error("Google Calendar API error:", error);
        throw new Error(error.error?.message || "Failed to fetch calendar list");
    }

    const data = await response.json();
    return data.items || [];
}

// Convert Google Calendar event to Timely event format
export function googleEventToTimelyEvent(
    googleEvent: GoogleCalendarEvent,
    userId: string
): {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string;
    location: string | null;
    color: string;
    is_all_day: boolean;
    google_event_id: string;
} {
    const isAllDay = !!googleEvent.start.date && !googleEvent.start.dateTime;

    return {
        id: crypto.randomUUID(),
        user_id: userId,
        title: googleEvent.summary || "Untitled Event",
        description: googleEvent.description || null,
        start_time: isAllDay
            ? new Date(googleEvent.start.date!).toISOString()
            : googleEvent.start.dateTime!,
        end_time: isAllDay
            ? new Date(googleEvent.end.date!).toISOString()
            : googleEvent.end.dateTime!,
        location: googleEvent.location || null,
        color: getColorFromGoogleColorId(googleEvent.colorId),
        is_all_day: isAllDay,
        google_event_id: googleEvent.id,
    };
}

// Map Google Calendar color IDs to hex colors
function getColorFromGoogleColorId(colorId?: string): string {
    const colorMap: Record<string, string> = {
        "1": "#7986cb", // Lavender
        "2": "#33b679", // Sage
        "3": "#8e24aa", // Grape
        "4": "#e67c73", // Flamingo
        "5": "#f6bf26", // Banana
        "6": "#f4511e", // Tangerine
        "7": "#039be5", // Peacock
        "8": "#616161", // Graphite
        "9": "#3f51b5", // Blueberry
        "10": "#0b8043", // Basil
        "11": "#d50000", // Tomato
    };
    return colorMap[colorId || ""] || "#0a84ff"; // Default blue
}
