using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using API.Interfaces;

namespace API.Data
{
    public class DataContextDapper : IDataContext
    {
        private readonly IConfiguration _config;
        private readonly string _connectionString = "";

        public DataContextDapper(IConfiguration config)
        {
            _config = config;
            _connectionString = _config.GetConnectionString("DefaultConnection") ?? "";

        }

        public async Task<IEnumerable<T>> LoadData<T>(string sql, DynamicParameters? parameters)
        {
            using IDbConnection dbConnection = new SqlConnection(_connectionString);
            return await dbConnection.QueryAsync<T>(sql, parameters);
        }

        public async Task<T?> LoadDataSingle<T>(string sql, DynamicParameters? parameters)
        {
            using IDbConnection dbConnection = new SqlConnection(_connectionString);
            return await dbConnection.QuerySingleOrDefaultAsync<T>(sql, parameters);
        }
        public async Task<T?> QuerySingleOrDefaultAsync<T>(string sql, DynamicParameters? parameters)
        {
            using IDbConnection dbConnection = new SqlConnection(_connectionString);
            return await dbConnection.QuerySingleOrDefaultAsync<T>(sql, parameters);
        }

        public async Task<int> ExecuteSql(string sql, DynamicParameters? parameters)
        {
            using IDbConnection dbConnection = new SqlConnection(_connectionString);
            return await dbConnection.ExecuteAsync(sql, parameters);
        }

        public async Task<T?> InsertAndReturn<T>(string sql, DynamicParameters? parameters)
        {
            using IDbConnection dbConnection = new SqlConnection(_connectionString);
            return await dbConnection.QuerySingleOrDefaultAsync<T>(sql, parameters);
        }




    }
}