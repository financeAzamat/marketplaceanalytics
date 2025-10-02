import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Percent } from "lucide-react";

interface MarginWidgetProps {
  averageMargin: number;
  averageMarkup: number;
  isLoading: boolean;
}

export const MarginWidget = ({ averageMargin, averageMarkup, isLoading }: MarginWidgetProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Percent className="h-5 w-5" />
          <span>Средняя маржа и наценка</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground">Загрузка...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="text-sm text-muted-foreground mb-1">Средняя маржа</div>
              <div className="text-2xl font-bold">{averageMargin.toFixed(2)}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                (Прибыль / Выручка) × 100%
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="text-sm text-muted-foreground mb-1">Средняя наценка</div>
              <div className="text-2xl font-bold">{averageMarkup.toFixed(2)}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                (Прибыль / Себестоимость) × 100%
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};