#!/bin/bash

# YasFlix Deployment Script
# This script prepares the project for deployment

echo "🚀 YasFlix Deployment Preparation"
echo "=================================="

# Create a temporary deploy directory
DEPLOY_DIR="deploy-temp"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy only the files needed for deployment
echo "📦 Copying production files..."

# Core files
cp index.html $DEPLOY_DIR/
cp style.css $DEPLOY_DIR/
cp README.md $DEPLOY_DIR/

# Source files
mkdir -p $DEPLOY_DIR/src/lib
cp src/main.js $DEPLOY_DIR/src/
cp src/lib/store.js $DEPLOY_DIR/src/lib/
cp src/lib/tmdb.js $DEPLOY_DIR/src/lib/
cp src/lib/notifications.js $DEPLOY_DIR/src/lib/

# Config files
cp package.json $DEPLOY_DIR/
cp netlify.toml $DEPLOY_DIR/
cp vercel.json $DEPLOY_DIR/
cp .gitignore $DEPLOY_DIR/

echo "✅ Production files copied to $DEPLOY_DIR/"
echo ""
echo "📋 Next steps:"
echo "1. Review the files in $DEPLOY_DIR/"
echo "2. Deploy using one of these methods:"
echo "   - Netlify: Drag & drop the $DEPLOY_DIR folder"
echo "   - Vercel: cd $DEPLOY_DIR && vercel"
echo "   - GitHub: Push to GitHub and enable GitHub Pages"
echo ""
echo "🗑️  To clean up: rm -rf $DEPLOY_DIR"
echo ""
echo "🎉 Ready for deployment!"