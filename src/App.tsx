/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEW LOOK PHARMA — Application Racine & Routage Multi-Espaces
 */

import React, { useState } from 'react';
import { PharmacyProvider, usePharmacy } from './context/PharmacyContext.tsx';
import { Header, ActiveTab } from './components/common/Header.tsx';
import { PublicPortal } from './components/public/PublicPortal.tsx';
import { PosTerminal } from './components/pos/PosTerminal.tsx';
import { InventoryManager } from './components/inventory/InventoryManager.tsx';
import { FinanceManager } from './components/finance/FinanceManager.tsx';
import { DirectorConsolidatedView } from './components/director/DirectorConsolidatedView.tsx';
import { PharmacistDashboard } from './components/pharmacist/PharmacistDashboard.tsx';
import { OrderPreparationView } from './components/orders/OrderPreparationView.tsx';
import { ExchangeRateModal } from './components/common/ExchangeRateModal.tsx';
import { AuthModal } from './components/common/AuthModal.tsx';
import { CartModal, CartItem } from './components/public/CartModal.tsx';
import { PrescriptionModal } from './components/public/PrescriptionModal.tsx';
import { OrderTrackingModal } from './components/public/OrderTrackingModal.tsx';
import { Product, OnlineOrder, Role } from './types/pharmacy.ts';
import { ShieldCheck, MapPin, Phone, Building2 } from 'lucide-react';
import { Logo } from './components/brand/Logo.tsx';

function MainApp() {
  const { currentUser, currentExchangeRate } = usePharmacy();

  const [activeTab, setActiveTab] = useState<ActiveTab>('public');
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [uploadedPrescriptionId, setUploadedPrescriptionId] = useState<string | undefined>();
  const [lastPlacedOrder, setLastPlacedOrder] = useState<OnlineOrder | null>(null);

  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setShowCartModal(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handlePrescriptionSubmitted = (prescriptionId: string) => {
    setUploadedPrescriptionId(prescriptionId);
  };

  const handleOrderSuccess = (order: OnlineOrder) => {
    setLastPlacedOrder(order);
  };

  // Route automatically based on user role when logging in
  const handleSuccessLogin = (role: Role) => {
    switch (role) {
      case 'AG1':
        setActiveTab('director');
        break;
      case 'CAISSIER':
        setActiveTab('pos');
        break;
      case 'GESTIONNAIRE_STOCK':
        setActiveTab('inventory');
        break;
      case 'COMPTABLE':
        setActiveTab('finance');
        break;
      case 'PHARMACIEN':
        setActiveTab('prescriptions');
        break;
      case 'PREPARATEUR':
        setActiveTab('preparation');
        break;
      case 'GERANT':
      case 'ADMIN_EXTENSION':
        setActiveTab('pos');
        break;
      default:
        setActiveTab('public');
    }
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExchangeModal={() => setShowExchangeModal(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        cartCount={totalCartCount}
        onOpenCart={() => setShowCartModal(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'public' && (
          <PublicPortal
            onAddToCart={handleAddToCart}
            onOpenPrescriptionModal={() => setShowPrescriptionModal(true)}
            onViewOrderTracking={() => setShowTrackingModal(true)}
          />
        )}

        {activeTab === 'pos' && <PosTerminal />}

        {activeTab === 'inventory' && <InventoryManager />}

        {activeTab === 'finance' && <FinanceManager />}

        {activeTab === 'director' && <DirectorConsolidatedView />}

        {activeTab === 'prescriptions' && <PharmacistDashboard />}

        {activeTab === 'preparation' && <OrderPreparationView />}
      </main>

      {/* Modals & Dialogs */}
      <ExchangeRateModal
        isOpen={showExchangeModal}
        onClose={() => setShowExchangeModal(false)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccessLogin={handleSuccessLogin}
      />

      <CartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOpenPrescriptionModal={() => {
          setShowCartModal(false);
          setShowPrescriptionModal(true);
        }}
        uploadedPrescriptionId={uploadedPrescriptionId}
        onOrderSuccess={handleOrderSuccess}
      />

      <PrescriptionModal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        onPrescriptionSubmitted={handlePrescriptionSubmitted}
      />

      <OrderTrackingModal
        isOpen={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
      />

      {/* Order Confirmed Success Notification Toast/Modal */}
      {lastPlacedOrder && (
        <div className="fixed bottom-6 right-6 z-50 bg-white rounded-xl shadow-2xl border border-emerald-500 p-4 max-w-sm animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase">
              <ShieldCheck className="w-4 h-4" /> Commande Enregistrée
            </div>
            <button
              onClick={() => setLastPlacedOrder(null)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-800 font-semibold mt-1">
            N° {lastPlacedOrder.orderNumber}
          </p>
          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
            Votre commande a été transmise à nos équipes pour préparation.
            Total : ${lastPlacedOrder.totalUSD.toFixed(2)} USD ({lastPlacedOrder.totalCDF.toLocaleString()} FC).
          </p>
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => {
                setLastPlacedOrder(null);
                setShowTrackingModal(true);
              }}
              className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Suivre le statut →
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-3">
            <Logo size="sm" showText={true} />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Plateforme centralisée multi-établissements du réseau NEW LOOK PHARMA &amp; NEW LOOK EL MEDICAMED à Kinshasa,
              République Démocratique du Congo.
            </p>
            <p className="text-[10px] text-slate-500">
              « Votre santé, notre priorité »
            </p>
          </div>

          {/* Col 2: Legal & Ethics in DRC */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Conformité &amp; Éthique RDC</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li>· Ordre National des Pharmaciens (ONP RDC)</li>
              <li>· Traçabilité des lots et respect strict du FEFO</li>
              <li>· Validation préalable obligatoire des ordonnances (Rx)</li>
              <li>· Pharmacovigilance et chaîne du froid certifiée</li>
            </ul>
          </div>

          {/* Col 3: Double Monnaie & Taux */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Régime Monétaire</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Double monnaie intégrale (USD et CDF). Chaque transaction conserve sa devise d'origine sans réécriture des
              écritures passées.
            </p>
            <div className="text-[11px] text-emerald-400 font-semibold tabular-nums">
              Taux en vigueur : 1 USD = {currentExchangeRate.toLocaleString()} CDF (BCC)
            </div>
          </div>

          {/* Col 4: Contacts Officines */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Siège &amp; Permanence</h4>
            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>14, Boulevard du 30 Juin, Gombe, Kinshasa</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>+243 81 500 1200 / +243 82 400 3344</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer underline"
              >
                Accès Professionnel / Portail Collaborateurs
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 mt-8 border-t border-slate-800 text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            © 2026 NEW LOOK PHARMA S.A.R.L. Tous droits réservés. Version 1.1 — République Démocratique du Congo.
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            Environnement de Production Sécurisé &amp; Conforme aux PRD / TAR
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <PharmacyProvider>
      <MainApp />
    </PharmacyProvider>
  );
}
