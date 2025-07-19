import { useEffect } from 'react';
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
  Activity
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMoodStore } from '@/stores/useMoodStore';

const moodIcons = {
  happy: Smile,
  calm: Heart,
  anxious: Meh,
  sad: Frown,
  angry: Frown,
  excited: Smile,
};

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { entries, loadEntries, getMoodStats } = useMoodStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadEntries();
  }, [isAuthenticated, navigate, loadEntries]);

  const stats = getMoodStats();
  const recentEntries = entries.slice(0, 3);

  const getMoodColor = (mood: string) => {
    const colors = {
      happy: 'text-mood-happy',
      calm: 'text-mood-calm',
      anxious: 'text-mood-anxious',
      sad: 'text-mood-sad',
      angry: 'text-mood-angry',
      excited: 'text-mood-excited',
    };
    return colors[mood as keyof typeof colors] || 'text-muted-foreground';
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, {user.username}!</h1>
        <p className="text-muted-foreground text-lg">
          Here's how you're doing on your wellness journey.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-mood-happy/10 to-mood-happy/5 border-mood-happy/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Heart className="h-4 w-4 text-mood-happy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.mood_streak} days</div>
            <p className="text-xs text-muted-foreground">Keep it going!</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-mood-calm/10 to-mood-calm/5 border-mood-calm/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
            <TrendingUp className="h-4 w-4 text-mood-calm" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.average_mood}/10</div>
            <p className={`text-xs ${getTrendColor(stats.mood_trend)}`}>
              {stats.mood_trend === 'improving' ? '↗ Improving' : 
               stats.mood_trend === 'declining' ? '↘ Needs attention' : 
               '→ Stable'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <PenTool className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_entries}</div>
            <p className="text-xs text-muted-foreground">Journal entries</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wellness Score</CardTitle>
            <Activity className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Above average</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Mood Entries */}
        <div className="lg:col-span-2">
          <Card className="h-fit">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Mood Entries</CardTitle>
                <CardDescription>Your latest emotional check-ins</CardDescription>
              </div>
              <Button onClick={() => navigate('/mood-tracker')} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Log Mood
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentEntries.length > 0 ? recentEntries.map((entry) => {
                const IconComponent = moodIcons[entry.mood_description as keyof typeof moodIcons] || Heart;
                return (
                  <div key={entry.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                    <div className={`p-2 rounded-full bg-background ${getMoodColor(entry.mood_description)}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {entry.mood_score}/10
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium capitalize mb-1">
                        {entry.mood_description}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {entry.entry_text}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No mood entries yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking your mood to see insights here
                  </p>
                  <Button onClick={() => navigate('/mood-tracker')}>
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
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Tools to support your wellness</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/journal')}
              >
                <PenTool className="w-4 h-4 mr-2" />
                Write in Journal
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/breathing')}
              >
                <Brain className="w-4 h-4 mr-2" />
                Breathing Exercise
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/goals')}
              >
                <Target className="w-4 h-4 mr-2" />
                Set a Goal
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/analytics')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Wellness Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Wellness Progress</CardTitle>
              <CardDescription>Your journey this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Daily Check-ins</span>
                  <span>5/7</span>
                </div>
                <Progress value={71} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Journal Entries</span>
                  <span>3/5</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Breathing Sessions</span>
                  <span>2/3</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Today's Insight */}
          <Card className="bg-gradient-wellness border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Today's Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                Your mood has been consistently improving over the past week. 
                Consider maintaining your current sleep schedule and social activities, 
                as they appear to positively impact your wellbeing.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}