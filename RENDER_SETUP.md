# 🚀 Render Deployment Guide for Moodly

## Quick Setup

### 1. Push Your Code to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub

### 3. Deploy Backend

#### Option A: Using render.yaml (Recommended)
1. Click "New +" → "Blueprint"
2. Connect your GitHub repository
3. Render will detect `render.yaml` automatically
4. Click "Apply"

#### Option B: Manual Setup
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: moodly-backend
   - **Environment**: Python
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `gunicorn -w 4 -b 0.0.0.0:$PORT backend.moodly_api:app`

### 4. Add Environment Variables in Render

Go to your service → Environment tab → Add:

```
NODE_ENV=production
FLASK_SECRET_KEY=your-secret-key-here
FRONTEND_URL=https://moodly-2.vercel.app

# Spotify (Required for music recommendations)
SPOTIFY_CLIENT_ID=17f94339187c4297b10c5d55e813f94c
SPOTIFY_CLIENT_SECRET=e406ee58bd0a47fc92e92aac93db0033
SPOTIFY_REDIRECT_URI_PROD=https://moodly-2.vercel.app/callback

# Supabase
VITE_SUPABASE_URL=https://idybfvrhjushdqmgxqlr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI (Optional - for AI insights)
OPENAI_API_KEY=sk-proj-IACdQvhDORLwth_OsKyQ2vnjonaMmik5VoxVtHE...
```

### 5. Copy Your Backend URL
After deployment completes, copy your backend URL (e.g., `https://moodly-backend.onrender.com`)

### 6. Update Vercel Environment Variables

Go to Vercel → Your Project → Settings → Environment Variables

Add/Update:
```
VITE_API_BASE_URL=https://moodly-backend.onrender.com
```

(Use your actual Render URL)

### 7. Redeploy Frontend
In Vercel:
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

---

## ⚠️ Common Issues

### Music Recommendations Not Working
- ✅ Make sure `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are set in Render
- ✅ Check Render logs for "✅ Spotify API initialized successfully!"
- ✅ Verify CORS includes `https://moodly-2.vercel.app`

### CORS Error
- ✅ Make sure `FRONTEND_URL=https://moodly-2.vercel.app` is set in Render
- ✅ Check backend logs for "✅ CORS Origins Allowed"

### 500 Error on API
- ✅ Check Render logs (click on your service → Logs tab)
- ✅ Make sure all required environment variables are set

### Backend Takes Long to Start
- ✅ Render free tier goes to sleep after 15 minutes of inactivity
- ✅ First request after sleep will be slow (cold start)
- ✅ Consider upgrading to paid tier for always-on

---

## 🧪 Testing Deployment

### Test Backend
Visit: `https://your-backend-url.onrender.com/api/health`

Should return:
```json
{
  "status": "healthy",
  "message": "Moodly API is running",
  "version": "1.0.0",
  "ai_enabled": true
}
```

### Test Frontend
1. Visit: `https://moodly-2.vercel.app`
2. Open DevTools (F12) → Console
3. Try Music Recommendations
4. Check console for API calls

---

## 🔄 Updating Deployment

### Backend Updates
Just push to GitHub:
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Render will auto-deploy.

### Frontend Updates
Vercel auto-deploys on push to main.

---

## 📊 Monitoring

- **Backend Logs**: Render Dashboard → Your Service → Logs
- **Frontend Logs**: Vercel Dashboard → Your Project → Deployments → View Function Logs
- **Analytics**: Vercel Dashboard → Analytics tab

---

## 💡 Pro Tips

1. **Keep Free Tier Awake**: Use a service like UptimeRobot to ping your backend every 5 minutes
2. **Secrets Management**: Never commit `.env` files to GitHub
3. **Separate Environments**: Create separate Render services for staging/production
4. **Database**: Consider adding Render PostgreSQL if you need persistent data
5. **CDN**: Images/assets are automatically CDN'd by Vercel

---

## 🆘 Need Help?

- **Render Logs**: Check for error messages
- **Browser Console**: Check for frontend errors
- **Network Tab**: See actual API requests/responses

Your backend URL will be: `https://moodly-backend-xxxx.onrender.com`
Your frontend URL is: `https://moodly-2.vercel.app`
