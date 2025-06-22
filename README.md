# AI English Tutor

A voice-powered conversational English practice application that helps users improve their English speaking skills through AI-powered feedback and natural conversation.

## Features

- 🎤 **Speech Recognition**: Real-time voice input using Web Speech API
- 🤖 **AI Tutor**: Powered by Google Gemini AI for natural conversation
- 🔊 **Text-to-Speech**: Natural voice responses
- ✅ **Grammar Correction**: Subtle corrections and suggestions
- 💬 **Conversational Flow**: Engaging follow-up questions

## Tech Stack

### Frontend
- React 18
- Axios for API calls
- Web Speech API
- Speech Synthesis API

### Backend
- Spring Boot 3
- Google Gemini AI API
- REST API

## Getting Started

### Prerequisites
- Node.js (v16+)
- Java 17+
- Google Gemini API key

### Backend Setup
1. Navigate to backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Add your Gemini API key to \`application.properties\`:
   \`\`\`properties
   gemini.api.key=your_api_key_here
   \`\`\`

3. Run the application:
   \`\`\`bash
   ./mvnw spring-boot:run
   \`\`\`

### Frontend Setup
1. Navigate to frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm start
   \`\`\`

## Browser Compatibility

- ✅ Chrome (Recommended)
- ✅ Safari
- ✅ Edge
- ❌ Firefox (Limited speech recognition support)
- ❌ Brave (Privacy features may block speech recognition)

## API Endpoints

- \`POST /api/tutor/converse\` - Send user message and receive AI response
