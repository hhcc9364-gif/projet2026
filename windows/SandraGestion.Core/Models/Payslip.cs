using System;

namespace SandraGestion.Core.Models
{
    /// <summary>
    /// Bulletin de paie tunisien conforme aux règles CNSS et IRPP.
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public class Payslip
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string PayrollRunId { get; set; } = string.Empty;
        public string EmployeeId { get; set; } = string.Empty;
        public string CompanyId { get; set; } = string.Empty;

        // Éléments du Salaire Brut (TND)
        public decimal BaseSalary { get; set; }
        public decimal OvertimeHours { get; set; }
        public decimal OvertimeAmount { get; set; }
        public decimal BonusesTaxable { get; set; }
        public decimal BonusesExempt { get; set; }
        public decimal GrossSalary { get; set; }

        // Retenue Salariale CNSS (9.18%)
        public decimal CnssRateEmployee { get; set; } = 9.18m;
        public decimal CnssEmployeeAmount { get; set; }

        // Calcul IRPP (Impôt sur le Revenu des Personnes Physiques)
        public decimal TaxableGross { get; set; }
        public decimal ProfessionalExpensesDeduction { get; set; } // 10% plafonné
        public decimal FamilyDeduction { get; set; }
        public decimal NetTaxable { get; set; }
        public decimal IrppAmount { get; set; }
        public decimal AdvancesDeduction { get; set; }

        // Salaire Net à Payer
        public decimal NetSalary { get; set; }

        // Charges Patronales Usine/Entreprise
        public decimal CnssEmployerRate { get; set; } = 16.57m;
        public decimal CnssEmployerAmount { get; set; }
        public decimal WorkAccidentRate { get; set; } = 1.5m; // Accidents du travail
        public decimal WorkAccidentAmount { get; set; }
        public decimal FoprolosAmount { get; set; } // 1%
        public decimal TfpAmount { get; set; }      // 1% usine ou 2% négoce
        public decimal TotalEmployerCost { get; set; }
    }

    public class PayrollRun
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string CompanyId { get; set; } = string.Empty;
        public int PeriodYear { get; set; }
        public int PeriodMonth { get; set; }
        public DateTime RunDate { get; set; } = DateTime.Today;
        public decimal TotalGross { get; set; }
        public decimal TotalCnssEmployee { get; set; }
        public decimal TotalTaxableGross { get; set; }
        public decimal TotalIrpp { get; set; }
        public decimal TotalNet { get; set; }
        public decimal TotalEmployerCost { get; set; }
        public bool IsPostedToAccounting { get; set; }
        public string? AccountingEntryId { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
