import * as chrono from 'chrono-node';

/**
 * Natural Language Parser for Lumi AI
 * Extracts scheduling intent, dates, times, and event details from user input
 */

export interface ParsedIntent {
    type: 'event' | 'expense' | 'habit' | 'query' | 'unknown';
    action?: 'create' | 'update' | 'delete' | 'reschedule';
    queryType?: 'greeting' | 'calendar' | 'help' | 'unclear';
    title?: string;
    startTime?: Date;
    endTime?: Date;
    duration?: number; // in minutes
    location?: string;
    description?: string;
    amount?: number;
    category?: string;
    confidence: number; // 0-1
    clarificationNeeded?: string[];
}

/**
 * Parse natural language input and extract scheduling intent
 */
export function parseNaturalLanguage(input: string, currentDate: Date = new Date()): ParsedIntent {
    const lowerInput = input.toLowerCase().trim();

    // Check for greetings first
    if (isGreeting(lowerInput)) {
        return {
            type: 'query',
            queryType: 'greeting',
            confidence: 0.95,
        };
    }

    // Check for calendar queries
    if (isCalendarQuery(lowerInput)) {
        return {
            type: 'query',
            queryType: 'calendar',
            confidence: 0.9,
        };
    }

    // Detect intent type
    if (isEventIntent(lowerInput)) {
        return parseEventIntent(input, lowerInput, currentDate);
    } else if (isExpenseIntent(lowerInput)) {
        return parseExpenseIntent(input, lowerInput);
    } else if (isHabitIntent(lowerInput)) {
        return parseHabitIntent(input, lowerInput);
    } else {
        return {
            type: 'query',
            queryType: 'unclear',
            confidence: 0.3,
            clarificationNeeded: ['What would you like me to do?'],
        };
    }
}

/**
 * Check if input is about creating/managing events
 */
function isEventIntent(input: string): boolean {
    const eventKeywords = [
        'schedule', 'meeting', 'call', 'appointment', 'event',
        'block', 'focus', 'reserve', 'book', 'add',
        'tomorrow', 'today', 'next week', 'monday', 'tuesday', 'wednesday',
        'thursday', 'friday', 'saturday', 'sunday',
        'am', 'pm', "o'clock", 'at '
    ];
    return eventKeywords.some(keyword => input.includes(keyword));
}

/**
 * Check if input is about expenses
 */
function isExpenseIntent(input: string): boolean {
    const expenseKeywords = [
        'spent', 'paid', 'expense', 'cost', 'bought',
        '$', 'dollars', 'owe', 'owes', 'split', 'log expense'
    ];
    return expenseKeywords.some(keyword => input.includes(keyword));
}

/**
 * Check if input is a greeting
 */
function isGreeting(input: string): boolean {
    const greetings = [
        'hi', 'hello', 'hey', 'hiya', 'yo', 'sup', 'howdy',
        'good morning', 'good afternoon', 'good evening',
        'whats up', "what's up", 'how are you', 'how r u'
    ];
    return greetings.some(greeting => input === greeting || input.startsWith(greeting + ' '));
}

/**
 * Check if input is asking about calendar/schedule
 */
function isCalendarQuery(input: string): boolean {
    const calendarQueries = [
        "what's on", 'whats on', 'show me', 'what do i have',
        'my schedule', 'my calendar', 'free time', 'busy',
        'events today', 'events tomorrow', 'meetings'
    ];
    return calendarQueries.some(query => input.includes(query));
}

/**
 * Check if input is about habits
 */
function isHabitIntent(input: string): boolean {
    const habitKeywords = [
        'habit', 'daily', 'every day', 'every week', 'routine',
        'gym', 'workout', 'exercise', 'meditation', 'reading', 'track'
    ];
    return habitKeywords.some(keyword => input.includes(keyword));
}

/**
 * Parse event creation intent - IMPROVED VERSION
 */
