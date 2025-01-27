import vision from '@google-cloud/vision';

// Create a client
const client = new vision.ImageAnnotatorClient(
  process.env.GOOGLE_CREDENTIALS 
    ? { credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS) }
    : { keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS }
);

export async function detectText(imageBuffer: Buffer): Promise<string> {
  try {
    const [result] = await client.textDetection(imageBuffer);
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      throw new Error('No text detected in the image');
    }

    // Log the full response for debugging
    console.log('🔍 Google Vision Raw Response:', JSON.stringify(result, null, 2));
    console.log('\n🔍 Extracted Text:', detections[0].description);

    // The first element contains the entire text from the image
    return detections[0].description || '';
  } catch (error) {
    console.error('❌ Google Vision Error:', error);
    throw error;
  }
} 