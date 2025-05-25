
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  ExternalLink, 
  Check, 
  X, 
  RefreshCw,
  Shield,
  Bell,
  User,
  Key
} from "lucide-react";

export const SettingsSection = () => {
  const [wbConnected, setWbConnected] = useState(true);
  const [ozonConnected, setOzonConnected] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Профиль</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input id="name" placeholder="Ваше имя" defaultValue="Иван Петров" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" defaultValue="ivan@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Компания</Label>
            <Input id="company" placeholder="Название компании" defaultValue="ООО Торговый Дом" />
          </div>
          <Button>Сохранить изменения</Button>
        </CardContent>
      </Card>

      {/* Marketplace Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExternalLink className="h-5 w-5" />
            <span>Подключение маркетплейсов</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Wildberries */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">WB</span>
              </div>
              <div>
                <h3 className="font-medium">Wildberries</h3>
                <p className="text-sm text-slate-600">
                  {wbConnected ? "Подключено • Последняя синхронизация: 10:30" : "Не подключено"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {wbConnected ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Check className="h-3 w-3 mr-1" />
                  Подключено
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  <X className="h-3 w-3 mr-1" />
                  Не подключено
                </Badge>
              )}
              <Button 
                variant={wbConnected ? "outline" : "default"}
                size="sm"
                onClick={() => setWbConnected(!wbConnected)}
              >
                {wbConnected ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Переподключить
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Подключить
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Ozon */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">OZ</span>
              </div>
              <div>
                <h3 className="font-medium">Ozon</h3>
                <p className="text-sm text-slate-600">
                  {ozonConnected ? "Подключено • Последняя синхронизация: 09:45" : "Не подключено"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {ozonConnected ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Check className="h-3 w-3 mr-1" />
                  Подключено
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  <X className="h-3 w-3 mr-1" />
                  Не подключено
                </Badge>
              )}
              <Button 
                variant={ozonConnected ? "outline" : "default"}
                size="sm"
                onClick={() => setOzonConnected(!ozonConnected)}
              >
                {ozonConnected ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Переподключить
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Подключить
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Уведомления</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Email уведомления</Label>
              <p className="text-sm text-slate-600">Получать отчёты и важные обновления на email</p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-sync">Автоматическая синхронизация</Label>
              <p className="text-sm text-slate-600">Автоматически обновлять данные каждые 6 часов</p>
            </div>
            <Switch
              id="auto-sync"
              checked={autoSync}
              onCheckedChange={setAutoSync}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Безопасность</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Изменить пароль</Label>
              <p className="text-sm text-slate-600">Обновите пароль для повышения безопасности</p>
            </div>
            <Button variant="outline">
              <Key className="h-4 w-4 mr-2" />
              Изменить
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>API токены</Label>
              <p className="text-sm text-slate-600">Управление токенами доступа к API</p>
            </div>
            <Button variant="outline">
              Управление
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
