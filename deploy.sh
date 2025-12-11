#!/bin/bash

# ==============================================
# Noor Tajweed - Deploy to Cloudflare Pages
# ==============================================
# Usage: ./deploy.sh
# ==============================================

set -e  # Exit on error

echo "🚀 Noor Tajweed - Cloudflare Pages Deploy"
echo "=========================================="

# Step 1: Install dependencies (if needed)
echo "📦 Installing dependencies..."
pnpm install

# Step 2: Build for production
echo "🔨 Building for production..."
pnpm run build

# Step 3: Deploy to Cloudflare Pages
echo "☁️  Deploying to Cloudflare Pages..."
npx wrangler pages deploy dist --project-name=noor-tajweed

echo ""
echo "✅ Deployment complete!"
echo "🌐 Visit: https://noor-tajweed.pages.dev"
