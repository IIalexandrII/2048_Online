namespace GameBackend.Models;

public record SyncGameFieldRequest(Tile[] Tiles, string Code);

public record MoveRequest(string Code, string eventKey, int x, int y, int value, bool isHost);