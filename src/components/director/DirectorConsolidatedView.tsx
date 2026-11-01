/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEW LOOK PHARMA — Direction Générale & Consolidation Réseau (Espace AG1)
 */

import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext.tsx';
import { Establishment, Role, User } from '../../types/pharmacy.ts';
import {
  Building2,
  Users,
  Shield,
  Activity,
  DollarSign,
  TrendingUp,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Lock,
  UserPlus,
} from 'lucide-react';

export const DirectorConsolidatedView: React.FC = () => {
  const {
    establishments,
    createEstablishment,
    users,
    toggleUserStatus,
    createUser,
    auditLogs,
    currentExchangeRate,
    toCDF,
    sales,
    batches,
    financialEntries,
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'overview' | 'extensions' | 'users' | 'audit'>('overview');
  const [auditFilterSeverity, setAuditFilterSeverity] = useState<string>('all');
  const [auditSearch, setAuditSearch] = useState<string>('');

  // New Extension Modal
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [newEstName, setNewEstName] = useState('');
  const [newEstCode, setNewEstCode] = useState('');
  const [newEstCommune, setNewEstCommune] = useState('Ngaliema');
  const [newEstAddress, setNewEstAddress] = useState('');
  const [newEstPhone, setNewEstPhone] = useState('+243 ');
  const [newEstManager, setNewEstManager] = useState('');

  // New User Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<Role>('CAISSIER');
  const [userEstId, setUserEstId] = useState<string>(establishments[0]?.id || '');
  const [userPhone, setUserPhone] = useState('+243 ');

  // Network Totals (Without merging physical cash boxes or stocks!)
  const totalNetworkRevenueUSD = sales
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + s.totalUSD, 0);

  const totalNetworkStockValuationUSD = batches.reduce(
    (sum, b) => sum + b.quantity * b.purchaseCostUSD,
    0
  );

  const totalNetworkTransactions = sales.filter((s) => s.status === 'completed').length;

  const handleCreateNewExtension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEstName.trim() || !newEstCode.trim()) return;

    createEstablishment({
      name: newEstName,
      code: newEstCode.toUpperCase(),
      isHeadquarters: false,
      commune: newEstCommune,
      address: newEstAddress,
      phone: newEstPhone,
      status: 'active',
      managerName: newEstManager || 'À nommer',
    });

    setShowExtensionModal(false);
    setNewEstName('');
    setNewEstCode('');
    setNewEstAddress('');
    setNewEstManager('');
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    const est = establishments.find((e) => e.id === userEstId);

    createUser({
      name: userName,
      email: userEmail,
      role: userRole,
      establishmentId: userEstId,
      establishmentName: est?.name || 'Réseau New Look',
      status: 'active',
      phone: userPhone,
    });

    setShowUserModal(false);
    setUserName('');
    setUserEmail('');
  };

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSev = auditFilterSeverity === 'all' || log.severity === auditFilterSeverity;
    const matchesText =
      !auditSearch ||
      log.description.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.userName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.establishmentName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actionType.toLowerCase().includes(auditSearch.toLowerCase());
    return matchesSev && matchesText;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner AG1 */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" /> Espace Gouvernance &amp; Direction Générale
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Supervision Réseau NEW LOOK PHARMA
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Masis Banduenga (Administrateur Général n°1 / Propriétaire) · Vue consolidée de toutes les officines
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Taux Réseau Actuel</span>
            <div className="text-base font-extrabold text-emerald-400 tabular-nums">
              1 $ = {currentExchangeRate.toLocaleString()} FC
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Vue Consolidée Réseau
        </button>
        <button
          onClick={() => setActiveTab('extensions')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'extensions'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Établissements &amp; Extensions ({establishments.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Utilisateurs &amp; Permissions ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Registre d'Audit Inviolable ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Consolidated Network Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Global KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500">Chiffre d'Affaires Consolidé Réseau</span>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
                ${totalNetworkRevenueUSD.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-500 tabular-nums font-medium">
                {toCDF(totalNetworkRevenueUSD).toLocaleString()} CDF
              </div>
              <p className="text-[11px] text-emerald-700 mt-2 font-medium">
                {totalNetworkTransactions} transactions de vente validées
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500">Valeur Totale du Stock Réseau (CUMP)</span>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
                ${totalNetworkStockValuationUSD.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-500 tabular-nums font-medium">
                {toCDF(totalNetworkStockValuationUSD).toLocaleString()} CDF
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Réparti sur {establishments.length} officines à Kinshasa
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500">Autonomie Financière &amp; Caisses</span>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
                {establishments.length} Caisses Distinctes
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Principe Version 1.1 : Aucune fusion artificielle des caisses physiques
              </p>
              <div className="mt-2 text-[10px] text-emerald-700 font-bold uppercase">
                Séparation stricte respectée
              </div>
            </div>
          </div>

          {/* Breakdown per Pharmacy */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Performance &amp; Situation par Établissement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {establishments.map((est) => {
                const estSales = sales
                  .filter((s) => s.establishmentId === est.id && s.status === 'completed')
                  .reduce((sum, s) => sum + s.totalUSD, 0);

                const estBatches = batches.filter((b) => b.establishmentId === est.id);
                const estStockVal = estBatches.reduce((sum, b) => sum + b.quantity * b.purchaseCostUSD, 0);

                return (
                  <div key={est.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-500">{est.code}</span>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">
                        {est.isHeadquarters ? 'Structure Mère' : 'Extension'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{est.name}</h3>
                      <p className="text-[11px] text-slate-500">{est.commune} · Resp: {est.managerName}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ventes :</span>
                        <span className="font-bold tabular-nums text-slate-900">${estSales.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Valeur stock :</span>
                        <span className="font-semibold tabular-nums text-slate-800">${estStockVal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Trésorerie USD :</span>
                        <span className="font-bold tabular-nums text-emerald-700">${est.cashBalanceUSD.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Trésorerie CDF :</span>
                        <span className="font-bold tabular-nums text-emerald-700">
                          {est.cashBalanceCDF.toLocaleString()} FC
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Extensions Management */}
      {activeTab === 'extensions' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Réseau des Établissements &amp; Nouvelles Extensions</h2>
              <p className="text-xs text-slate-500">
                L'AG1 peut ajouter et superviser de nouvelles extensions sans recompiler l'application.
              </p>
            </div>
            <button
              onClick={() => setShowExtensionModal(true)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Créer une Extension
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Nom de l'Officine</th>
                  <th className="py-2.5 px-3">Commune</th>
                  <th className="py-2.5 px-3">Adresse Kinshasa</th>
                  <th className="py-2.5 px-3">Téléphone</th>
                  <th className="py-2.5 px-3">Responsable Nommé</th>
                  <th className="py-2.5 px-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {establishments.map((est) => (
                  <tr key={est.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{est.code}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {est.name}
                      {est.isHeadquarters && (
                        <span className="ml-2 text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          Siège
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{est.commune}</td>
                    <td className="py-2.5 px-3 text-slate-500">{est.address}</td>
                    <td className="py-2.5 px-3 text-slate-600">{est.phone}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{est.managerName}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {est.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Users & Roles Matrix */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Agents &amp; Matrice des Permissions (Deny by Default)</h2>
              <p className="text-xs text-slate-500">
                Gestion des comptes du personnel · Règle PRD : L'AG1 ne peut ni consulter ni modifier les mots de passe.
              </p>
            </div>
            <button
              onClick={() => setShowUserModal(true)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Créer un Compte Agent
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Nom &amp; Prénom</th>
                  <th className="py-2.5 px-3">Email Professionnel</th>
                  <th className="py-2.5 px-3">Rôle Attribué</th>
                  <th className="py-2.5 px-3">Établissement</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-3 text-right">Contrôle Accès</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{u.name}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{u.email}</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-800">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">{u.role}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{u.establishmentName}</td>
                    <td className="py-2.5 px-3 text-slate-500">{u.phone}</td>
                    <td className="py-2.5 px-3">
                      {u.status === 'active' ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Actif
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Suspendu
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {u.role !== 'AG1' && (
                        <button
                          onClick={() => toggleUserStatus(u.id, u.status === 'active' ? 'suspended' : 'active')}
                          className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                            u.status === 'active'
                              ? 'text-rose-700 hover:bg-rose-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspendre' : 'Réactiver'}
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

      {/* Tab 4: Inviolable Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Journal d'Audit Inviolable &amp; Traçabilité Complète</h2>
              <p className="text-xs text-slate-500">
                Historique certifié : Ventes, annulations, clôtures, écarts, ajustements, réceptions et créations d'agents.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <select
                value={auditFilterSeverity}
                onChange={(e) => setAuditFilterSeverity(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium"
              >
                <option value="all">Toutes les Gravités</option>
                <option value="info">Info</option>
                <option value="warning">Attention</option>
                <option value="critical">Critique</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Date / Heure</th>
                  <th className="py-2.5 px-3">Établissement</th>
                  <th className="py-2.5 px-3">Utilisateur</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Description Détaillée</th>
                  <th className="py-2.5 px-3 text-center">Niveau</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{log.establishmentName}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      {log.userName} <span className="text-[10px] text-slate-400 font-normal">({log.userRole})</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[10px] text-slate-900">{log.actionType}</td>
                    <td className="py-2.5 px-3 text-slate-800 max-w-md">{log.description}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                          log.severity === 'critical'
                            ? 'text-rose-700 bg-rose-50 border border-rose-200'
                            : log.severity === 'warning'
                            ? 'text-amber-700 bg-amber-50 border border-amber-200'
                            : 'text-slate-600 bg-slate-100'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Extension Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateNewExtension}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4"
          >
            <h3 className="font-bold text-base text-slate-900">Enregistrer une Nouvelle Extension Officine</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nom de l'Officine *</label>
              <input
                type="text"
                required
                value={newEstName}
                onChange={(e) => setNewEstName(e.target.value)}
                placeholder="Ex: NEW LOOK EL MEDICAMED — Ext. Kintambo"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Code Interne *</label>
                <input
                  type="text"
                  required
                  value={newEstCode}
                  onChange={(e) => setNewEstCode(e.target.value)}
                  placeholder="Ex: NLE-KIN-05"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Commune *</label>
                <select
                  value={newEstCommune}
                  onChange={(e) => setNewEstCommune(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Kintambo">Kintambo</option>
                  <option value="Ngaliema">Ngaliema</option>
                  <option value="Mont-Ngafula">Mont-Ngafula</option>
                  <option value="Masina">Masina</option>
                  <option value="Ndjili">Ndjili</option>
                  <option value="Lemba">Lemba</option>
                  <option value="Matete">Matete</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse Complète *</label>
              <input
                type="text"
                required
                value={newEstAddress}
                onChange={(e) => setNewEstAddress(e.target.value)}
                placeholder="Ex: 54, Avenue Kasa-Vubu, Réf. Magasin"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone Direct</label>
                <input
                  type="text"
                  value={newEstPhone}
                  onChange={(e) => setNewEstPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gérant / Responsable</label>
                <input
                  type="text"
                  value={newEstManager}
                  onChange={(e) => setNewEstManager(e.target.value)}
                  placeholder="Ex: Dr. Michel Kabasele"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExtensionModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Créer l'Extension
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New User Account Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateNewUser}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4"
          >
            <h3 className="font-bold text-base text-slate-900">Créer un Compte Agent Professionnel</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nom &amp; Prénom *</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ex: Clarisse Mutombo"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Professionnel *</label>
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="clarisse.mutombo@newlookpharma.cd"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rôle Attribué *</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as Role)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="ADMIN_EXTENSION">Admin Extension</option>
                  <option value="GERANT">Gérant d'officine</option>
                  <option value="PHARMACIEN">Pharmacien Habilité</option>
                  <option value="CAISSIER">Caissier / Vendeur</option>
                  <option value="GESTIONNAIRE_STOCK">Gestionnaire Stock</option>
                  <option value="COMPTABLE">Comptable / Finance</option>
                  <option value="PREPARATEUR">Préparateur Commandes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Établissement *</label>
                <select
                  value={userEstId}
                  onChange={(e) => setUserEstId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {establishments.map((est) => (
                    <option key={est.id} value={est.id}>
                      {est.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
              Conformément à la politique de sécurité, un lien d'initialisation de mot de passe sera envoyé à l'agent.
              L'AG1 ne manipule aucun mot de passe.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Créer l'Agent
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
