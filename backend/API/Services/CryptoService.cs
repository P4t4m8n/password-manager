using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using API.Interfaces;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.IdentityModel.Tokens;

namespace API.Services
{
    public sealed class CryptoService : ICryptoService
    {
        private readonly IConfiguration _config;
        public CryptoService(IConfiguration config)
        {
            _config = config;
        }
        public byte[] GetPasswordHash(string password, byte[] salt)
        {

            return KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 1000000,
                numBytesRequested: 256 / 8
            );
        }

        public string CreateToken(string userId)
        {
            Claim[] claims = [new Claim("userId", userId)];

            string? tokenKeyString = _config.GetSection("AppSettings:TokenKey").Value;


            SymmetricSecurityKey tokenKey = new(Encoding.UTF8.GetBytes(tokenKeyString ?? ""));

            SigningCredentials cred = new(tokenKey, SecurityAlgorithms.HmacSha512Signature);

            SecurityTokenDescriptor desc = new()
            {
                Subject = new ClaimsIdentity(claims),
                SigningCredentials = cred,
                Expires = DateTime.Now.AddDays(1)


            };

            JwtSecurityTokenHandler tokenHandler = new ();

            SecurityToken token = tokenHandler.CreateToken(desc);

            return tokenHandler.WriteToken(token);
        }

        public byte[] GenerateSalt()
        {
            byte[] PasswordSalt = new byte[128 / 8];
            using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
            {
                rng.GetNonZeroBytes(PasswordSalt);
            }
            return PasswordSalt;
        }
    }
}