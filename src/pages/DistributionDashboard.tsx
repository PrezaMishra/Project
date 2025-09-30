import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import Layout from '@/components/Layout';
import { format } from 'date-fns';

const DistributionDashboard: React.FC = () => {
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
      const data = await getData('distribution');
      setRecentData(data.slice(0, 5)); // Show last 5 entries
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Distribution Data Entry" showBack>
        <div className="max-w-md mx-auto p-8 text-center">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    navigate('/login/distribution');
    return null;
  }

  const locations = [
    { id: 'kudlu-gate', label: 'Kudlu Gate Distribution', route: '/distribution/kudlu-gate' },
    { id: 'aecs-layout', label: 'AECS Layout', route: '/distribution/aecs-layout' }
  ];

  return (
    <Layout title="Distribution Data Entry" showBack>
      <div className="max-w-md mx-auto space-y-6">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-8">
            <div className="space-y-4">
              {locations.map((location) => (
                <Button
                  key={location.id}
                  variant="default"
                  size="lg"
                  className="w-full h-14 text-lg font-medium"
                  onClick={() => navigate(location.route)}
                >
                  {location.label}
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
                {recentData.map((entry) => (
                  <div key={entry.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {entry.distribution_center}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(entry.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <p>Cash Payment: ${entry.cash_payment}</p>
                      {entry.photo_url && <p>📷 Photo attached</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No entries found. Start by adding some distribution data!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DistributionDashboard;