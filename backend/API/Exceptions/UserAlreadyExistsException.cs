namespace API.Exceptions
{

    public class UserAlreadyExistsException : BaseException
    {
        public UserAlreadyExistsException(Dictionary<string, string>? errors = null)
            : base("A user with the provided email already exists.", 409, errors) { }
    }
}