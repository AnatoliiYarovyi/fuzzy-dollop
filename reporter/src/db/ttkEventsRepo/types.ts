export interface GetEvents {
	from: string;
	to: string;
	funnelStage: 'top' | 'bottom';
	eventType: string;
}

export interface GetRevenue {
	from: string;
	to: string;
	campaignId?: string;
}

export interface GetDemographics {
	from: string;
	to: string;
}
