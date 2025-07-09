-- Remove payment_type and payment_method from payment_journal since it will only handle income
ALTER TABLE public.payment_journal 
DROP COLUMN payment_type,
DROP COLUMN payment_method;

-- Add expense_type to expense_journal for Variable/Fixed classification
ALTER TABLE public.expense_journal 
ADD COLUMN expense_type text;