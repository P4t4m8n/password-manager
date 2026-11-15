
using API.Dtos.Auth;
using API.Dtos.User;
using API.Exceptions;
using API.Interfaces;
using API.Models;
using Dapper;

namespace API.Services
{
    public sealed class AuthService : IAuthService
    {
        private readonly IDataContext _contextDapper;
        private readonly ICryptoService _cryptoService;
        public AuthService(IDataContext contextDapper, ICryptoService cryptoService)
        {
            _contextDapper = contextDapper;
            _cryptoService = cryptoService;
        }
        public async Task<AuthResponseDTO> SignInAsync(AuthSignInDTO signInDto, HttpResponse response)
        {

            // throw new NotImplementedException();
            await VerifyUserAndPasswordAsync(signInDto);

            UserWithSettings? user = await GetUserByEmailOrIdAsync(signInDto.Email, null) ??
             throw new NotFoundException("User not found after successful authentication", new Dictionary<string, string>
                 {
                    { "User", "No user found for the given email after successful authentication" }
                 });

            AppendAuthCookie(user.Id.ToString(), response);

            return CreateAuthResponse(user);
        }
        public async Task<AuthResponseDTO> SignUpAsync(AuthSignUpDTO signUpDto, HttpResponse response)
        {
            await CheckUserExist(signUpDto.Email);
            UserWithSettings? user = await CreateUserAsync(signUpDto);
            AppendAuthCookie(user.Id.ToString(), response);
            return CreateAuthResponse(user);
        }
        public async Task<AuthResponseDTO> CheckSessionAsync(Guid userGuid)
        {

            UserWithSettings user = await GetUserByEmailOrIdAsync(null, userGuid) ??
             throw new NotFoundException("User not found", new Dictionary<string, string>
                 {
                    { "User", "No user found for the given authentication token" }
                 });

            return CreateAuthResponse(user);
        }
        public async Task<AuthResponseDTO> RefreshTokenAsync(Guid userGuid, HttpResponse response)
        {

            UserWithSettings? user = await GetUserByEmailOrIdAsync(null, userGuid)
             ?? throw new NotFoundException("User not found", new Dictionary<string, string>
                 {
                    { "User", "No user found for the given authentication token" }
                 });

            AppendAuthCookie(user.Id.ToString(), response);

            return CreateAuthResponse(user);
        }

        private async Task VerifyUserAndPasswordAsync(AuthSignInDTO signInDto)
        {

            DynamicParameters parameters = new();
            if (string.IsNullOrEmpty(signInDto.Password) || string.IsNullOrEmpty(signInDto.Email))
            {
                throw new UnauthorizedException("Invalid email or password");
            }
            // Migrated: EXEC PasswordSchema.spFor_Hash -> SELECT * FROM PG function
            string sqlForHash = "SELECT * FROM password_schema.sp_for_hash(@Email)";

            parameters.Add("@Email", signInDto.Email);

            AuthConfirmationDTO? authConfirmation = await _contextDapper.QuerySingleOrDefaultAsync<AuthConfirmationDTO>(sqlForHash, parameters)
             ?? throw new UnauthorizedException("Invalid email or password", new Dictionary<string, string>
               {
                   { "Email",  "Invalid email or password" },
                   { "Password",  "Invalid email or password" },
               });



            byte[] passwordHash = _cryptoService.GetPasswordHash(signInDto.Password, authConfirmation.PasswordSalt);

            for (int i = 0; i < passwordHash.Length; i++)
            {
                if (passwordHash[i] != authConfirmation.PasswordHash[i])
                {
                    throw new UnauthorizedException("Invalid email or password", new Dictionary<string, string>
                    {
                          { "Email",  "Invalid email or password" },
                          { "Password",  "Invalid email or password" },
                    });
                }
            }

        }
        private async Task<UserWithSettings?> GetUserByEmailOrIdAsync(string? email, Guid? id)
        {

            DynamicParameters parameters = new();
            parameters.Add("@Email", email);
            parameters.Add("@Id", id);
            // Migrated: EXEC PasswordSchema.spUser_GetOne -> SELECT * FROM PG function
            string userSelectSql = "SELECT * FROM password_schema.sp_user_get_one(@Email, @Id)";

            UserWithSettings? user = await _contextDapper.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(userSelectSql,
            (user, settings) =>
              {
                  UserWithSettings userWithSettings = new()
                  {
                      Id = user.Id,
                      Username = user.Username,
                      Email = user.Email,
                      PasswordHash = user.PasswordHash,
                      PasswordSalt = user.PasswordSalt,
                      GoogleId = user.GoogleId,
                      MasterPasswordSalt = user.MasterPasswordSalt,
                      MasterPasswordVerification = user.MasterPasswordVerification,
                      MasterPasswordVerificationIV = user.MasterPasswordVerificationIV,
                      EncryptedMasterKeyWithRecovery = user.EncryptedMasterKeyWithRecovery,
                      RecoveryIV = user.RecoveryIV,
                      CreatedAt = user.CreatedAt,
                      UpdatedAt = user.UpdatedAt,
                      Settings = settings
                  };
                  return userWithSettings;
              },
                parameters,
                       splitOn: "MasterPasswordTTLInMinutes"
                  );

            return user;
        }
        private void AppendAuthCookie(string userId, HttpResponse response)
        {
            string token = _cryptoService.CreateToken(userId);

            response.Cookies.Append("AuthToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,

                Expires = DateTimeOffset.UtcNow.AddDays(1)
            });

