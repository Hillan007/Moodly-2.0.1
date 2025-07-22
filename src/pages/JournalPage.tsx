import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  PenTool, 
  Search, 
  Filter,
  Calendar,
  Heart,
  Bookmark,
  BookmarkPlus,  // Changed from BookmarkPlus
  Edit,
  Trash2,
  Plus,
  Clock,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

// Mock journal entries
const mockEntries: JournalEntry[] = [
  {
    id: '1',
    title: 'A Beautiful Morning',
    content: 'Today started with an amazing sunrise. I felt so grateful for the simple pleasures in life. The coffee tasted better, the birds sounded more melodic, and everything seemed to fall into place. I realized that happiness often comes from appreciating the small moments.',
    mood: 8,
    tags: ['gratitude', 'morning', 'happiness'],
    createdAt: '2024-01-15T08:30:00Z',
    updatedAt: '2024-01-15T08:30:00Z',
    isFavorite: true
  },
  {
    id: '2',
    title: 'Challenging Day at Work',
    content: 'Work was particularly stressful today. Multiple deadlines, difficult meetings, and technical issues. However, I managed to stay calm and tackle each problem methodically. By the end of the day, I felt accomplished despite the challenges.',
    mood: 6,
    tags: ['work', 'stress', 'resilience'],
    createdAt: '2024-01-14T18:45:00Z',
    updatedAt: '2024-01-14T18:45:00Z',
    isFavorite: false
  },
  {
    id: '3',
    title: 'Quality Time with Family',
    content: 'Spent the evening with family playing board games and sharing stories. These moments remind me what truly matters in life. Laughter filled the room, and I felt deeply connected to my loved ones.',
    mood: 9,
    tags: ['family', 'connection', 'joy'],
    createdAt: '2024-01-13T20:00:00Z',
    updatedAt: '2024-01-13T20:00:00Z',
    isFavorite: true
  },
  {
    id: '4',
    title: 'Reflection on Growth',
    content: 'Looking back at the past month, I can see how much I\'ve grown. The challenges I faced have made me stronger and more resilient. I\'m learning to be more patient with myself and celebrate small victories.',
    mood: 7,
    tags: ['growth', 'reflection', 'progress'],
    createdAt: '2024-01-12T16:20:00Z',
    updatedAt: '2024-01-12T16:20:00Z',
    isFavorite: false
  }
];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(mockEntries);
  const [isWriting, setIsWriting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 5,
    tags: [] as string[],
    newTag: ''
  });

  const allTags = Array.from(new Set(entries.flatMap(entry => entry.tags)));
  
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => entry.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const handleSaveEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    const entry: JournalEntry = {
      id: Date.now().toString(),
      title: newEntry.title,
      content: newEntry.content,
      mood: newEntry.mood,
      tags: newEntry.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false
    };

    if (editingEntry) {
      setEntries(prev => prev.map(e => 
        e.id === editingEntry.id 
          ? { ...entry, id: editingEntry.id, createdAt: editingEntry.createdAt }
          : e
      ));
      toast.success('Entry updated successfully!');
    } else {
      setEntries(prev => [entry, ...prev]);
      toast.success('New entry created!');
    }

    // Reset form
    setNewEntry({ title: '', content: '', mood: 5, tags: [], newTag: '' });
    setIsWriting(false);
    setEditingEntry(null);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setNewEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags,
      newTag: ''
    });
    setEditingEntry(entry);
    setIsWriting(true);
  };

  const handleDeleteEntry = (entryId: string) => {
    setEntries(prev => prev.filter(e => e.id !== entryId));
    toast.success('Entry deleted');
  };

  const toggleFavorite = (entryId: string) => {
    setEntries(prev => prev.map(e => 
      e.id === entryId ? { ...e, isFavorite: !e.isFavorite } : e
    ));
  };

  const addTag = () => {
    if (newEntry.newTag.trim() && !newEntry.tags.includes(newEntry.newTag.trim())) {
      setNewEntry(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewEntry(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-green-600';
    if (mood >= 6) return 'text-blue-600';
    if (mood >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMoodLabel = (mood: number) => {
    if (mood >= 8) return 'Great';
    if (mood >= 6) return 'Good';
    if (mood >= 4) return 'Okay';
    return 'Difficult';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Journal</h1>
          <p className="text-muted-foreground">Reflect and write about your thoughts and feelings</p>
        </div>
        <Button 
          onClick={() => setIsWriting(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(prev => prev.filter(t => t !== tag));
                    } else {
                      setSelectedTags(prev => [...prev, tag]);
                    }
                  }}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Writing Interface */}
      {isWriting && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="w-5 h-5" />
              {editingEntry ? 'Edit Entry' : 'New Entry'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Entry title..."
                value={newEntry.title}
                onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                className="text-lg font-medium"
              />
            </div>
            
            <div>
              <Textarea
                placeholder="What's on your mind today?"
                value={newEntry.content}
                onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Mood (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newEntry.mood}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, mood: parseInt(e.target.value) || 5 }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newEntry.newTag}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, newTag: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button variant="outline" onClick={addTag}>Add</Button>
                </div>
              </div>
            </div>

            {newEntry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newEntry.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ✕
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSaveEntry}>
                {editingEntry ? 'Update Entry' : 'Save Entry'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsWriting(false);
                  setEditingEntry(null);
                  setNewEntry({ title: '', content: '', mood: 5, tags: [], newTag: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{entries.length}</p>
                <p className="text-sm text-muted-foreground">Total Entries</p>
              </div>
              <PenTool className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{entries.filter(e => e.isFavorite).length}</p>
                <p className="text-sm text-muted-foreground">Favorites</p>
              </div>
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {(entries.reduce((sum, e) => sum + e.mood, 0) / entries.length).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Avg Mood</p>
              </div>
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{allTags.length}</p>
                <p className="text-sm text-muted-foreground">Unique Tags</p>
              </div>
              <Tag className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journal Entries */}
      <div className="space-y-6">
        {filteredEntries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{entry.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(entry.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(entry.createdAt)}
                    </div>
                    <div className={`flex items-center gap-1 font-medium ${getMoodColor(entry.mood)}`}>
                      <Heart className="w-4 h-4" />
                      {getMoodLabel(entry.mood)} ({entry.mood}/10)
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(entry.id)}
                  >
                    {entry.isFavorite ? (
                      <BookmarkPlus className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditEntry(entry)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEntry(entry.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {entry.content}
              </p>
              
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredEntries.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <PenTool className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No entries found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedTags.length > 0 
                  ? "Try adjusting your search or filters"
                  : "Start writing your first journal entry"
                }
              </p>
              {!(searchTerm || selectedTags.length > 0) && (
                <Button onClick={() => setIsWriting(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Write First Entry
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
