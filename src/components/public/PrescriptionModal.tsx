/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEW LOOK PHARMA — Dépôt Sécurisé d'Ordonnance Médicale
 */

import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext.tsx';
import {
  FileText,
  UploadCloud,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
  X,
  Stethoscope,
  Building,
} from 'lucide-react';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrescriptionSubmitted: (prescriptionId: string) => void;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  onPrescriptionSubmitted,
}) => {
  const { submitPrescription } = usePharmacy();

  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [hospitalOrClinic, setHospitalOrClinic] = useState('');
  const [doctorOrdreNational, setDoctorOrdreNational] = useState('');
  const [itemsRequestedText, setItemsRequestedText] = useState('');
  const [notes, setNotes] = useState('');
  const [fileSimulatedName, setFileSimulatedName] = useState<string>('ordonnance_medicale_scan.pdf');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !doctorName.trim()) return;

    setIsSubmitting(true);
    const items = itemsRequestedText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const id = submitPrescription({
      patientName,
      patientPhone: patientPhone || '+243 81 000 0000',
      doctorName,
      hospitalOrClinic: hospitalOrClinic || 'Hôpital / Clinique Kinshasa',
      doctorOrdreNational: doctorOrdreNational || 'CNOM-RDC-En cours',
      datePrescribed: new Date().toISOString().split('T')[0],
      itemsRequested: items.length > 0 ? items : ['Médicaments mentionnés sur le document'],
      notes,
    });

    setIsSubmitting(false);
    setSubmittedId(id);
    onPrescriptionSubmitted(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-sm text-slate-800">Dépôt d'Ordonnance Médicale</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {submittedId ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Ordonnance Transmise avec Succès !</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Votre prescription porte la référence <strong>{submittedId}</strong>.
                Elle a été envoyée au Dr. Patrick Tshilumba et aux pharmaciens habilités de NEW LOOK PHARMA pour contrôle de
                conformité réglementaire.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Fermer et Poursuivre
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>
                  <strong>Confidentialité médicale garantie :</strong> Vos données de prescription sont conservées de
                  manière sécurisée et sont accessibles uniquement par nos pharmaciens agréés en RDC.
                </span>
              </div>

              {/* Upload Document box */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100/70 transition-colors">
                <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                <div className="text-xs font-bold text-slate-800">
                  Document de Prescription (Photo ou Scan PDF)
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Fichier simulé : <span className="font-mono text-emerald-700">{fileSimulatedName}</span>
                </p>
                <label className="inline-block mt-2 px-3 py-1 bg-white border border-slate-300 text-[11px] font-semibold text-slate-700 rounded-md cursor-pointer hover:bg-slate-50">
                  Sélectionner un fichier
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFileSimulatedName(e.target.files[0].name);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Patient info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom du Patient *
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                    placeholder="Ex: Jean-Paul Kasongo"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Téléphone du Patient
                  </label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+243 81 900 7711"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Doctor info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Médecin Prescripteur *
                  </label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    required
                    placeholder="Ex: Dr. Blaise Ilunga"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hôpital ou Clinique
                  </label>
                  <input
                    type="text"
                    value={hospitalOrClinic}
                    onChange={(e) => setHospitalOrClinic(e.target.value)}
                    placeholder="Ex: Clinique Ngaliema / HGR Kinshasa"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Items / Details */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Médicaments prescrits &amp; Posologie indiquée
                </label>
                <textarea
                  rows={2}
                  value={itemsRequestedText}
                  onChange={(e) => setItemsRequestedText(e.target.value)}
                  placeholder="Ex: Augmentin 1g : 1 comp. matin et soir (7 jours)&#10;Ventoline spray : 2 bouffées au besoin"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Transmission...' : 'Envoyer pour Validation Pharmaceutique'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
