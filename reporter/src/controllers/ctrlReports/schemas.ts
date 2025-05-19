import { z } from 'zod';

const sourceEnum = z.enum(['facebook', 'tiktok']);

export const EventQueriesSchema = z.object({
	from: z.string(),
	to: z.string(),
	source: sourceEnum,
	funnelStage: z.enum(['top', 'bottom']),
	eventType: z.string(),
});

export const RevenueQueriesSchema = z.object({
	from: z.string(),
	to: z.string(),
	source: sourceEnum,
	campaignId: z.string().optional(),
});

export const DemographicsQueriesSchema = z.object({
	from: z.string(),
	to: z.string(),
	source: sourceEnum,
});
