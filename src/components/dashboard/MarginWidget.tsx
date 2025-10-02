import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Percent, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
          <TooltipProvider>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <span>Средняя маржа</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">(Прибыль / Выручка) × 100%</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-2xl font-bold">{averageMargin.toFixed(2)}%</div>
              </div>
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <span>Средняя наценка</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">(Прибыль / Себестоимость) × 100%</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-2xl font-bold">{averageMarkup.toFixed(2)}%</div>
              </div>
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
};