
-- Drop the table completely and recreate it with proper structure
DROP TABLE IF EXISTS public.marketplace_connections CASCADE;

-- Recreate the table with correct structure
CREATE TABLE public.marketplace_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  marketplace text NOT NULL,
  user_api_key text,
  is_connected boolean NOT NULL DEFAULT false,
  access_token text,
  refresh_token text,
  token_expires_at timestamp with time zone,
  last_sync_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own marketplace connections" 
  ON public.marketplace_connections 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own marketplace connections" 
  ON public.marketplace_connections 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketplace connections" 
  ON public.marketplace_connections 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketplace connections" 
  ON public.marketplace_connections 
  FOR DELETE 
  USING (auth.uid() = user_id);
