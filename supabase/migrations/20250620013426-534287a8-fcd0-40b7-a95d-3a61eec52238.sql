
-- Удаляем существующие политики RLS
DROP POLICY IF EXISTS "Users can view their own marketplace connections" ON public.marketplace_connections;
DROP POLICY IF EXISTS "Users can create their own marketplace connections" ON public.marketplace_connections;
DROP POLICY IF EXISTS "Users can update their own marketplace connections" ON public.marketplace_connections;
DROP POLICY IF EXISTS "Users can delete their own marketplace connections" ON public.marketplace_connections;

-- Создаем более простые политики без проверки auth.uid()
CREATE POLICY "Allow all operations on marketplace connections" 
  ON public.marketplace_connections 
  FOR ALL
  USING (true)
  WITH CHECK (true);
