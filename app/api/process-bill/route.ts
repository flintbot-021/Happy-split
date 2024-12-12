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
  console.log('🔵 API: Process bill request received');
  
  try {
    const body = await request.json();
    console.log('🔵 API: Request body received, image length:', body.image?.length);

    if (!body.image) {
      console.error('❌ API: No image data received');
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    // Extract base64 data from the data URL
    const base64Image = body.image.split(',')[1];
    console.log('🔵 API: Extracted base64 data, length:', base64Image.length);

    try {
      console.log('🔵 API: Sending request to OpenAI');
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
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
                image_url: {  // Changed this to match Python example
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0,
      });

      console.log('🔵 API: OpenAI response received:', response.choices[0].message);

      const result = response.choices[0].message.content;
      let items = [];
      
      try {
        // Clean the response by removing markdown code block
        const cleanedResult = result
          .replace(/```json\n?/, '') // Remove opening ```json
          .replace(/\n?```$/, '')    // Remove closing ```
          .trim();                   // Remove extra whitespace

        console.log('🔵 API: Cleaned result:', cleanedResult);

        if (cleanedResult.startsWith('[') || cleanedResult.startsWith('{')) {
          items = JSON.parse(cleanedResult);
          console.log('🔵 API: Successfully parsed items:', items);
        } else {
          console.warn('⚠️ API: Response not in JSON format:', cleanedResult);
          items = [];
        }
      } catch (parseError) {
        console.error('❌ API: Parse error:', parseError);
        console.error('❌ API: Raw response:', result);
        throw new Error('Failed to parse items from receipt');
      }

      return NextResponse.json({ items });
    } catch (openaiError: any) {
      console.error('❌ API: OpenAI error:', {
        message: openaiError.message,
        type: openaiError.type,
        code: openaiError.code,
      });
      throw openaiError;
    }
  } catch (error: any) {
    console.error('❌ API: General error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      type: error.type,
    });
    
    return NextResponse.json(
      { error: 'Failed to process bill', details: error.message },
      { status: 500 }
    );
  }
} 