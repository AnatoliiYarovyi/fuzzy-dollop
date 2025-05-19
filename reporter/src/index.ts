import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';

import { App } from './app';

// repositories
import { FbEventsRepo } from './db/fbEventsRepo';
import { TtkEventsRepo } from './db/ttkEventsRepo';

// services
import { ServiceReports } from './services/serviceReports';

// controllers
import { CtrlReports } from './controllers/ctrlReports';

(async () => {
	const {
		// DATABASE_URL = 'postgres://postgres:postgres@postgres:5432/event_platform',
		DATABASE_URL = 'postgres://postgres:postgres@postgres.event-platform.orb.local:5432/event_platform',
		PORT = 3004,
	} = process.env;
	try {
		const db = drizzle(DATABASE_URL);

		// repositories
		const fbEventsRepo = new FbEventsRepo(db);
		const ttkEventsRepo = new TtkEventsRepo(db);

		// services
		const serviceReports = new ServiceReports(fbEventsRepo, ttkEventsRepo);

		// controllers
		const ctrlReports = new CtrlReports(serviceReports);

		const app = new App(+PORT, [ctrlReports]);

		app.listen();
	} catch (error: any) {
		console.error(error);
	}
})();
