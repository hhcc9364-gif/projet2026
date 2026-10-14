package com.sandragestion.app.domain.payroll

import java.math.BigDecimal
import java.math.RoundingMode

data class AndroidPayrollResult(
    val grossSalary: BigDecimal,
    val cnssEmployee: BigDecimal,
    val taxableGross: BigDecimal,
    val irppMonthly: BigDecimal,
    val netSalary: BigDecimal,
    val cnssEmployer: BigDecimal,
    val foprolos: BigDecimal,
    val tfp: BigDecimal,
    val totalEmployerCost: BigDecimal
)

/**
 * Moteur de paie tunisien pour l'application native Android.
 * Développé par Radhwen Ennaceur.
 */
object TunisianPayrollEngine {

    val CNSS_EMPLOYEE_RATE = BigDecimal("9.18")
    val CNSS_EMPLOYER_RATE = BigDecimal("16.57")
    val FOPROLOS_RATE = BigDecimal("1.00")
    val TFP_INDUSTRY_RATE = BigDecimal("1.00")

    private fun round(value: BigDecimal): BigDecimal = value.setScale(3, RoundingMode.HALF_UP)

    fun calculate(
        baseSalary: BigDecimal,
        isManufacturing: Boolean = true
    ): AndroidPayrollResult {
        val gross = round(baseSalary)
        val cnssEmp = round(gross.multiply(CNSS_EMPLOYEE_RATE).divide(BigDecimal("100"), 6, RoundingMode.HALF_UP))
        val taxableGross = gross.subtract(cnssEmp)

        // Déduction forfaitaire frais professionnels 10% plafonnée à 166.666 DT/mois
        val profMax = BigDecimal("166.666")
        var profExpenses = round(taxableGross.multiply(BigDecimal("0.10")))
        if (profExpenses > profMax) profExpenses = profMax

        val netTaxable = taxableGross.subtract(profExpenses)
        val annualNet = netTaxable.multiply(BigDecimal("12"))

        // IRPP selon barème progressif
        var annualTax = BigDecimal.ZERO
        if (annualNet > BigDecimal("5000")) {
            val tranche1 = annualNet.min(BigDecimal("20000")).subtract(BigDecimal("5000"))
            annualTax = annualTax.add(tranche1.multiply(BigDecimal("0.26")))
        }
        if (annualNet > BigDecimal("20000")) {
            val tranche2 = annualNet.min(BigDecimal("30000")).subtract(BigDecimal("20000"))
            annualTax = annualTax.add(tranche2.multiply(BigDecimal("0.28")))
        }
        val irppMonthly = round(annualTax.divide(BigDecimal("12"), 6, RoundingMode.HALF_UP))

        val netSalary = gross.subtract(cnssEmp).subtract(irppMonthly)
        val cnssPat = round(gross.multiply(CNSS_EMPLOYER_RATE).divide(BigDecimal("100"), 6, RoundingMode.HALF_UP))
        val foprolos = round(gross.multiply(FOPROLOS_RATE).divide(BigDecimal("100"), 6, RoundingMode.HALF_UP))
        val tfp = round(gross.multiply(TFP_INDUSTRY_RATE).divide(BigDecimal("100"), 6, RoundingMode.HALF_UP))
        val totalCost = gross.add(cnssPat).add(foprolos).add(tfp)

        return AndroidPayrollResult(
            grossSalary = gross,
            cnssEmployee = cnssEmp,
            taxableGross = taxableGross,
            irppMonthly = irppMonthly,
            netSalary = netSalary,
            cnssEmployer = cnssPat,
            foprolos = foprolos,
            tfp = tfp,
            totalEmployerCost = totalCost
        )
    }
}
