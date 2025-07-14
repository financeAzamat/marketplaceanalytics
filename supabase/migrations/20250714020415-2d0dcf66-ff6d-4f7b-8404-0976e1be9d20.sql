-- Удаляем старое ограничение на тип отчета
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_report_type_check;

-- Добавляем новое ограничение с новыми типами отчетов
ALTER TABLE public.reports ADD CONSTRAINT reports_report_type_check 
CHECK (report_type IN ('dds', 'piu'));