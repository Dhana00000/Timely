import { NextRequest, NextResponse } from "next/server";

interface GenerateNotesRequest {
    title: string;
    description?: string;
    duration: number; // in minutes
    location?: string;
    eventType?: string;
}

export async function POST(request: NextRequest) {
    try {
        const { title, description, duration, location }: GenerateNotesRequest = await request.json();

        // Detect event type from title
        const eventType = detectEventType(title, description);

        // Generate structured notes based on event type
        const notes = generateStructuredNotes(eventType, title, description, duration, location);

        return NextResponse.json({ notes }, { status: 200 });
    } catch (error) {
        console.error("Error generating notes:", error);
        return NextResponse.json(
            { error: "Failed to generate notes" },
            { status: 500 }
        );
    }
}

function detectEventType(title: string, description?: string): string {
    const text = `${title} ${description || ""}`.toLowerCase();

    if (text.match(/meeting|sync|standup|call|discussion/)) return "meeting";
    if (text.match(/focus|work|deep|code|write|design/)) return "focus";
    if (text.match(/workshop|training|seminar|class/)) return "workshop";
    if (text.match(/interview|screening|candidate/)) return "interview";
    if (text.match(/presentation|demo|pitch/)) return "presentation";
    if (text.match(/review|retrospective|feedback/)) return "review";
    if (text.match(/lunch|dinner|coffee|break/)) return "break";

    return "default";
}

function generateStructuredNotes(
    eventType: string,
    title: string,
    description?: string,
    duration?: number,
    location?: string
): string {
    const templates = {
        meeting: `## Meeting Structure

### Opening (5 min)
- Welcome & introductions
- Review agenda
- Set expectations

### Main Discussion (${Math.max(10, (duration || 30) - 15)} min)
- Key topics to cover:
  ${description ? `- ${description}` : '- [Topic 1]\n  - [Topic 2]\n  - [Topic 3]'}

### Action Items & Next Steps (5 min)
- [ ] Decision/action item 1
- [ ] Decision/action item 2
- [ ] Schedule follow-up

### Notes
${description || ''}
`,

        focus: `## Focus Session Plan

### Goal
${description || 'Deep work on ' + title}

### Tasks to Complete
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Breaks
- ${duration && duration > 60 ? 'Break every 25-30 minutes (Pomodoro)' : 'Short break at halfway point'}

### Review
- What was accomplished?
- What needs follow-up?
`,

        workshop: `## Workshop Outline

### Introduction (10 min)
- Welcome participants
- Overview of objectives
- Icebreaker

### Activity 1 (${Math.floor((duration || 60) * 0.3)} min)
${description || '- Main activity description'}

### Break (10 min)

### Activity 2 (${Math.floor((duration || 60) * 0.3)} min)
- Group exercise or discussion

### Q&A & Wrap-up (15 min)
- Questions
- Key takeaways
- Next steps
`,

        interview: `## Interview Structure

### Introduction (5 min)
- Welcome candidate
- Brief company/role overview
- Interview format explanation

### Background & Experience (15 min)
- Walk through resume
- Key accomplishments
- Career motivations

### Technical/Role-Specific Questions (${Math.max(20, (duration || 60) - 30)} min)
${description || '- Question areas to cover'}

### Candidate Questions (10 min)
- Answer candidate's questions
- Discuss culture, team, growth

### Closing (5 min)
- Next steps in process
- Timeline
- Thank candidate
`,

        presentation: `## Presentation Outline

### Opening (5 min)
- Introduction
- Agenda overview
- Hook/attention grabber

### Main Content (${Math.max(15, (duration || 30) - 15)} min)
${description ? `**Topic:** ${description}\n\n` : ''}**Key Points:**
- Point 1
- Point 2
- Point 3

### Q&A (5 min)
- Address questions
- Clarify key points

### Closing (5 min)
- Summary
- Call to action
- Thank audience
`,

        review: `## Review Session

### Preparation
- Review materials/metrics
- Key questions to address

### Discussion Points
${description || '- What went well?\n- What could be improved?\n- Key learnings'}

### Action Items
- [ ] Item 1
- [ ] Item 2

### Follow-up
- Next review date
- Tracking method
`,

        break: `## ${title}

${description ? `**Purpose:** ${description}\n\n` : ''}**Activities:**
- Relax and recharge
- Network/socialize
${location ? `\n**Location:** ${location}` : ''}

**Notes:**
- 
`,

        default: `## ${title}

${description ? `**Description:** ${description}\n\n` : ''}**Key Points:**
- 
- 
-

**Action Items:**
- [ ] 
- [ ] 

**Notes:**
${location ? `\n**Location:** ${location}` : ''}
`,
    };

    return templates[eventType as keyof typeof templates] || templates.default;
}
