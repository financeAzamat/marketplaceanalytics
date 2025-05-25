
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter } from 'lucide-react';
import { MARKETPLACES } from './constants';

interface MarketplaceFilterProps {
  marketplaceFilter: string[];
  onMarketplaceToggle: (marketplace: string) => void;
}

export const MarketplaceFilter = ({ marketplaceFilter, onMarketplaceToggle }: MarketplaceFilterProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Фильтр по маркетплейсам</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4">
          {MARKETPLACES.map(marketplace => (
            <div key={marketplace} className="flex items-center space-x-2">
              <Checkbox
                id={marketplace}
                checked={marketplaceFilter.includes(marketplace)}
                onCheckedChange={() => onMarketplaceToggle(marketplace)}
              />
              <label htmlFor={marketplace} className="text-sm font-medium">
                {marketplace}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
