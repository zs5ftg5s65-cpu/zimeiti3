import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import WorkbenchPage from '@/pages/WorkbenchPage/WorkbenchPage';
import NotFound from '@/pages/NotFoundPage/NotFoundPage';

export default function App() {
  useEffect(() => {
    // PWA 更新提示
    (window as unknown as Record<string, unknown>).__sm3UpdatePrompt = () => {
      toast.message("发现新版本", {
        description: "点击刷新以使用最新版本",
        action: {
          label: "刷新",
          onClick: () => window.location.reload(),
        },
        duration: 15000,
      });
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<WorkbenchPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
