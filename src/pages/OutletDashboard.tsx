import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import Layout from '@/components/Layout';
import { format } from 'date-fns';

const OutletDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, getData } = useApp();
  const [recentData, setRecentData] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      loadRecentData();
    }
  }, [user, loading]);

  const loadRecentData = async () => {
    setLoadingData(true);
    try {
      const data = await getData('outlet');
      setRecentData(data.slice(0, 5));
    } catch (error) {
      console.error('Error loading recent data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Outlet Data Entry" showBack>
        <div className="flex justify-center items-center min-h-[200px]">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    navigate('/login/outlet');
    return null;
  }

  const outlets = [
    { id: 'bandepalya', label: 'Bandepalya', route: '/outlet/bandepalya' },
    { id: 'hosa-road', label: 'Hosa Road', route: '/outlet/hosa-road' }
  ];

  return (
    <Layout title="Outlet Data Entry" showBack>
      <div className="max-w-md mx-auto space-y-6">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-8">
            <div className="space-y-4">
              {outlets.map((outlet) => (
                <Button
                  key={outlet.id}
                  variant="default"
                  size="lg"
                  className="w-full h-14 text-lg font-medium"
                  onClick={() => navigate(outlet.route)}
                >
                  {outlet.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Recent Entries</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loadingData ? (
              <p className="text-muted-foreground">Loading recent entries...</p>
            ) : recentData.length > 0 ? (
              <div className="space-y-3">
                {recentData.map((entry, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">{entry.outlet_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Date: {format(new Date(entry.date), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Opening: {entry.opening_stock} | Closing: {entry.closing_stock}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Cash Payment: ₹{entry.cash_payment?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No entries found. Start by adding your first outlet data entry!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default OutletDashboard;