namespace GameBackend.Models;

public class GameSession
{
    public string Code { get; set; } = "";
    public string HostConnectionId { get; set; } = "";
    public string? GuestConnectionId { get; set; }
    public bool IsHostStep { get; set; } = true;
    public Tile[]? Tiles { get; set; }
}


