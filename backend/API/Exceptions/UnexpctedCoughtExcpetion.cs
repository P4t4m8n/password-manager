namespace API.Exceptions;

public class UnexpectedCaughtException : BaseException
{
    public UnexpectedCaughtException(string message, Dictionary<string, string>? errors = null)
        : base(message, 500, errors) { }
}