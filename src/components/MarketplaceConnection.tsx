
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RefreshCw, Settings, Key } from 'lucide-react';
import { useMarketplaceConnections } from '@/hooks/useMarketplaceConnections';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ApiKeyDialog } from './ApiKeyDialog';

interface MarketplaceConnectionProps {
  marketplace: 'wildberries' | 'ozon';
  name: string;
  description: string;
}

export const MarketplaceConnection = ({ marketplace, name, description }: MarketplaceConnectionProps) => {
  const { getConnectionStatus, connections } = useMarketplaceConnections();
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const isConnected = getConnectionStatus(marketplace);

  const handleDisconnect = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('marketplace_connections')
        .update({ is_connected: false, access_token: null, refresh_token: null })
        .eq('user_id', user.id)
        .eq('marketplace', marketplace);

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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{name}</CardTitle>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Подключен" : "Не подключен"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">{description}</p>
          <div className="flex space-x-2">
            {isConnected ? (
              <>
                <Button variant="outline" onClick={handleDisconnect}>
                  Отключить
                </Button>
                <Button variant="outline" size="sm" onClick={() => setApiKeyDialogOpen(true)}>
                  <Settings className="h-4 w-4 mr-1" />
                  Настройки
                </Button>
                <Button variant="outline" size="sm" onClick={handleRefreshConnection}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Обновить
                </Button>
              </>
            ) : (
              <Button onClick={() => setApiKeyDialogOpen(true)}>
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
