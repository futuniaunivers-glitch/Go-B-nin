import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Layers, ShoppingCart, Phone } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { totalQuantity } = useCart();

  const items = [
    { label: 'Accueil', path: '/', icon: Home },
    { label: 'Catalogue', path: '/produits', icon: Sparkles },
    { label: 'Catégories', path: '/categories', icon: Layers },
    { label: 'Panier', path: '/panier', icon: ShoppingCart, badge: totalQuantity },
    { label: 'Contact', path: '/contact', icon: Phone },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path === '/produits' && location.pathname.startsWith('/produits')) ||
            (item.path === '/categories' && location.pathname.startsWith('/categories'));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center py-1 transition-colors select-none ${
                isActive ? 'text-violet-700' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-105 stroke-[2.2]' : 'stroke-[1.75]'
                  }`}
                />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${isActive ? 'font-bold text-violet-900' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
