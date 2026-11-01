/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEW LOOK PHARMA — Gestionnaire du Taux de Change Officiel (USD / CDF)
 */

import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext.tsx';
import { DollarSign, History, ShieldAlert, Check, X } from 'lucide-react';

interface ExchangeRateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExchangeRateModal: React.FC<ExchangeRateModalProps> = ({ isOpen, onClose }) => {
  const { currentExchangeRate, exchangeRateRecords, updateExchangeRate, currentUser } = usePharmacy();
  const [newRate, setNewRate] = useState<number>(currentExchangeRate);
  const [sourceValidation, setSourceValidation] = useState<string>('Banque Centrale du Congo (BCC) — Taux officiel');
  const [notes, setNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const canEditRate = currentUser.role === 'AG1' || currentUser.role === 'COMPTABLE';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRate || newRate <= 0) return;

    updateExchangeRate(newRate, sourceValidation, notes || 'Ajustement périodique du cours officiel');
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Taux de Change Réseau (USD / CDF)</h2>
              <p className="text-xs text-slate-500">Cadre monétaire officiel — République Démocratique du Congo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Rate Display */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Taux Officiel en Vigueur</span>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                1 USD = {currentExchangeRate.toLocaleString()} CDF (FC)
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Fixé par : {exchangeRateRecords[0]?.setBy} · {exchangeRateRecords[0]?.effectiveDate}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Source</span>
              <p className="text-xs font-semibold text-slate-700">{exchangeRateRecords[0]?.sourceValidation}</p>
            </div>
          </div>

          {/* Form for AG1 or Accountant */}
          {canEditRate ? (
            <form onSubmit={handleSubmit} className="space-y-4 border-t border-slate-100 pt-4">
              <div className="text-xs font-semibold text-slate-800">
                Mettre à jour le cours officiel du jour
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nouveau Taux (CDF pour 1 USD) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max="10000"
                    step="5"
                    value={newRate}
                    onChange={(e) => setNewRate(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Source Officielle de Validation *
                  </label>
                  <input
                    type="text"
                    value={sourceValidation}
                    onChange={(e) => setSourceValidation(e.target.value)}
                    required
                    placeholder="Ex: Banque Centrale du Congo (BCC)"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Justification / Note interne
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Alignement hebdomadaire sur le cours indicatif de la BCC"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Règle intangible d'intégrité comptable */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-amber-800 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>Règle de traçabilité version 1.1 :</strong> Chaque transaction conserve sa devise d'origine.
                  La mise à jour de ce taux s'applique aux opérations futures et aux conversions consolidées, mais ne réécrit
                  jamais les transactions passées.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSuccess}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                >
                  {isSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      Taux Enregistré !
                    </>
                  ) : (
                    'Valider le Nouveau Taux'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
              Seul l’Administrateur Général n°1 (AG1) ou le Responsable Finance est habilité à modifier le taux de change
              officiel du réseau.
            </div>
          )}

          {/* Historical Rate Log */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Historique des Taux Appliqués</span>
            </div>
            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 text-xs">
              {exchangeRateRecords.map((rec) => (
                <div key={rec.id} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 tabular-nums">1 USD = {rec.rate.toLocaleString()} CDF</div>
                    <div className="text-[11px] text-slate-500">
                      Fixé le {rec.effectiveDate} par {rec.setBy}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">{rec.sourceValidation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
