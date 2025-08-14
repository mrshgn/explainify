-- Fix search path security warning
CREATE OR REPLACE FUNCTION public.cleanup_expired_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete expired explanations and their associated files
  DELETE FROM public.explanations 
  WHERE expires_at < now();
END;
$$;