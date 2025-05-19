import express, { Application, NextFunction, Request, Response } from 'express';
import client from 'prom-client';

import { errorResponse } from './api/baseResponses';
import { Controller } from './controllers/controller';

export class App {
	public readonly app: Application;

	constructor(private port: number, private controllers: Controller[]) {
		this.app = express();

		this.initializeMiddlewares();
		this.initializePrometheusMetrics();
		this.initializeControllers();
		this.initializeBaseError();
	}

	private initializeMiddlewares = () => {
		this.app.use(express.json({ limit: '10mb' }));
	};

	private initializePrometheusMetrics = () => {
		// Створюємо реєстр метрик
		const register = new client.Registry();

		// Додаємо стандартні метрики (Node.js heap, CPU, тощо)
		client.collectDefaultMetrics({ register });

		// Створюємо метрики для відстеження запитів
		const httpRequestsTotal = new client.Counter({
			name: 'http_requests_total',
			help: 'Total number of HTTP requests',
			labelNames: ['method', 'route', 'status'],
			registers: [register],
		});

		const httpRequestDurationMicroseconds = new client.Histogram({
			name: 'http_request_duration_seconds',
			help: 'Duration of HTTP requests in seconds',
			labelNames: ['method', 'route', 'status'],
			// buckets for response time from 0.1ms to 1s
			buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
			registers: [register],
		});

		// Middleware для вимірювання тривалості запитів
		this.app.use((req, res, next) => {
			const start = Date.now();

			// Коли відповідь буде відправлена
			res.on('finish', () => {
				const duration = Date.now() - start;
				const route = req.path;
				const method = req.method;
				const status = res.statusCode;

				// Оновлюємо метрики
				httpRequestsTotal.inc({ method, route, status });
				httpRequestDurationMicroseconds.observe(
					{ method, route, status },
					duration / 1000 // конвертуємо в секунди
				);
			});

			next();
		});

		this.app.get('/metrics', async (req, res) => {
			res.set('Content-Type', register.contentType);
			res.end(await register.metrics());
		});

		// Health check endpoint
		this.app.get('/health', (req, res) => {
			res.json({ status: 'ok' });
		});
	};

	private initializeControllers = () => {
		this.controllers.forEach((controller) => {
			this.app.use(controller.path, controller.router);
		});
	};

	private initializeBaseError = () => {
		this.app.use((_req: Request, res: Response) => {
			res
				.status(404)
				.json(
					errorResponse(404, 'The requested API route could not be found.')
				);
		});
		this.app.use(
			(err: any, _req: Request, res: Response, _next: NextFunction) => {
				if (
					err instanceof SyntaxError &&
					'status' in err &&
					err.status === 400 &&
					'body' in err
				) {
					res.status(400).json(errorResponse(400, 'Invalid JSON syntax'));
					return;
				}
				res.status(500).json(errorResponse(500, 'Something went wrong'));
			}
		);
	};

	public listen = () => {
		this.app.listen(this.port, () => {
			console.log(`The server is running on port ${this.port}`);
		});
	};
}
