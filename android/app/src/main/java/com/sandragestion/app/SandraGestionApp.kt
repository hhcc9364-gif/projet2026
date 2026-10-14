package com.sandragestion.app

import android.app.Application

/**
 * Android Application entry point.
 * Local-first SQLite database architecture.
 * Développé par Radhwen Ennaceur.
 */
class SandraGestionApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize Room local-first database and security keystore
    }
}
