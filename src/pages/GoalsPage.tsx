import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Target, 
  Plus, 
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Flag,
  TrendingUp,
  Trophy,
  Star,
  Play,
  Pause
} from 'lucide-react';
import { toast } from 'sonner';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'mental-health' | 'physical' | 'social' | 'personal' | 'professional';
  priority: 'low' | 'medium' | 'high';
  targetDate: string;
  progress: number;
  isCompleted: boolean;
  createdAt: string;
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string;
}

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Daily Mood Tracking',
    description: 'Track my mood every day for 30 days to better understand my emotional patterns',
    category: 'mental-health',
    priority: 'high',
    targetDate: '2024-02-15',
    progress: 75,
    isCompleted: false,
    createdAt: '2024-01-15T10:00:00Z',
    milestones: [
      { id: 'm1', title: 'Track mood for 7 days', isCompleted: true, completedAt: '2024-01-22T10:00:00Z' },
      { id: 'm2', title: 'Track mood for 14 days', isCompleted: true, completedAt: '2024-01-29T10:00:00Z' },
      { id: 'm3', title: 'Track mood for 21 days', isCompleted: true },
      { id: 'm4', title: 'Complete 30 days', isCompleted: false }
    ]
  },
  {
    id: '2',
    title: 'Morning Meditation Practice',
    description: 'Establish a consistent 10-minute morning meditation routine',
    category: 'mental-health',
    priority: 'medium',
    targetDate: '2024-03-01',
    progress: 40,
    isCompleted: false,
    createdAt: '2024-01-10T09:00:00Z',
    milestones: [
      { id: 'm5', title: 'Meditate for 3 consecutive days', isCompleted: true },
      { id: 'm6', title: 'Meditate for 1 week', isCompleted: true },
      { id: 'm7', title: 'Meditate for 2 weeks', isCompleted: false },
      { id: 'm8', title: 'Establish 30-day routine', isCompleted: false }
    ]
  },
  {
    id: '3',
    title: 'Connect with Friends Weekly',
    description: 'Reach out to at least one friend each week to strengthen social connections',
    category: 'social',
    priority: 'medium',
    targetDate: '2024-06-01',
    progress: 85,
    isCompleted: false,
    createdAt: '2024-01-01T12:00:00Z',
    milestones: [
      { id: 'm9', title: 'Connect for 4 weeks', isCompleted: true },
      { id: 'm10', title: 'Connect for 8 weeks', isCompleted: true },
      { id: 'm11', title: 'Connect for 12 weeks', isCompleted: true },
      { id: 'm12', title: 'Maintain for 6 months', isCompleted: false }
    ]
  }
];

