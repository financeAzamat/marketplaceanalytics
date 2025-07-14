-- Сначала удаляем старое ограничение
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_report_type_check;

-- Обновляем существующие записи с несовместимыми типами
UPDATE public.reports 
SET report_type = 'dds' 
WHERE report_type NOT IN ('dds', 'piu');

-- Добавляем новое ограничение
ALTER TABLE public.reports ADD CONSTRAINT reports_report_type_check 
CHECK (report_type IN ('dds', 'piu'));