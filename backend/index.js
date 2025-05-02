const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    error: 'Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Helper function to create error response
const createErrorResponse = (status, error, message) => {
  return {
    success: false,
    error,
    message
  };
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ToneCraft API' });
});

// API Routes
app.get('/api/data', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ]
  });
});

// Tone adjustment route
app.post('/api/tone', async (req, res) => {
  try {
    const { text, toneLevel, verbosityLevel = 'normal' } = req.body;
    
    // Validate input
    if (!text) {
      return res.status(400).json(
        createErrorResponse('Bad Request', 'Missing Text', 'Text is required')
      );
    }
    
    if (!toneLevel || typeof toneLevel !== 'number' || toneLevel < 1 || toneLevel > 10) {
      return res.status(400).json(
        createErrorResponse('Bad Request', 'Invalid Tone Level', 'Tone level must be a number between 1 and 10')
      );
    }
    
    if (verbosityLevel && !['concise', 'normal', 'detailed'].includes(verbosityLevel)) {
      return res.status(400).json(
        createErrorResponse('Bad Request', 'Invalid Verbosity Level', 'Verbosity level must be one of: concise, normal, detailed')
      );
    }
    
    // Check for API key
    if (!MISTRAL_API_KEY) {
      return res.status(500).json(
        createErrorResponse('Configuration Error', 'Missing API Key', 'Mistral API key is not configured')
      );
    }
    
    // Prepare verbosity instructions
    let verbosityInstruction = '';
    switch(verbosityLevel) {
      case 'concise':
        verbosityInstruction = 'CRITICAL: Return ONLY the adjusted text with absolutely no other text. Never include explanations. Never describe what you changed. Only output the final result text.';
        break;
      case 'detailed':
        verbosityInstruction = 'CRITICAL: Return ONLY the adjusted text with absolutely no other text. Never include explanations. Never describe what you changed. Only output the final result text.';
        break;
      default: // 'normal'
        verbosityInstruction = 'CRITICAL: Return ONLY the adjusted text with absolutely no other text. Never include explanations. Never describe what you changed. Only output the final result text.';
    }
    
    // Call Mistral API
    try {
      const response = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        {
          model: 'mistral-small',
          messages: [
            {
              role: 'system',
              content: `You are a text tone adjuster. Your ONLY job is to adjust the tone of the provided text based on the instructions. IMPORTANT RULES:
1. DO NOT add any explanations, comments, or descriptions about what you changed
2. DO NOT enclose the adjusted text in quotes
3. DO NOT include the tone level in your response
4. DO NOT add any indicators like "(tone adjusted to level X/10)"
5. Return ONLY the plain adjusted text with no formatting or additional text

The tone level ranges from 1 (very casual/informal) to 10 (very formal/professional). Current tone level requested: ${toneLevel}/10.`
            },
            {
              role: 'user',
              content: `Adjust this text's tone to level ${toneLevel}/10 (1=casual, 10=formal). ${verbosityInstruction} Do not add quotes or tone level indicators. Text: ${text}`
            }
          ],
          temperature: 0.7,
          max_tokens: 150,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MISTRAL_API_KEY}`
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      // Extract the generated text from the response
      const adjustedText = response.data.choices[0].message.content;
      
      // Clean the adjusted text - remove quotes and tone level information
      let cleanedText = adjustedText.trim();
      
      // Remove quotes if present at beginning and end
      if ((cleanedText.startsWith('"') && cleanedText.endsWith('"')) || 
          (cleanedText.startsWith("'") && cleanedText.endsWith("'"))) {
        cleanedText = cleanedText.substring(1, cleanedText.length - 1);
      }
      
      // Remove any tone level information that might have been included
      cleanedText = cleanedText.replace(/\(tone adjusted to level \d+\/10\)/gi, '');
      cleanedText = cleanedText.replace(/tone adjusted to level \d+\/10/gi, '');
      cleanedText = cleanedText.replace(/tone level \d+\/10/gi, '');
      
      // Further cleanup to remove any trailing or leading spaces after removals
      cleanedText = cleanedText.trim();
      
      // Return the cleaned adjusted text
      res.json({
        success: true,
        original: text,
        toneLevel,
        verbosityLevel,
        adjustedText: cleanedText
      });
    } catch (apiError) {
      console.error('Mistral API Error:', apiError);
      
      // Handle different API error types with more descriptive messages
      if (apiError.response) {
        // The request was made and the server responded with an error status code
        const status = apiError.response.status;
        const errorData = apiError.response.data;
        
        let errorType = 'API Error';
        let errorMessage = 'Failed to adjust tone';
        
        if (status === 401) {
          errorType = 'Authentication Error';
          errorMessage = 'Invalid Mistral API key';
        } else if (status === 429) {
          errorType = 'Rate Limit Error';
          errorMessage = 'Too many requests to Mistral API. Please try again later.';
        } else if (status === 500) {
          errorType = 'Mistral Server Error';
          errorMessage = 'Mistral API is experiencing issues. Please try again later.';
        } else if (errorData && errorData.error) {
          errorType = 'Mistral API Error';
          errorMessage = errorData.error.message || 'Error from Mistral API';
        }
        
        return res.status(status).json(
          createErrorResponse(errorType, errorType, errorMessage)
        );
      } else if (apiError.request) {
        // The request was made but no response was received
        return res.status(503).json(
          createErrorResponse('Service Unavailable', 'Timeout Error', 'Mistral API did not respond. Please try again later.')
        );
      } else {
        // Something happened in setting up the request
        return res.status(500).json(
          createErrorResponse('Request Error', 'Request Setup Error', apiError.message || 'Error setting up the request to Mistral API')
        );
      }
    }
  } catch (error) {
    console.error('General error adjusting tone:', error);
    
    return res.status(500).json(
      createErrorResponse('Server Error', 'Internal Server Error', 'An unexpected error occurred while processing your request')
    );
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    message: 'API is running normally',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 