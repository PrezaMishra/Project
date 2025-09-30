import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

const Login: React.FC = () => {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const { login, signup } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password');
      return;
    }

    if (isSignup && !username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        const result = await signup(email, password, username, section as 'daily' | 'outlet' | 'distribution');
        
        if (result.success) {
          toast.success('Account created successfully! Please check your email to verify your account.');
          navigate(`/${section}`);
        } else {
          toast.error(result.error || 'Signup failed');
        }
      } else {
        const result = await login(email, password, rememberMe);
        
        if (result.success) {
          toast.success('Login successful!');
          navigate(`/${section}`);
        } else {
          toast.error(result.error || 'Login failed');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getSectionTitle = () => {
    switch (section) {
      case 'daily': return 'Daily Data Entry';
      case 'outlet': return 'Outlet Data Entry';
      case 'distribution': return 'Distribution Data Entry';
      default: return 'Login';
    }
  };

  return (
    <Layout title={getSectionTitle()} showBack>
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-xl font-semibold text-foreground">{getSectionTitle()}</h1>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
              </div>

              {isSignup && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Username</label>
                  <Input
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label htmlFor="remember" className="text-sm text-muted-foreground">
                    Remember Me
                  </label>
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-sm text-primary hover:underline"
                >
                  {isSignup ? 'Already have an account?' : 'Need an account?'}
                </button>
              </div>
              
              <Button
                variant="default"
                size="lg"
                className="w-full h-12 text-lg font-medium"
                onClick={handleAuth}
                disabled={loading}
              >
                {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Log In')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;