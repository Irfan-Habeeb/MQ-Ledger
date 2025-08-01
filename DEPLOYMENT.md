# 🚀 Vercel Deployment Guide

## Prerequisites

1. **GitHub Account** - For repository hosting
2. **Vercel Account** - For deployment (free tier available)
3. **Supabase Account** - Already configured

## Step 1: Push to GitHub

### 1.1 Initialize Git Repository
```bash
cd mentorscue-accounting
git init
git add .
git commit -m "Initial commit: Professional accounting dashboard"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Name it: `mentorscue-accounting`
4. Make it **Public** (for free Vercel deployment)
5. Don't initialize with README (we already have one)

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/mentorscue-accounting.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### 2.1 Connect to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `mentorscue-accounting` repository

### 2.2 Configure Environment Variables
In the Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://zalpataijefzngdzaccu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbHBhdGFpamVmem5nZHphY2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjkyNTUsImV4cCI6MjA2OTQwNTI1NX0._hfR1BvdmzJ6MlzakIOolSCLQvGQflH2KqRlZvNTTyo
```

### 2.3 Deploy Settings
- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### 2.4 Deploy
Click "Deploy" and wait for the build to complete.

## Step 3: Configure Supabase Authentication

### 3.1 Set Up Google OAuth
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** → **Providers**
3. Enable **Google** provider
4. Add your OAuth credentials:
   - **Client ID**: Your Google OAuth client ID
   - **Client Secret**: Your Google OAuth client secret

### 3.2 Configure Redirect URLs
In Supabase **Authentication** → **URL Configuration**:

**Site URL:**
```
https://your-vercel-app.vercel.app
```

**Redirect URLs:**
```
https://your-vercel-app.vercel.app/auth/callback
https://your-vercel-app.vercel.app
```

### 3.3 Set Up Google OAuth (if not already done)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```

## Step 4: Database Setup

### 4.1 Create Database Table
Run this SQL in your Supabase SQL editor:

```sql
-- Create the accounting_entries table
CREATE TABLE IF NOT EXISTS accounting_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE accounting_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their entries
CREATE POLICY "Users can view their own entries" ON accounting_entries
  FOR ALL USING (auth.jwt() ->> 'email' = created_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounting_entries_created_by ON accounting_entries(created_by);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_date ON accounting_entries(date);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_type ON accounting_entries(type);
```

## Step 5: Test Your Deployment

### 5.1 Verify Authentication
1. Visit your deployed app
2. Click "Continue with Google"
3. Sign in with an authorized email
4. Verify you can access the dashboard

### 5.2 Test Features
- ✅ Add new entries
- ✅ View charts and analytics
- ✅ Delete entries
- ✅ Toggle chart views
- ✅ Responsive design

## Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain
1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Update Supabase redirect URLs with your custom domain

### 6.2 Update Environment Variables
If you change domains, update the redirect URLs in Supabase.

## Troubleshooting

### Build Errors
- Ensure all environment variables are set
- Check that Supabase URL and key are correct
- Verify TypeScript compilation passes locally

### Authentication Issues
- Check Google OAuth configuration
- Verify redirect URLs in Supabase
- Ensure authorized users list is correct

### Database Issues
- Verify RLS policies are correct
- Check table structure matches expected schema
- Ensure user has proper permissions

## Performance Optimization

### Vercel Analytics
Enable Vercel Analytics for performance monitoring:
1. Go to **Settings** → **Analytics**
2. Enable analytics
3. Monitor Core Web Vitals

### Caching
The app includes automatic caching:
- Static assets are cached
- API responses are cached
- Charts are optimized for performance

## Security Features

### Row Level Security
- Users can only see their own data
- Database-level security enforcement
- Secure authentication flow

### Environment Variables
- Sensitive data stored in environment variables
- No hardcoded secrets in code
- Secure deployment configuration

## Monitoring

### Vercel Dashboard
- Monitor deployment status
- View build logs
- Check performance metrics

### Supabase Dashboard
- Monitor database usage
- Check authentication logs
- View real-time subscriptions

## Cost Analysis

### Vercel Free Tier
- ✅ 100GB bandwidth/month
- ✅ 100 serverless function executions/day
- ✅ Automatic deployments
- ✅ Custom domains
- ✅ SSL certificates

### Supabase Free Tier
- ✅ 500MB database
- ✅ 50MB file storage
- ✅ 2GB bandwidth
- ✅ 50,000 monthly active users

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify Supabase configuration
3. Test locally with `npm run dev`
4. Check browser console for errors

---

**Your professional accounting dashboard is now live! 🎉**