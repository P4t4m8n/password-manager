

using API.Dtos.Http;
using API.Exceptions;
using API.Interfaces;
using Dapper;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public sealed class UserController : ControllerBase
    {
        private readonly IDataContext _contextDapper;

        public UserController(IDataContext contextDapper)
        {
            _contextDapper = contextDapper;
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            string sql = "DELETE FROM PasswordSchema.[User] WHERE Id = @Id";
            DynamicParameters parameters = new();
            parameters.Add("@Id", id);

            int rowsAffected = await _contextDapper.ExecuteSql(sql, parameters);
            if (rowsAffected == 0)
            {
                throw new UnexpectedCaughtException("Failed to delete user", new Dictionary<string, string>
                {
                        { "Deletion", "No user was deleted in the database." }
                });
            }

            HttpResponseDTO<object> httpResponse = new()
            {
                Data = null,
                Message = "User deleted successfully."
            };

            return Ok(httpResponse);
        }
    }
}