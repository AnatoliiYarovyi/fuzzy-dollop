import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { tiktokEventsTable, ttkEventInsert } from './schema';

export class EventsRepo {
	constructor(private readonly db: PostgresJsDatabase) {}

	public async insert(insertData: ttkEventInsert) {
		await this.db.insert(tiktokEventsTable).values(insertData);
	}
}
