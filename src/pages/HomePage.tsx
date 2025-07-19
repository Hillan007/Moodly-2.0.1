import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Heart, Shield, TrendingUp, Users, Wind } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

const features = [
  {
    icon: Heart,
    title: 'Mood Tracking',
    description: 'Monitor your emotional well-being with intelligent mood tracking and insights.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Get personalized recommendations based on your mental health patterns.',
  },
  {
    icon: Wind,
    title: 'Breathing Exercises',
    description: 'Guided breathing techniques to reduce stress and improve mindfulness.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Analytics',
    description: 'Visualize your mental health journey with detailed analytics and trends.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your mental health data is encrypted and completely private.',
  },
  {
    icon: Users,
    title: 'Professional Support',
    description: 'Connect with mental health professionals when you need extra support.',
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-3xl"></div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-primary/10 rounded-full text-primary">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Your Mental Wellness Journey Starts Here</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Take Control of Your
              <br />
              Mental Health
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Moodly is your personal mental wellness companion. Track your moods, build healthy habits, 
              and get AI-powered insights to improve your emotional well-being.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild 
                size="lg" 
                className="px-8 py-3 bg-gradient-primary text-white shadow-glow hover:shadow-xl transition-all"
              >
                <Link to="/signup">Start Your Journey</Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="px-8 py-3 border-2 hover:bg-accent"
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need for Mental Wellness
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and insights to help you understand and improve your mental health.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-medium transition-all duration-300 border-0 bg-card/50 backdrop-blur"
              >
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center bg-gradient-wellness border-0 shadow-glow">
            <CardContent className="p-0">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Ready to Transform Your Mental Health?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of users who have improved their mental wellness with Moodly's 
                evidence-based tools and personalized insights.
              </p>
              <Button 
                asChild 
                size="lg"
                className="px-8 py-3 bg-gradient-primary text-white shadow-medium hover:shadow-glow transition-all"
              >
                <Link to="/signup">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Moodly</span>
          </div>
          <p className="text-muted-foreground">
            Your privacy and mental health are our priorities. 
            <br />
            All data is encrypted and securely stored.
          </p>
        </div>
      </footer>
    </div>
  );
}