            return;
        }

        private async Task CheckUserExist(string? email)
        {
            if (email == null)
            {
                throw new UnexpectedCaughtException("Email is null during user existence check", new Dictionary<string, string>
                {
                    { "Email", "Email provided is null" }
                });
            }

            DynamicParameters parameters = new();
            // Migrated: EXEC PasswordSchema.spFor_Existing -> SELECT * FROM PG function
            string selectExistingUserSql = "SELECT * FROM password_schema.sp_for_existing(@Email)";
            parameters.Add("@Email", email);

            IEnumerable<string> existingUser = await _contextDapper.LoadData<string>(selectExistingUserSql, parameters);
            if (existingUser.Any())
            {
                throw new UserAlreadyExistsException();
            }
        }
        private async Task<UserWithSettings> CreateUserAsync(AuthSignUpDTO signUpDto)
        {


            DynamicParameters parameters = new();
            if (string.IsNullOrEmpty(signUpDto.Password) || string.IsNullOrEmpty(signUpDto.Email))
            {
                throw new UnexpectedCaughtException("Password or email is null during user creation",
                    new Dictionary<string, string> { { "Auth", "Invalid signup payload" } });
            }
            byte[] PasswordSalt = _cryptoService.GenerateSalt();

            byte[] passwordHash = _cryptoService.GetPasswordHash(signUpDto.Password, PasswordSalt);

            // Migrated: EXEC PasswordSchema.spUser_Create -> SELECT * FROM PG function
            string sqlInsertAuth = @"SELECT * FROM password_schema.sp_user_create(
                                      @Email, @Username, @PasswordHash, @PasswordSalt)";

            parameters.Add(@"Username", signUpDto.Username);
            parameters.Add(@"PasswordHash", passwordHash);
            parameters.Add(@"PasswordSalt", PasswordSalt);
            parameters.Add(@"Email", signUpDto.Email);

            UserWithSettings? user = await _contextDapper.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(sqlInsertAuth,
                      (user, settings) =>
                        {
                            UserWithSettings userWithSettings = new()
                            {
                                Id = user.Id,
                                Username = user.Username,
                                Email = user.Email,
                                PasswordHash = user.PasswordHash,
                                PasswordSalt = user.PasswordSalt,
                                GoogleId = user.GoogleId,
                                MasterPasswordSalt = user.MasterPasswordSalt,
                                MasterPasswordVerification = user.MasterPasswordVerification,
                                MasterPasswordVerificationIV = user.MasterPasswordVerificationIV,
                                EncryptedMasterKeyWithRecovery = user.EncryptedMasterKeyWithRecovery,
                                RecoveryIV = user.RecoveryIV,
                                CreatedAt = user.CreatedAt,
                                UpdatedAt = user.UpdatedAt,
                                Settings = settings
                            };
                            return userWithSettings;
                        },
                         parameters,
                                 splitOn: "MasterPasswordTTLInMinutes"
                            );
            if (user == null || user.Id == Guid.Empty)
            {

                throw new UserCreationFailedException();
            }

            return user;

        }

        private static AuthResponseDTO CreateAuthResponse(UserWithSettings user)
        {
            return new AuthResponseDTO()
            {
                User = new UserDTO
                {
                    Id = user.Id,
                    Email = user.Email,
                    Username = user.Username,
                    Settings = new UserSettingsDTO
                    {
                        UserId = user.Settings.UserId,
                        MasterPasswordTTLInMinutes = user.Settings.MasterPasswordTTLInMinutes,
                        AutoLockTimeInMinutes = user.Settings.AutoLockTimeInMinutes,
                        Theme = user.Settings.Theme,
                        MinimumPasswordStrength = user.Settings.MinimumPasswordStrength,
                        MasterPasswordStorageMode = user.Settings.MasterPasswordStorageMode,
                        CreatedAt = user.Settings.CreatedAt,
                        UpdatedAt = user.Settings.UpdatedAt
                    }
                },
                MasterPasswordSalt = user.MasterPasswordSalt,
                MasterPasswordVerification = user.MasterPasswordVerification,
                MasterPasswordVerificationIV = user.MasterPasswordVerificationIV
            };

        }

    }
}