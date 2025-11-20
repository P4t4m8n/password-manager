

using System.Security.Claims;
using System.Security.Cryptography;
using API.Dtos.User;
using API.Dtos.Auth;
using API.Services;
using API.Interfaces;
using API.Models;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Exceptions;
using API.Dtos.Http;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {

        private readonly IDataContext _contextDapper;
        private readonly IAuthService _authService;
        private readonly IGoogleService _googleService;

        public AuthController(IDataContext contextDapper, IAuthService authService, IGoogleService googleService)
        {
            _contextDapper = contextDapper;
            _authService = authService;
            _googleService = googleService;
        }

        [AllowAnonymous]
        [HttpPost("Sign-in")]
        public async Task<ActionResult<AuthResponseDto>> SignIn(AuthSignInDto signInDto)
        {
            string sqlForHash = "EXEC PasswordSchema.spFor_Hash @Email=@Email";

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Email", signInDto.Email);

            AuthConfirmationDto? authConfirmation = await _contextDapper.QuerySingleOrDefaultAsync<AuthConfirmationDto>(sqlForHash, parameters);

            if (authConfirmation == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            byte[] passwordHash = _authService.GetPasswordHash(signInDto.Password!, authConfirmation.PasswordSalt);

            for (int i = 0; i < passwordHash.Length; i++)
            {
                if (passwordHash[i] != authConfirmation.PasswordHash[i])
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }
            }

            string userSelectSql = "EXEC PasswordSchema.spUser_GetOne @Email=@Email";
            User? user = await _contextDapper.LoadDataSingle<User>(userSelectSql, parameters);

            if (user == null || user.Id == Guid.Empty)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            string token = _authService.CreateToken(user.Id.ToString()!);

            Response.Cookies.Append("AuthToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddDays(1)
            });

            AuthResponseDto response = new()
            {
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Username = user.Username,
                },
                MasterPasswordSalt = user.MasterPasswordSalt
            };

            HttpResponseDTO<AuthResponseDto> httpResponse = new()
            {
                Data = response,
                Message = "Sign-in successful",
                StatusCode = 200

            };

            return Ok(httpResponse);
        }

        [AllowAnonymous]
        [HttpPost("Sign-up")]
        public async Task<ActionResult<AuthResponseDto>> SignUp(AuthSignUpDto signUpDto)
        {

            if (signUpDto.Password != signUpDto.ConfirmPassword)
            {
                return BadRequest(new { message = "Passwords do not match" });
            }

            string selectExistingUserSql = "EXEC PasswordSchema.spFor_Existing @Email=@Email";
            DynamicParameters parameters = new();
            parameters.Add("@Email", signUpDto.Email);

            IEnumerable<string> existingUser = await _contextDapper.LoadData<string>(selectExistingUserSql, parameters);
            if (existingUser.Any())
            {
                return BadRequest(new { message = "Bad credentials" });
            }

            byte[] PasswordSalt = new byte[128 / 8];
            using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
            {
                rng.GetNonZeroBytes(PasswordSalt);
            }

            byte[] passwordHash = _authService.GetPasswordHash(signUpDto.Password!, PasswordSalt);

            string sqlInsertAuth = @"EXEC PasswordSchema.spUser_Create 
                                      @Email=@Email, 
                                      @Username=@Username,
                                      @PasswordHash=@PasswordHash, 
                                      @PasswordSalt=@PasswordSalt, 
                                      @MasterPasswordSalt=@MasterPasswordSalt,
                                      @EncryptedMasterKeyWithRecovery=@EncryptedMasterKeyWithRecovery,
                                      @RecoveryIV=@RecoveryIV";

            parameters.Add(@"Username", signUpDto.Username);
            parameters.Add(@"PasswordHash", passwordHash);
            parameters.Add(@"PasswordSalt", PasswordSalt);
            parameters.Add(@"MasterPasswordSalt", signUpDto.MasterPasswordSalt);
            parameters.Add(@"EncryptedMasterKeyWithRecovery", signUpDto.EncryptedMasterKeyWithRecovery);
            parameters.Add(@"RecoveryIV", signUpDto.RecoveryIV);



            User? user = await _contextDapper.QuerySingleOrDefaultAsync<User>(sqlInsertAuth, parameters);


            if (user == null || user.Id == Guid.Empty)
            {

                throw new UserCreationFailedException("Failed to create user due to a server error.");
            }

            string token = _authService.CreateToken(user.Id.ToString()!);

            Response.Cookies.Append("AuthToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Only send over HTTPS
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(1)
            });

            AuthResponseDto response = new()
            {
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Username = user.Username,
                },
                MasterPasswordSalt = user.MasterPasswordSalt
            };

            HttpResponseDTO<AuthResponseDto> httpResponse = new()
            {
                Data = response,
                Message = "User created successfully",
                StatusCode = 201

            };

            return Ok(httpResponse);
        }


        [AllowAnonymous]
        [HttpGet]
        [Route("google")]
        public async Task<IActionResult> GoogleAuth()
        {
            return await Task.Run(() => Redirect(_googleService.GetCallbackUrl()));
        }
        [AllowAnonymous]
        [HttpGet]
        [Route("callback")]

        [HttpGet("Check-session")]
        public async Task<ActionResult<AuthResponseDto>> CheckSession()
        {
            string userId = User.FindFirstValue("userId") ?? "";

            AuthResponseDto authRes = new()
            {
                User = null,
                MasterPasswordSalt = []
            };

            if (string.IsNullOrEmpty(userId))
            {
                if (string.IsNullOrEmpty(userId))
                {
                    return NotFound(new HttpErrorResponseDTO
                    {
                        Message = "User not authenticated",
                        StatusCode = 401,
                        Errors = new Dictionary<string, string>
                    {
                        { "Authentication", "No valid authentication token found" }
                    }
                    });
                }
            }

            string userIdSelectSql = "EXEC PasswordSchema.spUser_GetOne @Id=@Id";
            DynamicParameters parameters = new();
            parameters.Add("@Id", Guid.Parse(userId));

            User? user = await _contextDapper.QuerySingleOrDefaultAsync<User>(userIdSelectSql, parameters);

            if (user == null || user.Id == Guid.Empty)
            {
                return NotFound(
                     new HttpErrorResponseDTO
                     {
                         Message = "User not found",
                         StatusCode = 404,
                         Errors = new Dictionary<string, string>
                         {
                            { "User", "No user found for the given authentication token" }
                         }
                     }
                 );
            }

            authRes.User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.Username,
            };
            authRes.MasterPasswordSalt = user.MasterPasswordSalt;

            HttpResponseDTO<AuthResponseDto> httpResponse = new()
            {
                Data = authRes,
                Message = "User is authenticated"
            };

            return Ok(httpResponse);
        }
        [HttpGet("Refresh-token")]
        public async Task<ActionResult<AuthResponseDto>> RefreshToken()
        {
            string userId = User.FindFirstValue("userId") ?? "";
            User.ToString();

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            string userIdSelectSql = "EXEC PasswordSchema.spUser_GetOne @Id=@Id";
            DynamicParameters parameters = new();
            parameters.Add("@Id", Guid.Parse(userId));
            User? user = await _contextDapper.QuerySingleOrDefaultAsync<User>(userIdSelectSql, parameters);

            if (user == null || user.Id == Guid.Empty)
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

            AuthResponseDto response = new()
            {

                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Username = user.Username,
                },
                MasterPasswordSalt = user.MasterPasswordSalt
            };

            HttpResponseDTO<AuthResponseDto> httpResponse = new()
            {
                Data = response,
                Message = "Token refreshed successfully",
                StatusCode = 200

            };

            return Ok(httpResponse);
        }

        [HttpPost("Sign-out")]
        public new ActionResult<AuthResponseDto> SignOut()
        {
            Response.Cookies.Delete("AuthToken");

            AuthResponseDto response = new AuthResponseDto
            {
                User = null,
                MasterPasswordSalt = []
            };

            HttpResponseDTO<AuthResponseDto> httpResponse = new()
            {
                Data = response,
                Message = "Sign-out successful",
                StatusCode = 200

            };

            return Ok(httpResponse);
        }

    }
}