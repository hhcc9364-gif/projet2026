using System;
using System.Collections.Generic;
using SandraGestion.Core.Models;
using SandraGestion.Core.Services;
using Xunit;

namespace SandraGestion.Tests
{
    public class TunisianPayrollAndAssetTests
    {
        private readonly TunisianPayrollCalculator _payrollCalc = new();
        private readonly FixedAssetDepreciationCalculator _assetCalc = new();
        private readonly AccountingIntegrityService _integrityService = new();
        private readonly DataSynchronizationService _syncService = new();

        [Fact]
        public void TunisianPayrollCalculator_StandardFactoryWorker_CalculatesExactContributions()
        {
            // Base Salary: 1200 TND, Married with 2 children, Factory worker (TFP 1%)
            var result = _payrollCalc.CalculatePayslip(
                baseSalary: 1200.000m,
                overtimeHours: 0m,
                hourlyRate: 7.500m,
                bonusesTaxable: 0m,
                bonusesExempt: 0m,
                maritalStatus: "MARRIED",
                childrenCount: 2,
                isManufacturing: true,
                workAccidentRate: 1.5m
            );

            // Assert CNSS Employee 9.18% on 1200 DT = 110.160 DT
            Assert.Equal(1200.000m, result.GrossSalary);
            Assert.Equal(110.160m, result.CnssEmployee);
            Assert.Equal(1089.840m, result.TaxableGross);

            // CNSS Employer 16.57% on 1200 DT = 198.840 DT
            Assert.Equal(198.840m, result.CnssEmployer);

            // FOPROLOS 1% = 12.000 DT, TFP 1% = 12.000 DT, Accident 1.5% = 18.000 DT
            Assert.Equal(12.000m, result.Foprolos);
            Assert.Equal(12.000m, result.Tfp);
            Assert.Equal(18.000m, result.WorkAccident);

            // Total employer cost = 1200 + 198.840 + 18 + 12 + 12 = 1440.840 DT
            Assert.Equal(1440.840m, result.TotalEmployerCost);
        }

        [Fact]
        public void FixedAssetDepreciationCalculator_Linear5Years_GeneratesAccurateSchedule()
        {
            var asset = new FixedAsset
            {
                Id = "asset-test-01",
                TotalGrossValue = 60000.000m,
                ResidualValue = 0m,
                UsefulLifeYears = 5,
                CommissioningDate = new DateTime(2026, 1, 1)
            };

            var schedules = _assetCalc.GenerateLinearSchedule(asset);

            Assert.Equal(5, schedules.Count);
            // Each year = 12 000 DT
            foreach (var s in schedules)
            {
                Assert.Equal(12000.000m, s.DepreciationAmount);
            }
            Assert.Equal(60000.000m, schedules[^1].CumulativeDepreciation);
            Assert.Equal(0.000m, schedules[^1].NetBookValueEnd);
        }

        [Fact]
        public void AccountingIntegrityService_UnbalancedEntry_IsRejected()
        {
            var entry = new AccountingEntry
            {
                Lines = new List<AccountingEntryLine>
                {
                    new() { Debit = 1000m, Credit = 0m },
                    new() { Debit = 0m, Credit = 950m }
                }
            };

            bool isValid = _integrityService.ValidateEntryBalance(entry);
            Assert.False(isValid);
        }

        [Fact]
        public void AccountingIntegrityService_CreateReversal_InvertsDebitAndCreditExactly()
        {
            var original = new AccountingEntry
            {
                Id = "orig-01",
                CompanyId = "comp-01",
                EntryNumber = "ECR-100",
                Libelle = "Facture Fournisseur",
                Lines = new List<AccountingEntryLine>
                {
                    new() { AccountNumber = "601000", Debit = 500m, Credit = 0m },
                    new() { AccountNumber = "401000", Debit = 0m, Credit = 500m }
                },
                DebitTotal = 500m,
                CreditTotal = 500m
            };

            var (reversal, reversalRecord) = _integrityService.CreateReversal(original, "user-admin", "Correction erreur de compte");

            Assert.Equal("REV-ECR-100", reversal.EntryNumber);
            Assert.Equal(500m, reversal.DebitTotal);
            Assert.Equal(500m, reversal.CreditTotal);
            // Inverted
            Assert.Equal(500m, reversal.Lines[0].Credit);
            Assert.Equal(500m, reversal.Lines[1].Debit);
            Assert.Equal("orig-01", reversalRecord.OriginalEntryId);
        }

        [Fact]
        public void DataSynchronizationService_WrongCompanyOrUntrusted_Rejects()
        {
            var envelope = new SyncEnvelope(
                ProtocolVersion: "2.0.0",
                PacketId: Guid.NewGuid().ToString(),
                ClientDeviceId: "device-untrusted",
                CompanyId: "comp-A",
                Timestamp: DateTime.UtcNow,
                Changes: new List<SyncChangeItem>()
            );

            // 1. Untrusted device test
            bool okDevice = _syncService.IngestPacket(envelope, "comp-A", isDeviceTrusted: false, out string err1);
            Assert.False(okDevice);
            Assert.Contains("non autorisé", err1);

            // 2. Cross-tenant attempt test
            bool okTenant = _syncService.IngestPacket(envelope, "comp-B", isDeviceTrusted: true, out string err2);
            Assert.False(okTenant);
            Assert.Contains("multi-entreprises", err2);

            // 3. Valid ingestion & idempotency test
            bool okValid = _syncService.IngestPacket(envelope, "comp-A", isDeviceTrusted: true, out string err3);
            Assert.True(okValid);

            // Repeated ingestion with same packet id (Idempotent)
            bool okIdempotent = _syncService.IngestPacket(envelope, "comp-A", isDeviceTrusted: true, out string err4);
            Assert.True(okIdempotent);
        }
    }
}
