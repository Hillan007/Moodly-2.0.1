import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuthStore();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRateLimitError(false);

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      // Use Supabase authentication
      await signUp(email, password, name);
      toast.success('Account created successfully! Welcome to Moodly 🎉');
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Signup failed. Please try again.';

      // Check for rate limit error
      if (errorMessage.includes('rate limit') || errorMessage.includes('email rate')) {
        setRateLimitError(true);
        toast.error('Too many signup attempts. Please wait 1-2 hours before trying again with this email.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white/95 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl">🧠</span>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Join Moodly</CardTitle>
          <CardDescription className="text-gray-600">
            Create your account to start your mental wellness journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-6">
            {rateLimitError && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-800 font-medium">Rate Limit Exceeded</p>
                <p className="text-sm text-red-700 mt-1">
                  Too many signup attempts with this email. Please wait 1-2 hours before trying again, then reload this page.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading || rateLimitError}
                className="w-full bg-white text-gray-900 placeholder:text-gray-400 border-gray-200 focus-visible:ring-blue-500/40 focus-visible:ring-offset-0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || rateLimitError}
                className="w-full bg-white text-gray-900 placeholder:text-gray-400 border-gray-200 focus-visible:ring-blue-500/40 focus-visible:ring-offset-0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || rateLimitError}
                className="w-full bg-white text-gray-900 placeholder:text-gray-400 border-gray-200 focus-visible:ring-blue-500/40 focus-visible:ring-offset-0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading || rateLimitError}
                className="w-full bg-white text-gray-900 placeholder:text-gray-400 border-gray-200 focus-visible:ring-blue-500/40 focus-visible:ring-offset-0"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading || rateLimitError}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </>
              ) : rateLimitError ? (
                'Rate Limited - Try Again Later'
              ) : (
                'Create Account'
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-white/80">Already have an account? </span>
              <Link to="/login" className="text-white hover:text-white/90 font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;