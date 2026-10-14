using System;
using System.Collections.Generic;
using SandraGestion.Core.Enums;

namespace SandraGestion.Core.Models
{
    /// <summary>
    /// Accounting Entry compliant with the Tunisian Accounting Standard (SCE 1997).
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public class AccountingEntry
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string CompanyId { get; set; } = string.Empty;
        public ErpSessionType SessionType { get; set; } = ErpSessionType.Financiere;
        public string JournalCode { get; set; } = "VT"; // VT, AC, BQ, CA, OD
        public string EntryNumber { get; set; } = string.Empty;
        public DateTime EntryDate { get; set; } = DateTime.Today;
        public string? PieceJustificative { get; set; }
        public string Libelle { get; set; } = string.Empty;
        public decimal DebitTotal { get; set; }
        public decimal CreditTotal { get; set; }
        public bool IsBalanced => Math.Abs(DebitTotal - CreditTotal) < 0.001m;
        public bool IsValidated { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<AccountingEntryLine> Lines { get; set; } = new();
    }

    public class AccountingEntryLine
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string EntryId { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty; // e.g. 701000, 411000, 445700
        public string AccountLabel { get; set; } = string.Empty;
        public string? Libelle { get; set; }
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public string? TiersId { get; set; }
    }
}
