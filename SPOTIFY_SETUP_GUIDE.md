# Spotify API Setup Guide

## Prerequisites
1. Spotify Developer Account
2. Spotify Client ID and Client Secret

## Step 1: Create Spotify App
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
2. Click "Create an App"
3. Fill in the app details:
   - App name: "Moodly Music Recommendations"
   - App description: "Mental health app with mood-based music recommendations"
   - Website: (optional)
   - Redirect URI: Not needed for Client Credentials flow
4. Accept the terms and create the app

## Step 2: Get Your Credentials
1. In your app dashboard, click "Settings"
2. Copy your **Client ID**
3. Click "Show Client Secret" and copy your **Client Secret**

## Step 3: Configure Environment Variables

### For Local Development (.env file):
```
OPENAI_API_KEY=your_openai_api_key_here
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

### For Render Deployment:
Add these environment variables in your Render dashboard:
- `OPENAI_API_KEY`: Your OpenAI API key
- `SPOTIFY_CLIENT_ID`: Your Spotify Client ID
- `SPOTIFY_CLIENT_SECRET`: Your Spotify Client Secret

## Step 4: Test Integration
1. Start your Flask server: `python app.py`
2. The server will show:
   - ✅ if Spotify credentials are found
   - ⚠️ if Spotify credentials are missing (fallback mode)

## Features
- **Spotify Mode**: Real-time music search based on mood
- **Fallback Mode**: Curated playlists if Spotify is unavailable
- **Hybrid Mode**: Both Spotify and curated recommendations

## Spotify Search Queries by Mood
- **Very Happy**: "happy energetic upbeat pop"
- **Happy**: "uplifting positive feel-good"
- **Neutral**: "chill ambient relaxing"
- **Low**: "calming peaceful meditation"
- **Very Low**: "healing therapy gentle"

## Fallback Playlists
The app includes 25+ curated playlists across 5 mood categories:
- Very Happy: Energetic, celebratory music
- Happy: Uplifting, positive tracks
- Neutral: Balanced, ambient sounds
- Low: Calming, soothing melodies
- Very Low: Healing, therapeutic music

Each category includes anxiety-specific playlists for comprehensive mood support.
