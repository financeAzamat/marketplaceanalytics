import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProblematicProduct {
  product_name: string;
  marketplace: string;
  days_since_last_sale: number;
  last_sale_date: string;
}

interface ProblematicProductsWidgetProps {
  problematicProducts: ProblematicProduct[];
  isLoading: boolean;
}

export const ProblematicProductsWidget = ({ 
  problematicProducts, 
  isLoading 
}: ProblematicProductsWidgetProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Проблемные товары</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-1 rounded-full hover:bg-muted transition-colors">
                  <Info className="h-5 w-5 cursor-help text-primary" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Товары с оборотом более 120 дней</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground">Загрузка...</div>
        ) : problematicProducts.length === 0 ? (
          <div className="text-center text-muted-foreground">
            Нет товаров с оборотом &gt; 120 дней
          </div>
        ) : (
          <div className="space-y-4">
            {problematicProducts.map((product, index) => (
              <div key={index} className="flex items-start justify-between p-3 border rounded-lg border-destructive/30">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="destructive" className="text-xs">
                      {product.days_since_last_sale} дней
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {product.marketplace}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm">{product.product_name}</p>
                  <div className="flex items-center space-x-1 mt-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Последняя продажа: {new Date(product.last_sale_date).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};