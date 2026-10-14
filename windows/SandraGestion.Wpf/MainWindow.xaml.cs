using System;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using SandraGestion.Data;

namespace SandraGestion.Wpf
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public partial class MainWindow : Window
    {
        private bool _isSessionReelle = false;

        public MainWindow()
        {
            InitializeComponent();
        }

        private void OnSessionChanged(object sender, RoutedEventArgs e)
        {
            _isSessionReelle = RbSessionReelle.IsChecked == true;

            if (_isSessionReelle)
            {
                // Emerald & Amber for Factory Session Réelle
                SessionBanner.Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#064E3B"));
                TxtSessionTitle.Text = "SESSION RÉELLE ACTIVE (USINE, FABRICATION, REBUTS & COÛTS DE REVIENT)";
                TxtSessionTitle.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#6EE7B7"));
            }
            else
            {
                // Deep Blue for Legal SCE Session Financière
                SessionBanner.Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#1E3A8A"));
                TxtSessionTitle.Text = "SESSION FINANCIÈRE ACTIVE (CADRE LÉGAL & SCE)";
                TxtSessionTitle.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#93C5FD"));
            }
        }

        private void OnLanguageChanged(object sender, SelectionChangedEventArgs e)
        {
            if (CmbLanguage.SelectedIndex == 1)
            {
                // Arabic RTL
                FlowDirection = FlowDirection.RightToLeft;
            }
            else
            {
                // French LTR
                FlowDirection = FlowDirection.LeftToRight;
            }
        }

        private void OnBackupClicked(object sender, RoutedEventArgs e)
        {
            try
            {
                string desktop = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                string backupDir = Path.Combine(desktop, "SandraGestion_Backups");
                Directory.CreateDirectory(backupDir);

                var backupService = (DatabaseBackupService)App.ServiceProvider.GetService(typeof(DatabaseBackupService))!;
                string resultFile = backupService.CreateBackup(backupDir);

                MessageBox.Show(
                    $"Sauvegarde locale de la base de données réussie !\nEmplacement : {resultFile}\n\nDéveloppé par Radhwen Ennaceur",
                    "SANDRA GESTION - Sauvegarde Réussie",
                    MessageBoxButton.OK,
                    MessageBoxImage.Information
                );
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Erreur lors de la sauvegarde : {ex.Message}",
                    "Erreur",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error
                );
            }
        }
    }
}
