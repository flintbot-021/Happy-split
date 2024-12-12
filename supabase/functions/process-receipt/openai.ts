import OpenAI from 'https://esm.sh/openai@4.17.4';
import { openAiConfig } from './config';
import { ProcessedItem } from './types';

export async function processImageWithOpenAI(openai: OpenAI, image: string): Promise<ProcessedItem[]> {
  const response = await openai.chat.completions.create({
    model: openAiConfig.model,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: openAiConfig.promptTemplate },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } },
        ],
      },
    ],
    max_tokens: openAiConfig.maxTokens,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No content in OpenAI response');
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    throw new Error('Failed to parse OpenAI response');
  }

  if (!Array.isArray(parsed.items)) {
    throw new Error('Invalid response format from OpenAI');
  }

  return parsed.items.map(item => ({
    name: String(item.name || '').trim() || 'Unknown Item',
    quantity: Math.max(1, Number(item.quantity) || 1),
    price: Math.max(0, Number(item.price) || 0),
    category: ['Drinks', 'Food', 'Desserts'].includes(item.category) ? item.category : 'Food'
  }));
}