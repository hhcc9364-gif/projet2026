using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using SandraGestion.Core.Enums;
using SandraGestion.Core.Models;
using SandraGestion.Core.Services;
using SandraGestion.Core.Validation;
using SandraGestion.Data;
using Xunit;

namespace SandraGestion.Tests
{
    public class TunisianFiscalAndIsolationTests
    {
        private readonly TunisianTaxCalculator _taxCalc = new();

        [Fact]
        public void TunisianTaxCalculator_StandardSaleInvoice_CalculatesVatAndTimbreCorrectly()
        {
            // Arrange
            var lines = new List<InvoiceLine>
            {
                new InvoiceLine
                {
                    UnitPriceHt = 500.000m,
                    Quantity = 2m,
                    DiscountPct = 0m,
                    VatRate = 19.0m
                }
            };

            // Act: 1000.000 HT + TVA 19% (190.000) + Timbre (1.000) = 1191.000 TTC
            var result = _taxCalc.CalculateInvoiceTotals(lines, companyFodecApplicable: false, retenueSourceRate: 0m, applyTimbre: true);

            // Assert
            Assert.Equal(1000.000m, result.TotalHt);
            Assert.Equal(190.000m, result.TotalVat19);
            Assert.Equal(1.000m, result.TimbreFiscal);
            Assert.Equal(1191.000m, result.TotalTtc);
            Assert.Equal(1191.000m, result.NetToPay);
        }

        [Fact]
        public void TunisianTaxCalculator_FactoryWithFodecAndRetenueSource_CalculatesExactMillimes()
        {
            // Arrange: 1000 DT HT, FODEC 1% (10 DT), TVA 19% on (1010 DT) = 191.900 DT, Timbre 1.000 DT
            var lines = new List<InvoiceLine>
            {
                new InvoiceLine
                {
                    UnitPriceHt = 1000.000m,
                    Quantity = 1m,
                    DiscountPct = 0m,
                    VatRate = 19.0m,
                    FodecAmount = 10.000m
                }
            };

            // Act
            var result = _taxCalc.CalculateInvoiceTotals(lines, companyFodecApplicable: true, retenueSourceRate: 1.5m, applyTimbre: true);

            // Assert
            Assert.Equal(1000.000m, result.TotalHt);
            Assert.Equal(10.000m, result.TotalFodec);
            Assert.Equal(191.900m, result.TotalVat19);
            Assert.Equal(1.000m, result.TimbreFiscal);
            Assert.Equal(1202.900m, result.TotalTtc);
            Assert.True(result.RetenueSourceAmount > 0);
            Assert.Equal(result.TotalTtc - result.RetenueSourceAmount, result.NetToPay);
        }

        [Theory]
        [InlineData("1458923/A/M/000", true)]
        [InlineData("0892314/P/P/000", true)]
        [InlineData("9999999/C/C/001", true)]
        [InlineData("invalid_matricule", false)]
        [InlineData("12345/A/M/000", false)] // Only 5 digits
        [InlineData("1458923/Z/X/000", false)] // Invalid category
        public void MatriculeFiscalValidator_ValidatesOfficialTunisianFormat(string matricule, bool expected)
        {
            bool actual = MatriculeFiscalValidator.IsValid(matricule);
            Assert.Equal(expected, actual);
        }

        [Fact]
        public void PasswordSecurityService_ProducesUniqueSaltsAndVerifiesSuccessfully()
        {
            string password = "SecretMasterKey2026!";
            var (hash, salt) = PasswordSecurityService.HashPassword(password);

            Assert.False(string.IsNullOrEmpty(hash));
            Assert.False(string.IsNullOrEmpty(salt));
            Assert.True(PasswordSecurityService.VerifyPassword(password, hash, salt));
            Assert.False(PasswordSecurityService.VerifyPassword("WrongPassword", hash, salt));
        }

        [Fact]
        public void DbContext_StrictTenantFilter_PreventsCrossCompanyDataLeakage()
        {
            // Arrange InMemory DB
            var options = new DbContextOptionsBuilder<SandraDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            using (var seedContext = new SandraDbContext(options))
            {
                seedContext.Invoices.AddRange(
                    new Invoice { Id = "inv-c1", CompanyId = "tenant-sfax", InvoiceNumber = "FAC-001", TotalTtc = 500m },
                    new Invoice { Id = "inv-c2", CompanyId = "tenant-tunis", InvoiceNumber = "FAC-002", TotalTtc = 900m }
                );
                seedContext.SaveChanges();
            }

            // Act & Assert for tenant-sfax
            using (var sfaxContext = new SandraDbContext(options))
            {
                sfaxContext.CurrentCompanyId = "tenant-sfax";
                var invoices = sfaxContext.Invoices.ToList();

                Assert.Single(invoices);
                Assert.Equal("inv-c1", invoices[0].Id);
                Assert.DoesNotContain(invoices, i => i.CompanyId == "tenant-tunis");
            }
        }
    }
}
