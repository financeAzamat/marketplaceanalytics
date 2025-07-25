
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

export const EmptyStateCard = () => {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-8">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет данных для анализа</h3>
          <p className="text-gray-500">Синхронизируйте данные с маркетплейсами для проведения ABC анализа</p>
        </div>
      </CardContent>
    </Card>
  );
};
