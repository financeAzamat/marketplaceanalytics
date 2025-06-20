
-- Enable RLS on marketplace_connections table
ALTER TABLE public.marketplace_connections ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own marketplace connections
CREATE POLICY "Users can view their own marketplace connections" 
  ON public.marketplace_connections 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own marketplace connections
CREATE POLICY "Users can create their own marketplace connections" 
  ON public.marketplace_connections 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to update their own marketplace connections
CREATE POLICY "Users can update their own marketplace connections" 
  ON public.marketplace_connections 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to delete their own marketplace connections
CREATE POLICY "Users can delete their own marketplace connections" 
  ON public.marketplace_connections 
  FOR DELETE 
  USING (auth.uid() = user_id);
