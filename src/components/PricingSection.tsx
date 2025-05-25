
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Zap, 
  Crown, 
  Star,
  CreditCard,
  Smartphone
} from "lucide-react";

const plans = [
  {
    name: "Базовый",
    price: "₽990",
    period: "/месяц",
    description: "Для небольших селлеров",
    features: [
      "До 100 товаров",
      "2 маркетплейса",
      "Базовые отчёты",
      "Email поддержка",
      "Автообновление 1 раз в день"
    ],
    icon: Zap,
    color: "from-blue-500 to-blue-600",
    popular: false
  },
  {
    name: "Профи",
    price: "₽1,990",
    period: "/месяц",
    description: "Для активных селлеров",
    features: [
      "До 1000 товаров",
      "Все маркетплейсы",
      "Расширенные отчёты",
      "Приоритетная поддержка",
      "Автообновление каждые 6 часов",
      "API доступ",
      "Экспорт в Excel"
    ],
    icon: Crown,
    color: "from-purple-500 to-purple-600",
    popular: true
  },
  {
    name: "Бизнес",
    price: "₽4,990",
    period: "/месяц",
    description: "Для крупного бизнеса",
    features: [
      "Неограниченно товаров",
      "Все маркетплейсы",
      "Все возможности",
      "Персональный менеджер",
      "Автообновление в реальном времени",
      "API доступ",
      "Интеграция с 1C",
      "Белый лейбл"
    ],
    icon: Star,
    color: "from-gold-500 to-yellow-500",
    popular: false
  }
];

export const PricingSection = () => {
  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Crown className="h-5 w-5" />
            <span>Ваш текущий план</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-green-800">Профи</h3>
              <p className="text-green-600">Активен до 15 декабря 2024</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-800">₽1,990</div>
              <div className="text-sm text-green-600">в месяц</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const IconComponent = plan.icon;
          return (
            <Card 
              key={index} 
              className={`relative transition-all hover:shadow-lg ${
                plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white px-4 py-1">
                    Популярный
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto w-12 h-12 rounded-lg bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-slate-600">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{plan.price}</div>
                  <div className="text-sm text-slate-600">{plan.period}</div>
                </div>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800' 
                      : ''
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.popular ? "Текущий план" : "Выбрать план"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Способы оплаты</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-medium">Банковские карты</h3>
                <p className="text-sm text-slate-600">Visa, MasterCard, МИР</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Smartphone className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-medium">Мобильные платежи</h3>
                <p className="text-sm text-slate-600">СБП, Apple Pay, Google Pay</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium mb-2">Гарантии</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Безопасные платежи через защищённые каналы</li>
              <li>• Возврат средств в течение 14 дней</li>
              <li>• Автоматическое продление подписки</li>
              <li>• Уведомления о предстоящих списаниях</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
