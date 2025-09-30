import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/DatePicker';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Upload } from 'lucide-react';

const DistributionDataForm: React.FC = () => {
  const { location } = useParams<{ location: string }>();
  const navigate = useNavigate();
  const { saveData, getData } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [cashPayment, setCashPayment] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [datesWithData, setDatesWithData] = useState<Date[]>([]);

  const locationName = location === 'kudlu-gate' ? 'Kudlu Gate Distribution' : 'AECS Layout';

  React.useEffect(() => {
    const loadDatesWithData = async () => {
      const data = await getData('distribution');
      const dates = data
        .filter(item => item.distribution_center === locationName)
        .map(item => new Date(item.date));
      setDatesWithData(dates);
    };
    loadDatesWithData();
  }, [getData, locationName]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success('Photo selected successfully!');
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `distribution-photos/${fileName}`;

      const { error } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!date || !cashPayment.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    setUploading(true);

    try {
      let photoUrl = '';
      if (uploadedFile) {
        const uploadedUrl = await uploadPhoto(uploadedFile);
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }

      const data = {
        type: 'distribution-data',
        distributionCenter: locationName,
        date: date.toISOString(),
        cashPayment: parseFloat(cashPayment),
        photoUrl
      };

      const result = await saveData(`distribution-${location}`, data);
      if (result.success) {
        toast.success(`${locationName} data saved successfully!`);
        navigate('/distribution');
      } else {
        toast.error(result.error || 'Failed to save data');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout title={locationName} showBack>
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date</label>
                <DatePicker date={date} onDateChange={setDate} datesWithData={datesWithData} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Cash Payment</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter Amount"
                  value={cashPayment}
                  onChange={(e) => setCashPayment(e.target.value)}
                  className="h-12 bg-input"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Upload Photo</label>
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors bg-input"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {uploadedFile ? uploadedFile.name : 'Click to upload photo from storage'}
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              
              <Button
                variant="default"
                size="lg"
                className="w-full h-12 text-lg font-medium"
                onClick={handleSubmit}
                disabled={uploading}
              >
                {uploading ? 'Saving...' : 'Submit'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DistributionDataForm;