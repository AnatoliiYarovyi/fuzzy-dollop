import express, { Request } from 'express';
import * as promClient from 'prom-client';

import { getNatsConnection } from './natsClient';
import { IEvent } from './types';

const app = express();
app.use(express.json({ limit: '50mb' }));

function getNatsTopic(event: IEvent): string {
	if (event.source === 'facebook') return 'events.facebook';
	if (event.source === 'tiktok') return 'events.tiktok';
	return 'events.unknown';
}

// Створюємо реєстр метрик
const register = new promClient.Registry();

// Додаємо стандартні метрики (Node.js heap, CPU, тощо)
promClient.collectDefaultMetrics({ register });

// Створюємо метрики для відстеження запитів
const httpRequestsTotal = new promClient.Counter({
	name: 'http_requests_total',
	help: 'Total number of HTTP requests',
	labelNames: ['method', 'route', 'status'],
	registers: [register],
});

const httpRequestDurationMicroseconds = new promClient.Histogram({
	name: 'http_request_duration_seconds',
	help: 'Duration of HTTP requests in seconds',
	labelNames: ['method', 'route', 'status'],
	// buckets for response time from 0.1ms to 1s
	buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
	registers: [register],
});

// Middleware для вимірювання тривалості запитів
app.use((req, res, next) => {
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

app.get('/metrics', async (req, res) => {
	res.set('Content-Type', register.contentType);
	res.end(await register.metrics());
});

// Health check endpoint
app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

app.post('/events', async (req: Request<{}, {}, IEvent[]>, res) => {
	const events = req.body;
	const nc = await getNatsConnection();

	for (const event of events) {
		const topic = getNatsTopic(event);
		nc.publish(topic, JSON.stringify(event));
	}

	res.status(202).send({ status: 'event published' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`🚀 Gateway listening on port ${PORT}`);
});
