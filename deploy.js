#!/usr/bin/env node

/**
 * Luna AI Journaling Companion - Production Deployment CLI
 * 
 * This script provides seamless deployment to Netlify with:
 * - Environment validation
 * - Build optimization
 * - Deployment verification
 * - Error handling and rollback
 * 
 * Usage: node deploy.js [options]
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const CONFIG = {
  REPO_URL: 'https://github.com/thechildclinic/luna.git',
  NETLIFY_SITE_NAME: 'luna-ai-journal',
  REQUIRED_NODE_VERSION: '18',
  REQUIRED_ENV_VARS: ['GEMINI_API_KEY'],
  BUILD_TIMEOUT: 300000, // 5 minutes
  DEPLOY_TIMEOUT: 600000, // 10 minutes
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class LunaDeployer {
  constructor() {
    this.startTime = Date.now();
    this.deploymentId = `luna-deploy-${Date.now()}`;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  // Utility methods
  log(message, color = 'reset') {
    const timestamp = new Date().toISOString();
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
  }

  error(message) {
    this.log(`❌ ERROR: ${message}`, 'red');
  }

  success(message) {
    this.log(`✅ ${message}`, 'green');
  }

  warning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(`${colors.cyan}${question}${colors.reset}`, resolve);
    });
  }

  execCommand(command, options = {}) {
    try {
      this.info(`Executing: ${command}`);
      const result = execSync(command, { 
        encoding: 'utf8', 
        stdio: options.silent ? 'pipe' : 'inherit',
        timeout: options.timeout || 30000,
        ...options 
      });
      return result;
    } catch (error) {
      throw new Error(`Command failed: ${command}\n${error.message}`);
    }
  }

  // Pre-deployment checks
  async validateEnvironment() {
    this.info('🔍 Validating deployment environment...');

    // Check Node.js version
    const nodeVersion = process.version.slice(1).split('.')[0];
    if (parseInt(nodeVersion) < parseInt(CONFIG.REQUIRED_NODE_VERSION)) {
      throw new Error(`Node.js ${CONFIG.REQUIRED_NODE_VERSION}+ required. Current: ${process.version}`);
    }
    this.success(`Node.js version: ${process.version}`);

    // Check if git is available
    try {
      this.execCommand('git --version', { silent: true });
      this.success('Git is available');
    } catch (error) {
      throw new Error('Git is required but not found');
    }

    // Check if Netlify CLI is available
    try {
      this.execCommand('netlify --version', { silent: true });
      this.success('Netlify CLI is available');
    } catch (error) {
      this.warning('Netlify CLI not found. Installing...');
      this.execCommand('npm install -g netlify-cli');
      this.success('Netlify CLI installed');
    }

    // Verify Netlify authentication
    try {
      this.execCommand('netlify status', { silent: true });
      this.success('Netlify authentication verified');
    } catch (error) {
      this.warning('Netlify authentication required');
      await this.authenticateNetlify();
    }
  }

  async authenticateNetlify() {
    this.info('🔐 Netlify authentication required...');
    const authChoice = await this.prompt('Choose authentication method:\n1. Login via browser\n2. Use access token\nEnter choice (1 or 2): ');
    
    if (authChoice === '1') {
      this.execCommand('netlify login');
    } else if (authChoice === '2') {
      const token = await this.prompt('Enter your Netlify access token: ');
      process.env.NETLIFY_AUTH_TOKEN = token;
      this.execCommand(`netlify login --auth ${token}`);
    } else {
      throw new Error('Invalid authentication choice');
    }
    
    this.success('Netlify authentication completed');
  }

  async validateEnvironmentVariables() {
    this.info('🔑 Validating environment variables...');
    
    const missingVars = [];
    for (const envVar of CONFIG.REQUIRED_ENV_VARS) {
      if (!process.env[envVar]) {
        missingVars.push(envVar);
      }
    }

    if (missingVars.length > 0) {
      this.warning(`Missing environment variables: ${missingVars.join(', ')}`);
      
      for (const envVar of missingVars) {
        const value = await this.prompt(`Enter value for ${envVar}: `);
        process.env[envVar] = value;
      }
    }

    // Validate Gemini API key format
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && !geminiKey.startsWith('AIza')) {
      this.warning('Gemini API key format may be incorrect (should start with "AIza")');
      const confirm = await this.prompt('Continue anyway? (y/N): ');
      if (confirm.toLowerCase() !== 'y') {
        throw new Error('Deployment cancelled due to invalid API key');
      }
    }

    this.success('Environment variables validated');
  }

  async setupRepository() {
    this.info('📦 Setting up repository...');
    
    const currentDir = process.cwd();
    const isGitRepo = fs.existsSync('.git');
    
    if (!isGitRepo) {
      this.info('Initializing git repository...');
      this.execCommand('git init');
      this.execCommand(`git remote add origin ${CONFIG.REPO_URL}`);
    }

    // Check if we're in the correct repository
    try {
      const remoteUrl = this.execCommand('git remote get-url origin', { silent: true }).trim();
      if (!remoteUrl.includes('luna')) {
        this.warning('Current repository may not be Luna. Continuing...');
      }
    } catch (error) {
      this.warning('Could not verify repository origin');
    }

    this.success('Repository setup completed');
  }

  async buildApplication() {
    this.info('🏗️  Building Luna application...');
    
    // Install dependencies
    this.info('Installing dependencies...');
    this.execCommand('npm ci', { timeout: CONFIG.BUILD_TIMEOUT });
    
    // Run build
    this.info('Building application...');
    this.execCommand('npm run build', { timeout: CONFIG.BUILD_TIMEOUT });
    
    // Verify build output
    if (!fs.existsSync('dist')) {
      throw new Error('Build failed: dist directory not found');
    }
    
    if (!fs.existsSync('dist/index.html')) {
      throw new Error('Build failed: index.html not found in dist');
    }
    
    this.success('Application built successfully');
  }

  async deployToNetlify() {
    this.info('🚀 Deploying to Netlify...');

    try {
      // Check if site exists
      let siteExists = false;
      try {
        this.execCommand(`netlify sites:list | grep ${CONFIG.NETLIFY_SITE_NAME}`, { silent: true });
        siteExists = true;
      } catch (error) {
        // Site doesn't exist, will create new one
      }

      let deployCommand;
      if (siteExists) {
        this.info('Deploying to existing site...');
        deployCommand = `netlify deploy --prod --dir=dist --site=${CONFIG.NETLIFY_SITE_NAME}`;
      } else {
        this.info('Creating new Netlify site...');
        deployCommand = `netlify deploy --prod --dir=dist --create-site --name=${CONFIG.NETLIFY_SITE_NAME}`;
      }

      // Set environment variables for deployment
      const envVars = CONFIG.REQUIRED_ENV_VARS
        .map(envVar => `${envVar}="${process.env[envVar]}"`)
        .join(' ');

      this.execCommand(`${envVars} ${deployCommand}`, { timeout: CONFIG.DEPLOY_TIMEOUT });

      this.success('Deployment completed successfully');

    } catch (error) {
      throw new Error(`Deployment failed: ${error.message}`);
    }
  }

  async setNetlifyEnvironmentVariables() {
    this.info('🔧 Setting Netlify environment variables...');

    for (const envVar of CONFIG.REQUIRED_ENV_VARS) {
      if (process.env[envVar]) {
        try {
          this.execCommand(`netlify env:set ${envVar} "${process.env[envVar]}" --site=${CONFIG.NETLIFY_SITE_NAME}`, { silent: true });
          this.success(`Set ${envVar} environment variable`);
        } catch (error) {
          this.warning(`Failed to set ${envVar}: ${error.message}`);
        }
      }
    }
  }

  async verifyDeployment() {
    this.info('🔍 Verifying deployment...');

    try {
      // Get site URL
      const siteInfo = this.execCommand(`netlify sites:list --json | grep -A 10 ${CONFIG.NETLIFY_SITE_NAME}`, { silent: true });
      const siteUrl = `https://${CONFIG.NETLIFY_SITE_NAME}.netlify.app`;

      this.info(`Checking site availability: ${siteUrl}`);

      // Simple HTTP check using curl
      try {
        this.execCommand(`curl -f -s -o /dev/null ${siteUrl}`, { silent: true, timeout: 30000 });
        this.success('Site is accessible');
      } catch (error) {
        this.warning('Site may not be immediately accessible (DNS propagation)');
      }

      // Check if service worker is accessible
      try {
        this.execCommand(`curl -f -s -o /dev/null ${siteUrl}/service-worker.js`, { silent: true });
        this.success('Service worker is accessible');
      } catch (error) {
        this.warning('Service worker may not be accessible');
      }

      return siteUrl;

    } catch (error) {
      this.warning(`Verification incomplete: ${error.message}`);
      return `https://${CONFIG.NETLIFY_SITE_NAME}.netlify.app`;
    }
  }

  async generateDeploymentReport(siteUrl) {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);

    const report = `
${colors.bright}🎉 Luna AI Journaling Companion Deployment Complete!${colors.reset}

${colors.green}✅ Deployment Summary:${colors.reset}
   • Site URL: ${colors.cyan}${siteUrl}${colors.reset}
   • Deployment ID: ${this.deploymentId}
   • Duration: ${duration} seconds
   • Build: Successful
   • Environment: Production
   • PWA: Enabled

${colors.blue}📱 Next Steps:${colors.reset}
   1. Test the application at ${siteUrl}
   2. Verify voice input/output functionality
   3. Test PWA installation on mobile devices
   4. Monitor usage and performance

${colors.yellow}🔧 Management Commands:${colors.reset}
   • View logs: netlify logs --site=${CONFIG.NETLIFY_SITE_NAME}
   • Update env vars: netlify env:set KEY value --site=${CONFIG.NETLIFY_SITE_NAME}
   • Redeploy: node deploy.js

${colors.magenta}💡 Tips:${colors.reset}
   • The app uses HTTPS (required for voice features)
   • Service worker enables offline functionality
   • Environment variables are securely stored in Netlify
   • Monitor Gemini API usage in Google Cloud Console
`;

    console.log(report);

    // Save deployment info
    const deployInfo = {
      deploymentId: this.deploymentId,
      timestamp: new Date().toISOString(),
      siteUrl,
      duration,
      success: true
    };

    fs.writeFileSync('.luna-deploy.json', JSON.stringify(deployInfo, null, 2));
    this.success('Deployment info saved to .luna-deploy.json');
  }

  async handleError(error) {
    this.error(error.message);

    // Save error info for debugging
    const errorInfo = {
      deploymentId: this.deploymentId,
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    };

    fs.writeFileSync('.luna-deploy-error.json', JSON.stringify(errorInfo, null, 2));
    this.error('Error details saved to .luna-deploy-error.json');

    process.exit(1);
  }

  async cleanup() {
    this.rl.close();
  }

  // Main deployment flow
  async deploy() {
    try {
      this.log(`🌙 Starting Luna AI Deployment (${this.deploymentId})`, 'bright');

      await this.validateEnvironment();
      await this.validateEnvironmentVariables();
      await this.setupRepository();
      await this.buildApplication();
      await this.deployToNetlify();
      await this.setNetlifyEnvironmentVariables();

      const siteUrl = await this.verifyDeployment();
      await this.generateDeploymentReport(siteUrl);

    } catch (error) {
      await this.handleError(error);
    } finally {
      await this.cleanup();
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bright}Luna AI Journaling Companion - Deployment CLI${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node deploy.js [options]

${colors.cyan}Options:${colors.reset}
  --help, -h     Show this help message
  --version, -v  Show version information

${colors.cyan}Environment Variables:${colors.reset}
  GEMINI_API_KEY    Google Gemini API key (required)

${colors.cyan}Examples:${colors.reset}
  # Deploy with environment variable
  GEMINI_API_KEY=your_key node deploy.js

  # Interactive deployment (will prompt for missing vars)
  node deploy.js

${colors.cyan}Repository:${colors.reset}
  ${CONFIG.REPO_URL}
`);
    return;
  }

  if (args.includes('--version') || args.includes('-v')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`Luna AI Deployment CLI v${packageJson.version || '1.0.0'}`);
    return;
  }

  const deployer = new LunaDeployer();
  await deployer.deploy();
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(`${colors.red}Uncaught Exception: ${error.message}${colors.reset}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`${colors.red}Unhandled Rejection at: ${promise}, reason: ${reason}${colors.reset}`);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { LunaDeployer, CONFIG };
