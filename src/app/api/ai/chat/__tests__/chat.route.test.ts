import { POST } from '@/app/api/ai/chat/route';
import { NextRequest } from 'next/server';

describe('Lumi API route demo bypass', () => {
    test('returns demo response for event when userId is demo-user-id', async () => {
        const req = new NextRequest('http://localhost/api/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ message: 'Meeting tomorrow at 3pm', userId: 'demo-user-id' })
        } as any);
        const res = await POST(req as any);
        const json = await res.json();
        expect(json.response).toMatch(/✅ Scheduled .* for .*! \(demo\)/);
    });
});
