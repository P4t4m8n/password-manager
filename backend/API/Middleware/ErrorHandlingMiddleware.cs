using System.Net;
using System.Text.Json;
using API.Dtos.Http;
using API.Exceptions;

namespace API.Middleware
{
    public sealed class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception has occurred.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/problem+json";

            HttpErrorResponseDTO response = new()
            {
                Message = exception.Message,
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Errors = null
            };

            if (exception is BaseException appEx)
            {
                response.StatusCode = appEx.StatusCode;
                response.Errors = appEx.Errors;
            }
            else
            {
                response.Message = "Internal Server Error";
                _logger.LogError(exception, "Unexpected error");
            }

            context.Response.StatusCode = response.StatusCode;
            JsonSerializerOptions? options = new(JsonSerializerDefaults.Web)
            {
                DictionaryKeyPolicy = JsonNamingPolicy.CamelCase
            };
            string? result = JsonSerializer.Serialize(response, options);
            return context.Response.WriteAsync(result);
        }
    }
}
