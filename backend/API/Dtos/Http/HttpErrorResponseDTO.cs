namespace API.Dtos.Http
{
    public sealed class HttpErrorResponseDTO
    {
        public required string Message { get; set; }
        public required int StatusCode { get; set; }
        public Dictionary<string, string>? Errors { get; set; }
    }
}