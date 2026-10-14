using System;
using System.Text.RegularExpressions;

namespace SandraGestion.Core.Validation
{
    /// <summary>
    /// Validates Tunisian Matricule Fiscal issued by the Direction Générale des Impôts (DGI).
    /// Format: [7 digits] / [Key letter] / [Category letter: M|P|C] / [Establishment code: 3 digits]
    /// Example: 1458923/A/M/000
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public static class MatriculeFiscalValidator
    {
        private static readonly Regex Pattern = new(
            @"^\d{7}/[A-Z]/[MPC]/\d{3}$",
            RegexOptions.Compiled | RegexOptions.IgnoreCase
        );

        public static bool IsValid(string? matriculeFiscal)
        {
            if (string.IsNullOrWhiteSpace(matriculeFiscal))
                return false;

            string cleaned = matriculeFiscal.Trim().ToUpperInvariant();
            return Pattern.IsMatch(cleaned);
        }
    }
}
