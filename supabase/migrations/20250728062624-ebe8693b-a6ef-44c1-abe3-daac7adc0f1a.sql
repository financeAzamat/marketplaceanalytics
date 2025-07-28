-- Add period_type column to reports table
ALTER TABLE public.reports 
ADD COLUMN period_type TEXT DEFAULT 'month';