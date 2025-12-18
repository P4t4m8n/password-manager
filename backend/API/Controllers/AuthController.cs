

using API.Dtos.Auth;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Dtos.Http;
using API.Extensions;

namespace API.Controllers
{
    [ApiController]
    [Route("api/Auth")]
    public sealed class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [AllowAnonymous]
        [HttpPost("Sign-in")]
        public async Task<ActionResult<HttpResponseDTO<AuthResponseDTO>>> SignIn(AuthSignInDTO signInDto)
        {


            AuthResponseDTO authResponse = await _authService.SignInAsync(signInDto, Response);
            HttpResponseDTO<AuthResponseDTO> httpResponse = new()
            {
                Data = authResponse,
                Message = "Sign-in successful",
                StatusCode = 200

            };
            return StatusCode(httpResponse.StatusCode, httpResponse);
        }
        [AllowAnonymous]
        [HttpPost("Sign-up")]
        public async Task<ActionResult<HttpResponseDTO<AuthResponseDTO>>> SignUp(AuthSignUpDTO signUpDto)
        {
            AuthResponseDTO authResponse = await _authService.SignUpAsync(signUpDto, Response);
            HttpResponseDTO<AuthResponseDTO> httpResponse = new()
            {
                Data = authResponse,
                Message = "User created successfully",
                StatusCode = 201

            };
            return StatusCode(httpResponse.StatusCode, httpResponse);
        }

        [HttpGet("Check-session")]
        public async Task<ActionResult<HttpResponseDTO<AuthResponseDTO>>> CheckSession()
        {
            Guid userGuid = User.GetUserId();
            AuthResponseDTO authResponse = await _authService.CheckSessionAsync(userGuid);
            HttpResponseDTO<AuthResponseDTO> httpResponse = new()
            {
                Data = authResponse,
                Message = "User is authenticated",
                StatusCode = 200

            };
            return StatusCode(httpResponse.StatusCode, httpResponse);
        }

        [HttpGet("Refresh-token")]
        public async Task<ActionResult<HttpResponseDTO<AuthResponseDTO>>> RefreshToken()
        {
            Guid userGuid = User.GetUserId();
            AuthResponseDTO authResponse = await _authService.RefreshTokenAsync(userGuid, Response);
            HttpResponseDTO<AuthResponseDTO> httpResponse = new()
            {
                Data = authResponse,
                Message = "Token refreshed successfully",
                StatusCode = 200

            };
            return StatusCode(httpResponse.StatusCode, httpResponse);
        }

        [HttpPost("Sign-out")]
        public new ActionResult<HttpResponseDTO<AuthResponseDTO>> SignOut()
        {

            Response.Cookies.Delete("AuthToken", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Path = "/",
            });
            HttpResponseDTO<AuthResponseDTO> httpResponse = new()
            {
                Data = new()
                {
                    User = null,
                    MasterPasswordSalt = []
                },
                Message = "Sign-out successful",
                StatusCode = 200

            }; return StatusCode(httpResponse.StatusCode, httpResponse);
        }

    }
}