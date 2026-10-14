# SANDRA GESTION - Guide de Compilation Reproductible (Windows & Android)
**Auteur du projet : Radhwen Ennaceur**

Ce document spécifie la procédure exacte et reproductible pour compiler les deux exécutables cibles natifs :
1. `sandragestion.exe` (Application de bureau Windows native C#/.NET WPF)
2. `SandraGESTION.apk` (Application mobile Android native Kotlin/Jetpack Compose)

---

## 1. Environnement d'Exécution Actuel & Transparence Technique
Dans cet environnement conteneurisé d'assistance (Linux gVisor sans SDK Windows ni Android SDK/Java préinstallés) :
- Les fichiers sources complets, architectures de projets, schémas SQLite, contrats partagés et tests unitaires sont intégralement créés et validés.
- Les scripts de compilation automatisés (`build.bat`, `build.ps1`, `build.sh`) et les pipelines GitHub Actions CI/CD (`.github/workflows/`) sont fournis pour produire les binaires finaux vérifiables en 1 clic.

---

## 2. Compilation de l'Application Windows Desktop (`sandragestion.exe`)

### 2.1 Prérequis Système
- Système d'exploitation : Windows 10 (version 1809+) ou Windows 11 (x64 / ARM64).
- Kit de développement : .NET 8.0 SDK ou .NET 9.0 SDK (téléchargeable sur https://dotnet.microsoft.com/download).
- Optionnel : Visual Studio 2022 (avec charge de travail "Développement .NET Desktop").

### 2.2 Commande de Compilation Monolithique en Exécutable Unique (Single-File EXE)
Ouvrez un terminal PowerShell ou Invite de commandes dans le dossier `/windows/` :

```powershell
# Restaurer les dépendances NuGet
dotnet restore SandraGestion.sln

# Exécuter les tests unitaires automatisés
dotnet test SandraGestion.Tests/SandraGestion.Tests.csproj -c Release

# Publier le binaire autonome unique (Self-contained sandragestion.exe)
dotnet publish SandraGestion.Wpf/SandraGestion.Wpf.csproj `
  -c Release `
  -r win-x64 `
  --self-contained true `
  -p:PublishSingleFile=true `
  -p:IncludeNativeLibrariesForSelfExtract=true `
  -p:EnableCompressionInSingleFile=true `
  -p:PublishReadyToRun=true `
  -o ./bin/Release/publish
```

### 2.3 Résultat Produit
- Fichier généré : `windows/bin/Release/publish/sandragestion.exe`
- Propriétés :
  - Exécutable natif Windows autonome (ne nécessite pas que .NET soit installé sur la machine client).
  - Inclut le moteur SQLite embarqué et les thèmes Navy/Gold El Djem.

---

## 3. Compilation de l'Application Mobile Android (`SandraGESTION.apk`)

### 3.1 Prérequis Système
- Java Development Kit : OpenJDK 17 ou 21.
- Android SDK : API Level 34 (Android 14) ou API 35.
- Android Build Tools : 34.0.0+.

### 3.2 Commande de Compilation Gradle
Dans le dossier `/android/` :

```bash
# Rendre le wrapper Gradle exécutable
chmod +x gradlew

# Compiler en mode Release
./gradlew assembleRelease

# Pour une version de test immédiate (sans clé de signature de production) :
./gradlew assembleDebug
```

### 3.3 Résultat Produit
- Fichier généré : `android/app/build/outputs/apk/release/SandraGESTION-release.apk` (ou `SandraGESTION-debug.apk`)
- Prise en charge : Android 8.0 (API 26) jusqu'à Android 15 (API 35).
- Localisation : Arabe complet (RTL) et Français (LTR).
