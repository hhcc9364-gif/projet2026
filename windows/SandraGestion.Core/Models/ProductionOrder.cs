using System;
using System.Collections.Generic;
using SandraGestion.Core.Enums;

namespace SandraGestion.Core.Models
{
    /// <summary>
    /// Factory Production Order (Session Réelle).
    /// Tracks raw material consumption, scrap, labor, machine hours, and real cost.
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public class ProductionOrder
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string CompanyId { get; set; } = string.Empty;
        public ErpSessionType SessionType { get; set; } = ErpSessionType.Reelle;
        public string OrderNumber { get; set; } = string.Empty;
        public string BomId { get; set; } = string.Empty;
        public string FinishedGoodId { get; set; } = string.Empty;
        public string FinishedGoodName { get; set; } = string.Empty;
        
        public decimal QuantityPlanned { get; set; }
        public decimal QuantityProduced { get; set; }
        public decimal QuantityScrap { get; set; } // Rebuts
        public ProductionOrderStatus Status { get; set; } = ProductionOrderStatus.Planned;
        
        public DateTime? DateStart { get; set; }
        public DateTime? DateEnd { get; set; }
        
        // Real cost calculation in Dinars (TND)
        public decimal CostRawMaterials { get; set; }
        public decimal CostLabor { get; set; }
        public decimal CostMachineOverhead { get; set; }
        public decimal CostTotalReal { get; set; }
        public decimal UnitCostReal { get; set; }
        
        public string SupervisorId { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<ProductionConsumptionLine> Consumptions { get; set; } = new();
    }

    public class ProductionConsumptionLine
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string ProductionOrderId { get; set; } = string.Empty;
        public string RawMaterialId { get; set; } = string.Empty;
        public string RawMaterialName { get; set; } = string.Empty;
        public decimal QuantityPlanned { get; set; }
        public decimal QuantityConsumedReal { get; set; }
        public decimal UnitCost { get; set; }
        public decimal TotalCost { get; set; }
    }
}
