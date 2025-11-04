

using System.Security.Claims;
using System.Security.Cryptography;
using API.Dtos.User;
using API.Dtos.Auth;
using API.Services;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {

        private readonly IDataContext _contextDapper;
        private readonly AuthService _authService;

        public AuthController(IDataContext contextDapper, AuthService authService)
        {
            _contextDapper = contextDapper;
            _authService = authService;
        }

        [AllowAnonymous]
        [HttpPost("Sign-in")]
        public async Task<ActionResult<AuthResponseDto>> SignIn(AuthSignInDto signInDto)
        {
            string sqlForHash = "EXEC PasswordSchema.spFor_Hash @Email=@Email";

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Email", signInDto.Email);

            AuthConfirmationDto? authConfirmation = await _contextDapper.LoadDataSingle<AuthConfirmationDto>(sqlForHash, parameters);

            if (authConfirmation == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            byte[] passwordHash = _authService.GetPasswordHash(signInDto.Password!, authConfirmation.Salt);

            for (int i = 0; i < passwordHash.Length; i++)
            {
                if (passwordHash[i] != authConfirmation.PasswordHash[i])
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }
            }

            string userSelectSql = "EXEC PasswordSchema.spUser_GetOne @Email=@Email";
            UserDto? user = await _contextDapper.LoadDataSingle<UserDto>(userSelectSql, parameters);

            if (user == null || user.Id == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            string token = _authService.CreateToken(user.Id.ToString()!);

            Response.Cookies.Append("AuthToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(1)
            });

            AuthResponseDto response = new AuthResponseDto
            {
                User = user
            };

            return Ok(response);
        }

        [AllowAnonymous]
        [HttpPost("Sign-up")]
        public async Task<ActionResult<AuthResponseDto>> SignUp(AuthSignUpDto signUpDto)
        {

            if (signUpDto.Password != signUpDto.ConfirmPassword)
            {
                throw new Exception("Passwords do not match");
            }

            string selectExistingUserSql = "EXEC PasswordSchema.spFor_Existing @Email=@Email";
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Email", signUpDto.Email);

            IEnumerable<string> existingUser = await _contextDapper.LoadData<string>(selectExistingUserSql, parameters);
            if (existingUser.Any())
            {
                return BadRequest(new { message = "Bad credentials" });
            }

            byte[] Salt = new byte[128 / 8];
            using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
            {
                rng.GetNonZeroBytes(Salt);
            }

            byte[] passwordHash = _authService.GetPasswordHash(signUpDto.Password!, Salt);

            string sqlInsertAuth = @"EXEC PasswordSchema.spUser_Create @Email=@Email, @PasswordHash=@PasswordHash, @Salt=@Salt, @Username=@Username";

            parameters.Add(@"PasswordHash", passwordHash);
            parameters.Add(@"Salt", Salt);
            parameters.Add(@"Username", signUpDto.Username);



            UserDto? user = await _contextDapper.InsertAndReturn<UserDto>(sqlInsertAuth, parameters);


            if (user == null || user.Id == null)
            {

                return StatusCode(500, new { message = "Server error" });
            }

            string token = _authService.CreateToken(user.Id.ToString()!);

            Response.Cookies.Append("AuthToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Only send over HTTPS
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(1)
            });

            AuthResponseDto response = new AuthResponseDto
            {
                User = user
            };

            return Ok(response);
        }

        [HttpGet("RefreshToken")]
        public async Task<ActionResult<AuthResponseDto>> RefreshToken()
        {
            string userId = User.FindFirstValue("userId") ?? "";
            User.ToString();
            Console.WriteLine(User.ToString());



            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            string userIdSelectSql = "EXEC PasswordSchema.spUser_GetOne @Id=@Id";
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Id", Guid.Parse(userId));
            var user = await _contextDapper.LoadDataSingle<UserDto>(userIdSelectSql, parameters);

            if (user == null || user.Id == null)
            {
                return NotFound("User not found");
            }

            string token = _authService.CreateToken(user.Id!.ToString()!);

            Response.Cookies.Append("AuthToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Only send over HTTPS
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(1)
            });

            AuthResponseDto response = new AuthResponseDto
            {

                User = user
            };

            return Ok(response);
        }

        [HttpPost("Sign-out")]
        public new ActionResult<AuthResponseDto> SignOut()
        {
            Response.Cookies.Delete("AuthToken");

            AuthResponseDto response = new AuthResponseDto
            {
                User = null
            };

            return Ok(response);
        }

    }
}