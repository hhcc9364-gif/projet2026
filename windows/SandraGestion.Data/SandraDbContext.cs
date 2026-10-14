using System;
using Microsoft.EntityFrameworkCore;
using SandraGestion.Core.Models;

namespace SandraGestion.Data
{
    /// <summary>
    /// SQLite Database Context with strict Multi-Tenant Isolation & Session Segregation.
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public class SandraDbContext : DbContext
    {
        public string? CurrentCompanyId { get; set; }

        public SandraDbContext(DbContextOptions<SandraDbContext> options) : base(options)
        {
        }

        public DbSet<Company> Companies => Set<Company>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Invoice> Invoices => Set<Invoice>();
        public DbSet<InvoiceLine> InvoiceLines => Set<InvoiceLine>();
        public DbSet<ProductionOrder> ProductionOrders => Set<ProductionOrder>();
        public DbSet<ProductionConsumptionLine> ProductionConsumptions => Set<ProductionConsumptionLine>();
        public DbSet<AccountingEntry> AccountingEntries => Set<AccountingEntry>();
        public DbSet<AccountingEntryLine> AccountingEntryLines => Set<AccountingEntryLine>();
        public DbSet<StockItem> StockItems => Set<StockItem>();
        public DbSet<ThirdParty> ThirdParties => Set<ThirdParty>();
        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<PayrollRun> PayrollRuns => Set<PayrollRun>();
        public DbSet<Payslip> Payslips => Set<Payslip>();
        public DbSet<FixedAsset> FixedAssets => Set<FixedAsset>();
        public DbSet<DepreciationSchedule> DepreciationSchedules => Set<DepreciationSchedule>();
        public DbSet<SyncChangeLog> SyncChangeLogs => Set<SyncChangeLog>();
        public DbSet<SyncDeviceRegistration> SyncDeviceRegistrations => Set<SyncDeviceRegistration>();
        public DbSet<AccountingEntryReversal> AccountingEntryReversals => Set<AccountingEntryReversal>();
        public DbSet<FiscalPeriod> FiscalPeriods => Set<FiscalPeriod>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Companies
            modelBuilder.Entity<Company>(b =>
            {
                b.ToTable("companies");
                b.HasKey(c => c.Id);
                b.HasIndex(c => c.MatriculeFiscal).IsUnique();
                b.Property(c => c.TimbreFiscalAmount).HasPrecision(18, 3);
            });

            // Users
            modelBuilder.Entity<User>(b =>
            {
                b.ToTable("users");
                b.HasKey(u => u.Id);
                b.HasIndex(u => u.Username).IsUnique();
                b.HasIndex(u => u.CompanyId);
                // Global tenant isolation filter
                b.HasQueryFilter(u => CurrentCompanyId == null || u.CompanyId == null || u.CompanyId == CurrentCompanyId);
            });

            // Invoices with strict company isolation
            modelBuilder.Entity<Invoice>(b =>
            {
                b.ToTable("invoices");
                b.HasKey(i => i.Id);
                b.HasIndex(i => new { i.CompanyId, i.InvoiceNumber }).IsUnique();
                b.HasIndex(i => new { i.CompanyId, i.SessionType });

                // Format monetary fields to 3 decimals (Millimes)
                b.Property(i => i.TotalHt).HasPrecision(18, 3);
                b.Property(i => i.TotalVat).HasPrecision(18, 3);
                b.Property(i => i.TimbreFiscal).HasPrecision(18, 3);
                b.Property(i => i.TotalTtc).HasPrecision(18, 3);
                b.Property(i => i.NetToPay).HasPrecision(18, 3);

                // Multi-tenant Query Filter
                b.HasQueryFilter(i => CurrentCompanyId == null || i.CompanyId == CurrentCompanyId);
            });

            // Production Orders (Session Réelle) with strict company isolation
            modelBuilder.Entity<ProductionOrder>(b =>
            {
                b.ToTable("production_orders");
                b.HasKey(p => p.Id);
                b.HasIndex(p => new { p.CompanyId, p.OrderNumber }).IsUnique();
                b.HasIndex(p => new { p.CompanyId, p.SessionType });

                b.Property(p => p.CostTotalReal).HasPrecision(18, 3);
                b.Property(p => p.UnitCostReal).HasPrecision(18, 3);

                // Multi-tenant Query Filter
                b.HasQueryFilter(p => CurrentCompanyId == null || p.CompanyId == CurrentCompanyId);
            });

            // Accounting Entries (Session Financière)
            modelBuilder.Entity<AccountingEntry>(b =>
            {
                b.ToTable("accounting_entries");
                b.HasKey(e => e.Id);
                b.HasIndex(e => new { e.CompanyId, e.SessionType });
                b.Property(e => e.DebitTotal).HasPrecision(18, 3);
                b.Property(e => e.CreditTotal).HasPrecision(18, 3);

                b.HasQueryFilter(e => CurrentCompanyId == null || e.CompanyId == CurrentCompanyId);
            });

            // Stock Items
            modelBuilder.Entity<StockItem>(b =>
            {
                b.ToTable("items");
                b.HasKey(s => s.Id);
                b.HasIndex(s => new { s.CompanyId, s.Code }).IsUnique();
                b.Property(s => s.PurchasePriceHt).HasPrecision(18, 3);
                b.Property(s => s.SellingPriceHt).HasPrecision(18, 3);

                b.HasQueryFilter(s => CurrentCompanyId == null || s.CompanyId == CurrentCompanyId);
            });

            // Third Parties
            modelBuilder.Entity<ThirdParty>(b =>
            {
                b.ToTable("third_parties");
                b.HasKey(t => t.Id);
                b.HasIndex(t => new { t.CompanyId, t.Code }).IsUnique();
                b.Property(t => t.SoldeActuel).HasPrecision(18, 3);

                b.HasQueryFilter(t => CurrentCompanyId == null || t.CompanyId == CurrentCompanyId);
            });

            // Employees
            modelBuilder.Entity<Employee>(b =>
            {
                b.ToTable("employees");
                b.HasKey(e => e.Id);
                b.HasIndex(e => new { e.CompanyId, e.Matricule }).IsUnique();
                b.Property(e => e.BaseSalaryMonthly).HasPrecision(18, 3);
                b.HasQueryFilter(e => CurrentCompanyId == null || e.CompanyId == CurrentCompanyId);
            });

            // Payslips
            modelBuilder.Entity<Payslip>(b =>
            {
                b.ToTable("payslips");
                b.HasKey(p => p.Id);
                b.Property(p => p.NetSalary).HasPrecision(18, 3);
                b.Property(p => p.TotalEmployerCost).HasPrecision(18, 3);
                b.HasQueryFilter(p => CurrentCompanyId == null || p.CompanyId == CurrentCompanyId);
            });

            // Fixed Assets
            modelBuilder.Entity<FixedAsset>(b =>
            {
                b.ToTable("fixed_assets");
                b.HasKey(a => a.Id);
                b.HasIndex(a => new { a.CompanyId, a.Code }).IsUnique();
                b.Property(a => a.TotalGrossValue).HasPrecision(18, 3);
                b.Property(a => a.NetBookValue).HasPrecision(18, 3);
                b.HasQueryFilter(a => CurrentCompanyId == null || a.CompanyId == CurrentCompanyId);
            });

            // Sync Log
            modelBuilder.Entity<SyncChangeLog>(b =>
            {
                b.ToTable("sync_change_log");
                b.HasKey(s => s.Id);
                b.HasQueryFilter(s => CurrentCompanyId == null || s.CompanyId == CurrentCompanyId);
            });
        }
    }
}
