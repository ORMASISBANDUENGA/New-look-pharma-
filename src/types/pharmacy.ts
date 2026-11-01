/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEW LOOK PHARMA — Types & Modèles de Données
 */

export type Role =
  | 'AG1'                  // Administrateur Général n°1 / Propriétaire
  | 'ADMIN_EXTENSION'     // Administrateur d'extension locale
  | 'GERANT'              // Gérant / Responsable de pharmacie
  | 'PHARMACIEN'          // Pharmacien habilité (Validation ordonnances)
  | 'CAISSIER'            // Caissier / Vendeur POS
  | 'GESTIONNAIRE_STOCK'  // Gestionnaire de stock / Approvisionnement
  | 'COMPTABLE'           // Comptable / Finance
  | 'PREPARATEUR'         // Préparateur de commande
  | 'CLIENT';             // Client public / Patient

export type Currency = 'USD' | 'CDF';

export interface Establishment {
  id: string;
  name: string;
  code: string;
  isHeadquarters: boolean;
  commune: string;
  address: string;
  phone: string;
  status: 'active' | 'maintenance' | 'suspended';
  managerName: string;
  cashBalanceUSD: number;
  cashBalanceCDF: number;
}

export type TherapeuticCategory =
  | 'Antipaludiques'
  | 'Antibiotiques'
  | 'Antalgiques & Anti-inflammatoires'
  | 'Cardiovasculaire'
  | 'Gastro-entérologie'
  | 'Vitamines & Pédiatrie'
  | 'Matériel Médical & Soins'
  | 'Diabète & Métabolisme'
  | 'Pneumologie & Allergologie';

export type GalenicForm =
  | 'Comprimé'
  | 'Sirop / Suspension'
  | 'Gélule'
  | 'Injectable'
  | 'Pommade / Crème'
  | 'Solution pour perfusion'
  | 'Spray / Inhalateur'
  | 'Flacon compte-gouttes';

export interface Product {
  id: string;
  code: string;
  brandName: string;
  dci: string; // Dénomination Commune Internationale
  category: TherapeuticCategory;
  form: GalenicForm;
  dosage: string;
  packaging: string;
  isPrescriptionRequired: boolean; // Rx obligatoire
  retailPriceUSD: number;
  wholesalePriceUSD: number;
  taxRate: number; // 0 ou 0.16
  description: string;
  storageCondition: string;
  minThreshold: number;
  maxThreshold: number;
}

export interface BatchStock {
  id: string;
  establishmentId: string;
  productId: string;
  batchNumber: string;
  entryDate: string;
  expiryDate: string; // YYYY-MM-DD
  quantity: number;
  initialQuantity: number;
  purchaseCostUSD: number;
  supplierId: string;
  locationShelf: string;
  status: 'available' | 'near_expiry' | 'critical_expiry' | 'expired' | 'quarantine';
}

export interface SaleLineItem {
  productId: string;
  productName: string;
  dci: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  unitPriceUSD: number;
  unitPriceCDF: number;
  discountPercent: number;
  taxPercent: number;
  lineTotalUSD: number;
  lineTotalCDF: number;
  isPrescriptionRequired: boolean;
}

export interface SaleTransaction {
  id: string;
  receiptNumber: string;
  establishmentId: string;
  establishmentName: string;
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  date: string;
  saleType: 'retail' | 'wholesale';
  items: SaleLineItem[];
  subtotalUSD: number;
  subtotalCDF: number;
  discountUSD: number;
  taxUSD: number;
  totalUSD: number;
  totalCDF: number;
  paidAmountUSD: number;
  paidAmountCDF: number;
  currencyPaid: 'USD' | 'CDF' | 'SPLIT';
  paymentMethod: 'cash_usd' | 'cash_cdf' | 'mpesa' | 'airtel_money' | 'orange_money' | 'card' | 'credit';
  changeGivenUSD: number;
  changeGivenCDF: number;
  appliedRateUSD_CDF: number;
  status: 'completed' | 'cancelled' | 'refunded';
  cancellationReason?: string;
  prescriptionNumber?: string;
}

export interface Prescription {
  id: string;
  orderNumber?: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  hospitalOrClinic: string;
  doctorOrdreNational: string;
  datePrescribed: string;
  dateUploaded: string;
  documentUrl?: string;
  itemsRequested: string[];
  notes?: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'dispensed';
  pharmacistReviewerId?: string;
  pharmacistName?: string;
  rejectionReason?: string;
  validationDate?: string;
}

