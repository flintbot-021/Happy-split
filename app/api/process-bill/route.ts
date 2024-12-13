import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are a receipt processing assistant. Extract items from the receipt image.
For each item, provide:
- name (as shown on receipt)
- price (numeric value only)
- quantity (default to 1 if not specified)
- category (one of: "Drinks", "Food", "Desserts")

Return the data in JSON array format like:
[
  {
    "name": "Item Name",
    "price": 99.99,
    "quantity": 1,
    "category": "Food"
  }
]
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

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: SYSTEM_PROMPT + "\nExtract the items from this receipt and return them in JSON format.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0,
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
      console.error('❌ API: OpenAI error:', error);
      throw error;
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