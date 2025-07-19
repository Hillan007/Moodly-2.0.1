import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Wind, 
  Heart, 
  Brain,
  Timer,
  Volume2,
  VolumeX
} from 'lucide-react';
import { toast } from 'sonner';

interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  cycles: number;
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  benefits: string[];
}

const exercises: BreathingExercise[] = [
  {
    id: '4-7-8',
    name: '4-7-8 Breathing',
    description: 'A calming technique that helps reduce anxiety and promote sleep',
    inhale: 4,
    hold: 7,
    exhale: 8,
    cycles: 4,
    duration: 76,
    difficulty: 'Beginner',
    benefits: ['Reduces anxiety', 'Improves sleep', 'Calms nervous system']
  },
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Used by Navy SEALs to maintain calm under pressure',
    inhale: 4,
    hold: 4,
    exhale: 4,
    cycles: 6,
    duration: 96,
    difficulty: 'Beginner',
    benefits: ['Improves focus', 'Reduces stress', 'Enhances performance']
  },
  {
    id: 'triangle',
    name: 'Triangle Breathing',
    description: 'Simple three-part breathing for quick stress relief',
    inhale: 4,
    hold: 0,
    exhale: 4,
    cycles: 8,
    duration: 64,
    difficulty: 'Beginner',
    benefits: ['Quick stress relief', 'Easy to learn', 'Balances energy']
  },
  {
    id: 'coherent',
    name: 'Coherent Breathing',
    description: 'Equal inhale and exhale for heart rate variability',
    inhale: 5,
    hold: 0,
    exhale: 5,
    cycles: 12,
    duration: 120,
    difficulty: 'Intermediate',
    benefits: ['Heart rate balance', 'Emotional regulation', 'Mental clarity']
  }
];

