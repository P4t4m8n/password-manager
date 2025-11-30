namespace API.Interfaces
{
    public interface ICryptoService
    {
        byte[] GetPasswordHash(string password, byte[] salt);
        string CreateToken(string userId);

        public byte[] GenerateSalt();
    }
}