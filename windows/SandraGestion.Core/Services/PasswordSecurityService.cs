using System;
using System.Security.Cryptography;

namespace SandraGestion.Core.Services
{
    /// <summary>
    /// Secure Password Hashing & Verification using PBKDF2 with HMAC-SHA512.
    /// Never stores plain passwords.
    /// Développé par Radhwen Ennaceur.
    /// </summary>
    public static class PasswordSecurityService
    {
        private const int SaltSize = 32;       // 256 bits
        private const int KeySize = 64;        // 512 bits
        private const int Iterations = 100000; // 100k rounds

        public static (string Hash, string Salt) HashPassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                throw new ArgumentException("Password cannot be empty.");

            byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);
            byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt,
                Iterations,
                HashAlgorithmName.SHA512,
                KeySize
            );

            return (Convert.ToBase64String(hash), Convert.ToBase64String(salt));
        }

        public static bool VerifyPassword(string password, string storedHash, string storedSalt)
        {
            if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(storedHash) || string.IsNullOrWhiteSpace(storedSalt))
                return false;

            byte[] salt = Convert.FromBase64String(storedSalt);
            byte[] expectedHash = Convert.FromBase64String(storedHash);

            byte[] actualHash = Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt,
                Iterations,
                HashAlgorithmName.SHA512,
                KeySize
            );

            return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
        }
    }
}
