import { parseNaturalLanguage } from '@/lib/nlp-parser';

describe('parseNaturalLanguage', () => {
    test('parses event creation command', () => {
        const message = 'Meeting tomorrow at 3pm';
        const result = parseNaturalLanguage(message);
        expect(result.type).toBe('event');
        expect(result.title?.toLowerCase()).toContain('meeting');
        expect(result.startTime).toBeInstanceOf(Date);
    });
});
