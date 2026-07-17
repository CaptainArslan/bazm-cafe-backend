import express, {
    type NextFunction,
    type Request,
    type Response,
} from 'express';

export const app = express();

/*
|--------------------------------------------------------------------------
| Global middleware
|--------------------------------------------------------------------------
*/

app.disable('x-powered-by');

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    }),
);

/*
|--------------------------------------------------------------------------
| Application root
|--------------------------------------------------------------------------
*/

app.get('/', (_request: Request, response: Response) => {
    response.status(200).json({
        success: true,
        message: 'Welcome to the BAZM Cafe API.',
        data: {
            version: '1.0.0',
            health: '/api/v1/health',
        },
    });
});


/*
|--------------------------------------------------------------------------
| Health endpoint
|--------------------------------------------------------------------------
*/

app.get('/api/v1/health', (_request: Request, response: Response) => {
    response.status(200).json({
        success: true,
        message: 'BAZM Cafe API is running.',
        data: {
            application: process.env.APP_NAME ?? 'BAZM Cafe',
            environment: process.env.NODE_ENV ?? 'development',
            timestamp: new Date().toISOString(),
        },
    });
});

/*
|--------------------------------------------------------------------------
| Not-found handler
|--------------------------------------------------------------------------
*/

app.use((_request: Request, response: Response) => {
    response.status(404).json({
        success: false,
        message: 'API endpoint not found.',
    });
});

/*
|--------------------------------------------------------------------------
| Global error handler
|--------------------------------------------------------------------------
*/

app.use(
    (
        error: Error,
        _request: Request,
        response: Response,
        _next: NextFunction,
    ) => {
        console.error(error);

        response.status(500).json({
            success: false,
            message: 'An unexpected server error occurred.',
        });
    },
);