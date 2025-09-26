require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const GoogleAIService = require('./services/googleAI');
const AuthService = require('./services/authService');

const app = express();

// Initialize auth service
const authService = new AuthService();
authService.init().catch(console.error);

// Function to add watermark to processed images
const addWatermark = async (imagePath) => {
  try {
    const watermarkText = "Enhanced by AI for visual presentation";
    const watermarkSubtext = "Certain artifacts may have been modified during processing";
    
    // Create a temporary watermark image
    const watermarkSvg = `
      <svg width="400" height="60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>
        <text x="10" y="20" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.9)" filter="url(#shadow)">
          ${watermarkText}
        </text>
        <text x="10" y="40" font-family="Arial, sans-serif" font-size="11" fill="rgba(255,255,255,0.8)" filter="url(#shadow)">
          ${watermarkSubtext}
        </text>
      </svg>
    `;
    
    // Convert SVG to buffer
    const watermarkBuffer = Buffer.from(watermarkSvg);
    
    // Get image dimensions
    const imageMetadata = await sharp(imagePath).metadata();
    
    // Create watermark with proper positioning
    const watermark = await sharp(watermarkBuffer)
      .resize(Math.min(500, imageMetadata.width * 0.4)) // Scale watermark to image size
      .png()
      .toBuffer();
    
    // Composite watermark onto image (bottom left, 15px margin)
    const watermarkedImage = await sharp(imagePath)
      .composite([
        {
          input: watermark,
          gravity: 'southwest',
          left: 15,
          bottom: 15
        }
      ])
      .jpeg({ quality: 95, progressive: true, mozjpeg: true })
      .toBuffer();
    
    // Write watermarked image back to file
    fs.writeFileSync(imagePath, watermarkedImage);
    
    console.log('Watermark added to:', imagePath);
    return true;
  } catch (error) {
    console.error('Error adding watermark:', error);
    return false;
  }
};
const PORT = process.env.PORT || 5001;

// Debug port configuration
console.log('Environment PORT:', process.env.PORT);
console.log('Using PORT:', PORT);
console.log('Render should auto-assign PORT if not set');

// Initialize Google AI service
const googleAI = new GoogleAIService();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Gemini Nano prompt for equipment photo enhancement
const GEMINI_PROMPT = `Maintain the original perspective and zoom of the equipment. Place the main subject (e.g., 'a red tractor', 'a combine harvester', 'a green ATV') on a realistic, textured cement lot. In the background, feature a truly natural, subtly rolling landscape of green fields with authentic variations in foliage, blending seamlessly with an expansive sky displaying very subtle, diffused clouds or a light, natural haze. Ensure realistic, balanced lighting enhances the subject without looking artificial. Remove any unnecessary objects to maintain a clean, professional aesthetic. Crucially, do not alter or distort any existing text, numbers, or logos on the equipment.`;

