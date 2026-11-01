/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEW LOOK PHARMA — Header & Barre de Navigation Principale
 */

import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext.tsx';
import { Logo } from '../brand/Logo.tsx';
import {
  Bell,
  DollarSign,
  UserCheck,
  Building2,
  LogIn,
  LogOut,
  ShoppingCart,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';

export type ActiveTab =
  | 'public'
  | 'pos'
  | 'inventory'
  | 'finance'
  | 'director'
  | 'prescriptions'
  | 'preparation';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenExchangeModal: () => void;
  onOpenAuthModal: () => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenExchangeModal,
  onOpenAuthModal,
  cartCount,
  onOpenCart,
}) => {
  const {
    currentUser,
    logout,
    currentExchangeRate,
    displayCurrency,
    setDisplayCurrency,
    activeEstablishmentId,
    setActiveEstablishmentId,
    establishments,
    currentEstablishment,
    notifications,
    markNotificationRead,
  } = usePharmacy();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  // Determine allowed tabs based on user role (Deny by default rule)
  const canAccessPos =
    currentUser.role === 'AG1' ||
    currentUser.role === 'ADMIN_EXTENSION' ||
    currentUser.role === 'GERANT' ||
    currentUser.role === 'CAISSIER';

  const canAccessStock =
    currentUser.role === 'AG1' ||
    currentUser.role === 'ADMIN_EXTENSION' ||
    currentUser.role === 'GERANT' ||
    currentUser.role === 'GESTIONNAIRE_STOCK' ||
    currentUser.role === 'PHARMACIEN';

  const canAccessFinance =
    currentUser.role === 'AG1' ||
    currentUser.role === 'ADMIN_EXTENSION' ||
    currentUser.role === 'COMPTABLE';

  const canAccessDirector = currentUser.role === 'AG1';

  const canAccessPrescriptions =
    currentUser.role === 'AG1' || currentUser.role === 'PHARMACIEN';

  const canAccessPreparation =
    currentUser.role === 'AG1' ||
    currentUser.role === 'PREPARATEUR' ||
    currentUser.role === 'GERANT';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top Banner: Official Status Bar for Currency & Active Establishment Context */}
      <div className="bg-slate-900 text-slate-300 px-4 sm:px-6 py-1.5 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-slate-300">Établissement actif :</span>
            {currentUser.role === 'AG1' ? (
              <select
                value={activeEstablishmentId}
                onChange={(e) => setActiveEstablishmentId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="all">Réseau Entier (Vue Consolidée AG1)</option>
                {establishments.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.name} ({est.commune})
                  </option>
                ))}
              </select>
            ) : (
              <span className="font-semibold text-white">
                {currentEstablishment?.name} ({currentEstablishment?.commune})
              </span>
            )}
          </div>
        </div>

        {/* Currency status & Switcher */}
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={onOpenExchangeModal}
            className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Consulter ou ajuster le taux de change officiel"
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span className="tabular-nums font-semibold text-emerald-400">
              1 USD = {currentExchangeRate.toLocaleString()} CDF
            </span>
            <span className="text-[10px] text-slate-400">(Taux Officiel BCC)</span>
          </button>

          <div className="flex items-center bg-slate-800 rounded p-0.5 border border-slate-700">
            <button
              onClick={() => setDisplayCurrency('USD')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                displayCurrency === 'USD' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setDisplayCurrency('CDF')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                displayCurrency === 'CDF' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              CDF (FC)
            </button>
            <button
              onClick={() => setDisplayCurrency('BOTH')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                displayCurrency === 'BOTH' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bi-devise
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar (Clean 3-Zone Contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark & Emblem */}
        <div className="shrink-0 flex items-center cursor-pointer" onClick={() => setActiveTab('public')}>
          <Logo size="sm" showText={true} />
        </div>

        {/* Zone 2: Navigation Links (Single line, whitespace-nowrap) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold text-slate-600 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('public')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'public'
                ? 'bg-slate-100 text-slate-900 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Site Public
          </button>

          {canAccessPos && (
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'pos'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Caisse POS
            </button>
          )}

          {canAccessStock && (
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Stocks & FEFO
            </button>
          )}

          {canAccessFinance && (
            <button
              onClick={() => setActiveTab('finance')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'finance'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Finances
            </button>
          )}

          {canAccessDirector && (
            <button
              onClick={() => setActiveTab('director')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'director'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Direction AG1
            </button>
          )}

          {canAccessPrescriptions && (
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'prescriptions'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Ordonnances Rx
            </button>
          )}

          {canAccessPreparation && (
            <button
              onClick={() => setActiveTab('preparation')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'preparation'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Préparation Commandes
            </button>
          )}
        </nav>

        {/* Zone 3: Interactive Affordances (Cart, Notifications, User Profile) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Cart button */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Panier Client"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Centre de notifications réseau"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute 1.5 top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Alertes Réseau & Événements</span>
                  <span className="text-[10px] text-slate-500">{notifications.length} logs</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                        !n.read ? 'bg-slate-50/70 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900 text-[11px]">{n.title}</span>
                        <span className="text-[9px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Account Button & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 pl-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="leading-tight text-xs text-slate-900 truncate max-w-[120px]">{currentUser.name}</div>
                <div className="text-[9px] text-emerald-700 font-medium leading-none">{currentUser.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                  <div className="mt-1 text-[10px] text-emerald-700 font-semibold uppercase">
                    Rôle : {currentUser.role} · {currentUser.establishmentName}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenAuthModal();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    Changer d'utilisateur / Tester un Rôle
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenExchangeModal();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                    Taux de change & Devises
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                      setActiveTab('public');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Déconnexion (Mode Public)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
