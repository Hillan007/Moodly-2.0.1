"""
Spotify Music Service for Moodly
Maps mood parameters to Spotify audio features and fetches real recommendations
"""

import os
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from typing import Dict, List, Optional

class MusicRecommendationService:
    def __init__(self):
        """Initialize Spotify client"""
        self.client_id = os.environ.get('SPOTIFY_CLIENT_ID')
        self.client_secret = os.environ.get('SPOTIFY_CLIENT_SECRET')
        
        if self.client_id and self.client_secret:
            try:
                auth_manager = SpotifyClientCredentials(
                    client_id=self.client_id,
                    client_secret=self.client_secret
                )
                self.spotify = spotipy.Spotify(auth_manager=auth_manager)
                self.available = True
                print("✅ Spotify API initialized successfully!")
            except Exception as e:
                print(f"⚠️ Spotify API initialization failed: {e}")
                self.spotify = None
                self.available = False
        else:
            print("⚠️ Spotify credentials not found")
            self.spotify = None
            self.available = False
    
    def mood_to_audio_features(self, mood_score: int, energy_level: int, anxiety_level: int) -> Dict:
        """
        Map mood parameters to Spotify audio features
        
        Spotify Audio Features:
        - valence: 0.0-1.0 (musical positivity/happiness)
        - energy: 0.0-1.0 (intensity and activity)
        - danceability: 0.0-1.0 (how suitable for dancing)
        - acousticness: 0.0-1.0 (acoustic vs electronic)
        - instrumentalness: 0.0-1.0 (vocal vs instrumental)
        - tempo: BPM (beats per minute)
        """
        
        # Normalize to 0-1 scale
        mood_normalized = mood_score / 10.0
        energy_normalized = energy_level / 10.0
        anxiety_normalized = anxiety_level / 10.0
        
        # Map to Spotify features
        features = {
            'target_valence': mood_normalized,  # Happiness maps to valence
            'target_energy': energy_normalized,  # Energy maps directly
            'target_danceability': energy_normalized * 0.8,  # Higher energy = more danceable
        }
        
        # Adjust based on anxiety
        if anxiety_normalized > 0.6:
            # High anxiety = prefer calming music
            features['target_acousticness'] = 0.7
            features['target_instrumentalness'] = 0.5
            features['target_tempo'] = 80  # Slower tempo
        elif anxiety_normalized < 0.3:
            # Low anxiety = can handle more energetic music
            features['target_acousticness'] = 0.3
            features['target_instrumentalness'] = 0.2
            features['target_tempo'] = 120
        else:
            # Medium anxiety = balanced
            features['target_acousticness'] = 0.5
            features['target_instrumentalness'] = 0.3
            features['target_tempo'] = 100
        
        return features
    
    def get_seed_genres(self, mood_score: int, energy_level: int, anxiety_level: int) -> List[str]:
        """Select appropriate genre seeds based on mood"""
        
        if anxiety_level >= 7:
            # High anxiety - calming genres
            return ['ambient', 'classical', 'chill', 'acoustic', 'meditation']
        elif energy_level >= 7:
            # High energy - upbeat genres
            return ['pop', 'dance', 'indie-pop', 'happy', 'party']
        elif energy_level <= 3:
            # Low energy - relaxing genres
            return ['ambient', 'chill', 'piano', 'sleep', 'study']
        elif mood_score >= 7:
            # Happy mood - positive genres
            return ['happy', 'pop', 'indie', 'summer', 'feel-good']
        elif mood_score <= 3:
            # Low mood - contemplative genres
            return ['sad', 'acoustic', 'indie', 'alternative', 'folk']
        else:
            # Neutral - balanced genres
            return ['indie', 'alternative', 'chill', 'acoustic', 'pop']
    
    def get_recommendations(self, mood_score: int, energy_level: int, anxiety_level: int, limit: int = 20) -> Optional[List[Dict]]:
        """Get Spotify recommendations based on mood"""
        
        if not self.available or not self.spotify:
            return None
        
        try:
            # Get audio features and genres
            audio_features = self.mood_to_audio_features(mood_score, energy_level, anxiety_level)
            seed_genres = self.get_seed_genres(mood_score, energy_level, anxiety_level)[:5]  # Max 5 seeds
            
            # Get recommendations from Spotify
            results = self.spotify.recommendations(
                seed_genres=seed_genres,
                limit=limit,
                **audio_features
            )
            
            # Format tracks
            tracks = []
            for track in results['tracks']:
                tracks.append({
                    'name': track['name'],
                    'artist': ', '.join([artist['name'] for artist in track['artists']]),
                    'spotify_url': track['external_urls']['spotify'],
                    'preview_url': track.get('preview_url'),
                    'album': track['album']['name'],
                    'image': track['album']['images'][0]['url'] if track['album']['images'] else None,
                    'duration_ms': track['duration_ms']
                })
            
            return tracks
            
        except Exception as e:
            print(f"❌ Spotify API error: {e}")
            return None
    
    def search_playlist(self, query: str, limit: int = 5) -> Optional[List[Dict]]:
        """Search for playlists by query"""
        
        if not self.available or not self.spotify:
            return None
        
        try:
            results = self.spotify.search(q=query, type='playlist', limit=limit)
            
            playlists = []
            for playlist in results['playlists']['items']:
                playlists.append({
                    'name': playlist['name'],
                    'description': playlist.get('description', ''),
                    'spotify_url': playlist['external_urls']['spotify'],
                    'tracks_total': playlist['tracks']['total'],
                    'image': playlist['images'][0]['url'] if playlist['images'] else None,
                    'owner': playlist['owner']['display_name']
                })
            
            return playlists
            
        except Exception as e:
            print(f"❌ Spotify playlist search error: {e}")
            return None

# Global instance
music_service = MusicRecommendationService()
