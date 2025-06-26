# Luna - AI Journaling Companion

A compassionate AI journaling companion for reflection and emotional processing, featuring voice interaction and multiple themes. Built with React, Vite, and Google's Gemini AI.

## Features

- 🤖 AI-powered conversational journaling with Google Gemini
- 🎤 Voice input and text-to-speech output
- 🎨 Multiple beautiful themes (Cosmic Night, Serene Dawn, Forest Whisper)
- 📱 Progressive Web App (PWA) with offline capabilities
- 🔒 Privacy-focused with anonymous symbolic names
- 💾 Local storage for conversation history

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Create a `.env.local` file in the project root
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🚀 One-Command Deployment

Deploy Luna AI to production with a single command using our CLI tool:

```bash
# Clone and deploy
git clone https://github.com/thechildclinic/luna.git
cd luna
npm install
node deploy.js
```

The CLI handles everything automatically:
- ✅ Environment validation
- ✅ Build optimization
- ✅ Netlify deployment
- ✅ Environment variables
- ✅ Post-deployment verification

### Alternative Deployment Methods

#### Using Make (Recommended)
```bash
make bootstrap  # First-time setup
make deploy     # Deploy to production
```

#### Using npm scripts
```bash
npm run deploy:setup    # Configure environment
npm run deploy:check    # Validate setup
npm run deploy          # Deploy to Netlify
```

#### Manual Netlify Deployment
See [NETLIFY_DEPLOYMENT_GUIDE.md](./NETLIFY_DEPLOYMENT_GUIDE.md) for manual deployment instructions.

## Project Structure

```
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # API services (Gemini, Storage)
├── public/             # Static assets
├── netlify.toml        # Netlify configuration
├── _redirects          # SPA routing configuration
└── vite.config.ts      # Vite build configuration
```

## Technologies Used

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **AI**: Google Gemini API
- **Deployment**: Netlify
- **PWA**: Service Worker, Web App Manifest
