/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEW LOOK PHARMA — Site Public, Catalogue & Espace Patients
 */

import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext.tsx';
import { Product, TherapeuticCategory, GalenicForm } from '../../types/pharmacy.ts';
import {
  Search,
  Filter,
  Building2,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Clock,
  Phone,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Info,
  Truck,
  Package,
} from 'lucide-react';
import { Logo } from '../brand/Logo.tsx';

interface PublicPortalProps {
  onAddToCart: (product: Product, quantity: number) => void;
  onOpenPrescriptionModal: () => void;
  onViewOrderTracking: () => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  onAddToCart,
  onOpenPrescriptionModal,
  onViewOrderTracking,
}) => {
  const {
    products,
    establishments,
    getProductStock,
    formatMoney,
    toCDF,
    currentExchangeRate,
  } = usePharmacy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedForm, setSelectedForm] = useState<string>('all');
  const [filterPrescriptionOnly, setFilterPrescriptionOnly] = useState<boolean>(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);

  // Filtered catalogue
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.dci.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.dosage.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesForm = selectedForm === 'all' || p.form === selectedForm;
    const matchesRx = !filterPrescriptionOnly || p.isPrescriptionRequired;

    return matchesSearch && matchesCategory && matchesForm && matchesRx;
  });

  const categories: TherapeuticCategory[] = [
    'Antipaludiques',
    'Antibiotiques',
    'Antalgiques & Anti-inflammatoires',
    'Cardiovasculaire',
    'Gastro-entérologie',
    'Vitamines & Pédiatrie',
    'Matériel Médical & Soins',
    'Diabète & Métabolisme',
    'Pneumologie & Allergologie',
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-14 px-4 sm:px-6 rounded-2xl mx-4 sm:mx-6 shadow-xl border border-slate-700/60 mt-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="flex justify-center">
            <Logo size="lg" showText={false} />
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            NEW LOOK PHARMA &amp; EL MEDICAMED
          </h1>
          <p className="text-emerald-400 font-semibold text-lg italic">
            « Votre santé, notre priorité »
          </p>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Réseau pharmaceutique de référence en République Démocratique du Congo.
            Accédez à un catalogue certifié, vérifiez la disponibilité en temps réel dans nos officines à Kinshasa,
            et commandez avec retrait immédiat ou livraison sécurisée.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
            <button
              onClick={() => {
                const el = document.getElementById('catalogue-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg transition-colors shadow-md cursor-pointer text-white"
            >
              Consulter le Catalogue
            </button>
            <button
              onClick={onOpenPrescriptionModal}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 font-bold rounded-lg transition-colors cursor-pointer text-white flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              Déposer une Ordonnance
            </button>
            <button
              onClick={onViewOrderTracking}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 font-medium rounded-lg transition-colors cursor-pointer text-slate-200"
            >
              Suivre ma Commande
            </button>
          </div>
        </div>

        {/* Legal Regulatory Notice in DRC */}
        <div className="mt-8 pt-4 border-t border-slate-700/80 max-w-3xl mx-auto text-center text-[11px] text-slate-400">
          <p>
            Conformité Légale RDC : Les médicaments soumis à prescription médicale (Rx) ne sont pas délivrés automatiquement.
            Toute commande contenant ces produits est soumise au contrôle obligatoire et à l’approbation de nos pharmaciens habilités.
          </p>
        </div>
      </section>

      {/* Network Pharmacies List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Nos Établissements à Kinshasa</h2>
            <p className="text-xs text-slate-500">Chaque pharmacie dispose de son propre stock et de son équipe habilitée</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {establishments.map((est) => (
            <div
              key={est.id}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                    {est.isHeadquarters ? 'Structure Mère' : 'Extension'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">{est.commune}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{est.name}</h3>
                <div className="flex items-start gap-1.5 text-xs text-slate-500 mt-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                  <span className="line-clamp-2">{est.address}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{est.phone}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" /> 7j/7 · 24h/24
                </span>
                <span className="font-medium text-slate-700">Resp: {est.managerName.split(' ')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Catalogue & Search Section */}
      <section id="catalogue-section" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Catalogue des Médicaments & Produits</h2>
              <p className="text-xs text-slate-500">
                Recherche par nom commercial, DCI (Dénomination Commune Internationale), forme ou dosage
              </p>
            </div>

            {/* Quick Rx toggle */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterPrescriptionOnly}
                  onChange={(e) => setFilterPrescriptionOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Uniquement sur Ordonnance (Rx)</span>
              </label>
            </div>
          </div>

          {/* Search bar & filter tabs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher (ex: Coartem, Paracétamol, Amoxicilline, Oméprazole...)"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-medium border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="all">Toutes les Catégories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedForm}
                onChange={(e) => setSelectedForm(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-medium border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="all">Toutes les Formes</option>
                <option value="Comprimé">Comprimé</option>
                <option value="Sirop / Suspension">Sirop / Suspension</option>
                <option value="Gélule">Gélule</option>
                <option value="Injectable">Injectable</option>
                <option value="Pommade / Crème">Pommade / Crème</option>
                <option value="Solution pour perfusion">Solution pour perfusion</option>
                <option value="Spray / Inhalateur">Spray / Inhalateur</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
            <span>{filteredProducts.length} référence(s) pharmaceutique(s) trouvée(s)</span>
            <span className="text-[11px]">Taux officiel : 1 USD = {currentExchangeRate.toLocaleString()} CDF</span>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((prod) => {
              const totalNetworkStock = establishments.reduce(
                (sum, est) => sum + getProductStock(prod.id, est.id),
                0
              );

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-sm"
                >
                  <div>
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {prod.category} · {prod.form}
                      </span>
                      {prod.isPrescriptionRequired ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          Rx · Ordonnance
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          Vente Libre
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                      {prod.brandName}
                    </h3>

                    {/* DCI (Dénomination Commune Internationale) */}
                    <p className="text-xs text-slate-600 font-medium mt-1">
                      DCI : <span className="text-slate-800">{prod.dci}</span>
                    </p>

                    <div className="text-[11px] text-slate-500 mt-1">
                      Dosage : {prod.dosage} · Conditionnement : {prod.packaging}
                    </div>

                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>

                    {/* Stock availability breakdown per establishment */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-700 flex justify-between">
                        <span>Disponibilité en officine :</span>
                        <span className="tabular-nums font-semibold text-slate-900">
                          {totalNetworkStock} en stock réseau
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        {establishments.map((est) => {
                          const estStock = getProductStock(prod.id, est.id);
                          return (
                            <div
                              key={est.id}
                              className="flex items-center justify-between p-1 bg-slate-50 rounded border border-slate-100"
                            >
                              <span className="truncate max-w-[80px] text-slate-600">{est.commune}</span>
                              <span
                                className={`font-semibold tabular-nums ${
                                  estStock > 0 ? 'text-emerald-700' : 'text-slate-400'
                                }`}
                              >
                                {estStock > 0 ? `${estStock} dispo` : 'Épuisé'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-extrabold text-slate-900 tabular-nums">
                        ${prod.retailPriceUSD.toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-500 tabular-nums font-medium">
                        {toCDF(prod.retailPriceUSD).toLocaleString()} CDF
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProductDetails(prod)}
                        className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Détails posologiques et stockage"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onAddToCart(prod, 1)}
                        disabled={totalNetworkStock === 0}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          totalNetworkStock > 0
                            ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {totalNetworkStock > 0 ? 'Ajouter au Panier' : 'Rupture'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Details Modal */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-700">
                  {selectedProductDetails.category}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {selectedProductDetails.brandName}
                </h3>
                <p className="text-sm font-semibold text-slate-600">
                  DCI : {selectedProductDetails.dci}
                </p>
              </div>
              <button
                onClick={() => setSelectedProductDetails(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 border-y border-slate-100 py-3">
              <div>
                <span className="font-bold text-slate-900">Description &amp; Indication :</span>
                <p className="mt-0.5 text-slate-600 leading-relaxed">
                  {selectedProductDetails.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-bold text-slate-900">Forme &amp; Dosage :</span>
                  <p className="text-slate-600">
                    {selectedProductDetails.form} ({selectedProductDetails.dosage})
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-900">Conservation :</span>
                  <p className="text-slate-600">{selectedProductDetails.storageCondition}</p>
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-900">Statut Réglementaire RDC :</span>
                <p className="text-slate-600">
                  {selectedProductDetails.isPrescriptionRequired
                    ? 'Médicament soumis à prescription médicale obligatoire (Liste I ou II). Délivrance après validation du pharmacien.'
                    : 'Médicament disponible en vente libre au comptoir.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs text-slate-400">Prix unitaire</span>
                <div className="text-lg font-bold text-slate-900">
                  ${selectedProductDetails.retailPriceUSD.toFixed(2)} USD (
                  {toCDF(selectedProductDetails.retailPriceUSD).toLocaleString()} CDF)
                </div>
              </div>
              <button
                onClick={() => {
                  onAddToCart(selectedProductDetails, 1);
                  setSelectedProductDetails(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Ajouter au Panier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
