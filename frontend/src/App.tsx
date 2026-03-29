// ============================================
// App Component — Router + Providers
// ============================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './lib/auth-context';
import { queryClient } from './lib/api';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { MembersPage } from './pages/MembersPage';
import { MemberDetailPage } from './pages/MemberDetailPage';
import { HouseholdsPage } from './pages/HouseholdsPage';
import { HouseholdDetailPage } from './pages/HouseholdDetailPage';
import { ProtectedRoute } from './components/ProtectedRoute';

const theme = createTheme({
  primaryColor: 'green',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  defaultRadius: 'md',
  colors: {
    green: [
      '#e6f9ef',
      '#ccf2de',
      '#99e5be',
      '#66d89d',
      '#33cb7d',
      '#1b7a4e',
      '#166a42',
      '#115a36',
      '#0c4a2b',
      '#073a1f',
    ],
  },
});

export function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* CRM Routes - Accessible by all logged in users */}
                <Route
                  path="/members"
                  element={
                    <ProtectedRoute>
                      <MembersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/members/:id"
                  element={
                    <ProtectedRoute>
                      <MemberDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/households"
                  element={
                    <ProtectedRoute>
                      <HouseholdsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/households/:id"
                  element={
                    <ProtectedRoute>
                      <HouseholdDetailPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
