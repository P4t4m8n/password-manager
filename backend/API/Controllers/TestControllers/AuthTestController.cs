namespace API.Controllers.TestControllers
{
    using API.Dtos.User;
    using API.Interfaces;
    using Microsoft.AspNetCore.Mvc;

    [ApiController]
    [Route("api/test/auth")]
    public class AuthTestController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthTestController(IAuthService authService)
        {
            _authService = authService;
        }


    }
}