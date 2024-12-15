import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI();

const SYSTEM_PROMPT = `
You are a receipt processing assistant. Extract items from the receipt image.
For each item, provide:
- name (as shown on receipt)
- price (numeric value only)
- quantity (default to 1 if not specified)
- category (one of: "Drinks", "Food", "Desserts")

Return the data in JSON array format.
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.image) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    const base64Image = body.image.split(',')[1];

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: SYSTEM_PROMPT,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              },
            },
          ],
        }
      ]
    });

    const result = response.choices[0]?.message?.content;
      
    if (!result) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    try {
      const cleanedResult = result
        .replace(/```json\n?/, '')
        .replace(/\n?```$/, '')
        .trim();

      if (cleanedResult.startsWith('[') || cleanedResult.startsWith('{')) {
        const items = JSON.parse(cleanedResult);
        return NextResponse.json({ items });
      } else {
        return NextResponse.json({ items: [] });
      }
    } catch (parseError) {
      console.error('❌ API: Parse error:', parseError);
      console.error('❌ API: Raw response:', result);
      throw new Error('Failed to parse items from receipt');
    }
  } catch (error) {
    console.error('❌ API: General error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json(
      { error: 'Failed to process bill', details: errorMessage },
      { status: 500 }
    );
  }
} 