import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { EventQueries, RevenueQueries, DemographicsQueries } from './types';

import type { FbEventsRepo } from '../../db/fbEventsRepo';
import type { TtkEventsRepo } from '../../db/ttkEventsRepo';
import type { FbEventSelect, TtkEventSelect } from '../../db/schema';

export class ServiceReports {
	private readonly fbEventsRepo: FbEventsRepo;
	private readonly ttkEventsRepo: TtkEventsRepo;

	constructor(fbEventsRepo: FbEventsRepo, ttkEventsRepo: TtkEventsRepo) {
		this.fbEventsRepo = fbEventsRepo;
		this.ttkEventsRepo = ttkEventsRepo;
	}

	public async getEvents(queries: EventQueries) {
		let result: FbEventSelect[] | TtkEventSelect[] = [];
		const queryData = {
			from: queries.from,
			to: queries.to,
			eventType: queries.eventType,
			funnelStage: queries.funnelStage,
		};

		if (queries.source === 'facebook') {
			result = await this.fbEventsRepo.getEvents(queryData);
		}
		if (queries.source === 'tiktok') {
			result = await this.ttkEventsRepo.getEvents(queryData);
		}

		return result;
	}

	public async getRevenue(queries: RevenueQueries) {
		let result = 0;
		const queryData = {
			from: queries.from,
			to: queries.to,
		};

		if (queries.source === 'facebook') {
			result = await this.fbEventsRepo.getRevenue(queryData);
		}
		if (queries.source === 'tiktok') {
			result = await this.ttkEventsRepo.getRevenue(queryData);
		}

		return result;
	}

	public async getDemographics(queries: DemographicsQueries) {
		let result: any;
		const queryData = {
			from: queries.from,
			to: queries.to,
		};

		if (queries.source === 'facebook') {
			result = await this.fbEventsRepo.getDemographics(queryData);
		}
		if (queries.source === 'tiktok') {
			result = await this.ttkEventsRepo.getDemographics(queryData);
		}

		return result;
	}
}
