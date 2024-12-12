import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from './config.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Verify method
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: 'Method not allowed',
        message: 'Only POST requests are accepted'
      }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { image } = await req.json();

    // For testing, return mock data
    const mockItems = [
      {
        name: "Test Item",
        quantity: 1,
        price: 100,
        category: "Food"
      }
    ];

    return new Response(
      JSON.stringify({ items: mockItems }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error processing receipt:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to process receipt',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});