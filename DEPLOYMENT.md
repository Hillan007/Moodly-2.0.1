# 🚀 Moodly Deployment Guide - Render

This guide will help you deploy your Moodly mental health application to Render.

## 📋 Prerequisites

1. **GitHub Repository**: Push your code to a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **OpenAI API Key** (optional): For AI-powered mood insights

## 🔧 Deployment Steps

### Step 1: Prepare Your Repository

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

### Step 2: Deploy on Render

1. **Go to Render Dashboard**:
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"

2. **Connect Repository**:
   - Connect your GitHub account
   - Select your `collab-edit-github-now` repository
   - Choose the `main` branch

3. **Configure Service**:
   - **Name**: `moodly-app` (or your preferred name)
   - **Environment**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `python app.py`
   - **Plan**: Free (or upgrade as needed)

4. **Environment Variables**:
   - **FLASK_SECRET_KEY**: (Render will auto-generate)
   - **OPENAI_API_KEY**: `your-openai-api-key-here` (optional)

### Step 3: Set Environment Variables

In the Render dashboard:

1. Go to your service → "Environment"
2. Add these variables:

```
FLASK_SECRET_KEY=auto-generated-by-render
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Step 4: Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Install Node.js dependencies
   - Build React frontend
   - Install Python dependencies
   - Start your Flask server

## 🌐 Access Your App

Once deployed, your app will be available at:
```
https://your-service-name.onrender.com
```

## 🔧 Key Files for Deployment

- **`app.py`**: Production Flask server (serves both API and frontend)
- **`build.sh`**: Build script for both React and Python
- **`Procfile`**: Tells Render how to start your app
- **`render.yaml`**: Optional deployment configuration
- **`requirements.txt`**: Python dependencies

## 📱 Features Available

- ✅ User registration and authentication
- ✅ Mood tracking with AI insights
- ✅ Journal entries
- ✅ Goal setting and tracking
- ✅ Breathing exercises
- ✅ Analytics dashboard
- ✅ Responsive design for all devices

## 🤖 AI Features

If you add an OpenAI API key:
- AI-powered mood analysis
- Personalized insights and suggestions
- Intelligent fallback prompts

Without OpenAI API key:
- Smart fallback insights based on mood patterns
- Rule-based recommendations

## 🔒 Security Features

- Password hashing with salt
- Session-based authentication
- CORS protection
- SQL injection protection

## 📊 Database

- SQLite database (automatic creation)
- Persistent data storage on Render
- Automatic schema initialization

## 🎨 Frontend

- React + TypeScript
- Tailwind CSS + Shadcn/ui
- Responsive design
- Modern, professional interface

## 🛠️ Troubleshooting

### Build Issues
- Check build logs in Render dashboard
- Ensure all dependencies are in `requirements.txt`
- Verify Node.js dependencies in `package.json`

### Runtime Issues
- Check application logs
- Verify environment variables are set
- Test API endpoints in browser: `/api/health`

### Database Issues
- SQLite database will be created automatically
- Data persists between deployments on Render

## 📈 Monitoring

Monitor your app in Render dashboard:
- View logs
- Check metrics
- Monitor uptime
- Scale resources if needed

## 🚀 Next Steps

1. **Custom Domain**: Add your own domain in Render settings
2. **SSL Certificate**: Automatic HTTPS with Render
3. **Scaling**: Upgrade to paid plans for better performance
4. **Monitoring**: Set up alerts and monitoring
5. **Backup**: Regular database backups (if using paid plan)

## 💡 Tips

- **Free Tier**: Render free tier may sleep after inactivity
- **Logs**: Always check logs for debugging
- **Environment**: Test locally before deploying
- **Updates**: Auto-deploy on Git push (if enabled)

---

Your Moodly mental health application is now ready for production use! 🎉
