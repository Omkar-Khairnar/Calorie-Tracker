import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthGuard } from './components/AuthGuard';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { MealsView } from './views/MealsView';
import { AnalyticsView } from './views/AnalyticsView';
import { AIChatView } from './views/AIChatView';
import { useThemeStore } from './store/theme.store';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,   // data stays fresh for 30s — no refetch / no skeleton flash when navigating back
    },
  },
});

function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginView />} />

          <Route
            path="/*"
            element={
              <AuthGuard>
                <Layout>
                  <Routes>
                    <Route path="/" element={<DashboardView />} />
                    <Route path="/meals" element={<MealsView />} />
                    <Route path="/analytics" element={<AnalyticsView />} />
                    <Route path="/ai" element={<AIChatView />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </AuthGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
