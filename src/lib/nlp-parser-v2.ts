/**
 * LUMI NLP Parser v2 — Enhanced Intent Detection with Date Extraction
 */

export interface ParsedIntent {
    type: 'calendar' | 'event_create' | 'expense' | 'habit' | 'other';
    action: 'view' | 'list' | 'create' | 'search';
    date?: Date;
    dateString?: string;
    confidence: number;
    explanation: string;
}

export function extractDateFromQuery(query: string): Date | null {
    const today = new Date();

    if (/\btomorrow\b/i.test(query)) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    }

    if (/\btoday\b/i.test(query)) {
        return today;
    }

    const nextDayMatch = query.match(/\bnext\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i);
    if (nextDayMatch) {
        const dayName = nextDayMatch[1].toLowerCase();
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDay = daysOfWeek.indexOf(dayName);
        const date = new Date(today);
        const currentDay = date.getDay();
        const daysAhead = targetDay - currentDay;
        date.setDate(date.getDate() + (daysAhead > 0 ? daysAhead : daysAhead + 7));
        return date;
    }

    const daysAheadMatch = query.match(/(?:in|after)\s+(\d+)\s+days/i);
    if (daysAheadMatch) {
        const daysAhead = parseInt(daysAheadMatch[1]);
        const date = new Date(today);
        date.setDate(date.getDate() + daysAhead);
        return date;
    }

    const monthPattern = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]* (\d{1,2})(?:\s+(\d{4}))?/i;
    const monthMatch = query.match(monthPattern);
    if (monthMatch) {
        const monthNames: { [key: string]: number } = {
            'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'aug': 7, 'sep': 8, 'sept': 8, 'oct': 9, 'nov': 10, 'dec': 11
        };
        const month = monthNames[monthMatch[1].toLowerCase().substring(0, 3)];
        const day = parseInt(monthMatch[2]);
        const year = monthMatch[3] ? parseInt(monthMatch[3]) : today.getFullYear();
        return new Date(year, month, day);
    }

    const slashPattern = /(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/;
    const slashMatch = query.match(slashPattern);
    if (slashMatch) {
        const month = parseInt(slashMatch[1]) - 1;
        const day = parseInt(slashMatch[2]);
        const year = slashMatch[3] ? parseInt(slashMatch[3]) : today.getFullYear();
        return new Date(year, month, day);
    }

    return null;
}

export function detectCalendarListIntent(query: string): boolean {
    const listKeywords = ['list', 'show', 'all', 'display', 'view all', 'what do i have', 'upcoming'];
    const lowerQuery = query.toLowerCase();
    const hasListKeyword = listKeywords.some(kw => lowerQuery.includes(kw));
    const avoidKeywords = ['create', 'schedule', 'add', 'new'];
    const hasAvoidKeyword = avoidKeywords.some(kw => lowerQuery.includes(kw));
    return hasListKeyword && !hasAvoidKeyword;
}

export function parseIntent(query: string): ParsedIntent {
    const lowerQuery = query.toLowerCase();
    const extractedDate = extractDateFromQuery(query);
    const extractedDateString = extractedDate ? extractedDate.toISOString().split('T')[0] : undefined;

    const calendarKeywords = ['calendar', 'event', 'what\'s', 'what is', 'when', 'schedule', 'meeting', 'appointment'];
    const hasCalendarKeyword = calendarKeywords.some(kw => lowerQuery.includes(kw));

    if (hasCalendarKeyword || detectCalendarListIntent(query)) {
        if (detectCalendarListIntent(query)) {
            return {
                type: 'calendar',
                action: 'list',
                date: undefined,
                dateString: undefined,
                confidence: 0.92,
                explanation: 'User asked to list/show all events'
            };
        } else if (extractedDate) {
            return {
                type: 'calendar',
                action: 'view',
                date: extractedDate,
                dateString: extractedDateString,
                confidence: 0.95,
                explanation: `User asked about events on ${extractedDateString}`
            };
        } else if (lowerQuery.includes('today')) {
            return {
                type: 'calendar',
                action: 'view',
                date: new Date(),
                dateString: new Date().toISOString().split('T')[0],
                confidence: 0.95,
                explanation: 'Explicit "today" query'
            };
        } else {
            return {
                type: 'calendar',
                action: 'view',
                date: new Date(),
                dateString: new Date().toISOString().split('T')[0],
                confidence: 0.85,
                explanation: 'Calendar query with no specific date (defaulting to today)'
            };
        }
    }

    if (lowerQuery.includes('create') || lowerQuery.includes('schedule') || lowerQuery.includes('add event')) {
        return {
            type: 'event_create',
            action: 'create',
            confidence: 0.88,
            explanation: 'User wants to create a new event'
        };
    }

    if (lowerQuery.includes('expense') || lowerQuery.includes('spent') || lowerQuery.includes('cost')) {
        return {
            type: 'expense',
            action: 'create',
            confidence: 0.85,
            explanation: 'User wants to log an expense'
        };
    }

    if (lowerQuery.includes('habit') || lowerQuery.includes('routine')) {
        return {
            type: 'habit',
            action: 'create',
            confidence: 0.82,
            explanation: 'User wants to create or manage a habit'
        };
    }

    return {
        type: 'other',
        action: 'view',
        confidence: 0.5,
        explanation: 'Intent not clearly identified'
    };
}

export function formatIntentForLogging(intent: ParsedIntent): string {
    const dateStr = intent.date ? intent.date.toLocaleDateString() : 'none';
    return `[${intent.type}/${intent.action}] date=${dateStr} confidence=${intent.confidence.toFixed(2)} explanation="${intent.explanation}"`;
}
