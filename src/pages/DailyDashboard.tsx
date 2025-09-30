import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import Layout from '@/components/Layout';
import { format } from 'date-fns';

const DailyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getData, user, loading } = useApp();
  const [recentData, setRecentData] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      loadRecentData();
    }
  }, [user, loading]);

  const loadRecentData = async () => {
    setLoadingData(true);
    try {
      const data = await getData('daily');
      setRecentData(data.slice(0, 5)); // Show last 5 entries
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Daily Data Entry" showBottomNav>
        <div className="max-w-md mx-auto p-8 text-center">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    navigate('/login/daily');
    return null;
  }

  const options = [
    { id: 'necc-rate', label: 'NECC Rate', route: '/daily/necc-rate' },
    { id: 'digital-payments', label: 'Digital Payments', route: '/daily/digital-payments' },
    { id: 'daily-damages', label: 'Daily Damages', route: '/daily/daily-damages' },
    { id: 'daily-purchase', label: 'Daily Purchase', route: '/daily/daily-purchase' }
  ];

  return (
    <Layout title="Daily Data Entry" showBottomNav>
      <div className="max-w-md mx-auto space-y-6">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-8">
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

        {/* Recent Entries Section */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <p className="text-muted-foreground">Loading recent data...</p>
            ) : recentData.length > 0 ? (
              <div className="space-y-3">
                {recentData.map((entry, index) => (
                  <div key={entry.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">
                        {entry.data_type?.replace('-', ' ') || 'Unknown'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(entry.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {entry.data?.neccRate && (
                      <p className="text-sm text-muted-foreground">
                        Rate: ${entry.data.neccRate}
                      </p>
                    )}
                    {entry.data?.payments && (
                      <p className="text-sm text-muted-foreground">
                        Total: ${Object.values(entry.data.payments as Record<string, number>).reduce((a, b) => (a || 0) + (b || 0), 0)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No entries found. Start by adding some data!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DailyDashboard;