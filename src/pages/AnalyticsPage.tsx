import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Smile,
  Heart,
  Brain,
  Target,
  Download,
  Filter
} from 'lucide-react';
import { useMoodStore } from '@/stores/useMoodStore';

// Generate mock data for comprehensive analytics
const generateMockMoodData = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const moodScore = Math.floor(Math.random() * 5) + 3 + Math.sin(i * 0.1) * 2;
    const sleepHours = Math.random() * 3 + 6;
    const exerciseMinutes = Math.random() * 60;
    const stressLevel = Math.random() * 10;
    
    days.push({
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en', { weekday: 'short' }),
      mood: Math.max(1, Math.min(10, Math.round(moodScore))),
      sleep: Math.round(sleepHours * 10) / 10,
      exercise: Math.round(exerciseMinutes),
      stress: Math.round(stressLevel * 10) / 10
    });
  }
  
  return days;
};

const moodColors = {
  1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#84cc16', 
  5: '#22c55e', 6: '#10b981', 7: '#06b6d4', 8: '#3b82f6', 
  9: '#8b5cf6', 10: '#d946ef'
};

const moodDistributionData = [
  { name: 'Excellent (9-10)', value: 25, color: '#22c55e' },
  { name: 'Good (7-8)', value: 35, color: '#84cc16' },
  { name: 'Okay (5-6)', value: 25, color: '#eab308' },
  { name: 'Poor (3-4)', value: 12, color: '#f97316' },
  { name: 'Very Poor (1-2)', value: 3, color: '#ef4444' }
];

const weeklyPatterns = [
  { day: 'Mon', avgMood: 6.2, entries: 28 },
  { day: 'Tue', avgMood: 6.8, entries: 30 },
  { day: 'Wed', avgMood: 6.5, entries: 29 },
  { day: 'Thu', avgMood: 7.1, entries: 31 },
  { day: 'Fri', avgMood: 7.8, entries: 32 },
  { day: 'Sat', avgMood: 8.2, entries: 25 },
  { day: 'Sun', avgMood: 7.5, entries: 27 }
];

export default function AnalyticsPage() {
  const { entries, getMoodStats } = useMoodStore();
  const stats = getMoodStats();
  const mockData = useMemo(() => generateMockMoodData(), []);
  
  const averageMood = mockData.reduce((sum, day) => sum + day.mood, 0) / mockData.length;
  const moodTrend = mockData[mockData.length - 1].mood - mockData[mockData.length - 7].mood;
  const bestDay = weeklyPatterns.reduce((prev, current) => 
    prev.avgMood > current.avgMood ? prev : current
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Insights into your mental health patterns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
            <Smile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMood.toFixed(1)}/10</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {moodTrend > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(moodTrend).toFixed(1)} from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15 days</div>
            <p className="text-xs text-muted-foreground">
              Consistent tracking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Day</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestDay.day}</div>
            <p className="text-xs text-muted-foreground">
              Avg mood: {bestDay.avgMood.toFixed(1)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mood Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Mood Trend</CardTitle>
          <CardDescription>Your mood progression over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="dayName" 
                className="text-sm"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[1, 10]}
                className="text-sm"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Patterns</CardTitle>
            <CardDescription>Average mood by day of the week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyPatterns}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="avgMood" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mood Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Mood Distribution</CardTitle>
            <CardDescription>How often you experience different mood levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={moodDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {moodDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Percentage']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {moodDistributionData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Correlation Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Mood Correlations</CardTitle>
          <CardDescription>How different factors affect your mood</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <Heart className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">+0.73</div>
              <p className="text-sm font-medium">Sleep Quality</p>
              <p className="text-xs text-muted-foreground">Strong positive correlation</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">+0.51</div>
              <p className="text-sm font-medium">Exercise</p>
              <p className="text-xs text-muted-foreground">Moderate positive correlation</p>
            </div>
            
            <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <Brain className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">-0.68</div>
              <p className="text-sm font-medium">Stress Level</p>
              <p className="text-xs text-muted-foreground">Strong negative correlation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
          <CardDescription>Personalized recommendations based on your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Mood Improving Trend</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your mood has improved by 15% over the past week. Keep up the great work with your current routine!
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Weekend Boost</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your mood consistently improves on weekends. Consider incorporating more leisure activities during weekdays.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <Heart className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-100">Sleep Impact</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Better sleep quality strongly correlates with improved mood. Try maintaining 7-8 hours of sleep nightly.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}