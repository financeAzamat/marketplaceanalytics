
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
      // First check if connection exists
      const { data: existingConnection } = await supabase
        .from('marketplace_connections')
        .select('id')
        .eq('user_id', user.id)
        .eq('marketplace', marketplace)
        .single();

      if (existingConnection) {
        // Update existing connection
        const { error } = await supabase
          .from('marketplace_connections')
          .update({
            is_connected: true,
            access_token: apiKey,
            refresh_token: clientId || null,
            token_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('marketplace', marketplace);

        if (error) throw error;
      } else {
        // Insert new connection
        const { error } = await supabase
          .from('marketplace_connections')
          .insert({
            user_id: user.id,
            marketplace,
            is_connected: true,
            access_token: apiKey,
            refresh_token: clientId || null,
            token_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          });

        if (error) throw error;
      }

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
        gradient: 'from-purple-500 to-pink-600',
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

            <div className="space-y-2">
              <Label htmlFor="clientId" className="text-sm font-medium text-slate-700">
                {config.clientIdLabel}
              </Label>
              <Input
                id="clientId"
                placeholder={config.clientIdPlaceholder}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="bg-white/60 border-slate-200/60 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="config" className="text-sm font-medium text-slate-700">
                Дополнительные настройки (JSON)
              </Label>
              <Textarea
                id="config"
                placeholder='{"warehouse_id": "12345"}'
                value={additionalConfig}
                onChange={(e) => setAdditionalConfig(e.target.value)}
                rows={3}
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
              {isLoading ? 'Сохранение...' : 'Сохранить'}
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
