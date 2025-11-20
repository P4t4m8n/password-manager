namespace API.Interfaces
{
    public interface IAuthService
    {
        byte[] GetPasswordHash(string password, byte[] salt);
        string CreateToken(string userId);
    }
}