package com.sandragestion.app.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sandragestion.app.R

val NavyDark = Color(0xFF070D1D)
val NavySurface = Color(0xFF0D1B36)
val NavyBorder = Color(0xFF1B315A)
val GoldPrimary = Color(0xFFC59B27)
val BlueFiscal = Color(0xFF3B82F6)
val EmeraldUsine = Color(0xFF10B981)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SandraGestionTheme {
                MainScreen()
            }
        }
    }
}

@Composable
fun SandraGestionTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            background = NavyDark,
            surface = NavySurface,
            primary = GoldPrimary
        ),
        content = content
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen() {
    var isSessionReelle by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = stringResource(R.string.app_name),
                            color = GoldPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                        Text(
                            text = stringResource(R.string.app_credit),
                            color = Color(0xFF94A3B8),
                            fontSize = 11.sp
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = NavySurface
                )
            )
        },
        containerColor = NavyDark
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            // Dual Session Switcher
            Card(
                colors = CardDefaults.cardColors(containerColor = NavySurface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Button(
                        onClick = { isSessionReelle = false },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (!isSessionReelle) Color(0xFF1E3A8A) else Color.Transparent
                        )
                    ) {
                        Text(stringResource(R.string.session_financiere), fontSize = 12.sp)
                    }

                    Button(
                        onClick = { isSessionReelle = true },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isSessionReelle) Color(0xFF064E3B) else Color.Transparent
                        )
                    ) {
                        Text(stringResource(R.string.session_reelle), fontSize = 12.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Active Session Indicator
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = if (isSessionReelle) EmeraldUsine.copy(alpha = 0.15f) else BlueFiscal.copy(alpha = 0.15f)
                ),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = if (isSessionReelle) "SESSION RÉELLE (USINE & COÛTS)" else "SESSION FINANCIÈRE (LÉGALE SCE)",
                        fontWeight = FontWeight.Bold,
                        color = if (isSessionReelle) EmeraldUsine else BlueFiscal,
                        fontSize = 14.sp
                    )
                    Text(
                        text = "Devise: Dinar Tunisien (TND) • 3 décimales (Millimes)",
                        color = Color(0xFFE2E8F0),
                        fontSize = 12.sp,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
        }
    }
}
