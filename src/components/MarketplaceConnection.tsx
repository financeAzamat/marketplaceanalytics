
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { useMarketplaceConnections } from '@/hooks/useMarketplaceConnections';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MarketplaceConnectionProps {
  marketplace: 'wildberries' | 'ozon';
  name: string;
  description: string;
}

export const MarketplaceConnection = ({ marketplace, name, description }: MarketplaceConnectionProps) => {
  const { getConnectionStatus, connections } = useMarketplaceConnections();
  const { user } = useAuth();
  const { toast } = useToast();
  const isConnected = getConnectionStatus(marketplace);

  const handleConnect = async () => {
    if (!user?.id) return;

    try {
      // In a real app, this would redirect to OAuth flow
      // For demo purposes, we'll simulate a connection
      const { error } = await supabase
        .from('marketplace_connections')
        .upsert({
          user_id: user.id,
          marketplace,
          is_connected: true,
          access_token: 'demo_token_' + marketplace,
          token_expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        });

      if (error) throw error;

      toast({
        title: "Подключение успешно",
        description: `${name} успешно подключен к вашему аккаунту`,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка подключения",
        description: error.message || "Не удалось подключиться к маркетплейсу",
        variant: "destructive",
      });
    }
  };

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

  return (
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
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Синхронизировать
              </Button>
            </>
          ) : (
            <Button onClick={handleConnect}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Подключить
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
