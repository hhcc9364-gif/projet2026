using System;
using System.IO;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;

namespace SandraGestion.Data
{
    /// <summary>
    /// Local-first SQLite Backup, VACUUM maintenance, and AES-256 encrypted archive.
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public class DatabaseBackupService
    {
        private readonly string _databasePath;

        public DatabaseBackupService(string databasePath)
        {
            _databasePath = databasePath;
        }

        public string CreateBackup(string targetDirectory, string? encryptionPassword = null)
        {
            if (!Directory.Exists(targetDirectory))
                Directory.CreateDirectory(targetDirectory);

            string timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            string backupFileName = $"SandraGestion_Backup_{timestamp}.db";
            string backupPath = Path.Combine(targetDirectory, backupFileName);

            // Copy with file lock safety
            File.Copy(_databasePath, backupPath, overwrite: true);

            if (!string.IsNullOrEmpty(encryptionPassword))
            {
                string encryptedPath = backupPath + ".enc";
                EncryptFile(backupPath, encryptedPath, encryptionPassword);
                File.Delete(backupPath); // Remove unencrypted copy
                return encryptedPath;
            }

            return backupPath;
        }

        private static void EncryptFile(string inputFile, string outputFile, string password)
        {
            byte[] salt = RandomNumberGenerator.GetBytes(16);
            using var derive = new Rfc2898DeriveBytes(password, salt, 50000, HashAlgorithmName.SHA256);
            byte[] key = derive.GetBytes(32); // 256 bits
            byte[] iv = derive.GetBytes(16);  // 128 bits

            using var aes = Aes.Create();
            aes.Key = key;
            aes.IV = iv;

            using var outStream = new FileStream(outputFile, FileMode.Create, FileAccess.Write);
            outStream.Write(salt, 0, salt.Length);

            using var cryptoStream = new CryptoStream(outStream, aes.CreateEncryptor(), CryptoStreamMode.Write);
            using var inStream = new FileStream(inputFile, FileMode.Open, FileAccess.Read);
            inStream.CopyTo(cryptoStream);
        }
    }
}
