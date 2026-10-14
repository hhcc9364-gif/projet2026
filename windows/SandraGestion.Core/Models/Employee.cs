using System;

namespace SandraGestion.Core.Models
{
    /// <summary>
    /// Salarié ou ouvrier d'usine en Tunisie.
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public class Employee
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string CompanyId { get; set; } = string.Empty;
        public string Matricule { get; set; } = string.Empty;
        public string Cin { get; set; } = string.Empty; // Carte d'Identité Nationale (8 chiffres)
        public string? CnssNumber { get; set; }          // Numéro CNSS
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public DateTime HireDate { get; set; } = DateTime.Today;
        public string Department { get; set; } = "Atelier Usine";
        public string JobTitle { get; set; } = "Opérateur de Production";
        public string ContractType { get; set; } = "CDI"; // CDI, CDD, SIVP, CIVP
        public string MaritalStatus { get; set; } = "SINGLE"; // SINGLE, MARRIED
        public int ChildrenCount { get; set; } = 0;
        public decimal BaseSalaryMonthly { get; set; }
        public decimal HourlyRate { get; set; }
        public string? BankName { get; set; }
        public string? BankRib { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string FullName => $"{FirstName} {LastName}".Trim();
    }
}
