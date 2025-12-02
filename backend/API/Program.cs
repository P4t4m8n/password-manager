
using API.Data;
using API.Services;
using API.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using API.Dtos.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;


var builder = WebApplication.CreateBuilder(args);


builder.Services.AddOpenApi();
builder.Services.AddControllers().AddJsonOptions(options =>
       {
           options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
           options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
       })
       .ConfigureApiBehaviorOptions(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        JsonNamingPolicy? camelCase = JsonNamingPolicy.CamelCase;
        Dictionary<string, string>? errors = context.ModelState
               .Where(e => e.Value?.Errors.Count > 0)
               .ToDictionary(
                   kvp => camelCase.ConvertName(kvp.Key),
                   kvp => kvp.Value?.Errors.First().ErrorMessage ?? ""
               );

        HttpErrorResponseDTO errorResponse = new()
        {
            Message = "One or more validation errors occurred.",
            StatusCode = StatusCodes.Status400BadRequest,
            Errors = errors
        };

        return new BadRequestObjectResult(errorResponse);
    };
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors((options) =>
    {
        options.AddPolicy("DevCors", (corsBuilder) =>
            {
                corsBuilder.WithOrigins("http://localhost:4200", "http://localhost:3000", "http://localhost:8000")
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            });
        options.AddPolicy("ProdCors", (corsBuilder) =>
            {
                corsBuilder.WithOrigins("https://myProductionSite.com")
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            });
    });


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        string? tokenKeyString = builder.Configuration["Crypto:TokenKey"];
        options.TokenValidationParameters = new TokenValidationParameters()
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                    tokenKeyString != null ? tokenKeyString : ""
                )),
            ValidateIssuer = false,
            ValidateAudience = false
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                context.Token = context.Request.Cookies["AuthToken"];
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddScoped<IDataContext, DataContextDapper>();
builder.Services.AddScoped<IGoogleService, GoogleService>();
builder.Services.AddScoped<ICryptoService, CryptoService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPasswordEntryService, PasswordEntryService>();
builder.Services.AddScoped<IMasterPasswordRecoveryService, MasterPasswordRecoveryService>();



var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseCors("DevCors");
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseCors("ProdCors");
    app.UseHttpsRedirection();
}

app.UseAuthentication();

app.UseAuthorization();
app.UseMiddleware<API.Middleware.ErrorHandlingMiddleware>();

app.MapControllers();

app.Run();

public partial class Program { }
