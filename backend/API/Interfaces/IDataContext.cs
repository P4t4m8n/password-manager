using Dapper;
namespace API.Interfaces;

public interface IDataContext
{
    Task<IEnumerable<T>> LoadData<T>(string sql, DynamicParameters? parameters);
    Task<int> ExecuteSql(string sql, DynamicParameters? parameters);
    Task<T?> QuerySingleOrDefaultAsync<T>(string sql, DynamicParameters? parameters);

    Task<TReturn?> QueryAsyncTwoSplit<T1, T2, TReturn>(
        string sql,
        Func<T1, T2, TReturn> map,
        DynamicParameters? parameters,
        string splitOn);

    Task<TReturn?> QueryAsyncThreeSplit<T1, T2, T3, TReturn>(
string sql,
Func<T1, T2, T3, TReturn> map,
DynamicParameters? parameters,
string splitOn);

}