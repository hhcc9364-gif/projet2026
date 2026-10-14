using System;
using System.Collections.Generic;
using System.Linq;
using SandraGestion.Core.Models;

namespace SandraGestion.Core.Services
{
    public record InvoiceTaxCalculationResult(
        decimal TotalHt,
        decimal TotalFodec,
        decimal TotalVat19,
        decimal TotalVat7,
        decimal TotalVat13,
        decimal TotalVat,
        decimal TimbreFiscal,
        decimal TotalTtc,
        decimal RetenueSourceAmount,
        decimal NetToPay
    );

    /// <summary>
    /// Core Tunisian Tax & Fiscal Calculation Engine.
    /// Strictly handles Dinar Tunisien (3 millimes precision) and official rates.
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public class TunisianTaxCalculator
    {
        public const decimal LegalTimbreFiscal = 1.000m; // 1.000 DT standard tunisien

        public static decimal RoundToMillimes(decimal amount)
        {
            return Math.Round(amount, 3, MidpointRounding.AwayFromZero);
        }

        public InvoiceTaxCalculationResult CalculateInvoiceTotals(
            IEnumerable<InvoiceLine> lines,
            bool companyFodecApplicable = false,
            decimal retenueSourceRate = 0.0m,
            bool applyTimbre = true)
        {
            decimal totalHt = 0.000m;
            decimal totalFodec = 0.000m;
            decimal vat19 = 0.000m;
            decimal vat7 = 0.000m;
            decimal vat13 = 0.000m;

            foreach (var line in lines)
            {
                decimal lineDiscount = line.UnitPriceHt * (line.DiscountPct / 100m);
                decimal lineEffectivePrice = line.UnitPriceHt - lineDiscount;
                decimal lineHt = RoundToMillimes(line.Quantity * lineEffectivePrice);
                line.TotalHt = lineHt;

                totalHt += lineHt;

                // FODEC (1% for industrial manufacturing)
                decimal lineFodec = 0.000m;
                if (companyFodecApplicable || line.FodecAmount > 0)
                {
                    lineFodec = RoundToMillimes(lineHt * 0.01m);
                    line.FodecAmount = lineFodec;
                    totalFodec += lineFodec;
                }

                // Assiette TVA includes FODEC
                decimal taxableBase = lineHt + lineFodec;
                decimal lineVat = RoundToMillimes(taxableBase * (line.VatRate / 100m));
                line.VatAmount = lineVat;
                line.TotalTtc = lineHt + lineFodec + lineVat;

                if (Math.Abs(line.VatRate - 19.0m) < 0.01m)
                    vat19 += lineVat;
                else if (Math.Abs(line.VatRate - 7.0m) < 0.01m)
                    vat7 += lineVat;
                else if (Math.Abs(line.VatRate - 13.0m) < 0.01m)
                    vat13 += lineVat;
            }

            decimal totalVat = RoundToMillimes(vat19 + vat7 + vat13);
            decimal timbre = applyTimbre ? LegalTimbreFiscal : 0.000m;
            decimal totalTtc = RoundToMillimes(totalHt + totalFodec + totalVat + timbre);

            decimal rsAmount = 0.000m;
            if (retenueSourceRate > 0)
            {
                // In Tunisia RS is applied on Total TTC or HT depending on service/sale category
                // Standard for commercial: RS applied on TTC or HT as per tax directive
                rsAmount = RoundToMillimes(totalTtc * (retenueSourceRate / 100m));
            }

            decimal netToPay = RoundToMillimes(totalTtc - rsAmount);

            return new InvoiceTaxCalculationResult(
                TotalHt: totalHt,
                TotalFodec: totalFodec,
                TotalVat19: vat19,
                TotalVat7: vat7,
                TotalVat13: vat13,
                TotalVat: totalVat,
                TimbreFiscal: timbre,
                TotalTtc: totalTtc,
                RetenueSourceAmount: rsAmount,
                NetToPay: netToPay
            );
        }
    }
}
