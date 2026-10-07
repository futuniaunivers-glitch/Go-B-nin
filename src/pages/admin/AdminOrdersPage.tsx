import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Order, OrderStatus } from '../../types';
import { fetchOrders } from '../../services/orderService';
import { formatFCFA } from '../../lib/format';
import { OrderStatusSelect } from '../../components/admin/OrderStatusSelect';
import { updateOrderStatus } from '../../services/orderService';
import {
  ShoppingBag,
  MessageCircle,
  Eye,
  Filter,
  Search,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { ToastContainer, ToastMessage } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminOrdersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const loadData = async () => {
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    const res = await updateOrderStatus(order.id, newStatus, order);
    if (res.success) {
      addToast(`Statut de ${order.orderNumber} mis à jour : "${newStatus}".`);
      await loadData();
    } else {
      addToast(res.error || 'Erreur lors de la mise à jour du statut.', 'error');
    }
  };

  const setFilter = (s: string) => {
    const next = new URLSearchParams(searchParams);
    if (s === 'all') next.delete('status');
    else next.set('status', s);
    setSearchParams(next);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      const clean = search.toLowerCase().trim();
      if (clean) {
        const matchesNum = o.orderNumber.toLowerCase().includes(clean);
        const matchesName = o.customerName.toLowerCase().includes(clean);
        const matchesPhone = o.phone.includes(clean);
        const matchesCity = o.city.toLowerCase().includes(clean);
        if (!matchesNum && !matchesName && !matchesPhone && !matchesCity) return false;
      }
      return true;
    });
  }, [orders, statusFilter, search]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    for (const o of orders) {
      counts[o.status] = (counts[o.status] || 0) + 1;
    }
    return counts;
  }, [orders]);

  return (
    <div className="space-y-6 pb-20">
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Commandes ({orders.length})
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Suivi des ventes, gestion des expéditions et contact direct client.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'new', label: 'Nouvelles' },
            { id: 'confirmed', label: 'Confirmées' },
            { id: 'preparing', label: 'En préparation' },
            { id: 'delivered', label: 'Livrées' },
            { id: 'cancelled', label: 'Annulées' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {tab.label} ({statusCounts[tab.id] || 0})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher (nom, n°, tél)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-violet-600 focus:ring-1 focus:ring-violet-600/30 shadow-2xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Commande</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Ville / Zone</th>
                <th className="py-3 px-4">Articles</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-4 px-4">
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    Aucune commande trouvée.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const cleanPhone = o.phone.replace(/\D/g, '');
                  const createdDate = new Date(o.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={o.id} className="hover:bg-zinc-50/70 transition-colors">
                      {/* Order Number & Date */}
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/admin/commandes/${o.id}`}
                          className="font-black text-violet-700 hover:text-violet-900 hover:underline block"
                        >
                          {o.orderNumber}
                        </Link>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">
                          {createdDate}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900">{o.customerName}</div>
                        <div className="text-[11px] text-zinc-500">{o.phone}</div>
                      </td>

                      {/* City */}
                      <td className="py-3.5 px-4 text-zinc-700">
                        <span className="font-semibold block">{o.city}</span>
                        <span className="text-[11px] text-zinc-400 truncate block max-w-xs">
                          {o.area}
                        </span>
                      </td>

                      {/* Items count */}
                      <td className="py-3.5 px-4 text-zinc-600">
                        {o.items?.length || 0} référence(s)
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-black text-zinc-900 tabular-nums">
                        {formatFCFA(o.total)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <OrderStatusSelect
                          currentStatus={o.status}
                          stockDeducted={o.stockDeducted}
                          onStatusChange={(s) => handleStatusChange(o, s)}
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                            title="Contacter sur WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4 fill-emerald-600 text-transparent" />
                          </a>

                          <Link
                            to={`/admin/commandes/${o.id}`}
                            className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                            title="Détail complet"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
