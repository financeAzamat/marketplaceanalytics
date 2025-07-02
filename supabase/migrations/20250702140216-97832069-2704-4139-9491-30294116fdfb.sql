-- Create table for COGS entries
CREATE TABLE public.cogs_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cogs_date DATE NOT NULL DEFAULT CURRENT_DATE,
  product_name TEXT NOT NULL,
  unit_cost NUMERIC NOT NULL,
  marketplace TEXT NOT NULL,
  brand TEXT,
  subject TEXT,
  size TEXT,
  supplier_article TEXT,
  marketplace_article TEXT,
  barcode TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cogs_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Allow all operations on cogs_entries" 
ON public.cogs_entries 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cogs_entries_updated_at
BEFORE UPDATE ON public.cogs_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();