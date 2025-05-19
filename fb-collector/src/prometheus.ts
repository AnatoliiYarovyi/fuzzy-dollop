import client from 'prom-client';

export const processedEventsCounter = new client.Counter({
	name: 'fb_processed_events_total',
	help: 'Total number of processed TikTok events',
});
export const failedEventsCounter = new client.Counter({
	name: 'fb_failed_events_total',
	help: 'Total number of failed TikTok events',
});
