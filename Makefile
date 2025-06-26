# Luna AI Journaling Companion - Deployment Makefile
# Provides simple commands for deployment and development

.PHONY: help install dev build deploy setup validate clean

# Default target
help:
	@echo "🌙 Luna AI Deployment Commands"
	@echo ""
	@echo "Setup & Development:"
	@echo "  make install    - Install dependencies"
	@echo "  make setup      - Configure environment variables"
	@echo "  make dev        - Start development server"
	@echo ""
	@echo "Building & Testing:"
	@echo "  make build      - Build for production"
	@echo "  make validate   - Run deployment validation"
	@echo "  make check      - Pre-deployment checks"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy     - Deploy to Netlify (full process)"
	@echo "  make quick      - Quick deploy (skip validations)"
	@echo ""
	@echo "Utilities:"
	@echo "  make icons      - Generate app icons"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make logs       - View deployment logs"
	@echo ""

# Installation and setup
install:
	@echo "📦 Installing dependencies..."
	npm ci

setup:
	@echo "🔧 Setting up environment..."
	node scripts/env-setup.js

# Development
dev:
	@echo "🚀 Starting development server..."
	npm run dev

# Building
build:
	@echo "🏗️  Building for production..."
	npm run build

# Validation
validate:
	@echo "🔍 Running full validation..."
	npm run deploy:validate

check:
	@echo "✅ Running pre-deployment checks..."
	npm run deploy:check

# Deployment
deploy:
	@echo "🚀 Deploying Luna AI to production..."
	npm run deploy

quick:
	@echo "⚡ Quick deployment (skip validations)..."
	node deploy.js --skip-validation

# Utilities
icons:
	@echo "🎨 Generating app icons..."
	npm run generate:icons

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist/
	rm -rf node_modules/.vite/
	rm -f .luna-deploy*.json
	rm -f .luna-validation*.json

logs:
	@echo "📋 Viewing deployment logs..."
	@if [ -f .luna-deploy.json ]; then \
		echo "Last deployment:"; \
		cat .luna-deploy.json | jq .; \
	else \
		echo "No deployment logs found. Run 'make deploy' first."; \
	fi

# Advanced targets
verify:
	@echo "🔍 Verifying deployed site..."
	@if [ -f .luna-deploy.json ]; then \
		SITE_URL=$$(cat .luna-deploy.json | jq -r '.siteUrl'); \
		npm run deploy:verify -- --url $$SITE_URL; \
	else \
		echo "No deployment found. Run 'make deploy' first."; \
	fi

status:
	@echo "📊 Deployment status..."
	@if command -v netlify >/dev/null 2>&1; then \
		netlify status; \
	else \
		echo "Netlify CLI not found. Install with: npm install -g netlify-cli"; \
	fi

# One-command setup for new users
bootstrap: install setup icons validate
	@echo "🎉 Luna AI is ready for deployment!"
	@echo "Run 'make deploy' to deploy to production."

# Production deployment with full validation
production: clean install build validate deploy verify
	@echo "🌟 Production deployment complete!"

# Development workflow
dev-setup: install setup dev

# Emergency deployment (minimal checks)
emergency:
	@echo "🚨 Emergency deployment (minimal validation)..."
	npm ci
	npm run build
	node deploy.js --emergency
