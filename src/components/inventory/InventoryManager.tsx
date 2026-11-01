/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEW LOOK PHARMA — Gestion des Stocks, Lots FEFO & Approvisionnements
 */

import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext.tsx';
import { BatchStock, Product } from '../../types/pharmacy.ts';
import {
  Package,
  Layers,
  Calendar,
  AlertTriangle,
  ArrowRightLeft,
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle,
  ShieldAlert,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const {
    products,
    batches,
    currentEstablishment,
    activeEstablishmentId,
    establishments,
    currentUser,
    adjustStock,
    transfers,
    createTransfer,
    confirmReceiveTransfer,
    purchaseOrders,
    createPurchaseOrder,
    receivePurchaseOrder,
    suppliers,
    stockMovements,
    currentExchangeRate,
    toCDF,
  } = usePharmacy();

  const [activeSubTab, setActiveSubTab] = useState<'stocks' | 'lots' | 'transfers' | 'purchases' | 'movements'>('stocks');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Stock Adjustment Modal
  const [adjustingBatch, setAdjustingBatch] = useState<BatchStock | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Transfer Creation Modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [destEstId, setDestEstId] = useState<string>(
    establishments.find((e) => e.id !== currentEstablishment?.id)?.id || ''
  );
  const [transferProductId, setTransferProductId] = useState<string>(products[0]?.id || '');
  const [transferBatchNumber, setTransferBatchNumber] = useState<string>('');
  const [transferQty, setTransferQty] = useState<number>(10);
  const [transferNotes, setTransferNotes] = useState<string>('');

  // Purchase Order Creation Modal
  const [showPOModal, setShowPOModal] = useState(false);
  const [poSupplierId, setPoSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [poProductId, setPoProductId] = useState<string>(products[0]?.id || '');
  const [poQuantity, setPoQuantity] = useState<number>(50);
  const [poCostUSD, setPoCostUSD] = useState<number>(5.0);

  // Reception Validation Modal
  const [receivingPOId, setReceivingPOId] = useState<string | null>(null);
  const [receivedBatchNumber, setReceivedBatchNumber] = useState<string>('LOT-NEW-2026');
  const [receivedExpiryDate, setReceivedExpiryDate] = useState<string>('2028-12-31');

  // Filtered batches for active establishment
  const filteredBatches = batches.filter((b) => {
    const matchesEst =
      activeEstablishmentId === 'all' ? true : b.establishmentId === activeEstablishmentId;
    const prod = products.find((p) => p.id === b.productId);
    const matchesSearch =
      !searchQuery ||
      prod?.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod?.dci.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || prod?.category === categoryFilter;

    return matchesEst && matchesSearch && matchesCategory;
  });

  // Lot Expiry Analysis (FEFO)
  const today = new Date();
  const ninetyDaysLater = new Date(today.getTime() + 90 * 86400000);
  const thirtyDaysLater = new Date(today.getTime() + 30 * 86400000);

  const getExpirySeverity = (expiryStr: string) => {
    const d = new Date(expiryStr);
    if (d < today) return { label: 'EXPIRÉ — BLOQUÉ', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    if (d < thirtyDaysLater) return { label: 'CRITIQUE (<30j)', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    if (d < ninetyDaysLater) return { label: 'ATTENTION (<90j)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'CONFORME', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  const handleExecuteAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingBatch || !adjustReason.trim() || adjustDelta === 0) return;

    adjustStock(adjustingBatch.id, adjustDelta, adjustReason);
    setAdjustingBatch(null);
    setAdjustDelta(0);
    setAdjustReason('');
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destEstId || !transferProductId || !transferBatchNumber || transferQty <= 0) return;

    createTransfer(
      destEstId,
      [{ productId: transferProductId, batchNumber: transferBatchNumber, quantity: transferQty }],
      transferNotes
    );
    setShowTransferModal(false);
    setTransferNotes('');
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierId || !poProductId || poQuantity <= 0) return;

    createPurchaseOrder(poSupplierId, [{ productId: poProductId, quantity: poQuantity, unitCostUSD: poCostUSD }]);
    setShowPOModal(false);
  };

  const handleValidateReception = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingPOId) return;

    const po = purchaseOrders.find((p) => p.id === receivingPOId);
    if (!po) return;

    const itemsToReceive = po.items.map((it) => ({
      productId: it.productId,
      quantity: it.orderedQty,
      batchNumber: receivedBatchNumber,
      expiryDate: receivedExpiryDate,
      unitCostUSD: it.unitCostUSD,
    }));

    receivePurchaseOrder(receivingPOId, itemsToReceive);
    setReceivingPOId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title & Stats */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-slate-900 text-lg">
            Gestion des Stocks, Lots FEFO &amp; Approvisionnements
          </h1>
          <p className="text-xs text-slate-500">
            Établissement actif : <strong>{currentEstablishment?.name}</strong> · Traçabilité par lot et règles de péremption strictes
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Nouveau Transfert
          </button>
          <button
            onClick={() => setShowPOModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Commande Fournisseur
          </button>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('stocks')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'stocks'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Fiches de Stock
        </button>
        <button
          onClick={() => setActiveSubTab('lots')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'lots'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Lots &amp; Péremptions (FEFO)
        </button>
        <button
          onClick={() => setActiveSubTab('transfers')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'transfers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Transferts Inter-Sites ({transfers.filter((t) => t.status === 'in_transit').length} en transit)
        </button>
        <button
          onClick={() => setActiveSubTab('purchases')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'purchases'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Commandes Fournisseurs
        </button>
        <button
          onClick={() => setActiveSubTab('movements')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'movements'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Journal des Mouvements
        </button>
      </div>

      {/* Tab 1: Fiches de Stock */}
      {activeSubTab === 'stocks' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrer médicament..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {filteredBatches.length} lot(s) inventorié(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Code / Produit</th>
                  <th className="py-2.5 px-3">DCI</th>
                  <th className="py-2.5 px-3">N° Lot</th>
                  <th className="py-2.5 px-3">Péremption</th>
                  <th className="py-2.5 px-3">Emplacement</th>
                  <th className="py-2.5 px-3 text-right">Quantité</th>
                  <th className="py-2.5 px-3 text-right">Coût Unitaire</th>
                  <th className="py-2.5 px-3 text-right">Valeur Stock</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.map((b) => {
                  const prod = products.find((p) => p.id === b.productId);
                  const expiryInfo = getExpirySeverity(b.expiryDate);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {prod?.brandName}
                        <div className="text-[10px] text-slate-400 font-mono">{prod?.code}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{prod?.dci}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{b.batchNumber}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${expiryInfo.color}`}>
                          {b.expiryDate}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{b.locationShelf}</td>
                      <td className="py-2.5 px-3 text-right font-bold tabular-nums text-slate-900">
                        {b.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                        ${b.purchaseCostUSD.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold tabular-nums text-slate-900">
                        ${(b.quantity * b.purchaseCostUSD).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setAdjustingBatch(b);
                            setAdjustDelta(0);
                            setAdjustReason('');
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                        >
                          Ajuster
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Lots & FEFO */}
      {activeSubTab === 'lots' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-amber-800 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              <strong>Principe FEFO (First Expired, First Out) :</strong> Les lots dont la date de péremption est la plus
              proche sont automatiquement servis en priorité au comptoir. Tout produit dont la date est dépassée est
              strictement bloqué à la vente.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800">Lots Valides</span>
              <div className="text-2xl font-extrabold text-emerald-900 tabular-nums">
                {batches.filter((b) => new Date(b.expiryDate) > ninetyDaysLater).length}
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">Péremption &gt; 90 jours</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-xs font-bold text-amber-800">Péremption Approchante</span>
              <div className="text-2xl font-extrabold text-amber-900 tabular-nums">
                {batches.filter((b) => new Date(b.expiryDate) <= ninetyDaysLater && new Date(b.expiryDate) > today).length}
              </div>
              <p className="text-[11px] text-amber-700 mt-1">À écouler en priorité (&lt;90j)</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-xs font-bold text-rose-800">Lots Expirés ou Critiques</span>
              <div className="text-2xl font-extrabold text-rose-900 tabular-nums">
                {batches.filter((b) => new Date(b.expiryDate) <= today).length}
              </div>
              <p className="text-[11px] text-rose-700 mt-1">Vente bloquée · Mise en quarantaine</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Transferts Inter-Pharmacies */}
      {activeSubTab === 'transfers' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Mouvements de Transfert Inter-Établissements</h3>
            <button
              onClick={() => setShowTransferModal(true)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
            >
              Créer un Transfert
            </button>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            <strong>Règle d'Acceptation TAR :</strong> Lorsqu'un transfert est expédié, les stocks sont mis en statut « en transit ».
            L'établissement destinataire n'est crédité QU'APRÈS confirmation de la réception physique par son équipe locale.
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">N° Transfert</th>
                  <th className="py-2.5 px-3">Origine</th>
                  <th className="py-2.5 px-3">Destination</th>
                  <th className="py-2.5 px-3">Articles &amp; Lots</th>
                  <th className="py-2.5 px-3">Date Expédition</th>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-3 text-right">Action Réception</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.map((trf) => (
                  <tr key={trf.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{trf.transferNumber}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{trf.sourceEstablishmentName}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{trf.destEstablishmentName}</td>
                    <td className="py-2.5 px-3">
                      {trf.items.map((it, idx) => (
                        <div key={idx} className="text-[11px]">
                          <strong>{it.quantity}x</strong> {it.productName} ({it.batchNumber})
                        </div>
                      ))}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{trf.shipDate || trf.requestDate}</td>
                    <td className="py-2.5 px-3">
                      {trf.status === 'in_transit' ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          En Transit
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Réception Confirmée
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {trf.status === 'in_transit' && (
                        <button
                          onClick={() => confirmReceiveTransfer(trf.id)}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors cursor-pointer"
                        >
                          Valider Réception &amp; Créditer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Commandes Fournisseurs */}
      {activeSubTab === 'purchases' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Bons de Commande &amp; Réceptions Fournisseurs</h3>
            <button
              onClick={() => setShowPOModal(true)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Émettre un Bon de Commande
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">N° Bon Commande</th>
                  <th className="py-2.5 px-3">Fournisseur</th>
                  <th className="py-2.5 px-3">Date Commande</th>
                  <th className="py-2.5 px-3 text-right">Total USD</th>
                  <th className="py-2.5 px-3 text-right">Total CDF</th>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-3 text-right">Contrôle &amp; Entrée Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{po.poNumber}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{po.supplierName}</td>
                    <td className="py-2.5 px-3 text-slate-500">{po.orderDate}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900">
                      ${po.totalUSD.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                      {po.totalCDF.toLocaleString()} FC
                    </td>
                    <td className="py-2.5 px-3">
                      {po.status === 'received_validated' ? (
                        <span className="text-emerald-700 font-semibold">Réceptionné &amp; Stocké</span>
                      ) : (
                        <span className="text-amber-700 font-semibold">En attente de livraison</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {po.status === 'ordered' && (
                        <button
                          onClick={() => setReceivingPOId(po.id)}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors cursor-pointer"
                        >
                          Valider Réception
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Journal des Mouvements */}
      {activeSubTab === 'movements' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Traçabilité &amp; Journal des Mouvements de Stock</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Date / Heure</th>
                  <th className="py-2.5 px-3">Établissement</th>
                  <th className="py-2.5 px-3">Produit &amp; Lot</th>
                  <th className="py-2.5 px-3">Type Mouvement</th>
                  <th className="py-2.5 px-3 text-right">Variation</th>
                  <th className="py-2.5 px-3 text-right">Solde Après</th>
                  <th className="py-2.5 px-3">Auteur</th>
                  <th className="py-2.5 px-3">Réf Document</th>
                  <th className="py-2.5 px-3">Motif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500">{m.date}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{m.establishmentName}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {m.productName} <span className="font-mono text-slate-500">({m.batchNumber})</span>
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-slate-600">{m.type}</td>
                    <td
                      className={`py-2.5 px-3 text-right font-extrabold tabular-nums ${
                        m.quantityDelta > 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold tabular-nums text-slate-900">
                      {m.balanceAfter}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {m.authorName} ({m.authorRole})
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{m.documentRef}</td>
                    <td className="py-2.5 px-3 text-slate-500 italic">{m.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleExecuteAdjustment}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4"
          >
            <h3 className="font-bold text-base text-slate-900">Ajustement de Stock Justifié</h3>
            <p className="text-xs text-slate-500">
              Lot : <strong className="font-mono">{adjustingBatch.batchNumber}</strong> · Stock actuel :{' '}
              <strong className="text-slate-900">{adjustingBatch.quantity} unités</strong>
            </p>

            <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-xs">
              Toute correction de stock exige obligatoirement un motif explicite et fait l'objet d'un audit immédiat.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Variation de Stock (positive ou négative) *
              </label>
              <input
                type="number"
                value={adjustDelta}
                onChange={(e) => setAdjustDelta(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums"
                placeholder="Ex: -2 pour casse, +5 pour retour comptoir"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motif Obligatoire *
              </label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white mb-2"
              >
                <option value="">Sélectionnez un motif...</option>
                <option value="Casse / Flacon brisé en officine">Casse / Flacon brisé en officine</option>
                <option value="Avarie constatée / Défaut fabricant">Avarie constatée / Défaut fabricant</option>
                <option value="Rupture de chaîne du froid">Rupture de chaîne du froid</option>
                <option value="Péremption atteinte / Retrait pour destruction">Péremption atteinte / Retrait pour destruction</option>
                <option value="Écart d'inventaire physique périodique">Écart d'inventaire physique périodique</option>
                <option value="Autre motif documenté">Autre motif documenté</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustingBatch(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Enregistrer l'Ajustement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transfer Order Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateTransfer}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4"
          >
            <h3 className="font-bold text-base text-slate-900">Nouveau Transfert Inter-Établissements</h3>
            <p className="text-xs text-slate-500">Origine : {currentEstablishment?.name}</p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pharmacie Destinataire *</label>
              <select
                value={destEstId}
                onChange={(e) => setDestEstId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {establishments
                  .filter((e) => e.id !== currentEstablishment?.id)
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.commune})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Médicament *</label>
              <select
                value={transferProductId}
                onChange={(e) => {
                  setTransferProductId(e.target.value);
                  const b = batches.find(
                    (x) => x.productId === e.target.value && x.establishmentId === currentEstablishment?.id
                  );
                  setTransferBatchNumber(b?.batchNumber || '');
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.brandName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">N° de Lot *</label>
                <input
                  type="text"
                  value={transferBatchNumber}
                  onChange={(e) => setTransferBatchNumber(e.target.value)}
                  placeholder="Ex: LOT-AUG-25B"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quantité *</label>
                <input
                  type="number"
                  min="1"
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions d'acheminement</label>
              <input
                type="text"
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                placeholder="Ex: Dépannage urgent par coursier moto"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Expédier le Transfert
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PO Creation Modal */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreatePO}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4"
          >
            <h3 className="font-bold text-base text-slate-900">Émission Bon de Commande Fournisseur</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fournisseur Agréé *</label>
              <select
                value={poSupplierId}
                onChange={(e) => setPoSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.country})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Produit à Commander *</label>
              <select
                value={poProductId}
                onChange={(e) => setPoProductId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.brandName} ({p.dci})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quantité (Unités) *</label>
                <input
                  type="number"
                  min="1"
                  value={poQuantity}
                  onChange={(e) => setPoQuantity(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Coût Achat Unitaire ($) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={poCostUSD}
                  onChange={(e) => setPoCostUSD(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg tabular-nums"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPOModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Émettre le Bon de Commande
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reception Validation Modal */}
      {receivingPOId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleValidateReception}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4"
          >
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
              <CheckCircle className="w-5 h-5" />
              <span>Contrôle &amp; Validation de Réception Fournisseur</span>
            </div>

            <p className="text-xs text-slate-600">
              Vérifiez la conformité des produits livrés, saisissez les numéros de lots et dates de péremption du fabricant
              avant intégration dans les stocks de {currentEstablishment?.name}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  N° de Lot Fabricant Reçu *
                </label>
                <input
                  type="text"
                  value={receivedBatchNumber}
                  onChange={(e) => setReceivedBatchNumber(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date d'Expiration du Lot *
                </label>
                <input
                  type="date"
                  value={receivedExpiryDate}
                  onChange={(e) => setReceivedExpiryDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReceivingPOId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
              >
                Confirmer l'Entrée en Stock
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
