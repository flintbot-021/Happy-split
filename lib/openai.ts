import OpenAI from 'openai';

const client = new OpenAI();

interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
  category: "Drinks" | "Food" | "Desserts";
}

interface ReceiptValidation {
  totals_match: boolean;
  confidence: "high" | "medium" | "low";
}

interface ProcessedReceipt {
  items: ReceiptItem[];
  extracted_total: number;
  calculated_total: number;
  validation: ReceiptValidation;
}

const SYSTEM_PROMPT = `
You are a receipt processing assistant. Analyze the provided receipt text and extract items with high accuracy.

Output Format:
{
  "items": [
    {
      "name": string,      // Item name as shown on receipt
      "price": number,     // Numeric value only
      "quantity": number,  // Default to 1 if not specified
      "category": string   // One of: "Drinks", "Food", "Desserts"
    }
  ],
  "extracted_total": number,      // Total amount shown on receipt
  "calculated_total": number,     // Sum of all item prices
  "validation": {
    "totals_match": boolean,      // Whether extracted_total matches calculated_total
    "confidence": "high" | "medium" | "low"
  }
}

Important Rules:
1. ACCURACY: 
   - Extract items exactly as they appear, preserving original spelling and formatting
   - Pay special attention to prices and quantities
   - If the same item appears multiple times with different prices, treat them as separate items

2. PRICING:
   - Remove currency symbols, only return numeric values
   - Verify that individual prices are consistent with any subtotals or totals shown
   - For items with quantity > 1, ensure price reflects single unit price

3. VALIDATION:
   - Compare the receipt's printed total against the sum of all items
   - If totals don't match, double-check all extracted prices and quantities
   - Set confidence level based on clarity of text and consistency of totals

4. CATEGORIZATION:
   - Categorize items based on description and context
   - Use menu section headers if available to inform categorization
   - Default to "Food" if category is unclear

Example Input:
"RESTAURANT NAME
Coffee 25.00
Coffee 30.00
Coffee 25.00
Subtotal: 80.00
Tax: 10.00
Total: 90.00"

Example Output:
{
  "items": [
    {
      "name": "Coffee",
      "price": 25,
      "quantity": 2,
      "category": "Drinks"
    },
    {
      "name": "Coffee",
      "price": 30,
      "quantity": 1,
      "category": "Drinks"
    }
  ],
  "extracted_total": 90,
  "calculated_total": 80,
  "validation": {
    "totals_match": false,
    "confidence": "high"
  }
}

Note: The difference between totals in this example is due to tax, which is expected.
`;

export async function processReceiptText(text: string): Promise<ProcessedReceipt> {
  try {
    console.log('\n🤖 Text being sent to OpenAI:', text);

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: text,
        }
      ],
      temperature: 0.1, // Lower temperature for more consistent results
      max_tokens: 1000,
    });

    const result = response.choices[0]?.message?.content;
      
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    console.log('\n🤖 OpenAI Raw Response:', result);

    try {
      const cleanedResult = result
        .replace(/```json\n?/, '')
        .replace(/\n?```$/, '')
        .trim();

      if (cleanedResult.startsWith('{')) {
        const parsedResult = JSON.parse(cleanedResult) as ProcessedReceipt;
        
        // Ensure items is always an array
        if (!Array.isArray(parsedResult.items)) {
          parsedResult.items = [];
        }
        
        // Validate and set default values if needed
        if (typeof parsedResult.extracted_total !== 'number') {
          parsedResult.extracted_total = 0;
        }
        
        if (typeof parsedResult.calculated_total !== 'number') {
          parsedResult.calculated_total = parsedResult.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0);
        }
        
        if (!parsedResult.validation) {
          parsedResult.validation = {
            totals_match: false,
            confidence: "low"
          };
        }

        console.log('\n🤖 Final Parsed Result:', JSON.stringify(parsedResult, null, 2));
        return parsedResult;
      } else {
        // Return a valid empty receipt if parsing fails
        return {
          items: [],
          extracted_total: 0,
          calculated_total: 0,
          validation: {
            totals_match: false,
            confidence: "low"
          }
        };
      }
    } catch (parseError) {
      console.error('❌ Parse error:', parseError);
      console.error('❌ Raw response:', result);
      throw new Error('Failed to parse items from receipt');
    }
  } catch (error) {
    console.error('❌ OpenAI error:', error);
    throw error;
  }
} 