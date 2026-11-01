/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEW LOOK PHARMA — Suivi de Commande Client en Temps Réel
 */

import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext.tsx';
import { OnlineOrder } from '../../types/pharmacy.ts';
import {
  Search,
  CheckCircle,
  Clock,
  Truck,
  Building2,
  X,
  FileCheck,
  Package,
} from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose }) => {
  const { onlineOrders, formatMoney } = usePharmacy();
  const [query, setQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().toUpperCase();
    const found = onlineOrders.find(
      (o) => o.orderNumber.toUpperCase() === clean || o.customerPhone.includes(query.trim())
    );
    setSelectedOrder(found || null);
  };

  const steps = [
    { key: 'pending_prescription', label: 'Ordonnance transmise' },
    { key: 'pending_preparation', label: 'Validée par Pharmacien' },
    { key: 'in_preparation', label: 'En cours de préparation' },
    { key: 'ready_for_pickup', label: 'Prête au retrait / En livraison' },
    { key: 'completed', label: 'Livrée / Retirée' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-sm text-slate-800">Suivi de Commande en Direct</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Numéro de Commande ou Téléphone
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: CMD-WEB-1029 ou +243 81..."
                required
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Rechercher
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Entrez le numéro communiqué lors de la validation de votre panier.
            </p>
          </form>

          {/* Quick link to existing orders for easy testing */}
          {!selectedOrder && (
            <div className="border-t border-slate-100 pt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Commandes Récentes en Cours :
              </span>
              <div className="space-y-1.5">
                {onlineOrders.slice(0, 3).map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className="w-full text-left p-2 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
                      <span className="text-slate-500 ml-2">({o.customerName})</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Order Timeline & Info */}
          {selectedOrder && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-200 pb-2">
                <div>
                  <div className="font-mono font-bold text-sm text-slate-900">{selectedOrder.orderNumber}</div>
                  <div className="text-[11px] text-slate-500">Date : {selectedOrder.createdAt}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">
                    ${selectedOrder.totalUSD.toFixed(2)} USD
                  </span>
                  <div className="text-[10px] text-slate-500">
                    {selectedOrder.totalCDF.toLocaleString()} CDF
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center gap-3">
                <Package className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase">
                    Statut : {selectedOrder.status.replace(/_/g, ' ')}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {selectedOrder.deliveryType === 'pickup'
                      ? 'Retrait en pharmacie (Click & Collect)'
                      : `Livraison à domicile (${selectedOrder.deliveryCommune})`}
                  </div>
                </div>
              </div>

              {/* Item breakdown */}
              <div>
                <span className="text-[11px] font-bold text-slate-700">Médicaments commandés :</span>
                <ul className="mt-1 space-y-1 text-xs">
                  {selectedOrder.items.map((it, idx) => (
                    <li key={idx} className="flex justify-between text-slate-700">
                      <span>{it.quantity}x {it.productName} ({it.dosage})</span>
                      <span className="font-semibold">${(it.unitPriceUSD * it.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-right pt-2 border-t border-slate-200">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  ← Rechercher une autre commande
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
