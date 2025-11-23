namespace API.Exceptions;

public class NotFoundException : BaseException
{
    public NotFoundException(string message, Dictionary<string, string>? errors = null)
        : base(message, 404, errors) { }
}