import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  FileText, 
  Settings, 
  Upload,
  Download,
  RefreshCw,
  Shield,
  Zap,
  LogOut,
  Sparkles
} from "lucide-react";
import { AuthSection } from "@/components/AuthSection";
import { Dashboard } from "@/components/Dashboard";
import { ReportsSection } from "@/components/ReportsSection";
import { SettingsSection } from "@/components/SettingsSection";
import { PricingSection } from "@/components/PricingSection";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive",
      });
    } else {
      toast({
        title: "До свидания!",
        description: "Вы успешно вышли из системы",
      });
    }
  };

  if (!user) {
    return <AuthSection onAuth={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-200/30 to-pink-300/30 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-50 shadow-lg shadow-slate-200/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-3 rounded-xl shadow-lg shadow-blue-500/25">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  FinAz Marketplace
                </h1>
                <p className="text-sm text-slate-500 font-medium">Профессиональная аналитика для маркетплейсов</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200/60 shadow-sm">
                <Sparkles className="h-3 w-3 mr-1" />
                Pro Plan
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab("settings")}
                className="bg-white/60 border-slate-200/60 hover:bg-white/80 shadow-sm backdrop-blur-sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Настройки
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="bg-white/60 border-slate-200/60 hover:bg-white/80 shadow-sm backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl shadow-slate-200/40 rounded-2xl p-2">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Панель</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Отчеты</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Настройки</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pricing" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Тарифы</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsSection />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsSection />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <PricingSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
