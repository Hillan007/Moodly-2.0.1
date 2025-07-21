import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Music, Play, ExternalLink, Heart, RefreshCw, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import config from '@/config';

interface Track {
  name: string;
  artist: string;
  genre?: string;
}

interface Playlist {
  name: string;
  description: string;
  tracks?: Track[];
  spotify_url?: string;
  image?: string;
  tracks_total?: number;
}

interface MusicRecommendations {
  primary: {
    mood_category: string;
    mood_score: number;
    playlists: Playlist[];
    source: 'spotify' | 'fallback';
    message: string;
  };
  fallback?: {
    mood_category: string;
    mood_score: number;
    playlists: Playlist[];
    source: 'fallback';
    message: string;
  };
  hybrid: boolean;
}

const MusicPage: React.FC = () => {
  const { user } = useAuthStore();
  const [moodScore, setMoodScore] = useState([5]);
  const [energyLevel, setEnergyLevel] = useState([5]);
  const [anxietyLevel, setAnxietyLevel] = useState([5]);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<MusicRecommendations | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getMoodDescription = useCallback((score: number): string => {
    if (score >= 8) return 'Very Happy 😊';
    if (score >= 6) return 'Happy 🙂';
    if (score >= 4) return 'Neutral 😐';
    if (score >= 2) return 'Low 😞';
    return 'Very Low 😢';
  }, []);

  const getEnergyDescription = useCallback((score: number): string => {
    if (score >= 8) return 'High Energy ⚡';
    if (score >= 6) return 'Good Energy 💪';
    if (score >= 4) return 'Moderate 🚶';
    if (score >= 2) return 'Low Energy 😴';
    return 'Exhausted 🔋';
  }, []);

  const getAnxietyDescription = useCallback((score: number): string => {
    if (score >= 8) return 'Very Anxious 😰';
    if (score >= 6) return 'Anxious 😟';
    if (score >= 4) return 'Somewhat Anxious 😬';
    if (score >= 2) return 'Calm 😌';
    return 'Very Calm 😊';
  }, []);

  // Safe external link opening with fallback
  const openExternalLink = useCallback((url: string) => {
    try {
      // Check if window.open is supported
      if (typeof window !== 'undefined' && window.open) {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (!newWindow) {
          // Fallback if popup is blocked
          window.location.href = url;
        }
      } else {
        // Fallback for browsers without window.open support
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to open external link:', error);
      // Ultimate fallback - copy URL to clipboard if supported
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          alert('Link copied to clipboard: ' + url);
        }).catch(() => {
          alert('Please manually navigate to: ' + url);
        });
      } else {
        alert('Please manually navigate to: ' + url);
      }
    }
  }, []);

  const fetchMusicRecommendations = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Add timeout for better UX
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${config.API_BASE_URL}/api/music/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify({
          mood_score: moodScore[0],
          energy_level: energyLevel[0],
          anxiety_level: anxietyLevel[0],
        }),
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching music recommendations:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('Request timed out. Please try again.');
        } else if (error.message.includes('Failed to fetch')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError('Failed to get recommendations. Please try again.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const PlaylistCard = ({ playlist, source }: { playlist: Playlist; source: string }) => (
    <Card className="h-full shadow-md hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 truncate">
              <Music className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="truncate">{playlist.name}</span>
            </CardTitle>
            <CardDescription className="mt-2 text-gray-700 font-medium text-sm leading-relaxed line-clamp-3">
              {playlist.description}
            </CardDescription>
          </div>
          <Badge 
            variant={source === 'spotify' ? 'default' : 'secondary'}
            className="font-semibold text-xs px-2 py-1 flex-shrink-0"
          >
            {source === 'spotify' ? 'Spotify' : 'Curated'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Spotify playlist */}
        {playlist.spotify_url && (
          <div className="space-y-4">
            {playlist.image && (
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src={playlist.image} 
                  alt={`${playlist.name} playlist cover`}
                  className="w-full h-32 object-cover shadow-sm transition-transform duration-200 hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback for broken images
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-gray-800 flex-shrink-0">
                {playlist.tracks_total || 0} tracks
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => playlist.spotify_url && openExternalLink(playlist.spotify_url)}
                className="font-semibold flex-shrink-0"
                disabled={!playlist.spotify_url}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Spotify
              </Button>
            </div>
          </div>
        )}

        {/* Fallback playlist with tracks */}
        {playlist.tracks && playlist.tracks.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-gray-900">Recommended Tracks:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {playlist.tracks.slice(0, 5).map((track, index) => (
                <div key={`${track.name}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{track.name}</p>
                    <p className="text-sm text-gray-700 font-medium truncate">{track.artist}</p>
                  </div>
                  {track.genre && (
                    <Badge variant="outline" className="text-xs font-semibold flex-shrink-0 ml-2">
                      {track.genre}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            {playlist.tracks.length > 5 && (
              <p className="text-sm text-gray-800 font-medium">
                +{playlist.tracks.length - 5} more tracks...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-6 sm:py-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Music for Your Mood
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 font-medium max-w-2xl mx-auto leading-relaxed px-4">
            Discover personalized music recommendations based on how you're feeling
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <ExternalLink className="h-5 w-5" />
                <p className="font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mood Input Section */}
        <Card className="shadow-lg border-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">How are you feeling?</CardTitle>
            <CardDescription className="text-base sm:text-lg text-gray-700 font-medium">
              Adjust the sliders to match your current emotional state
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 sm:space-y-8 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Mood Score */}
              <div className="space-y-4">
                <label className="text-base sm:text-lg font-bold text-gray-900 block">
                  Mood: <span className="text-primary">{getMoodDescription(moodScore[0])}</span>
                </label>
                <Slider
                  value={moodScore}
                  onValueChange={setMoodScore}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                  aria-label="Mood level"
                />
                <div className="flex justify-between text-sm text-gray-800 font-semibold">
                  <span>Very Low</span>
                  <span className="font-bold text-primary">{moodScore[0]}</span>
                  <span>Very High</span>
                </div>
              </div>

              {/* Energy Level */}
              <div className="space-y-4">
                <label className="text-base sm:text-lg font-bold text-gray-900 block">
                  Energy: <span className="text-primary">{getEnergyDescription(energyLevel[0])}</span>
                </label>
                <Slider
                  value={energyLevel}
                  onValueChange={setEnergyLevel}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                  aria-label="Energy level"
                />
                <div className="flex justify-between text-sm text-gray-800 font-semibold">
                  <span>Exhausted</span>
                  <span className="font-bold text-primary">{energyLevel[0]}</span>
                  <span>High Energy</span>
                </div>
              </div>

              {/* Anxiety Level */}
              <div className="space-y-4">
                <label className="text-base sm:text-lg font-bold text-gray-900 block">
                  Anxiety: <span className="text-primary">{getAnxietyDescription(anxietyLevel[0])}</span>
                </label>
                <Slider
                  value={anxietyLevel}
                  onValueChange={setAnxietyLevel}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                  aria-label="Anxiety level"
                />
                <div className="flex justify-between text-sm text-gray-800 font-semibold">
                  <span>Very Calm</span>
                  <span className="font-bold text-primary">{anxietyLevel[0]}</span>
                  <span>Very Anxious</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={fetchMusicRecommendations}
              disabled={isLoading}
              className="w-full py-4 sm:py-6 text-base sm:text-lg font-bold"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Finding Your Perfect Music...
                </>
              ) : (
                <>
                  <Music className="h-5 w-5 mr-3" />
                  Get Music Recommendations
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Music Recommendations */}
        {recommendations && (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center bg-white rounded-xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Your Music Recommendations</h2>
              <p className="text-lg sm:text-xl text-gray-700 font-medium leading-relaxed">
                {recommendations.primary.message}
              </p>
              {recommendations.hybrid && (
                <Badge variant="outline" className="mt-4 text-sm font-bold px-4 py-2">
                  <Music className="h-4 w-4 mr-2" />
                  Spotify + Curated Recommendations
                </Badge>
              )}
            </div>

            {/* Primary Recommendations */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 border-l-4 border-primary pl-4">
                {recommendations.primary.source === 'spotify' ? 'From Spotify' : 'Curated for You'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {recommendations.primary.playlists.map((playlist, index) => (
                  <PlaylistCard 
                    key={`primary-${index}`}
                    playlist={playlist} 
                    source={recommendations.primary.source}
                  />
                ))}
              </div>
            </div>

            {/* Fallback Recommendations */}
            {recommendations.fallback && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 border-l-4 border-secondary pl-4">
                  Alternative Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {recommendations.fallback.playlists.map((playlist, index) => (
                    <PlaylistCard 
                      key={`fallback-${index}`}
                      playlist={playlist} 
                      source={recommendations.fallback.source}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!recommendations && !isLoading && !error && (
          <Card className="text-center py-12 sm:py-16 shadow-lg">
            <CardContent>
              <Music className="h-16 sm:h-20 w-16 sm:w-20 mx-auto text-primary mb-6" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Ready to discover your music?</h3>
              <p className="text-base sm:text-lg text-gray-700 font-medium">
                Set your mood above and get personalized music recommendations
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MusicPage;
