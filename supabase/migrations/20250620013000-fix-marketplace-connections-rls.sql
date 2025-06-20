
-- Fix RLS policies for marketplace_connections table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own marketplace connections" ON public.marketplace_connections;
DROP POLICY IF EXISTS "Users can create their own marketplace connections" ON public.marketplace_connections;
DROP POLICY IF EXISTS "Users can update their own marketplace connections" ON public.marketplace_connections;
DROP POLICY IF EXISTS "Users can delete their own marketplace connections" ON public.marketplace_connections;

-- Create more permissive policies with proper error handling
CREATE POLICY "Users can view their own marketplace connections" 
  ON public.marketplace_connections 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create their own marketplace connections" 
  ON public.marketplace_connections 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own marketplace connections" 
  ON public.marketplace_connections 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketplace connections" 
  ON public.marketplace_connections 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
