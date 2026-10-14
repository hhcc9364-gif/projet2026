using System;
using System.Collections.Generic;

namespace SandraGestion.Core.Models
{
    /// <summary>
    /// Modèles pour la synchronisation sécurisée et la contre-passation comptable.
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public class SyncChangeLog
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string CompanyId { get; set; } = string.Empty;
        public string ClientDeviceId { get; set; } = string.Empty;
        public string TableName { get; set; } = string.Empty;
        public string RecordId { get; set; } = string.Empty;
        public string Operation { get; set; } = "INSERT"; // INSERT, UPDATE, DELETE
        public string DataPayloadJson { get; set; } = "{}";
        public long ChangeVector { get; set; }
        public bool ConflictResolved { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class SyncDeviceRegistration
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string CompanyId { get; set; } = string.Empty;
        public string DeviceId { get; set; } = string.Empty;
        public string DeviceName { get; set; } = string.Empty;
        public string Platform { get; set; } = "WINDOWS_WPF"; // WINDOWS_WPF, ANDROID_KOTLIN
        public string RegisteredUserId { get; set; } = string.Empty;
        public string? PublicKeyFingerprint { get; set; }
        public DateTime? LastSyncAt { get; set; }
        public bool IsTrusted { get; set; } = true;
    }

    public class AccountingEntryReversal
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string CompanyId { get; set; } = string.Empty;
        public string OriginalEntryId { get; set; } = string.Empty;
        public string ReversalEntryId { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string ReversedBy { get; set; } = string.Empty;
        public DateTime ReversedAt { get; set; } = DateTime.UtcNow;
    }

    public class FiscalPeriod
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string CompanyId { get; set; } = string.Empty;
        public int FiscalYear { get; set; }
        public int Month { get; set; }
        public bool IsClosed { get; set; }
        public DateTime? ClosedAt { get; set; }
        public string? ClosedBy { get; set; }
    }
}
