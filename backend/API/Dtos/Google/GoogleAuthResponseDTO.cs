namespace API.Dtos.Google
{
    public class GoogleAuthResponseDTO
    {
        public string? Access_type { get; set; }

        public long? Expires_in { get; set; }

        public string? Refresh_token { get; set; }

        public string? Scope { get; set; }

        public string? Token_type { get; set; }
        public string? Access_token { get; set; }
    }
}