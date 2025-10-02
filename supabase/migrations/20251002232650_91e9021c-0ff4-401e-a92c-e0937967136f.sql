-- Create product_sales table for detailed product data
CREATE TABLE IF NOT EXISTS public.product_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_date DATE NOT NULL,
  marketplace TEXT NOT NULL,
  product_name TEXT NOT NULL,
  supplier_article TEXT,
  marketplace_article TEXT,
  subject TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  revenue NUMERIC NOT NULL DEFAULT 0,
  profit NUMERIC NOT NULL DEFAULT 0,
  cogs NUMERIC NOT NULL DEFAULT 0,
  commission NUMERIC NOT NULL DEFAULT 0,
  last_sale_date DATE,
  days_since_last_sale INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_sales ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Allow all operations on product_sales"
ON public.product_sales
FOR ALL
USING (true)
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_product_sales_date ON public.product_sales(sale_date);
CREATE INDEX idx_product_sales_marketplace ON public.product_sales(marketplace);
CREATE INDEX idx_product_sales_product_name ON public.product_sales(product_name);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_product_sales_updated_at
BEFORE UPDATE ON public.product_sales
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();