# Troubleshooting Backend Connection on Vercel

## Issue: Can't Connect to Backend

### Step 1: Check Environment Variables

#### Frontend Environment Variable (REQUIRED)
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://your-project.vercel.app/api`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
3. Click **Save**
4. **IMPORTANT**: Redeploy after adding this variable!

#### Backend Environment Variables (REQUIRED)
Make sure these are set in Vercel:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration (e.g., `7d`)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Step 2: Test API Endpoint

Open in your browser:
```
https://your-project.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "connected"
}
```

**If you get 404:**
- Check that `server/api.js` exists
- Check Vercel build logs for errors
- Verify `vercel.json` routes are correct

**If you get 500:**
- Check Vercel function logs
- Verify MongoDB connection string is correct
- Check that all environment variables are set

### Step 3: Check Browser Console

1. Open your deployed app
2. Press F12 to open DevTools
3. Go to **Console** tab
4. Look for errors like:
   - `Network Error`
   - `CORS policy`
   - `404 Not Found`
   - `Failed to fetch`

### Step 4: Verify API URL in Frontend

The frontend should use the environment variable. Check:
- `client/src/services/api.js` uses `process.env.REACT_APP_API_URL`
- The variable is set in Vercel
- You've redeployed after setting the variable

### Step 5: Common Issues

#### Issue: CORS Errors
**Solution**: CORS is already configured in `server/api.js` with `app.use(cors())`

#### Issue: 404 on API Routes
**Solution**: 
- Check `vercel.json` routes configuration
- Verify `server/api.js` exists
- Check Vercel build logs

#### Issue: MongoDB Connection Failed
**Solution**:
- Verify `MONGODB_URI` is set correctly
- Check MongoDB Atlas IP whitelist (should allow all IPs: `0.0.0.0/0`)
- Verify connection string format

#### Issue: Environment Variables Not Working
**Solution**:
- Variables must start with `REACT_APP_` for frontend
- Redeploy after adding/changing variables
- Check variable names are exact (case-sensitive)

### Step 6: Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → **Functions** tab
2. Click on a function to see logs
3. Look for errors in the logs

### Step 7: Test Locally First

Test your API locally to ensure it works:
```bash
cd server
npm install
npm start
```

Then test: `http://localhost:5000/api/health`

## Quick Checklist

- [ ] `REACT_APP_API_URL` is set in Vercel
- [ ] All backend environment variables are set
- [ ] Redeployed after setting environment variables
- [ ] `/api/health` endpoint returns 200 OK
- [ ] MongoDB connection is working
- [ ] No errors in browser console
- [ ] No errors in Vercel function logs

## Still Having Issues?

1. Check Vercel deployment logs
2. Check Vercel function logs
3. Test API endpoint directly in browser
4. Verify all environment variables are set
5. Make sure you redeployed after adding variables
