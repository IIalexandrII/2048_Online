using GameBackend.Hubs;
using GameBackend.Models;


// BUILD ========================================================
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddSignalR();

builder.Services.AddSingleton<GameStore>();

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("DevPolicy", policy =>
        {
            policy.WithOrigins("http://127.0.0.1:5500", "http://localhost:5500")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
    });
}

// APP ==========================================================
var API_KEY = builder.Configuration["MYIP_API_KEY"] ?? throw new InvalidOperationException("env: 'MYIP_API_KEY' is not set");
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseCors("DevPolicy");
}

app.MapHub<GameHub>("/gamehub");

app.MapGet("/myip", (HttpContext context) =>
{
    string? api = context.Request.Headers["X-API-Key"].FirstOrDefault();
    if (string.IsNullOrEmpty(api) || api != API_KEY) 
        return Results.Unauthorized();

    return Results.Ok(new 
    {
        ip = context.Connection.RemoteIpAddress?.ToString(),
        XForwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault()
    });
});

app.Run();
