import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { facebookEventsTable, FbEventInsert } from './schema';

export class EventsRepo {
	constructor(private readonly db: PostgresJsDatabase) {}

	public async insert(insertData: FbEventInsert) {
		await this.db.insert(facebookEventsTable).values(insertData);
	}
}
