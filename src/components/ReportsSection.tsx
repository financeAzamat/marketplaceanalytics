
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedReports } from './AdvancedReports';
import { DataSyncDashboard } from './DataSyncDashboard';
import { ABCAnalysis } from './ABCAnalysis';
import { RawDataViewer } from './RawDataViewer';

export const ReportsSection = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports">Отчеты</TabsTrigger>
          <TabsTrigger value="abc">ABC Анализ</TabsTrigger>
          <TabsTrigger value="sync">Синхронизация</TabsTrigger>
          <TabsTrigger value="raw-data">Сырые данные</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <AdvancedReports />
        </TabsContent>

        <TabsContent value="abc" className="space-y-6">
          <ABCAnalysis />
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <DataSyncDashboard />
        </TabsContent>

        <TabsContent value="raw-data" className="space-y-6">
          <RawDataViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
};
