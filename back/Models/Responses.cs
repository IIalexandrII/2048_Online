namespace GameBackend.Models;

public record StatusResponse(bool Success, int StatusCode, string? ErrorMessage);

public record MoveResponseForOponent(string EventKey, int x, int y, int Value);
