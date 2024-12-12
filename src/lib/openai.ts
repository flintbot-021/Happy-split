import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const processReceiptImage = async (
  base64Image: string
): Promise<{ text: string }> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract and categorize items from this restaurant receipt into Drinks, Food, and Desserts. Format as JSON."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    return { text: response.choices[0].message.content || '' };
  } catch (error) {
    console.error('Error processing receipt:', error);
    throw new Error('Failed to process receipt');
  }
};