import { connect, JSONCodec } from 'nats';
import type { EventsRepo } from './db/eventsRepo';
import {
	FacebookEngagement,
	FacebookEngagementBottom,
	FacebookEngagementTop,
	FacebookEvent,
} from './types';
import { FbEventInsert } from './db/schema';
import { failedEventsCounter, processedEventsCounter } from './prometheus';

function isTopEngagement(
	engagement: FacebookEngagement
): engagement is FacebookEngagementTop {
	return (engagement as FacebookEngagementTop).referrer !== undefined;
}
function isBottomEngagement(
	engagement: FacebookEngagement
): engagement is FacebookEngagementBottom {
	return (engagement as FacebookEngagementBottom).adId !== undefined;
}

export async function subscribeToEvents(eventsRepo: EventsRepo) {
	const nc = await connect({ servers: 'nats://nats:4222' }); // nats у docker-compose
	// const nc = await connect({ servers: 'nats://localhost:4222' }); // nats у docker-compose
	const sub = nc.subscribe('events.facebook');

	console.log('✅ Subscribed to events.facebook');

	for await (const msg of sub) {
		try {
			const event: FacebookEvent = JSON.parse(msg.data.toString());

			const { user, engagement } = event.data;

			const insertData: FbEventInsert = {
				eventId: event.eventId,
				timestamp: new Date(event.timestamp),
				funnelStage: event.funnelStage,
				eventType: event.eventType,
				userId: user.userId,
				userName: user.name,
				userAge: user.age,
				userGender: user.gender,
				userCountry: user.location.country,
				userCity: user.location.city,

				actionTime: isTopEngagement(engagement) ? engagement.actionTime : null,
				referrer: isTopEngagement(engagement) ? engagement.referrer : null,
				videoId: isTopEngagement(engagement) ? engagement.videoId : null,

				adId: isBottomEngagement(engagement) ? engagement.adId : null,
				campaignId: isBottomEngagement(engagement)
					? engagement.campaignId
					: null,
				clickPosition: isBottomEngagement(engagement)
					? engagement.clickPosition
					: null,
				device: isBottomEngagement(engagement) ? engagement.device : null,
				browser: isBottomEngagement(engagement) ? engagement.browser : null,
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