function parseEventIntent(input: string, lowerInput: string, currentDate: Date): ParsedIntent {
    // Extract title FIRST before chrono processes it
    let rawTitle = input;

    // Remove action verbs
    rawTitle = rawTitle
        .replace(/^(schedule|add|create|book|set up|block|plan)\s+/i, '')
        .trim();

    // Use chrono-node to extract dates and times
    const parsedDates = chrono.parse(input, currentDate, { forwardDate: true });

    let startTime: Date | undefined;
    let endTime: Date | undefined;
    let duration = 60; // Default 1 hour

    if (parsedDates.length > 0) {
        const firstDate = parsedDates[0];
        startTime = firstDate.start.date();

        if (firstDate.end) {
            endTime = firstDate.end.date();
        } else {
            // Infer duration from keywords
            if (lowerInput.includes('30 min') || lowerInput.includes('half hour')) {
                duration = 30;
            } else if (lowerInput.includes('2 hour') || lowerInput.includes('2h')) {
                duration = 120;
            } else if (lowerInput.includes('4 hour') || lowerInput.includes('4h')) {
                duration = 240;
            }

            endTime = new Date(startTime.getTime() + duration * 60000);
        }

        // Remove the datetime text from title MORE CAREFULLY
        // Only remove what chrono actually matched
        const dateTimeText = firstDate.text;
        rawTitle = rawTitle.replace(new RegExp(dateTimeText, 'i'), '').trim();
    }

    // Clean up title further
    let title: string | undefined = rawTitle
        .replace(/\s+(for|at|on|with|in)\s*$/i, '')
        .replace(/\s{2,}/g, ' ') // Multiple spaces to single space
        .trim();

    // Extract location
    const locationMatch = lowerInput.match(/(?:at|in|location:?)\s+([a-z\s]+?)(?:\s+tomorrow|\s+today|\s+on|\s+at\s+\d|$)/i);
    const location = locationMatch ? locationMatch[1].trim() : undefined;

    // Determine action
    let action: 'create' | 'update' | 'delete' | 'reschedule' = 'create';
    if (lowerInput.includes('reschedule') || lowerInput.includes('move')) {
        action = 'reschedule';
    } else if (lowerInput.includes('cancel') || lowerInput.includes('delete')) {
        action = 'delete';
    }

    // Determine if clarification is needed
    const clarificationNeeded: string[] = [];

    // Be more lenient with title requirement
    if (!title || title.length < 2 || /^[^a-z0-9]+$/i.test(title)) {
        clarificationNeeded.push('What should I call this event?');
        title = undefined;
    }

    if (!startTime) {
        clarificationNeeded.push('When would you like to schedule this?');
    }

    // Calculate confidence
    let confidence = 0.5;
    if (startTime && title && title.length > 2) {
        confidence = 0.95;
    } else if (startTime || title) {
        confidence = 0.6;
    }

    return {
        type: 'event',
        action,
        title,
        startTime,
        endTime,
        duration,
        location,
        confidence,
        clarificationNeeded: clarificationNeeded.length > 0 ? clarificationNeeded : undefined,
    };
}

/**
 * Parse expense logging intent
 */
function parseExpenseIntent(input: string, lowerInput: string): ParsedIntent {
    // Extract amount
    const amountMatch = lowerInput.match(/\$?\s?(\d+(?:\.\d{2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : undefined;

    // Extract category
    let category = 'General';
    if (lowerInput.includes('food') || lowerInput.includes('dinner') || lowerInput.includes('lunch') || lowerInput.includes('breakfast')) {
        category = 'Food';
    } else if (lowerInput.includes('uber') || lowerInput.includes('taxi') || lowerInput.includes('transport') || lowerInput.includes('gas')) {
        category = 'Transport';
    } else if (lowerInput.includes('movie') || lowerInput.includes('entertainment')) {
        category = 'Entertainment';
    } else if (lowerInput.includes('shopping') || lowerInput.includes('clothes')) {
        category = 'Shopping';
    }

    // Extract description
    let description = input
        .replace(/\$?\s?\d+(?:\.\d{2})?/, '')
        .replace(/spent|paid|for|expense|log/gi, '')
        .trim();

    return {
        type: 'expense',
        action: 'create',
        amount,
        category,
        description: description || undefined,
        confidence: amount ? 0.85 : 0.4,
        clarificationNeeded: amount ? undefined : ['How much was the expense?'],
    };
}

/**
 * Parse habit creation intent
 */
function parseHabitIntent(input: string, lowerInput: string): ParsedIntent {
    const habitMatch = lowerInput.match(/(?:habit|routine|daily):\s*(.+)/);
    let title = habitMatch ? habitMatch[1] : input.replace(/add|create|new|habit|routine|track/gi, '').trim();

    return {
        type: 'habit',
        action: 'create',
        title,
        confidence: title && title.length > 2 ? 0.75 : 0.5,
        clarificationNeeded: title && title.length > 2 ? undefined : ['What habit would you like to track?'],
    };
}

/**
 * Format parsed intent into user-friendly confirmation message
 */
export function formatConfirmation(intent: ParsedIntent): string {
    if (intent.type === 'event' && intent.startTime && intent.title) {
        const startStr = intent.startTime.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
        const endStr = intent.endTime?.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });

        return `✅ Scheduled "${intent.title}" for ${startStr}${endStr ? ` - ${endStr}` : ''}${intent.location ? ` at ${intent.location}` : ''}`;
    } else if (intent.type === 'expense' && intent.amount) {
        return `💰 Logged $${intent.amount.toFixed(2)}${intent.description ? ` for ${intent.description}` : ''} (${intent.category})`;
    } else if (intent.type === 'habit' && intent.title) {
        return `🎯 Created "${intent.title}" habit!`;
    }

    return 'What would you like me to do?';
}
