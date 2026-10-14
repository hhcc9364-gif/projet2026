using System;
using System.Collections.Generic;
using System.Linq;
using SandraGestion.Core.Models;

namespace SandraGestion.Core.Services
{
    /// <summary>
    /// Service d'intégrité comptable SCE et de contre-passation contrôlée.
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public class AccountingIntegrityService
    {
        /// <summary>
        /// Vérifie que l'écriture comptable respecte la partie double (Débit == Crédit).
        /// </summary>
        public bool ValidateEntryBalance(AccountingEntry entry)
        {
            decimal sumDebit = entry.Lines.Sum(l => l.Debit);
            decimal sumCredit = entry.Lines.Sum(l => l.Credit);

            entry.DebitTotal = Math.Round(sumDebit, 3);
            entry.CreditTotal = Math.Round(sumCredit, 3);

            return Math.Abs(entry.DebitTotal - entry.CreditTotal) < 0.001m;
        }

        /// <summary>
        /// Crée une écriture de contre-passation (inversion exacte des débits et crédits).
        /// Protège contre toute altération silencieuse de l'écriture originale.
        /// </summary>
        public (AccountingEntry ReversalEntry, AccountingEntryReversal ReversalRecord) CreateReversal(
            AccountingEntry originalEntry,
            string userId,
            string reason)
        {
            if (string.IsNullOrWhiteSpace(reason))
                throw new ArgumentException("Le motif de la contre-passation est obligatoire.");

            var reversalLines = originalEntry.Lines.Select(l => new AccountingEntryLine
            {
                AccountNumber = l.AccountNumber,
                AccountLabel = l.AccountLabel,
                Libelle = $"ANNULATION: {l.Libelle ?? originalEntry.Libelle}",
                Debit = l.Credit,   // Inversion stricte
                Credit = l.Debit,  // Inversion stricte
                TiersId = l.TiersId
            }).ToList();

            var reversalEntry = new AccountingEntry
            {
                CompanyId = originalEntry.CompanyId,
                SessionType = originalEntry.SessionType,
                JournalCode = originalEntry.JournalCode,
                EntryNumber = $"REV-{originalEntry.EntryNumber}",
                EntryDate = DateTime.Today,
                PieceJustificative = originalEntry.PieceJustificative,
                Libelle = $"ANNULATION / CONTRE-PASSATION: {originalEntry.Libelle} (Motif: {reason})",
                Lines = reversalLines,
                DebitTotal = originalEntry.CreditTotal,
                CreditTotal = originalEntry.DebitTotal,
                IsValidated = true,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow
            };

            var reversalRecord = new AccountingEntryReversal
            {
                CompanyId = originalEntry.CompanyId,
                OriginalEntryId = originalEntry.Id,
                ReversalEntryId = reversalEntry.Id,
                Reason = reason,
                ReversedBy = userId,
                ReversedAt = DateTime.UtcNow
            };

            return (reversalEntry, reversalRecord);
        }
    }
}
