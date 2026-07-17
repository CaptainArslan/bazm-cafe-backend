import { app } from './app.js';
import { prisma } from './config/database.js';
import { env } from './config/environment.js';

const server = app.listen(env.PORT, env.HOST, () => {
    console.log('');
    console.log(`${env.APP_NAME} backend started successfully.`);
    console.log(`Local URL: http://localhost:${env.PORT}`);
    console.log(`Health API: http://localhost:${env.PORT}/api/v1/health`);
    console.log('');
});

let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
    if (isShuttingDown) {
        return;
    }

    isShuttingDown = true;

    console.log(`${signal} received. Closing application...`);

    server.close(async (error) => {
        if (error) {
            console.error('Failed to close HTTP server:', error);
            process.exit(1);
        }

        await prisma.$disconnect();

        console.log('HTTP server and database connections closed.');
        process.exit(0);
    });
}

process.on('SIGINT', () => {
    void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
});