import path from 'node:path';
import express, { NextFunction, Request, Response } from 'express';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import 'dotenv/config';
import client from 'prom-client';

import { subscribeToEvents } from './nats';
import { EventsRepo } from './db/eventsRepo';

const { DATABASE_URL } = process.env as { DATABASE_URL: string };

(async () => {
	try {
		const app = express();
		const port = 3003;

		const db = drizzle(DATABASE_URL);
		migrate(db, {
			migrationsFolder: './migrations',
		});

		const eventsRepo = new EventsRepo(db);

		// Prometheus metrics
		const collectDefaultMetrics = client.collectDefaultMetrics;
		collectDefaultMetrics();

		app.get('/metrics', async (req, res) => {
			res.set('Content-Type', client.register.contentType);
			res.end(await client.register.metrics());
		});

		// Health check endpoint
		app.get('/health', (req, res) => {
			res.json({ status: 'ok' });
		});

		app.use((_, res) => {
			res.status(404).json({ message: 'Not found' });
		});

		app.use((err: any, _: Request, res: Response, __: NextFunction) => {
			const { status = 500, message = 'Server error' } = err;
			res.status(status).json({ message });
		});

		app.listen(port, () =>
			console.log(`🟢 Collector listening on port ${port}`)
		);

		await subscribeToEvents(eventsRepo); // запускаємо підписку
	} catch (error) {
		console.log(error);
	}
})();
