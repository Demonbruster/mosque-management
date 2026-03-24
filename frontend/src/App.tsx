// ============================================
// App Component — Router + Providers
// ============================================

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MantineProvider, createTheme } from "@mantine/core";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./lib/auth-context";
import { queryClient } from "./lib/api";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";

const theme = createTheme({
  primaryColor: "green",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  defaultRadius: "md",
  colors: {
    green: [
      "#e6f9ef",
      "#ccf2de",
      "#99e5be",
      "#66d89d",
      "#33cb7d",
      "#1b7a4e",
      "#166a42",
      "#115a36",
      "#0c4a2b",
      "#073a1f",
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
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
