# Moodly Deployment Guide

## Frontend (Vercel) ✅

Your frontend is already set up for Vercel. Just ensure these environment variables are set:

### Vercel Environment Variables
In your Vercel project settings, add:

```
VITE_API_BASE_URL=https://your-backend-url.com
VITE_SUPABASE_URL=https://idybfvrhjushdqmgxqlr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Backend Deployment

You have several options:

### Option 1: Render.com (Recommended)
1. Push to GitHub
2. Go to [render.com](https://render.com)
3. Create new Web Service
4. Connect your GitHub repo
5. Set these environment variables:
   - `NODE_ENV=production`
   - `FLASK_SECRET_KEY=your-secret-key`
   - `OPENAI_API_KEY=your-openai-key`
   - `SPOTIFY_CLIENT_ID=your-id`
   - `SPOTIFY_CLIENT_SECRET=your-secret`
   - `SPOTIFY_REDIRECT_URI_PROD=https://your-vercel-domain.com/callback`
   - `FRONTEND_URL=https://your-vercel-domain.com`

6. Build Command: `pip install -r backend/requirements.txt`
7. Start Command: `gunicorn -w 4 -b 0.0.0.0:3000 backend.moodly_api:app`

### Option 2: Railway.app
1. Connect GitHub repo
2. Add environment variables (same as above)
3. Set Python version in railway.toml
4. Procfile will auto-detect

### Option 3: Heroku
1. `heroku create your-app-name`
2. `git push heroku main`
3. `heroku config:set FLASK_SECRET_KEY=...`
4. (repeat for all env vars)

## After Deployment

1. Update your frontend config if needed:
   - In Vercel settings, add `VITE_API_BASE_URL` with your backend URL

2. Update backend CORS if needed:
   - Backend automatically includes your Vercel domain
   - Or set `FRONTEND_URL` environment variable

3. Test: 
   - Go to your Vercel domain
   - Open DevTools (F12)
   - Try Music Recommendations
   - Check if you see real Spotify songs or fallback playlists

## Environment Variables Summary

### Frontend (.env.production in Vercel)
```
VITE_API_BASE_URL=https://your-backend-api.com
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (.env)
```
NODE_ENV=production
FLASK_SECRET_KEY=your-key
OPENAI_API_KEY=your-key
SPOTIFY_CLIENT_ID=your-id
SPOTIFY_CLIENT_SECRET=your-secret
SPOTIFY_REDIRECT_URI_PROD=https://your-vercel-domain.com/callback
SPOTIFY_REDIRECT_URI_DEV=http://localhost:3000/callback
FRONTEND_URL=https://your-vercel-domain.com
```

## Troubleshooting

### CORS Error
- Make sure backend includes your Vercel domain in CORS origins
- Or set `FRONTEND_URL` environment variable

### 404 on API
- Make sure backend URL is correct in frontend config
- Check if backend is running

### Spotify not working
- Ensure credentials are set in environment
- Check that redirect URI is registered in Spotify Dashboard

## Local Testing Before Deploy
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
python backend\moodly_api.py

# Visit http://localhost:5174
```
