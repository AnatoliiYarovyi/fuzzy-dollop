import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { ttkEventsTable, TtkEventSelect } from '../schema';
import { GetDemographics, GetEvents, GetRevenue } from './types';
import { and, between, count, eq, SQL, sum, asc, isNotNull } from 'drizzle-orm';

export class TtkEventsRepo {
	constructor(private readonly db: PostgresJsDatabase) {}

	public async getEvents(queries: GetEvents): Promise<TtkEventSelect[]> {
		const filter: SQL<unknown>[] = [];
		if (queries.funnelStage === 'top') {
			filter.push(eq(ttkEventsTable.funnelStage, 'top'));
		}
		if (queries.funnelStage === 'bottom') {
			filter.push(eq(ttkEventsTable.funnelStage, 'bottom'));
		}

		const result = await this.db
			.select()
			.from(ttkEventsTable)
			.where(
				and(
					...filter,
					between(
						ttkEventsTable.timestamp,
						new Date(queries.from),
						new Date(queries.to)
					),
					eq(ttkEventsTable.eventType, queries.eventType)
				)
			);

		return result;
	}

	public async getRevenue(queries: GetRevenue): Promise<number> {
		const result = await this.db
			.select({ sum: sum(ttkEventsTable.purchaseAmount) })
			.from(ttkEventsTable)
			.where(
				between(
					ttkEventsTable.timestamp,
					new Date(queries.from),
					new Date(queries.to)
				)
			);

		return result[0]?.sum ? Number(result[0]?.sum) : 0;
	}

	public async getDemographics(queries: GetDemographics) {
		const result = await this.db
			.select({
				followers: ttkEventsTable.followers,
				country: ttkEventsTable.country,
				sum: sum(ttkEventsTable.purchaseAmount),
				count: count(ttkEventsTable.purchaseAmount),
			})
			.from(ttkEventsTable)
			.where(
				and(
					between(
						ttkEventsTable.timestamp,
						new Date(queries.from),
						new Date(queries.to)
					),
					isNotNull(ttkEventsTable.followers),
					isNotNull(ttkEventsTable.country)
				)
			)
			.groupBy(ttkEventsTable.country, ttkEventsTable.followers)
			.orderBy(asc(ttkEventsTable.followers));

		return result;
	}
}