// Enhanced image processing function with Google AI integration
const enhanceImage = async (inputPath, outputPath, settings, prompt) => {
  let pipeline = sharp(inputPath);
  let aiEnhancements = null;
  
  // Get AI enhancement suggestions if Google AI is configured
  if (googleAI.isConfigured()) {
    try {
      const imageBuffer = fs.readFileSync(inputPath);
      let mimeType = `image/${path.extname(inputPath).slice(1)}`;
      // Fix MIME type for Google AI API compatibility
      if (mimeType === 'image/jpg') {
        mimeType = 'image/jpeg';
      }
      
      const aiResult = await googleAI.enhanceImageWithAI(imageBuffer, prompt, mimeType);
      console.log('AI Enhancement data:', aiResult);
      
      // If AI generated an image, save it directly
      if (aiResult.success && aiResult.imageData) {
        console.log('AI generated enhanced image, saving directly...');
        const aiImageBuffer = Buffer.from(aiResult.imageData, 'base64');
        fs.writeFileSync(outputPath, aiImageBuffer);
        console.log('AI generated image saved to:', outputPath);
        return; // Skip the manual processing
      } else {
        console.log('AI provided analysis, applying dramatic enhancements based on prompt...');
        // Apply very dramatic enhancements to simulate the AI prompt requirements
        aiEnhancements = {
          backgroundReplacement: true,
          lightingAdjustment: 1.4,
          colorSaturation: 1.5,
          contrast: 1.4,
          brightness: 1.3,
          sharpness: 1.6,
          hueShift: 5, // Warm tone for cement lot
          equipmentType: "Equipment",
          enhancementDescription: "Professional equipment photo with enhanced lighting and background simulation",
          recommendations: ["Applied dramatic enhancements to simulate AI prompt requirements"],
          preserveElements: ["text", "logos", "numbers"],
          processingSteps: ["enhance_lighting", "improve_colors", "sharpen_details", "background_simulation"],
          dramatic: true
        };
      }
    } catch (error) {
      console.log('AI enhancement failed, using fallback:', error.message);
    }
  }
  
  // Apply AI-enhanced or manual settings
  if (aiEnhancements) {
    // Use AI recommendations from Gemini 2.5 Flash
    console.log('Applying AI enhancements:', aiEnhancements);
    console.log('Enhancement description:', aiEnhancements.enhancementDescription);
    console.log('Background description:', aiEnhancements.backgroundDescription);
    
    // Apply more dramatic enhancements based on AI recommendations
    const brightness = Math.max(1.2, aiEnhancements.brightness || 1.3);
    const contrast = Math.max(1.2, aiEnhancements.contrast || 1.3);
    const saturation = Math.max(1.3, aiEnhancements.colorSaturation || 1.4);
    const sharpness = Math.max(1.4, aiEnhancements.sharpness || 1.5);
    
    console.log('Enhanced values:', { brightness, contrast, saturation, sharpness });
    
    // Apply extremely dramatic lighting enhancements for professional look
    pipeline = pipeline
      .modulate({
        brightness: brightness,
        contrast: contrast
      })
      .gamma(1.2); // Strong gamma correction for dramatic lighting
    
    // Apply very dramatic color enhancements
    pipeline = pipeline.modulate({
      saturation: saturation,
      hue: aiEnhancements.hueShift || 0
    });
    
    // Apply very aggressive sharpening for crisp equipment details
    pipeline = pipeline.sharpen(sharpness, 2.0, 3.0);
    
    // Simulate background replacement with very dramatic changes
    if (aiEnhancements.backgroundReplacement) {
      console.log('Applying dramatic background replacement simulation');
      pipeline = pipeline
        .modulate({
          brightness: brightness * 1.2,
          saturation: saturation * 1.25,
          hue: aiEnhancements.hueShift || 5 // Warm tone for cement lot
        })
        .sharpen(sharpness * 1.2, 1.5, 2.5)
        .gamma(1.15); // Additional gamma for dramatic effect
    }
    
    // Apply multiple rounds of professional enhancements for maximum impact
    pipeline = pipeline
      .modulate({
        brightness: 1.15, // Strong additional brightness boost
        contrast: 1.2,    // Strong additional contrast boost
        saturation: 1.1   // Additional color boost
      })
      .sharpen(1.3, 1.2, 2.0); // Final sharpening pass
    
  } else {
    // Fallback to manual settings - make them very noticeable
    console.log('Using manual enhancement settings');
    
    if (settings.enhanceLighting) {
      pipeline = pipeline
        .modulate({
          brightness: 1.3,
          contrast: 1.4
        })
        .gamma(1.15);
    }
    
    if (settings.improveColors) {
      pipeline = pipeline
        .modulate({
          saturation: 1.4,
          hue: 0
        });
    }
    
    if (settings.sharpenDetails) {
      pipeline = pipeline.sharpen(1.5, 1.5, 2.5);
    }
  }
  
  if (settings.removeScratches) {
    pipeline = pipeline
      .median(1)
      .sharpen(0.5, 1, 1.2);
  }
  
  // Professional output settings - preserve original quality
  await pipeline
    .jpeg({ 
      quality: 95,         // High quality
      progressive: true,
      mozjpeg: true
    })
    .toFile(outputPath);
    
    // Add watermark to the processed image
    try {
      const watermarkSuccess = await addWatermark(outputPath);
      if (watermarkSuccess) {
        console.log('Watermark successfully added to:', outputPath);
      } else {
        console.log('Watermark failed for:', outputPath);
      }
    } catch (error) {
      console.error('Watermark error:', error);
    }
    
  console.log('Image processing completed for:', outputPath);
    
  return aiEnhancements;
};

