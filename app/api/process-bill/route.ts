import { NextResponse } from 'next/server';
import { detectText } from '@/lib/vision';
import { processReceiptText } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.image) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const base64Image = body.image.split(',')[1];
    const imageBuffer = Buffer.from(base64Image, 'base64');

    // Step 1: Extract text using Google Cloud Vision
    console.log('🔍 Detecting text with Google Cloud Vision...');
    const extractedText = await detectText(imageBuffer);
    
    if (!extractedText) {
      return NextResponse.json(
        { error: 'No text detected in image' },
        { status: 400 }
      );
    }

    // Step 2: Process text with OpenAI
    console.log('🤖 Processing text with OpenAI...');
    const result = await processReceiptText(extractedText);
    
    // Log the full result for debugging
    console.log('🤖 Full OpenAI Result:', result);

    // Extract items array and ensure it's valid
    const items = Array.isArray(result.items) ? result.items : [];
    
    // Log the extracted items
    console.log('📝 Extracted Items:', items);

    return NextResponse.json({ 
      items,
      extracted_total: result.extracted_total,
      calculated_total: result.calculated_total,
      validation: result.validation
    });
  } catch (error) {
    console.error('❌ API: General error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json(
      { error: 'Failed to process bill', details: errorMessage },
      { status: 500 }
    );
  }
} 