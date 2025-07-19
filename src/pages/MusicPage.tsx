import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
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

  const getMoodDescription = (score: number) => {
    if (score >= 8) return 'Very Happy 😊';
    if (score >= 6) return 'Happy 🙂';
    if (score >= 4) return 'Neutral 😐';
    if (score >= 2) return 'Low 😞';
    return 'Very Low 😢';
  };

  const getEnergyDescription = (score: number) => {
    if (score >= 8) return 'High Energy ⚡';
    if (score >= 6) return 'Good Energy 💪';
    if (score >= 4) return 'Moderate 🚶';
    if (score >= 2) return 'Low Energy 😴';
    return 'Exhausted 🔋';
  };

  const getAnxietyDescription = (score: number) => {
    if (score >= 8) return 'Very Anxious 😰';
    if (score >= 6) return 'Anxious 😟';
    if (score >= 4) return 'Somewhat Anxious 😬';
    if (score >= 2) return 'Calm 😌';
    return 'Very Calm 😊';
  };

  const fetchMusicRecommendations = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/music/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          mood_score: moodScore[0],
          energy_level: energyLevel[0],
          anxiety_level: anxietyLevel[0],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      } else {
        console.error('Failed to fetch music recommendations');
      }
    } catch (error) {
      console.error('Error fetching music recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const PlaylistCard = ({ playlist, source }: { playlist: Playlist; source: string }) => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              {playlist.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {playlist.description}
            </CardDescription>
          </div>
          <Badge variant={source === 'spotify' ? 'default' : 'secondary'}>
            {source === 'spotify' ? 'Spotify' : 'Curated'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Spotify playlist */}
        {playlist.spotify_url && (
          <div className="space-y-3">
            {playlist.image && (
              <img 
                src={playlist.image} 
                alt={playlist.name}
                className="w-full h-32 object-cover rounded-md"
              />
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {playlist.tracks_total} tracks
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(playlist.spotify_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Spotify
              </Button>
            </div>
          </div>
        )}

        {/* Fallback playlist with tracks */}
        {playlist.tracks && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recommended Tracks:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {playlist.tracks.slice(0, 5).map((track, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div>
                    <p className="font-medium text-sm">{track.name}</p>
                    <p className="text-xs text-muted-foreground">{track.artist}</p>
                  </div>
                  {track.genre && (
                    <Badge variant="outline" className="text-xs">
                      {track.genre}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            {playlist.tracks.length > 5 && (
              <p className="text-xs text-muted-foreground">
                +{playlist.tracks.length - 5} more tracks...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Music for Your Mood</h1>
          <p className="text-lg text-gray-600">
            Discover personalized music recommendations based on how you're feeling
          </p>
        </div>

        {/* Mood Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>How are you feeling?</CardTitle>
            <CardDescription>
              Adjust the sliders to match your current emotional state
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Mood Score */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Mood: {getMoodDescription(moodScore[0])}
                </label>
                <Slider
                  value={moodScore}
                  onValueChange={setMoodScore}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>

              {/* Energy Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Energy: {getEnergyDescription(energyLevel[0])}
                </label>
                <Slider
                  value={energyLevel}
                  onValueChange={setEnergyLevel}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Exhausted</span>
                  <span>High Energy</span>
                </div>
              </div>

              {/* Anxiety Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Anxiety: {getAnxietyDescription(anxietyLevel[0])}
                </label>
                <Slider
                  value={anxietyLevel}
                  onValueChange={setAnxietyLevel}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Very Calm</span>
                  <span>Very Anxious</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={fetchMusicRecommendations}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Finding Your Music...
                </>
              ) : (
                <>
                  <Music className="h-4 w-4 mr-2" />
                  Get Music Recommendations
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Music Recommendations */}
        {recommendations && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Your Music Recommendations</h2>
              <p className="text-muted-foreground">
                {recommendations.primary.message}
              </p>
              {recommendations.hybrid && (
                <Badge variant="outline" className="mt-2">
                  <Music className="h-3 w-3 mr-1" />
                  Spotify + Curated Recommendations
                </Badge>
              )}
            </div>

            {/* Primary Recommendations */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
                {recommendations.primary.source === 'spotify' ? 'From Spotify' : 'Curated for You'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.primary.playlists.map((playlist, index) => (
                  <PlaylistCard 
                    key={index} 
                    playlist={playlist} 
                    source={recommendations.primary.source}
                  />
                ))}
              </div>
            </div>

            {/* Fallback Recommendations */}
            {recommendations.fallback && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Alternative Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.fallback.playlists.map((playlist, index) => (
                    <PlaylistCard 
                      key={index} 
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
        {!recommendations && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready to discover your music?</h3>
              <p className="text-muted-foreground">
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
