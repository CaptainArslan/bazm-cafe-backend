import type { Socket } from 'socket.io';

import type {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
} from './socket.types.js';

export type ApplicationSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

export function registerSocketEvents(
    socket: ApplicationSocket,
): void {
    socket.data.connectedAt = new Date();

    console.log(`Socket connected: ${socket.id}`);

    socket.emit('connection:ready', {
        socketId: socket.id,
        message: 'Connected to BAZM Cafe real-time server.',
        connectedAt: socket.data.connectedAt.toISOString(),
    });

    socket.on('connection:ping', (acknowledgement) => {
        acknowledgement({
            success: true,
            timestamp: new Date().toISOString(),
        });
    });

    socket.on('disconnect', (reason) => {
        console.log(`Socket disconnected: ${socket.id}; reason: ${reason}`);
    });

    socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });
}
