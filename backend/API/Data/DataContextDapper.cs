using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using API.Interfaces;

namespace API.Data
{
    public sealed class DataContextDapper : IDataContext
    {
        private readonly IConfiguration _config;
        private readonly string _connectionString = "";

        public DataContextDapper(IConfiguration config)
        {
            _config = config;
            _connectionString = _config["DefaultConnection"]
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        }

        public async Task<IEnumerable<T>> LoadData<T>(string sql, DynamicParameters? parameters)
        {
            using IDbConnection dbConnection = new SqlConnection(_connectionString);
            return await dbConnection.QueryAsync<T>(sql, parameters);
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


        public async Task<TReturn?> QueryAsyncTwoSplit<T1, T2, TReturn>(
            string sql,
            Func<T1, T2, TReturn> map,
            DynamicParameters? parameters,
            string splitOn)
        {
            using IDbConnection dbConnection = new SqlConnection(_connectionString);
            IEnumerable<TReturn>? result = await dbConnection.QueryAsync(sql, map, parameters, splitOn: splitOn);
            return result.FirstOrDefault();
        }

        public async Task<TReturn?> QueryAsyncThreeSplit<T1, T2, T3, TReturn>(
            string sql,
     Func<T1, T2, T3, TReturn> map,
    DynamicParameters? parameters,
    string splitOn)
        {
            using IDbConnection dbConnection = new SqlConnection(_connectionString);
            IEnumerable<TReturn>? result = await dbConnection.QueryAsync(sql, map, parameters, splitOn: splitOn);
            return result.FirstOrDefault();
        }


    }
}