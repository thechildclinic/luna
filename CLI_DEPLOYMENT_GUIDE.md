# Luna AI - CLI Deployment Guide

## 🚀 One-Command Deployment

Deploy Luna AI Journaling Companion to Netlify with a single command using our production-ready CLI tool.

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Netlify Account** - [Sign up here](https://netlify.com/)
- **Google Gemini API Key** - [Get here](https://makersuite.google.com/app/apikey)

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/thechildclinic/luna.git
cd luna
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Deploy to Production
```bash
# Option 1: Interactive deployment (recommended for first-time)
node deploy.js

# Option 2: With environment variable
GEMINI_API_KEY=your_api_key_here node deploy.js

# Option 3: Using environment setup script first
node scripts/env-setup.js
node deploy.js
```

That's it! The CLI will handle everything automatically.

## CLI Features

### 🔧 Automated Setup
- ✅ Environment validation
- ✅ Dependency installation
- ✅ Build optimization
- ✅ Netlify authentication
- ✅ Site creation/deployment
- ✅ Environment variable configuration
- ✅ Post-deployment verification

### 🛡️ Production Ready
- ✅ Error handling and rollback
- ✅ Build validation
- ✅ Security headers
- ✅ Performance optimization
- ✅ PWA configuration
- ✅ Monitoring setup

### 📊 Deployment Validation
- ✅ Pre-deployment checks
- ✅ Build verification
- ✅ Post-deployment testing
- ✅ Health monitoring

## Detailed Commands

### Environment Setup
```bash
# Interactive environment configuration
node scripts/env-setup.js

# Options:
# 1. Local development setup
# 2. Production deployment setup
# 3. Generate secure config
```

### Deployment Validation
```bash
# Run all validations
node scripts/validate-deployment.js

# Pre-deployment only
node scripts/validate-deployment.js --pre-deploy

# Build validation
node scripts/validate-deployment.js --build

# Post-deployment validation
node scripts/validate-deployment.js --post-deploy --url https://your-site.netlify.app
```

### Main Deployment
```bash
# Full deployment with all checks
node deploy.js

# Get help
node deploy.js --help

# Check version
node deploy.js --version
```

## Environment Variables

### Required
- **GEMINI_API_KEY** - Your Google Gemini API key

### Optional
- **NETLIFY_SITE_NAME** - Custom site name (default: luna-ai-journal)
- **NETLIFY_AUTH_TOKEN** - Netlify access token for CI/CD

## Deployment Process

The CLI follows this automated process:

1. **🔍 Environment Validation**
   - Check Node.js version (18+)
   - Verify Git availability
   - Install/verify Netlify CLI
   - Authenticate with Netlify

2. **🔑 Environment Configuration**
   - Validate API keys
   - Set up environment variables
   - Configure security settings

3. **📦 Repository Setup**
   - Initialize Git if needed
   - Verify repository origin
   - Check for uncommitted changes

4. **🏗️ Build Process**
   - Install dependencies (`npm ci`)
   - Run production build (`npm run build`)
   - Validate build output

5. **🚀 Deployment**
   - Create/update Netlify site
   - Deploy to production
   - Set environment variables
   - Configure custom domain (if specified)

6. **✅ Verification**
   - Test site accessibility
   - Verify PWA functionality
   - Check service worker
   - Generate deployment report

## Troubleshooting

### Common Issues

#### 1. "Node.js version too old"
```bash
# Update Node.js to version 18+
# Download from: https://nodejs.org/
node --version  # Should show v18.x.x or higher
```

#### 2. "Netlify CLI not found"
```bash
# Install globally
npm install -g netlify-cli

# Or the CLI will install it automatically
```

#### 3. "API key invalid"
```bash
# Verify your Gemini API key:
# 1. Should start with "AIza"
# 2. Get from: https://makersuite.google.com/app/apikey
# 3. Ensure it's enabled for Gemini API
```

#### 4. "Build failed"
```bash
# Check build locally first
npm install
npm run build

# If successful, try deployment again
node deploy.js
```

#### 5. "Netlify authentication failed"
```bash
# Manual authentication
netlify login

# Or use access token
netlify login --auth your_token_here
```

### Advanced Troubleshooting

#### Check Deployment Logs
```bash
# View detailed logs
netlify logs --site=your-site-name

# Check build logs
netlify build --dry-run
```

#### Validate Configuration
```bash
# Run comprehensive validation
node scripts/validate-deployment.js --all

# Check specific components
node scripts/validate-deployment.js --pre-deploy
```

#### Debug Mode
```bash
# Enable verbose logging
DEBUG=* node deploy.js

# Check deployment artifacts
ls -la dist/
cat .luna-deploy.json
```

## Production Optimizations

### Automatic Optimizations
- **Bundle splitting** for better caching
- **Asset compression** and minification
- **Service worker** for offline functionality
- **Security headers** including CSP
- **Performance monitoring** and error tracking

### Manual Optimizations
- **Custom domain** configuration
- **CDN** setup for global distribution
- **Analytics** integration
- **Error tracking** service integration

## Monitoring & Maintenance

### Built-in Monitoring
The deployed app includes:
- **Performance tracking** - Page load times, API response times
- **Error monitoring** - Automatic error capture and reporting
- **Usage analytics** - Session tracking, feature usage
- **Health checks** - Service availability monitoring

### Accessing Monitoring Data
```bash
# In browser console:
window.lunaMonitoring.getAnalyticsData()

# View deployment info:
cat .luna-deploy.json
```

### Regular Maintenance
```bash
# Redeploy with latest changes
git pull origin main
node deploy.js

# Update dependencies
npm update
npm audit fix
node deploy.js

# Check site health
node scripts/validate-deployment.js --post-deploy --url https://your-site.netlify.app
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy Luna AI
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: node deploy.js
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

## Security Best Practices

### Environment Variables
- ✅ Never commit API keys to version control
- ✅ Use Netlify's secure environment variable storage
- ✅ Rotate API keys regularly
- ✅ Monitor API usage and quotas

### Deployment Security
- ✅ HTTPS enforced automatically
- ✅ Security headers configured
- ✅ Content Security Policy enabled
- ✅ No sensitive data in client bundle

## Support

### Getting Help
1. **Check this guide** for common solutions
2. **Run validation** to identify issues
3. **Check deployment logs** for detailed errors
4. **Review error reports** in `.luna-deploy-error.json`

### Reporting Issues
Include this information when reporting deployment issues:
- Deployment ID (from `.luna-deploy.json`)
- Error logs (from `.luna-deploy-error.json`)
- Validation report (from `.luna-validation-report.json`)
- Node.js and npm versions
- Operating system

### Resources
- [Netlify Documentation](https://docs.netlify.com/)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Luna GitHub Repository](https://github.com/thechildclinic/luna)

---

**🌙 Luna AI - Compassionate AI Journaling Companion**

*Built with ❤️ for mental wellness and emotional processing*
