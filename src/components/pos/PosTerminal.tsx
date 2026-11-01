/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEW LOOK PHARMA — Terminal Point de Vente (POS Caisse) Multi-Devises
 */

import React, { useState, useMemo } from 'react';
import { usePharmacy } from '../../context/PharmacyContext.tsx';
import { Product, BatchStock, SaleTransaction } from '../../types/pharmacy.ts';
import {
  Search,
  ShoppingCart,
  Trash2,
  DollarSign,
  Printer,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Receipt,
  RotateCcw,
  Plus,
  Minus,
  Sparkles,
  Lock,
  Unlock,
} from 'lucide-react';
import { ReceiptModal } from '../common/ReceiptModal.tsx';

interface PosCartLine {
  product: Product;
  batch: BatchStock;
  quantity: number;
  unitPriceUSD: number;
  discountPercent: number;
}

export const PosTerminal: React.FC = () => {
  const {
    products,
    batches,
    currentEstablishment,
    currentUser,
    currentExchangeRate,
    toCDF,
    toUSD,
    formatMoney,
    processSale,
    cancelSale,
    sales,
    currentCashSession,
    openCashSession,
    closeCashSession,
    getProductBatches,
    getProductStock,
  } = usePharmacy();

  // POS State
  const [saleType, setSaleType] = useState<'retail' | 'wholesale'>('retail');
  const [cartLines, setCartLines] = useState<PosCartLine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('Client Comptoir');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'cash_usd' | 'cash_cdf' | 'mpesa' | 'airtel_money' | 'orange_money' | 'card' | 'credit'
  >('cash_cdf');
  const [currencyPaid, setCurrencyPaid] = useState<'USD' | 'CDF' | 'SPLIT'>('CDF');
  const [tenderedAmount, setTenderedAmount] = useState<string>('');
  const [lastCompletedSale, setLastCompletedSale] = useState<SaleTransaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Cash Session Modals
  const [showOpenSessionModal, setShowOpenSessionModal] = useState(false);
  const [openFloatUSD, setOpenFloatUSD] = useState<number>(100);
  const [openFloatCDF, setOpenFloatCDF] = useState<number>(250000);

  const [showCloseSessionModal, setShowCloseSessionModal] = useState(false);
  const [countedUSD, setCountedUSD] = useState<number>(0);
  const [countedCDF, setCountedCDF] = useState<number>(0);
  const [discrepancyReason, setDiscrepancyReason] = useState<string>('');

  // Cancellation Modal
  const [cancellingSale, setCancellingSale] = useState<SaleTransaction | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('');

  // Filtered products available in current establishment
  const availableProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matches =
        !q ||
        p.brandName.toLowerCase().includes(q) ||
        p.dci.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q);
      return matches;
    });
  }, [products, searchQuery]);

  // Cart Calculations
  const subtotalUSD = cartLines.reduce((sum, line) => {
    const gross = line.quantity * line.unitPriceUSD;
    const disc = (gross * line.discountPercent) / 100;
    return sum + (gross - disc);
  }, 0);

  const taxesUSD = cartLines.reduce((sum, line) => {
    const gross = line.quantity * line.unitPriceUSD;
    const disc = (gross * line.discountPercent) / 100;
    return sum + (gross - disc) * (line.product.taxRate || 0);
  }, 0);

  const totalUSD = Number((subtotalUSD + taxesUSD).toFixed(2));
  const totalCDF = toCDF(totalUSD, currentExchangeRate);

  // Change computation
  const tenderedNum = Number(tenderedAmount) || 0;
  const changeGiven = useMemo(() => {
    if (currencyPaid === 'USD') {
      return Math.max(0, Number((tenderedNum - totalUSD).toFixed(2)));
    } else {
      return Math.max(0, tenderedNum - totalCDF);
    }
  }, [tenderedNum, totalUSD, totalCDF, currencyPaid]);

  // Add product to cart with FEFO batch selection
  const handleAddToCart = (product: Product) => {
    setErrorMessage('');
    if (!currentEstablishment) {
      setErrorMessage('Aucun établissement sélectionné.');
      return;
    }

    // Get available batches for this product in current establishment (FEFO order)
    const availableBatches = getProductBatches(product.id, currentEstablishment.id).filter(
      (b) => b.quantity > 0 && b.status !== 'expired' && b.status !== 'quarantine'
    );

    if (availableBatches.length === 0) {
      setErrorMessage(
        `Rupture de stock : Aucune unité disponible de "${product.brandName}" dans cette officine (${currentEstablishment.name}).`
      );
      return;
    }

    const firstValidBatch = availableBatches[0];

    // Check existing in cart
    const existingIndex = cartLines.findIndex(
      (l) => l.product.id === product.id && l.batch.id === firstValidBatch.id
    );

    const price = saleType === 'wholesale' ? product.wholesalePriceUSD : product.retailPriceUSD;

    if (existingIndex !== -1) {
      const line = cartLines[existingIndex];
      if (line.quantity + 1 > firstValidBatch.quantity) {
        setErrorMessage(
          `Quantité maximale atteinte pour le lot ${firstValidBatch.batchNumber} (Disponible : ${firstValidBatch.quantity})`
        );
        return;
      }
      const updated = [...cartLines];
      updated[existingIndex].quantity += 1;
      setCartLines(updated);
    } else {
      setCartLines([
        ...cartLines,
        {
          product,
          batch: firstValidBatch,
          quantity: 1,
          unitPriceUSD: price,
          discountPercent: 0,
        },
      ]);
    }
  };

  const handleUpdateLineQuantity = (idx: number, delta: number) => {
    const line = cartLines[idx];
    const newQty = line.quantity + delta;
    if (newQty <= 0) {
      setCartLines(cartLines.filter((_, i) => i !== idx));
      return;
    }
    if (newQty > line.batch.quantity) {
      setErrorMessage(`Stock insuffisant dans ce lot (${line.batch.quantity} max).`);
      return;
    }
    const updated = [...cartLines];
    updated[idx].quantity = newQty;
    setCartLines(updated);
  };

  const handleUpdateLineDiscount = (idx: number, discount: number) => {
    // Caissier cannot give more than 10% discount without authorization
    const maxDiscount = currentUser.role === 'CAISSIER' ? 10 : 50;
    const clamped = Math.min(Math.max(0, discount), maxDiscount);
    const updated = [...cartLines];
    updated[idx].discountPercent = clamped;
    setCartLines(updated);
  };

  const handleExecuteSale = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentCashSession) {
      setErrorMessage('Session de caisse fermée. Veuillez ouvrir votre caisse pour débuter les ventes.');
      setShowOpenSessionModal(true);
      return;
    }

    if (cartLines.length === 0) {
      setErrorMessage('Le panier de vente est vide.');
      return;
    }

    // Verify tendered amount
    if (currencyPaid === 'USD' && tenderedNum < totalUSD) {
      setErrorMessage(`Montant perçu insuffisant. Total: $${totalUSD.toFixed(2)} USD.`);
      return;
    }
    if (currencyPaid === 'CDF' && tenderedNum < totalCDF) {
      setErrorMessage(`Montant perçu insuffisant. Total: ${totalCDF.toLocaleString()} CDF.`);
      return;
    }

    const res = processSale({
      customerName: customerName || 'Client Comptoir',
      customerPhone: customerPhone || undefined,
      saleType,
      items: cartLines.map((l) => ({
        productId: l.product.id,
        batchId: l.batch.id,
        quantity: l.quantity,
        unitPriceUSD: l.unitPriceUSD,
        discountPercent: l.discountPercent,
      })),
      paidAmountUSD: currencyPaid === 'USD' ? tenderedNum : 0,
      paidAmountCDF: currencyPaid === 'CDF' ? tenderedNum : 0,
      currencyPaid,
      paymentMethod,
    });

    if (res.success && res.sale) {
      setLastCompletedSale(res.sale);
      setShowReceipt(true);
      setCartLines([]);
      setTenderedAmount('');
      setCustomerName('Client Comptoir');
      setCustomerPhone('');
    } else {
      setErrorMessage(res.error || 'Erreur lors de la validation.');
    }
  };

  const handleConfirmCancelSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingSale || !cancellationReason.trim()) return;

    cancelSale(cancellingSale.id, cancellationReason);
    setCancellingSale(null);
    setCancellationReason('');
  };

  // Recent sales for this establishment
  const recentSales = sales
    .filter((s) => s.establishmentId === currentEstablishment?.id)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner / Session Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            POS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 text-base">Point de Vente — Caisse Comptoir</h1>
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                {currentEstablishment?.name}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>Opérateur : <strong className="text-slate-800">{currentUser.name}</strong></span>
              <span>·</span>
              <span>Taux du jour : <strong className="text-emerald-700 tabular-nums">1 $ = {currentExchangeRate.toLocaleString()} FC</strong></span>
            </div>
          </div>
        </div>

        {/* Session Status & Open/Close buttons */}
        <div className="flex items-center gap-3">
          {currentCashSession ? (
            <div className="flex items-center gap-3">
              <div className="text-right text-xs">
                <span className="text-emerald-700 font-bold flex items-center gap-1 justify-end">
                  <Unlock className="w-3.5 h-3.5" /> Session Ouverte ({currentCashSession.openedAt})
                </span>
                <span className="text-slate-500 text-[11px]">
                  Attendu: ${currentCashSession.expectedCashUSD.toFixed(2)} / {currentCashSession.expectedCashCDF.toLocaleString()} FC
                </span>
              </div>
              <button
                onClick={() => {
                  setCountedUSD(currentCashSession.expectedCashUSD);
                  setCountedCDF(currentCashSession.expectedCashCDF);
                  setShowCloseSessionModal(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              >
                Clôturer Caisse
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Caisse Fermée
              </span>
              <button
                onClick={() => setShowOpenSessionModal(true)}
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
              >
                Ouvrir la Caisse
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left Products / Right Cart & Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Product Search & Fast Selection (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3">
            {/* Mode switch: Détail vs Gros */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => {
                  setSaleType('retail');
                  // update prices in cart
                  setCartLines((prev) =>
                    prev.map((l) => ({ ...l, unitPriceUSD: l.product.retailPriceUSD }))
                  );
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  saleType === 'retail'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vente Détail
              </button>
              <button
                onClick={() => {
                  setSaleType('wholesale');
                  setCartLines((prev) =>
                    prev.map((l) => ({ ...l, unitPriceUSD: l.product.wholesalePriceUSD }))
                  );
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  saleType === 'wholesale'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vente en Gros
              </button>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Tarif appliqué : <strong className="text-slate-800">{saleType === 'wholesale' ? 'Tarif Grossiste' : 'Prix Public Officiel'}</strong>
            </span>
          </div>

          {/* Autocomplete Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher produit par nom, DCI ou code..."
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          {/* Product Items Table */}
          <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100">
            {availableProducts.map((prod) => {
              const currentEstStock = currentEstablishment
                ? getProductStock(prod.id, currentEstablishment.id)
                : 0;
              const batchesForProd = currentEstablishment
                ? getProductBatches(prod.id, currentEstablishment.id)
                : [];
              const price = saleType === 'wholesale' ? prod.wholesalePriceUSD : prod.retailPriceUSD;

              return (
                <div
                  key={prod.id}
                  onClick={() => handleAddToCart(prod)}
                  className={`py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer ${
                    currentEstStock === 0 ? 'opacity-50' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate">{prod.brandName}</span>
                      {prod.isPrescriptionRequired && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          Rx
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      DCI: {prod.dci} · {prod.dosage}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Lots FEFO : {batchesForProd.map((b) => `${b.batchNumber} (${b.quantity})`).join(', ') || 'Aucun'}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900 tabular-nums">
                      ${price.toFixed(2)} USD
                    </div>
                    <div className="text-[10px] text-slate-500 tabular-nums font-medium">
                      {toCDF(price).toLocaleString()} CDF
                    </div>
                    <div className="mt-0.5">
                      <span
                        className={`text-[10px] font-semibold tabular-nums ${
                          currentEstStock > 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {currentEstStock > 0 ? `${currentEstStock} en stock` : 'Épuisé'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Cart, Discounts, Currency settlement & Cash receipt (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-bold text-slate-900">Panier de Vente Actuel</h2>
            </div>
            {cartLines.length > 0 && (
              <button
                onClick={() => setCartLines([])}
                className="text-[11px] text-rose-600 hover:underline"
              >
                Vider
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Cart Table */}
          {cartLines.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Aucun produit sélectionné. Cliquez sur un article du catalogue à gauche pour l'ajouter au ticket.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
              {cartLines.map((line, idx) => (
                <div key={idx} className="py-2.5 space-y-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{line.product.brandName}</div>
                      <div className="text-[10px] text-slate-500">
                        Lot: <span className="font-mono text-slate-700">{line.batch.batchNumber}</span> (Exp: {line.batch.expiryDate})
                      </div>
                    </div>
                    <div className="text-right tabular-nums text-xs font-bold text-slate-900">
                      ${(line.quantity * line.unitPriceUSD * (1 - line.discountPercent / 100)).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    {/* Qty controls */}
                    <div className="flex items-center border border-slate-200 rounded">
                      <button
                        onClick={() => handleUpdateLineQuantity(idx, -1)}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-0.5 font-bold text-slate-900 tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateLineQuantity(idx, 1)}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Discount picker */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span>Remise:</span>
                      <select
                        value={line.discountPercent}
                        onChange={(e) => handleUpdateLineDiscount(idx, Number(e.target.value))}
                        className="border border-slate-200 rounded px-1 py-0.5 text-[10px] bg-white font-medium"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="10">10%</option>
                        {currentUser.role !== 'CAISSIER' && (
                          <>
                            <option value="15">15%</option>
                            <option value="20">20%</option>
                          </>
                        )}
                      </select>
                    </div>

                    <button
                      onClick={() => setCartLines(cartLines.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customer info */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Nom du Client</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Téléphone / Contact</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+243..."
                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Sous-total HT :</span>
              <span className="tabular-nums font-semibold">${subtotalUSD.toFixed(2)}</span>
            </div>
            {taxesUSD > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>TVA (16%) :</span>
                <span className="tabular-nums font-semibold">${taxesUSD.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1 border-t border-slate-200">
              <span>TOTAL DU :</span>
              <div className="text-right tabular-nums">
                <div>${totalUSD.toFixed(2)} USD</div>
                <div className="text-xs text-slate-600 font-semibold">{totalCDF.toLocaleString()} CDF</div>
              </div>
            </div>
          </div>

          {/* Payment & Currency Settlement Box */}
          <form onSubmit={handleExecuteSale} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Devise d'Encaissement *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrencyPaid('CDF');
                    setPaymentMethod('cash_cdf');
                    setTenderedAmount(totalCDF.toString());
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                    currencyPaid === 'CDF'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Franc Congolais (CDF)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrencyPaid('USD');
                    setPaymentMethod('cash_usd');
                    setTenderedAmount(totalUSD.toString());
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                    currencyPaid === 'USD'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Dollar Américain (USD)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Moyen de Paiement</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white"
                >
                  <option value={currencyPaid === 'USD' ? 'cash_usd' : 'cash_cdf'}>Espèces</option>
                  <option value="mpesa">M-Pesa (Vodacom)</option>
                  <option value="airtel_money">Airtel Money</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="card">Carte Bancaire</option>
                  <option value="credit">Crédit Client Autorisé</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Montant Reçu ({currencyPaid === 'USD' ? 'USD $' : 'CDF FC'})
                </label>
                <input
                  type="number"
                  step="any"
                  value={tenderedAmount}
                  onChange={(e) => setTenderedAmount(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs font-bold border border-slate-300 rounded tabular-nums"
                />
              </div>
            </div>

            {/* Change Given (Rendu Monnaie) */}
            {tenderedNum > 0 && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs flex justify-between items-center text-emerald-900">
                <span className="font-semibold">Monnaie à Rendre :</span>
                <span className="font-extrabold text-sm tabular-nums">
                  {currencyPaid === 'USD' ? `$${changeGiven.toFixed(2)} USD` : `${changeGiven.toLocaleString()} CDF`}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={cartLines.length === 0}
              className={`w-full py-3 px-4 font-extrabold text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                cartLines.length > 0
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Receipt className="w-4 h-4" />
              Valider la Vente &amp; Imprimer le Ticket
            </button>
          </form>
        </div>
      </div>

      {/* Recent Sales Ledger & Cancellations */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 mb-3">Dernières Ventes Enregistrées — {currentEstablishment?.name}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-y border-slate-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-3">N° Ticket</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3 text-right">Montant USD</th>
                <th className="py-2.5 px-3 text-right">Montant CDF</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{sale.receiptNumber}</td>
                  <td className="py-2.5 px-3 text-slate-500">{sale.date}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{sale.customerName}</td>
                  <td className="py-2.5 px-3 uppercase text-[10px] text-slate-600 font-semibold">{sale.saleType}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900">
                    ${sale.totalUSD.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                    {sale.totalCDF.toLocaleString()} FC
                  </td>
                  <td className="py-2.5 px-3">
                    {sale.status === 'completed' ? (
                      <span className="text-emerald-700 font-semibold">Validée</span>
                    ) : (
                      <span className="text-rose-600 font-semibold">Annulée</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setLastCompletedSale(sale);
                        setShowReceipt(true);
                      }}
                      className="px-2 py-1 text-[11px] text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-medium cursor-pointer"
                      title="Réimprimer le ticket"
                    >
                      Ticket
                    </button>
                    {sale.status === 'completed' && (
                      <button
                        onClick={() => setCancellingSale(sale)}
                        className="px-2 py-1 text-[11px] text-rose-700 hover:bg-rose-50 rounded font-medium cursor-pointer"
                        title="Annulation documentée"
                      >
                        Annuler
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        sale={lastCompletedSale}
        onClose={() => setShowReceipt(false)}
      />

      {/* Cash Session Open Modal */}
      {showOpenSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-base text-slate-900">Ouverture de Session de Caisse</h3>
            <p className="text-xs text-slate-500">
              Veuillez saisir le fond de caisse physique compté en début de journée pour {currentEstablishment?.name}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fond de caisse en USD ($)
                </label>
                <input
                  type="number"
                  value={openFloatUSD}
                  onChange={(e) => setOpenFloatUSD(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fond de caisse en CDF (FC)
                </label>
                <input
                  type="number"
                  value={openFloatCDF}
                  onChange={(e) => setOpenFloatCDF(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowOpenSessionModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  openCashSession(openFloatUSD, openFloatCDF);
                  setShowOpenSessionModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Confirmer l'Ouverture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cash Session Close Modal with Discrepancy Control */}
      {showCloseSessionModal && currentCashSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-base text-slate-900">Clôture de Caisse &amp; Rapprochement</h3>
            <p className="text-xs text-slate-500">
              Saisissez le comptage effectif des billets et pièces en caisse avant clôture.
            </p>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span>Espèces attendues USD :</span>
                <span className="font-bold tabular-nums">${currentCashSession.expectedCashUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Espèces attendues CDF :</span>
                <span className="font-bold tabular-nums">{currentCashSession.expectedCashCDF.toLocaleString()} FC</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Espèces Réelles Comptées USD ($)
                </label>
                <input
                  type="number"
                  step="any"
                  value={countedUSD}
                  onChange={(e) => setCountedUSD(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Espèces Réelles Comptées CDF (FC)
                </label>
                <input
                  type="number"
                  value={countedCDF}
                  onChange={(e) => setCountedCDF(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Justification / Motif en cas d'écart
                </label>
                <input
                  type="text"
                  value={discrepancyReason}
                  onChange={(e) => setDiscrepancyReason(e.target.value)}
                  placeholder="Ex: Échange monnaie d'appoint / Erreur de comptage"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCloseSessionModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  closeCashSession(countedUSD, countedCDF, discrepancyReason);
                  setShowCloseSessionModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Valider la Clôture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sale Cancellation Modal */}
      {cancellingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleConfirmCancelSale}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4"
          >
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Annulation Documentée de Vente</span>
            </div>

            <p className="text-xs text-slate-600">
              Vous êtes sur le point d'annuler le ticket <strong>{cancellingSale.receiptNumber}</strong> d'un montant de{' '}
              <strong>${cancellingSale.totalUSD.toFixed(2)} USD</strong> ({cancellingSale.totalCDF.toLocaleString()} FC).
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
              <strong>Règle comptable :</strong> L'écriture n'est pas supprimée mais neutralisée par contre-passation.
              Les lots de stock seront recrédités et une trace d'audit inviolable sera consignée.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Motif Obligatoire d'Annulation *
              </label>
              <textarea
                rows={3}
                required
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Ex: Erreur de saisie caissier / Refus du client avant délivrance..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingSale(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Renoncer
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Confirmer l'Annulation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
