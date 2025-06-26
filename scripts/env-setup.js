#!/usr/bin/env node

/**
 * Environment Setup Script for Luna AI
 * Helps configure environment variables securely
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

class EnvironmentSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async prompt(question, isSecret = false) {
    return new Promise((resolve) => {
      if (isSecret) {
        // Hide input for secrets
        process.stdout.write(question);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        
        let input = '';
        process.stdin.on('data', (char) => {
          if (char === '\u0003') { // Ctrl+C
            process.exit();
          } else if (char === '\r' || char === '\n') {
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdout.write('\n');
            resolve(input);
          } else if (char === '\u007f') { // Backspace
            if (input.length > 0) {
              input = input.slice(0, -1);
              process.stdout.write('\b \b');
            }
          } else {
            input += char;
            process.stdout.write('*');
          }
        });
      } else {
        this.rl.question(question, resolve);
      }
    });
  }

  validateGeminiApiKey(key) {
    if (!key) return false;
    if (!key.startsWith('AIza')) return false;
    if (key.length < 30) return false;
    return true;
  }

  async setupLocalEnvironment() {
    console.log('🔧 Setting up local development environment...\n');

    const envPath = '.env.local';
    let envContent = '';

    // Check if .env.local already exists
    if (fs.existsSync(envPath)) {
      const overwrite = await this.prompt('⚠️  .env.local already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        return;
      }
    }

    // Get Gemini API Key
    let geminiKey = '';
    while (!this.validateGeminiApiKey(geminiKey)) {
      geminiKey = await this.prompt('Enter your Gemini API Key: ', true);
      if (!this.validateGeminiApiKey(geminiKey)) {
        console.log('❌ Invalid API key format. Should start with "AIza" and be at least 30 characters.');
      }
    }

    envContent += `# Luna AI - Local Development Environment\n`;
    envContent += `# Generated on ${new Date().toISOString()}\n\n`;
    envContent += `GEMINI_API_KEY=${geminiKey}\n`;

    // Optional Netlify configuration
    const setupNetlify = await this.prompt('Configure Netlify settings? (y/N): ');
    if (setupNetlify.toLowerCase() === 'y') {
      const siteName = await this.prompt('Netlify site name (leave empty for default): ');
      if (siteName.trim()) {
        envContent += `NETLIFY_SITE_NAME=${siteName.trim()}\n`;
      }

      const authToken = await this.prompt('Netlify auth token (optional): ', true);
      if (authToken.trim()) {
        envContent += `NETLIFY_AUTH_TOKEN=${authToken.trim()}\n`;
      }
    }

    // Write .env.local file
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Environment file created: ${envPath}`);

    // Update .gitignore to ensure .env.local is ignored
    this.updateGitignore();

    console.log('\n🎉 Local environment setup complete!');
    console.log('You can now run: npm run dev');
  }

  async setupProductionEnvironment() {
    console.log('🚀 Setting up production environment...\n');

    // Check if Netlify CLI is available
    try {
      require('child_process').execSync('netlify --version', { stdio: 'ignore' });
    } catch (error) {
      console.log('❌ Netlify CLI not found. Please install it first:');
      console.log('npm install -g netlify-cli');
      return;
    }

    const siteName = await this.prompt('Netlify site name: ');
    if (!siteName.trim()) {
      console.log('❌ Site name is required for production setup.');
      return;
    }

    let geminiKey = '';
    while (!this.validateGeminiApiKey(geminiKey)) {
      geminiKey = await this.prompt('Enter your Gemini API Key: ', true);
      if (!this.validateGeminiApiKey(geminiKey)) {
        console.log('❌ Invalid API key format.');
      }
    }

    try {
      // Set environment variables in Netlify
      const { execSync } = require('child_process');
      execSync(`netlify env:set GEMINI_API_KEY "${geminiKey}" --site=${siteName}`, { stdio: 'inherit' });
      
      console.log('✅ Production environment variables set successfully!');
      console.log(`🌐 Site: ${siteName}`);
      
    } catch (error) {
      console.log('❌ Failed to set production environment variables.');
      console.log('Please set them manually in the Netlify dashboard.');
    }
  }

  updateGitignore() {
    const gitignorePath = '.gitignore';
    const envEntries = [
      '.env.local',
      '.env.*.local',
      '.luna-deploy.json',
      '.luna-deploy-error.json'
    ];

    let gitignoreContent = '';
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }

    let updated = false;
    for (const entry of envEntries) {
      if (!gitignoreContent.includes(entry)) {
        gitignoreContent += `\n${entry}`;
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(gitignorePath, gitignoreContent);
      console.log('✅ Updated .gitignore');
    }
  }

  async generateSecureConfig() {
    console.log('🔐 Generating secure configuration...\n');

    const config = {
      deployment: {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      },
      security: {
        csp: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://esm.sh"],
          'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com"],
          'font-src': ["'self'", "https://fonts.gstatic.com"],
          'connect-src': ["'self'", "https://generativelanguage.googleapis.com"],
          'img-src': ["'self'", "data:", "blob:"],
          'media-src': ["'self'", "blob:"]
        }
      },
      monitoring: {
        enabled: true,
        errorTracking: true,
        performanceMonitoring: true
      }
    };

    fs.writeFileSync('luna.config.json', JSON.stringify(config, null, 2));
    console.log('✅ Secure configuration generated: luna.config.json');
  }

  async cleanup() {
    this.rl.close();
  }

  async run() {
    try {
      console.log('🌙 Luna AI Environment Setup\n');
      
      const choice = await this.prompt(
        'Choose setup type:\n' +
        '1. Local development\n' +
        '2. Production deployment\n' +
        '3. Generate secure config\n' +
        'Enter choice (1-3): '
      );

      switch (choice) {
        case '1':
          await this.setupLocalEnvironment();
          break;
        case '2':
          await this.setupProductionEnvironment();
          break;
        case '3':
          await this.generateSecureConfig();
          break;
        default:
          console.log('Invalid choice. Exiting.');
      }

    } catch (error) {
      console.error('❌ Setup failed:', error.message);
    } finally {
      await this.cleanup();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const setup = new EnvironmentSetup();
  setup.run();
}

module.exports = EnvironmentSetup;
