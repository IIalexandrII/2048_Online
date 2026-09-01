using GameBackend.Models;
using Microsoft.AspNetCore.SignalR;

namespace GameBackend.Hubs;


public class GameHub: Hub
{
    private readonly GameStore _gameStore;

    public GameHub(GameStore gameStore)
    {
        _gameStore = gameStore;
    }

    // INIT GAME ================================================
    public async Task<string> CreateGame()
    {
        string code;
        do
        {
            code = GenerateCode(6);
        }while(_gameStore.Games.ContainsKey(code));

        var session = new GameSession
        {
            Code = code,
            HostConnectionId = Context.ConnectionId
        };
        _gameStore.Games[code] = session;

        await Groups.AddToGroupAsync(Context.ConnectionId, code);

        return code;
    }

    public async Task<StatusResponse> JoinGame(string code)
    {
        if(!_gameStore.Games.TryGetValue(code, out var session)) 
            return new StatusResponse(false, 404, "Game not found");
        if(session.GuestConnectionId != null) 
            return new StatusResponse(false, 409, "Already connected");

        session.GuestConnectionId = Context.ConnectionId;
        await Groups.AddToGroupAsync(Context.ConnectionId, code);

        await Clients.Client(session.HostConnectionId).SendAsync("PlayerJoined");

        return new StatusResponse(true, 200, null);
    }

    
    // GAME CONTROL =============================================

    public async Task<StatusResponse> SyncGameField(SyncGameFieldRequest request)
    {
        if (!_gameStore.Games.TryGetValue(request.Code, out var session))
            return new StatusResponse(false, 404, "Game not found");

        if (session.HostConnectionId != Context.ConnectionId)
            return new StatusResponse(false, 403, "Only the host can sync the game field");

        if (session.GuestConnectionId == null)
            return new StatusResponse(false, 409, "Opponent has not joined yet");

        session.Tiles = request.Tiles;

        await Clients.Client(session.GuestConnectionId).SendAsync("GameFieldSynced", request.Tiles);

        return new StatusResponse(true, 200, null);
    }

    public async Task<StatusResponse> Move(MoveRequest request)
    {
        if (!_gameStore.Games.TryGetValue(request.Code, out var session))
            return new StatusResponse(false, 404, "Game not found");

        if (session.GuestConnectionId == null)
            return new StatusResponse(false, 409, "Opponent has not joined yet");

        string targetClientIdForSend = Context.ConnectionId == session.HostConnectionId ? session.GuestConnectionId : session.HostConnectionId;
        await Clients.Client(targetClientIdForSend).SendAsync("invokeMove",new MoveResponseForOponent(request.eventKey, request.x, request.y, request.value));

        return new StatusResponse(true, 200, null);
    }

    // COMMON ===================================================
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var session = _gameStore.Games.Values
            .FirstOrDefault(s => s.HostConnectionId == Context.ConnectionId 
                               || s.GuestConnectionId == Context.ConnectionId);

        if (session != null)
        {
            await Clients.Group(session.Code).SendAsync("OpponentDisconnected");
            _gameStore.Games.TryRemove(session.Code, out _);
        }

        await base.OnDisconnectedAsync(exception);
    }


    private static string GenerateCode(int length)
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = Random.Shared;

        return new string(Enumerable.Range(0, length)
            .Select(_ => chars[random.Next(chars.Length)])
            .ToArray());
    }
}
