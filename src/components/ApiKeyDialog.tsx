
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Key, ExternalLink, Shield } from 'lucide-react';

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marketplace: 'wildberries' | 'ozon';
  onSuccess: () => void;
}

export const ApiKeyDialog = ({ open, onOpenChange, marketplace, onSuccess }: ApiKeyDialogProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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
        
        toast({
          title: "Подключение проверено",
          description: "API ключ Wildberries работает корректно",
        });
      }

      const marketplaceCode = marketplace === 'wildberries' ? 'WB' : 'OZON';

      // Сначала ищем существующий API ключ в БД
      const { data: existingApiKey, error: searchError } = await supabase
        .from('marketplace_connections')
        .select('user_id, id')
        .eq('user_api_key', apiKey)
        .eq('marketplace', marketplaceCode)
        .maybeSingle();

      if (searchError) {
        console.error('Error searching for existing API key:', searchError);
        throw searchError;
      }

      let userIdToUse: string;

      if (existingApiKey) {
        // API ключ уже существует - используем существующий user_id
        userIdToUse = existingApiKey.user_id;
        console.log('Using existing user_id:', userIdToUse);
        
        // Обновляем существующую запись
        const { error: updateError } = await supabase
          .from('marketplace_connections')
          .update({
            is_connected: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingApiKey.id);

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
      } else {
        // Это первичная попытка - генерируем новый user_id
        userIdToUse = crypto.randomUUID();
        console.log('Generated new user_id:', userIdToUse);

        // Создаем новую запись с сгенерированным user_id
        const connectionData = {
          user_id: userIdToUse,
          marketplace: marketplaceCode,
          is_connected: true,
          user_api_key: apiKey,
          access_token: null,
          refresh_token: null,
          token_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
        title: "Успешно сохранено",
        description: `API ключи для ${marketplace === 'wildberries' ? 'Wildberries' : 'Ozon'} сохранены и подключение установлено`,
      });

      onSuccess();
      onOpenChange(false);
      setApiKey('');
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Ошибка сохранения",
        description: error.message || "Не удалось сохранить API ключи",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInstructions = () => {
    if (marketplace === 'wildberries') {
      return {
        title: 'Подключение Wildberries',
        instructions: 'Для подключения к Wildberries вам потребуется API ключ из личного кабинета продавца. При сохранении будет проверено подключение к API.',
        apiKeyLabel: 'API ключ Wildberries',
        apiKeyPlaceholder: 'Введите ваш API ключ',
        docsLink: 'https://dev.wildberries.ru/openapi/api-information',
        gradient: 'from-purple-500 to-pink-600',
      };
    } else {
      return {
        title: 'Подключение Ozon',
        instructions: 'Для подключения к Ozon вам потребуется API ключ из личного кабинета продавца.',
        apiKeyLabel: 'API ключ Ozon',
        apiKeyPlaceholder: 'Введите ваш API ключ',
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
              <Key className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {config.title}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">Безопасность данных</p>
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
              {isLoading ? 'Проверка подключения...' : 'Сохранить'}
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