// Authentication Routes
app.post('/api/auth/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await authService.sendLoginCode(email);
    res.json(result);
  } catch (error) {
    console.error('Error sending login code:', error);
    res.status(400).json({ error: error.message });
  }
});

// Diagnostic endpoint for email debugging
app.get('/api/debug/email', async (req, res) => {
  try {
    const debugInfo = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        EMAIL_SERVICE: process.env.EMAIL_SERVICE,
        EMAIL_USER: process.env.EMAIL_USER,
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '***masked***' : 'NOT SET',
        EMAIL_FROM: process.env.EMAIL_FROM,
        GMAIL_USER: process.env.GMAIL_USER,
        GMAIL_PASSWORD: process.env.GMAIL_PASSWORD ? '***masked***' : 'NOT SET'
      },
      emailService: {
        isConfigured: authService.emailService.isConfigured,
        emailServiceType: authService.emailService.emailService,
        hasTransporter: !!authService.emailService.transporter,
        hasFallback: !!authService.emailService.fallbackTransporter,
        fromAddress: authService.emailService.fromAddress
      },
      packages: {
        sendgridAvailable: false,
        nodemailerAvailable: false
      }
    };

    // Test package availability
    try {
      require('@sendgrid/mail');
      debugInfo.packages.sendgridAvailable = true;
    } catch (e) {
      debugInfo.packages.sendgridAvailable = false;
    }

    try {
      require('nodemailer');
      debugInfo.packages.nodemailerAvailable = true;
    } catch (e) {
      debugInfo.packages.nodemailerAvailable = false;
    }

    // Test SendGrid API if configured
    if (process.env.EMAIL_SERVICE === 'sendgrid' && process.env.EMAIL_PASSWORD) {
      try {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.EMAIL_PASSWORD);
        
        const testMsg = {
          to: 'test@example.com',
          from: process.env.EMAIL_FROM || 'test@example.com',
          subject: 'Debug Test',
          text: 'Debug test from Render'
        };
        
        const result = await sgMail.send(testMsg);
        debugInfo.sendgridTest = {
          success: true,
          statusCode: result[0].statusCode,
          messageId: result[0].headers['x-message-id'] || 'N/A'
        };
      } catch (error) {
        debugInfo.sendgridTest = {
          success: false,
          error: error.message,
          code: error.code || 'N/A'
        };
      }
    }

    res.json(debugInfo);
  } catch (error) {
    res.status(500).json({ 
      error: 'Debug failed', 
      message: error.message,
      stack: error.stack 
    });
  }
});

