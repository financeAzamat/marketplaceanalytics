import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingDown } from "lucide-react";

interface UnprofitableAlertProps {
  unprofitablePercentage: number;
  unprofitableCount: number;
  totalCount: number;
  isLoading: boolean;
}

export const UnprofitableAlert = ({ 
  unprofitablePercentage, 
  unprofitableCount, 
  totalCount,
  isLoading 
}: UnprofitableAlertProps) => {
  const isWarning = unprofitablePercentage > 30;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingDown className="h-5 w-5" />
          <span>Убыточные товары</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground">Загрузка...</div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${isWarning ? 'text-destructive' : 'text-green-600'}`}>
                {unprofitablePercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {unprofitableCount} из {totalCount} товаров убыточны
              </div>
            </div>
            
            {isWarning && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Внимание!</AlertTitle>
                <AlertDescription>
                  Доля убыточных товаров превышает 30%. Рекомендуется провести анализ и оптимизацию ассортимента.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};