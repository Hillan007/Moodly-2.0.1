import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

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

interface MusicRecommendationsProps {
  mood: number;
  energy: number;
  anxiety: number;
  recommendations?: {
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
  };
}

const MusicRecommendations: React.FC<MusicRecommendationsProps> = ({ 
  mood, 
  energy, 
  anxiety, 
  recommendations 
}) => {
  if (!recommendations) return null;

  const PlaylistCard = ({ playlist, source }: { playlist: Playlist; source: string }) => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Music className="h-4 w-4" />
              {playlist.name}
            </CardTitle>
            <CardDescription className="text-xs">
              {playlist.description}
            </CardDescription>
          </div>
          <Badge variant={source === 'spotify' ? 'default' : 'secondary'} className="text-xs">
            {source === 'spotify' ? 'Spotify' : 'Curated'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Spotify playlist */}
        {playlist.spotify_url && (
          <div className="space-y-2">
            {playlist.image && (
              <img 
                src={playlist.image} 
                alt={playlist.name}
                className="w-full h-20 object-cover rounded-md"
              />
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {playlist.tracks_total} tracks
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(playlist.spotify_url, '_blank')}
                className="h-6 px-2 text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open
              </Button>
            </div>
          </div>
        )}

        {/* Fallback playlist with tracks */}
        {playlist.tracks && (
          <div className="space-y-2">
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {playlist.tracks.slice(0, 3).map((track, index) => (
                <div key={index} className="text-xs p-1 bg-muted rounded">
                  <p className="font-medium truncate">{track.name}</p>
                  <p className="text-muted-foreground truncate">{track.artist}</p>
                </div>
              ))}
            </div>
            {playlist.tracks.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{playlist.tracks.length - 3} more...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Music Recommendations
            </CardTitle>
            <CardDescription>
              {recommendations.primary.message}
            </CardDescription>
          </div>
          <Link to="/music">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.primary.playlists.slice(0, 2).map((playlist, index) => (
            <PlaylistCard 
              key={index} 
              playlist={playlist} 
              source={recommendations.primary.source}
            />
          ))}
        </div>
        
        {recommendations.hybrid && (
          <div className="mt-4 text-center">
            <Badge variant="outline" className="text-xs">
              <Music className="h-3 w-3 mr-1" />
              Spotify + Curated Recommendations
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MusicRecommendations;
