import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RefreshCw, Settings, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { useMarketplaceConnections } from '@/hooks/useMarketplaceConnections';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ApiKeyDialog } from './ApiKeyDialog';

interface MarketplaceConnectionProps {
  marketplace: 'wildberries' | 'ozon';
  name: string;
  description: string;
}

export const MarketplaceConnection = ({ marketplace, name, description }: MarketplaceConnectionProps) => {
  const { getConnectionStatus, connections } = useMarketplaceConnections();
  const { toast } = useToast();
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const isConnected = getConnectionStatus(marketplace);

  const handleDisconnect = async () => {
    const marketplaceCode = marketplace === 'wildberries' ? 'WB' : 'OZON';

    try {
      const { error } = await supabase
        .from('marketplace_connections')
        .update({ 
          is_connected: false, 
          user_api_key: null, 
          access_token: null, 
          refresh_token: null 
        })
        .eq('marketplace', marketplaceCode)
        .eq('is_connected', true);

      if (error) throw error;

      toast({
        title: "Отключено",
        description: `${name} отключен от вашего аккаунта`,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отключить маркетплейс",
        variant: "destructive",
      });
    }
  };

  const handleRefreshConnection = () => {
    // Refresh connection data
    window.location.reload();
  };

  const getMarketplaceGradient = () => {
    if (marketplace === 'wildberries') {
      return 'from-purple-500 to-pink-600';
    }
    return 'from-blue-500 to-cyan-600';
  };

  const getMarketplaceBadgeColor = () => {
    if (marketplace === 'wildberries') {
      return isConnected ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-50 text-gray-600 border-gray-200';
    }
    return isConnected ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200';
  };

  return (
    <>
      <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 group">
        <CardHeader className="relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${getMarketplaceGradient()} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-3">
              <div className={`bg-gradient-to-br ${getMarketplaceGradient()} p-2 rounded-lg shadow-lg`}>
                {isConnected ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-white" />
                )}
              </div>
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {name}
              </CardTitle>
            </div>
            <Badge className={`${getMarketplaceBadgeColor()} shadow-sm font-medium`}>
              {isConnected ? "Подключен" : "Не подключен"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
          <div className="flex flex-wrap gap-2">
            {isConnected ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleDisconnect}
                  className="bg-white/60 border-slate-200/60 hover:bg-white/80 shadow-sm backdrop-blur-sm"
                >
                  Отключить
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setApiKeyDialogOpen(true)}
                  className="bg-white/60 border-slate-200/60 hover:bg-white/80 shadow-sm backdrop-blur-sm"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Настройки
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshConnection}
                  className="bg-white/60 border-slate-200/60 hover:bg-white/80 shadow-sm backdrop-blur-sm"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Обновить
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setApiKeyDialogOpen(true)}
                className={`bg-gradient-to-r ${getMarketplaceGradient()} text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium`}
              >
                <Key className="h-4 w-4 mr-2" />
                Добавить API ключи
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ApiKeyDialog
        open={apiKeyDialogOpen}
        onOpenChange={setApiKeyDialogOpen}
        marketplace={marketplace}
        onSuccess={handleRefreshConnection}
      />
    </>
  );
};
