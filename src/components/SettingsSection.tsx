
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const SettingsSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Fetch user profile and settings
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: settings, refetch: refetchSettings } = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    companyName: profile?.company_name || '',
    emailNotifications: settings?.email_notifications ?? true,
    autoSync: settings?.auto_sync ?? true,
    syncFrequency: settings?.sync_frequency_hours || 6,
  });

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          company_name: formData.companyName,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить профиль",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          email_notifications: formData.emailNotifications,
          auto_sync: formData.autoSync,
          sync_frequency_hours: formData.syncFrequency,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refetchSettings();
      
      toast({
        title: "Настройки сохранены",
        description: "Ваши предпочтения успешно обновлены",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить настройки",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Профиль</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Полное имя</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Введите ваше полное имя"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyName">Название компании</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="Название вашей компании (необязательно)"
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-500">Email нельзя изменить</p>
          </div>
          
          <Button onClick={handleSaveProfile} disabled={loading}>
            Сохранить профиль
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Уведомления и синхронизация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Email уведомления</Label>
              <p className="text-sm text-gray-500">
                Получать уведомления о новых данных и отчетах
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={formData.emailNotifications}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, emailNotifications: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoSync">Автоматическая синхронизация</Label>
              <p className="text-sm text-gray-500">
                Автоматически синхронизировать данные с маркетплейсами
              </p>
            </div>
            <Switch
              id="autoSync"
              checked={formData.autoSync}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, autoSync: checked })
              }
            />
          </div>

          {formData.autoSync && (
            <div className="space-y-2">
              <Label htmlFor="syncFrequency">Частота синхронизации (часы)</Label>
              <Input
                id="syncFrequency"
                type="number"
                min="1"
                max="24"
                value={formData.syncFrequency}
                onChange={(e) => 
                  setFormData({ ...formData, syncFrequency: parseInt(e.target.value) || 6 })
                }
              />
              <p className="text-xs text-gray-500">
                Как часто синхронизировать данные (от 1 до 24 часов)
              </p>
            </div>
          )}
          
          <Button onClick={handleSaveSettings} disabled={loading}>
            Сохранить настройки
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
