import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  PenTool, 
  TrendingUp, 
  Calendar,
  Target,
  Brain,
  Plus,
  Smile,
  Meh,
  Frown,
  Activity,
  Battery,
  Shield,
  Moon,
  Music,
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useMoodStore } from '@/stores/useMoodStore';
import config from '@/config';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { entries, loadEntries, getMoodStats, isLoading } = useMoodStore();
  const navigate = useNavigate();
  
  // AI Insights state
  const [todaysInsight, setTodaysInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState(false);

  // Fallback insights based on mood patterns
  const getFallbackInsight = (entries: any[], stats: any) => {
    if (entries.length === 0) {
      return "Start tracking your mood daily to unlock personalized insights about your mental wellness patterns and receive AI-powered recommendations for improving your emotional wellbeing.";
    }

    const recentMood = entries[0]?.mood || 5;
    const avgMood = stats.average_mood;
    const trend = stats.mood_trend;

    if (trend === 'improving') {
      return `Excellent progress! Your mood has been trending upward with an average of ${avgMood}/10. This positive momentum suggests your current wellness strategies are working well. Keep maintaining your healthy routines and consider adding new activities that bring you joy.`;
    } else if (trend === 'declining') {
      return `Your mood trend shows room for improvement. Consider focusing on self-care activities like regular exercise, adequate sleep, or connecting with supportive friends. Small consistent changes can make a significant difference in your emotional wellbeing.`;
    } else if (recentMood >= 7) {
      return `You're doing well today with a mood score of ${recentMood}/10! High mood levels often correlate with good sleep, social connections, and engaging activities. Try to identify what's contributing to this positive state so you can replicate it.`;
    } else if (recentMood <= 4) {
      return `Today feels challenging with a mood score of ${recentMood}/10. Remember that difficult days are part of the human experience. Consider practicing breathing exercises, gentle movement, or reaching out to someone you trust for support.`;
    } else {
      return `Your mood is in a balanced range today at ${recentMood}/10. This stability is valuable - use this steady emotional state to build healthy habits, reflect on your goals, or engage in activities that promote long-term wellbeing.`;
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Load mood entries when user is authenticated
    loadEntries();
  }, [isAuthenticated, navigate, loadEntries]);

  // Load AI insights when entries are available
  useEffect(() => {
    const loadTodaysInsight = async () => {
      if (entries.length === 0) {
        const stats = getMoodStats();
        setTodaysInsight(getFallbackInsight(entries, stats));
        return;
      }

      setInsightLoading(true);
      setInsightError(false);
      
      try {
        // First check if the latest entry has AI insights
        const latestEntry = entries[0];
        if (latestEntry?.ai_insights && latestEntry.ai_insights.trim()) {
          setTodaysInsight(latestEntry.ai_insights);
          setInsightLoading(false);
          return;
        }

        // Generate new AI insight based on recent entries
        const response = await fetch(`${config.API_BASE_URL}/api/insights/weekly`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            mood_entries: entries.slice(0, 7), // Last 7 entries
            user_preferences: {
              focus_areas: ['mood_trends', 'sleep_patterns', 'energy_levels'],
              insight_type: 'daily_summary'
            }
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setTodaysInsight(data.insight || data.analysis);
        } else {
          throw new Error('AI service unavailable');
        }
      } catch (error) {
        console.error('Failed to load AI insight:', error);
        setInsightError(true);
        // Use fallback insight
        const stats = getMoodStats();
        setTodaysInsight(getFallbackInsight(entries, stats));
      } finally {
        setInsightLoading(false);
      }
    };

    loadTodaysInsight();
  }, [entries, getMoodStats]);

  const stats = getMoodStats();
  const recentEntries = entries.slice(0, 3);

  const getMoodIcon = (mood: number) => {
    if (mood >= 8) return Smile;
    if (mood >= 6) return Heart;
    if (mood >= 4) return Meh;
    return Frown;
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-green-700';
    if (mood >= 6) return 'text-blue-700';
    if (mood >= 4) return 'text-yellow-700';
    return 'text-red-700';
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-800 font-bold';
      case 'declining': return 'text-red-800 font-bold';
      default: return 'text-blue-800 font-bold';
    }
  };

  const refreshInsight = async () => {
    setInsightLoading(true);
    setInsightError(false);
    
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/insights/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          mood_entries: entries.slice(0, 7),
          regenerate: true
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setTodaysInsight(data.insight);
      } else {
        throw new Error('Failed to generate new insight');
      }
    } catch (error) {
      console.error('Failed to refresh insight:', error);
      setInsightError(true);
      const stats = getMoodStats();
      setTodaysInsight(getFallbackInsight(entries, stats));
    } finally {
      setInsightLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8" style={{ minHeight: '100vh', padding: '2rem' }}>
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black-custom text-custom-blue dashboard-title">
          Welcome back, {user.username}!
        </h1>
        <p className="text-xl font-bold-custom text-custom-blue dashboard-text">
          Here's how you're doing on your wellness journey.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-mood-happy/10 to-mood-happy/5 border-mood-happy/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold-custom text-custom-blue">Current Streak</CardTitle>
            <Heart className="h-4 w-4 text-mood-happy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black-custom text-custom-blue">{user.mood_streak} days</div>
            <p className="text-xs text-custom-blue font-bold-custom">Keep it going!</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-mood-calm/10 to-mood-calm/5 border-mood-calm/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold-custom text-custom-blue">Average Mood</CardTitle>
            <TrendingUp className="h-4 w-4 text-mood-calm" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black-custom text-custom-blue">{stats.average_mood}/10</div>
            <p className={`text-xs font-bold-custom ${getTrendColor(stats.mood_trend)}`}>
              {stats.mood_trend === 'improving' ? '↗ Improving' : 
               stats.mood_trend === 'declining' ? '↘ Needs attention' : 
               '→ Stable'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold-custom text-custom-blue">Total Entries</CardTitle>
            <PenTool className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black-custom text-custom-blue">{stats.total_entries}</div>
            <p className="text-xs text-custom-blue font-bold-custom">Journal entries</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold-custom text-custom-blue">Wellness Score</CardTitle>
            <Activity className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black-custom text-custom-blue">85%</div>
            <p className="text-xs text-custom-blue font-bold-custom">Above average</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Mood Entries */}
        <div className="lg:col-span-2">
          <Card className="h-fit border-2 border-custom-blue">
            <CardHeader className="flex flex-row items-center justify-between bg-gray-50">
              <div>
                <CardTitle className="text-xl font-black-custom text-custom-blue">Recent Mood Entries</CardTitle>
                <CardDescription className="text-custom-blue font-bold-custom text-base">Your latest emotional check-ins</CardDescription>
              </div>
              <Button onClick={() => navigate('/mood-tracker')} size="sm" className="font-bold-custom bg-custom-blue text-white hover:bg-custom-blue-dark">
                <Plus className="w-4 h-4 mr-2" />
                Log Mood
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-custom-blue mx-auto mb-2 animate-spin" />
                  <p className="text-custom-blue font-bold-custom">Loading mood entries...</p>
                </div>
              ) : recentEntries.length > 0 ? recentEntries.map((entry) => {
                const IconComponent = getMoodIcon(entry.mood);
                return (
                  <div key={entry.id} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border-2 border-custom-blue/20">
                    <div className={`p-2 rounded-full bg-white border-2 border-custom-blue ${getMoodColor(entry.mood)}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs font-bold-custom bg-custom-blue text-white">
                          Mood: {entry.mood}/10
                        </Badge>
                        <Badge variant="outline" className="text-xs font-bold-custom border-2 border-custom-blue text-custom-blue">
                          <Battery className="w-3 h-3 mr-1" />
                          Energy: {entry.energy}/10
                        </Badge>
                        <span className="text-sm text-custom-blue font-bold-custom">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mb-2 text-xs text-custom-blue font-bold-custom">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Anxiety: {entry.anxiety}/10
                        </span>
                        <span className="flex items-center gap-1">
                          <Moon className="w-3 h-3" />
                          Sleep: {entry.sleep}h
                        </span>
                      </div>
                      <p className="text-sm text-custom-blue line-clamp-2 font-bold-custom">
                        {entry.notes}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-custom-blue mx-auto mb-4" />
                  <h3 className="text-xl font-black-custom text-custom-blue mb-2">No mood entries yet</h3>
                  <p className="text-custom-blue font-bold-custom mb-4">
                    Start tracking your mood to see insights here
                  </p>
                  <Button onClick={() => navigate('/mood-tracker')} className="font-bold-custom bg-custom-blue text-white hover:bg-custom-blue-dark">
                    Log Your First Mood
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Tools */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-2 border-custom-blue">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-xl font-black-custom text-custom-blue">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-base font-bold-custom text-custom-blue">
                Tools to support your wellness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start nav-button" 
                onClick={() => navigate('/journal')}
              >
                <PenTool className="w-4 h-4 mr-2" />
                Write in Journal
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start nav-button"
                onClick={() => navigate('/breathing')}
              >
                <Brain className="w-4 h-4 mr-2" />
                Breathing Exercise
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start nav-button"
                onClick={() => navigate('/goals')}
              >
                <Target className="w-4 h-4 mr-2" />
                Set a Goal
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start nav-button"
                onClick={() => navigate('/analytics')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Wellness Progress */}
          <Card className="border-2 border-custom-blue">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-xl font-black-custom text-custom-blue">Wellness Progress</CardTitle>
              <CardDescription className="text-custom-blue font-bold-custom text-base">Your journey this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-custom-blue font-bold-custom">Daily Check-ins</span>
                  <span className="text-custom-blue font-black-custom">5/7</span>
                </div>
                <Progress value={71} className="h-3" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-custom-blue font-bold-custom">Journal Entries</span>
                  <span className="text-custom-blue font-black-custom">3/5</span>
                </div>
                <Progress value={60} className="h-3" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-custom-blue font-bold-custom">Breathing Sessions</span>
                  <span className="text-custom-blue font-black-custom">2/3</span>
                </div>
                <Progress value={67} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Today's AI-Enhanced Insight */}
          <Card className="insight-card">
            <CardHeader className="insight-header">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 dashboard-title">
                  <Brain className="w-6 h-6 text-custom-blue" />
                  Today's Insight
                  {insightLoading && <Loader2 className="w-5 h-5 animate-spin text-custom-blue" />}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshInsight}
                  disabled={insightLoading}
                  className="nav-button"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              {insightError && (
                <Badge variant="outline" className="text-xs font-bold-custom text-orange-700 border-2 border-orange-600 bg-orange-50">
                  Using Curated Insight
                </Badge>
              )}
              {!insightError && entries.length > 0 && (
                <Badge variant="default" className="text-xs font-bold-custom bg-custom-blue text-white border-2">
                  AI-Powered Analysis
                </Badge>
              )}
            </CardHeader>
            <CardContent className="bg-white p-6">
              <p className="insight-text">
                {todaysInsight || "Loading your personalized insight..."}
              </p>
            </CardContent>
          </Card>

          {/* Music for Your Mood */}
          <Card className="border-2 border-custom-blue">
            <CardHeader className="flex flex-row items-center justify-between bg-gray-50">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-black-custom text-custom-blue">
                  <Music className="w-5 h-5" />
                  Music for Your Mood
                </CardTitle>
                <CardDescription className="text-custom-blue font-bold-custom text-base">Personalized music recommendations</CardDescription>
              </div>
              <Button onClick={() => navigate('/music')} size="sm" variant="outline" className="font-bold-custom border-2 border-custom-blue text-custom-blue hover:bg-custom-blue/10">
                <Music className="w-4 h-4 mr-2" />
                Explore
              </Button>
            </CardHeader>
            <CardContent>
              {recentEntries.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-custom-blue font-bold-custom">
                    Based on your recent mood (
                    <span className="font-black-custom text-custom-blue">{recentEntries[0].mood}/10</span>
                    ), we suggest calming playlists to enhance your wellbeing.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-custom-blue/20">
                      <div>
                        <p className="font-black-custom text-sm text-custom-blue">Peaceful Vibes</p>
                        <p className="text-xs text-custom-blue font-bold-custom">Curated calming tracks</p>
                      </div>
                      <Badge variant="secondary" className="text-xs font-bold-custom bg-custom-blue text-white">Curated</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-custom-blue/20">
                      <div>
                        <p className="font-black-custom text-sm text-custom-blue">Mood Boost</p>
                        <p className="text-xs text-custom-blue font-bold-custom">Uplifting melodies</p>
                      </div>
                      <Badge variant="default" className="text-xs font-bold-custom bg-custom-blue text-white">Spotify</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Music className="w-8 h-8 text-custom-blue mx-auto mb-2" />
                  <p className="text-sm text-custom-blue font-bold-custom mb-3">
                    Log your mood to get personalized music recommendations
                  </p>
                  <Button onClick={() => navigate('/mood-tracker')} size="sm" className="font-bold-custom bg-custom-blue text-white hover:bg-custom-blue-dark">
                    Log Your Mood
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}