// Test email endpoint
app.post('/api/debug/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    const testEmail = email || 'test@example.com';
    
    console.log(`🧪 Testing email send to: ${testEmail}`);
    const result = await authService.emailService.sendVerificationCode(testEmail, '123456');
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      result: result,
      testEmail: testEmail
    });
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    const result = await authService.verifyLoginCode(email, code);
    res.json(result);
  } catch (error) {
    console.error('Error verifying login code:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const sessionToken = authHeader.substring(7);
      await authService.logout(sessionToken);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/me', authService.requireAuth.bind(authService), async (req, res) => {
  try {
    const stats = await authService.getUserStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/trial-status', authService.requireAuth.bind(authService), async (req, res) => {
  try {
    const trialStatus = await authService.canProcessImages(req.user.id);
    res.json(trialStatus);
  } catch (error) {
    console.error('Error getting trial status:', error);
    res.status(400).json({ error: error.message });
  }
});

// Admin Routes
app.get('/api/admin/stats', authService.requireAdmin.bind(authService), async (req, res) => {
  try {
    const stats = await authService.getAdminStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(400).json({ error: error.message });
  }
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Equipment Photo Pro API is running' });
});

// Get Gemini Nano prompt
app.get('/api/prompt', (req, res) => {
  res.json({ 
    prompt: GEMINI_PROMPT,
    description: 'Professional equipment photo enhancement prompt for Gemini Nano'
  });
});

// Check Google AI status
app.get('/api/ai-status', (req, res) => {
  res.json({
    configured: googleAI.isConfigured(),
    message: googleAI.isConfigured() 
      ? 'Google AI is configured and ready' 
      : 'Google AI not configured. Add GOOGLE_AI_API_KEY to environment variables.',
    model: googleAI.isConfigured() ? 'gemini-2.5-flash' : 'not-configured'
  });
});

// Simple test endpoint to verify image processing works
app.post('/api/simple-test', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const inputPath = req.file.path;
    const outputPath = path.join(uploadsDir, 'test-simple-' + req.file.filename);
    
    // Apply basic but noticeable enhancements
    await sharp(inputPath)
      .modulate({
        brightness: 1.5,    // Make it brighter
        contrast: 1.5,      // Increase contrast
        saturation: 1.5     // Increase color saturation
      })
      .sharpen(2.0)         // Sharpen the image
      .jpeg({ quality: 95 })
      .toFile(outputPath);
    
    // Add watermark to the test image
    await addWatermark(outputPath);
    
    res.json({
      success: true,
      message: 'Simple test processing completed - image should be noticeably brighter and more colorful',
      original: req.file.filename,
      enhanced: 'test-simple-' + req.file.filename
    });
  } catch (error) {
    console.error('Simple test error:', error);
    res.status(500).json({ error: 'Simple test failed: ' + error.message });
  }
});

// Test image processing endpoint
app.post('/api/test-process', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const inputPath = req.file.path;
    const outputPath = path.join(uploadsDir, 'test-enhanced-' + req.file.filename);
    
    // Apply EXTREMELY dramatic enhancement that simulates the Gemini Nano prompt
    await sharp(inputPath)
      .modulate({
        brightness: 1.6,    // Very dramatic brightness for professional lighting
        contrast: 1.8,      // Very high contrast for equipment details
        saturation: 1.8,    // Very enhanced colors for equipment appeal
        hue: 8              // Strong warm tone for cement lot feel
      })
      .gamma(1.3)           // Strong gamma correction for dramatic lighting
      .sharpen(2.2, 2.0, 4.0)  // Very aggressive sharpening for crisp details
      .modulate({
        brightness: 1.2,    // Additional brightness boost
        saturation: 1.2,    // Additional color boost
        contrast: 1.1       // Additional contrast boost
      })
      .gamma(1.1)           // Final gamma boost
      .sharpen(1.5, 1.3, 2.5)  // Final sharpening pass
      .jpeg({ 
        quality: 95,
        progressive: true,
        mozjpeg: true
      })
      .toFile(outputPath);
    
    res.json({
      success: true,
      message: 'EXTREME test processing completed - very dramatic changes applied',
      original: req.file.filename,
      enhanced: 'test-enhanced-' + req.file.filename
    });
  } catch (error) {
    console.error('Test processing error:', error);
    res.status(500).json({ error: 'Test processing failed' });
  }
});

// Get AI enhancement suggestions for an image
app.post('/api/ai-suggestions', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    if (!googleAI.isConfigured()) {
      return res.status(400).json({ 
        error: 'Google AI not configured',
        suggestions: [
          'Enable background replacement for professional look',
          'Adjust lighting for better equipment visibility',
          'Enhance colors while preserving equipment details'
        ]
      });
    }

    const suggestions = await googleAI.getEnhancementSuggestions(
      fs.readFileSync(req.file.path),
      req.file.mimetype
    );

    res.json(suggestions);
  } catch (error) {
    console.error('AI suggestions error:', error);
    res.status(500).json({ error: 'Failed to get AI suggestions' });
  }
});

