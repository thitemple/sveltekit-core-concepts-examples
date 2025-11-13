import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const { entry, photo, trip } = schema;

function ensureDatabaseUrl() {
	if (process.env.DATABASE_URL) return;
	try {
		const envPath = resolve(process.cwd(), '.env');
		const raw = readFileSync(envPath, 'utf-8');
		for (const line of raw.split(/\r?\n/)) {
			if (!line || line.startsWith('#')) continue;
			const [key, ...rest] = line.split('=');
			if (!key) continue;
			const value = rest.join('=').trim();
			if (!process.env[key]) {
				process.env[key.trim()] = value.replace(/^['"]|['"]$/g, '');
			}
		}
	} catch {
		// Ignore missing .env file; rely on existing process env
	}
}

ensureDatabaseUrl();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set');
}

const sqlite = new Database(databaseUrl);
const db = drizzle(sqlite, { schema });

type SeedEntry = {
	title: string;
	description: string;
	timestamp: number;
};

type SeedPhoto = {
	url: string;
	caption: string;
};

type SeedTrip = {
	id: string;
	destination: string;
	entries: SeedEntry[];
	photos: SeedPhoto[];
};

const TARGET_ENTRY_COUNT = 25;
const HALF_DAY_MS = 12 * 60 * 60 * 1000;

type FillerTemplate = {
	title: string;
	description: (destination: string) => string;
};

const fillerTemplates: FillerTemplate[] = [
	{
		title: 'Neighborhood Discovery Walk',
		description: (destination) =>
			`Strolled through side streets of ${destination} journaling subtle textures and interactions.`
	},
	{
		title: 'Local Bite Break',
		description: (destination) =>
			`Sampled a favorite cafe treat and noted the flavors that make ${destination} distinctive.`
	},
	{
		title: 'Creative Capture Session',
		description: (destination) =>
			`Sketched color palettes inspired by markets and architecture around ${destination}.`
	},
	{
		title: 'Conversation Snapshot',
		description: (destination) =>
			`Recorded highlights from spontaneous chats with locals who call ${destination} home.`
	},
	{
		title: 'Sunrise Routine',
		description: (destination) =>
			`Watched daylight unfold over ${destination} and reflected on the evolving itinerary.`
	},
	{
		title: 'Afternoon Reset',
		description: (destination) =>
			`Found a quiet corner in ${destination} to organize notes, maps, and next experiences.`
	},
	{
		title: 'Evening Highlights',
		description: (destination) =>
			`Summed up the night sounds, city lights, and memorable encounters across ${destination}.`
	},
	{
		title: 'Transit Observations',
		description: (destination) =>
			`Captured impressions gathered while moving through ${destination} by foot, bike, or train.`
	},
	{
		title: 'Nature Escape',
		description: (destination) =>
			`Took a restorative pause in green spaces tucked within ${destination}.`
	},
	{
		title: 'Cultural Deep Dive',
		description: (destination) =>
			`Explored heritage stories and lesser-known exhibits that enrich ${destination}.`
	}
];

function createEntries(destination: string, baseEntries: SeedEntry[]): SeedEntry[] {
	if (baseEntries.length >= TARGET_ENTRY_COUNT) return baseEntries;

	const entries = [...baseEntries];
	const fillerStart = entries.length ? entries[entries.length - 1].timestamp : Date.now();
	let offset = 1;

	while (entries.length < TARGET_ENTRY_COUNT) {
		const template = fillerTemplates[(offset - 1) % fillerTemplates.length];
		entries.push({
			title: `${template.title} #${offset}`,
			description: template.description(destination),
			timestamp: fillerStart + offset * HALF_DAY_MS
		});
		offset++;
	}

	return entries;
}

const trips: SeedTrip[] = [
	{
		id: 'trip-kyoto-2024',
		destination: 'Kyoto, Japan',
		entries: createEntries('Kyoto, Japan', [
			{
				title: 'Arrival and Evening Stroll',
				description: 'Settled into the machiya townhouse before walking through Gion at dusk.',
				timestamp: new Date('2024-04-02T18:00:00Z').getTime()
			},
			{
				title: 'Fushimi Inari Sunrise',
				description: 'Climbed the torii-lined path before dawn and enjoyed tea at Yotsutsuji.',
				timestamp: new Date('2024-04-03T05:30:00Z').getTime()
			},
			{
				title: 'Arashiyama Bamboo Grove',
				description: 'Rented bikes to explore the bamboo grove and crossed the Katsura River.',
				timestamp: new Date('2024-04-04T09:15:00Z').getTime()
			},
			{
				title: 'Temple Day in Higashiyama',
				description: 'Visited Kiyomizu-dera, Kodai-ji, and sampled yuba dishes on Ninenzaka.',
				timestamp: new Date('2024-04-05T11:45:00Z').getTime()
			},
			{
				title: 'Tea Ceremony Workshop',
				description: 'Learned the basics of chanoyu with a local tea master.',
				timestamp: new Date('2024-04-06T14:00:00Z').getTime()
			}
		]),
		photos: [
			{
				url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2670',
				caption: 'Lantern-lit streets of Gion.'
			},
			{
				url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2670',
				caption: 'Endless torii gates at Fushimi Inari.'
			},
			{
				url: 'https://images.unsplash.com/photo-1578469645742-46cae010e5d4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2670',
				caption: 'Morning light in the Arashiyama bamboo grove.'
			}
		]
	},
	{
		id: 'trip-patagonia-2023',
		destination: 'Torres del Paine, Chile',
		entries: createEntries('Torres del Paine, Chile', [
			{
				title: 'Base of the Towers Trek',
				description: 'Completed the demanding hike for a sunrise reflection in the glacial lake.',
				timestamp: new Date('2023-11-12T08:20:00Z').getTime()
			},
			{
				title: 'Grey Glacier Navigation',
				description: 'Navigated kayaks through floating icebergs in Grey Lake.',
				timestamp: new Date('2023-11-13T10:10:00Z').getTime()
			},
			{
				title: 'French Valley Lookout',
				description: 'Watched avalanches cascade from the valley walls during a picnic lunch.',
				timestamp: new Date('2023-11-14T12:30:00Z').getTime()
			},
			{
				title: 'Condor Watching',
				description: 'Spotted condors soaring near Lake Pehoé with a ranger guide.',
				timestamp: new Date('2023-11-15T15:45:00Z').getTime()
			},
			{
				title: 'Puma Tracking',
				description: 'Joined a local tracker at dawn and saw a puma silhouetted against the hills.',
				timestamp: new Date('2023-11-16T06:05:00Z').getTime()
			}
		]),
		photos: [
			{
				url: 'https://images.unsplash.com/photo-1558517286-8a9cb0b8c793?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=3265',
				caption: 'Sunrise glow on the Torres.'
			},
			{
				url: 'https://images.unsplash.com/photo-1493724798364-c4ca5e3f5fd3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=3248',
				caption: 'Ice formations on Grey Lake.'
			}
		]
	},
	{
		id: 'trip-iceland-2025',
		destination: 'Reykjavík and South Coast, Iceland',
		entries: createEntries('Reykjavík and South Coast, Iceland', [
			{
				title: 'Blue Lagoon Recovery',
				description: 'Eased jet lag in the geothermal waters before exploring Reykjanes Peninsula.',
				timestamp: new Date('2025-02-18T14:30:00Z').getTime()
			},
			{
				title: 'Golden Circle Highlights',
				description: 'Witnessed Strokkur erupt, hiked Þingvellir fissures, and admired Gullfoss.',
				timestamp: new Date('2025-02-19T11:00:00Z').getTime()
			},
			{
				title: 'South Coast Waterfalls',
				description: 'Walked behind Seljalandsfoss and climbed to Skógafoss lookout.',
				timestamp: new Date('2025-02-20T10:45:00Z').getTime()
			},
			{
				title: 'Glacier Hike on Sólheimajökull',
				description: 'Crampons and ice axes for a guided climb across blue crevasses.',
				timestamp: new Date('2025-02-21T09:15:00Z').getTime()
			},
			{
				title: 'Northern Lights Chase',
				description: 'Drove out to Thingvallavatn for a spectacular aurora display.',
				timestamp: new Date('2025-02-22T23:30:00Z').getTime()
			}
		]),
		photos: [
			{
				url: 'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070',
				caption: 'Aurora borealis over Icelandic lava fields.'
			},
			{
				url: 'https://images.unsplash.com/photo-1512525257540-dd546e7f2839?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1974',
				caption: 'Icy cascades at Gullfoss waterfall.'
			}
		]
	},
	{
		id: 'trip-queenstown-2022',
		destination: 'Queenstown, New Zealand',
		entries: createEntries('Queenstown, New Zealand', [
			{
				title: 'Skyline Gondola Views',
				description: 'Rode up Bob’s Peak for sunrise views of Lake Wakatipu.',
				timestamp: new Date('2022-12-04T06:45:00Z').getTime()
			},
			{
				title: 'Jet Boating on Shotover River',
				description: 'Thrilling spins through the narrow canyon with local pilots.',
				timestamp: new Date('2022-12-04T12:00:00Z').getTime()
			},
			{
				title: 'Milford Sound Day Trip',
				description: 'Cruised past towering cliffs and spotted fur seals on the rocks.',
				timestamp: new Date('2022-12-05T10:00:00Z').getTime()
			},
			{
				title: 'Central Otago Wineries',
				description: 'Sampled pinot noir and enjoyed a farm-to-table lunch near Cromwell.',
				timestamp: new Date('2022-12-06T13:15:00Z').getTime()
			},
			{
				title: 'Ben Lomond Summit Hike',
				description: 'Completed the alpine trek with panoramic views of the Remarkables.',
				timestamp: new Date('2022-12-07T08:30:00Z').getTime()
			}
		]),
		photos: [
			{
				url: 'https://images.unsplash.com/photo-1600466403153-50193d187dde?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=3174',
				caption: 'Queenstown nestled beside Lake Wakatipu.'
			},
			{
				url: 'https://images.unsplash.com/photo-1515253648320-6d70d901f0ac?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070',
				caption: 'Clouds drifting through Milford Sound.'
			}
		]
	},
	{
		id: 'trip-marrakech-2023',
		destination: 'Marrakech, Morocco',
		entries: createEntries('Marrakech, Morocco', [
			{
				title: 'Jemaa el-Fnaa Night Market',
				description: 'Sampled tagines and watched musicians energize the square.',
				timestamp: new Date('2023-05-10T20:00:00Z').getTime()
			},
			{
				title: 'Majorelle Garden Morning',
				description: 'Beat the crowds to admire vibrant cobalt blues and desert plants.',
				timestamp: new Date('2023-05-11T09:00:00Z').getTime()
			},
			{
				title: 'Atlas Mountains Excursion',
				description: 'Shared mint tea with a Berber family in Imlil village.',
				timestamp: new Date('2023-05-12T12:30:00Z').getTime()
			},
			{
				title: 'Hammam and Spa Evening',
				description: 'Relaxed with a traditional hammam scrub and argan oil massage.',
				timestamp: new Date('2023-05-12T18:00:00Z').getTime()
			},
			{
				title: 'Shopping the Souks',
				description: 'Practiced bargaining for ceramics and handwoven rugs.',
				timestamp: new Date('2023-05-13T15:00:00Z').getTime()
			}
		]),
		photos: [
			{
				url: 'https://images.unsplash.com/photo-1675162648912-c09b7a82d7b9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1974',
				caption: 'Lanterns hanging in the Marrakech souks.'
			},
			{
				url: 'https://images.unsplash.com/photo-1628790892460-2beb0e371226?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=987',
				caption: 'Majorelle blue walls framed by palms.'
			}
		]
	},
	{
		id: 'trip-banff-2024',
		destination: 'Banff National Park, Canada',
		entries: createEntries('Banff National Park, Canada', [
			{
				title: 'Sunrise at Moraine Lake',
				description: 'Arrived before dawn to watch alpenglow paint the Valley of the Ten Peaks.',
				timestamp: new Date('2024-09-08T06:10:00Z').getTime()
			},
			{
				title: 'Paddle on Lake Louise',
				description: 'Canoed across turquoise waters beneath Victoria Glacier.',
				timestamp: new Date('2024-09-08T14:30:00Z').getTime()
			},
			{
				title: 'Icefields Parkway Drive',
				description: 'Stopped at Peyto Lake and walked the Columbia Icefield Skywalk.',
				timestamp: new Date('2024-09-09T10:45:00Z').getTime()
			},
			{
				title: 'Johnston Canyon Hike',
				description: 'Explored catwalks to the Upper Falls and spotted ice climbers.',
				timestamp: new Date('2024-09-10T09:15:00Z').getTime()
			},
			{
				title: 'Stargazing at Lake Minnewanka',
				description: 'Captured the Milky Way reflecting on calm waters.',
				timestamp: new Date('2024-09-10T23:00:00Z').getTime()
			}
		]),
		photos: [
			{
				url: 'https://images.unsplash.com/photo-1561134643-668f9057cce4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1974',
				caption: 'Sunrise hues over Moraine Lake.'
			},
			{
				url: 'https://images.unsplash.com/photo-1558818061-547b1114aa6a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070',
				caption: 'Canoes lined up on Lake Louise.'
			}
		]
	},
	{
		id: 'trip-santorini-2022',
		destination: 'Santorini, Greece',
		entries: createEntries('Santorini, Greece', [
			{
				title: 'Caldera Sunset in Oia',
				description: 'Grabbed baklava and found a rooftop for the famous sunset.',
				timestamp: new Date('2022-06-18T19:45:00Z').getTime()
			},
			{
				title: 'Catamaran Cruise',
				description: 'Snorkeled the volcanic hot springs and grilled lunch onboard.',
				timestamp: new Date('2022-06-19T11:00:00Z').getTime()
			},
			{
				title: 'Akrotiri Ruins Tour',
				description: 'Explored the Bronze Age settlement with an archaeologist guide.',
				timestamp: new Date('2022-06-20T09:30:00Z').getTime()
			},
			{
				title: 'Wine Tasting in Pyrgos',
				description: 'Sampled Assyrtiko wines paired with local cheeses.',
				timestamp: new Date('2022-06-20T16:00:00Z').getTime()
			},
			{
				title: 'Hike from Fira to Oia',
				description: 'Followed the cliffside trail with sweeping Aegean views.',
				timestamp: new Date('2022-06-21T08:00:00Z').getTime()
			}
		]),
		photos: [
			{
				url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2038',
				caption: 'Blue domes overlooking the caldera.'
			},
			{
				url: 'https://images.unsplash.com/photo-1563789031959-4c02bcb41319?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1974',
				caption: 'Catamaran sailing past the cliffs of Santorini.'
			}
		]
	},
	{
		id: 'trip-cape-town-2023',
		destination: 'Cape Town, South Africa',
		entries: createEntries('Cape Town, South Africa', [
			{
				title: 'Table Mountain Hike',
				description: 'Took the Platteklip Gorge route and rode the cableway down at sunset.',
				timestamp: new Date('2023-10-04T07:30:00Z').getTime()
			},
			{
				title: 'Bo-Kaap Walking Tour',
				description: 'Learned about the Cape Malay community and tasted bredie.',
				timestamp: new Date('2023-10-04T13:00:00Z').getTime()
			},
			{
				title: 'Cape Point Day Trip',
				description: 'Stood at the Cape of Good Hope and watched penguins at Boulders Beach.',
				timestamp: new Date('2023-10-05T09:30:00Z').getTime()
			},
			{
				title: 'Zeitz MOCAA Visit',
				description: 'Explored contemporary African art inside the restored grain silo.',
				timestamp: new Date('2023-10-06T11:15:00Z').getTime()
			},
			{
				title: 'Kirstenbosch Summer Concert',
				description: 'Picnicked on the lawns during a local jazz performance.',
				timestamp: new Date('2023-10-07T17:45:00Z').getTime()
			}
		]),
		photos: [
			{
				url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2071',
				caption: 'Cape Town skyline with Table Mountain backdrop.'
			},
			{
				url: 'https://images.unsplash.com/photo-1496497243327-9dccd845c35f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070',
				caption: 'Penguins at Boulders Beach.'
			}
		]
	},
	{
		id: 'trip-amalfi-2021',
		destination: 'Amalfi Coast, Italy',
		entries: createEntries('Amalfi Coast, Italy', [
			{
				title: 'Positano Beach Day',
				description: 'Morning swim followed by lemon granita on Spiaggia Grande.',
				timestamp: new Date('2021-09-14T10:00:00Z').getTime()
			},
			{
				title: 'Path of the Gods Hike',
				description: 'Hiked from Bomerano to Nocelle with dramatic cliffside vistas.',
				timestamp: new Date('2021-09-15T08:30:00Z').getTime()
			},
			{
				title: 'Cooking Class in Ravello',
				description: 'Made fresh gnocchi and limoncello with Chef Rosa.',
				timestamp: new Date('2021-09-15T17:00:00Z').getTime()
			},
			{
				title: 'Day Trip to Capri',
				description: 'Visited the Blue Grotto and strolled through Capri Town.',
				timestamp: new Date('2021-09-16T11:30:00Z').getTime()
			},
			{
				title: 'Sunset Sail',
				description: 'Chartered a small boat for views of the coastline at golden hour.',
				timestamp: new Date('2021-09-17T19:30:00Z').getTime()
			}
		]),
		photos: [
			{
				url: 'https://images.unsplash.com/photo-1533656338503-b22f63e96cd8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1973',
				caption: 'Colorful homes stacked above Positano beach.'
			},
			{
				url: 'https://images.unsplash.com/photo-1612698093158-e07ac200d44e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070',
				caption: 'Sea cliffs along the Amalfi Coast road.'
			}
		]
	},
	{
		id: 'trip-lisbon-2024',
		destination: 'Lisbon, Portugal',
		entries: createEntries('Lisbon, Portugal', [
			{
				title: 'Alfama Tram Ride',
				description: 'Rode the iconic 28 tram and listened to fado in a tucked-away tavern.',
				timestamp: new Date('2024-05-03T20:30:00Z').getTime()
			},
			{
				title: 'Belém Discoveries',
				description: 'Visited Jerónimos Monastery, Belém Tower, and savored pastéis de nata.',
				timestamp: new Date('2024-05-04T11:00:00Z').getTime()
			},
			{
				title: 'LX Factory Afternoon',
				description: 'Explored creative studios and rooftop bars in old industrial warehouses.',
				timestamp: new Date('2024-05-05T15:00:00Z').getTime()
			},
			{
				title: 'Day Trip to Sintra',
				description: 'Wandered through Pena Palace and the forests of Quinta da Regaleira.',
				timestamp: new Date('2024-05-06T10:30:00Z').getTime()
			},
			{
				title: 'Time Out Market Tapas',
				description: 'Sampled petiscos from award-winning chefs under one roof.',
				timestamp: new Date('2024-05-06T19:00:00Z').getTime()
			}
		]),
		photos: [
			{
				url: 'https://images.unsplash.com/photo-1599069158346-684fee0e414a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070',
				caption: 'Tram 28 climbing the streets of Alfama.'
			},
			{
				url: 'https://images.unsplash.com/photo-1550675897-2505803ba4c0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070',
				caption: 'Pastéis de nata fresh from the oven.'
			}
		]
	}
];

async function main() {
	// Clear existing data to keep the seed idempotent.
	await db.delete(photo);
	await db.delete(entry);
	await db.delete(trip);

	const tripRecords = trips.map(({ id, destination }) => ({ id, destination }));
	const entryRecords = trips.flatMap(({ id: tripId, entries }) =>
		entries.map(({ title, description, timestamp }) => ({
			tripId,
			title,
			description,
			timestamp
		}))
	);
	const photoRecords = trips.flatMap(({ id: tripId, photos }) =>
		photos.map(({ url, caption }) => ({
			tripId,
			url,
			caption
		}))
	);

	await db.insert(trip).values(tripRecords);
	await db.insert(entry).values(entryRecords);
	await db.insert(photo).values(photoRecords);

	console.log(
		`Seeded ${tripRecords.length} trips, ${entryRecords.length} entries, and ${photoRecords.length} photos.`
	);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('Error seeding database:', error);
		process.exit(1);
	})
	.finally(() => {
		sqlite.close();
	});
