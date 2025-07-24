import React, { useEffect, useState } from 'react';
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

const DashboardPage: React.FC = () => {
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

  const features = [
    {
      title: "Mood Tracker",
      description: "Track your daily mood and emotions",
      icon: "😊",
      path: "/mood-tracker",
      color: "bg-blue-500",
    },
    {
      title: "Journal",
      description: "Write and reflect on your thoughts",
      icon: "📝",
      path: "/journal",
      color: "bg-green-500",
    },
    {
      title: "Analytics",
      description: "View your mood patterns and insights",
      icon: "📊",
      path: "/analytics",
      color: "bg-purple-500",
    },
    {
      title: "Breathing",
      description: "Guided breathing exercises",
      icon: "🫁",
      path: "/breathing",
      color: "bg-teal-500",
    },
    {
      title: "Goals",
      description: "Set and track your wellness goals",
      icon: "🎯",
      path: "/goals",
      color: "bg-orange-500",
    },
    {
      title: "Music",
      description: "Relaxing music and soundscapes",
      icon: "🎵",
      path: "/music",
      color: "bg-pink-500",
    },
  ];

  const statsData = [
    { label: "Days Active", value: "7", color: "text-blue-600" },
    { label: "Journal Entries", value: "12", color: "text-green-600" },
    { label: "Mood Average", value: "8.2", color: "text-purple-600" },
    { label: "Goals Completed", value: "3", color: "text-orange-600" },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name || 'Friend'}! 🧠
        </h1>
        <p className="text-blue-100">
          How are you feeling today? Let's continue your wellness journey.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Quick Actions
          </CardTitle>
          <CardDescription>
            Jump into your favorite wellness activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                onClick={() => navigate(feature.path)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Moods</CardTitle>
            <CardDescription>Your mood trends this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { day: "Today", mood: "Great", emoji: "😊", color: "bg-green-100 text-green-800" },
                { day: "Yesterday", mood: "Good", emoji: "🙂", color: "bg-blue-100 text-blue-800" },
                { day: "Tuesday", mood: "Okay", emoji: "😐", color: "bg-yellow-100 text-yellow-800" },
                { day: "Monday", mood: "Stressed", emoji: "😰", color: "bg-red-100 text-red-800" },
              ].map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{entry.emoji}</span>
                    <div>
                      <p className="font-medium text-gray-900">{entry.day}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${entry.color}`}>
                        {entry.mood}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/mood-tracker')}
            >
              Track Today's Mood
            </Button>
          </CardContent>
        </Card>

        {/* Recent Journal Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Thoughts</CardTitle>
            <CardDescription>Your latest journal entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: "Today", title: "Morning reflections", preview: "Started the day with gratitude..." },
                { date: "Yesterday", title: "Evening thoughts", preview: "Reflecting on a productive day..." },
                { date: "Tuesday", title: "Midweek check-in", preview: "Feeling overwhelmed but managing..." },
              ].map((entry, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{entry.title}</h4>
                    <span className="text-xs text-gray-500">{entry.date}</span>
                  </div>
                  <p className="text-sm text-gray-600">{entry.preview}</p>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/journal')}
            >
              Write New Entry
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Wellness Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">💡 Daily Wellness Tip</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>Mindful Breathing:</strong> Take 5 deep breaths right now. Inhale for 4 counts, 
              hold for 4, exhale for 6. This simple exercise can help reduce stress and increase focus.
            </p>
            <Button 
              className="mt-3"
              onClick={() => navigate('/breathing')}
            >
              Try Breathing Exercise
            </Button>
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
  );
};

export default DashboardPage;