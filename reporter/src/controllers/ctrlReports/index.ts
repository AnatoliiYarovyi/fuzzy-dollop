import { Controller } from '../controller';

import { type IOkResponse, okResponse } from '../../api/baseResponses';
import type { RequestHandler } from 'express';
import type { ServiceReports } from '../../services/serviceReports';
import {
	EventQueriesSchema,
	RevenueQueriesSchema,
	DemographicsQueriesSchema,
} from './schemas';
import { InvalidParameterError } from '../../errors/customErrors';

export class CtrlReports extends Controller {
	constructor(private serviceReports: ServiceReports) {
		super('/reports');

		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get('/events', this.wrapper({ route: this.getEvents }));
		this.router.get('/revenue', this.wrapper({ route: this.getRevenue }));
		this.router.get(
			'/demographics',
			this.wrapper({ route: this.getDemographics })
		);
	}

	private getEvents: RequestHandler = async (req, res) => {
		const validatedQuery = EventQueriesSchema.safeParse(req.query);

		if (!validatedQuery.success) {
			throw new InvalidParameterError(
				`Bad request - ${JSON.stringify(
					(validatedQuery as any).error,
					null,
					2
				)}`
			);
		}

		const result = await this.serviceReports.getEvents(validatedQuery.data);
		res.status(200).json(okResponse(result));
	};

	private getRevenue: RequestHandler = async (req, res) => {
		const validatedQuery = RevenueQueriesSchema.safeParse(req.query);

		if (!validatedQuery.success) {
			throw new InvalidParameterError(
				`Bad request - ${JSON.stringify(
					(validatedQuery as any).error,
					null,
					2
				)}`
			);
		}

		const result = await this.serviceReports.getRevenue(validatedQuery.data);
		res.status(200).json(okResponse(result));
	};

	private getDemographics: RequestHandler = async (req, res) => {
		const validatedQuery = DemographicsQueriesSchema.safeParse(req.query);

		if (!validatedQuery.success) {
			throw new InvalidParameterError(
				`Bad request - ${JSON.stringify(
					(validatedQuery as any).error,
					null,
					2
				)}`
			);
		}

		const result = await this.serviceReports.getDemographics(
			validatedQuery.data
		);
		res.status(200).json(okResponse(result));
	};
}
