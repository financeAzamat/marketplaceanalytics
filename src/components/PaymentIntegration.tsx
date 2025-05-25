
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Check, 
  Star, 
  Zap,
  Shield,
  TrendingUp,
  BarChart3,
  FileText,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlanFeature {
  feature: string;
  included: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  features: PlanFeature[];
  popular?: boolean;
  current?: boolean;
}

export const PaymentIntegration = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const plans: SubscriptionPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 990,
      period: 'month',
      features: [
        { feature: 'До 2 маркетплейсов', included: true },
        { feature: 'Базовая аналитика', included: true },
        { feature: 'Экспорт отчетов', included: true },
        { feature: 'Email поддержка', included: true },
        { feature: 'Автосинхронизация', included: false },
        { feature: 'API доступ', included: false },
        { feature: 'Приоритетная поддержка', included: false },
      ],
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 2990,
      period: 'month',
      popular: true,
      current: true,
      features: [
        { feature: 'Неограниченное количество маркетплейсов', included: true },
        { feature: 'Расширенная аналитика', included: true },
        { feature: 'Все типы отчетов', included: true },
        { feature: 'Автосинхронизация каждый час', included: true },
        { feature: 'API доступ', included: true },
        { feature: 'Telegram уведомления', included: true },
        { feature: 'Приоритетная поддержка', included: true },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 9990,
      period: 'month',
      features: [
        { feature: 'Все возможности Pro', included: true },
        { feature: 'Персональный менеджер', included: true },
        { feature: 'Кастомные интеграции', included: true },
        { feature: 'SLA 99.9%', included: true },
        { feature: 'Белый лейбл', included: true },
        { feature: 'Обучение команды', included: true },
        { feature: 'Телефонная поддержка 24/7', included: true },
      ],
    },
  ];

  const handleSubscribe = async (planId: string) => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Подписка активирована",
        description: "Спасибо за покупку! Ваша подписка активна.",
      });
    } catch (error) {
      toast({
        title: "Ошибка оплаты",
        description: "Не удалось обработать платеж. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Управление подпиской</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border rounded-lg p-6 ${
                  plan.popular 
                    ? 'border-blue-500 shadow-lg scale-105' 
                    : plan.current
                    ? 'border-green-500'
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Популярный
                    </Badge>
                  </div>
                )}
                
                {plan.current && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Текущий план
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {formatPrice(plan.price)}
                  </div>
                  <p className="text-gray-500">в месяц</p>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check 
                        className={`h-4 w-4 ${
                          feature.included ? 'text-green-500' : 'text-gray-300'
                        }`} 
                      />
                      <span 
                        className={`text-sm ${
                          feature.included ? 'text-gray-700' : 'text-gray-400'
                        }`}
                      >
                        {feature.feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isProcessing || plan.current}
                  className="w-full"
                  variant={plan.popular ? 'default' : plan.current ? 'outline' : 'outline'}
                >
                  {plan.current ? 'Активный план' : `Выбрать ${plan.name}`}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Преимущества платной подписки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Автосинхронизация</h3>
              <p className="text-sm text-gray-600">
                Данные обновляются автоматически каждый час
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Расширенная аналитика</h3>
              <p className="text-sm text-gray-600">
                Детальные отчеты и прогнозирование
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">API доступ</h3>
              <p className="text-sm text-gray-600">
                Интеграция с внешними системами
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Приоритетная поддержка</h3>
              <p className="text-sm text-gray-600">
                Быстрые ответы и персональная помощь
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
