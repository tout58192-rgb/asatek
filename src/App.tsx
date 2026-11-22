import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { QuoteProvider } from './contexts/QuoteContext';
import { ToastProvider } from './contexts/ToastContext';
import About from './pages/About';
import Contact from './pages/Contact';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';
import Quote from './pages/Quote';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Code-split admin pages into separate chunks
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminProductsList = lazy(() => import('./pages/admin/ProductsList'));
const AdminProductForm = lazy(() => import('./pages/admin/ProductForm'));
const AdminInquiries = lazy(() => import('./pages/admin/Inquiries'));
const AdminInquiryDetail = lazy(() => import('./pages/admin/InquiryDetail'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AdminFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-alt)] text-sm text-[var(--ink-soft)]">
      Loading admin...
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <QuoteProvider>
            <BrowserRouter>
              <ToastProvider>
                <Suspense fallback={<AdminFallback />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:slug" element={<ProductDetail />} />
                    <Route path="/quote" element={<Quote />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/categories"
                      element={
                        <ProtectedRoute>
                          <AdminCategories />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/products"
                      element={
                        <ProtectedRoute>
                          <AdminProductsList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/products/new"
                      element={
                        <ProtectedRoute>
                          <AdminProductForm />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/products/:id"
                      element={
                        <ProtectedRoute>
                          <AdminProductForm />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/inquiries"
                      element={
                        <ProtectedRoute>
                          <AdminInquiries />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/inquiries/:id"
                      element={
                        <ProtectedRoute>
                          <AdminInquiryDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/settings"
                      element={
                        <ProtectedRoute>
                          <AdminSettings />
                        </ProtectedRoute>
                      }
                    />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ToastProvider>
            </BrowserRouter>
          </QuoteProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
