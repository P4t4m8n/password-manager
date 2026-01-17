using API.Dtos.Http;
using API.Exceptions;
using API.Interfaces;
using Dapper;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{

    [ApiController]
    [Route("api/user")]
    public sealed class UserController : ControllerBase
    {
        private readonly IDataContext _contextDapper;

        public UserController(IDataContext contextDapper)
        {
            _contextDapper = contextDapper;
        }

        [HttpDelete("{userId}")]
        public async Task<IActionResult> DeleteUser(Guid userId)
        {
            string query = "DELETE FROM PasswordSchema.[User] WHERE Id = @UserId";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userId);
            int affectedRows = await _contextDapper.ExecuteSql(query, parameters);

            if (affectedRows == 0)
            {
                throw new NotFoundException("User not found", new Dictionary<string, string>
                {
                    { "UserId", userId.ToString() }
                });
            }

            HttpResponseDTO<object> httpResponse = new()
            {
                Data = null,
                Message = "Entry deleted successfully.",
                StatusCode = 200
            };

            return StatusCode(httpResponse.StatusCode, httpResponse);
        }

    }
}