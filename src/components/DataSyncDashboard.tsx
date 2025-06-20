
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Zap,
  Loader2
} from 'lucide-react';
import { useDataSync } from '@/hooks/useDataSync';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export const DataSyncDashboard = () => {
  const { 
    syncStatuses, 
    isLoading, 
    syncProgress, 
    syncMarketplace, 
    syncAllMarketplaces,
    isSyncing 
  } = useDataSync();

  const getStatusIcon = (isConnected: boolean, syncInProgress: boolean) => {
    if (syncInProgress) return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    if (isConnected) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (isConnected: boolean, syncInProgress: boolean) => {
    if (syncInProgress) return <Badge variant="secondary">Синхронизация</Badge>;
    if (isConnected) return <Badge variant="default">Подключен</Badge>;
    return <Badge variant="destructive">Не подключен</Badge>;
  };

  const handleSyncAll = () => {
    syncAllMarketplaces();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5" />
              <span>Синхронизация данных</span>
            </CardTitle>
            <Button 
              onClick={handleSyncAll}
              disabled={isSyncing}
              size="sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              Синхронизировать все
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {syncStatuses.map((status) => {
            const progressValue = syncProgress[status.marketplace] || 0;
            const isCurrentlySyncing = progressValue > 0 && progressValue < 100;
            
            return (
              <div key={status.marketplace} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(status.isConnected, isCurrentlySyncing)}
                    <div>
                      <h3 className="font-medium capitalize">{status.marketplace}</h3>
                      {status.lastSync && (
                        <p className="text-sm text-gray-500">
                          Последняя синхронизация: {formatDistanceToNow(new Date(status.lastSync), { 
                            addSuffix: true, 
                            locale: ru 
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(status.isConnected, isCurrentlySyncing)}
                    {status.isConnected && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncMarketplace(status.marketplace)}
                        disabled={isSyncing || isCurrentlySyncing}
                      >
                        {isCurrentlySyncing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                {isCurrentlySyncing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Прогресс синхронизации</span>
                      <span>{Math.round(progressValue)}%</span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                  </div>
                )}
              </div>
            );
          })}
          
          {syncStatuses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Подключите маркетплейсы для начала синхронизации</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
