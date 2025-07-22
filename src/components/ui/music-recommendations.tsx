import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Music, Play, Pause, Search, Heart, ExternalLink, Shuffle, Clock, Users } from 'lucide-react';
import config from '@/config';
import { useAuthStore } from '@/stores/authStore';

// Enhanced curated playlists with Spotify URLs as fallback
const CURATED_PLAYLISTS = [
  {
    id: 'calm-relaxation',
    name: 'Peaceful Mind',
    description: 'Gentle melodies for deep relaxation and mindfulness',
    mood: 'calm',
    category: 'Relaxation',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX3Ogo9pFox5g', // Peaceful Piano
    image: 'https://i.scdn.co/image/ab67706f00000003ca5a7517156021292e5663a6',
    tracks: [
      { 
        name: 'River Flows in You', 
        artist: 'Yiruma', 
        duration: '3:37',
        spotifyUrl: 'https://open.spotify.com/track/6JQm7SzLqHwNYHdad0VW2w'
      },
      { 
        name: 'Clair de Lune', 
        artist: 'Claude Debussy', 
        duration: '4:39',
        spotifyUrl: 'https://open.spotify.com/track/4Tr0VdtYf6bUJECVFlqL6h'
      },
      { 
        name: 'Weightless', 
        artist: 'Marconi Union', 
        duration: '8:08',
        spotifyUrl: 'https://open.spotify.com/track/7MXmNrGygYKNJoDIK6aaVS'
      },
      { 
        name: 'Mad World', 
        artist: 'Gary Jules', 
        duration: '3:07',
        spotifyUrl: 'https://open.spotify.com/track/3JOVTQ5h8HGFnDdp4VT3MP'
      },
      { 
        name: 'The Blue Notebooks', 
        artist: 'Max Richter', 
        duration: '3:34',
        spotifyUrl: 'https://open.spotify.com/track/3geHI6kkpsPOQbkdPRKlpD'
      }
    ]
  },
  {
    id: 'energetic-boost',
    name: 'Energy Boost',
    description: 'Uplifting tracks to elevate your mood and motivation',
    mood: 'energetic',
    category: 'Motivation',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0', // Mood Booster
    image: 'https://i.scdn.co/image/ab67706f00000003ca5a7517156021292e5663a6',
    tracks: [
      { 
        name: 'Good as Hell', 
        artist: 'Lizzo', 
        duration: '2:39',
        spotifyUrl: 'https://open.spotify.com/track/1PloQgLPNPtPlQJmUFFOaC'
      },
      { 
        name: 'Happy', 
        artist: 'Pharrell Williams', 
        duration: '3:53',
        spotifyUrl: 'https://open.spotify.com/track/60nZcImufyMA1MKQY3dcCH'
      },
      { 
        name: 'Can\'t Stop the Feeling!', 
        artist: 'Justin Timberlake', 
        duration: '3:56',
        spotifyUrl: 'https://open.spotify.com/track/20I6sIOMTCkB6w7ryavxtO'
      },
      { 
        name: 'Uptown Funk', 
        artist: 'Mark Ronson ft. Bruno Mars', 
        duration: '4:30',
        spotifyUrl: 'https://open.spotify.com/track/32OlwWuMpZ6b0aN2RZOeMS'
      },
      { 
        name: 'Shake It Off', 
        artist: 'Taylor Swift', 
        duration: '3:39',
        spotifyUrl: 'https://open.spotify.com/track/5ncPWWw0QLgeSc3bQKs5A0'
      }
    ]
  },
  {
    id: 'anxiety-relief',
    name: 'Anxiety Relief',
    description: 'Soothing sounds to reduce stress and anxiety',
    mood: 'anxious',
    category: 'Therapeutic',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX1s9knjP51Oa', // Peaceful Instrumental
    image: 'https://i.scdn.co/image/ab67706f00000003ca5a7517156021292e5663a6',
    tracks: [
      { 
        name: 'Aqueous Transmission', 
        artist: 'Incubus', 
        duration: '7:49',
        spotifyUrl: 'https://open.spotify.com/track/4qiyoH7HUAHlRoXfH8y5KU'
      },
      { 
        name: 'Breathe Me', 
        artist: 'Sia', 
        duration: '4:30',
        spotifyUrl: 'https://open.spotify.com/track/5WUHwvSgLXZhH1QYQ9n49A'
      },
      { 
        name: 'Raindrops', 
        artist: 'A.L.I.S.O.N', 
        duration: '5:12',
        spotifyUrl: 'https://open.spotify.com/track/3geHI6kkpsPOQbkdPRKlpD'
      }
    ]
  },
  {
    id: 'focus-productivity',
    name: 'Focus & Flow',
    description: 'Instrumental tracks for concentration and productivity',
    mood: 'focused',
    category: 'Productivity',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX8NTLI2TtZa6', // Deep Focus
    image: 'https://i.scdn.co/image/ab67706f00000003ca5a7517156021292e5663a6',
    tracks: [
      { 
        name: 'Elegy for Dunkirk', 
        artist: 'Dario Marianelli', 
        duration: '1:37',
        spotifyUrl: 'https://open.spotify.com/track/2ZHKhQNNhQvTlw95R0QFVL'
      },
      { 
        name: 'Time', 
        artist: 'Hans Zimmer', 
        duration: '4:35',
        spotifyUrl: 'https://open.spotify.com/track/6ZFbXIJkuI1dVNWvzJzown'
      },
      { 
        name: 'Experience', 
        artist: 'Ludovico Einaudi', 
        duration: '5:15',
        spotifyUrl: 'https://open.spotify.com/track/1p4VHNx1UlUvMSr4tK5pXe'
      }
    ]
  },
  {
    id: 'uplifting-joy',
    name: 'Pure Joy',
    description: 'Feel-good songs to brighten your day',
    mood: 'happy',
    category: 'Feel Good',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX9u7XXOp0l5L', // Feel Good Indie Rock
    image: 'https://i.scdn.co/image/ab67706f00000003ca5a7517156021292e5663a6',
    tracks: [
      { 
        name: 'Three Little Birds', 
        artist: 'Bob Marley & The Wailers', 
        duration: '3:00',
        spotifyUrl: 'https://open.spotify.com/track/6JOTmd5A7PoJ6PyOhM1KJK'
      },
      { 
        name: 'Here Comes the Sun', 
        artist: 'The Beatles', 
        duration: '3:05',
        spotifyUrl: 'https://open.spotify.com/track/6dGnYIeXmHdcikdzNNDMm2'
      },
      { 
        name: 'Walking on Sunshine', 
        artist: 'Katrina and the Waves', 
        duration: '3:58',
        spotifyUrl: 'https://open.spotify.com/track/05wIrZSwuaVWhcv5FfqeH0'
      }
    ]
  }
];

