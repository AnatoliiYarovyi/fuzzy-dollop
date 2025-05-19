import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
	pgTable,
	varchar,
	timestamp,
	integer,
	jsonb,
	numeric,
} from 'drizzle-orm/pg-core';

export const tiktokEventsTable = pgTable('tiktok_events', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	eventId: varchar('event_id'),
	timestamp: timestamp('timestamp'),
	funnelStage: varchar('funnel_stage'),
	eventType: varchar('event_type'),
	userId: varchar('user_id'),
	username: varchar('username'),
	followers: integer('followers'),
	device: varchar('device'),
	country: varchar('country'),
	videoId: varchar('video_id'),
	actionTime: varchar('action_time'),
	profileId: varchar('profile_id'),
	purchasedItem: varchar('purchased_item'),
	purchaseAmount: numeric('purchase_amount'),
	watchTime: integer('watch_time'),
	percentageWatched: integer('percentage_watched'),
	createdAt: timestamp('created_at').defaultNow(),
});

export type ttkEventSelect = InferSelectModel<typeof tiktokEventsTable>;
export type ttkEventInsert = InferInsertModel<typeof tiktokEventsTable>;
