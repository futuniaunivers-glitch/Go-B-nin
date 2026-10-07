import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  FileText,
  Clock,
  ShieldCheck,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { fetchOrderById, updateOrderStatus } from '../../services/orderService';
import { formatFCFA } from '../../lib/format';
import { OrderStatusSelect } from '../../components/admin/OrderStatusSelect';
import { Button } from '../../components/ui/Button';
import { ToastContainer, ToastMessage } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const loadData = async () => {
    if (!id) return;
    try {
      const data = await fetchOrderById(id);
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toastId = Date.now().toString();
    setToasts((prev) => [...prev, { id: toastId, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 3500);
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    setErrorMessage(null);

    const res = await updateOrderStatus(order.id, newStatus, order);
    if (res.success) {
      addToast(`Statut mis à jour : "${newStatus}".`);
      await loadData();
    } else {
      setErrorMessage(res.error || 'Erreur lors de la mise à jour.');
      addToast(res.error || 'Erreur lors de la mise à jour.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-xl font-bold text-zinc-900">Commande introuvable</h2>
        <Link to="/admin/commandes" className="text-violet-700 font-bold hover:underline">
          Retour à la liste des commandes
        </Link>
      </div>
    );
  }

  const cleanPhone = order.phone.replace(/\D/g, '');
  const customerWhatsAppLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Bonjour ${order.customerName}, nous vous contactons concernant votre commande ${order.orderNumber} chez Grossiste des Senteurs 229.`
  )}`;

  const createdDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6 pb-20 max-w-4xl">
      <ToastContainer
        toasts={toasts}
        onDismiss={(tId) => setToasts((prev) => prev.filter((t) => t.id !== tId))}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <Link
            to="/admin/commandes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Toutes les commandes</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            Commande {order.orderNumber}
          </h1>
          <span className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Passée le {createdDate}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={customerWhatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-white text-transparent" />
            <span>Contacter le client</span>
          </a>
        </div>
      </div>

      {/* Error alert for stock failure */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm space-y-1">
          <div className="flex items-center gap-2 font-bold text-rose-950">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>Impossible de valider la commande :</span>
          </div>
          <p className="whitespace-pre-line leading-relaxed font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Status & Stock Section */}
      <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
            Statut actuel de la commande
          </span>
          <OrderStatusSelect
            currentStatus={order.status}
            stockDeducted={order.stockDeducted}
            onStatusChange={handleStatusChange}
          />
        </div>

        <div className="text-xs text-zinc-500 max-w-xs space-y-0.5">
          <p>
            • Le passage à <strong>"Confirmée"</strong> déduit automatiquement les stocks via une
            transaction sécurisée.
          </p>
          <p>
            • Le passage à <strong>"Annulée"</strong> restitue les stocks prélevés.
          </p>
        </div>
      </div>

      {/* 2-columns: Client info & Items snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer & Delivery Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-5 h-fit">
          <h3 className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-violet-700" />
            <span>Client &amp; Livraison</span>
          </h3>

          <div className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <span className="text-zinc-400 text-xs block">Nom complet :</span>
              <span className="font-bold text-zinc-900 text-base">{order.customerName}</span>
            </div>

            <div>
              <span className="text-zinc-400 text-xs block">Téléphone :</span>
              <a
                href={`tel:${cleanPhone}`}
                className="font-bold text-zinc-900 hover:text-violet-700 flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>{order.phone}</span>
              </a>
            </div>

            <div>
              <span className="text-zinc-400 text-xs block">Destination :</span>
              <span className="font-bold text-zinc-900">
                {order.city} — {order.area}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs space-y-1">
              <span className="font-bold text-violet-900 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-violet-700" />
                <span>Repère de livraison :</span>
              </span>
              <p className="leading-relaxed">{order.deliveryNote}</p>
            </div>

            {order.extraNote && (
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs space-y-1">
                <span className="font-bold text-zinc-900 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Note facultative :</span>
                </span>
                <p className="leading-relaxed">{order.extraNote}</p>
              </div>
            )}
          </div>
        </div>

        {/* Items snapshot Table */}
        <div className="md:col-span-2 p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="font-bold text-sm text-zinc-900">
              Articles commandés ({order.items?.length || 0})
            </h3>
            <span className="text-xs font-semibold text-zinc-400">
              Instantanné figé (Snapshot)
            </span>
          </div>

          <div className="divide-y divide-zinc-100 text-xs sm:text-sm">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="font-bold text-zinc-900 block truncate">{item.name}</span>
                  <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                    <span className="tabular-nums">
                      {item.quantity} × {formatFCFA(item.unitPrice)}
                    </span>
                    {item.priceMode === 'wholesale' && (
                      <span className="text-[10px] font-bold text-violet-800 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
                        Prix de gros
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 font-black text-zinc-900 tabular-nums">
                  {formatFCFA(item.subtotal)}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-200 flex items-baseline justify-between">
            <div>
              <span className="font-extrabold text-base text-zinc-900 block">
                TOTAL PRODUITS
              </span>
              <span className="text-xs text-zinc-500 italic">
                (Frais de livraison non inclus)
              </span>
            </div>
            <span className="text-2xl font-black text-zinc-950 tabular-nums">{formatFCFA(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
