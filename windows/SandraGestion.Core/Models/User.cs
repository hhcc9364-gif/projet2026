using System;
using SandraGestion.Core.Enums;

namespace SandraGestion.Core.Models
{
    /// <summary>
    /// User account with role-based permissions and strict company tenancy.
    /// SuperAdmin has CompanyId = null.
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public class User
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string? CompanyId { get; set; } // Null for SuperAdmin
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string PasswordHash { get; set; } = string.Empty;
        public string PasswordSalt { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.CompanyOwner;
        public string PermissionsJson { get; set; } = "[]";
        public string PreferredLanguage { get; set; } = "fr"; // "fr" or "ar"
        public bool IsActive { get; set; } = true;
        public DateTime? LastLoginAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsSuperAdmin => Role == UserRole.SuperAdmin && string.IsNullOrEmpty(CompanyId);
    }
}
