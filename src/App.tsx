import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { QuoteProvider } from './contexts/QuoteContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Route-level code splitting for public and admin chunks
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Quote = lazy(() => import('./pages/Quote'));
const Track = lazy(() => import('./pages/Track'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminManagement = lazy(() => import('./pages/admin/Management'));
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

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="h-7 w-7 rounded-full border-2 border-[var(--brand-red)] border-t-transparent animate-spin" />
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
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:slug" element={<ProductDetail />} />
                    <Route path="/quote" element={<Quote />} />
                    <Route path="/track" element={<Track />} />
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
                      path="/admin/management"
                      element={
                        <ProtectedRoute>
                          <AdminManagement />
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
