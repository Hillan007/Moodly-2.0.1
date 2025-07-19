import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Smile, Meh, Frown } from 'lucide-react';
import { useMoodStore } from '@/stores/useMoodStore';
import { toast } from 'sonner';

const moodOptions = [
  { key: 'happy', name: 'Happy', icon: Smile, score: 8, color: 'mood-happy' },
  { key: 'calm', name: 'Calm', icon: Heart, score: 7, color: 'mood-calm' },
  { key: 'anxious', name: 'Anxious', icon: Meh, score: 4, color: 'mood-anxious' },
  { key: 'sad', name: 'Sad', icon: Frown, score: 3, color: 'mood-sad' },
];

export default function MoodTrackerPage() {
  const [selectedMood, setSelectedMood] = useState('');
  const [entryText, setEntryText] = useState('');
  const { addEntry } = useMoodStore();

  const handleSubmit = () => {
    if (!selectedMood || !entryText) {
      toast.error('Please select a mood and add some notes');
      return;
    }

    const moodOption = moodOptions.find(m => m.key === selectedMood);
    if (moodOption) {
      addEntry({
        mood_score: moodOption.score,
        mood_description: selectedMood,
        entry_text: entryText,
      });
      toast.success('Mood logged successfully!');
      setSelectedMood('');
      setEntryText('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">How are you feeling today?</h1>
        <p className="text-muted-foreground">Track your mood and reflect on your emotions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Your Mood</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {moodOptions.map((mood) => (
              <Button
                key={mood.key}
                variant={selectedMood === mood.key ? "default" : "outline"}
                className="h-20 flex-col gap-2"
                onClick={() => setSelectedMood(mood.key)}
              >
                <mood.icon className="w-8 h-8" />
                <span>{mood.name}</span>
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">How was your day?</label>
            <Textarea
              placeholder="Tell us about your day, what made you feel this way?"
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Log Mood Entry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}