import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const options = [
    { id: 'daily', label: 'Daily Data Entry', route: '/login/daily' },
    { id: 'outlet', label: 'Outlet Data Entry', route: '/login/outlet' },
    { id: 'distribution', label: 'Distribution Data Entry', route: '/login/distribution' }
  ];

  return (
    <Layout title="Welcome">
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Welcome</h1>
            </div>
            
            <div className="space-y-4">
              {options.map((option) => (
                <Button
                  key={option.id}
                  variant="default"
                  size="lg"
                  className="w-full h-14 text-lg font-medium"
                  onClick={() => navigate(option.route)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Welcome;