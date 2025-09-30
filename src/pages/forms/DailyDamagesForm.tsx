import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/DatePicker';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

const DailyDamagesForm: React.FC = () => {
  const navigate = useNavigate();
  const { saveData, getData } = useApp();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [damages, setDamages] = useState({
    Godown: '',
    Supercarry: '',
    'Tata Ace': '',
    'Ashok Leyland': '',
    Mahindra: ''
  });
  const [datesWithData, setDatesWithData] = useState<Date[]>([]);

  React.useEffect(() => {
    const loadDatesWithData = async () => {
      const data = await getData('daily');
      const dates = data
        .filter(item => item.data_type === 'daily-damages')
        .map(item => new Date(item.date));
      setDatesWithData(dates);
    };
    loadDatesWithData();
  }, [getData]);

  const handleDamageChange = (category: string, value: string) => {
    setDamages(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    const data = {
      type: 'daily-damages',
      date: date.toISOString(),
      damages: Object.fromEntries(
        Object.entries(damages).map(([key, value]) => [key, parseFloat(value) || 0])
      )
    };

    const result = await saveData('daily-damages', data);
    if (result.success) {
      toast.success('Daily Damages data saved successfully!');
      navigate('/daily');
    } else {
      toast.error(result.error || 'Failed to save data');
    }
  };

  return (
    <Layout title="Daily Damages" showBack showBottomNav>
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date</label>
                <DatePicker date={date} onDateChange={setDate} datesWithData={datesWithData} />
              </div>
              
              {Object.keys(damages).map((category) => (
                <div key={category} className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{category}</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={`Enter ${category} Damage`}
                    value={damages[category as keyof typeof damages]}
                    onChange={(e) => handleDamageChange(category, e.target.value)}
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

export default DailyDamagesForm;