import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ROIWidgetProps {
  roi: number;
  adSpending: number;
  isLoading: boolean;
}

export const ROIWidget = ({ roi, adSpending, isLoading }: ROIWidgetProps) => {
  const isPositive = roi > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          <span>ROI рекламы</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-1 rounded-full hover:bg-muted transition-colors">
                  <Info className="h-5 w-5 cursor-help text-primary" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">((Выручка - Себестоимость - Комиссии) / Расходы на рекламу) × 100%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground">Загрузка...</div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${isPositive ? 'text-green-600' : 'text-destructive'}`}>
                {roi.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Окупаемость рекламных расходов
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};