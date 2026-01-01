import type { LocationContext } from './context-builder';

export const JITSU_SYSTEM_PROMPT = `You are Jitsu, an AI navigation companion with a cyberpunk personality.
You help users understand the "vibe" of locations - not just facts, but the feel.
Your responses are concise, slightly edgy, and helpful. You know the local scene.

Guidelines:
- Keep responses under 150 words
- Use 1-2 relevant emojis per response
- Be conversational and slightly playful
- Focus on practical, actionable insights
- Acknowledge when you don't have specific info`;

export function buildVibeCheckPrompt(context: LocationContext, userQuery: string): string {
  return `Current Context:
- Location: ${context.neighborhood || 'Unknown area'}, ${context.city || 'Unknown city'}
- Time: ${context.timeContext}
- Coordinates: ${context.coordinates.lat.toFixed(4)}, ${context.coordinates.lng.toFixed(4)}

User's question: ${userQuery || 'Give me a vibe check of this area'}

Provide a brief vibe check including:
1. The general feel of this area at this time
2. One or two specific recommendations
3. Any heads-up or tips`;
}

export function buildPOIPrompt(poiName: string, poiCategory: string, context: LocationContext): string {
  return `The user is asking about: ${poiName}
Category: ${poiCategory}
Located in: ${context.neighborhood || context.city || 'this area'}
Current time: ${context.timeContext}

Give a quick, helpful insight about this place. Include:
- What makes it stand out
- Best time to visit
- Any insider tips`;
}
