package com.sandragestion.app.domain.tax

import java.math.BigDecimal
import java.math.RoundingMode

data class TaxResult(
    val totalHt: BigDecimal,
    val totalFodec: BigDecimal,
    val totalVat: BigDecimal,
    val timbreFiscal: BigDecimal,
    val totalTtc: BigDecimal,
    val retenueSource: BigDecimal,
    val netToPay: BigDecimal
)

/**
 * Tunisian Fiscal Engine for Android Native App.
 * Precision: 3 decimal places (Millimes).
 * Développé par Radhwen Ennaceur.
 */
object TunisianFiscalEngine {

    val LEGAL_TIMBRE_FISCAL = BigDecimal("1.000")

    fun roundMillimes(amount: BigDecimal): BigDecimal {
        return amount.setScale(3, RoundingMode.HALF_UP)
    }

    fun calculateInvoice(
        itemsHt: BigDecimal,
        vatRatePct: BigDecimal = BigDecimal("19.0"),
        isFactoryFodec: Boolean = false,
        retenueRatePct: BigDecimal = BigDecimal.ZERO,
        applyTimbre: Boolean = true
    ): TaxResult {
        val totalHt = roundMillimes(itemsHt)
        
        // FODEC 1% for factories
        val fodec = if (isFactoryFodec) {
            roundMillimes(totalHt.multiply(BigDecimal("0.01")))
        } else {
            BigDecimal.ZERO.setScale(3)
        }

        val taxableBase = totalHt.add(fodec)
        val vat = roundMillimes(taxableBase.multiply(vatRatePct).divide(BigDecimal("100"), 6, RoundingMode.HALF_UP))
        val timbre = if (applyTimbre) LEGAL_TIMBRE_FISCAL else BigDecimal.ZERO.setScale(3)
        
        val totalTtc = totalHt.add(fodec).add(vat).add(timbre)

        val retenue = if (retenueRatePct > BigDecimal.ZERO) {
            roundMillimes(totalTtc.multiply(retenueRatePct).divide(BigDecimal("100"), 6, RoundingMode.HALF_UP))
        } else {
            BigDecimal.ZERO.setScale(3)
        }

        val netToPay = totalTtc.subtract(retenue)

        return TaxResult(
            totalHt = totalHt,
            totalFodec = fodec,
            totalVat = vat,
            timbreFiscal = timbre,
            totalTtc = totalTtc,
            retenueSource = retenue,
            netToPay = netToPay
        )
    }
}
