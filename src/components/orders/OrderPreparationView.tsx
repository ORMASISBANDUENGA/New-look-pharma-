/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEW LOOK PHARMA — Préparation & Expédition des Commandes Web
 */

import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext.tsx';
import { OnlineOrder } from '../../types/pharmacy.ts';
import {
  Package,
  Truck,
  Building2,
  CheckCircle,
  Clock,
  User,
  Phone,
  MapPin,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

export const OrderPreparationView: React.FC = () => {
  const {
    onlineOrders,
    updateOrderStatus,
    currentEstablishment,
    prescriptions,
    formatMoney,
    currentUser,
  } = usePharmacy();

  const [filterDelivery, setFilterDelivery] = useState<'all' | 'pickup' | 'delivery'>('all');

  const filteredOrders = onlineOrders.filter((o) => {
    if (filterDelivery === 'all') return true;
    return o.deliveryType === filterDelivery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase">
            <Package className="w-4 h-4" /> Logistique &amp; Préparation des Commandes
          </div>
          <h1 className="font-extrabold text-slate-900 text-lg mt-0.5">
            File de Préparation Click &amp; Collect et Livraisons
          </h1>
          <p className="text-xs text-slate-500">
            Établissement préparateur : <strong>{currentEstablishment?.name}</strong> · Préparateur : {currentUser.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterDelivery}
            onChange={(e) => setFilterDelivery(e.target.value as any)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-medium"
          >
            <option value="all">Tous les Modes de Délivrance</option>
            <option value="pickup">Retrait Officine (Click &amp; Collect)</option>
            <option value="delivery">Livraisons à Domicile (Kinshasa)</option>
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOrders.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-slate-400 text-sm">
            Aucune commande dans cette file de préparation.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const rx = order.prescriptionId
              ? prescriptions.find((p) => p.id === order.prescriptionId)
              : null;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top line info */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <span className="font-mono font-bold text-xs text-slate-900">{order.orderNumber}</span>
                      <div className="text-[10px] text-slate-400">{order.createdAt}</div>
                    </div>
                    <div>
                      {order.deliveryType === 'pickup' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Building2 className="w-3 h-3" /> Retrait Officine
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          <Truck className="w-3 h-3" /> Livraison {order.deliveryCommune}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="pt-2 space-y-1 text-xs">
                    <div className="font-bold text-slate-900">{order.customerName}</div>
                    <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{order.customerPhone}</span>
                    </div>
                    {order.deliveryAddress && (
                      <div className="flex items-start gap-1 text-slate-600 text-[11px]">
                        <MapPin className="w-3 h-3 shrink-0 text-slate-400 mt-0.5" />
                        <span>{order.deliveryAddress} ({order.deliveryCommune})</span>
                      </div>
                    )}
                  </div>

                  {/* Prescription Status check */}
                  {order.prescriptionId && (
                    <div className="mt-3 p-2 bg-slate-50 rounded border border-slate-200 text-[11px]">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" /> Ordonnance Réf: {order.prescriptionId}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Statut :{' '}
                        {rx?.status === 'approved' ? (
                          <span className="text-emerald-700 font-bold">Validée par Pharmacien</span>
                        ) : (
                          <span className="text-amber-700 font-bold">En attente de validation</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Items to prepare */}
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700">Contenu à Préparer :</span>
                    <ul className="mt-1 space-y-1 text-xs divide-y divide-slate-50">
                      {order.items.map((it, idx) => (
                        <li key={idx} className="py-1 flex justify-between">
                          <span className="text-slate-800">
                            <strong>{it.quantity}x</strong> {it.productName} ({it.dosage})
                          </span>
                          <span className="tabular-nums font-semibold text-slate-700">
                            ${(it.unitPriceUSD * it.quantity).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 text-right">
                    <span className="text-xs text-slate-500">Total Commande : </span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      ${order.totalUSD.toFixed(2)} USD ({order.totalCDF.toLocaleString()} FC)
                    </span>
                  </div>
                </div>

                {/* State Controls for Dispatcher */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Statut actuel :</span>
                    <span className="font-bold uppercase text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {order.status !== 'in_preparation' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'in_preparation')}
                        className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                      >
                        Mettre en Préparation
                      </button>
                    )}

                    {order.deliveryType === 'pickup' ? (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready_for_pickup')}
                        className="px-2.5 py-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors cursor-pointer shadow-xs"
                      >
                        Prête au Retrait
                      </button>
                    ) : (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                        className="px-2.5 py-1.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors cursor-pointer shadow-xs"
                      >
                        Remis au Coursier
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
