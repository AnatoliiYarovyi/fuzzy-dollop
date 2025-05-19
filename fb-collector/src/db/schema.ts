import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
	pgTable,
	varchar,
	timestamp,
	integer,
	jsonb,
	numeric,
} from 'drizzle-orm/pg-core';

export const facebookEventsTable = pgTable('facebook_events', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	eventId: varchar('event_id'),
	timestamp: timestamp('timestamp'),
	funnelStage: varchar('funnel_stage'),
	eventType: varchar('event_type'),
	userId: varchar('user_id'),
	userName: varchar('user_name'),
	userAge: integer('user_age'),
	userGender: varchar('user_gender'),
	userCountry: varchar('user_country'),
	userCity: varchar('user_city'),
	adId: varchar('ad_id'),
	campaignId: varchar('campaign_id'),
	clickPosition: varchar('click_position'),
	device: varchar('device'),
	browser: varchar('browser'),
	purchaseAmount: numeric('purchase_amount'),
	actionTime: varchar('action_time'),
	referrer: varchar('referrer'),
	videoId: varchar('video_id'),
	createdAt: timestamp('created_at').defaultNow(),
});
export type FbEventSelect = InferSelectModel<typeof facebookEventsTable>;
export type FbEventInsert = InferInsertModel<typeof facebookEventsTable>;
