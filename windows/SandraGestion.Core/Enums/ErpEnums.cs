namespace SandraGestion.Core.Enums
{
    /// <summary>
    /// Dual session architecture for Tunisian business reality.
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public enum ErpSessionType
    {
        Financiere = 1, // Official legal/fiscal SCE accounting, tax declarations, audit
        Reelle = 2      // Factory operations, real shopfloor production, raw materials, real cost of goods sold
    }

    public enum UserRole
    {
        SuperAdmin = 1,     // Global administrator across all factories & companies
        CompanyOwner = 2,   // Managing director / PDG of the company
        Accountant = 3,     // Responsible for SCE accounting & fiscal books
        FactoryManager = 4, // Production manager, shopfloor supervisor, raw materials BOM
        SalesAgent = 5,     // Commercial, quotes, delivery notes, billing
        Cashier = 6,        // Point of sale, daily cash receipts
        Auditor = 7         // Read-only auditor (commissaire aux comptes)
    }

    public enum CompanyActivityType
    {
        ManufacturingFactory = 1, // Usine de fabrication (FODEC 1% applicable)
        Commercial = 2,           // Société de négoce / commerce
        Services = 3              // Société de services / ingénierie
    }

    public enum VatRateTunisia
    {
        Standard19 = 19,
        Reduced7 = 7,
        Intermediate13 = 13,
        Exempt0 = 0
    }

    public enum InvoiceDirection
    {
        Sale = 1,
        Purchase = 2
    }

    public enum InvoiceStatus
    {
        Draft = 0,
        Validated = 1,
        Paid = 2,
        Cancelled = 3
    }

    public enum ProductionOrderStatus
    {
        Planned = 1,
        InProgress = 2,
        Completed = 3,
        Cancelled = 4
    }

    public enum StockItemCategory
    {
        RawMaterial = 1,  // Matière première (MP)
        FinishedGood = 2, // Produit fini (PF)
        SemiFinished = 3, // Produit semi-fini
        Packaging = 4,    // Emballage
        Merchandise = 5   // Marchandise
    }
}
