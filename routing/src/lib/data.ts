export type Photo = {
	id: number;
	file: string;
};

export type Trip = {
	id: number;
	destination: string;
	photos: Photo[];
};

export const trips: Trip[] = [
	{
		id: 1,
		destination: "London",
		photos: [
			{
				id: 11,
				file: "London_Eye_at_sunset_2013-07-19.jpg"
			},
			{ id: 12, file: "London_Skyline_(125508655).jpeg" }
		]
	},
	{
		id: 2,
		destination: "New York",
		photos: [
			{
				id: 21,
				file: "Statue-of-Liberty-New-York-2014.jpg"
			},
			{
				id: 22,
				file: "View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_(cropped).jpg"
			}
		]
	},
	{
		id: 3,
		destination: "Tokyo",
		photos: [
			{
				id: 31,
				file: "Skyscrapers_of_Shinjuku_2009_January.jpg"
			},
			{ id: 32, file: "Tokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg" }
		]
	},
	{
		id: 4,
		destination: "Punta Cana",
		photos: [
			{ id: 41, file: "Cap_Cana_Marina_Dominican_Republic.jpg" },
			{ id: 42, file: "Dominicana-Punta_Cana.jpg" }
		]
	},
	{
		id: 5,
		destination: "Rio de Janeiro",
		photos: [
			{ id: 51, file: "Barra_Panorama.jpg" },
			{ id: 52, file: "Cidade_Maravilhosa.jpg" }
		]
	}
];
