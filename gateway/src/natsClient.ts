import { connect, NatsConnection } from 'nats';

let nc: NatsConnection | undefined = undefined;

export async function getNatsConnection(): Promise<NatsConnection> {
	if (!nc) {
		nc = await connect({
			servers: process.env.NATS_URL || 'nats://localhost:4222',
		});
		console.log('✅ Connected to NATS');
	}
	return nc;
}
