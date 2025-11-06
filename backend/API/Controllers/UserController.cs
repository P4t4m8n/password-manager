

using API.Interfaces;
using Dapper;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
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
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Id", id);

            int rowsAffected = await _contextDapper.ExecuteSql(sql, parameters);
            if (rowsAffected == 0)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}