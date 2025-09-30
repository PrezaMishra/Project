-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('daily', 'outlet', 'distribution')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(username, section)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create daily_data table
CREATE TABLE public.daily_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL CHECK (data_type IN ('necc-rate', 'digital-payments', 'daily-damages', 'daily-purchase')),
  date DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for daily_data
ALTER TABLE public.daily_data ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_data
CREATE POLICY "Users can view their own daily data" 
ON public.daily_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily data" 
ON public.daily_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily data" 
ON public.daily_data 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily data" 
ON public.daily_data 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create outlet_data table
CREATE TABLE public.outlet_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outlet_name TEXT NOT NULL,
  date DATE NOT NULL,
  opening_stock INTEGER,
  closing_stock INTEGER,
  cash_payment DECIMAL(10,2),
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for outlet_data
ALTER TABLE public.outlet_data ENABLE ROW LEVEL SECURITY;

-- Create policies for outlet_data
CREATE POLICY "Users can view their own outlet data" 
ON public.outlet_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own outlet data" 
ON public.outlet_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outlet data" 
ON public.outlet_data 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outlet data" 
ON public.outlet_data 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create distribution_data table
CREATE TABLE public.distribution_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  distribution_center TEXT NOT NULL,
  date DATE NOT NULL,
  cash_payment DECIMAL(10,2),
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for distribution_data
ALTER TABLE public.distribution_data ENABLE ROW LEVEL SECURITY;

-- Create policies for distribution_data
CREATE POLICY "Users can view their own distribution data" 
ON public.distribution_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own distribution data" 
ON public.distribution_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own distribution data" 
ON public.distribution_data 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own distribution data" 
ON public.distribution_data 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage buckets for photo uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- Create storage policies
CREATE POLICY "Users can view photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'photos');

CREATE POLICY "Users can upload their own photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_data_updated_at
BEFORE UPDATE ON public.daily_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_outlet_data_updated_at
BEFORE UPDATE ON public.outlet_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_distribution_data_updated_at
BEFORE UPDATE ON public.distribution_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, section)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'section', 'daily')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();