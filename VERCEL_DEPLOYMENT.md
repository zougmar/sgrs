# Vercel Deployment Guide

This guide will help you deploy your SGRS application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. MongoDB Atlas database (or your MongoDB connection string)
4. Cloudinary account (for image uploads)

## Step 1: Push Your Code to Git

Make sure your code is committed and pushed to your Git repository:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI globally:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the project root:
```bash
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - What's your project's name? (Enter a name or press Enter)
   - In which directory is your code located? **./** (press Enter)

5. For production deployment:
```bash
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root)
   - **Build Command**: Leave empty (Vercel will auto-detect)
   - **Output Directory**: `client/build`
5. Click **"Deploy"**

## Step 3: Configure Environment Variables

After deployment, you need to add environment variables in the Vercel dashboard:

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

### Backend Environment Variables

```
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### Optional Email Configuration

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend Environment Variable

**Important**: After your first deployment, get your API URL from Vercel and add:

```
REACT_APP_API_URL=https://your-project.vercel.app/api
```

Replace `your-project.vercel.app` with your actual Vercel deployment URL.

4. For each variable, select the environments where it should be available:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. Click **"Save"**

## Step 4: Redeploy After Adding Environment Variables

After adding environment variables, you need to redeploy:

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**

Or use CLI:
```bash
vercel --prod
```

## Step 5: Update Frontend API URL

After deployment, update the `REACT_APP_API_URL` environment variable in Vercel to point to your deployed API:

```
REACT_APP_API_URL=https://your-project.vercel.app/api
```

Then redeploy.

## Project Structure

The deployment is configured as follows:

- **Frontend**: React app in `client/` directory, built and served as static files
- **Backend**: Express API in `server/` directory, deployed as serverless functions via `server/api.js`
- **Routes**: 
  - `/api/*` → Backend API
  - `/*` → React frontend

## Troubleshooting

### Build Fails

- Check that all dependencies are listed in `package.json` files
- Ensure Node.js version is compatible (Vercel uses Node 18.x by default)
- Check build logs in Vercel dashboard

### API Routes Not Working

- Verify environment variables are set correctly
- Check that MongoDB connection string is correct
- Ensure CORS is configured (already set in the code)
- Check function logs in Vercel dashboard

### Frontend Can't Connect to API

- Verify `REACT_APP_API_URL` is set to your Vercel deployment URL
- Ensure the URL includes `/api` at the end
- Check browser console for CORS errors

### MongoDB Connection Issues

- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0` (all IPs) or Vercel's IPs
- Check MongoDB connection string format
- Ensure database user has proper permissions

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `REACT_APP_API_URL` to use your custom domain

## Monitoring

- Check **Deployments** tab for deployment status
- Use **Functions** tab to view serverless function logs
- Monitor **Analytics** for performance metrics

## Support

For issues specific to Vercel, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
