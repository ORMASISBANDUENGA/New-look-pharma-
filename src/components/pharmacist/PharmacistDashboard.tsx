/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEW LOOK PHARMA — Validation Pharmaceutique des Ordonnances Médicales
 */

import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext.tsx';
import { Prescription } from '../../types/pharmacy.ts';
import {
  Stethoscope,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Building,
  AlertTriangle,
  Search,
} from 'lucide-react';

export const PharmacistDashboard: React.FC = () => {
  const { prescriptions, reviewPrescription, currentUser, onlineOrders } = usePharmacy();

  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [pharmacistNotes, setPharmacistNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('pending_review');

  const filteredPrescriptions = prescriptions.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const handleApprove = (pId: string) => {
    reviewPrescription(pId, 'approved', pharmacistNotes || 'Prescription conforme, posologie validée.');
    setSelectedPrescription(null);
    setPharmacistNotes('');
  };

  const handleReject = (pId: string) => {
    if (!pharmacistNotes.trim()) {
      alert('Veuillez spécifier le motif pharmaceutique du rejet.');
      return;
    }
    reviewPrescription(pId, 'rejected', pharmacistNotes);
    setSelectedPrescription(null);
    setPharmacistNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase">
            <Stethoscope className="w-4 h-4" /> Contrôle Pharmaceutique &amp; Dispensation Sécurisée
          </div>
          <h1 className="font-extrabold text-slate-900 text-lg mt-0.5">
            Validation des Ordonnances &amp; Produits Réglementés (Rx)
          </h1>
          <p className="text-xs text-slate-500">
            Pharmacien habilité en service : <strong>{currentUser.name}</strong> · Ordre National des Pharmaciens (RDC)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-medium"
          >
            <option value="pending_review">En attente d'examen ({prescriptions.filter((p) => p.status === 'pending_review').length})</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Rejetées</option>
            <option value="all">Toutes les Prescriptions</option>
          </select>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Règle Déontologique &amp; Sanitaire en RDC :</strong> Le système ne se substitue jamais au pharmacien.
          Aucun médicament sous ordonnance (antibiotiques à large spectre, corticoïdes, psychotropes, insulines) ne peut être
          délivré au patient ou conditionné pour expédition sans examen préalable et validation formelle de l'ordonnance médicale.
        </div>
      </div>

      {/* Prescriptions Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-y border-slate-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Réf Ordonnance</th>
                <th className="py-2.5 px-3">Date Soumission</th>
                <th className="py-2.5 px-3">Patient &amp; Contact</th>
                <th className="py-2.5 px-3">Médecin Prescripteur</th>
                <th className="py-2.5 px-3">Établissement de Soins</th>
                <th className="py-2.5 px-3">Articles Demandés</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-3 text-right">Contrôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrescriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aucune ordonnance dans cette file d'attente.
                  </td>
                </tr>
              ) : (
                filteredPrescriptions.map((rx) => (
                  <tr key={rx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{rx.id}</td>
                    <td className="py-2.5 px-3 text-slate-500">{rx.dateUploaded}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{rx.patientName}</div>
                      <div className="text-[10px] text-slate-400">{rx.patientPhone}</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {rx.doctorName}
                      <div className="text-[10px] text-slate-400 font-mono">{rx.doctorOrdreNational}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{rx.hospitalOrClinic}</td>
                    <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">
                      {rx.itemsRequested.join(' · ')}
                    </td>
                    <td className="py-2.5 px-3">
                      {rx.status === 'pending_review' ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          En Attente
                        </span>
                      ) : rx.status === 'approved' ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Approuvée
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Rejetée
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedPrescription(rx);
                          setPharmacistNotes(rx.notes || '');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                      >
                        Examiner
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prescription Inspection Dialog */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-lg w-full space-y-4 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">RÉF : {selectedPrescription.id}</span>
                <h3 className="font-extrabold text-base text-slate-900">Examen Pharmaceutique de l'Ordonnance</h3>
              </div>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Simulated prescription scan viewer */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-800 border-b border-slate-200 pb-1">
                <span>Prescripteur : {selectedPrescription.doctorName}</span>
                <span className="font-mono text-[10px] text-slate-500">{selectedPrescription.doctorOrdreNational}</span>
              </div>
              <div className="text-slate-600">Structure médicale : {selectedPrescription.hospitalOrClinic}</div>
              <div className="text-slate-600">Patient : <strong>{selectedPrescription.patientName}</strong> (Tél: {selectedPrescription.patientPhone})</div>
              <div className="text-slate-600">Date de prescription : {selectedPrescription.datePrescribed}</div>

              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900">Médicaments Prescrits :</span>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-800">
                  {selectedPrescription.itemsRequested.map((it, idx) => (
                    <li key={idx}>{it}</li>
                  ))}
                </ul>
              </div>

              {selectedPrescription.notes && (
                <div className="pt-2 text-slate-500 italic">
                  Note du patient : "{selectedPrescription.notes}"
                </div>
              )}
            </div>

            {/* Pharmacist Review Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Observations Pharmaceutiques &amp; Posologie Validée *
                </label>
                <textarea
                  rows={3}
                  value={pharmacistNotes}
                  onChange={(e) => setPharmacistNotes(e.target.value)}
                  placeholder="Ex: Posologie vérifiée, absence d'interaction médicamenteuse, délivrance autorisée pour 7 jours..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {selectedPrescription.status !== 'pending_review' && (
                <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-600">
                  Décision déjà arrêtée le {selectedPrescription.validationDate} par Dr. {selectedPrescription.pharmacistName}.
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedPrescription(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Fermer
              </button>

              {selectedPrescription.status === 'pending_review' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleReject(selectedPrescription.id)}
                    className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer"
                  >
                    Rejeter l'Ordonnance
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedPrescription.id)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer shadow-xs"
                  >
                    Approuver la Délivrance
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
