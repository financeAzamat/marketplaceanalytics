
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseForm } from './finance/ExpenseForm';
import { ExpenseTable } from './finance/ExpenseTable';
import { COGSForm } from './finance/COGSForm';
import { PaymentForm } from './finance/PaymentForm';
import { PaymentTable } from './finance/PaymentTable';
import { FinancialAIChat } from './finance/FinancialAIChat';
import { FileUpload } from './FileUpload';

export const FinanceSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Финансовое управление</h2>
        <p className="text-gray-600">Ведите учет расходов, себестоимости и платежей для P&L и анализа денежных потоков</p>
      </div>

      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="expenses">Расходы</TabsTrigger>
          <TabsTrigger value="cogs">Себестоимость</TabsTrigger>
          <TabsTrigger value="payments">Платежи</TabsTrigger>
          <TabsTrigger value="file-upload">Загрузка файлов</TabsTrigger>
          <TabsTrigger value="ai-assistant">AI Аналитик</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ExpenseForm />
            </div>
            <div className="lg:col-span-2">
              <ExpenseTable />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cogs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <COGSForm />
            </div>
            <div className="lg:col-span-2">
              <div className="text-center py-8 text-gray-500">
                <p>Таблица себестоимости будет добавлена в следующем обновлении</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <PaymentForm />
            </div>
            <div className="lg:col-span-2">
              <PaymentTable />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="file-upload" className="space-y-6">
          <FileUpload />
        </TabsContent>

        <TabsContent value="ai-assistant" className="space-y-6">
          <div className="max-w-4xl mx-auto">
            <FinancialAIChat />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
