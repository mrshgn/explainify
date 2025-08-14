-- Create storage bucket for temporary file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('temp-uploads', 'temp-uploads', false);

-- Create policies for temporary file storage
CREATE POLICY "Users can upload their own temporary files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'temp-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own temporary files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'temp-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own temporary files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'temp-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create table to track explanations and file cleanup
CREATE TABLE public.explanations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  topic TEXT,
  level TEXT NOT NULL,
  explanation TEXT NOT NULL,
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour')
);

-- Enable RLS
ALTER TABLE public.explanations ENABLE ROW LEVEL SECURITY;

-- Create policies for explanations
CREATE POLICY "Users can view their own explanations" 
ON public.explanations 
FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create explanations" 
ON public.explanations 
FOR INSERT 
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Create function to cleanup expired files and explanations
CREATE OR REPLACE FUNCTION public.cleanup_expired_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete expired explanations and their associated files
  DELETE FROM public.explanations 
  WHERE expires_at < now();
END;
$$;