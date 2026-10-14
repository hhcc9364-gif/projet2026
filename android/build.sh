#!/usr/bin/env bash
# ============================================================================
# SANDRA GESTION - Reproducible Android Build Script (SandraGESTION.apk)
# Développé par Radhwen Ennaceur
# ============================================================================

set -e

echo "============================================================================"
echo "SANDRA GESTION - Compilation Native Android (SandraGESTION.apk)"
echo "Auteur : Radhwen Ennaceur"
echo "============================================================================"

# Check Java
if ! command -v java &> /dev/null; then
    echo "[ERREUR] Java/JDK 17+ est requis pour compiler l'application Android."
    echo "Installez OpenJDK 17 : sudo apt-get install openjdk-17-jdk"
    exit 1
fi

JAVA_VER=$(java -version 2>&1 | head -n 1)
echo "[INFO] Environnement Java detecte : $JAVA_VER"

if [ -z "$ANDROID_HOME" ]; then
    echo "[AVERTISSEMENT] ANDROID_HOME n'est pas defini dans l'environnement."
    echo "Pour compiler localement, installez l'Android Command-line Tools / SDK."
fi

echo "[1/2] Nettoyage et verification Gradle..."
chmod +x gradlew 2>/dev/null || true

echo "[2/2] Compilation de l'APK (Mode Release)..."
if [ -f "./gradlew" ]; then
    ./gradlew assembleRelease --stacktrace
    echo "[SUCCES] SandraGESTION.apk genere dans app/build/outputs/apk/release/"
else
    echo "[INFO] Exécutez 'gradle assembleRelease' avec le SDK Android installe."
fi
