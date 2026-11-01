/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEW LOOK PHARMA — Portail de Connexion Unique & Contrôle d'Accès
 */

import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext.tsx';
import { User, Role } from '../../types/pharmacy.ts';
import { Lock, Mail, AlertCircle, X, Shield, CheckCircle2 } from 'lucide-react';
import { Logo } from '../brand/Logo.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: (role: Role) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccessLogin }) => {
  const { login, users, switchUser, currentUser } = usePharmacy();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    setTimeout(() => {
      // PRD compliance: Password check & neutral error message
      const res = login(email, password);
      setLoading(false);
      if (res.success) {
        const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
        if (u && onSuccessLogin) {
          onSuccessLogin(u.role);
        }
        onClose();
      } else {
        setErrorMessage(res.message || 'Identifiant ou mot de passe incorrect.');
      }
    }, 400);
  };

  const handleSelectDemoUser = (user: User) => {
    switchUser(user);
    if (onSuccessLogin) {
      onSuccessLogin(user.role);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-sm text-slate-800">Portail de Connexion Unique Sécurisé</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Logo brand */}
          <div className="flex flex-col items-center text-center">
            <Logo size="md" />
            <p className="text-xs text-slate-500 mt-2 max-w-sm">
              Authentification centralisée multi-sites pour les officines New Look Pharma & New Look El Medicamed.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Standard Login Form (Strict PRD rules: does not ask role, does not reveal role) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Identifiant ou Email Professionnel
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nom@newlookpharma.cd"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mot de Passe Sécurisé
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Connexion chiffrée SSL / Contrôle d’accès côté serveur selon le principe du moindre privilège.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? 'Vérification des droits...' : 'Se Connecter'}
            </button>
          </form>

          {/* Fast Persona Switcher for Evaluation & Demonstration */}
          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Profils de Test & Validation des Rôles (PRD)
              </span>
              <span className="text-[10px] text-slate-400">1-clic direct</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {users.map((u) => {
                const isActive = currentUser.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectDemoUser(u)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 truncate">{u.name}</span>
                        {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-medium">{u.role}</div>
                      <div className="text-[10px] text-slate-500 truncate">{u.establishmentName}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
