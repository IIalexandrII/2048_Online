using System.Collections.Concurrent;

namespace GameBackend.Models;


public  class GameStore
{
    // Key is game code
    public  ConcurrentDictionary<string, GameSession> Games = new();
}