CREATE TABLE "facebook_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "facebook_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_id" varchar,
	"timestamp" timestamp,
	"funnel_stage" varchar,
	"event_type" varchar,
	"user_id" varchar,
	"user_name" varchar,
	"user_age" integer,
	"user_gender" varchar,
	"user_country" varchar,
	"user_city" varchar,
	"ad_id" varchar,
	"campaign_id" varchar,
	"click_position" varchar,
	"device" varchar,
	"browser" varchar,
	"purchase_amount" numeric,
	"action_time" varchar,
	"referrer" varchar,
	"video_id" varchar,
	"created_at" timestamp DEFAULT now()
);
