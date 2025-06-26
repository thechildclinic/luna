# Luna AI Journaling Companion - Netlify Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Luna AI Journaling Companion to Netlify. The application is a React-based Progressive Web App (PWA) built with Vite that uses Google's Gemini AI for conversational journaling.

## Prerequisites

- A Netlify account (free tier is sufficient)
- A Google Cloud Platform account with Gemini API access
- Git repository containing the Luna codebase
- Node.js 18+ (for local testing)

## Required Environment Variables

The following environment variable must be configured in Netlify:

### `GEMINI_API_KEY`
- **Description**: API key for Google's Gemini AI service
- **Required**: Yes
- **Where to get it**: Google AI Studio (https://makersuite.google.com/app/apikey)
- **Format**: String (e.g., `AIzaSyC...`)
- **Security**: Keep this secret and never commit to version control

## Deployment Steps

### 1. Prepare Your Repository

Ensure your repository contains all the deployment files created:
- `netlify.toml` - Netlify configuration
- `_redirects` - SPA routing configuration
- `public/` directory with assets
- Updated `vite.config.ts` with production optimizations

### 2. Connect Repository to Netlify

1. Log in to your Netlify dashboard
2. Click "New site from Git"
3. Choose your Git provider (GitHub, GitLab, Bitbucket)
4. Select the Luna repository
5. Configure build settings (see below)

### 3. Build Settings

Netlify should automatically detect these settings from `netlify.toml`, but verify:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node.js version**: 18

### 4. Environment Variables Configuration

In your Netlify site dashboard:

1. Go to **Site settings** → **Environment variables**
2. Click **Add variable**
3. Add the following:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Google Gemini API key
   - **Scopes**: Select "All scopes" or at minimum "Builds"

### 5. Deploy

1. Click **Deploy site**
2. Monitor the build process in the **Deploys** tab
3. Once successful, your site will be available at the provided Netlify URL

## Build Configuration Details

### Netlify Configuration (`netlify.toml`)

The configuration includes:
- Build settings optimized for Vite
- SPA redirects for React Router
- Security headers including CSP
- Caching strategies for static assets
- PWA-specific headers

### Vite Configuration

Updated for production with:
- Environment variable injection
- Bundle optimization and code splitting
- Asset handling for PWA features
- Source map generation for debugging

## Post-Deployment Verification

### 1. Basic Functionality
- [ ] Site loads without errors
- [ ] Chat interface is responsive
- [ ] Voice input/output works (requires HTTPS)
- [ ] Settings drawer functions properly
- [ ] Theme switching works

### 2. PWA Features
- [ ] Manifest.json loads correctly
- [ ] Service worker registers successfully
- [ ] App can be installed on mobile devices
- [ ] Offline functionality works (cached assets)

### 3. AI Integration
- [ ] Gemini API connection works
- [ ] Chat responses are generated
- [ ] Error handling for API failures

## Troubleshooting

### Common Issues

1. **Build Fails with "npm not found"**
   - Ensure Node.js version is set to 18 in build settings
   - Check that package.json is in the repository root

2. **Environment Variable Not Found**
   - Verify `GEMINI_API_KEY` is set in Netlify dashboard
   - Check variable name spelling (case-sensitive)
   - Ensure variable scope includes "Builds"

3. **404 Errors on Page Refresh**
   - Verify `_redirects` file is in the repository root
   - Check that SPA redirects are configured in `netlify.toml`

4. **Service Worker Issues**
   - Clear browser cache and hard refresh
   - Check browser console for service worker errors
   - Verify all cached assets exist

5. **CSP Violations**
   - Check browser console for Content Security Policy errors
   - Update CSP headers in `netlify.toml` if needed
   - Ensure all external resources are whitelisted

### Performance Optimization

1. **Enable Netlify Analytics** (optional)
   - Monitor site performance and usage
   - Identify optimization opportunities

2. **Configure Branch Deploys**
   - Set up preview deployments for development branches
   - Test changes before merging to main

3. **Enable Form Handling** (if adding contact forms)
   - Netlify provides built-in form processing
   - No backend required for simple forms

## Security Considerations

1. **API Key Security**
   - Never commit API keys to version control
   - Use Netlify's environment variables
   - Consider API key rotation policies

2. **Content Security Policy**
   - Configured to allow necessary external resources
   - Blocks unauthorized script execution
   - Update as needed for new dependencies

3. **HTTPS Enforcement**
   - Netlify provides automatic HTTPS
   - Required for PWA features and voice input
   - Configured in security headers

## Monitoring and Maintenance

1. **Build Notifications**
   - Configure Slack/email notifications for build failures
   - Monitor deploy logs regularly

2. **Dependency Updates**
   - Keep dependencies updated for security
   - Test thoroughly before deploying updates

3. **API Usage Monitoring**
   - Monitor Gemini API usage and quotas
   - Set up billing alerts if using paid tier

## Support Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Google AI Studio](https://makersuite.google.com/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)

## Quick Reference

### Essential Environment Variables
```
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### Build Settings Summary
```
Build command: npm run build
Publish directory: dist
Node version: 18
```

### Key Files Created for Deployment
- `netlify.toml` - Main configuration
- `_redirects` - SPA routing
- `public/manifest.json` - PWA manifest
- `public/service-worker.js` - Offline functionality
- `generate-icons.js` - Icon generation script

## Next Steps

After successful deployment:
1. Test all functionality thoroughly
2. Set up monitoring and analytics
3. Configure custom domain (optional)
4. Set up continuous deployment workflows
5. Plan for scaling and performance optimization
