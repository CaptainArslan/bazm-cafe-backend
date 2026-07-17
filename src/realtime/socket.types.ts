/*
|--------------------------------------------------------------------------
| Client-to-server events
|--------------------------------------------------------------------------
|
| Events received by the backend from a connected frontend.
|
*/

export interface ClientToServerEvents {
    'connection:ping': (
        acknowledgement: (response: {
            success: true;
            timestamp: string;
        }) => void,
    ) => void;
}

/*
|--------------------------------------------------------------------------
| Server-to-client events
|--------------------------------------------------------------------------
|
| Events emitted by the backend to connected frontend applications.
|
*/

export interface ServerToClientEvents {
    'connection:ready': (payload: {
        socketId: string;
        message: string;
        connectedAt: string;
    }) => void;
}

/*
|--------------------------------------------------------------------------
| Server-to-server events
|--------------------------------------------------------------------------
|
| Used later if BAZM runs multiple Node.js instances.
|
*/

export interface InterServerEvents {
    ping: () => void;
}

/*
|--------------------------------------------------------------------------
| Socket-specific data
|--------------------------------------------------------------------------
|
| Information attached to an individual Socket.IO connection.
|
*/

export interface SocketData {
    connectedAt: Date;
    user?: {
        uuid: string;
        role: 'ADMIN' | 'STAFF';
    };
}