namespace API.Exceptions;


public class BaseException : Exception
{
    public int StatusCode { get; }
    public Dictionary<string, string>? Errors { get; }

    public BaseException(string message, int statusCode, Dictionary<string, string>? errors = null)
        : base(message)
    {
        StatusCode = statusCode;
        Errors = errors;
    }
}