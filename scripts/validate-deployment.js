#!/usr/bin/env node

/**
 * Luna AI Deployment Validation Script
 * Performs comprehensive pre and post-deployment checks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploymentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checks = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  addCheck(name, status, message = '') {
    this.checks.push({ name, status, message });
    
    if (status === 'error') {
      this.errors.push(`${name}: ${message}`);
      this.log(`❌ ${name}: ${message}`, 'error');
    } else if (status === 'warning') {
      this.warnings.push(`${name}: ${message}`);
      this.log(`⚠️  ${name}: ${message}`, 'warning');
    } else {
      this.log(`✅ ${name}`, 'success');
    }
  }

  // Pre-deployment validation
  async validatePreDeployment() {
    this.log('🔍 Running pre-deployment validation...', 'info');

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion >= 18) {
      this.addCheck('Node.js Version', 'success', `${nodeVersion} (>= 18)`);
    } else {
      this.addCheck('Node.js Version', 'error', `${nodeVersion} (requires >= 18)`);
    }

    // Check package.json
    if (fs.existsSync('package.json')) {
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        this.addCheck('package.json', 'success', 'Valid JSON');
        
        // Check required scripts
        const requiredScripts = ['dev', 'build', 'preview'];
        for (const script of requiredScripts) {
          if (pkg.scripts && pkg.scripts[script]) {
            this.addCheck(`Script: ${script}`, 'success');
          } else {
            this.addCheck(`Script: ${script}`, 'warning', 'Missing but not critical');
          }
        }

        // Check dependencies
        const requiredDeps = ['react', 'react-dom', '@google/genai'];
        for (const dep of requiredDeps) {
          if (pkg.dependencies && pkg.dependencies[dep]) {
            this.addCheck(`Dependency: ${dep}`, 'success', pkg.dependencies[dep]);
          } else {
            this.addCheck(`Dependency: ${dep}`, 'error', 'Missing required dependency');
          }
        }

      } catch (error) {
        this.addCheck('package.json', 'error', 'Invalid JSON format');
      }
    } else {
      this.addCheck('package.json', 'error', 'File not found');
    }

    // Check Vite configuration
    if (fs.existsSync('vite.config.ts')) {
      this.addCheck('Vite Config', 'success', 'vite.config.ts found');
    } else if (fs.existsSync('vite.config.js')) {
      this.addCheck('Vite Config', 'success', 'vite.config.js found');
    } else {
      this.addCheck('Vite Config', 'warning', 'No Vite config found');
    }

    // Check Netlify configuration
    if (fs.existsSync('netlify.toml')) {
      this.addCheck('Netlify Config', 'success', 'netlify.toml found');
      
      // Validate netlify.toml content
      try {
        const netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
        if (netlifyConfig.includes('npm run build')) {
          this.addCheck('Build Command', 'success', 'npm run build configured');
        } else {
          this.addCheck('Build Command', 'warning', 'Build command may be missing');
        }
        
        if (netlifyConfig.includes('publish = "dist"')) {
          this.addCheck('Publish Directory', 'success', 'dist directory configured');
        } else {
          this.addCheck('Publish Directory', 'warning', 'Publish directory may be incorrect');
        }
      } catch (error) {
        this.addCheck('Netlify Config Content', 'error', 'Failed to read netlify.toml');
      }
    } else {
      this.addCheck('Netlify Config', 'error', 'netlify.toml not found');
    }

    // Check redirects file
    if (fs.existsSync('_redirects')) {
      this.addCheck('Redirects File', 'success', '_redirects found');
    } else {
      this.addCheck('Redirects File', 'warning', '_redirects not found (may cause SPA routing issues)');
    }

    // Check public directory and assets
    if (fs.existsSync('public')) {
      this.addCheck('Public Directory', 'success');
      
      const requiredPublicFiles = ['manifest.json', 'service-worker.js'];
      for (const file of requiredPublicFiles) {
        if (fs.existsSync(path.join('public', file))) {
          this.addCheck(`Public Asset: ${file}`, 'success');
        } else {
          this.addCheck(`Public Asset: ${file}`, 'warning', 'PWA feature may not work');
        }
      }
    } else {
      this.addCheck('Public Directory', 'warning', 'No public directory found');
    }

    // Check environment variables
    const requiredEnvVars = ['GEMINI_API_KEY'];
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        this.addCheck(`Environment: ${envVar}`, 'success', 'Set');
      } else {
        this.addCheck(`Environment: ${envVar}`, 'error', 'Not set');
      }
    }

    // Check Git repository
    if (fs.existsSync('.git')) {
      this.addCheck('Git Repository', 'success');
      
      try {
        const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
        if (gitStatus.trim() === '') {
          this.addCheck('Git Status', 'success', 'Working directory clean');
        } else {
          this.addCheck('Git Status', 'warning', 'Uncommitted changes detected');
        }
      } catch (error) {
        this.addCheck('Git Status', 'warning', 'Could not check git status');
      }
    } else {
      this.addCheck('Git Repository', 'warning', 'Not a git repository');
    }

    return this.errors.length === 0;
  }

  // Build validation
  async validateBuild() {
    this.log('🏗️  Validating build process...', 'info');

    try {
      // Check if node_modules exists
      if (!fs.existsSync('node_modules')) {
        this.addCheck('Dependencies', 'error', 'node_modules not found - run npm install');
        return false;
      }

      // Run build
      this.log('Running build...', 'info');
      execSync('npm run build', { stdio: 'pipe', timeout: 300000 });
      this.addCheck('Build Process', 'success', 'Build completed successfully');

      // Check build output
      if (fs.existsSync('dist')) {
        this.addCheck('Build Output', 'success', 'dist directory created');
        
        const requiredFiles = ['index.html'];
        for (const file of requiredFiles) {
          if (fs.existsSync(path.join('dist', file))) {
            this.addCheck(`Build File: ${file}`, 'success');
          } else {
            this.addCheck(`Build File: ${file}`, 'error', 'Missing from build output');
          }
        }

        // Check build size
        const distStats = this.getDirectorySize('dist');
        if (distStats.size < 50 * 1024 * 1024) { // 50MB limit
          this.addCheck('Build Size', 'success', `${(distStats.size / 1024 / 1024).toFixed(2)}MB`);
        } else {
          this.addCheck('Build Size', 'warning', `${(distStats.size / 1024 / 1024).toFixed(2)}MB (large build)`);
        }

      } else {
        this.addCheck('Build Output', 'error', 'dist directory not created');
        return false;
      }

      return true;

    } catch (error) {
      this.addCheck('Build Process', 'error', error.message);
      return false;
    }
  }

  // Post-deployment validation
  async validatePostDeployment(siteUrl) {
    this.log('🌐 Validating deployed site...', 'info');

    if (!siteUrl) {
      this.addCheck('Site URL', 'error', 'No site URL provided');
      return false;
    }

    try {
      // Check site accessibility
      const response = await this.httpCheck(siteUrl);
      if (response.success) {
        this.addCheck('Site Accessibility', 'success', `HTTP ${response.status}`);
      } else {
        this.addCheck('Site Accessibility', 'error', `HTTP ${response.status || 'timeout'}`);
      }

      // Check specific endpoints
      const endpoints = [
        '/manifest.json',
        '/service-worker.js'
      ];

      for (const endpoint of endpoints) {
        const endpointResponse = await this.httpCheck(siteUrl + endpoint);
        if (endpointResponse.success) {
          this.addCheck(`Endpoint: ${endpoint}`, 'success');
        } else {
          this.addCheck(`Endpoint: ${endpoint}`, 'warning', 'Not accessible');
        }
      }

      // Check HTTPS
      if (siteUrl.startsWith('https://')) {
        this.addCheck('HTTPS', 'success', 'Site uses HTTPS');
      } else {
        this.addCheck('HTTPS', 'error', 'Site not using HTTPS (required for PWA)');
      }

      return true;

    } catch (error) {
      this.addCheck('Post-deployment Validation', 'error', error.message);
      return false;
    }
  }

  async httpCheck(url, timeout = 30000) {
    return new Promise((resolve) => {
      try {
        const { execSync } = require('child_process');
        const result = execSync(`curl -s -o /dev/null -w "%{http_code}" --max-time 30 "${url}"`, 
          { encoding: 'utf8', timeout });
        const status = parseInt(result.trim());
        resolve({ success: status >= 200 && status < 400, status });
      } catch (error) {
        resolve({ success: false, status: null });
      }
    });
  }

  getDirectorySize(dirPath) {
    let totalSize = 0;
    let fileCount = 0;

    function calculateSize(currentPath) {
      const stats = fs.statSync(currentPath);
      if (stats.isDirectory()) {
        const files = fs.readdirSync(currentPath);
        files.forEach(file => {
          calculateSize(path.join(currentPath, file));
        });
      } else {
        totalSize += stats.size;
        fileCount++;
      }
    }

    try {
      calculateSize(dirPath);
    } catch (error) {
      // Directory doesn't exist or permission error
    }

    return { size: totalSize, files: fileCount };
  }

  generateReport() {
    const totalChecks = this.checks.length;
    const successCount = this.checks.filter(c => c.status === 'success').length;
    const warningCount = this.warnings.length;
    const errorCount = this.errors.length;

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalChecks,
        success: successCount,
        warnings: warningCount,
        errors: errorCount,
        passed: errorCount === 0
      },
      checks: this.checks,
      errors: this.errors,
      warnings: this.warnings
    };

    // Save report
    fs.writeFileSync('.luna-validation-report.json', JSON.stringify(report, null, 2));

    // Console summary
    console.log('\n📊 Validation Summary:');
    console.log(`   Total checks: ${totalChecks}`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⚠️  Warnings: ${warningCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   Overall: ${errorCount === 0 ? '✅ PASSED' : '❌ FAILED'}`);

    if (this.errors.length > 0) {
      console.log('\n❌ Critical Issues:');
      this.errors.forEach(error => console.log(`   • ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`   • ${warning}`));
    }

    console.log(`\n📄 Full report saved to: .luna-validation-report.json`);

    return report;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const validator = new DeploymentValidator();

  if (args.includes('--help')) {
    console.log(`
Luna AI Deployment Validator

Usage:
  node scripts/validate-deployment.js [options]

Options:
  --pre-deploy     Run pre-deployment validation only
  --build          Run build validation
  --post-deploy    Run post-deployment validation (requires --url)
  --url <url>      Site URL for post-deployment validation
  --all            Run all validations (default)
  --help           Show this help

Examples:
  node scripts/validate-deployment.js --pre-deploy
  node scripts/validate-deployment.js --post-deploy --url https://luna-ai-journal.netlify.app
  node scripts/validate-deployment.js --all
`);
    return;
  }

  try {
    let success = true;

    if (args.includes('--pre-deploy') || args.includes('--all') || args.length === 0) {
      success = await validator.validatePreDeployment() && success;
    }

    if (args.includes('--build') || args.includes('--all')) {
      success = await validator.validateBuild() && success;
    }

    if (args.includes('--post-deploy')) {
      const urlIndex = args.indexOf('--url');
      if (urlIndex !== -1 && args[urlIndex + 1]) {
        const siteUrl = args[urlIndex + 1];
        success = await validator.validatePostDeployment(siteUrl) && success;
      } else {
        console.error('❌ --url required for post-deployment validation');
        success = false;
      }
    }

    const report = validator.generateReport();
    process.exit(success ? 0 : 1);

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DeploymentValidator;
