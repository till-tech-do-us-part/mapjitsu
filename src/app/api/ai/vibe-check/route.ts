import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { buildContext } from '@/lib/ai/context-builder';
import { JITSU_SYSTEM_PROMPT, buildVibeCheckPrompt } from '@/lib/ai/prompts';

const requestSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  query: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server misconfigured: missing Anthropic API key' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { lat, lng, query } = requestSchema.parse(body);

    const context = await buildContext(lat, lng);
    const userPrompt = buildVibeCheckPrompt(context, query || '');

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: JITSU_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: userPrompt }
      ],
    });

    // Extract text content from the response
    const textContent = message.content.find(block => block.type === 'text');
    const responseText = textContent?.type === 'text' ? textContent.text : 'Unable to generate response';

    return NextResponse.json({
      response: responseText,
      context: {
        neighborhood: context.neighborhood,
        city: context.city,
        timeContext: context.timeContext,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Vibe check API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
