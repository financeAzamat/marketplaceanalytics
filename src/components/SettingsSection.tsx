
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export const SettingsSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Для MVP используем локальное состояние
  const [formData, setFormData] = useState({
    fullName: localStorage.getItem('fullName') || '',
    companyName: localStorage.getItem('companyName') || '',
    email: localStorage.getItem('email') || 'demo@example.com',
    emailNotifications: localStorage.getItem('emailNotifications') !== 'false',
    autoSync: localStorage.getItem('autoSync') !== 'false',
    syncFrequency: parseInt(localStorage.getItem('syncFrequency') || '6'),
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Сохраняем в localStorage для MVP
      localStorage.setItem('fullName', formData.fullName);
      localStorage.setItem('companyName', formData.companyName);
      localStorage.setItem('email', formData.email);

      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить профиль",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Сохраняем в localStorage для MVP
      localStorage.setItem('emailNotifications', formData.emailNotifications.toString());
      localStorage.setItem('autoSync', formData.autoSync.toString());
      localStorage.setItem('syncFrequency', formData.syncFrequency.toString());
      
      toast({
        title: "Настройки сохранены",
        description: "Ваши предпочтения успешно обновлены",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Ваш email"
            />
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
