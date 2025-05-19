import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { FbEventSelect, fbEventsTable } from '../schema';
import { GetDemographics, GetEvents, GetRevenue } from './types';
import { and, between, count, eq, SQL, sum, asc, isNotNull } from 'drizzle-orm';

export class FbEventsRepo {
	constructor(private readonly db: PostgresJsDatabase) {}

	public async getEvents(queries: GetEvents): Promise<FbEventSelect[]> {
		const filter: SQL<unknown>[] = [];
		if (queries.funnelStage === 'top') {
			filter.push(eq(fbEventsTable.funnelStage, 'top'));
		}
		if (queries.funnelStage === 'bottom') {
			filter.push(eq(fbEventsTable.funnelStage, 'bottom'));
		}

		const result = await this.db
			.select()
			.from(fbEventsTable)
			.where(
				and(
					...filter,
					between(
						fbEventsTable.timestamp,
						new Date(queries.from),
						new Date(queries.to)
					),
					eq(fbEventsTable.eventType, queries.eventType)
				)
			);

		return result;
	}

	public async getRevenue(queries: GetRevenue): Promise<number> {
		const filter: SQL<unknown>[] = [];
		if (queries.campaignId) {
			filter.push(eq(fbEventsTable.campaignId, queries.campaignId));
		}

		const result = await this.db
			.select({ sum: sum(fbEventsTable.purchaseAmount) })
			.from(fbEventsTable)
			.where(
				and(
					...filter,
					between(
						fbEventsTable.timestamp,
						new Date(queries.from),
						new Date(queries.to)
					)
				)
			);

		return result[0].sum ? Number(result[0].sum) : 0;
	}

	public async getDemographics(queries: GetDemographics) {
		const result = await this.db
			.select({
				userAge: fbEventsTable.userAge,
				userGender: fbEventsTable.userGender,
				userCountry: fbEventsTable.userCountry,
				userCity: fbEventsTable.userCity,
				count: count(fbEventsTable.userId),
				sum: sum(fbEventsTable.purchaseAmount),
			})
			.from(fbEventsTable)
			.where(
				and(
					between(
						fbEventsTable.timestamp,
						new Date(queries.from),
						new Date(queries.to)
					),
					isNotNull(fbEventsTable.userAge),
					isNotNull(fbEventsTable.userGender),
					isNotNull(fbEventsTable.userCountry),
					isNotNull(fbEventsTable.userCity)
				)
			)
			.groupBy(
				fbEventsTable.userAge,
				fbEventsTable.userGender,
				fbEventsTable.userCountry,
				fbEventsTable.userCity
			)
			.orderBy(asc(fbEventsTable.userAge));

		return result;
	}
}