// Mood-based Spotify playlist recommendations
const SPOTIFY_MOOD_PLAYLISTS = {
  calm: [
    {
      name: 'Peaceful Piano',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX3Ogo9pFox5g',
      description: 'Relax and indulge with beautiful piano pieces'
    },
    {
      name: 'Chill Lofi Study Beats',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn',
      description: 'The perfect study companion'
    }
  ],
  energetic: [
    {
      name: 'Mood Booster',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0',
      description: 'Get pumped with these energetic tracks'
    },
    {
      name: 'Power Workout',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP',
      description: 'High energy songs for your workout'
    }
  ],
  anxious: [
    {
      name: 'Stress Relief',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX1s9knjP51Oa',
      description: 'Calm your mind with these soothing tracks'
    },
    {
      name: 'Nature Sounds',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX0oGdJV02k1L',
      description: 'Relaxing nature sounds for meditation'
    }
  ],
  focused: [
    {
      name: 'Deep Focus',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX8NTLI2TtZa6',
      description: 'Keep calm and focus with ambient music'
    },
    {
      name: 'Instrumental Study',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd',
      description: 'Instrumental music to help you focus'
    }
  ],
  happy: [
    {
      name: 'Good Vibes',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX9u7XXOp0l5L',
      description: 'Only good vibes here!'
    },
    {
      name: 'Feel Good Indie Rock',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX2Nc3B70tvx0',
      description: 'Upbeat indie rock to lift your spirits'
    }
  ]
};

