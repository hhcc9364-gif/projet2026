@echo off
REM ============================================================================
REM SANDRA GESTION - Reproducible Windows Build Script (sandragestion.exe)
REM Développé par Radhwen Ennaceur
REM ============================================================================

echo [SANDRA GESTION] Verification des prerequis de compilation .NET 8...
where dotnet >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] .NET SDK 8.0 ou superieur introuvable. Veuillez installer .NET 8 SDK depuis https://dotnet.microsoft.com/download
    exit /b 1
)

echo [1/3] Restauration des packages NuGet...
dotnet restore SandraGestion.sln
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

echo [2/3] Execution de la suite de tests automatises (Fiscalite Tunisienne et Isolation)...
dotnet test SandraGestion.Tests\SandraGestion.Tests.csproj -c Release --verbosity normal
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Les tests unitaires ont echoue!
    exit /b %ERRORLEVEL%
)

echo [3/3] Publication de l'executable autonome natif Windows (sandragestion.exe)...
dotnet publish SandraGestion.Wpf\SandraGestion.Wpf.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -p:EnableCompressionInSingleFile=true -o ..\bin\windows\
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

echo.
echo ============================================================================
echo [SUCCES] Compilation terminee avec succes !
echo Executable produit : bin\windows\sandragestion.exe
echo Developpe par Radhwen Ennaceur
echo ============================================================================
