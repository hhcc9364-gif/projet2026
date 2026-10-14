using System;
using System.Collections.Generic;
using SandraGestion.Core.Models;

namespace SandraGestion.Core.Services
{
    /// <summary>
    /// Moteur d'amortissement des immobilisations (NCT 5 - Tunisie).
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public class FixedAssetDepreciationCalculator
    {
        public static decimal RoundToMillimes(decimal amount)
        {
            return Math.Round(amount, 3, MidpointRounding.AwayFromZero);
        }

        /// <summary>
        /// Génère le tableau prévisionnel complet d'amortissement linéaire.
        /// Prorata temporis appliqué sur la première année si mise en service en cours d'exercice.
        /// </summary>
        public List<DepreciationSchedule> GenerateLinearSchedule(FixedAsset asset)
        {
            var schedules = new List<DepreciationSchedule>();
            decimal baseAmortissable = asset.TotalGrossValue - asset.ResidualValue;
            if (baseAmortissable <= 0 || asset.UsefulLifeYears <= 0)
                return schedules;

            decimal annualRate = 100.0m / asset.UsefulLifeYears;
            decimal fullYearDepreciation = RoundToMillimes(baseAmortissable * (annualRate / 100m));

            int startYear = asset.CommissioningDate.Year;
            int startMonth = asset.CommissioningDate.Month;
            int monthsFirstYear = 12 - startMonth + 1;

            decimal firstYearDepreciation = RoundToMillimes(fullYearDepreciation * (monthsFirstYear / 12.0m));
            decimal cumulative = 0m;

            // Année 1 (Prorata)
            cumulative += firstYearDepreciation;
            schedules.Add(new DepreciationSchedule
            {
                AssetId = asset.Id,
                FiscalYear = startYear,
                DepreciationBase = baseAmortissable,
                DepreciationAmount = firstYearDepreciation,
                CumulativeDepreciation = cumulative,
                NetBookValueEnd = RoundToMillimes(asset.TotalGrossValue - cumulative)
            });

            // Années intermédiaires
            int yearsCount = asset.UsefulLifeYears;
            int currentYear = startYear + 1;

            for (int i = 1; i < yearsCount; i++)
            {
                decimal amount = fullYearDepreciation;
                if (cumulative + amount > baseAmortissable)
                    amount = baseAmortissable - cumulative;

                cumulative += amount;
                schedules.Add(new DepreciationSchedule
                {
                    AssetId = asset.Id,
                    FiscalYear = currentYear,
                    DepreciationBase = baseAmortissable,
                    DepreciationAmount = amount,
                    CumulativeDepreciation = cumulative,
                    NetBookValueEnd = RoundToMillimes(asset.TotalGrossValue - cumulative)
                });
                currentYear++;
            }

            // Reliquat éventuel si prorata première année
            if (cumulative < baseAmortissable)
            {
                decimal remaining = RoundToMillimes(baseAmortissable - cumulative);
                cumulative += remaining;
                schedules.Add(new DepreciationSchedule
                {
                    AssetId = asset.Id,
                    FiscalYear = currentYear,
                    DepreciationBase = baseAmortissable,
                    DepreciationAmount = remaining,
                    CumulativeDepreciation = cumulative,
                    NetBookValueEnd = RoundToMillimes(asset.TotalGrossValue - cumulative)
                });
            }

            return schedules;
        }
    }
}
