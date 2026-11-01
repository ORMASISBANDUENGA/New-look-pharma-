/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEW LOOK PHARMA — Ticket de Caisse & Facture Officielle
 */

import React from 'react';
import { SaleTransaction } from '../../types/pharmacy.ts';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { Logo } from '../brand/Logo.tsx';

interface ReceiptModalProps {
  sale: SaleTransaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold text-sm">Vente Validée avec Succès</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimer Ticket (80mm)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div id="printable-receipt" className="p-6 text-slate-800 font-mono text-xs leading-relaxed">
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <div className="flex justify-center mb-2">
              <Logo size="sm" showText={false} />
            </div>
            <h1 className="font-bold text-sm text-slate-900 uppercase tracking-wider">NEW LOOK PHARMA</h1>
            <p className="text-[10px] text-slate-600">Réseau Pharmaceutique Multi-Établissements</p>
            <p className="text-[11px] font-semibold text-slate-800 mt-1">{sale.establishmentName}</p>
            <p className="text-[9px] text-slate-500">RCCM: CD/KIN/RCCM/20-B-01449 · ID NAT: 01-83-N44210L</p>
            <p className="text-[9px] text-slate-500">Ordre National des Pharmaciens RDC N° ONP/KIN/512</p>
            <p className="text-[10px] text-slate-600 italic mt-0.5">« Votre santé, notre priorité »</p>
          </div>

          {/* Transaction Metadata */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">N° Reçu:</span>
              <span className="font-bold text-slate-900">{sale.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Heure:</span>
              <span>{sale.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Caissier:</span>
              <span>{sale.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Client:</span>
              <span>{sale.customerName || 'Client Comptoir'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mode Vente:</span>
              <span className="font-semibold uppercase">{sale.saleType === 'wholesale' ? 'Vente en Gros' : 'Vente Détail'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Taux appliqué:</span>
              <span className="tabular-nums">1 USD = {sale.appliedRateUSD_CDF.toLocaleString()} CDF</span>
            </div>
          </div>

          {/* Line Items */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <div className="grid grid-cols-12 text-[10px] font-bold text-slate-600 pb-1 border-b border-slate-200">
              <span className="col-span-6">DÉSIGNATION / LOT</span>
              <span className="col-span-2 text-right">QTÉ</span>
              <span className="col-span-4 text-right">TOTAL</span>
            </div>
            <div className="divide-y divide-slate-100 py-1">
              {sale.items.map((it, idx) => (
                <div key={idx} className="py-1.5 text-[11px]">
                  <div className="grid grid-cols-12">
                    <span className="col-span-6 font-semibold truncate text-slate-900">{it.productName}</span>
                    <span className="col-span-2 text-right tabular-nums">{it.quantity}</span>
                    <div className="col-span-4 text-right tabular-nums font-semibold">
                      <div>${it.lineTotalUSD.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-500">{it.lineTotalCDF.toLocaleString()} FC</div>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-500 flex justify-between mt-0.5">
                    <span>Lot: {it.batchNumber}</span>
                    {it.discountPercent > 0 && <span className="text-emerald-700">Remise: -{it.discountPercent}%</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Sous-total HT:</span>
              <span className="tabular-nums">${sale.subtotalUSD.toFixed(2)} ({sale.subtotalCDF.toLocaleString()} FC)</span>
            </div>
            {sale.discountUSD > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Remise accordée:</span>
                <span className="tabular-nums">-${sale.discountUSD.toFixed(2)}</span>
              </div>
            )}
            {sale.taxUSD > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>TVA (16%):</span>
                <span className="tabular-nums">${sale.taxUSD.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>NET À PAYER:</span>
              <div className="text-right tabular-nums">
                <div>${sale.totalUSD.toFixed(2)} USD</div>
                <div className="text-xs text-slate-600 font-semibold">{sale.totalCDF.toLocaleString()} CDF</div>
              </div>
            </div>
          </div>

          {/* Settlement / Payments */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Moyen de paiement:</span>
              <span className="font-semibold uppercase">{sale.paymentMethod.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Montant reçu:</span>
              <span className="tabular-nums font-semibold">
                {sale.currencyPaid === 'USD' ? `$${sale.paidAmountUSD.toFixed(2)} USD` : `${sale.paidAmountCDF.toLocaleString()} CDF`}
              </span>
            </div>
            {(sale.changeGivenUSD > 0 || sale.changeGivenCDF > 0) && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Monnaie rendue:</span>
                <span className="tabular-nums">
                  {sale.changeGivenUSD > 0 ? `$${sale.changeGivenUSD.toFixed(2)} USD` : `${sale.changeGivenCDF.toLocaleString()} CDF`}
                </span>
              </div>
            )}
          </div>

          {/* Regulatory Footer & Pharmacovigilance */}
          <div className="pt-4 text-center space-y-1">
            <div className="inline-flex items-center gap-1 text-[10px] text-slate-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Médicaments enregistrés et certifiés conformes</span>
            </div>
            <p className="text-[9px] text-slate-500 leading-tight">
              Conservez ce reçu pour tout échange sous 48h (emballage intact, non ouvert et hors chaîne du froid).
            </p>
            <p className="text-[8px] text-slate-400 mt-2">
              Logiciel Officiel New Look Pharma v1.1 · Développé pour la République Démocratique du Congo
            </p>
          </div>
        </div>

        {/* Bottom Close Button (Hidden in print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Fermer le Reçu
          </button>
        </div>
      </div>
    </div>
  );
};
