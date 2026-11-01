/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEW LOOK PHARMA — Contexte Métier & Moteur d'Opérations
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  Currency,
  Establishment,
  Product,
  BatchStock,
  SaleTransaction,
  OnlineOrder,
  Prescription,
  StockMovement,
  Supplier,
  PurchaseOrder,
  TransferOrder,
  CashSession,
  FinancialEntry,
  ExchangeRateRecord,
  AuditLog,
  User,
  SaleLineItem,
} from '../types/pharmacy.ts';
import {
  INITIAL_ESTABLISHMENTS,
  INITIAL_PRODUCTS,
  INITIAL_BATCH_STOCKS,
  INITIAL_SUPPLIERS,
  INITIAL_USERS,
  INITIAL_EXCHANGE_RATES,
  INITIAL_PRESCRIPTIONS,
  INITIAL_ONLINE_ORDERS,
  INITIAL_SALES,
  INITIAL_CASH_SESSIONS,
  INITIAL_FINANCIAL_ENTRIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_TRANSFERS,
} from '../data/initialData.ts';

export interface SystemNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  targetRole?: Role;
}

interface PharmacyContextType {
  // Current user & authentication
  currentUser: User;
  switchUser: (user: User) => void;
  login: (email: string, passwordHash?: string) => { success: boolean; message?: string };
  logout: () => void;

  // Establishments
  establishments: Establishment[];
  activeEstablishmentId: string; // 'all' for consolidated view, or an establishment ID
  setActiveEstablishmentId: (id: string) => void;
  currentEstablishment: Establishment | undefined;
  createEstablishment: (newEst: Omit<Establishment, 'id' | 'cashBalanceUSD' | 'cashBalanceCDF'>) => void;

  // Currency & Exchange Rate (USD & CDF)
  currentExchangeRate: number;
  exchangeRateRecords: ExchangeRateRecord[];
  updateExchangeRate: (newRate: number, sourceValidation: string, notes: string) => void;
  displayCurrency: 'USD' | 'CDF' | 'BOTH';
  setDisplayCurrency: (curr: 'USD' | 'CDF' | 'BOTH') => void;
  toCDF: (usd: number, customRate?: number) => number;
  toUSD: (cdf: number, customRate?: number) => number;
  formatMoney: (amountUSD: number, preferredCurrency?: 'USD' | 'CDF' | 'BOTH') => string;

  // Products & Stock
  products: Product[];
  batches: BatchStock[];
  stockMovements: StockMovement[];
  getProductStock: (productId: string, establishmentId?: string) => number;
  getProductBatches: (productId: string, establishmentId?: string) => BatchStock[];
  adjustStock: (batchId: string, delta: number, reason: string) => boolean;
  addProduct: (product: Omit<Product, 'id'>) => void;

  // Point of Sale & Cash Sessions
  sales: SaleTransaction[];
  cashSessions: CashSession[];
  currentCashSession: CashSession | undefined;
  openCashSession: (floatUSD: number, floatCDF: number) => void;
  closeCashSession: (countedUSD: number, countedCDF: number, discrepancyReason?: string) => void;
  processSale: (saleData: {
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    saleType: 'retail' | 'wholesale';
    items: {
      productId: string;
      batchId: string;
      quantity: number;
      unitPriceUSD: number;
      discountPercent: number;
    }[];
    paidAmountUSD: number;
    paidAmountCDF: number;
    currencyPaid: 'USD' | 'CDF' | 'SPLIT';
    paymentMethod: 'cash_usd' | 'cash_cdf' | 'mpesa' | 'airtel_money' | 'orange_money' | 'card' | 'credit';
  }) => { success: boolean; sale?: SaleTransaction; error?: string };
  cancelSale: (saleId: string, reason: string) => boolean;

