namespace API.Dtos.Http
{
    public class HttpResponseDTO<T>
    {
        public T? Data { get; set; }
        public string? Message { get; set; }
        public int StatusCode { get; set; }
    }
}