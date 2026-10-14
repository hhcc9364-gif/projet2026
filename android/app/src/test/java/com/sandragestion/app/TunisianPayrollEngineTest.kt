package com.sandragestion.app

import com.sandragestion.app.domain.payroll.TunisianPayrollEngine
import org.junit.Assert.assertEquals
import org.junit.Test
import java.math.BigDecimal

class TunisianPayrollEngineTest {

    @Test
    fun testStandardPayrollCalculation() {
        val baseSalary = BigDecimal("1200.000")
        val result = TunisianPayrollEngine.calculate(baseSalary, isManufacturing = true)

        // CNSS 9.18% sur 1200 DT = 110.160 DT
        assertEquals(BigDecimal("110.160"), result.cnssEmployee)

        // CNSS Patronale 16.57% sur 1200 DT = 198.840 DT
        assertEquals(BigDecimal("198.840"), result.cnssEmployer)

        // FOPROLOS 1% = 12.000 DT, TFP 1% = 12.000 DT
        assertEquals(BigDecimal("12.000"), result.foprolos)
        assertEquals(BigDecimal("12.000"), result.tfp)
    }
}
