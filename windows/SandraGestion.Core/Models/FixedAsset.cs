using System;

namespace SandraGestion.Core.Models
{
    /// <summary>
    /// Immobilisation corporelle ou incorporelle (SCE Tunisie).
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public class FixedAsset
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string CompanyId { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = "INDUSTRIAL_EQUIPMENT";
        public DateTime AcquisitionDate { get; set; } = DateTime.Today;
        public DateTime CommissioningDate { get; set; } = DateTime.Today;

        // Comptes SCE
        public string AccountAssetCode { get; set; } = "223000";    // Compte d'actif
        public string AccountAmortCode { get; set; } = "282300";    // Amortissement cumulé
        public string AccountDotationCode { get; set; } = "681100"; // Dotation aux amortissements

        public decimal AcquisitionCostHt { get; set; }
        public decimal AdditionalExpensesHt { get; set; }
        public decimal TotalGrossValue { get; set; }
        public decimal ResidualValue { get; set; }
        public string DepreciationMethod { get; set; } = "LINEAR"; // LINEAR, DECLINING
        public int UsefulLifeYears { get; set; } = 5;
        public decimal AnnualRate { get; set; } = 20.0m;

        public decimal AccumulatedDepreciation { get; set; }
        public decimal NetBookValue { get; set; } // Valeur Nette Comptable (VNC)

        public bool IsRetired { get; set; } = false;
        public DateTime? DisposalDate { get; set; }
        public decimal DisposalProceeds { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class DepreciationSchedule
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string AssetId { get; set; } = string.Empty;
        public int FiscalYear { get; set; }
        public decimal DepreciationBase { get; set; }
        public decimal DepreciationAmount { get; set; }
        public decimal CumulativeDepreciation { get; set; }
        public decimal NetBookValueEnd { get; set; }
        public bool IsPosted { get; set; }
        public string? AccountingEntryId { get; set; }
    }
}
