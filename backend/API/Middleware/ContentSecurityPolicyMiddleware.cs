
namespace API.Middleware;

public sealed class ContentSecurityPolicyMiddleware
{
    private readonly RequestDelegate requestDelegate;

    public ContentSecurityPolicyMiddleware(RequestDelegate requestDelegate)
    {
        this.requestDelegate = requestDelegate;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        context.Response.Headers.Append(
               "Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; " +
        "font-src 'self'; " +
        "connect-src 'self' http://localhost:5222; " +
        "frame-ancestors 'none'; " +
        "form-action 'self';");

        await requestDelegate(context);
    }
}