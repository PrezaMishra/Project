import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/DatePicker';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

const DailyPurchaseForm: React.FC = () => {
  const navigate = useNavigate();
  const { saveData, getData } = useApp();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [purchases, setPurchases] = useState({
    Bandepalya: '',
    'Hosa Road': '',
    'AECS Layout': '',
    Singasandra: '',
    'Kudlu Gate': ''
  });
  const [datesWithData, setDatesWithData] = useState<Date[]>([]);

  React.useEffect(() => {
    const loadDatesWithData = async () => {
      const data = await getData('daily');
      const dates = data
        .filter(item => item.data_type === 'daily-purchase')
        .map(item => new Date(item.date));
      setDatesWithData(dates);
    };
    loadDatesWithData();
  }, [getData]);

  const handlePurchaseChange = (location: string, value: string) => {
    setPurchases(prev => ({ ...prev, [location]: value }));
  };

  const handleSubmit = async () => {
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    const data = {
      type: 'daily-purchase',
      date: date.toISOString(),
      purchases: Object.fromEntries(
        Object.entries(purchases).map(([key, value]) => [key, parseFloat(value) || 0])
      )
    };

    const result = await saveData('daily-purchase', data);
    if (result.success) {
      toast.success('Daily Purchase data saved successfully!');
      navigate('/daily');
    } else {
      toast.error(result.error || 'Failed to save data');
    }
  };

  return (
    <Layout title="Daily Purchase" showBack>
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date</label>
                <DatePicker date={date} onDateChange={setDate} datesWithData={datesWithData} />
              </div>
              
              {Object.keys(purchases).map((location) => (
                <div key={location} className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{location}</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter Amount"
                    value={purchases[location as keyof typeof purchases]}
                    onChange={(e) => handlePurchaseChange(location, e.target.value)}
                    className="h-12 bg-input"
                  />
                </div>
              ))}
              
              <Button
                variant="default"
                size="lg"
                className="w-full h-12 text-lg font-medium"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DailyPurchaseForm;