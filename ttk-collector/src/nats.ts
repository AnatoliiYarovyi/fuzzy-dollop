import { connect, JSONCodec } from 'nats';
import type { EventsRepo } from './db/eventsRepo';
import {
	TiktokEvent,
	TiktokEngagement,
	TiktokEngagementTop,
	TiktokEngagementBottom,
} from './types';
import { ttkEventInsert } from './db/schema';
import { failedEventsCounter, processedEventsCounter } from './prometheus';

function isTopEngagement(
	engagement: TiktokEngagement
): engagement is TiktokEngagementTop {
	return (engagement as TiktokEngagementTop).device !== undefined;
}
function isBottomEngagement(
	engagement: TiktokEngagement
): engagement is TiktokEngagementBottom {
	return (engagement as TiktokEngagementBottom).actionTime !== undefined;
}

export async function subscribeToEvents(eventsRepo: EventsRepo) {
	const nc = await connect({ servers: 'nats://nats:4222' }); // nats у docker-compose
	// const nc = await connect({ servers: 'nats://localhost:4222' }); // nats у docker-compose
	const sub = nc.subscribe('events.tiktok');

	console.log('✅ Subscribed to events.tiktok');

	for await (const msg of sub) {
		try {
			const event: TiktokEvent = JSON.parse(msg.data.toString());

			const { user, engagement } = event.data;

			const insertData: ttkEventInsert = {
				eventId: event.eventId,
				timestamp: new Date(event.timestamp),
				funnelStage: event.funnelStage,
				eventType: event.eventType,
				userId: user.userId,
				username: user.username,
				followers: user.followers,
				watchTime: isTopEngagement(engagement) ? engagement.watchTime : null,
				percentageWatched: isTopEngagement(engagement)
					? engagement.percentageWatched
					: null,
				device: isTopEngagement(engagement) ? engagement.device : null,
				country: isTopEngagement(engagement) ? engagement.country : null,
				videoId: isTopEngagement(engagement) ? engagement.videoId : null,
				actionTime: isBottomEngagement(engagement)
					? engagement.actionTime
					: null,
				profileId: isBottomEngagement(engagement) ? engagement.profileId : null,
				purchasedItem: isBottomEngagement(engagement)
					? engagement.purchasedItem
					: null,
				purchaseAmount: isBottomEngagement(engagement)
					? engagement.purchaseAmount
					: null,
				createdAt: new Date(),
			};

			await eventsRepo.insert(insertData);
			processedEventsCounter.inc();

			// console.log('📥 Saved event', event.eventId);
		} catch (err) {
			failedEventsCounter.inc();
			console.log('msg.data: ', msg.data);
			console.error('❌ Failed to process event batch:', err);
		}
	}
}
