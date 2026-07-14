import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout";
import AuthPage from "./pages/AuthPage";
import SongsPage from "./pages/SongsPage";
import SongViewPage from "./pages/SongViewPage";
import AdminPage from "./pages/AdminPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toast } from "./components/Toast";
import "./styles/globals.css";

const qc = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SongsPage />} />
            <Route path="songs/:id" element={<SongViewPage />} />
            <Route
              path="admin"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toast />
    </QueryClientProvider>
  );
}
