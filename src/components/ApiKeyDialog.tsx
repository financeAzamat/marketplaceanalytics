
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key, ExternalLink, Shield, Edit, RefreshCw } from 'lucide-react';

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marketplace: 'wildberries' | 'ozon';
  onSuccess: () => void;
}

export const ApiKeyDialog = ({ open, onOpenChange, marketplace, onSuccess }: ApiKeyDialogProps) => {
  const [apiKey, setApiKey] = useState('');
  const [currentApiKey, setCurrentApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(false);
  const { toast } = useToast();

  // Загружаем текущий API ключ при открытии диалога
  useEffect(() => {
    if (open) {
      loadCurrentApiKey();
    }
  }, [open, marketplace]);

  const loadCurrentApiKey = async () => {
    setIsLoadingCurrent(true);
    const marketplaceCode = marketplace === 'wildberries' ? 'WB' : 'OZON';
    
    try {
      const { data: connection } = await supabase
        .from('marketplace_connections')
        .select('user_api_key')
        .eq('marketplace', marketplaceCode)
        .maybeSingle();

      if (connection?.user_api_key) {
        // Показываем замаскированный ключ
        const maskedKey = connection.user_api_key.substring(0, 8) + '...' + connection.user_api_key.slice(-4);
        setCurrentApiKey(maskedKey);
      } else {
        setCurrentApiKey('');
      }
    } catch (error) {
      console.error('Error loading current API key:', error);
    } finally {
      setIsLoadingCurrent(false);
    }
  };

  const checkWildberriesConnection = async (apiKeyToCheck: string) => {
    try {
      console.log('Checking Wildberries API connection...');
      
      const response = await fetch('https://common-api.wildberries.ru/ping', {
        method: 'GET',
        headers: {
          'Authorization': apiKeyToCheck,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Wildberries API response:', data);
      
      if (data.Status === 'OK') {
        return { success: true, message: 'Подключение успешно' };
      } else {
        return { success: false, message: 'Получен неожиданный ответ от API' };
      }
    } catch (error: any) {
      console.error('Wildberries API connection error:', error);
      return { 
        success: false, 
        message: `Ошибка подключения: ${error.message || 'Неизвестная ошибка'}` 
      };
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Ошибка",
        description: "API ключ обязателен для заполнения",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    let connectionIsValid = false;
    
    try {
      // Проверяем подключение для Wildberries
      if (marketplace === 'wildberries') {
        const connectionResult = await checkWildberriesConnection(apiKey);
        
        if (!connectionResult.success) {
          toast({
            title: "Ошибка подключения",
            description: `${connectionResult.message}. Проверьте правильность API ключа и повторите попытку.`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        connectionIsValid = true;
        toast({
          title: "Подключение проверено",
          description: "API ключ Wildberries работает корректно",
        });
      } else {
        // Для Ozon пока просто проверяем что ключ не пустой
        connectionIsValid = apiKey.trim().length > 0;
      }

      const marketplaceCode = marketplace === 'wildberries' ? 'WB' : 'OZON';

      // Сначала ищем существующую запись для этого маркетплейса
      const { data: existingConnection, error: searchError } = await supabase
        .from('marketplace_connections')
        .select('id')
        .eq('marketplace', marketplaceCode)
        .maybeSingle();

      if (searchError) {
        console.error('Error searching for existing connection:', searchError);
        throw searchError;
      }

      if (existingConnection) {
        // Обновляем существующую запись
        console.log('Updating existing connection:', existingConnection.id);
        
        const { error: updateError } = await supabase
          .from('marketplace_connections')
          .update({
            user_api_key: apiKey,
            is_connected: connectionIsValid,
          })
          .eq('id', existingConnection.id);

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
      } else {
        // Создаем новую запись
        console.log('Creating new connection');

        const connectionData = {
          marketplace: marketplaceCode,
          is_connected: connectionIsValid,
          user_api_key: apiKey,
        };

        const { error: insertError } = await supabase
          .from('marketplace_connections')
          .insert(connectionData);

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
      }

      toast({
        title: "Успешно обновлено",
        description: `API ключ для ${marketplace === 'wildberries' ? 'Wildberries' : 'Ozon'} обновлен и подключение ${connectionIsValid ? 'установлено' : 'не удалось установить'}`,
      });

      onSuccess();
      onOpenChange(false);
      setApiKey('');
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Ошибка сохранения",
        description: error.message || "Не удалось обновить API ключ",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInstructions = () => {
    if (marketplace === 'wildberries') {
      return {
        title: currentApiKey ? 'Обновить API ключ Wildberries' : 'Подключение Wildberries',
        instructions: currentApiKey 
          ? 'Введите новый API ключ для замены текущего. При сохранении будет проверено подключение к API.'
          : 'Для подключения к Wildberries вам потребуется API ключ из личного кабинета продавца. При сохранении будет проверено подключение к API.',
        apiKeyLabel: 'Новый API ключ Wildberries',
        apiKeyPlaceholder: 'Введите новый API ключ',
        docsLink: 'https://dev.wildberries.ru/openapi/api-information',
        gradient: 'from-purple-500 to-pink-600',
      };
    } else {
      return {
        title: currentApiKey ? 'Обновить API ключ Ozon' : 'Подключение Ozon',
        instructions: currentApiKey
          ? 'Введите новый API ключ для замены текущего.'
          : 'Для подключения к Ozon вам потребуется API ключ из личного кабинета продавца.',
        apiKeyLabel: 'Новый API ключ Ozon',
        apiKeyPlaceholder: 'Введите новый API ключ',
        docsLink: 'https://docs.ozon.ru/api/seller/',
        gradient: 'from-blue-500 to-cyan-600',
      };
    }
  };

  const config = getInstructions();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-lg border-white/20 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className={`bg-gradient-to-br ${config.gradient} p-2 rounded-lg shadow-lg`}>
              {currentApiKey ? <Edit className="h-5 w-5 text-white" /> : <Key className="h-5 w-5 text-white" />}
            </div>
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {config.title}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Текущий API ключ */}
          {currentApiKey && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
              <div className="flex items-start space-x-3">
                <Key className="h-5 w-5 text-slate-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 mb-1">Текущий API ключ</p>
                  <div className="flex items-center space-x-2">
                    {isLoadingCurrent ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-3 w-3 animate-spin text-slate-500" />
                        <span className="text-xs text-slate-500">Загрузка...</span>
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-slate-600 bg-white px-2 py-1 rounded border">
                        {currentApiKey}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">
                  {currentApiKey ? 'Обновление API ключа' : 'Безопасность данных'}
                </p>
                <p className="text-xs text-blue-600">{config.instructions}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm font-medium text-slate-700">
                {config.apiKeyLabel}
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder={config.apiKeyPlaceholder}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-white/60 border-slate-200/60 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-between space-x-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="bg-white/60 border-slate-200/60 hover:bg-white/80"
            >
              Отмена
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className={`bg-gradient-to-r ${config.gradient} text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50`}
            >
              {isLoading ? 'Проверка подключения...' : (currentApiKey ? 'Обновить ключ' : 'Сохранить')}
            </Button>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center space-x-2 text-xs text-slate-600">
              <ExternalLink className="h-3 w-3" />
              <span>Документация API:</span>
              <a 
                href={config.docsLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                {config.docsLink}
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
