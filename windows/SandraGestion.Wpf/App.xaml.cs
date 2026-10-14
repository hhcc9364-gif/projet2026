using System;
using System.IO;
using System.Windows;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SandraGestion.Core.Services;
using SandraGestion.Data;

namespace SandraGestion.Wpf
{
    /// <summary>
    /// Application entry point for SANDRA GESTION (sandragestion.exe).
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public partial class App : Application
    {
        public static IServiceProvider ServiceProvider { get; private set; } = null!;

        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);

            var services = new ServiceCollection();
            ConfigureServices(services);
            ServiceProvider = services.BuildServiceProvider();

            // Ensure database and schema exists
            using (var scope = ServiceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<SandraDbContext>();
                dbContext.Database.EnsureCreated();
            }
        }

        private static void ConfigureServices(IServiceCollection services)
        {
            string appData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            string dbFolder = Path.Combine(appData, "SandraGestion");
            Directory.CreateDirectory(dbFolder);
            string dbPath = Path.Combine(dbFolder, "sandragestion.db");

            services.AddDbContext<SandraDbContext>(options =>
            {
                options.UseSqlite($"Data Source={dbPath}");
            });

            services.AddSingleton<TunisianTaxCalculator>();
            services.AddSingleton(new DatabaseBackupService(dbPath));
        }
    }
}