const categories = [
  { value: 'mental-health', label: 'Mental Health', color: 'bg-blue-100 text-blue-800' },
  { value: 'physical', label: 'Physical', color: 'bg-green-100 text-green-800' },
  { value: 'social', label: 'Social', color: 'bg-purple-100 text-purple-800' },
  { value: 'personal', label: 'Personal', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'professional', label: 'Professional', color: 'bg-red-100 text-red-800' }
];

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [isCreating, setIsCreating] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'mental-health' as const,
    priority: 'medium' as const,
    targetDate: '',
    milestones: [''] as string[]
  });

  const activeGoals = goals.filter(goal => !goal.isCompleted);
  const completedGoals = goals.filter(goal => goal.isCompleted);
  const filteredGoals = selectedCategory === 'all' ? goals : goals.filter(goal => goal.category === selectedCategory);

  const handleCreateGoal = () => {
    if (!newGoal.title.trim() || !newGoal.description.trim() || !newGoal.targetDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      priority: newGoal.priority,
      targetDate: newGoal.targetDate,
      progress: 0,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      milestones: newGoal.milestones
        .filter(m => m.trim())
        .map((milestone, index) => ({
          id: `${Date.now()}-${index}`,
          title: milestone,
          isCompleted: false
        }))
    };

    if (editingGoal) {
      setGoals(prev => prev.map(g => 
        g.id === editingGoal.id 
          ? { ...goal, id: editingGoal.id, createdAt: editingGoal.createdAt, progress: editingGoal.progress }
          : g
      ));
      toast.success('Goal updated successfully!');
    } else {
      setGoals(prev => [goal, ...prev]);
      toast.success('New goal created!');
    }

    resetForm();
  };

  const resetForm = () => {
    setNewGoal({
      title: '',
      description: '',
      category: 'mental-health',
      priority: 'medium',
      targetDate: '',
      milestones: ['']
    });
    setIsCreating(false);
    setEditingGoal(null);
  };

  const handleEditGoal = (goal: Goal) => {
    setNewGoal({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      priority: goal.priority,
      targetDate: goal.targetDate,
      milestones: goal.milestones.map(m => m.title)
    });
    setEditingGoal(goal);
    setIsCreating(true);
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id !== goalId) return goal;
      
      const updatedMilestones = goal.milestones.map(milestone => {
        if (milestone.id === milestoneId) {
          return {
            ...milestone,
            isCompleted: !milestone.isCompleted,
            completedAt: !milestone.isCompleted ? new Date().toISOString() : undefined
          };
        }
        return milestone;
      });

      const completedCount = updatedMilestones.filter(m => m.isCompleted).length;
      const progress = (completedCount / updatedMilestones.length) * 100;
      const isCompleted = progress === 100;

      return {
        ...goal,
        milestones: updatedMilestones,
        progress: Math.round(progress),
        isCompleted
      };
    }));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    toast.success('Goal deleted');
  };

  const addMilestone = () => {
    setNewGoal(prev => ({
      ...prev,
      milestones: [...prev.milestones, '']
    }));
  };

  const removeMilestone = (index: number) => {
    setNewGoal(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const updateMilestone = (index: number, value: string) => {
    setNewGoal(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => 
        i === index ? value : milestone
      )
    }));
  };

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  const getPriorityInfo = (priority: string) => {
    return priorities.find(p => p.value === priority) || priorities[1];
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Wellness Goals</h1>
          <p className="text-muted-foreground">Set and track your mental health objectives</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{activeGoals.length}</p>
                <p className="text-sm text-muted-foreground">Active Goals</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{completedGoals.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(activeGoals.reduce((sum, goal) => sum + goal.progress, 0) / activeGoals.length || 0)}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {goals.reduce((sum, goal) => sum + goal.milestones.filter(m => m.isCompleted).length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Milestones Hit</p>
              </div>
              <Star className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory('all')}
            >
              All Goals
            </Badge>
            {categories.map(category => (
              <Badge
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goal Creation Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Goal Title *</label>
                <Input
                  placeholder="Enter your goal..."
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Target Date *</label>
                <Input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                placeholder="Describe your goal in detail..."
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={newGoal.category}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value as any }))}
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, priority: e.target.value as any }))}
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Milestones</label>
              <div className="space-y-2">
                {newGoal.milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Milestone ${index + 1}...`}
                      value={milestone}
                      onChange={(e) => updateMilestone(index, e.target.value)}
                    />
                    {newGoal.milestones.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeMilestone(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addMilestone}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Milestone
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateGoal}>
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      <div className="space-y-6">
        {filteredGoals.map((goal) => (
          <Card key={goal.id} className={`${goal.isCompleted ? 'bg-green-50 dark:bg-green-950' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className={`text-xl ${goal.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {goal.title}
                    </CardTitle>
                    {goal.isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className={getCategoryInfo(goal.category).color}>
                      {getCategoryInfo(goal.category).label}
                    </Badge>
                    <Badge className={getPriorityInfo(goal.priority).color}>
                      <Flag className="w-3 h-3 mr-1" />
                      {getPriorityInfo(goal.priority).label}
                    </Badge>
                    <Badge variant="outline">
                      <Calendar className="w-3 h-3 mr-1" />
                      {getDaysRemaining(goal.targetDate)} days left
                    </Badge>
                  </div>
                  
                  <CardDescription>{goal.description}</CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditGoal(goal)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>

                {goal.milestones.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Milestones</h4>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={milestone.isCompleted}
                            onCheckedChange={() => toggleMilestone(goal.id, milestone.id)}
                          />
                          <span className={`text-sm ${milestone.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {milestone.title}
                          </span>
                          {milestone.isCompleted && milestone.completedAt && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {new Date(milestone.completedAt).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredGoals.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No goals found</h3>
              <p className="text-muted-foreground mb-4">
                {selectedCategory === 'all' 
                  ? "Start by creating your first wellness goal"
                  : `No goals in the ${getCategoryInfo(selectedCategory).label} category`
                }
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}