export default function BreathingPage() {
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [phaseTime, setPhaseTime] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && selectedExercise) {
      intervalRef.current = setInterval(() => {
        setPhaseTime(prev => {
          const newTime = prev + 1;
          let phaseDuration = 0;
          
          switch (currentPhase) {
            case 'inhale':
              phaseDuration = selectedExercise.inhale;
              break;
            case 'hold':
              phaseDuration = selectedExercise.hold;
              break;
            case 'exhale':
              phaseDuration = selectedExercise.exhale;
              break;
          }

          if (newTime >= phaseDuration) {
            // Move to next phase
            if (currentPhase === 'inhale') {
              if (selectedExercise.hold > 0) {
                setCurrentPhase('hold');
              } else {
                setCurrentPhase('exhale');
              }
            } else if (currentPhase === 'hold') {
              setCurrentPhase('exhale');
            } else {
              // Cycle complete
              const newCycle = currentCycle + 1;
              if (newCycle >= selectedExercise.cycles) {
                // Exercise complete
                setIsActive(false);
                setCurrentCycle(0);
                setTotalProgress(100);
                toast.success('Breathing exercise completed! 🧘‍♀️');
                return 0;
              } else {
                setCurrentCycle(newCycle);
                setCurrentPhase('inhale');
              }
            }
            return 0;
          }
          
          // Update total progress
          const totalSeconds = selectedExercise.cycles * (selectedExercise.inhale + selectedExercise.hold + selectedExercise.exhale);
          const completedSeconds = currentCycle * (selectedExercise.inhale + selectedExercise.hold + selectedExercise.exhale);
          let currentPhaseSeconds = 0;
          
          if (currentPhase === 'inhale') {
            currentPhaseSeconds = newTime;
          } else if (currentPhase === 'hold') {
            currentPhaseSeconds = selectedExercise.inhale + newTime;
          } else {
            currentPhaseSeconds = selectedExercise.inhale + selectedExercise.hold + newTime;
          }
          
          const progress = ((completedSeconds + currentPhaseSeconds) / totalSeconds) * 100;
          setTotalProgress(Math.min(progress, 100));
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, currentPhase, currentCycle, selectedExercise]);

  const startExercise = (exercise: BreathingExercise) => {
    setSelectedExercise(exercise);
    setIsActive(true);
    setCurrentPhase('inhale');
    setPhaseTime(0);
    setCurrentCycle(0);
    setTotalProgress(0);
  };

  const togglePause = () => {
    setIsActive(!isActive);
  };

  const resetExercise = () => {
    setIsActive(false);
    setCurrentPhase('inhale');
    setPhaseTime(0);
    setCurrentCycle(0);
    setTotalProgress(0);
  };

  const getCurrentPhaseDuration = () => {
    if (!selectedExercise) return 0;
    switch (currentPhase) {
      case 'inhale':
        return selectedExercise.inhale;
      case 'hold':
        return selectedExercise.hold;
      case 'exhale':
        return selectedExercise.exhale;
      default:
        return 0;
    }
  };

  const getPhaseProgress = () => {
    const duration = getCurrentPhaseDuration();
    return duration > 0 ? (phaseTime / duration) * 100 : 0;
  };

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      default:
        return '';
    }
  };

  const getBreathingCircleScale = () => {
    const progress = getPhaseProgress();
    if (currentPhase === 'inhale') {
      return 1 + (progress / 100) * 0.5;
    } else if (currentPhase === 'exhale') {
      return 1.5 - (progress / 100) * 0.5;
    }
    return 1.5; // hold phase
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Breathing Exercises</h1>
        <p className="text-muted-foreground">Guided breathing to reduce stress and improve mindfulness</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Exercise Selection */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Choose an Exercise</h2>
          {exercises.map((exercise) => (
            <Card 
              key={exercise.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedExercise?.id === exercise.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => !isActive && setSelectedExercise(exercise)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <Badge variant={
                    exercise.difficulty === 'Beginner' ? 'default' :
                    exercise.difficulty === 'Intermediate' ? 'secondary' : 'destructive'
                  }>
                    {exercise.difficulty}
                  </Badge>
                </div>
                <CardDescription>{exercise.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Timer className="w-4 h-4" />
                    {Math.floor(exercise.duration / 60)}:{(exercise.duration % 60).toString().padStart(2, '0')} min
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {exercise.inhale}s in • {exercise.hold > 0 ? `${exercise.hold}s hold • ` : ''}{exercise.exhale}s out
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {exercise.benefits.slice(0, 2).map((benefit, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Breathing Interface */}
        <div className="lg:col-span-2">
          {selectedExercise ? (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedExercise.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-8 py-12">
                {/* Breathing Circle */}
                <div className="relative">
                  <div 
                    className={`w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-4 border-primary/30 transition-transform duration-1000 ease-in-out flex items-center justify-center ${
                      currentPhase === 'inhale' ? 'scale-125' : 
                      currentPhase === 'exhale' ? 'scale-75' : 'scale-100'
                    }`}
                    style={{
                      transform: `scale(${getBreathingCircleScale()})`,
                    }}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-2">
                        {getPhaseInstruction()}
                      </div>
                      <div className="text-4xl font-bold">
                        {getCurrentPhaseDuration() - phaseTime}
                      </div>
                    </div>
                  </div>
                  
                  {/* Phase Progress Ring */}
                  <svg className="absolute inset-0 w-48 h-48 -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="90"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-muted"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="90"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 90}`}
                      strokeDashoffset={`${2 * Math.PI * 90 * (1 - getPhaseProgress() / 100)}`}
                      className="text-primary transition-all duration-300"
                    />
                  </svg>
                </div>

                {/* Progress Info */}
                <div className="text-center space-y-4 w-full max-w-md">
                  <div>
                    <div className="text-lg font-semibold">
                      Cycle {currentCycle + 1} of {selectedExercise.cycles}
                    </div>
                    <Progress value={totalProgress} className="mt-2" />
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={resetExercise}
                      disabled={!selectedExercise}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="lg"
                      onClick={() => isActive ? togglePause() : startExercise(selectedExercise)}
                      className="px-8"
                    >
                      {isActive ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          {totalProgress > 0 ? 'Resume' : 'Start'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-20">
                <Wind className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Select a Breathing Exercise</h3>
                <p className="text-muted-foreground">
                  Choose an exercise from the left to begin your breathing practice
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Benefits of Breathing Exercises
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Brain className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold mb-1">Mental Clarity</h4>
              <p className="text-sm text-muted-foreground">
                Improves focus and cognitive function through increased oxygen flow
              </p>
            </div>
            <div className="text-center">
              <Heart className="w-8 h-8 mx-auto mb-2 text-mood-calm" />
              <h4 className="font-semibold mb-1">Stress Reduction</h4>
              <p className="text-sm text-muted-foreground">
                Activates the parasympathetic nervous system for relaxation
              </p>
            </div>
            <div className="text-center">
              <Wind className="w-8 h-8 mx-auto mb-2 text-accent" />
              <h4 className="font-semibold mb-1">Better Sleep</h4>
              <p className="text-sm text-muted-foreground">
                Calms the mind and body to prepare for restful sleep
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}