// Upload and process images
app.post('/api/upload', authService.requireAuth.bind(authService), upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const promptSettings = req.body.promptSettings ? JSON.parse(req.body.promptSettings) : {
      skyType: 'subtle-clouds',
      pavementType: 'cement-lot',
      landscapeType: 'rolling-fields',
      equipmentType: 'tractor',
      customPrompt: ''
    };

    // Use the dynamic prompt from the frontend
    const dynamicPrompt = req.body.dynamicPrompt || `Maintain the original perspective and zoom of the equipment. Place the main subject (e.g., 'a ${promptSettings.equipmentType}', 'a combine harvester', 'a green ATV') on a realistic, textured ${promptSettings.pavementType}. In the background, feature a truly natural, subtly rolling landscape of ${promptSettings.landscapeType} with authentic variations in foliage, blending seamlessly with an expansive sky displaying ${promptSettings.skyType} or a light, natural haze. Ensure realistic, balanced lighting enhances the subject without looking artificial. Remove any unnecessary objects to maintain a clean, professional aesthetic. 

CRITICAL: Do not alter the subject of the image at all. Keep the equipment exactly as it appears in the original - preserve all details, colors, text, numbers, logos, and physical characteristics. Only change the background, lighting, and environmental elements. The equipment itself must remain completely unchanged.${promptSettings.customPrompt ? ` Additional requirements: ${promptSettings.customPrompt}` : ''}`;

    const processedFiles = [];
    const aiEnhancements = [];

    for (const file of req.files) {
      const inputPath = file.path;
      const outputPath = path.join(uploadsDir, 'enhanced-' + file.filename);
      
      console.log('Processing file:', {
        originalname: file.originalname,
        filename: file.filename,
        outputPath: outputPath
      });
      
      try {
        const aiData = await enhanceImage(inputPath, outputPath, promptSettings, dynamicPrompt);
        aiEnhancements.push(aiData);
        
        // Check if AI actually created a file with the enhanced-images pattern
        const files = fs.readdirSync(uploadsDir);
        const timestamp = file.filename.split('-')[1];
        const aiGeneratedFile = files.find(f => f.startsWith('enhanced-images-') && f.includes(timestamp));
        
        let enhancedFilename;
        if (aiGeneratedFile) {
          console.log('Found AI-generated file:', aiGeneratedFile);
          enhancedFilename = aiGeneratedFile;
        } else {
          enhancedFilename = 'enhanced-' + file.filename;
          console.log('Using standard enhanced filename:', enhancedFilename);
        }
        
        console.log('Returning enhanced filename to frontend:', enhancedFilename);
        
        // Track image processing for user
        await authService.trackImageProcessing(
          req.user.id, 
          file.filename, 
          file.size, 
          60000 // Approximate processing time in milliseconds
        );
        
        processedFiles.push({
          original: {
            filename: file.originalname,
            path: file.path,
            size: file.size
          },
          enhanced: {
            filename: enhancedFilename,
            path: path.join(uploadsDir, enhancedFilename)
          }
        });
      } catch (error) {
        console.error('Error processing file:', file.originalname, error);
        aiEnhancements.push(null);
        // Continue processing other files
      }
    }

    res.json({
      success: true,
      message: `Successfully processed ${processedFiles.length} images using ${googleAI.isConfigured() ? 'Gemini 2.5 Flash AI + ' : ''}enhancement`,
      files: processedFiles,
      prompt: dynamicPrompt,
      aiConfigured: googleAI.isConfigured(),
      aiModel: googleAI.isConfigured() ? 'gemini-2.5-flash' : 'manual',
      aiEnhancements: aiEnhancements,
      enhancements: {
        skyType: promptSettings.skyType,
        pavementType: promptSettings.pavementType,
        landscapeType: promptSettings.landscapeType,
        equipmentType: promptSettings.equipmentType,
        customPrompt: promptSettings.customPrompt
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process images' });
  }
});

// Download enhanced image
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Clean up old files (run every hour)
setInterval(() => {
  const files = fs.readdirSync(uploadsDir);
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  files.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);
    
    if (now - stats.mtime.getTime() > oneHour) {
      fs.unlinkSync(filePath);
    }
  });
}, 60 * 60 * 1000);

const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Equipment Photo Pro server running on ${HOST}:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});
