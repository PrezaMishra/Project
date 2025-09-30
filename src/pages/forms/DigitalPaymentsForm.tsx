import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/DatePicker';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

const DigitalPaymentsForm: React.FC = () => {
  const navigate = useNavigate();
  const { saveData, getData } = useApp();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [payments, setPayments] = useState({
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
        .filter(item => item.data_type === 'digital-payments')
        .map(item => new Date(item.date));
      setDatesWithData(dates);
    };
    loadDatesWithData();
  }, [getData]);

  const handlePaymentChange = (location: string, value: string) => {
    setPayments(prev => ({ ...prev, [location]: value }));
  };

  const handleSubmit = async () => {
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    const data = {
      type: 'digital-payments',
      date: date.toISOString(),
      payments: Object.fromEntries(
        Object.entries(payments).map(([key, value]) => [key, parseFloat(value) || 0])
      )
    };

    const result = await saveData('daily-digital-payments', data);
    if (result.success) {
      toast.success('Digital Payments data saved successfully!');
      navigate('/daily');
    } else {
      toast.error(result.error || 'Failed to save data');
    }
  };

  return (
    <Layout title="Digital Payments" showBack showBottomNav>
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date</label>
                <DatePicker date={date} onDateChange={setDate} datesWithData={datesWithData} />
              </div>
              
              {Object.keys(payments).map((location) => (
                <div key={location} className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{location}</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter Amount"
                    value={payments[location as keyof typeof payments]}
                    onChange={(e) => handlePaymentChange(location, e.target.value)}
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

export default DigitalPaymentsForm;