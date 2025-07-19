import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Heart, Smile, Battery, Shield, Moon } from 'lucide-react';
import { useMoodStore } from '@/stores/useMoodStore';
import { toast } from 'sonner';
import MusicRecommendations from '@/components/ui/music-recommendations';
import config from '@/config';

export default function MoodTrackerPage() {
  const [mood, setMood] = useState([5]);
  const [energy, setEnergy] = useState([5]);
  const [anxiety, setAnxiety] = useState([5]);
  const [sleep, setSleep] = useState([8]);
  const [notes, setNotes] = useState('');
  const [musicRecommendations, setMusicRecommendations] = useState(null);
  const [isLoadingMusic, setIsLoadingMusic] = useState(false);
  const { addEntry } = useMoodStore();

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast.error('Please add some notes about your day');
      return;
    }

    const success = await addEntry({
      mood: mood[0],
      energy: energy[0],
      anxiety: anxiety[0],
      sleep: sleep[0],
      notes: notes.trim(),
    });

    if (success) {
      toast.success('Mood logged successfully!');
      
      // Fetch music recommendations based on the logged mood
      setIsLoadingMusic(true);
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/music/recommendations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            mood_score: mood[0],
            energy_level: energy[0],
            anxiety_level: anxiety[0],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setMusicRecommendations(data.recommendations);
        }
      } catch (error) {
        console.error('Error fetching music recommendations:', error);
      } finally {
        setIsLoadingMusic(false);
      }

      // Reset form
      setMood([5]);
      setEnergy([5]);
      setAnxiety([5]);
      setSleep([8]);
      setNotes('');
    } else {
      toast.error('Failed to log mood. Please try again.');
    }
  };

  const getMoodDescription = (value: number) => {
    if (value <= 2) return 'Very Low';
    if (value <= 4) return 'Low';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Good';
    return 'Excellent';
  };

  const getAnxietyDescription = (value: number) => {
    if (value <= 2) return 'Very Calm';
    if (value <= 4) return 'Calm';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Anxious';
    return 'Very Anxious';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">How are you feeling today?</h1>
        <p className="text-muted-foreground">Track your mood, energy, and well-being</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Check-in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Slider */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-blue-500" />
              <label className="text-sm font-medium">Mood: {getMoodDescription(mood[0])} ({mood[0]}/10)</label>
            </div>
            <Slider
              value={mood}
              onValueChange={setMood}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Energy Slider */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Battery className="w-5 h-5 text-green-500" />
              <label className="text-sm font-medium">Energy: {getMoodDescription(energy[0])} ({energy[0]}/10)</label>
            </div>
            <Slider
              value={energy}
              onValueChange={setEnergy}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Anxiety Slider */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              <label className="text-sm font-medium">Anxiety: {getAnxietyDescription(anxiety[0])} ({anxiety[0]}/10)</label>
            </div>
            <Slider
              value={anxiety}
              onValueChange={setAnxiety}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Sleep Slider */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-purple-500" />
              <label className="text-sm font-medium">Sleep: {sleep[0]} hours</label>
            </div>
            <Slider
              value={sleep}
              onValueChange={setSleep}
              max={12}
              min={0}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">How was your day?</label>
            <Textarea
              placeholder="Tell us about your day, what made you feel this way?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Log Mood Entry
          </Button>
        </CardContent>
      </Card>

      {/* Music Recommendations */}
      {(musicRecommendations || isLoadingMusic) && (
        <MusicRecommendations 
          mood={mood[0]}
          energy={energy[0]}
          anxiety={anxiety[0]}
          recommendations={musicRecommendations}
        />
      )}
    </div>
  );
}