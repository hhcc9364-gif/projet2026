using System;
using SandraGestion.Core.Models;

namespace SandraGestion.Core.Services
{
    public record PayrollCalculationResult(
        decimal GrossSalary,
        decimal CnssEmployee,
        decimal TaxableGross,
        decimal ProfessionalExpenses,
        decimal FamilyDeductions,
        decimal NetTaxableMonthly,
        decimal IrppMonthly,
        decimal NetSalary,
        decimal CnssEmployer,
        decimal WorkAccident,
        decimal Foprolos,
        decimal Tfp,
        decimal TotalEmployerCost
    );

    /// <summary>
    /// Moteur de calcul de la paie tunisienne (CNSS, IRPP, FOPROLOS, TFP).
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public class TunisianPayrollCalculator
    {
        public const decimal DefaultCnssEmployeeRate = 9.18m;
        public const decimal DefaultCnssEmployerRate = 16.57m;
        public const decimal DefaultFoprolosRate = 1.00m;
        public const decimal DefaultTfpRateIndustry = 1.00m;
        public const decimal DefaultTfpRateCommerce = 2.00m;

        public static decimal RoundToMillimes(decimal amount)
        {
            return Math.Round(amount, 3, MidpointRounding.AwayFromZero);
        }

        /// <summary>
        /// Calcule le bulletin de paie complet d'un salarié tunisien.
        /// </summary>
        public PayrollCalculationResult CalculatePayslip(
            decimal baseSalary,
            decimal overtimeHours,
            decimal hourlyRate,
            decimal bonusesTaxable,
            decimal bonusesExempt,
            string maritalStatus,
            int childrenCount,
            bool isManufacturing = true,
            decimal workAccidentRate = 1.5m,
            decimal advances = 0.0m)
        {
            // 1. Calcul des heures supplémentaires (majoration standard 25% à 50%)
            decimal overtimeAmount = RoundToMillimes(overtimeHours * hourlyRate * 1.25m);

            // 2. Salaire Brut Total
            decimal grossSalary = RoundToMillimes(baseSalary + overtimeAmount + bonusesTaxable + bonusesExempt);

            // 3. Retenue CNSS Salariale (9.18% sur l'ensemble du brut soumis)
            decimal cnssEmployee = RoundToMillimes((baseSalary + overtimeAmount + bonusesTaxable) * (DefaultCnssEmployeeRate / 100m));

            // 4. Brut Imposable
            decimal taxableGross = RoundToMillimes((baseSalary + overtimeAmount + bonusesTaxable) - cnssEmployee);

            // 5. Déduction des Frais Professionnels (10% plafonné à 2000 TND/an soit 166.666 TND/mois)
            decimal profExpensesMaxMonthly = RoundToMillimes(2000.000m / 12m);
            decimal profExpenses = RoundToMillimes(taxableGross * 0.10m);
            if (profExpenses > profExpensesMaxMonthly)
                profExpenses = profExpensesMaxMonthly;

            // 6. Déductions Familiales (Chef de famille 300 TND/an = 25 TND/mois, Enfants 100 TND/an = 8.333 TND/mois par enfant)
            decimal familyDeductions = 0.000m;
            if (string.Equals(maritalStatus, "MARRIED", StringComparison.OrdinalIgnoreCase))
            {
                familyDeductions += RoundToMillimes(300.000m / 12m);
            }
            int eligibleChildren = Math.Min(childrenCount, 4);
            familyDeductions += RoundToMillimes((eligibleChildren * 100.000m) / 12m);

            // 7. Net Imposable Mensuel
            decimal netTaxableMonthly = Math.Max(0.000m, taxableGross - profExpenses - familyDeductions);

            // 8. Calcul de l'IRPP mensuel selon le barème progressif annuel
            decimal annualEquivalent = netTaxableMonthly * 12m;
            decimal annualIrpp = CalculateAnnualIrpp(annualEquivalent);
            decimal irppMonthly = RoundToMillimes(annualIrpp / 12m);

            // 9. Salaire Net à Payer
            decimal netSalary = RoundToMillimes(grossSalary - cnssEmployee - irppMonthly - advances);

            // 10. Charges Patronales
            decimal cnssEmployer = RoundToMillimes((baseSalary + overtimeAmount + bonusesTaxable) * (DefaultCnssEmployerRate / 100m));
            decimal workAccident = RoundToMillimes((baseSalary + overtimeAmount + bonusesTaxable) * (workAccidentRate / 100m));
            decimal foprolos = RoundToMillimes((baseSalary + overtimeAmount + bonusesTaxable) * (DefaultFoprolosRate / 100m));
            decimal tfpRate = isManufacturing ? DefaultTfpRateIndustry : DefaultTfpRateCommerce;
            decimal tfp = RoundToMillimes((baseSalary + overtimeAmount + bonusesTaxable) * (tfpRate / 100m));

            decimal totalEmployerCost = RoundToMillimes(grossSalary + cnssEmployer + workAccident + foprolos + tfp);

            return new PayrollCalculationResult(
                GrossSalary: grossSalary,
                CnssEmployee: cnssEmployee,
                TaxableGross: taxableGross,
                ProfessionalExpenses: profExpenses,
                FamilyDeductions: familyDeductions,
                NetTaxableMonthly: netTaxableMonthly,
                IrppMonthly: irppMonthly,
                NetSalary: netSalary,
                CnssEmployer: cnssEmployer,
                WorkAccident: workAccident,
                Foprolos: foprolos,
                Tfp: tfp,
                TotalEmployerCost: totalEmployerCost
            );
        }

        /// <summary>
        /// Barème progressif IRPP tunisien officiel (Code de l'IRPP et de l'IS).
        /// </summary>
        private static decimal CalculateAnnualIrpp(decimal annualNetTaxable)
        {
            if (annualNetTaxable <= 5000m)
                return 0.000m;

            decimal tax = 0.000m;

            // Tranche 1: 5 000 à 20 000 (26%)
            if (annualNetTaxable > 5000m)
            {
                decimal tranche = Math.Min(annualNetTaxable, 20000m) - 5000m;
                tax += tranche * 0.26m;
            }

            // Tranche 2: 20 000 à 30 000 (28%)
            if (annualNetTaxable > 20000m)
            {
                decimal tranche = Math.Min(annualNetTaxable, 30000m) - 20000m;
                tax += tranche * 0.28m;
            }

            // Tranche 3: 30 000 à 50 000 (32%)
            if (annualNetTaxable > 30000m)
            {
                decimal tranche = Math.Min(annualNetTaxable, 50000m) - 30000m;
                tax += tranche * 0.32m;
            }

            // Tranche 4: Au-delà de 50 000 (35%)
            if (annualNetTaxable > 50000m)
            {
                decimal tranche = annualNetTaxable - 50000m;
                tax += tranche * 0.35m;
            }

            return RoundToMillimes(tax);
        }
    }
}
