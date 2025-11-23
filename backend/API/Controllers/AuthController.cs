

using System.Security.Claims;
using System.Security.Cryptography;
using API.Dtos.User;
using API.Dtos.Auth;
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

        public AuthController(IDataContext contextDapper, IAuthService authService)
        {
            _contextDapper = contextDapper;
            _authService = authService;
        }
        /*
        [HttpPost("Sign-in")]
        */
        [AllowAnonymous]
        [HttpPost("Sign-in")]
        public async Task<ActionResult<AuthResponseDto>> SignIn(AuthSignInDto signInDto)
        {
            string sqlForHash = "EXEC PasswordSchema.spFor_Hash @Email=@Email";

            DynamicParameters parameters = new();
            parameters.Add("@Email", signInDto.Email);

            AuthConfirmationDto? authConfirmation = await _contextDapper.QuerySingleOrDefaultAsync<AuthConfirmationDto>(sqlForHash, parameters)
             ?? throw new UnauthorizedException("Invalid email or password", new Dictionary<string, string>
               {
                   { "Authentication", "No user found for the given email" }
               });

            byte[] passwordHash = _authService.GetPasswordHash(signInDto.Password!, authConfirmation.PasswordSalt);

            for (int i = 0; i < passwordHash.Length; i++)
            {
                if (passwordHash[i] != authConfirmation.PasswordHash[i])
                {
                    throw new UnauthorizedException("Invalid email or password", new Dictionary<string, string>
                    {
                        { "Authentication", "Password does not match" }
                    });
                }
            }

            string userSelectSql = "EXEC PasswordSchema.spUser_GetOne @Email=@Email";
            User? user = await _contextDapper.LoadDataSingle<User>(userSelectSql, parameters);

            if (user == null || user.Id == Guid.Empty)
            {
                string errorMsg = "User record not found after validation - this should NOT happen";
                throw new UnexpectedCaughtException(errorMsg, new Dictionary<string, string>
                {
                    { "Authentication", errorMsg }
                });

            }

            string token = _authService.CreateToken(user.Id.ToString()!);

            Response.Cookies.Append("AuthToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddDays(1)
            });

            HttpResponseDTO<AuthResponseDto> httpResponse = new()
            {
                Data = new AuthResponseDto()
                {
                    User = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        Username = user.Username,
                    },
                    MasterPasswordSalt = user.MasterPasswordSalt
                },
                Message = "Sign-in successful",
                StatusCode = 200

            };

            return Ok(httpResponse);
        }
        /*
        [HttpPost("Sign-up")]
        */
        [AllowAnonymous]
        [HttpPost("Sign-up")]
        public async Task<ActionResult<AuthResponseDto>> SignUp(AuthSignUpDto signUpDto)
        {

            string selectExistingUserSql = "EXEC PasswordSchema.spFor_Existing @Email=@Email";
            DynamicParameters parameters = new();
            parameters.Add("@Email", signUpDto.Email);

            IEnumerable<string> existingUser = await _contextDapper.LoadData<string>(selectExistingUserSql, parameters);
            if (existingUser.Any())
            {
                throw new UserAlreadyExistsException();
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

                throw new UserCreationFailedException();
            }

            string token = _authService.CreateToken(user.Id.ToString()!);

            Response.Cookies.Append("AuthToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
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
        /*
        [HttpGet("Check-session")]
        */
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
                throw new UnauthorizedException("User not authenticated", new Dictionary<string, string>
                {
                    { "Authentication", "No valid authentication token found" }
                });

            }


            string userIdSelectSql = "EXEC PasswordSchema.spUser_GetOne @Id=@Id";
            DynamicParameters parameters = new();
            parameters.Add("@Id", Guid.Parse(userId));

            User? user = await _contextDapper.QuerySingleOrDefaultAsync<User>(userIdSelectSql, parameters);

            if (user == null || user.Id == Guid.Empty)
            {

                throw new NotFoundException("User not found", new Dictionary<string, string>
                 {
                    { "User", "No user found for the given authentication token" }
                 });

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
        /*
        [HttpGet("Refresh-token")]
        */
        [HttpGet("Refresh-token")]
        public async Task<ActionResult<AuthResponseDto>> RefreshToken()
        {
            string userId = User.FindFirstValue("userId") ?? "";
            User.ToString();

            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedException("User not authenticated", new Dictionary<string, string>
                {
                    { "Authentication", "No valid authentication token found" }
                });

            }

            string userIdSelectSql = "EXEC PasswordSchema.spUser_GetOne @Id=@Id";
            DynamicParameters parameters = new();
            parameters.Add("@Id", Guid.Parse(userId));
            User? user = await _contextDapper.QuerySingleOrDefaultAsync<User>(userIdSelectSql, parameters);

            if (user == null || user.Id == Guid.Empty)
            {

                throw new NotFoundException("User not found", new Dictionary<string, string>
                 {
                    { "User", "No user found for the given authentication token" }
                 });

            }

            string token = _authService.CreateToken(user.Id!.ToString()!);

            Response.Cookies.Append("AuthToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true, 
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
        /*    
        [HttpPost("Sign-out")]
        */
        [HttpPost("Sign-out")]
        public new ActionResult<AuthResponseDto> SignOut()
        {
            Response.Cookies.Delete("AuthToken");

            AuthResponseDto response = new()
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