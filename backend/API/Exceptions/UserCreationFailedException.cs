namespace API.Exceptions
{

    public class UserCreationFailedException : BaseException
    {
        public UserCreationFailedException(Dictionary<string, string>? errors = null)
            : base("Failed to create user due to a server error.", 500, errors) { }
    }
}