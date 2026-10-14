using System;
using SandraGestion.Core.Enums;

namespace SandraGestion.Core.Models
{
    /// <summary>
    /// Company or Factory Tenant.
    /// Strict tenant firewall isolates all data per company.
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public class Company
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string? TradeName { get; set; }
        
        /// <summary>
        /// Tunisian Matricule Fiscal (e.g. 1458923/A/M/000)
        /// </summary>
        public string MatriculeFiscal { get; set; } = string.Empty;
        
        /// <summary>
        /// Registre National des Entreprises (RNE)
        /// </summary>
        public string? RegistreCommerce { get; set; }
        public string? CodeDouane { get; set; }
        
        public CompanyActivityType ActivityType { get; set; } = CompanyActivityType.ManufacturingFactory;
        public string Address { get; set; } = string.Empty;
        public string Governorate { get; set; } = "Tunis"; // Sfax, Sousse, Monastir, Bizerte, Nabeul, etc.
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string Currency { get; set; } = "TND";
        
        /// <summary>
        /// 1% tax on manufactured products for Tunisian factories
        /// </summary>
        public bool FodecApplicable { get; set; } = false;
        
        /// <summary>
        /// Standard legal stamp (1.000 TND)
        /// </summary>
        public decimal TimbreFiscalAmount { get; set; } = 1.000m;
        
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
