
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseForm } from './finance/ExpenseForm';
import { ExpenseTable } from './finance/ExpenseTable';
import { PaymentForm } from './finance/PaymentForm';
import { PaymentTable } from './finance/PaymentTable';

export const FinanceSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Финансовое управление</h2>
        <p className="text-gray-600">Ведите учет расходов и платежей для P&L и анализа денежных потоков</p>
      </div>

      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses">Журнал расходов</TabsTrigger>
          <TabsTrigger value="payments">Журнал платежей</TabsTrigger>
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
      </Tabs>
    </div>
  );
};
