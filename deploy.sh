#!/bin/bash

# Mentorscue Accounting Dashboard - Deployment Script
echo "🚀 Starting deployment process..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy: Professional accounting dashboard with Next.js"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  No remote repository found!"
    echo "Please run these commands manually:"
    echo "1. Create a GitHub repository named 'mentorscue-accounting'"
    echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/mentorscue-accounting.git"
    echo "3. Run: git push -u origin main"
    exit 1
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Deployment script completed!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://vercel.com"
echo "2. Import your GitHub repository"
echo "3. Add environment variables:"
echo "   - NEXT_PUBLIC_SUPABASE_URL=https://zalpataijefzngdzaccu.supabase.co"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbHBhdGFpamVmem5nZHphY2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjkyNTUsImV4cCI6MjA2OTQwNTI1NX0._hfR1BvdmzJ6MlzakIOolSCLQvGQflH2KqRlZvNTTyo"
echo "4. Deploy!"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"