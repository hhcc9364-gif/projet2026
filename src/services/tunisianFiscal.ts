/**
 * SANDRA GESTION - Moteur Fiscal et Comptable Tunisien
 * Développé par Radhwen Ennaceur
 * 
 * Conforme à la législation fiscale tunisienne :
 * - Dinar Tunisien (TND) avec 3 décimales (Millimes)
 * - Taux de TVA : 19%, 7%, 13%, 0%
 * - Timbre Fiscal : 1,000 TND par facture
 * - FODEC : 1% sur produits manufacturés locaux
 * - Retenue à la source : 1.5% (services), 1.0% (marchandises étatiques), 15% (loyers)
 */

import { InvoiceLine, VatRate } from '../types/erp';

export const LEGAL_TIMBRE_FISCAL = 1.000; // 1 Dinar standard

/**
 * Arrondi au millime le plus proche (3 décimales).
 */
export function roundToMillimes(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 1000) / 1000;
}

/**
 * Formate un montant en Dinars Tunisiens avec 3 décimales obligatoires.
 * Ex: 1250.5 -> "1 250,500 TND"
 */
export function formatTnd(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0,000 TND';
  }
  const rounded = roundToMillimes(amount);
  const parts = rounded.toFixed(3).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${integerPart},${parts[1]} TND`;
}

/**
 * Valide le Matricule Fiscal selon le format officiel du Ministère des Finances tunisien (DGI).
 * Format standard : 7 chiffres / Clé / Catégorie (M|P|C) / Code Établissement (3 chiffres)
 * Exemple : 1458923/A/M/000
 */
export function isValidMatriculeFiscal(matricule: string): boolean {
  if (!matricule) return false;
  const regex = /^\d{7}\/[A-Za-z]\/[MPCmpc]\/\d{3}$/;
  return regex.test(matricule.trim());
}

export interface CalculatedInvoiceTotals {
  totalHt: number;
  totalFodec: number;
  totalVat19: number;
  totalVat7: number;
  totalVat13: number;
  totalVat: number;
  timbreFiscal: number;
  totalTtc: number;
  retenueSourceAmount: number;
  netToPay: number;
  updatedLines: InvoiceLine[];
}

/**
 * Calcule tous les sous-totaux fiscaux d'une facture tunisienne.
 */
export function calculateInvoiceFinancials(
  lines: Array<Omit<InvoiceLine, 'id' | 'totalHt' | 'vatAmount' | 'fodecAmount' | 'totalTtc'> & { id?: string }>,
  companyFodecApplicable: boolean = false,
  retenueRate: number = 0,
  applyTimbre: boolean = true
): CalculatedInvoiceTotals {
  let totalHt = 0;
  let totalFodec = 0;
  let vat19 = 0;
  let vat7 = 0;
  let vat13 = 0;

  const updatedLines: InvoiceLine[] = lines.map((line) => {
    const discount = line.unitPriceHt * (line.discountPct / 100);
    const effectivePrice = line.unitPriceHt - discount;
    const lineHt = roundToMillimes(line.quantity * effectivePrice);

    let lineFodec = 0;
    if (companyFodecApplicable) {
      lineFodec = roundToMillimes(lineHt * 0.01); // 1% FODEC
    }

    const taxableBase = lineHt + lineFodec;
    const lineVat = roundToMillimes(taxableBase * (line.vatRate / 100));
    const lineTtc = roundToMillimes(lineHt + lineFodec + lineVat);

    totalHt += lineHt;
    totalFodec += lineFodec;

    if (line.vatRate === 19) vat19 += lineVat;
    else if (line.vatRate === 7) vat7 += lineVat;
    else if (line.vatRate === 13) vat13 += lineVat;

    return {
      ...line,
      id: line.id || `line-${Date.now()}-${Math.random()}`,
      totalHt: lineHt,
      fodecAmount: lineFodec,
      vatAmount: lineVat,
      totalTtc: lineTtc,
    };
  });

  const totalVat = roundToMillimes(vat19 + vat7 + vat13);
  const timbre = applyTimbre ? LEGAL_TIMBRE_FISCAL : 0;
  const totalTtc = roundToMillimes(totalHt + totalFodec + totalVat + timbre);

  let retenueSourceAmount = 0;
  if (retenueRate > 0) {
    retenueSourceAmount = roundToMillimes(totalTtc * (retenueRate / 100));
  }

  const netToPay = roundToMillimes(totalTtc - retenueSourceAmount);

  return {
    totalHt: roundToMillimes(totalHt),
    totalFodec: roundToMillimes(totalFodec),
    totalVat19: roundToMillimes(vat19),
    totalVat7: roundToMillimes(vat7),
    totalVat13: roundToMillimes(vat13),
    totalVat,
    timbreFiscal: timbre,
    totalTtc,
    retenueSourceAmount,
    netToPay,
    updatedLines,
  };
}
