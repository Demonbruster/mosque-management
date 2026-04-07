// ============================================
// App Component — Router + Providers
// ============================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
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
import { PlaceholderPage } from './pages/PlaceholderPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { NewTransactionPage } from './pages/NewTransactionPage';
import { FundCategoriesPage } from './pages/FundCategoriesPage';
import { ApprovalQueuePage } from './pages/ApprovalQueuePage';
import { AssetsPage } from './pages/AssetsPage';
import { AssetDetailPage } from './pages/AssetDetailPage';
import { TenancyListPage } from './pages/TenancyListPage';
import { TenancyDetailPage } from './pages/TenancyDetailPage';
import { RentDueReportPage } from './pages/RentDueReportPage';
import { UtensilInventoryPage } from './pages/UtensilInventoryPage';
import { UtensilRentalsPage } from './pages/UtensilRentalsPage';
import { UtensilVoucherPage } from './pages/UtensilVoucherPage';
import { LifeEventsPage } from './pages/LifeEventsPage';
import { LifeEventFormPage } from './pages/LifeEventFormPage';
import { CertificatePreviewPage } from './pages/CertificatePreviewPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MeetingsPage } from './pages/MeetingsPage';
import { MeetingDetailPage } from './pages/MeetingDetailPage';
import { PanchayathCasesPage } from './pages/PanchayathCasesPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { CommunicationsLogsPage } from './pages/CommunicationsLogsPage';
import TagManagerPage from './pages/admin/TagManagerPage';
import BroadcastCampaignPage from './pages/communications/BroadcastCampaignPage';
import CampaignHistoryPage from './pages/communications/CampaignHistoryPage';
import TemplateManagerPage from './pages/communications/templates/TemplateManagerPage';
import TemplateEditorPage from './pages/communications/templates/TemplateEditorPage';
import { AutomationsPage } from './pages/communications/AutomationsPage';
import FlowBuilderPage from './pages/communications/FlowBuilderPage';
import { PublicRoadmapPage } from './pages/PublicRoadmapPage';
import { AdminProjectsPage } from './pages/AdminProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ProjectAnalysisReportPage } from './pages/ProjectAnalysisReportPage';

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
      <Notifications position="top-right" zIndex={1000} />
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
                <Route
                  path="/admin/tags"
                  element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <TagManagerPage />
                    </ProtectedRoute>
                  }
                />

                {/* --- Navigation Placeholder Routes --- */}
                {/* Community & CRM */}
                <Route
                  path="/mahallas"
                  element={
                    <ProtectedRoute>
                      <PlaceholderPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/deduplication"
                  element={
                    <ProtectedRoute>
                      <PlaceholderPage />
                    </ProtectedRoute>
                  }
                />

                {/* Finance & Accounting */}
                <Route
                  path="/finance"
                  element={
                    <ProtectedRoute>
                      <TransactionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/finance/new"
                  element={
                    <ProtectedRoute>
                      <NewTransactionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/approvals"
                  element={
                    <ProtectedRoute>
                      <ApprovalQueuePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/receipts"
                  element={
                    <ProtectedRoute>
                      <PlaceholderPage />
                    </ProtectedRoute>
                  }
                />

                {/* Communications */}
                <Route
                  path="/communications/logs"
                  element={
                    <ProtectedRoute>
                      <CommunicationsLogsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/communications/broadcast"
                  element={
                    <ProtectedRoute>
                      <BroadcastCampaignPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/communications/campaigns"
                  element={
                    <ProtectedRoute>
                      <CampaignHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/audiences"
                  element={
                    <ProtectedRoute>
                      <PlaceholderPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/communications/templates"
                  element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <TemplateManagerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/communications/automations"
                  element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AutomationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/communications/automations/:id"
                  element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <FlowBuilderPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/communications/templates/:id"
                  element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <TemplateEditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/templates"
                  element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <TemplateManagerPage />
                    </ProtectedRoute>
                  }
                />

                {/* Operations & Assets */}
                <Route
                  path="/assets"
                  element={
                    <ProtectedRoute>
                      <AssetsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assets/:id"
                  element={
                    <ProtectedRoute>
                      <AssetDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tenancy"
                  element={
                    <ProtectedRoute>
                      <TenancyListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tenancy/rent-due"
                  element={
                    <ProtectedRoute>
                      <RentDueReportPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tenancy/:id"
                  element={
                    <ProtectedRoute>
                      <TenancyDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rentals"
                  element={
                    <ProtectedRoute>
                      <UtensilRentalsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/utensils"
                  element={
                    <ProtectedRoute>
                      <UtensilInventoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/utensil-rentals/:id/voucher"
                  element={
                    <ProtectedRoute>
                      <UtensilVoucherPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/life-events"
                  element={
                    <ProtectedRoute>
                      <LifeEventsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/life-events/new"
                  element={
                    <ProtectedRoute>
                      <LifeEventFormPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/life-events/:id/certificate"
                  element={
                    <ProtectedRoute>
                      <CertificatePreviewPage />
                    </ProtectedRoute>
                  }
                />

                {/* Projects & Roadmap */}
                <Route path="/roadmap" element={<PublicRoadmapPage />} />
                <Route
                  path="/admin/projects"
                  element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminProjectsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/projects/analysis"
                  element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <ProjectAnalysisReportPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/projects/:id"
                  element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <ProjectDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/planning"
                  element={
                    <ProtectedRoute>
                      <AdminProjectsPage />
                    </ProtectedRoute>
                  }
                />

                {/* HR & Governance */}
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute>
                      <PlaceholderPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/meetings"
                  element={
                    <ProtectedRoute>
                      <MeetingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/meetings/:id"
                  element={
                    <ProtectedRoute>
                      <MeetingDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/committees"
                  element={
                    <ProtectedRoute>
                      <PlaceholderPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/panchayath"
                  element={
                    <ProtectedRoute>
                      <PanchayathCasesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/panchayath/:id"
                  element={
                    <ProtectedRoute>
                      <CaseDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/madrasa"
                  element={
                    <ProtectedRoute>
                      <PlaceholderPage />
                    </ProtectedRoute>
                  }
                />

                {/* System Settings (Admin only) */}
                <Route
                  path="/integrations"
                  element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <PlaceholderPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/fund-categories"
                  element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <FundCategoriesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/audit-logs"
                  element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <PlaceholderPage />
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
