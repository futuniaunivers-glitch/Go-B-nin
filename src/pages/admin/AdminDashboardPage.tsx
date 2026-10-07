import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';
import { Product, Order } from '../../types';
import { fetchProducts } from '../../services/productService';
import { fetchOrders } from '../../services/orderService';
import { formatFCFA, getStockStatus } from '../../lib/format';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminDashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prods, ords] = await Promise.all([
          fetchProducts(false),
          fetchOrders(),
        ]);
        setProducts(prods);
        setOrders(ords);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeProducts = products.filter((p) => p.isActive);
  const availableProducts = products.filter((p) => p.stock > p.lowStockThreshold);
  const lowStockProducts = products.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
  );
  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const newOrders = orders.filter((o) => o.status === 'new');
  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
          Tableau de bord
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Vue d'ensemble des ventes, des alertes de stock et des commandes en attente.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Active Products */}
        <Link
          to="/admin/produits"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200 hover:border-violet-300 hover:shadow-md transition-all space-y-2 group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Produits actifs</span>
            <Package className="w-4 h-4 text-zinc-400 group-hover:text-violet-600 transition-colors" />
          </div>
          <div className="text-2xl font-black text-zinc-900">{activeProducts.length}</div>
          <span className="text-[11px] text-zinc-400 block truncate">
            sur {products.length} créés
          </span>
        </Link>

        {/* In Stock */}
        <Link
          to="/admin/stock?filter=all"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200 hover:border-emerald-300 hover:shadow-md transition-all space-y-2 group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Disponibles</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{availableProducts.length}</div>
          <span className="text-[11px] text-zinc-400 block truncate">Stock sécurisé</span>
        </Link>

        {/* Low Stock */}
        <Link
          to="/admin/stock?filter=low"
          className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all space-y-2 group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900">Stock faible</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900">{lowStockProducts.length}</div>
          <span className="text-[11px] text-amber-700 block truncate">À réapprovisionner</span>
        </Link>

        {/* Out of Stock */}
        <Link
          to="/admin/stock?filter=out"
          className="p-4 sm:p-5 rounded-2xl bg-rose-50/60 border border-rose-200 hover:border-rose-400 hover:shadow-md transition-all space-y-2 group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-900">Ruptures</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900">{outOfStockProducts.length}</div>
          <span className="text-[11px] text-rose-700 block truncate">Stock à 0</span>
        </Link>

        {/* New Orders */}
        <Link
          to="/admin/commandes?status=new"
          className="p-4 sm:p-5 rounded-2xl bg-zinc-950 text-white hover:bg-zinc-900 hover:shadow-md transition-all space-y-2 group col-span-2 lg:col-span-1 border border-zinc-800 shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Nouvelles commandes</span>
            <ShoppingBag className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-violet-300">{newOrders.length}</div>
          <span className="text-[11px] text-zinc-400 block truncate">En attente de traitement</span>
        </Link>
      </div>

      {/* Two columns: Stock Alerts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Ruptures & Stock faible */}
        <div className="space-y-6">
          {/* Ruptures */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-sm sm:text-base text-zinc-900">
                  Articles en rupture ({outOfStockProducts.length})
                </h3>
              </div>
              <Link
                to="/admin/stock?filter=out"
                className="text-xs font-bold text-violet-700 hover:text-violet-800 flex items-center gap-1"
              >
                <span>Gérer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {outOfStockProducts.length === 0 ? (
              <p className="text-xs text-zinc-500 py-3 text-center bg-zinc-50 rounded-xl">
                Aucune rupture de stock en ce moment. Bravo !
              </p>
            ) : (
              <div className="divide-y divide-zinc-100 text-xs">
                {outOfStockProducts.slice(0, 5).map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                    <span className="font-bold text-zinc-900 truncate">{p.name}</span>
                    <Link
                      to={`/admin/produits/${p.id}`}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 font-semibold text-zinc-700 shrink-0"
                    >
                      Modifier
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stock faible */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm sm:text-base text-zinc-900">
                  Stock faible ({lowStockProducts.length})
                </h3>
              </div>
              <Link
                to="/admin/stock?filter=low"
                className="text-xs font-bold text-violet-700 hover:text-violet-800 flex items-center gap-1"
              >
                <span>Ajuster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-zinc-500 py-3 text-center bg-zinc-50 rounded-xl">
                Aucun produit sous le seuil d'alerte.
              </p>
            ) : (
              <div className="divide-y divide-zinc-100 text-xs">
                {lowStockProducts.slice(0, 5).map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-bold text-zinc-900 block truncate">{p.name}</span>
                      <span className="text-amber-800 font-medium">
                        Plus que {p.stock} pce(s) (Seuil : {p.lowStockThreshold})
                      </span>
                    </div>
                    <Link
                      to="/admin/stock"
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-900 font-semibold shrink-0 hover:bg-zinc-200 transition-colors"
                    >
                      + Stock
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 5 Dernières Commandes */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-zinc-900">
              5 Dernières commandes
            </h3>
            <Link
              to="/admin/commandes"
              className="text-xs font-bold text-violet-700 hover:text-violet-800 flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-zinc-500 py-8 text-center bg-zinc-50 rounded-xl">
              Aucune commande enregistrée pour le moment.
            </p>
          ) : (
            <div className="divide-y divide-zinc-100 text-xs space-y-1">
              {recentOrders.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900">{o.orderNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          o.status === 'new'
                            ? 'bg-blue-100 text-blue-900'
                            : o.status === 'confirmed'
                            ? 'bg-amber-100 text-amber-900'
                            : o.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                    <div className="text-zinc-500 text-[11px] mt-0.5">
                      {o.customerName} ({o.city}) • {formatFCFA(o.total)}
                    </div>
                  </div>

                  <Link
                    to={`/admin/commandes/${o.id}`}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-800 transition-colors shrink-0"
                  >
                    Détails
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
