namespace API.Exceptions;

public class UnauthorizedException : BaseException
{
    public UnauthorizedException(string message, Dictionary<string, string>? errors = null)
        : base(message, 401, errors) { }
}