import client from 'prom-client';

// Кастомні лічильники
export const processedEventsCounter = new client.Counter({
	name: 'ttk_processed_events_total',
	help: 'Total number of processed Facebook events',
});
export const failedEventsCounter = new client.Counter({
	name: 'ttk_failed_events_total',
	help: 'Total number of failed Facebook events',
});
