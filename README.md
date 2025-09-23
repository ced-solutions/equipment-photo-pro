# Equipment Photo Pro

Professional equipment photo enhancement tool for dealerships. Transform your equipment photos with AI-powered enhancement to improve sales presentations.

## Features

- 🚀 **AI-Powered Enhancement**: Advanced image processing with customizable settings
- 📸 **Bulk Processing**: Upload and process multiple images at once
- 🎨 **Multiple Enhancement Options**: Background removal, lighting improvement, color correction, and more
- 💼 **Professional UI**: Modern, responsive interface designed for dealership use
- 🔒 **Secure Processing**: Images are processed securely and not stored permanently
- 📊 **Pricing Tiers**: Flexible plans for different business sizes

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide React Icons
- **Backend**: Node.js, Express.js
- **Image Processing**: Sharp (Node.js image processing library)
- **File Upload**: Multer
- **Development**: Concurrently for running both frontend and backend

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google AI API key (optional, for advanced AI features)

### Installation

1. **Clone and navigate to the project directory**
   ```bash
   cd "Equipment Photo Pro"
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up Google AI (Optional but Recommended)**
   
   a. Get your Google AI API key:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key
   - Copy the API key

   b. Create environment file:
   ```bash
   cp env.example .env
   ```

   c. Edit `.env` and add your API key:
   ```
   GOOGLE_AI_API_KEY=your_actual_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

This will start both the React frontend (port 3000) and Express backend (port 5001) concurrently.

5. **Open your browser**
   Navigate to `http://localhost:3000` to see the application.

## Project Structure

```
Equipment Photo Pro/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Main pages (Home, Upload, Pricing)
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                # Express backend
│   ├── uploads/           # Temporary file storage
│   └── index.js          # Server entry point
├── package.json          # Root package.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run client` - Start only the React frontend
- `npm run server` - Start only the Express backend
- `npm run build` - Build the React app for production
- `npm run install-all` - Install dependencies for both frontend and backend

## Features Overview

### Home Page
- Hero section with clear value proposition
- Feature highlights
- How it works section
- Call-to-action buttons

### Upload & Process Page
- Drag-and-drop file upload
- Real-time image preview
- Customizable enhancement settings
- **Google AI-powered analysis** (when API key is configured)
- Batch processing
- Before/after comparison
- Download enhanced images

### Pricing Page
- Three-tier pricing structure
- Feature comparison
- FAQ section
- Free trial options

### Google AI Integration (Gemini 2.5 Flash)
- **Advanced AI Analysis**: Gemini 2.5 Flash analyzes each equipment photo
- **Intelligent Enhancement Suggestions**: AI provides specific, contextual recommendations
- **Professional Prompt Integration**: Uses your exact Gemini Nano prompt for equipment-specific results
- **Automatic Parameter Tuning**: AI adjusts enhancement settings per image based on content analysis
- **Equipment-Specific Processing**: Recognizes equipment types and applies appropriate enhancements
- **Full-Screen Comparison**: Interactive before/after comparison with slider control
- **Fallback Processing**: Works without API key using manual settings

## Image Enhancement Settings

The application supports various enhancement options:

- **Remove Background**: Clean background removal for professional look
- **Enhance Lighting**: Improve brightness and contrast
- **Improve Colors**: Enhance color saturation and vibrancy
- **Sharpen Details**: Add sharpness for crisp details
- **Remove Scratches**: Basic noise reduction and scratch removal

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/ai-status` - Check Google AI configuration status
- `GET /api/prompt` - Get the Gemini Nano prompt
- `POST /api/ai-suggestions` - Get AI enhancement suggestions for an image
- `POST /api/upload` - Upload and process images with AI enhancement
- `GET /api/download/:filename` - Download processed images

## Future Enhancements

- Google AI/Gemini integration for advanced processing
- User authentication and accounts
- Database integration for user management
- Advanced background removal using AI services
- Batch processing with progress tracking
- Custom enhancement presets
- API access for enterprise customers

## Development Notes

- Images are temporarily stored in `server/uploads/` and cleaned up after 1 hour
- The current implementation uses Sharp for basic image processing
- For production, consider integrating with cloud storage and AI services
- All file uploads are limited to 10MB per file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
