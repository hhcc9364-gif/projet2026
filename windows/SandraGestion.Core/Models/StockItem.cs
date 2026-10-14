using System;
using SandraGestion.Core.Enums;

namespace SandraGestion.Core.Models
{
    /// <summary>
    /// Inventory item (Raw material, finished good, or packaging).
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public class StockItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string CompanyId { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Barcode { get; set; }
        public string NameFr { get; set; } = string.Empty;
        public string NameAr { get; set; } = string.Empty;
        public StockItemCategory Category { get; set; } = StockItemCategory.FinishedGood;
        public string Unit { get; set; } = "U";
        public decimal PurchasePriceHt { get; set; }
        public decimal SellingPriceHt { get; set; }
        public decimal VatRate { get; set; } = 19.0m;
        public bool FodecApplicable { get; set; }
        public decimal StockMinimum { get; set; }
        public decimal StockActuel { get; set; }
        public decimal ValeurStockPmp { get; set; } // Prix moyen pondéré
        public bool IsActive { get; set; } = true;
    }

    public class ThirdParty
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string CompanyId { get; set; } = string.Empty;
        public string Type { get; set; } = "CLIENT"; // CLIENT or SUPPLIER
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? MatriculeFiscal { get; set; }
        public string? RegistreCommerce { get; set; }
        public string? Address { get; set; }
        public string? Governorate { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public bool VatExempt { get; set; }
        public decimal RetenueSourceRate { get; set; }
        public int PaymentTermsDays { get; set; } = 30;
        public decimal SoldeActuel { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
