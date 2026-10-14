using System;
using System.Collections.Generic;
using System.Linq;
using SandraGestion.Core.Models;

namespace SandraGestion.Core.Services
{
    public record SyncChangeItem(
        string TableName,
        string Operation,
        string RecordId,
        string DataJson,
        long Vector
    );

    public record SyncEnvelope(
        string ProtocolVersion,
        string PacketId,
        string ClientDeviceId,
        string CompanyId,
        DateTime Timestamp,
        List<SyncChangeItem> Changes
    );

    /// <summary>
    /// Service de synchronisation sécurisée et idempotente Windows Desktop <-> Android.
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public class DataSynchronizationService
    {
        private readonly HashSet<string> _processedPacketIds = new();

        /// <summary>
        /// Valide et ingère un paquet de synchronisation avec vérification de l'idempotence et du tenant.
        /// </summary>
        public bool IngestPacket(
            SyncEnvelope envelope,
            string expectedCompanyId,
            bool isDeviceTrusted,
            out string errorMessage)
        {
            errorMessage = string.Empty;

            if (!isDeviceTrusted)
            {
                errorMessage = "Périphérique non autorisé ou révoqué.";
                return false;
            }

            if (!string.Equals(envelope.CompanyId, expectedCompanyId, StringComparison.OrdinalIgnoreCase))
            {
                errorMessage = "Violation de sécurité multi-entreprises : CompanyId invalide.";
                return false;
            }

            // Protection anti-rejeu et idempotence
            if (_processedPacketIds.Contains(envelope.PacketId))
            {
                // Déjà traité, pas de duplicata
                return true;
            }

            _processedPacketIds.Add(envelope.PacketId);
            return true;
        }
    }
}
