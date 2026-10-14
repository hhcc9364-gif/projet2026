using System;
using System.Collections.Generic;
using SandraGestion.Core.Enums;

namespace SandraGestion.Core.Models
{
    /// <summary>
    /// Commercial & Fiscal Invoice conforming to Tunisian requirements.
    /// Timbre fiscal (1.000 TND), VAT rates (19%, 7%, 13%), Retenue à la source.
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public class Invoice
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string CompanyId { get; set; } = string.Empty;
        public ErpSessionType SessionType { get; set; } = ErpSessionType.Financiere;
        public InvoiceDirection Direction { get; set; } = InvoiceDirection.Sale;
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; } = DateTime.Today;
        public DateTime DueDate { get; set; } = DateTime.Today.AddDays(30);
        public string ThirdPartyId { get; set; } = string.Empty;
        public string ThirdPartyName { get; set; } = string.Empty;
        
        // Financial breakdown in Tunisian Dinars (3 millimes precision)
        public decimal TotalHt { get; set; }
        public decimal TotalFodec { get; set; }
        public decimal TotalVat19 { get; set; }
        public decimal TotalVat7 { get; set; }
        public decimal TotalVat13 { get; set; }
        public decimal TotalVat { get; set; }
        public decimal TimbreFiscal { get; set; } = 1.000m;
        public decimal TotalTtc { get; set; }
        public decimal RetenueSourceRate { get; set; } // e.g. 1.5%
        public decimal RetenueSourceAmount { get; set; }
        public decimal NetToPay { get; set; }
        public decimal AmountPaid { get; set; }
        
        public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
        public string? Notes { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<InvoiceLine> Lines { get; set; } = new();
    }

    public class InvoiceLine
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string InvoiceId { get; set; } = string.Empty;
        public string? ItemId { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Quantity { get; set; } = 1.0m;
        public decimal UnitPriceHt { get; set; }
        public decimal DiscountPct { get; set; }
        public decimal TotalHt { get; set; }
        public decimal VatRate { get; set; } = 19.0m;
        public decimal VatAmount { get; set; }
        public decimal FodecAmount { get; set; }
        public decimal TotalTtc { get; set; }
    }
}
