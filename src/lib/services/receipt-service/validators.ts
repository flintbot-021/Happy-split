export function validateImageData(base64Image: string): void {
  if (!base64Image) {
    throw new Error('No image data provided');
  }

  if (!/^[A-Za-z0-9+/=]+$/.test(base64Image)) {
    throw new Error('Invalid base64 image data');
  }
}