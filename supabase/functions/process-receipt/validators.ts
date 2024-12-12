import { RequestBody } from './types';

export function validateContentType(contentType: string | null): void {
  if (!contentType?.includes('application/json')) {
    throw new Error('Content-Type must be application/json');
  }
}

export function validateRequestBody(body: RequestBody): void {
  if (!body.image) {
    throw new Error('Image data is required');
  }

  if (!/^[A-Za-z0-9+/=]+$/.test(body.image)) {
    throw new Error('Invalid base64 image data');
  }
}

export function validateOpenAIKey(): string {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  return apiKey;
}