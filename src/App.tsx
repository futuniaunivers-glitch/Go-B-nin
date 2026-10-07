import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';

// Client components
import { Header } from './components/client/Header';
import { BottomNav } from './components/client/BottomNav';
import { Footer } from './components/client/Footer';

// Client pages
import { HomePage } from './pages/client/HomePage';
import { CatalogPage } from './pages/client/CatalogPage';
import { ProductDetailPage } from './pages/client/ProductDetailPage';
import { CategoriesPage } from './pages/client/CategoriesPage';
import { CartPage } from './pages/client/CartPage';
import { CheckoutPage } from './pages/client/CheckoutPage';
import { OrderSuccessPage } from './pages/client/OrderSuccessPage';
import { ConditionsPage } from './pages/client/ConditionsPage';
import { ContactPage } from './pages/client/ContactPage';
import { NotFoundPage } from './pages/client/NotFoundPage';

// Lazy loaded admin pages (per Section 4)
const AdminLayout = lazy(() =>
  import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
const AdminLoginPage = lazy(() =>
  import('./pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminProductsPage = lazy(() =>
  import('./pages/admin/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage }))
);
const AdminProductCreatePage = lazy(() =>
  import('./pages/admin/AdminProductCreatePage').then((m) => ({
    default: m.AdminProductCreatePage,
  }))
);
const AdminProductEditPage = lazy(() =>
  import('./pages/admin/AdminProductEditPage').then((m) => ({
    default: m.AdminProductEditPage,
  }))
);
const AdminStockPage = lazy(() =>
  import('./pages/admin/AdminStockPage').then((m) => ({ default: m.AdminStockPage }))
);
const AdminCategoriesPage = lazy(() =>
  import('./pages/admin/AdminCategoriesPage').then((m) => ({
    default: m.AdminCategoriesPage,
  }))
);
const AdminOrdersPage = lazy(() =>
  import('./pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage }))
);
const AdminOrderDetailPage = lazy(() =>
  import('./pages/admin/AdminOrderDetailPage').then((m) => ({
    default: m.AdminOrderDetailPage,
  }))
);
const AdminSettingsPage = lazy(() =>
  import('./pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage }))
);

const AdminSuspenseFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
    <div className="text-center space-y-3">
      <div className="w-10 h-10 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-xs font-semibold text-zinc-400">Chargement de l'administration...</p>
    </div>
  </div>
);

// Public Client Layout
const ClientLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Client Routes */}
              <Route element={<ClientLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/produits" element={<CatalogPage />} />
                <Route path="/produits/:id" element={<ProductDetailPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/panier" element={<CartPage />} />
                <Route path="/commande" element={<CheckoutPage />} />
                <Route path="/commande/envoyee" element={<OrderSuccessPage />} />
                <Route path="/conditions" element={<ConditionsPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Route>

              {/* Admin Login Route */}
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<AdminSuspenseFallback />}>
                    <AdminLoginPage />
                  </Suspense>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<AdminSuspenseFallback />}>
                    <AdminLayout />
                  </Suspense>
                }
              >
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="produits" element={<AdminProductsPage />} />
                <Route path="produits/nouveau" element={<AdminProductCreatePage />} />
                <Route path="produits/:id" element={<AdminProductEditPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="stock" element={<AdminStockPage />} />
                <Route path="commandes" element={<AdminOrdersPage />} />
                <Route path="commandes/:id" element={<AdminOrderDetailPage />} />
                <Route path="parametres" element={<AdminSettingsPage />} />
              </Route>

              {/* 404 Catch-All */}
              <Route element={<ClientLayout />}>
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
