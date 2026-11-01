/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEW LOOK PHARMA — Panier & Validation de Commande Client
 */

import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext.tsx';
import { Product, OnlineOrder } from '../../types/pharmacy.ts';
import {
  X,
  Trash2,
  Building2,
  Truck,
  ShieldAlert,
  CheckCircle,
  FileText,
  ArrowRight,
  Phone,
  User,
  MapPin,
} from 'lucide-react';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOpenPrescriptionModal: () => void;
  uploadedPrescriptionId?: string;
  onOrderSuccess: (order: OnlineOrder) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenPrescriptionModal,
  uploadedPrescriptionId,
  onOrderSuccess,
}) => {
  const {
    establishments,
    currentExchangeRate,
    toCDF,
    formatMoney,
    createOnlineOrder,
  } = usePharmacy();

  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [pickupEstId, setPickupEstId] = useState<string>(establishments[0]?.id || 'est-hq');
  const [deliveryCommune, setDeliveryCommune] = useState<string>('Gombe');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  // Calculate totals
  const subtotalUSD = cartItems.reduce(
    (sum, item) => sum + item.product.retailPriceUSD * item.quantity,
    0
  );
  const totalUSD = Number(subtotalUSD.toFixed(2));
  const totalCDF = toCDF(totalUSD);

  const hasPrescriptionItems = cartItems.some((it) => it.product.isPrescriptionRequired);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cartItems.length === 0) {
      setErrorMsg('Votre panier est vide.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Veuillez renseigner votre nom et votre numéro de téléphone.');
      return;
    }

    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMsg('Veuillez renseigner votre adresse de livraison complète à Kinshasa.');
      return;
    }

    if (hasPrescriptionItems && !uploadedPrescriptionId) {
      setErrorMsg(
        'Ce panier contient des médicaments soumis à ordonnance obligatoire. Veuillez déposer votre prescription avant de finaliser.'
      );
      return;
    }

    setIsSubmitting(true);

    const res = createOnlineOrder({
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      deliveryType,
      pickupEstablishmentId: deliveryType === 'pickup' ? pickupEstId : undefined,
      deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : undefined,
      deliveryCommune: deliveryType === 'delivery' ? deliveryCommune : undefined,
      prescriptionId: uploadedPrescriptionId,
      items: cartItems.map((c) => ({
        productId: c.product.id,
        quantity: c.quantity,
      })),
    });

    setIsSubmitting(false);

    if (res.success && res.order) {
      onClearCart();
      onOrderSuccess(res.order);
      onClose();
    } else {
      setErrorMsg(res.error || 'Erreur lors de la validation de la commande.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Mon Panier Pharmaceutique</h2>
            <p className="text-xs text-slate-500">
              {cartItems.length} article(s) sélectionné(s) · Taux indicatif 1 USD = {currentExchangeRate.toLocaleString()} CDF
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Cart Items List */}
          {cartItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <p className="text-sm font-medium">Votre panier est actuellement vide.</p>
              <p className="text-xs">Explorez notre catalogue pour ajouter des médicaments ou produits de santé.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cartItems.map((item) => (
                <div key={item.product.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{item.product.brandName}</h4>
                      {item.product.isPrescriptionRequired && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Rx
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">DCI: {item.product.dci} · {item.product.dosage}</p>
                    <div className="text-xs font-semibold text-slate-700 mt-0.5 tabular-nums">
                      ${item.product.retailPriceUSD.toFixed(2)} ({toCDF(item.product.retailPriceUSD).toLocaleString()} FC) / unité
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-200 rounded-lg">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-l text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-slate-900 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-r text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <div className="text-sm font-bold text-slate-900 tabular-nums">
                        ${(item.product.retailPriceUSD * item.quantity).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500 tabular-nums">
                        {toCDF(item.product.retailPriceUSD * item.quantity).toLocaleString()} FC
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Retirer l'article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rx prescription warning & Upload affordance */}
          {hasPrescriptionItems && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-start gap-2 text-amber-800">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <h4 className="text-xs font-bold uppercase">Ordonnance Médicale Obligatoire</h4>
                  <p className="text-xs text-amber-700 leading-relaxed mt-0.5">
                    Votre panier comprend des médicaments soumis à prescription médicale (Rx). Conformément à la législation
                    pharmaceutique en RDC, un pharmacien habilité doit valider votre ordonnance avant délivrance.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {uploadedPrescriptionId ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Ordonnance transmise (Réf: {uploadedPrescriptionId})</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenPrescriptionModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Téléverser l’Ordonnance Maintenant
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Order Details Form */}
          {cartItems.length > 0 && (
            <form onSubmit={handleSubmitOrder} className="space-y-4 border-t border-slate-100 pt-4">
              {/* Delivery method */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">Mode de Récupération *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      deliveryType === 'pickup'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Retrait en Pharmacie</div>
                      <div className="text-[11px] text-slate-500">Click &amp; Collect gratuit en officine</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      deliveryType === 'delivery'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Livraison à Domicile</div>
                      <div className="text-[11px] text-slate-500">Coursier express sur Kinshasa</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Establishment choice or delivery address */}
              {deliveryType === 'pickup' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sélectionnez la Pharmacie de Retrait *
                  </label>
                  <select
                    value={pickupEstId}
                    onChange={(e) => setPickupEstId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {establishments.map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.name} ({est.commune} — {est.address})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Commune de Kinshasa *
                    </label>
                    <select
                      value={deliveryCommune}
                      onChange={(e) => setDeliveryCommune(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="Gombe">Gombe</option>
                      <option value="Kalamu">Kalamu (Victoire / Matonge)</option>
                      <option value="Limete">Limete (Résidentiel / Industriel)</option>
                      <option value="Bandalungwa">Bandalungwa</option>
                      <option value="Ngaliema">Ngaliema / Binza</option>
                      <option value="Kintambo">Kintambo</option>
                      <option value="Barumbu">Barumbu</option>
                      <option value="Lingwala">Lingwala</option>
                      <option value="Kasa-Vubu">Kasa-Vubu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Adresse Précise &amp; Repère *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Ex: N° 12, Av. Justice, Réf. Arrêt Peupliers"
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Customer Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom &amp; Postnom du Patient / Destinataire *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Jean-Paul Kasongo"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Téléphone (Airtel, Vodacom, Orange) *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+243 81 000 0000"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Order Summary & Submit */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Sous-total articles:</span>
                  <span className="tabular-nums font-semibold">${totalUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Frais de préparation &amp; conditionnement:</span>
                  <span className="text-emerald-700 font-semibold">Gratuit</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total à Régler:</span>
                  <div className="text-right tabular-nums">
                    <div>${totalUSD.toFixed(2)} USD</div>
                    <div className="text-xs text-slate-600 font-semibold">{totalCDF.toLocaleString()} CDF</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
                >
                  Continuer mes Achats
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Traitement...' : 'Confirmer la Commande'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
