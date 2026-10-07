import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Archive,
  ShoppingBag,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { admin, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Set robots noindex meta tag for admin area
  useEffect(() => {
    let metaTag = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'robots';
      document.head.appendChild(metaTag);
    }
    metaTag.content = 'noindex, nofollow';

    return () => {
      if (metaTag) {
        metaTag.content = 'index, follow';
      }
    };
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !admin) {
      navigate('/admin', { replace: true });
    }
  }, [admin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-zinc-300">Vérification de l'accès administrateur...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const navLinks = [
    { label: 'Tableau de bord', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Produits', path: '/admin/produits', icon: Package },
    { label: 'Gestion du stock', path: '/admin/stock', icon: Archive },
    { label: 'Catégories', path: '/admin/categories', icon: Layers },
    { label: 'Commandes', path: '/admin/commandes', icon: ShoppingBag },
    { label: 'Paramètres', path: '/admin/parametres', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col md:flex-row text-zinc-900">
      {/* Mobile Header */}
      <div className="md:hidden bg-zinc-950 text-white px-4 py-3 flex items-center justify-between border-b border-zinc-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-700 flex items-center justify-center font-bold text-xs shadow-xs">
            229
          </div>
          <span className="font-bold text-sm tracking-tight">Administration GDS 229</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-30 w-64 bg-zinc-950 text-zinc-300 flex flex-col transition-transform duration-200 md:translate-x-0 border-r border-zinc-800/80 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-700 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
              229
            </div>
            <div>
              <h2 className="font-bold text-white text-sm leading-tight">GDS 229</h2>
              <span className="text-[11px] text-violet-400 font-semibold">Espace Propriétaire</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-zinc-400 truncate font-mono">
            {admin.email || 'Administrateur'}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-violet-700 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-zinc-800/80 space-y-1">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <Store className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Voir la boutique</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};