  // Prescriptions & Online Orders
  prescriptions: Prescription[];
  onlineOrders: OnlineOrder[];
  submitPrescription: (data: Omit<Prescription, 'id' | 'status' | 'dateUploaded'>) => string;
  reviewPrescription: (prescriptionId: string, decision: 'approved' | 'rejected', notes?: string) => void;
  createOnlineOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryType: 'pickup' | 'delivery';
    pickupEstablishmentId?: string;
    deliveryAddress?: string;
    deliveryCommune?: string;
    prescriptionId?: string;
    items: { productId: string; quantity: number }[];
  }) => { success: boolean; order?: OnlineOrder; error?: string };
  updateOrderStatus: (orderId: string, newStatus: OnlineOrder['status']) => void;

  // Transfers & Purchases
  transfers: TransferOrder[];
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  createTransfer: (destEstId: string, items: { productId: string; batchNumber: string; quantity: number }[], notes?: string) => void;
  confirmReceiveTransfer: (transferId: string) => void;
  createPurchaseOrder: (supplierId: string, items: { productId: string; quantity: number; unitCostUSD: number }[], notes?: string) => void;
  receivePurchaseOrder: (poId: string, itemsWithBatches: { productId: string; quantity: number; batchNumber: string; expiryDate: string; unitCostUSD: number }[]) => void;

  // Finances & Management
  financialEntries: FinancialEntry[];
  addExpense: (category: string, description: string, amount: number, currency: Currency, referenceDoc: string) => void;
  reverseFinancialEntry: (entryId: string, reason: string) => void;

  // Audit & Notifications
  auditLogs: AuditLog[];
  notifications: SystemNotification[];
  markNotificationRead: (id: string) => void;
  users: User[];
  toggleUserStatus: (userId: string, newStatus: 'active' | 'suspended') => void;
  createUser: (user: Omit<User, 'id'>) => void;
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence state
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('nlp_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(users[0]); // Default to AG1

  const [establishments, setEstablishments] = useState<Establishment[]>(() => {
    const saved = localStorage.getItem('nlp_establishments');
    return saved ? JSON.parse(saved) : INITIAL_ESTABLISHMENTS;
  });

  // Active establishment context
  const [activeEstablishmentId, setActiveEstablishmentId] = useState<string>(() => {
    return currentUser.role === 'AG1' ? 'all' : currentUser.establishmentId;
  });

  const [exchangeRateRecords, setExchangeRateRecords] = useState<ExchangeRateRecord[]>(() => {
    const saved = localStorage.getItem('nlp_exchange_rates');
    return saved ? JSON.parse(saved) : INITIAL_EXCHANGE_RATES;
  });

  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'CDF' | 'BOTH'>('BOTH');

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nlp_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [batches, setBatches] = useState<BatchStock[]>(() => {
    const saved = localStorage.getItem('nlp_batches');
    return saved ? JSON.parse(saved) : INITIAL_BATCH_STOCKS;
  });

  const [sales, setSales] = useState<SaleTransaction[]>(() => {
    const saved = localStorage.getItem('nlp_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [cashSessions, setCashSessions] = useState<CashSession[]>(() => {
    const saved = localStorage.getItem('nlp_cash_sessions');
    return saved ? JSON.parse(saved) : INITIAL_CASH_SESSIONS;
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('nlp_prescriptions');
    return saved ? JSON.parse(saved) : INITIAL_PRESCRIPTIONS;
  });

  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>(() => {
    const saved = localStorage.getItem('nlp_online_orders');
    return saved ? JSON.parse(saved) : INITIAL_ONLINE_ORDERS;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem('nlp_movements');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_MOVEMENTS;
  });

  const [suppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('nlp_purchases');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [transfers, setTransfers] = useState<TransferOrder[]>(() => {
    const saved = localStorage.getItem('nlp_transfers');
    return saved ? JSON.parse(saved) : INITIAL_TRANSFERS;
  });

  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>(() => {
    const saved = localStorage.getItem('nlp_finances');
    return saved ? JSON.parse(saved) : INITIAL_FINANCIAL_ENTRIES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('nlp_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'notif-1',
      timestamp: 'Aujourd’hui 11:30',
      title: 'Vente Gros Enregistrée',
      message: 'Vente gros N° TKT-HQ-20261101-042 validée pour 179.55 USD à Gombe.',
      severity: 'info',
      read: false,
    },
    {
      id: 'notif-2',
      timestamp: 'Aujourd’hui 10:05',
      title: 'Prescription Validée',
      message: 'Dr. Patrick Tshilumba a validé l’ordonnance pour la commande CMD-WEB-1029.',
      severity: 'info',
      read: false,
    },
    {
      id: 'notif-3',
      timestamp: 'Aujourd’hui 08:30',
      title: 'Transfert en Transit',
      message: 'Transfert TRF-HQ-VIC-001 (15 Augmentin 1g) expédié vers Victoire.',
      severity: 'info',
      read: false,
    },
  ]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('nlp_establishments', JSON.stringify(establishments));
  }, [establishments]);

  useEffect(() => {
    localStorage.setItem('nlp_batches', JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem('nlp_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('nlp_finances', JSON.stringify(financialEntries));
  }, [financialEntries]);

  useEffect(() => {
    localStorage.setItem('nlp_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('nlp_exchange_rates', JSON.stringify(exchangeRateRecords));
  }, [exchangeRateRecords]);

  useEffect(() => {
    localStorage.setItem('nlp_online_orders', JSON.stringify(onlineOrders));
  }, [onlineOrders]);

  useEffect(() => {
    localStorage.setItem('nlp_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem('nlp_users', JSON.stringify(users));
  }, [users]);

  // Update active establishment when user switches
  const switchUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'AG1') {
      setActiveEstablishmentId('all');
    } else {
      setActiveEstablishmentId(user.establishmentId);
    }
  };

  const login = (email: string): { success: boolean; message?: string } => {
    const trimmed = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === trimmed);
    if (!found) {
      // PRD Requirement: The error message must NOT reveal whether the account exists
      return { success: false, message: 'Identifiant ou mot de passe incorrect.' };
    }
    if (found.status === 'suspended') {
      return { success: false, message: 'Compte suspendu par l’Administrateur Général. Contactez la direction.' };
    }
    switchUser(found);
    addAuditLog('LOGIN', `Connexion de l’utilisateur ${found.name} (${found.role})`, 'info', {
      userId: found.id,
      establishmentId: found.establishmentId,
    });
    return { success: true };
  };

  const logout = () => {
    const clientUser = users.find((u) => u.role === 'CLIENT') || users[users.length - 1];
    switchUser(clientUser);
  };

  // Current exchange rate
  const currentExchangeRate = exchangeRateRecords[0]?.rate || 2850;

  // Rate helpers
  const toCDF = (usd: number, customRate?: number): number => {
    const rate = customRate || currentExchangeRate;
    return Math.round(usd * rate);
  };

  const toUSD = (cdf: number, customRate?: number): number => {
    const rate = customRate || currentExchangeRate;
    return Number((cdf / rate).toFixed(2));
  };

  const formatMoney = (amountUSD: number, preferredCurrency?: 'USD' | 'CDF' | 'BOTH'): string => {
    const pref = preferredCurrency || displayCurrency;
    const cdfValue = toCDF(amountUSD);
    const usdFormatted = `$${amountUSD.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const cdfFormatted = `${cdfValue.toLocaleString('fr-FR')} FC`;

    if (pref === 'USD') return usdFormatted;
    if (pref === 'CDF') return cdfFormatted;
    return `${usdFormatted} (${cdfFormatted})`;
  };

  const updateExchangeRate = (newRate: number, sourceValidation: string, notes: string) => {
    const newRecord: ExchangeRateRecord = {
      id: `rate-${Date.now()}`,
      rate: newRate,
      effectiveDate: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      setBy: `${currentUser.name} (${currentUser.role})`,
      sourceValidation,
      notes,
    };

    setExchangeRateRecords([newRecord, ...exchangeRateRecords]);

    addAuditLog(
      'RATE_CHANGE',
      `Mise à jour du taux officiel de change : 1 USD = ${newRate.toLocaleString()} CDF. Source: ${sourceValidation}`,
      'warning',
      { previousRate: currentExchangeRate, newRate }
    );

    addNotification(
      'Nouveau Taux de Change Réseau',
      `Le taux de conversion officiel est désormais de 1 USD = ${newRate.toLocaleString()} CDF. Validé par ${currentUser.name}.`,
      'info'
    );
  };

  // Current active establishment
  const currentEstablishment =
    activeEstablishmentId === 'all'
      ? establishments.find((e) => e.isHeadquarters) || establishments[0]
      : establishments.find((e) => e.id === activeEstablishmentId) || establishments[0];

  const createEstablishment = (newEst: Omit<Establishment, 'id' | 'cashBalanceUSD' | 'cashBalanceCDF'>) => {
    const id = `est-ext-${Date.now()}`;
    const fullEst: Establishment = {
      ...newEst,
      id,
      cashBalanceUSD: 0,
      cashBalanceCDF: 0,
    };
    setEstablishments([...establishments, fullEst]);

    addAuditLog(
      'EXTENSION_CREATE',
      `Création de la nouvelle extension pharmaceutique "${fullEst.name}" (${fullEst.commune})`,
      'critical',
      { establishmentId: id }
    );

    addNotification(
      'Nouvelle Extension Réseau',
      `L’extension ${fullEst.name} a été enregistrée avec succès sous la direction de ${fullEst.managerName}.`,
      'info'
    );
  };

  // Stock helpers
  const getProductStock = (productId: string, estId?: string): number => {
    const targetEst = estId || (activeEstablishmentId === 'all' ? undefined : activeEstablishmentId);
    return batches
      .filter((b) => b.productId === productId && (!targetEst || b.establishmentId === targetEst))
      .filter((b) => b.status !== 'expired' && b.status !== 'quarantine')
      .reduce((sum, b) => sum + b.quantity, 0);
  };

  const getProductBatches = (productId: string, estId?: string): BatchStock[] => {
    const targetEst = estId || (activeEstablishmentId === 'all' ? undefined : activeEstablishmentId);
    return batches
      .filter((b) => b.productId === productId && (!targetEst || b.establishmentId === targetEst))
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  };

  const adjustStock = (batchId: string, delta: number, reason: string): boolean => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return false;
    if (batch.quantity + delta < 0) return false;

    const prod = products.find((p) => p.id === batch.productId);
    const est = establishments.find((e) => e.id === batch.establishmentId);

    const updated = batches.map((b) => {
      if (b.id === batchId) {
        const newQty = b.quantity + delta;
        return { ...b, quantity: newQty };
      }
      return b;
    });
    setBatches(updated);

    // Record stock movement
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      establishmentId: batch.establishmentId,
      establishmentName: est?.name || '',
      productId: batch.productId,
      productName: prod?.brandName || '',
      batchNumber: batch.batchNumber,
      type: 'inventory_adjustment',
      quantityDelta: delta,
      balanceAfter: batch.quantity + delta,
      costUSD: batch.purchaseCostUSD,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      documentRef: `ADJ-${Date.now()}`,
      reason,
    };
    setStockMovements([movement, ...stockMovements]);

    addAuditLog(
      'STOCK_ADJUSTMENT',
      `Ajustement stock sur ${prod?.brandName} (Lot ${batch.batchNumber}) : ${delta > 0 ? '+' : ''}${delta} unités. Motif: ${reason}`,
      Math.abs(delta) > 10 ? 'warning' : 'info',
      { batchId, delta, reason }
    );

    return true;
  };

  const addProduct = (prod: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...prod,
      id: `prod-${Date.now()}`,
    };
    setProducts([...products, newProduct]);
    addAuditLog('STOCK_ADJUSTMENT', `Création du nouveau produit au catalogue : ${newProduct.brandName} (${newProduct.dci})`, 'info');
  };

  // Cash Session Management
  const currentCashSession = cashSessions.find(
    (cs) => cs.establishmentId === currentEstablishment?.id && cs.status === 'open'
  );

  const openCashSession = (floatUSD: number, floatCDF: number) => {
    if (!currentEstablishment) return;
    const session: CashSession = {
      id: `cs-${Date.now()}`,
      establishmentId: currentEstablishment.id,
      establishmentName: currentEstablishment.name,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      openedAt: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      openingFloatUSD: floatUSD,
      openingFloatCDF: floatCDF,
      expectedCashUSD: floatUSD,
      expectedCashCDF: floatCDF,
      status: 'open',
    };
    setCashSessions([session, ...cashSessions]);

    addAuditLog(
      'LOGIN',
      `Ouverture de caisse par ${currentUser.name} à ${currentEstablishment.name}. Fond: $${floatUSD} / ${floatCDF.toLocaleString()} FC`,
      'info'
    );
  };

  const closeCashSession = (countedUSD: number, countedCDF: number, discrepancyReason?: string) => {
    if (!currentCashSession) return;
    const discUSD = countedUSD - currentCashSession.expectedCashUSD;
    const discCDF = countedCDF - currentCashSession.expectedCashCDF;
    const hasDiscrepancy = Math.abs(discUSD) > 0.05 || Math.abs(discCDF) > 500;

    const updated = cashSessions.map((cs) => {
      if (cs.id === currentCashSession.id) {
        return {
          ...cs,
          closedAt: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
          countedCashUSD: countedUSD,
          countedCashCDF: countedCDF,
          discrepancyUSD: discUSD,
          discrepancyCDF: discCDF,
          discrepancyReason: discrepancyReason || (hasDiscrepancy ? 'Écart constaté' : 'Conforme'),
          status: 'closed' as const,
        };
      }
      return cs;
    });
    setCashSessions(updated);

    if (hasDiscrepancy) {
      addAuditLog(
        'CASH_DISCREPANCY',
        `ÉCART DE CAISSE à la clôture (${currentCashSession.establishmentName}) : USD ${discUSD > 0 ? '+' : ''}${discUSD.toFixed(2)}$, CDF ${discCDF > 0 ? '+' : ''}${discCDF.toLocaleString()} FC. Motif: ${discrepancyReason || 'Non spécifié'}`,
        'critical',
        { discUSD, discCDF, cashier: currentUser.name }
      );
      addNotification(
        'Alerte Écart de Caisse Clôture',
        `Un écart de caisse a été enregistré à ${currentCashSession.establishmentName} par ${currentUser.name}.`,
        'critical'
      );
    } else {
      addAuditLog(
        'LOGIN',
        `Clôture de caisse conforme par ${currentUser.name} à ${currentCashSession.establishmentName}.`,
        'info'
      );
    }
  };

  // Process POS Sale
  const processSale = (saleData: {
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    saleType: 'retail' | 'wholesale';
    items: {
      productId: string;
      batchId: string;
      quantity: number;
      unitPriceUSD: number;
      discountPercent: number;
    }[];
    paidAmountUSD: number;
    paidAmountCDF: number;
    currencyPaid: 'USD' | 'CDF' | 'SPLIT';
    paymentMethod: 'cash_usd' | 'cash_cdf' | 'mpesa' | 'airtel_money' | 'orange_money' | 'card' | 'credit';
  }): { success: boolean; sale?: SaleTransaction; error?: string } => {
    if (!currentEstablishment) {
      return { success: false, error: 'Aucun établissement sélectionné.' };
    }

    // 1. Stock check & FEFO verification
    for (const item of saleData.items) {
      const batch = batches.find((b) => b.id === item.batchId);
      const prod = products.find((p) => p.id === item.productId);
      if (!batch || batch.quantity < item.quantity) {
        return {
          success: false,
          error: `Stock insuffisant pour le produit "${prod?.brandName}". Quantité disponible dans ce lot: ${batch?.quantity || 0}`,
        };
      }
      if (batch.status === 'expired') {
        return {
          success: false,
          error: `Le lot ${batch.batchNumber} de "${prod?.brandName}" est périmé. Vente strictement bloquée !`,
        };
      }
    }

    // 2. Build Sale Line Items
    const appliedRate = currentExchangeRate;
    let subtotalUSD = 0;
    let discountUSD = 0;
    let taxUSD = 0;

    const lineItems: SaleLineItem[] = saleData.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId)!;
      const batch = batches.find((b) => b.id === it.batchId)!;
      const gross = it.quantity * it.unitPriceUSD;
      const disc = (gross * it.discountPercent) / 100;
      const net = gross - disc;
      const tax = net * (prod.taxRate || 0);
      const lineTotal = net + tax;

      subtotalUSD += gross;
      discountUSD += disc;
      taxUSD += tax;

      return {
        productId: prod.id,
        productName: prod.brandName,
        dci: prod.dci,
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        quantity: it.quantity,
        unitPriceUSD: it.unitPriceUSD,
        unitPriceCDF: toCDF(it.unitPriceUSD, appliedRate),
        discountPercent: it.discountPercent,
        taxPercent: (prod.taxRate || 0) * 100,
        lineTotalUSD: Number(lineTotal.toFixed(2)),
        lineTotalCDF: toCDF(lineTotal, appliedRate),
        isPrescriptionRequired: prod.isPrescriptionRequired,
      };
    });

    const totalUSD = Number((subtotalUSD - discountUSD + taxUSD).toFixed(2));
    const totalCDF = toCDF(totalUSD, appliedRate);

    // Compute change
    let changeUSD = 0;
    let changeCDF = 0;
    if (saleData.currencyPaid === 'USD') {
      changeUSD = Number(Math.max(0, saleData.paidAmountUSD - totalUSD).toFixed(2));
    } else if (saleData.currencyPaid === 'CDF') {
      changeCDF = Math.max(0, saleData.paidAmountCDF - totalCDF);
    }

    const saleId = `sale-${Date.now()}`;
    const receiptNumber = `TKT-${currentEstablishment.code}-${Date.now().toString().slice(-6)}`;

    const newSale: SaleTransaction = {
      id: saleId,
      receiptNumber,
      establishmentId: currentEstablishment.id,
      establishmentName: currentEstablishment.name,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      customerId: saleData.customerId,
      customerName: saleData.customerName || 'Client Comptoir',
      customerPhone: saleData.customerPhone,
      date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      saleType: saleData.saleType,
      items: lineItems,
      subtotalUSD: Number(subtotalUSD.toFixed(2)),
      subtotalCDF: toCDF(subtotalUSD, appliedRate),
      discountUSD: Number(discountUSD.toFixed(2)),
      taxUSD: Number(taxUSD.toFixed(2)),
      totalUSD,
      totalCDF,
      paidAmountUSD: saleData.paidAmountUSD,
      paidAmountCDF: saleData.paidAmountCDF,
      currencyPaid: saleData.currencyPaid,
      paymentMethod: saleData.paymentMethod,
      changeGivenUSD: changeUSD,
      changeGivenCDF: changeCDF,
      appliedRateUSD_CDF: appliedRate,
      status: 'completed',
    };

    // 3. Decrement batches and record stock movements
    const updatedBatches = [...batches];
    const newMovements: StockMovement[] = [];

    for (const item of saleData.items) {
      const idx = updatedBatches.findIndex((b) => b.id === item.batchId);
      if (idx !== -1) {
        const currentBatch = updatedBatches[idx];
        const newQty = currentBatch.quantity - item.quantity;
        updatedBatches[idx] = { ...currentBatch, quantity: newQty };

        const prod = products.find((p) => p.id === item.productId);
        newMovements.push({
          id: `mov-${Date.now()}-${item.batchId}`,
          date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
          establishmentId: currentEstablishment.id,
          establishmentName: currentEstablishment.name,
          productId: item.productId,
          productName: prod?.brandName || '',
          batchNumber: currentBatch.batchNumber,
          type: 'sale',
          quantityDelta: -item.quantity,
          balanceAfter: newQty,
          costUSD: currentBatch.purchaseCostUSD,
          authorName: currentUser.name,
          authorRole: currentUser.role,
          documentRef: receiptNumber,
        });
      }
    }

    setBatches(updatedBatches);
    setStockMovements([...newMovements, ...stockMovements]);
    setSales([newSale, ...sales]);

    // 4. Update Cash Session expected amounts
    if (currentCashSession) {
      const updatedSessions = cashSessions.map((cs) => {
        if (cs.id === currentCashSession.id) {
          return {
            ...cs,
            expectedCashUSD:
              cs.expectedCashUSD +
              (saleData.currencyPaid === 'USD' ? totalUSD : 0),
            expectedCashCDF:
              cs.expectedCashCDF +
              (saleData.currencyPaid === 'CDF' ? totalCDF : 0),
          };
        }
        return cs;
      });
      setCashSessions(updatedSessions);
    }

    // 5. Financial Journal Entry
    const financialEntry: FinancialEntry = {
      id: `fin-${Date.now()}`,
      establishmentId: currentEstablishment.id,
      establishmentName: currentEstablishment.name,
      date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      type: 'sale',
      category: saleData.saleType === 'wholesale' ? 'Vente en Gros' : 'Vente Comptoir Détail',
      description: `Encaissement Ticket ${receiptNumber} (${saleData.customerName || 'Client'})`,
      amountUSD: totalUSD,
      amountCDF: totalCDF,
      currencyOriginal: saleData.currencyPaid === 'CDF' ? 'CDF' : 'USD',
      appliedRate,
      authorName: currentUser.name,
      referenceDoc: receiptNumber,
    };
    setFinancialEntries([financialEntry, ...financialEntries]);

    // 6. Audit & Notification
    addAuditLog(
      'SALE',
      `Vente ${saleData.saleType} enregistrée (${receiptNumber}) par ${currentUser.name} pour $${totalUSD} (${totalCDF.toLocaleString()} FC). Paiement: ${saleData.paymentMethod}`,
      'info',
      { saleId, totalUSD, totalCDF }
    );

    if (totalUSD > 100) {
      addNotification(
        'Transaction de Vente Importante',
        `Une vente de ${formatMoney(totalUSD)} a été validée à ${currentEstablishment.name} par ${currentUser.name}.`,
        'info'
      );
    }

    return { success: true, sale: newSale };
  };

  const cancelSale = (saleId: string, reason: string): boolean => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale || sale.status !== 'completed') return false;

    // Strict Accounting Rule: Do not physically delete. Cancel by contra-entry & reverse stock!
    const updatedSales = sales.map((s) => {
      if (s.id === saleId) {
        return {
          ...s,
          status: 'cancelled' as const,
          cancellationReason: reason,
        };
      }
      return s;
    });
    setSales(updatedSales);

    // Re-credit batches
    const updatedBatches = [...batches];
    const newMovements: StockMovement[] = [];

    for (const item of sale.items) {
      const idx = updatedBatches.findIndex((b) => b.id === item.batchId);
      if (idx !== -1) {
        const currentBatch = updatedBatches[idx];
        const restoredQty = currentBatch.quantity + item.quantity;
        updatedBatches[idx] = { ...currentBatch, quantity: restoredQty };

        newMovements.push({
          id: `mov-${Date.now()}-${item.batchId}`,
          date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
          establishmentId: sale.establishmentId,
          establishmentName: sale.establishmentName,
          productId: item.productId,
          productName: item.productName,
          batchNumber: currentBatch.batchNumber,
          type: 'inventory_adjustment',
          quantityDelta: item.quantity,
          balanceAfter: restoredQty,
          costUSD: currentBatch.purchaseCostUSD,
          authorName: currentUser.name,
          authorRole: currentUser.role,
          documentRef: `ANNUL-${sale.receiptNumber}`,
          reason: `Annulation vente ticket ${sale.receiptNumber} : ${reason}`,
        });
      }
    }
    setBatches(updatedBatches);
    setStockMovements([...newMovements, ...stockMovements]);

    // Financial contra-entry (negative or refund)
    const refundEntry: FinancialEntry = {
      id: `fin-annul-${Date.now()}`,
      establishmentId: sale.establishmentId,
      establishmentName: sale.establishmentName,
      date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      type: 'refund',
      category: 'Annulation Vente',
      description: `Contre-passation annulation ${sale.receiptNumber}. Motif: ${reason}`,
      amountUSD: -sale.totalUSD,
      amountCDF: -sale.totalCDF,
      currencyOriginal: sale.currencyPaid === 'CDF' ? 'CDF' : 'USD',
      appliedRate: sale.appliedRateUSD_CDF,
      authorName: currentUser.name,
      referenceDoc: `ANNUL-${sale.receiptNumber}`,
    };
    setFinancialEntries([refundEntry, ...financialEntries]);

    addAuditLog(
      'CANCELLATION',
      `ANNULATION de la vente ${sale.receiptNumber} par ${currentUser.name}. Motif obligatoire: ${reason}. Montant: $${sale.totalUSD}`,
      'critical',
      { saleId, reason }
    );

    addNotification(
      'Annulation de Vente',
      `Le ticket ${sale.receiptNumber} a été annulé par ${currentUser.name}. Motif: ${reason}`,
      'warning'
    );

    return true;
  };

  // Prescription Management
  const submitPrescription = (data: Omit<Prescription, 'id' | 'status' | 'dateUploaded'>): string => {
    const id = `rx-${Date.now()}`;
    const newPrescription: Prescription = {
      ...data,
      id,
      status: 'pending_review',
      dateUploaded: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
    };
    setPrescriptions([newPrescription, ...prescriptions]);

    addAuditLog(
      'PRESCRIPTION_VALIDATION',
      `Nouvelle ordonnance soumise pour le patient ${data.patientName} (Prescripteur: ${data.doctorName}). En attente du pharmacien.`,
      'info',
      { prescriptionId: id }
    );

    addNotification(
      'Nouvelle Ordonnance à Valider',
      `Ordonnance déposée pour ${data.patientName}. Nécessite l’approbation d'un pharmacien habilité.`,
      'info',
      'PHARMACIEN'
    );

    return id;
  };

  const reviewPrescription = (prescriptionId: string, decision: 'approved' | 'rejected', notes?: string) => {
    const updated = prescriptions.map((p) => {
      if (p.id === prescriptionId) {
        return {
          ...p,
          status: decision === 'approved' ? ('approved' as const) : ('rejected' as const),
          pharmacistReviewerId: currentUser.id,
          pharmacistName: currentUser.name,
          validationDate: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
          notes: notes || p.notes,
          rejectionReason: decision === 'rejected' ? notes : undefined,
        };
      }
      return p;
    });
    setPrescriptions(updated);

    const rx = prescriptions.find((p) => p.id === prescriptionId);

    addAuditLog(
      'PRESCRIPTION_VALIDATION',
      `Décision pharmaceutique sur l’ordonnance ${prescriptionId} par ${currentUser.name} : ${decision.toUpperCase()}. ${notes ? 'Observations: ' + notes : ''}`,
      decision === 'approved' ? 'info' : 'warning',
      { prescriptionId, decision }
    );

    addNotification(
      decision === 'approved' ? 'Ordonnance Approuvée' : 'Ordonnance Rejetée',
      `L’ordonnance de ${rx?.patientName} a été ${decision === 'approved' ? 'validée' : 'refusée'} par le Dr. ${currentUser.name}.`,
      decision === 'approved' ? 'info' : 'warning'
    );
  };

  // Online Orders
  const createOnlineOrder = (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryType: 'pickup' | 'delivery';
    pickupEstablishmentId?: string;
    deliveryAddress?: string;
    deliveryCommune?: string;
    prescriptionId?: string;
    items: { productId: string; quantity: number }[];
  }): { success: boolean; order?: OnlineOrder; error?: string } => {
    let totalUSD = 0;
    const appliedRate = currentExchangeRate;

    const itemsFormatted = orderData.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId)!;
      const unitUSD = prod.retailPriceUSD;
      const unitCDF = toCDF(unitUSD, appliedRate);
      totalUSD += unitUSD * it.quantity;

      return {
        productId: prod.id,
        productName: prod.brandName,
        dosage: prod.dosage,
        quantity: it.quantity,
        unitPriceUSD: unitUSD,
        unitPriceCDF: unitCDF,
        isPrescriptionRequired: prod.isPrescriptionRequired,
      };
    });

    const hasRx = itemsFormatted.some((i) => i.isPrescriptionRequired);
    const initialStatus = hasRx && !orderData.prescriptionId ? 'pending_prescription' : 'pending_preparation';

    const newOrder: OnlineOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `CMD-WEB-${Date.now().toString().slice(-4)}`,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerEmail: orderData.customerEmail,
      deliveryType: orderData.deliveryType,
      pickupEstablishmentId: orderData.pickupEstablishmentId || establishments[0].id,
      deliveryAddress: orderData.deliveryAddress,
      deliveryCommune: orderData.deliveryCommune,
      prescriptionId: orderData.prescriptionId,
      items: itemsFormatted,
      totalUSD: Number(totalUSD.toFixed(2)),
      totalCDF: toCDF(totalUSD, appliedRate),
      appliedRateUSD_CDF: appliedRate,
      status: initialStatus,
      createdAt: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
    };

    setOnlineOrders([newOrder, ...onlineOrders]);

    addNotification(
      'Nouvelle Commande Web Reçue',
      `Commande ${newOrder.orderNumber} par ${newOrder.customerName} (${newOrder.deliveryType === 'delivery' ? 'Livraison' : 'Retrait'}). Total: ${formatMoney(newOrder.totalUSD)}`,
      'info'
    );

    return { success: true, order: newOrder };
  };

  const updateOrderStatus = (orderId: string, newStatus: OnlineOrder['status']) => {
    const updated = onlineOrders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          preparedBy: newStatus === 'in_preparation' || newStatus === 'ready_for_pickup' ? currentUser.name : o.preparedBy,
        };
      }
      return o;
    });
    setOnlineOrders(updated);

    addNotification(
      'Statut Commande Modifié',
      `La commande ${orderId} est désormais passée au statut : ${newStatus.replace('_', ' ')}.`,
      'info'
    );
  };

  // Transfers
  const createTransfer = (destEstId: string, items: { productId: string; batchNumber: string; quantity: number }[], notes?: string) => {
    if (!currentEstablishment) return;
    const dest = establishments.find((e) => e.id === destEstId);
    if (!dest) return;

    // Verify stock at source
    for (const it of items) {
      const b = batches.find((x) => x.establishmentId === currentEstablishment.id && x.batchNumber === it.batchNumber);
      if (!b || b.quantity < it.quantity) {
        alert(`Stock insuffisant dans le lot ${it.batchNumber} à la source.`);
        return;
      }
    }

    // Deduct source batches immediately as "in_transit"
    const updatedBatches = batches.map((b) => {
      const match = items.find((it) => it.batchNumber === b.batchNumber && b.establishmentId === currentEstablishment.id);
      if (match) {
        return { ...b, quantity: b.quantity - match.quantity };
      }
      return b;
    });
    setBatches(updatedBatches);

    const newTransfer: TransferOrder = {
      id: `trf-${Date.now()}`,
      transferNumber: `TRF-${currentEstablishment.code}-${dest.code}-${Date.now().toString().slice(-4)}`,
      sourceEstablishmentId: currentEstablishment.id,
      sourceEstablishmentName: currentEstablishment.name,
      destEstablishmentId: dest.id,
      destEstablishmentName: dest.name,
      requestDate: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      shipDate: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      status: 'in_transit',
      items: items.map((it) => {
        const prod = products.find((p) => p.id === it.productId)!;
        return {
          productId: it.productId,
          productName: prod.brandName,
          batchNumber: it.batchNumber,
          quantity: it.quantity,
        };
      }),
      requestedBy: currentUser.name,
      approvedBy: currentUser.name,
      notes,
    };

    setTransfers([newTransfer, ...transfers]);

    addAuditLog(
      'STOCK_TRANSFER',
      `Expédition de transfert inter-sites ${newTransfer.transferNumber} de ${currentEstablishment.name} vers ${dest.name}`,
      'warning',
      { transferId: newTransfer.id }
    );
  };

  const confirmReceiveTransfer = (transferId: string) => {
    const trf = transfers.find((t) => t.id === transferId);
    if (!trf || trf.status !== 'in_transit') return;

    // PRD Acceptance criteria: The destination is credited ONLY after confirmed physical reception!
    const updatedBatches = [...batches];

    for (const item of trf.items) {
      // Find source batch details to replicate cost and expiry date
      const sourceBatch = batches.find((b) => b.batchNumber === item.batchNumber);
      const existingDestBatchIdx = updatedBatches.findIndex(
        (b) => b.establishmentId === trf.destEstablishmentId && b.batchNumber === item.batchNumber
      );

      if (existingDestBatchIdx !== -1) {
        updatedBatches[existingDestBatchIdx] = {
          ...updatedBatches[existingDestBatchIdx],
          quantity: updatedBatches[existingDestBatchIdx].quantity + item.quantity,
        };
      } else {
        // Create batch at destination
        updatedBatches.push({
          id: `batch-${Date.now()}-${item.batchNumber}`,
          establishmentId: trf.destEstablishmentId,
          productId: item.productId,
          batchNumber: item.batchNumber,
          entryDate: new Date().toISOString().split('T')[0],
          expiryDate: sourceBatch?.expiryDate || '2028-12-31',
          quantity: item.quantity,
          initialQuantity: item.quantity,
          purchaseCostUSD: sourceBatch?.purchaseCostUSD || 5.0,
          supplierId: sourceBatch?.supplierId || 'sup-001',
          locationShelf: 'Zone Réception Transferts',
          status: 'available',
        });
      }
    }

    setBatches(updatedBatches);

    const updatedTransfers = transfers.map((t) => {
      if (t.id === transferId) {
        return {
          ...t,
          status: 'received_confirmed' as const,
          receiveDate: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
          receivedBy: currentUser.name,
        };
      }
      return t;
    });
    setTransfers(updatedTransfers);

    addAuditLog(
      'STOCK_TRANSFER',
      `RÉCEPTION VALIDÉE du transfert ${trf.transferNumber} à ${trf.destEstablishmentName}. Stock crédité après contrôle physique.`,
      'info',
      { transferId }
    );

    addNotification(
      'Transfert Reçu et Contrôlé',
      `Les marchandises du transfert ${trf.transferNumber} ont été intégrées dans les stocks de ${trf.destEstablishmentName}.`,
      'info'
    );
  };

  // Purchase Orders
  const createPurchaseOrder = (
    supplierId: string,
    items: { productId: string; quantity: number; unitCostUSD: number }[],
    notes?: string
  ) => {
    if (!currentEstablishment) return;
    const sup = suppliers.find((s) => s.id === supplierId);
    let totalUSD = 0;

    const poItems = items.map((it) => {
      const prod = products.find((p) => p.id === it.productId)!;
      const lineCost = it.quantity * it.unitCostUSD;
      totalUSD += lineCost;
      return {
        productId: it.productId,
        productName: prod.brandName,
        orderedQty: it.quantity,
        receivedQty: 0,
        unitCostUSD: it.unitCostUSD,
        totalCostUSD: lineCost,
      };
    });

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `BC-${Date.now().toString().slice(-4)}`,
      supplierId,
      supplierName: sup?.name || 'Fournisseur',
      establishmentId: currentEstablishment.id,
      orderDate: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      expectedDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      status: 'ordered',
      items: poItems,
      totalUSD,
      totalCDF: toCDF(totalUSD),
      notes,
    };

    setPurchaseOrders([newPO, ...purchaseOrders]);

    addAuditLog(
      'PURCHASE',
      `Bon de commande fournisseur ${newPO.poNumber} émis auprès de ${newPO.supplierName} pour un montant de $${totalUSD}`,
      'info'
    );
  };

  const receivePurchaseOrder = (
    poId: string,
    itemsWithBatches: { productId: string; quantity: number; batchNumber: string; expiryDate: string; unitCostUSD: number }[]
  ) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    // PRD Requirement: Reception must be validated before increasing stock!
    const newBatches: BatchStock[] = [];

    for (const item of itemsWithBatches) {
      newBatches.push({
        id: `batch-${Date.now()}-${item.batchNumber}`,
        establishmentId: po.establishmentId,
        productId: item.productId,
        batchNumber: item.batchNumber,
        entryDate: new Date().toISOString().split('T')[0],
        expiryDate: item.expiryDate,
        quantity: item.quantity,
        initialQuantity: item.quantity,
        purchaseCostUSD: item.unitCostUSD,
        supplierId: po.supplierId,
        locationShelf: 'Magasin Central Réception',
        status: 'available',
      });
    }

    setBatches([...newBatches, ...batches]);

    const updatedPO = purchaseOrders.map((p) => {
      if (p.id === poId) {
        return {
          ...p,
          status: 'received_validated' as const,
          receptionDate: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
          validatedBy: currentUser.name,
        };
      }
      return p;
    });
    setPurchaseOrders(updatedPO);

    // Financial entry for supplier purchase
    const finEntry: FinancialEntry = {
      id: `fin-po-${Date.now()}`,
      establishmentId: po.establishmentId,
      establishmentName: establishments.find((e) => e.id === po.establishmentId)?.name || '',
      date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      type: 'purchase',
      category: 'Achats Marchandises Fournisseur',
      description: `Facture Fournisseur ${po.supplierName} — Réf BC ${po.poNumber}`,
      amountUSD: po.totalUSD,
      amountCDF: po.totalCDF,
      currencyOriginal: 'USD',
      appliedRate: currentExchangeRate,
      authorName: currentUser.name,
      referenceDoc: po.poNumber,
    };
    setFinancialEntries([finEntry, ...financialEntries]);

    addAuditLog(
      'STOCK_RECEPTION',
      `RÉCEPTION ACHATS VALIDÉE : Bon ${po.poNumber} fournisseur ${po.supplierName}. Stock incrémenté avec lots et dates de péremption contrôlés.`,
      'info',
      { poId }
    );
  };

  // Expenses & Financials
  const addExpense = (category: string, description: string, amount: number, currency: Currency, referenceDoc: string) => {
    if (!currentEstablishment) return;
    const rate = currentExchangeRate;
    const amountUSD = currency === 'USD' ? amount : toUSD(amount, rate);
    const amountCDF = currency === 'CDF' ? amount : toCDF(amount, rate);

    const entry: FinancialEntry = {
      id: `fin-${Date.now()}`,
      establishmentId: currentEstablishment.id,
      establishmentName: currentEstablishment.name,
      date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      type: 'operating_expense',
      category,
      description,
      amountUSD,
      amountCDF,
      currencyOriginal: currency,
      appliedRate: rate,
      authorName: currentUser.name,
      referenceDoc,
    };

    setFinancialEntries([entry, ...financialEntries]);

    addAuditLog(
      'SALE',
      `Décaissement dépense "${category}" (${formatMoney(amountUSD, currency)}) à ${currentEstablishment.name}. Réf: ${referenceDoc}`,
      'info'
    );
  };

  const reverseFinancialEntry = (entryId: string, reason: string) => {
    const entry = financialEntries.find((f) => f.id === entryId);
    if (!entry) return;

    // Strict Accounting Rule: Validated entries are NEVER deleted; corrected via contra-entry
    const contraEntry: FinancialEntry = {
      id: `fin-rev-${Date.now()}`,
      establishmentId: entry.establishmentId,
      establishmentName: entry.establishmentName,
      date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      type: entry.type,
      category: `Contre-passation: ${entry.category}`,
      description: `Annulation comptable de [${entry.description}]. Motif: ${reason}`,
      amountUSD: -entry.amountUSD,
      amountCDF: -entry.amountCDF,
      currencyOriginal: entry.currencyOriginal,
      appliedRate: entry.appliedRate,
      authorName: currentUser.name,
      referenceDoc: `ANNUL-${entry.referenceDoc}`,
      isReversed: true,
      reversalReason: reason,
    };

    setFinancialEntries([contraEntry, ...financialEntries]);

    addAuditLog(
      'CANCELLATION',
      `ÉCRITURE COMPTABLE DE CONTRE-PASSATION sur ${entry.referenceDoc} par ${currentUser.name}. Motif: ${reason}`,
      'critical',
      { entryId, reason }
    );
  };

  // User Management
  const toggleUserStatus = (userId: string, newStatus: 'active' | 'suspended') => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, status: newStatus };
      }
      return u;
    });
    setUsers(updated);

    const targetUser = users.find((u) => u.id === userId);

    addAuditLog(
      'AGENT_SUSPEND',
      `Changement de statut pour l’agent ${targetUser?.name} : ${newStatus.toUpperCase()}`,
      newStatus === 'suspended' ? 'critical' : 'info',
      { userId, newStatus }
    );
  };

  const createUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
    };
    setUsers([...users, newUser]);

    addAuditLog(
      'AGENT_CREATE',
      `Création du compte agent pour ${newUser.name} avec le rôle ${newUser.role} rattaché à ${newUser.establishmentName}`,
      'warning',
      { newUser: newUser.email }
    );
  };

  // Audit and notification helpers
  const addAuditLog = (
    actionType: AuditLog['actionType'],
    description: string,
    severity: AuditLog['severity'] = 'info',
    metadata?: Record<string, any>
  ) => {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      establishmentId: currentEstablishment?.id || 'est-hq',
      establishmentName: currentEstablishment?.name || 'Réseau Central',
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      actionType,
      description,
      severity,
      metadata,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const addNotification = (
    title: string,
    message: string,
    severity: SystemNotification['severity'] = 'info',
    targetRole?: Role
  ) => {
    const notif: SystemNotification = {
      id: `notif-${Date.now()}`,
      timestamp: 'À l’instant',
      title,
      message,
      severity,
      read: false,
      targetRole,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <PharmacyContext.Provider
      value={{
        currentUser,
        switchUser,
        login,
        logout,
        establishments,
        activeEstablishmentId,
        setActiveEstablishmentId,
        currentEstablishment,
        createEstablishment,
        currentExchangeRate,
        exchangeRateRecords,
        updateExchangeRate,
        displayCurrency,
        setDisplayCurrency,
        toCDF,
        toUSD,
        formatMoney,
        products,
        batches,
        stockMovements,
        getProductStock,
        getProductBatches,
        adjustStock,
        addProduct,
        sales,
        cashSessions,
        currentCashSession,
        openCashSession,
        closeCashSession,
        processSale,
        cancelSale,
        prescriptions,
        onlineOrders,
        submitPrescription,
        reviewPrescription,
        createOnlineOrder,
        updateOrderStatus,
        transfers,
        purchaseOrders,
        suppliers,
        createTransfer,
        confirmReceiveTransfer,
        createPurchaseOrder,
        receivePurchaseOrder,
        financialEntries,
        addExpense,
        reverseFinancialEntry,
        auditLogs,
        notifications,
        markNotificationRead,
        users,
        toggleUserStatus,
        createUser,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
};
