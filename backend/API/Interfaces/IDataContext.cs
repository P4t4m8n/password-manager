using Dapper;
namespace API.Interfaces;

public interface IDataContext
{
    Task<IEnumerable<T>> LoadData<T>(string sql, DynamicParameters? parameters);
    Task<T?> LoadDataSingle<T>(string sql, DynamicParameters? parameters);
    Task<int> ExecuteSql(string sql, DynamicParameters? parameters);
    Task<T?> InsertAndReturn<T>(string sql, DynamicParameters? parameters);
}