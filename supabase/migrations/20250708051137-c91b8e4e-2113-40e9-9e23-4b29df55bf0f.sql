-- Add period columns to cogs_entries table
ALTER TABLE public.cogs_entries 
DROP COLUMN cogs_date,
ADD COLUMN date_from DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN date_to DATE NOT NULL DEFAULT CURRENT_DATE;

-- Remove unnecessary columns
ALTER TABLE public.cogs_entries 
DROP COLUMN product_name,
DROP COLUMN brand,
DROP COLUMN size,
DROP COLUMN barcode;