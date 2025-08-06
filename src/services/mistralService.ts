import { Mistral } from '@mistralai/mistralai';

const apiKey = import.meta.env.VITE_MISTRAL_API_KEY || 'GTq7WIgbPGsZvaEAeimxSAspQ7XDGUGm';

console.log('Mistral API Key loaded:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No');

if (!apiKey) {
  console.warn('Mistral API key not found. Please set VITE_MISTRAL_API_KEY in your environment variables.');
} else {
  // Validate API key format (Mistral keys are typically 32 characters long)
  if (apiKey.length < 20) {
    console.warn('Mistral API key seems too short. Please verify your API key.');
  }
}

const mistral = new Mistral({
  apiKey: apiKey || '',
  // Add any additional configuration if needed for browser usage
});

// Test the client initialization
if (apiKey) {
  console.log('Mistral client initialized successfully');
}

export interface DocumentGenerationRequest {
  type: 'pdf' | 'ppt' | 'sheets';
  prompt: string;
  title?: string;
  pages?: number;
  slides?: number;
  rows?: number;
  columns?: number;
}

export interface GeneratedContent {
  title: string;
  content: any;
  metadata?: any;
}

export class MistralService {
  static async generateDocument(request: DocumentGenerationRequest): Promise<GeneratedContent> {
    if (!apiKey) {
      throw new Error('Mistral API key not configured');
    }

    try {
      console.log('Generating document:', request.type, 'with prompt:', request.prompt);
      let systemPrompt = '';
      let userPrompt = request.prompt;

      switch (request.type) {
        case 'pdf':
          systemPrompt = `You are a professional document generator. Create structured content for a PDF document based on the user's request. 
          Return a JSON object with:
          - title: Document title
          - sections: Array of sections with title and content
          - metadata: Additional document info
          
          Format the content in a way that's suitable for PDF generation with proper headings, paragraphs, and structure.`;
          break;

        case 'ppt':
          systemPrompt = `You are a presentation expert. Create structured content for a PowerPoint presentation based on the user's request.
          Return a JSON object with:
          - title: Presentation title
          - slides: Array of slides with title, content, and speaker notes
          - theme: Suggested color scheme and design
          
          Each slide should have a clear title and bullet points or content that's suitable for presentation.`;
          break;

        case 'sheets':
          systemPrompt = `You are a spreadsheet expert. Create structured data for a spreadsheet based on the user's request.
          Return a JSON object with:
          - title: Spreadsheet title
          - headers: Array of column headers
          - data: Array of rows with data
          - formulas: Suggested formulas for calculations
          
          Structure the data in a tabular format that's suitable for spreadsheet applications.`;
          break;
      }

      console.log('Calling Mistral API with system prompt:', systemPrompt.substring(0, 100) + '...');
      
      const chatResponse = await mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        maxTokens: 2000,
      });

      console.log('Mistral API response received:', chatResponse);

      const responseContent = chatResponse.choices?.[0]?.message?.content;
      
      if (!responseContent) {
        throw new Error('No response from Mistral API');
      }

      // Try to parse JSON response
      let parsedContent;
      try {
        // Extract JSON from the response if it's wrapped in markdown
        const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || responseContent.match(/```\n([\s\S]*?)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : responseContent;
        parsedContent = JSON.parse(jsonString);
      } catch (parseError) {
        // If JSON parsing fails, create a structured response
        parsedContent = {
          title: `Generated ${request.type.toUpperCase()} Document`,
          content: responseContent,
          metadata: {
            generatedAt: new Date().toISOString(),
            type: request.type
          }
        };
      }

      return parsedContent;

    } catch (error: any) {
      console.error('Error generating document with Mistral:', error);
      
      // Handle specific API errors
      if (error.status === 401) {
        throw new Error(`Authentication failed: Invalid API key. Please check your Mistral API key.`);
      } else if (error.status === 429) {
        throw new Error(`Rate limit exceeded. Please wait a moment and try again.`);
      } else if (error.status === 400) {
        throw new Error(`Bad request: ${error.message || 'Invalid request parameters'}`);
      } else if (error.message?.includes('fetch')) {
        throw new Error(`Network error: Please check your internet connection.`);
      }
      
      throw new Error(`Failed to generate ${request.type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async generateQuickContent(prompt: string): Promise<string> {
    console.log('generateQuickContent called with prompt:', prompt);
    console.log('API Key available:', !!apiKey, 'Length:', apiKey?.length);
    
    if (!apiKey) {
      throw new Error('Mistral API key not configured');
    }

    try {
      console.log('Making API call to Mistral...');
      
      const chatResponse = await mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 1000,
      });

      console.log('Mistral API response:', chatResponse);
      
      const content = chatResponse.choices?.[0]?.message?.content;
      console.log('Extracted content:', content);
      
      return content || 'No response generated';
    } catch (error: any) {
      console.error('Error generating quick content:', error);
      
      // Handle specific API errors
      if (error.status === 401) {
        throw new Error(`Authentication failed: Invalid API key. Please check your Mistral API key.`);
      } else if (error.status === 429) {
        throw new Error(`Rate limit exceeded. Please wait a moment and try again.`);
      } else if (error.status === 400) {
        throw new Error(`Bad request: ${error.message || 'Invalid request parameters'}`);
      } else if (error.message?.includes('fetch')) {
        throw new Error(`Network error: Please check your internet connection.`);
      }
      
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}