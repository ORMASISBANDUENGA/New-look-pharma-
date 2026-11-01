/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEW LOOK PHARMA — Comptabilité de Gestion & Trésorerie Multi-Devises
 */

import React, { useState, useMemo } from 'react';
import { usePharmacy } from '../../context/PharmacyContext.tsx';
import { FinancialEntry, Currency } from '../../types/pharmacy.ts';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  FileText,
  Plus,
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';

export const FinanceManager: React.FC = () => {
  const {
    financialEntries,
    establishments,
    currentEstablishment,
    activeEstablishmentId,
    currentUser,
    currentExchangeRate,
    toCDF,
    toUSD,
    formatMoney,
    addExpense,
    reverseFinancialEntry,
  } = usePharmacy();

  // Filters
  const [selectedCurrencyView, setSelectedCurrencyView] = useState<'USD' | 'CDF' | 'CONSOLIDATED'>('CONSOLIDATED');
  const [periodFilter, setPeriodFilter] = useState<'day' | 'month' | 'year' | 'all'>('month');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // New Expense Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState('Énergie & Générateur');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number>(50);
  const [expenseCurrency, setExpenseCurrency] = useState<Currency>('USD');
  const [expenseRef, setExpenseRef] = useState('');

  // Contra-entry / Reversal Modal
  const [reversingEntry, setReversingEntry] = useState<FinancialEntry | null>(null);
  const [reversalReason, setReversalReason] = useState<string>('');

  // Filtered Entries
  const filteredEntries = useMemo(() => {
    return financialEntries.filter((f) => {
      const matchesEst =
        activeEstablishmentId === 'all' ? true : f.establishmentId === activeEstablishmentId;
      const matchesCat = categoryFilter === 'all' || f.category === categoryFilter;
      return matchesEst && matchesCat;
    });
  }, [financialEntries, activeEstablishmentId, categoryFilter]);

  // Financial Calculations
  const stats = useMemo(() => {
    let grossRevenueUSD = 0;
    let costOfGoodsUSD = 0;
    let operatingExpensesUSD = 0;

    filteredEntries.forEach((entry) => {
      if (entry.type === 'sale') {
        grossRevenueUSD += entry.amountUSD;
        // Estimated CAMV / Cost of goods ~ 65% of sales
        costOfGoodsUSD += entry.amountUSD * 0.65;
      } else if (entry.type === 'purchase') {
        // purchases
      } else if (entry.type === 'operating_expense') {
        operatingExpensesUSD += entry.amountUSD;
      } else if (entry.type === 'refund') {
        grossRevenueUSD += entry.amountUSD; // negative value
      }
    });

    const grossMarginUSD = grossRevenueUSD - costOfGoodsUSD;
    const netProfitUSD = grossMarginUSD - operatingExpensesUSD;

    return {
      grossRevenueUSD: Number(grossRevenueUSD.toFixed(2)),
      grossRevenueCDF: toCDF(grossRevenueUSD),
      costOfGoodsUSD: Number(costOfGoodsUSD.toFixed(2)),
      costOfGoodsCDF: toCDF(costOfGoodsUSD),
      grossMarginUSD: Number(grossMarginUSD.toFixed(2)),
      grossMarginCDF: toCDF(grossMarginUSD),
      operatingExpensesUSD: Number(operatingExpensesUSD.toFixed(2)),
      operatingExpensesCDF: toCDF(operatingExpensesUSD),
      netProfitUSD: Number(netProfitUSD.toFixed(2)),
      netProfitCDF: toCDF(netProfitUSD),
    };
  }, [filteredEntries, toCDF]);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || expenseAmount <= 0 || !expenseDesc.trim()) return;

    addExpense(
      expenseCategory,
      expenseDesc,
      expenseAmount,
      expenseCurrency,
      expenseRef || `DEP-${Date.now().toString().slice(-4)}`
    );

    setShowExpenseModal(false);
    setExpenseDesc('');
    setExpenseRef('');
  };

  const handleExecuteReversal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversingEntry || !reversalReason.trim()) return;

    reverseFinancialEntry(reversingEntry.id, reversalReason);
    setReversingEntry(null);
    setReversalReason('');
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Etablissement', 'Type', 'Categorie', 'Description', 'Montant USD', 'Montant CDF', 'Devise Origine', 'Taux Applique', 'Auteur', 'Ref'];
    const rows = filteredEntries.map((e) => [
      e.id,
      e.date,
      e.establishmentName,
      e.type,
      e.category,
      `"${e.description.replace(/"/g, '""')}"`,
      e.amountUSD,
      e.amountCDF,
      e.currencyOriginal,
      e.appliedRate,
      e.authorName,
      e.referenceDoc,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `journal_financier_newlook_${activeEstablishmentId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-slate-900 text-lg">Comptabilité de Gestion &amp; Trésorerie</h1>
          <p className="text-xs text-slate-500">
            Établissement : <strong>{activeEstablishmentId === 'all' ? 'Vue Consolidée Réseau' : currentEstablishment?.name}</strong> · Taux officiel d'évaluation : 1 USD = {currentExchangeRate.toLocaleString()} CDF
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Exporter CSV
          </button>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Engager une Dépense
          </button>
        </div>
      </div>

      {/* KPI Cards: P&L Estimé */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Chiffre d'Affaires Brut */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Chiffre d'Affaires Brut</span>
          <div className="text-xl font-extrabold text-slate-900 tabular-nums mt-1">
            ${stats.grossRevenueUSD.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 tabular-nums">
            {stats.grossRevenueCDF.toLocaleString()} FC
          </div>
          <div className="mt-2 text-[10px] text-emerald-700 font-semibold">Ventes comptoir &amp; gros</div>
        </div>

        {/* Coût des Marchandises Vendues (CAMV) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Coût d'Achat Marchandises (CAMV)</span>
          <div className="text-xl font-extrabold text-slate-700 tabular-nums mt-1">
            ${stats.costOfGoodsUSD.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 tabular-nums">
            {stats.costOfGoodsCDF.toLocaleString()} FC
          </div>
          <div className="mt-2 text-[10px] text-slate-500">Coût d'acquisition fabricant</div>
        </div>

        {/* Marge Brute */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Marge Brute Réseau</span>
          <div className="text-xl font-extrabold text-emerald-700 tabular-nums mt-1">
            ${stats.grossMarginUSD.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 tabular-nums">
            {stats.grossMarginCDF.toLocaleString()} FC
          </div>
          <div className="mt-2 text-[10px] text-emerald-700 font-semibold">
            {stats.grossRevenueUSD > 0
              ? `${((stats.grossMarginUSD / stats.grossRevenueUSD) * 100).toFixed(1)}% de marge`
              : '0%'}
          </div>
        </div>

        {/* Charges d'Exploitation */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Charges d'Exploitation</span>
          <div className="text-xl font-extrabold text-rose-700 tabular-nums mt-1">
            ${stats.operatingExpensesUSD.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 tabular-nums">
            {stats.operatingExpensesCDF.toLocaleString()} FC
          </div>
          <div className="mt-2 text-[10px] text-rose-700">Carburant groupe, fournitures, frais</div>
        </div>

        {/* Résultat Net Estimé */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Résultat Net Estimé</span>
          <div className={`text-xl font-extrabold tabular-nums mt-1 ${stats.netProfitUSD >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            ${stats.netProfitUSD.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 tabular-nums">
            {stats.netProfitCDF.toLocaleString()} FC
          </div>
          <div className="mt-2 text-[10px] font-bold text-slate-700">Solde d'exploitation</div>
        </div>
      </div>

      {/* Financial Ledger Journal Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900">Grand Livre &amp; Journal des Écritures</h2>
          </div>

          {/* Currency Presentation Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Affichage :</span>
            <div className="flex items-center bg-slate-100 rounded p-0.5">
              <button
                onClick={() => setSelectedCurrencyView('CONSOLIDATED')}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  selectedCurrencyView === 'CONSOLIDATED' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                }`}
              >
                Équivalent Consolidé
              </button>
              <button
                onClick={() => setSelectedCurrencyView('USD')}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  selectedCurrencyView === 'USD' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setSelectedCurrencyView('CDF')}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  selectedCurrencyView === 'CDF' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                }`}
              >
                CDF (FC)
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-y border-slate-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Date / Heure</th>
                <th className="py-2.5 px-3">Établissement</th>
                <th className="py-2.5 px-3">Catégorie</th>
                <th className="py-2.5 px-3">Libellé de l'Écriture</th>
                <th className="py-2.5 px-3">Devise Origine</th>
                <th className="py-2.5 px-3 text-right">Montant USD</th>
                <th className="py-2.5 px-3 text-right">Montant CDF</th>
                <th className="py-2.5 px-3">Auteur / Réf</th>
                <th className="py-2.5 px-3 text-center">Régularisation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.map((entry) => {
                const isContra = entry.amountUSD < 0;

                return (
                  <tr
                    key={entry.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isContra ? 'bg-rose-50/40 text-rose-900' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{entry.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{entry.establishmentName}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{entry.category}</td>
                    <td className="py-2.5 px-3 text-slate-900">
                      <div>{entry.description}</div>
                      {entry.reversalReason && (
                        <div className="text-[10px] text-rose-600 italic">Motif: {entry.reversalReason}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {entry.currencyOriginal}
                      </span>
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right tabular-nums font-bold ${
                        isContra ? 'text-rose-600' : entry.type === 'operating_expense' ? 'text-slate-700' : 'text-emerald-700'
                      }`}
                    >
                      ${entry.amountUSD.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-600 font-medium">
                      {entry.amountCDF.toLocaleString()} FC
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      <div>{entry.authorName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{entry.referenceDoc}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {!entry.isReversed && !isContra && (
                        <button
                          onClick={() => setReversingEntry(entry)}
                          className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Effectuer une contre-passation (annulation documentée)"
                        >
                          Contre-passer
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateExpense}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4"
          >
            <h3 className="font-bold text-base text-slate-900">Engager une Dépense d'Exploitation</h3>
            <p className="text-xs text-slate-500">
              Imputation directe au journal financier de : <strong>{currentEstablishment?.name}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Catégorie de Charge *</label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="Énergie & Générateur">Énergie &amp; Générateur (Gasoil / SNEL)</option>
                <option value="Fournitures de Caisse">Fournitures de Caisse &amp; Bureautique</option>
                <option value="Loyer Officine">Loyer Commercial Officine</option>
                <option value="Entretien & Hygiène">Entretien &amp; Nettoyage Médical</option>
                <option value="Frais de Sécurité & Gardiennage">Frais de Sécurité &amp; Gardiennage</option>
                <option value="Transport & Livraisons">Transport &amp; Livraisons Navette</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Motif *</label>
              <input
                type="text"
                required
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                placeholder="Ex: Achat 150L Gasoil pour générateur de secours"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Devise de Paiement *</label>
                <select
                  value={expenseCurrency}
                  onChange={(e) => setExpenseCurrency(e.target.value as Currency)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="CDF">CDF (FC)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Montant Décaissé *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">N° Pièce Justificative / Reçu</label>
              <input
                type="text"
                value={expenseRef}
                onChange={(e) => setExpenseRef(e.target.value)}
                placeholder="Ex: FACT-GEN-202611"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Enregistrer la Dépense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contra-entry / Reversal Modal */}
      {reversingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleExecuteReversal}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4"
          >
            <div className="flex items-center gap-2 text-amber-700 font-bold text-base">
              <RotateCcw className="w-5 h-5" />
              <span>Contre-Passation Comptable Documentée</span>
            </div>

            <p className="text-xs text-slate-600">
              Vous rectifiez l'écriture <strong>{reversingEntry.referenceDoc}</strong> ({reversingEntry.description})
              pour un montant de <strong>${reversingEntry.amountUSD.toFixed(2)} USD</strong>.
            </p>

            <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-xs">
              <strong>Règle d'intangibilité :</strong> L'écriture originale reste conservée dans le grand livre.
              Une écriture inverse de signe opposé sera générée pour annuler son impact financier, avec votre signature et motif.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Motif Obligatoire de la Régularisation *
              </label>
              <textarea
                rows={3}
                required
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder="Ex: Erreur d'imputation analytique / Facture fournisseur modifiée..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReversingEntry(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg cursor-pointer"
              >
                Générer la Contre-Écriture
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