export interface OnlineOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryType: 'pickup' | 'delivery';
  pickupEstablishmentId?: string;
  deliveryAddress?: string;
  deliveryCommune?: string;
  items: {
    productId: string;
    productName: string;
    dosage: string;
    quantity: number;
    unitPriceUSD: number;
    unitPriceCDF: number;
    isPrescriptionRequired: boolean;
  }[];
  totalUSD: number;
  totalCDF: number;
  appliedRateUSD_CDF: number;
  prescriptionId?: string;
  status:
    | 'pending_prescription'
    | 'pending_preparation'
    | 'in_preparation'
    | 'ready_for_pickup'
    | 'out_for_delivery'
    | 'completed'
    | 'cancelled';
  createdAt: string;
  preparedBy?: string;
  pickupTime?: string;
}

export interface StockMovement {
  id: string;
  date: string;
  establishmentId: string;
  establishmentName: string;
  productId: string;
  productName: string;
  batchNumber: string;
  type:
    | 'sale'
    | 'purchase_reception'
    | 'transfer_in'
    | 'transfer_out'
    | 'inventory_adjustment'
    | 'return_supplier'
    | 'disposal_expired';
  quantityDelta: number; // positive or negative
  balanceAfter: number;
  costUSD: number;
  authorName: string;
  authorRole: Role;
  documentRef: string;
  reason?: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  country: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  establishmentId: string;
  orderDate: string;
  expectedDate: string;
  receptionDate?: string;
  status: 'ordered' | 'partially_received' | 'received_validated' | 'cancelled';
  items: {
    productId: string;
    productName: string;
    orderedQty: number;
    receivedQty: number;
    batchNumber?: string;
    expiryDate?: string;
    unitCostUSD: number;
    totalCostUSD: number;
  }[];
  totalUSD: number;
  totalCDF: number;
  validatedBy?: string;
  notes?: string;
}

export interface TransferOrder {
  id: string;
  transferNumber: string;
  sourceEstablishmentId: string;
  sourceEstablishmentName: string;
  destEstablishmentId: string;
  destEstablishmentName: string;
  requestDate: string;
  shipDate?: string;
  receiveDate?: string;
  status: 'requested' | 'in_transit' | 'received_confirmed' | 'rejected';
  items: {
    productId: string;
    productName: string;
    batchNumber: string;
    quantity: number;
  }[];
  requestedBy: string;
  approvedBy?: string;
  receivedBy?: string;
  notes?: string;
}

export interface CashSession {
  id: string;
  establishmentId: string;
  establishmentName: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  openingFloatUSD: number;
  openingFloatCDF: number;
  expectedCashUSD: number;
  expectedCashCDF: number;
  countedCashUSD?: number;
  countedCashCDF?: number;
  discrepancyUSD?: number;
  discrepancyCDF?: number;
  discrepancyReason?: string;
  status: 'open' | 'closed';
}

export interface FinancialEntry {
  id: string;
  establishmentId: string;
  establishmentName: string;
  date: string;
  type:
    | 'sale'
    | 'purchase'
    | 'operating_expense'
    | 'refund'
    | 'cash_transfer'
    | 'capital_injection'
    | 'receivable_collection';
  category: string;
  description: string;
  amountUSD: number;
  amountCDF: number;
  currencyOriginal: 'USD' | 'CDF';
  appliedRate: number;
  authorName: string;
  referenceDoc: string;
  isReversed?: boolean;
  reversalReason?: string;
}

export interface ExchangeRateRecord {
  id: string;
  rate: number; // CDF per 1 USD
  effectiveDate: string;
  setBy: string;
  sourceValidation: string;
  notes: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  establishmentId: string;
  establishmentName: string;
  userId: string;
  userName: string;
  userRole: Role;
  actionType:
    | 'SALE'
    | 'CANCELLATION'
    | 'REFUND'
    | 'CASH_DISCREPANCY'
    | 'STOCK_ADJUSTMENT'
    | 'STOCK_RECEPTION'
    | 'STOCK_TRANSFER'
    | 'PURCHASE'
    | 'AGENT_CREATE'
    | 'AGENT_SUSPEND'
    | 'PERMISSION_CHANGE'
    | 'EXTENSION_CREATE'
    | 'RATE_CHANGE'
    | 'LOGIN'
    | 'PRESCRIPTION_VALIDATION';
  description: string;
  severity: 'info' | 'warning' | 'critical';
  metadata?: Record<string, any>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: Role;
  establishmentId: string;
  establishmentName: string;
  status: 'active' | 'suspended' | 'inactive';
  phone: string;
  lastLogin?: string;
}
