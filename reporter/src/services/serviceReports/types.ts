import { z } from 'zod';
import {
	EventQueriesSchema,
	RevenueQueriesSchema,
	DemographicsQueriesSchema,
} from '../../controllers/ctrlReports/schemas';

export type EventQueries = z.infer<typeof EventQueriesSchema>;

export type RevenueQueries = z.infer<typeof RevenueQueriesSchema>;

export type DemographicsQueries = z.infer<typeof DemographicsQueriesSchema>;
