namespace API.Exceptions;

public class BadRequestException : BaseException
{
    public BadRequestException(string message, Dictionary<string, string>? errors = null)
        : base(message, 400, errors) { }
}
