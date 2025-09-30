import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/DatePicker';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { DollarSign } from 'lucide-react';

const NECCRateForm: React.FC = () => {
  const navigate = useNavigate();
  const { saveData, getData } = useApp();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [neccRate, setNeccRate] = useState('');
  const [datesWithData, setDatesWithData] = useState<Date[]>([]);

  React.useEffect(() => {
    const loadDatesWithData = async () => {
      const data = await getData('daily');
      const dates = data
        .filter(item => item.data_type === 'necc-rate')
        .map(item => new Date(item.date));
      setDatesWithData(dates);
    };
    loadDatesWithData();
  }, [getData]);

  const handleSubmit = async () => {
    if (!date || !neccRate.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    const data = {
      type: 'necc-rate',
      date: date.toISOString(),
      neccRate: parseFloat(neccRate)
    };

    const result = await saveData('daily-necc-rate', data);
    if (result.success) {
      toast.success('NECC Rate data saved successfully!');
      navigate('/daily');
    } else {
      toast.error(result.error || 'Failed to save data');
    }
  };

  return (
    <Layout title="NECC Rate Entry" showBack>
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date</label>
                <DatePicker date={date} onDateChange={setDate} datesWithData={datesWithData} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Enter NECC Rate</label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter NECC Rate"
                    value={neccRate}
                    onChange={(e) => setNeccRate(e.target.value)}
                    className="h-12 pl-10 bg-input"
                  />
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
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

export default NECCRateForm;