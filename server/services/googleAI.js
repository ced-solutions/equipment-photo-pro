const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

class GoogleAIService {
  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY;
    this.genAI = null;
    this.model = null;
    this.imageModel = null;
    
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      this.imageModel = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });
      console.log('Google AI service initialized with Gemini 2.5 Flash and image generation');
    }
  }

  isConfigured() {
    return !!this.apiKey && !!this.model && !!this.imageModel;
  }

    async enhanceImageWithAI(imageBuffer, prompt, mimeType = 'image/jpeg') {
      // Ensure we use the correct MIME type for Google AI API
      if (mimeType === 'image/jpg') {
        mimeType = 'image/jpeg';
      }
    if (!this.isConfigured()) {
      throw new Error('Google AI API key not configured');
    }

    try {
      // Convert image buffer to base64
      const base64Image = imageBuffer.toString('base64');
      
      // Create the image part for the API
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      };

      // First, analyze the existing image to understand what equipment we have
      const analysisPrompt = `Analyze this equipment image and describe:
1. What type of equipment is shown (tractor, combine harvester, ATV, etc.)
2. The color of the equipment
3. Any visible text, numbers, or logos
4. The current background
5. The current lighting conditions

Provide a detailed description that could be used to recreate this equipment in a professional setting.`;
      
      console.log('Analyzing existing image...');
      const analysisResult = await this.model.generateContent([analysisPrompt, imagePart]);
      const analysisResponse = await analysisResult.response;
      const equipmentDescription = analysisResponse.text();
      
      console.log('Equipment analysis:', equipmentDescription);
      
      // Now generate a new enhanced image based on the analysis
      const fullPrompt = `Create a professional equipment photo based on this description: ${equipmentDescription}

Apply these enhancement requirements:
${prompt}

Generate a new image that:
1. Shows the same type of equipment with the same colors and details
2. Places the equipment on a realistic, textured cement lot
3. Features a natural, subtly rolling landscape of green fields in the background
4. Includes an expansive sky with subtle, diffused clouds or light natural haze
5. Has realistic, balanced lighting that enhances the subject without looking artificial
6. Maintains a clean, professional aesthetic
7. Preserves all text, numbers, and logos from the original equipment

The image should look professional and suitable for a dealership listing.`;

      console.log('Generating enhanced image with Gemini 2.5 Flash image model...');
      
      // Try to generate enhanced image using the image model
      console.log('Attempting image generation with Gemini 2.5 Flash...');
      const result = await this.imageModel.generateContent([fullPrompt, imagePart]);
      const response = await result.response;
      
      console.log('Response structure:', JSON.stringify(response, null, 2));
      
      // Look for image data in the response
      if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        console.log('Found response parts, checking for image data...');
        for (const part of response.candidates[0].content.parts) {
          console.log('Part type:', part.text ? 'text' : 'inlineData');
          if (part.inlineData && part.inlineData.data) {
            console.log('Generated enhanced image successfully!');
            console.log('Image data length:', part.inlineData.data.length);
            console.log('MIME type:', part.inlineData.mimeType);
            return {
              success: true,
              imageData: part.inlineData.data,
              mimeType: part.inlineData.mimeType || 'image/png',
              message: 'Image enhanced successfully with AI'
            };
          }
        }
        console.log('No image data found in response parts');
      } else {
        console.log('No response candidates or parts found');
      }
      
      // If no image data found, return the text response for analysis
      const text = response.text();
      console.log('No image generated, got text response:', text);
      
      return {
        success: false,
        message: 'AI provided analysis instead of image generation',
        analysis: text,
        fallback: true
      };
      
    } catch (error) {
      console.error('Google AI image generation error:', error);
      
      // Check if it's a quota exceeded error
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('Too Many Requests')) {
        console.log('Google AI quota exceeded, falling back to manual processing');
        return {
          success: false,
          message: 'Google AI quota exceeded - using manual enhancement',
          quotaExceeded: true,
          fallback: true
        };
      }
      
      throw new Error('Failed to enhance image with Google AI: ' + error.message);
    }
  }

  async getEnhancementSuggestions(imageBuffer, mimeType = 'image/jpeg') {
    if (!this.isConfigured()) {
      return {
        suggestions: [
          'Enable background replacement for professional look',
          'Adjust lighting for better equipment visibility',
          'Enhance colors while preserving equipment details',
          'Apply sharpening for crisp equipment features'
        ]
      };
    }

    try {
      const base64Image = imageBuffer.toString('base64');
      
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      };

      const prompt = `Analyze this equipment image and suggest specific enhancements for a professional dealership listing. Focus on:
1. Background improvements
2. Lighting adjustments
3. Color enhancements
4. Detail sharpening
5. Any issues that need fixing

Provide 3-5 specific, actionable suggestions.`;

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      return {
        suggestions: text.split('\n').filter(line => line.trim().length > 0)
      };
    } catch (error) {
      console.error('Google AI suggestion error:', error);
      return {
        suggestions: [
          'Enable background replacement for professional look',
          'Adjust lighting for better equipment visibility',
          'Enhance colors while preserving equipment details'
        ]
      };
    }
  }
}

module.exports = GoogleAIService;