export default function MusicPage() {
  const [playlists, setPlaylists] = useState(CURATED_PLAYLISTS);
  const [currentMood, setCurrentMood] = useState<string>('calm');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [spotifyRecommendations, setSpotifyRecommendations] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [apiError, setApiError] = useState(false);

  // Fetch user's recent mood to suggest appropriate music
  const fetchRecentMood = useCallback(async () => {
    if (!token || !user) return;

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/mood`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.entries && data.entries.length > 0) {
          const recentEntry = data.entries[0];
          const moodValue = recentEntry.mood;
          
          // Determine mood category based on mood score
          let moodCategory = 'calm';
          if (moodValue >= 8) moodCategory = 'happy';
          else if (moodValue >= 6) moodCategory = 'energetic';
          else if (moodValue >= 4) moodCategory = 'focused';
          else if (moodValue >= 2) moodCategory = 'calm';
          else moodCategory = 'anxious';
          
          setCurrentMood(moodCategory);
        }
      }
    } catch (error) {
      console.error('Error fetching recent mood:', error);
      setApiError(true);
    }
  }, [token, user]);

  // Fetch Spotify recommendations
  const fetchSpotifyRecommendations = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/music/recommendations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mood: currentMood })
      });

      if (response.ok) {
        const data = await response.json();
        setSpotifyRecommendations(data.recommendations || []);
        setApiError(false);
      } else {
        throw new Error('Spotify API failed');
      }
    } catch (error) {
      console.error('Error fetching Spotify recommendations:', error);
      setApiError(true);
      // Use fallback playlists
      setSpotifyRecommendations(SPOTIFY_MOOD_PLAYLISTS[currentMood] || []);
    } finally {
      setIsLoading(false);
    }
  }, [token, currentMood]);

  useEffect(() => {
    fetchRecentMood();
  }, [fetchRecentMood]);

  useEffect(() => {
    if (currentMood) {
      fetchSpotifyRecommendations();
    }
  }, [currentMood, fetchSpotifyRecommendations]);

  const handlePlayTrack = (trackId: string, spotifyUrl?: string) => {
    if (spotifyUrl) {
      window.open(spotifyUrl, '_blank');
    }
    setCurrentlyPlaying(currentlyPlaying === trackId ? null : trackId);
  };

  const handlePlayPlaylist = (spotifyUrl: string) => {
    window.open(spotifyUrl, '_blank');
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.mood.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMoodColor = (mood: string) => {
    const colors = {
      calm: 'bg-blue-100 text-blue-800 border-blue-200',
      energetic: 'bg-orange-100 text-orange-800 border-orange-200',
      anxious: 'bg-purple-100 text-purple-800 border-purple-200',
      focused: 'bg-green-100 text-green-800 border-green-200',
      happy: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[mood] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-8" style={{ minHeight: '100vh', padding: '2rem' }}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black-custom text-custom-blue">Music for Your Mood</h1>
        <p className="text-xl font-bold-custom text-custom-blue">
          Discover playlists tailored to your emotional state
        </p>
        {user && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getMoodColor(currentMood)}>
              Current mood: {currentMood}
            </Badge>
            {apiError && (
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                Using offline recommendations
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <Card className="border-2 border-custom-blue">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-custom-blue font-black-custom">
            <Search className="w-5 h-5" />
            Search Music
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Search for songs, artists, or moods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button className="bg-custom-blue text-white hover:bg-custom-blue/90 font-bold-custom">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mood-based Spotify Recommendations */}
      {spotifyRecommendations.length > 0 && (
        <Card className="border-2 border-custom-blue">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-custom-blue font-black-custom">
              <Music className="w-5 h-5" />
              Spotify Recommendations for {currentMood} mood
            </CardTitle>
            <CardDescription className="text-custom-blue font-bold-custom">
              Personalized playlists from Spotify
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {spotifyRecommendations.map((playlist, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-custom-blue/20">
                  <div className="flex-1">
                    <h4 className="font-black-custom text-custom-blue">{playlist.name}</h4>
                    <p className="text-sm text-custom-blue font-bold-custom">{playlist.description}</p>
                  </div>
                  <Button
                    onClick={() => window.open(playlist.url, '_blank')}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold-custom"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in Spotify
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Curated Playlists */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black-custom text-custom-blue">Curated Playlists</h2>
          <div className="flex gap-2">
            {['calm', 'energetic', 'anxious', 'focused', 'happy'].map((mood) => (
              <Button
                key={mood}
                variant={currentMood === mood ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentMood(mood)}
                className={currentMood === mood ? "bg-custom-blue text-white" : "border-custom-blue text-custom-blue hover:bg-custom-blue/10"}
              >
                {mood}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaylists.map((playlist) => (
            <Card key={playlist.id} className="border-2 border-custom-blue hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-custom-blue font-black-custom">{playlist.name}</CardTitle>
                    <CardDescription className="text-custom-blue font-bold-custom">
                      {playlist.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant="outline" className={getMoodColor(playlist.mood)}>
                      {playlist.mood}
                    </Badge>
                    <Badge variant="secondary" className="bg-custom-blue text-white">
                      {playlist.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-custom-blue font-bold-custom">
                    <span className="flex items-center gap-1">
                      <Music className="w-4 h-4" />
                      {playlist.tracks.length} tracks
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {playlist.tracks.reduce((total, track) => {
                        const [min, sec] = track.duration.split(':').map(Number);
                        return total + min * 60 + sec;
                      }, 0) / 60 | 0} min
                    </span>
                  </div>

                  {/* Track List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {playlist.tracks.map((track, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="p-1 text-custom-blue hover:bg-custom-blue/10"
                            onClick={() => handlePlayTrack(`${playlist.id}-${index}`, track.spotifyUrl)}
                          >
                            {currentlyPlaying === `${playlist.id}-${index}` ? 
                              <Pause className="w-4 h-4" /> : 
                              <Play className="w-4 h-4" />
                            }
                          </Button>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold-custom text-custom-blue text-sm truncate">{track.name}</p>
                            <p className="text-xs text-custom-blue/70 truncate">{track.artist}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-custom-blue font-bold-custom">{track.duration}</span>
                          {track.spotifyUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="p-1 text-green-600 hover:bg-green-50"
                              onClick={() => window.open(track.spotifyUrl, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Playlist Actions */}
                  <div className="flex gap-2 pt-4 border-t border-custom-blue/20">
                    <Button
                      variant="outline"
                      className="flex-1 border-custom-blue text-custom-blue hover:bg-custom-blue/10 font-bold-custom"
                      onClick={() => setCurrentlyPlaying(playlist.id)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play All
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white font-bold-custom"
                      onClick={() => handlePlayPlaylist(playlist.spotifyUrl)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Spotify
                    </Button>
                    <Button variant="ghost" size="sm" className="text-custom-blue hover:bg-custom-blue/10">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredPlaylists.length === 0 && searchQuery && (
        <Card className="border-2 border-custom-blue">
          <CardContent className="text-center py-12">
            <Music className="w-16 h-16 text-custom-blue mx-auto mb-4" />
            <h3 className="text-xl font-black-custom text-custom-blue mb-2">No playlists found</h3>
            <p className="text-custom-blue font-bold-custom mb-4">
              Try searching with different keywords or browse our curated collections
            </p>
            <Button 
              onClick={() => setSearchQuery('')}
              className="bg-custom-blue text-white hover:bg-custom-blue/90 font-bold-custom"
            >
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="border-2 border-custom-blue">
          <CardContent className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-custom-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-custom-blue font-bold-custom">Loading your personalized recommendations...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}