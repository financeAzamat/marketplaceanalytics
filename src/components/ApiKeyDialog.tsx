
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marketplace: 'wildberries' | 'ozon';
  onSuccess: () => void;
}

export const ApiKeyDialog = ({ open, onOpenChange, marketplace, onSuccess }: ApiKeyDialogProps) => {
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [additionalConfig, setAdditionalConfig] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!user?.id) return;
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
      const { error } = await supabase
        .from('marketplace_connections')
        .upsert({
          user_id: user.id,
          marketplace,
          is_connected: true,
          access_token: apiKey,
          refresh_token: clientId || null,
          token_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Успешно сохранено",
        description: `API ключи для ${marketplace === 'wildberries' ? 'Wildberries' : 'Ozon'} сохранены`,
      });

      onSuccess();
      onOpenChange(false);
      setApiKey('');
      setClientId('');
      setAdditionalConfig('');
    } catch (error: any) {
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
        instructions: 'Для подключения к Wildberries вам потребуется API ключ из личного кабинета продавца.',
        apiKeyLabel: 'API ключ Wildberries',
        apiKeyPlaceholder: 'Введите ваш API ключ',
        clientIdLabel: 'Client ID (опционально)',
        clientIdPlaceholder: 'Введите Client ID если требуется',
        docsLink: 'https://openapi.wildberries.ru/',
      };
    } else {
      return {
        title: 'Подключение Ozon',
        instructions: 'Для подключения к Ozon вам потребуется API ключ и Client ID из личного кабинета продавца.',
        apiKeyLabel: 'API ключ Ozon',
        apiKeyPlaceholder: 'Введите ваш API ключ',
        clientIdLabel: 'Client ID',
        clientIdPlaceholder: 'Введите ваш Client ID',
        docsLink: 'https://docs.ozon.ru/api/seller/',
      };
    }
  };

  const config = getInstructions();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{config.instructions}</p>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">{config.apiKeyLabel}</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={config.apiKeyPlaceholder}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientId">{config.clientIdLabel}</Label>
            <Input
              id="clientId"
              placeholder={config.clientIdPlaceholder}
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="config">Дополнительные настройки (JSON)</Label>
            <Textarea
              id="config"
              placeholder='{"warehouse_id": "12345"}'
              value={additionalConfig}
              onChange={(e) => setAdditionalConfig(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-between space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            Документация API: <a href={config.docsLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{config.docsLink}</a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
