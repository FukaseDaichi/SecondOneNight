export type ConnectionStatus =
    | 'connecting'
    | 'connected'
    | 'reconnecting'
    | 'disconnected';

export type GameSocket = {
    status: ConnectionStatus;
    connected: boolean;
    send: (destination: string, payload: unknown) => void;
};
