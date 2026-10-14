# ============================================================================
# SANDRA GESTION - Reproducible PowerShell Build Script (sandragestion.exe)
# Développé par Radhwen Ennaceur
# Conforme aux 7 étapes de vérification et de publication native
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "SANDRA GESTION - Compilation Windows Native (sandragestion.exe)" -ForegroundColor Gold
Write-Host "Auteur : Radhwen Ennaceur | Version 2.0" -ForegroundColor White
Write-Host "============================================================================" -ForegroundColor Cyan

# ----------------------------------------------------------------------------
# Étape 1 : Vérification du SDK .NET 8.0+ Requis
# ----------------------------------------------------------------------------
Write-Host "`n[Étape 1/7] Vérification du SDK .NET requis..." -ForegroundColor Yellow
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Error "[ÉCHEC ÉTAPE 1] Le SDK .NET 8.0 ou supérieur est introuvable dans le PATH. Veuillez installer le SDK .NET 8.0 depuis https://dotnet.microsoft.com/download"
    exit 1
}

$DotnetVersion = dotnet --version
Write-Host "[OK] SDK .NET détecté : $DotnetVersion" -ForegroundColor Green
if (-not ($DotnetVersion.StartsWith("8.") -or $DotnetVersion.StartsWith("9."))) {
    Write-Warning "[ATTENTION] Version recommandée : .NET 8.0.x. Version actuelle : $DotnetVersion"
}

# ----------------------------------------------------------------------------
# Étape 2 : Restauration des dépendances NuGet
# ----------------------------------------------------------------------------
Write-Host "`n[Étape 2/7] Restauration des dépendances NuGet..." -ForegroundColor Yellow
$SolutionPath = Join-Path $PSScriptRoot "SandraGestion.sln"
dotnet restore $SolutionPath
if ($LASTEXITCODE -ne 0) {
    Write-Error "[ÉCHEC ÉTAPE 2] Échec de la restauration des packages NuGet."
    exit $LASTEXITCODE
}
Write-Host "[OK] Dépendances restaurées avec succès." -ForegroundColor Green

# ----------------------------------------------------------------------------
# Étape 3 : Compilation de la solution complète en mode Release
# ----------------------------------------------------------------------------
Write-Host "`n[Étape 3/7] Compilation de la solution en mode Release..." -ForegroundColor Yellow
dotnet build $SolutionPath -c Release --no-restore
if ($LASTEXITCODE -ne 0) {
    Write-Error "[ÉCHEC ÉTAPE 3] Échec de la compilation de la solution SandraGestion.sln."
    exit $LASTEXITCODE
}
Write-Host "[OK] Solution compilée avec succès." -ForegroundColor Green

# ----------------------------------------------------------------------------
# Étape 4 : Exécution des tests automatisés (Fiscalité, Paie, Amortissements, Isolation)
# ----------------------------------------------------------------------------
Write-Host "`n[Étape 4/7] Exécution de la suite de tests automatisés..." -ForegroundColor Yellow
$TestProj = Join-Path $PSScriptRoot "SandraGestion.Tests/SandraGestion.Tests.csproj"
dotnet test $TestProj -c Release --no-build --verbosity normal
if ($LASTEXITCODE -ne 0) {
    Write-Error "[ÉCHEC ÉTAPE 4] Des tests unitaires ont échoué. Publication interrompue pour préserver l'intégrité métier."
    exit $LASTEXITCODE
}
Write-Host "[OK] Tous les tests unitaires ont réussi." -ForegroundColor Green

# ----------------------------------------------------------------------------
# Étape 5 : Publication d'un binaire autonome Windows x64 (Single-File)
# ----------------------------------------------------------------------------
Write-Host "`n[Étape 5/7] Publication du binaire autonome win-x64..." -ForegroundColor Yellow
$WpfProj = Join-Path $PSScriptRoot "SandraGestion.Wpf/SandraGestion.Wpf.csproj"
$OutputDir = Join-Path $PSScriptRoot "..\bin\windows"

dotnet publish $WpfProj `
    -c Release `
    -r win-x64 `
    --self-contained true `
    -p:PublishSingleFile=true `
    -p:IncludeNativeLibrariesForSelfExtract=true `
    -p:EnableCompressionInSingleFile=true `
    -p:PublishReadyToRun=true `
    -o $OutputDir

if ($LASTEXITCODE -ne 0) {
    Write-Error "[ÉCHEC ÉTAPE 5] La publication du binaire sandragestion.exe a échoué."
    exit $LASTEXITCODE
}

# ----------------------------------------------------------------------------
# Étape 6 : Vérification de l'existence effective de sandragestion.exe
# ----------------------------------------------------------------------------
Write-Host "`n[Étape 6/7] Vérification de l'existence physique du fichier exécutable..." -ForegroundColor Yellow
$ExePath = Join-Path $OutputDir "sandragestion.exe"
if (-not (Test-Path $ExePath)) {
    Write-Error "[ÉCHEC ÉTAPE 6] Le fichier attendu 'sandragestion.exe' n'a pas été généré dans le répertoire cible : $OutputDir"
    exit 2
}
$ExeInfo = Get-Item $ExePath
$SizeMb = [math]::Round($ExeInfo.Length / 1MB, 2)
Write-Host "[OK] Exécutable vérifié avec succès : sandragestion.exe ($SizeMb Mo)" -ForegroundColor Green

# ----------------------------------------------------------------------------
# Étape 7 : Rapport d'achèvement et emplacement final
# ----------------------------------------------------------------------------
Write-Host "`n============================================================================" -ForegroundColor Green
Write-Host "[SUCCÈS 7/7] COMPILATION ET VÉRIFICATION NATIVE TERMINÉES AVEC SUCCÈS !" -ForegroundColor Green
Write-Host "Emplacement du binaire : $ExePath" -ForegroundColor White
Write-Host "Taille : $SizeMb Mo" -ForegroundColor White
Write-Host "Type : Exécutable autonome Windows 64-bit (aucun runtime externe requis)" -ForegroundColor White
Write-Host "Développé par Radhwen Ennaceur" -ForegroundColor Gold
Write-Host "============================================================================" -ForegroundColor Green
