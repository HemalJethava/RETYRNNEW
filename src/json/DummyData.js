import { generateUniqueId, noImgUrl } from "../config/CommonFunctions";
import Colors from "../styles/Colors";

export const dummyArchiveList = [
	{
		id: generateUniqueId(),
		name: "2022 LR Electric",
		nr: "NR# - 123456789",
		image:
			"https://cdn.pixabay.com/photo/2016/11/21/16/37/loader-1846346_1280.jpg",
		type: "",
		color: "red",
		iconName: "taxi-alert",
		iconType: "MaterialIcons",
	},
	{
		id: generateUniqueId(),
		name: "2021 LR",
		nr: "NR# - 123456789",
		image:
			"https://cdn.pixabay.com/photo/2017/09/16/11/11/truck-2755172_1280.jpg",
		type: "",
		color: "orange",
		iconName: "car-on",
		iconType: "FontAwesome6",
	},
	{
		id: generateUniqueId(),
		name: "2022 MD Series",
		nr: "NR# - 123456789",

		image:
			"https://cdn.pixabay.com/photo/2016/11/21/16/37/loader-1846346_1280.jpg",
		type: "",
		color: "green",
		iconName: "thunderstorm-outline",
		iconType: "Ionicons",
	},
	{
		id: generateUniqueId(),
		name: "2022 Lonestar",
		nr: "NR# - 123456789",
		image:
			"https://cdn.pixabay.com/photo/2016/11/29/04/15/digger-1867268_1280.jpg",
		type: "",
		color: "yellow",
		iconName: "grid-view",
		iconType: "MaterialIcons",
	},
];
export const RecentTrips = [
	{
		id: generateUniqueId(),
		origin_location: "From My Location",
		destination_location: "Bus Stand",
	},
	{
		id: generateUniqueId(),
		origin_location: "From My Location",
		destination_location: "Boapl Ahmedabad",
	},
	{
		id: generateUniqueId(),
		origin_location: "From My Location",
		destination_location: "306, Satellite",
	},
];
export const RecentFilteredTrips = {
	today: [
		{
			id: generateUniqueId(),
			origin_location: "From My Location",
			destination_location: "306, Satellite",
		},
	],
	week: [
		{
			id: generateUniqueId(),
			origin_location: "From My Location",
			destination_location: "Bus Stand",
		},
		{
			id: generateUniqueId(),
			origin_location: "From My Location",
			destination_location: "Boapl Ahmedabad",
		},
		{
			id: generateUniqueId(),
			origin_location: "From My Location",
			destination_location: "306, Satellite",
		},
	],
	older: [
		{
			id: generateUniqueId(),
			origin_location: "From My Location",
			destination_location: "Junagadh",
		},
	],
};
export const recentDestiCity = [
	{
		id: generateUniqueId(),
		destination: "Isckon Cross Road",
		city: "Ahmedabad",
	},
	{
		id: generateUniqueId(),
		destination: "Girnar",
		city: "Junagadh",
	},
	{
		id: generateUniqueId(),
		destination: "Science City",
		city: "Ahmedabad",
	},
];
export const nearBySuggestion = [
	{
		id: generateUniqueId(),
		icon_library: "MaterialIcons",
		icon_name: "train",
		address_name: "Near by Transit",
		address_description: "Options for all nearby departures",
	},
	{
		id: generateUniqueId(),
		icon_library: "FontAwesome6",
		icon_name: "map-pin",
		icon_background_color: Colors.errorBoxRed,
		address_name: "Sindhu Bhavan",
		address_description: "Sindhu bhavan marg bodakdev",
		address: "Sindhubhavan Road Thaltej Ahmedabad, 380059 Gujarat India",

		street_address: "Sindhubhavan Road",
		local_address: "Thaltej",
		city: "Ahmedabad, 380059",
		state: "Gujarat",
		country: "India",
	},
];
export const pinTypes = [
	{
		id: generateUniqueId(),
		icon_background_color: "#33d0eb",
		icon_library: "FontAwesome",
		icon_name: "home",
		type: "My Home",
		isChecked: false,
	},
	{
		id: generateUniqueId(),
		icon_background_color: "#94694f",
		icon_library: "Ionicons",
		icon_name: "briefcase",
		type: "My Work",
		isChecked: false,
	},
	{
		id: generateUniqueId(),
		icon_background_color: "#94694f",
		icon_library: "Ionicons",
		icon_name: "school",
		type: "My School",
		isChecked: false,
	},
	{
		id: generateUniqueId(),
		icon_background_color: "#888",
		icon_library: "MaterialDesignIcons",
		icon_name: "home-city-outline",
		type: "Address",
		isChecked: false,
	},
];
export const recentlyAdded = [
	{
		id: generateUniqueId(),
		icon_library: "FontAwesome6",
		icon_name: "map-pin",
		icon_background_color: Colors.errorBoxRed,
		address_name: "Work",
		address: "Sindhubhavan Road Thaltej Ahmedabad, 380059 Gujarat India",
	},
	{
		id: generateUniqueId(),
		icon_library: "FontAwesome",
		icon_name: "home",
		icon_background_color: "#33d0eb",
		address_name: "Home",
		address: "Anand nagar, Prahlad nagar Ahmedabad, 380015 Gujarat India",
	},
];
export const favouritePlaces = [
	// {
	// 	id: generateUniqueId(),
	// 	place_name: "Taj Skyline Ahmedabad",
	// 	place_type: "Hotel",
	// 	distance: "1.2 mi",
	// 	other_detail: "Open 24 hours",
	// 	image:
	// 		"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQipFiK07AHxC1VW3P3uF-ZnqWs3v3qsayWfQ&s",
	// },
];
export const recentlyViewed = [
	{
		id: generateUniqueId(),
		place_name: "ISCKON Temple",
		place_address: "Isckon Cross Road, Sarkhej Gandhinagar road Ahmedabad",
		isIcon: false,
	},
	{
		id: generateUniqueId(),
		place_name: "Sindhu Bhavan",
		place_address:
			"Sindhubhavan marg, Bodakdev, Ahmedabad - 3800556, Gujarat, India",
		isIcon: false,
	},
];
export const dummyWaypoints = [
	{
		id: generateUniqueId(),
		type: "origin",
		address: "My Location",
	},
	{
		id: generateUniqueId(),
		type: "destination",
		address: "ISKCON Ahmedabad",
	},
	{
		id: generateUniqueId(),
		type: "waypoint",
		address: "Pakwan Cross Road",
	},
	{
		id: generateUniqueId(),
		type: "waypoint",
		address: "Rajpath Club",
	},
];
export const estimatedTime = {
	driving: {
		estimation_sheet: [
			{
				id: generateUniqueId(),
				duration: "8 min",
				estimated_time: "17:31",
				distance: "1.2 miles",
				is_fatest: true,
			},
			{
				id: generateUniqueId(),
				duration: "10 min",
				estimated_time: "17:33",
				distance: "1.3 miles",
			},
			{
				id: generateUniqueId(),
				duration: "8 min",
				estimated_time: "17:31",
				distance: "1.2 miles",
			},
		],
		schedule_type: ["Now", "Avoid"],
	},
	wallk: {
		estimation_sheet: [
			{
				id: generateUniqueId(),
				duration: "24 min",
				estimated_time: "19:10",
				distance: "1.1 miles",
				is_flat: true,
			},
			{
				id: generateUniqueId(),
				duration: "25 min",
				estimated_time: "19:11",
				distance: "1.4 miles",
				is_flat: true,
			},
			{
				id: generateUniqueId(),
				duration: "25 min",
				estimated_time: "19:11",
				distance: "1.2 miles",
				is_flat: true,
			},
		],
		schedule_type: ["Avoid"],
	},
	train: {
		estimation_sheet: [],
		schedule_type: ["Now", "Prefer"],
	},
	cycling: {
		estimation_sheet: [],
		schedule_type: ["Avoid"],
	},
	booking: {
		estimation_sheet: [],
		schedule_type: [],
	},
};
export const reportTypes = [
	{
		id: generateUniqueId(),
		title: "Name is Wrong",
	},
	{
		id: generateUniqueId(),
		title: "Address or location on map is wrong",
	},
	{
		id: generateUniqueId(),
		title: "Phone number or website is wrong",
	},
	{
		id: generateUniqueId(),
		title: "Hours are wrong",
	},
	{
		id: generateUniqueId(),
		title: "Category is wrong",
	},
	{
		id: generateUniqueId(),
		title: "Other or multiple things are wrong",
	},
];
export const nearByPlaces = [
	{
		id: generateUniqueId(),
		address_name: "Indian Oil Petrol Pump",
		distnce: "700 m",
		address: "Sindhubhavan Road, Ahmedabad, Gujarat 380056, India",
		open_time: "23:00",
		rating_percentage: "50",
		duration: "5m",
	},
	{
		id: generateUniqueId(),
		address_name: "HP Petrol Pump",
		distnce: "1.2 miles",
		address: "Ahmedabad",
		rating_percentage: "33",
		duration: "10m",
	},
];

// gpxResponse by this google map API
// https://maps.googleapis.com/maps/api/directions/json?origin=LAT1,LNG1&destination=LAT2,LNG2&mode=driving&key=YOUR_API_KEY
export const gpxResponse = {
	geocoded_waypoints: [
		{
			geocoder_status: "OK",
			place_id: "ChIJkTmhWUSbXjkRv41Xul8-820",
			types: ["establishment", "point_of_interest"],
		},
		{
			geocoder_status: "OK",
			place_id: "ChIJSVE2IACbXjkRpRPd13UISiY",
			types: ["establishment", "food", "point_of_interest", "store"],
		},
	],
	routes: [
		{
			bounds: {
				northeast: {
					lat: 23.0404972,
					lng: 72.5121046,
				},
				southwest: {
					lat: 23.0249769,
					lng: 72.5054456,
				},
			},
			copyrights: "Powered by Google, ©2025 Google",
			legs: [
				{
					distance: {
						text: "2.4 km",
						value: 2372,
					},
					duration: {
						text: "7 mins",
						value: 438,
					},
					end_address:
						"2GF4+XVR, Iskcon Cross Rd, Ramdev Nagar, Ahmedabad, Gujarat 380015, India",
					end_location: {
						lat: 23.0249769,
						lng: 72.5071487,
					},
					start_address:
						"203, Sindhu Bhavan Marg, PRL Colony, Bodakdev, Ahmedabad, Gujarat 380059, India",
					start_location: {
						lat: 23.0404972,
						lng: 72.5054456,
					},
					steps: [
						{
							distance: {
								text: "0.7 km",
								value: 681,
							},
							duration: {
								text: "2 mins",
								value: 118,
							},
							end_location: {
								lat: 23.0387828,
								lng: 72.5117634,
							},
							html_instructions:
								'Head \u003Cb\u003Eeast\u003C/b\u003E on \u003Cb\u003ESindhu Bhavan Marg\u003C/b\u003E towards \u003Cb\u003ENR Sindhu Bhavan Rd\u003C/b\u003E\u003Cdiv style="font-size:0.9em"\u003EPass by Smk engineering services (on the left)\u003C/div\u003E',
							polyline: {
								points:
									"cbskCafpyLDsABs@@sA?QDsA@QDg@H_@Lg@BKPu@XeA`@_BFQpAgFzAcGJa@BGLY",
							},
							start_location: {
								lat: 23.0404972,
								lng: 72.5054456,
							},
							travel_mode: "DRIVING",
						},
						{
							distance: {
								text: "0.8 km",
								value: 848,
							},
							duration: {
								text: "2 mins",
								value: 131,
							},
							end_location: {
								lat: 23.0319962,
								lng: 72.5089856,
							},
							html_instructions:
								'Turn \u003Cb\u003Eright\u003C/b\u003E at \u003Cb\u003EPakwan Jn\u003C/b\u003E\u003Cdiv style="font-size:0.9em"\u003EPass by Sarkhej (on the right)\u003C/div\u003E',
							maneuver: "turn-right",
							polyline: {
								points:
									"kwrkComqyLJa@@A?EJYRHl@VdA`@hDpAzKhEZLbA\\nBn@`@Ld@NF@fA`@~@V^L|@T`AVNBJV",
							},
							start_location: {
								lat: 23.0387828,
								lng: 72.5117634,
							},
							travel_mode: "DRIVING",
						},
						{
							distance: {
								text: "87 m",
								value: 87,
							},
							duration: {
								text: "1 min",
								value: 8,
							},
							end_location: {
								lat: 23.0312389,
								lng: 72.5087536,
							},
							html_instructions: "Merge onto \u003Cb\u003ENH147\u003C/b\u003E",
							maneuver: "merge",
							polyline: {
								points: "_mqkCe|pyLXH|Bd@",
							},
							start_location: {
								lat: 23.0319962,
								lng: 72.5089856,
							},
							travel_mode: "DRIVING",
						},
						{
							distance: {
								text: "0.7 km",
								value: 727,
							},
							duration: {
								text: "3 mins",
								value: 166,
							},
							end_location: {
								lat: 23.0249881,
								lng: 72.5068697,
							},
							html_instructions:
								'Turn \u003Cb\u003Eleft\u003C/b\u003E\u003Cdiv style="font-size:0.9em"\u003EPass by Iskon Mandir (on the right in 350m)\u003C/div\u003E',
							maneuver: "turn-left",
							polyline: {
								points:
									"ghqkCuzpyLDEBCBCHAH?RB\\D~Bh@f@JjH`Bb@Jv@NJBn@L`@Jl@TPDNDRBXDHDzA\\n@N~@R`@Hh@L~A^",
							},
							start_location: {
								lat: 23.0312389,
								lng: 72.5087536,
							},
							travel_mode: "DRIVING",
						},
						{
							distance: {
								text: "29 m",
								value: 29,
							},
							duration: {
								text: "1 min",
								value: 15,
							},
							end_location: {
								lat: 23.0249769,
								lng: 72.5071487,
							},
							html_instructions:
								"Turn \u003Cb\u003Eleft\u003C/b\u003E at Roots Agrotech",
							maneuver: "turn-left",
							polyline: {
								points: "eapkC}npyL@w@",
							},
							start_location: {
								lat: 23.0249881,
								lng: 72.5068697,
							},
							travel_mode: "DRIVING",
						},
					],
					traffic_speed_entry: [],
					via_waypoint: [],
				},
			],
			overview_polyline: {
				points:
					"cbskCafpyLJmFFeBNgA|@oDh@qBlDkNh@eB@GJYRHrBx@dQzG~Aj@pC|@l@PfCx@|Ab@pAZJVXH|Bd@DEFGRAp@HfDt@rK`CpAX~@ZfATlFjAhCl@@w@",
			},
			summary: "Sindhu Bhavan Marg",
			warnings: [],
			waypoint_order: [],
		},
	],
	status: "OK",
};

// Dummy Navigation Data

export const dummySteps = [
	{
		distance: {
			text: "57 m",
			value: 57,
		},
		duration: {
			text: "1 min",
			value: 21,
		},
		end_location: {
			lat: 23.0404549,
			lng: 72.5061347,
		},
		html_instructions: "Head <b>south</b> toward <b>Sindhu Bhavan Marg</b>",
		polyline: {
			points: "_eskCyjpyLdBN",
		},
		start_location: {
			lat: 23.0409623,
			lng: 72.50620990000002,
		},
		travel_mode: "DRIVING",
		isWaypoint: false,
	},
	{
		distance: {
			text: "0.3 km",
			value: 291,
		},
		duration: {
			text: "1 min",
			value: 68,
		},
		end_location: {
			lat: 23.0398377,
			lng: 72.5088688,
		},
		html_instructions:
			'Turn <b>left</b> at IndiaBizForSale: India-focused business buy/<wbr/>sell, fundraising, and investment platform onto <b>Sindhu Bhavan Marg</b><div style="font-size:0.9em">Pass by Friends Ave (on the left)</div>',
		maneuver: "turn-left",
		polyline: {
			points: "yaskCijpyL@sA?QDsA@QDg@H_@Lg@BKPu@XeA`@_B",
		},
		start_location: {
			lat: 23.0404549,
			lng: 72.5061347,
		},
		travel_mode: "DRIVING",
		isWaypoint: false,
	},
	{
		distance: {
			text: "0.7 km",
			value: 719,
		},
		duration: {
			text: "2 mins",
			value: 110,
		},
		end_location: {
			lat: 23.0339895,
			lng: 72.5060987,
		},
		html_instructions:
			'Turn <b>right</b> at iVenus - Apple Premium Reseller Asian Square Sindhu bhavan Road, Ahmedabad onto <b>E Ebony Rd</b><div style="font-size:0.9em">Pass by Asterisk Service &amp; Solution provider division (on the left)</div>',
		maneuver: "turn-right",
		polyline: {
			points:
				"_~rkCm{pyLFQPD`Bv@x@^`A\\`@PXJNH~An@v@\\THlAf@pDnAfCbALFTFdBr@d@RVJHDdAX",
		},
		start_location: {
			lat: 23.0398377,
			lng: 72.5088688,
		},
		travel_mode: "DRIVING",
		isWaypoint: false,
	},
	{
		distance: {
			text: "0.3 km",
			value: 277,
		},
		duration: {
			text: "1 min",
			value: 41,
		},
		end_location: {
			lat: 23.0316999,
			lng: 72.50506639999999,
		},
		html_instructions:
			'Continue onto <b>Das Hari Rd</b><div style="font-size:0.9em">Pass by Chavda Natvarbhai Store (on the left)</div>',
		polyline: {
			points: "myqkCcjpyLPLNNjCx@^JZLb@JbCv@v@V",
		},
		start_location: {
			lat: 23.0339895,
			lng: 72.5060987,
		},
		travel_mode: "DRIVING",
		isWaypoint: false,
	},
	{
		distance: {
			text: "0.4 km",
			value: 400,
		},
		duration: {
			text: "1 min",
			value: 69,
		},
		end_location: {
			lat: 23.0283197,
			lng: 72.5058703,
		},
		html_instructions:
			'Turn <b>left</b> at Amul onto <b>Prabhupada Marg</b><div style="font-size:0.9em">Pass by Paarijat Eclat (on the right)</div>',
		maneuver: "turn-left",
		polyline: {
			points:
				"ckqkCucpyLzAaAr@a@LKHAJCNCxAYdAQZGPEPCRCDADAF?HAP?R@L?N@N@L@RBTB`AP",
		},
		start_location: {
			lat: 23.0316999,
			lng: 72.50506639999999,
		},
		travel_mode: "DRIVING",
		isWaypoint: false,
	},
	{
		distance: {
			text: "92 m",
			value: 92,
		},
		duration: {
			text: "1 min",
			value: 26,
		},
		end_location: {
			lat: 23.0281806,
			lng: 72.5066195,
		},
		html_instructions:
			"Turn <b>left</b> at Nexventis Exports (OPC) Private Limited",
		maneuver: "turn-left",
		polyline: {
			points: "_vpkCuhpyLEmB@EBEDAHBD??EDW",
		},
		start_location: {
			lat: 23.0283197,
			lng: 72.5058703,
		},
		travel_mode: "DRIVING",
		isWaypoint: false,
	},
];

export const dummyIndex = 0;

export const dummyType = "Drive";

export const dummyDirections = {
	steps: [
		{
			distance: {
				text: "57 m",
				value: 57,
			},
			duration: {
				text: "1 min",
				value: 21,
			},
			end_location: {
				lat: 23.0404549,
				lng: 72.5061347,
			},
			html_instructions: "Head <b>south</b> toward <b>Sindhu Bhavan Marg</b>",
			polyline: {
				points: "_eskCyjpyLdBN",
			},
			start_location: {
				lat: 23.0409623,
				lng: 72.50620990000002,
			},
			travel_mode: "DRIVING",
			isWaypoint: false,
		},
		{
			distance: {
				text: "0.3 km",
				value: 291,
			},
			duration: {
				text: "1 min",
				value: 68,
			},
			end_location: {
				lat: 23.0398377,
				lng: 72.5088688,
			},
			html_instructions:
				'Turn <b>left</b> at IndiaBizForSale: India-focused business buy/<wbr/>sell, fundraising, and investment platform onto <b>Sindhu Bhavan Marg</b><div style="font-size:0.9em">Pass by Friends Ave (on the left)</div>',
			maneuver: "turn-left",
			polyline: {
				points: "yaskCijpyL@sA?QDsA@QDg@H_@Lg@BKPu@XeA`@_B",
			},
			start_location: {
				lat: 23.0404549,
				lng: 72.5061347,
			},
			travel_mode: "DRIVING",
			isWaypoint: false,
		},
		{
			distance: {
				text: "0.7 km",
				value: 719,
			},
			duration: {
				text: "2 mins",
				value: 110,
			},
			end_location: {
				lat: 23.0339895,
				lng: 72.5060987,
			},
			html_instructions:
				'Turn <b>right</b> at iVenus - Apple Premium Reseller Asian Square Sindhu bhavan Road, Ahmedabad onto <b>E Ebony Rd</b><div style="font-size:0.9em">Pass by Asterisk Service &amp; Solution provider division (on the left)</div>',
			maneuver: "turn-right",
			polyline: {
				points:
					"_~rkCm{pyLFQPD`Bv@x@^`A\\`@PXJNH~An@v@\\THlAf@pDnAfCbALFTFdBr@d@RVJHDdAX",
			},
			start_location: {
				lat: 23.0398377,
				lng: 72.5088688,
			},
			travel_mode: "DRIVING",
			isWaypoint: false,
		},
		{
			distance: {
				text: "0.3 km",
				value: 277,
			},
			duration: {
				text: "1 min",
				value: 41,
			},
			end_location: {
				lat: 23.0316999,
				lng: 72.50506639999999,
			},
			html_instructions:
				'Continue onto <b>Das Hari Rd</b><div style="font-size:0.9em">Pass by Chavda Natvarbhai Store (on the left)</div>',
			polyline: {
				points: "myqkCcjpyLPLNNjCx@^JZLb@JbCv@v@V",
			},
			start_location: {
				lat: 23.0339895,
				lng: 72.5060987,
			},
			travel_mode: "DRIVING",
			isWaypoint: false,
		},
		{
			distance: {
				text: "0.4 km",
				value: 400,
			},
			duration: {
				text: "1 min",
				value: 69,
			},
			end_location: {
				lat: 23.0283197,
				lng: 72.5058703,
			},
			html_instructions:
				'Turn <b>left</b> at Amul onto <b>Prabhupada Marg</b><div style="font-size:0.9em">Pass by Paarijat Eclat (on the right)</div>',
			maneuver: "turn-left",
			polyline: {
				points:
					"ckqkCucpyLzAaAr@a@LKHAJCNCxAYdAQZGPEPCRCDADAF?HAP?R@L?N@N@L@RBTB`AP",
			},
			start_location: {
				lat: 23.0316999,
				lng: 72.50506639999999,
			},
			travel_mode: "DRIVING",
			isWaypoint: false,
		},
		{
			distance: {
				text: "92 m",
				value: 92,
			},
			duration: {
				text: "1 min",
				value: 26,
			},
			end_location: {
				lat: 23.0281806,
				lng: 72.5066195,
			},
			html_instructions:
				"Turn <b>left</b> at Nexventis Exports (OPC) Private Limited",
			maneuver: "turn-left",
			polyline: {
				points: "_vpkCuhpyLEmB@EBEDAHBD??EDW",
			},
			start_location: {
				lat: 23.0283197,
				lng: 72.5058703,
			},
			travel_mode: "DRIVING",
			isWaypoint: false,
		},
	],
	myLocationName: {
		mainText: "BINORI B Square 3,",
		fullText: "BINORI B Square 3,, Bodakdev, Ahmedabad, Gujarat, India",
		place_id: "ChIJHZyFw5ibXjkR9XTGbNV67fg",
	},
	destinationName: {
		mainText: "ISKCON Temple, Ahmedabad",
		fullText:
			"Satellite Road, Sarkhej - Gandhinagar Hwy, Bodakdev, Ahmedabad, Gujarat 380059, India",
	},
};

export const dummyNavWaypoints = [
	{
		locationName: "My Location",
		latitude: 23.0410169,
		longitude: 72.5063781,
	},
	{
		locationName: "ISKCON Temple, Ahmedabad",
		place_id: "a1b2c3",
		latitude: 23.0282898,
		longitude: 72.50689129999999,
	},
];

export const dummyContacts = [
	{
		phoneNumbers: [
			{
				id: "6179",
				label: "Mobile",
				number: "321",
			},
		],
		isStarred: false,
		postalAddresses: [],
		thumbnailPath: "",
		department: "",
		jobTitle: "",
		emailAddresses: [],
		urlAddresses: [],
		suffix: null,
		company: "",
		imAddresses: [],
		note: null,
		middleName: "",
		displayName: "*Dial Airtel",
		familyName: "Airtel",
		givenName: "*Dial",
		prefix: null,
		hasThumbnail: false,
		rawContactId: "2",
		recordID: "531",
	},
	{
		phoneNumbers: [
			{
				id: "6250",
				label: "Mobile",
				number: "+919825738979",
			},
			{
				id: "22710",
				label: "Work",
				number: "+91 79903 30476",
			},
			{
				id: "18830",
				label: "Mobile",
				number: "+919825738979",
			},
		],
		isStarred: false,
		postalAddresses: [],
		thumbnailPath: "",
		department: "",
		jobTitle: "",
		emailAddresses: [],
		urlAddresses: [],
		suffix: null,
		company: "",
		imAddresses: [],
		note: null,
		middleName: "bapa",
		displayName: "Bhaga bapa Gondal",
		familyName: "Gondal",
		givenName: "Bhaga",
		prefix: null,
		hasThumbnail: false,
		rawContactId: "3430",
		recordID: "5366",
	},
	{
		phoneNumbers: [
			{
				id: "6536",
				label: "WhatsApp",
				number: "955-824-2266",
			},
			{
				id: "6537",
				label: "WhatsApp",
				number: "955-824-2266",
			},
			{
				id: "18885",
				label: "WhatsApp",
				number: "9558242266",
			},
		],
		isStarred: false,
		postalAddresses: [],
		thumbnailPath: "",
		department: "",
		jobTitle: "",
		emailAddresses: [],
		urlAddresses: [],
		suffix: null,
		company: "",
		imAddresses: [],
		note: null,
		middleName: "",
		displayName: "Hitesh Fuva",
		familyName: "Fuva",
		givenName: "Hitesh",
		prefix: null,
		hasThumbnail: false,
		rawContactId: "3441",
		recordID: "3717",
	},
	{
		phoneNumbers: [
			{
				id: "7053",
				label: "Mobile",
				number: "991-319-4810",
			},
			{
				id: "7054",
				label: "Mobile",
				number: "991-319-4810",
			},
			{
				id: "20650",
				label: "Mobile",
				number: "9913194810",
			},
		],
		isStarred: false,
		postalAddresses: [],
		thumbnailPath: "",
		department: "",
		jobTitle: "",
		emailAddresses: [],
		urlAddresses: [],
		suffix: null,
		company: "",
		imAddresses: [],
		note: null,
		middleName: "Fuva",
		displayName: "Uka Fuva Dharsenda",
		familyName: "Dharsenda",
		givenName: "Uka",
		prefix: null,
		hasThumbnail: false,
		rawContactId: "3794",
		recordID: "4070",
	},
	{
		phoneNumbers: [
			{
				id: "6422",
				label: "Mobile",
				number: "1-213-12",
			},
			{
				id: "6423",
				label: "Mobile",
				number: "1-213-12",
			},
		],
		isStarred: false,
		postalAddresses: [],
		thumbnailPath: "",
		department: "",
		jobTitle: "",
		emailAddresses: [],
		urlAddresses: [],
		suffix: null,
		company: "",
		imAddresses: [],
		note: null,
		middleName: "",
		displayName: "Full Talktime",
		familyName: "Talktime",
		givenName: "Full",
		prefix: null,
		hasThumbnail: false,
		rawContactId: "40",
		recordID: "562",
	},
];

export const dummySortContact = [
	{
		phoneNumbers: [
			{
				id: "6179",
				label: "Mobile",
				number: "321",
			},
		],
		isStarred: false,
		postalAddresses: [],
		thumbnailPath: "",
		department: "",
		jobTitle: "",
		emailAddresses: [],
		urlAddresses: [],
		suffix: null,
		company: "",
		imAddresses: [],
		note: null,
		middleName: "",
		displayName: "*Dial Airtel",
		familyName: "Airtel",
		givenName: "*Dial",
		prefix: null,
		hasThumbnail: false,
		rawContactId: "2",
		recordID: "531",
	},
	{
		phoneNumbers: [
			{
				id: "6250",
				label: "Mobile",
				number: "+919825738979",
			},
			{
				id: "22710",
				label: "Work",
				number: "+91 79903 30476",
			},
			{
				id: "18830",
				label: "Mobile",
				number: "+919825738979",
			},
		],
		isStarred: false,
		postalAddresses: [],
		thumbnailPath: "",
		department: "",
		jobTitle: "",
		emailAddresses: [],
		urlAddresses: [],
		suffix: null,
		company: "",
		imAddresses: [],
		note: null,
		middleName: "bapa",
		displayName: "Bhaga bapa Gondal",
		familyName: "Gondal",
		givenName: "Bhaga",
		prefix: null,
		hasThumbnail: false,
		rawContactId: "3430",
		recordID: "5366",
	},
	{
		phoneNumbers: [
			{
				id: "6422",
				label: "Mobile",
				number: "1-213-12",
			},
			{
				id: "6423",
				label: "Mobile",
				number: "1-213-12",
			},
		],
		isStarred: false,
		postalAddresses: [],
		thumbnailPath: "",
		department: "",
		jobTitle: "",
		emailAddresses: [],
		urlAddresses: [],
		suffix: null,
		company: "",
		imAddresses: [],
		note: null,
		middleName: "",
		displayName: "Full Talktime",
		familyName: "Talktime",
		givenName: "Full",
		prefix: null,
		hasThumbnail: false,
		rawContactId: "40",
		recordID: "562",
	},
	{
		phoneNumbers: [
			{
				id: "6536",
				label: "WhatsApp",
				number: "955-824-2266",
			},
			{
				id: "6537",
				label: "WhatsApp",
				number: "955-824-2266",
			},
			{
				id: "18885",
				label: "WhatsApp",
				number: "9558242266",
			},
		],
		isStarred: false,
		postalAddresses: [],
		thumbnailPath: "",
		department: "",
		jobTitle: "",
		emailAddresses: [],
		urlAddresses: [],
		suffix: null,
		company: "",
		imAddresses: [],
		note: null,
		middleName: "",
		displayName: "Hitesh Fuva",
		familyName: "Fuva",
		givenName: "Hitesh",
		prefix: null,
		hasThumbnail: false,
		rawContactId: "3441",
		recordID: "3717",
	},
	{
		phoneNumbers: [
			{
				id: "7053",
				label: "Mobile",
				number: "991-319-4810",
			},
			{
				id: "7054",
				label: "Mobile",
				number: "991-319-4810",
			},
			{
				id: "20650",
				label: "Mobile",
				number: "9913194810",
			},
		],
		isStarred: false,
		postalAddresses: [],
		thumbnailPath: "",
		department: "",
		jobTitle: "",
		emailAddresses: [],
		urlAddresses: [],
		suffix: null,
		company: "",
		imAddresses: [],
		note: null,
		middleName: "Fuva",
		displayName: "Uka Fuva Dharsenda",
		familyName: "Dharsenda",
		givenName: "Uka",
		prefix: null,
		hasThumbnail: false,
		rawContactId: "3794",
		recordID: "4070",
	},
	{
		phoneNumbers: [
			{
				id: "6422",
				label: "Mobile",
				number: "1-213-12",
			},
			{
				id: "6423",
				label: "Mobile",
				number: "1-213-12",
			},
		],
		isStarred: false,
		postalAddresses: [],
		thumbnailPath: "",
		department: "",
		jobTitle: "",
		emailAddresses: [],
		urlAddresses: [],
		suffix: null,
		company: "",
		imAddresses: [],
		note: null,
		middleName: "",
		displayName: "Full Talktime",
		familyName: "Talktime",
		givenName: "Full",
		prefix: null,
		hasThumbnail: false,
		rawContactId: "40",
		recordID: "562",
	},
	{
		phoneNumbers: [
			{
				id: "6536",
				label: "WhatsApp",
				number: "955-824-2266",
			},
			{
				id: "6537",
				label: "WhatsApp",
				number: "955-824-2266",
			},
			{
				id: "18885",
				label: "WhatsApp",
				number: "9558242266",
			},
		],
		isStarred: false,
		postalAddresses: [],
		thumbnailPath: "",
		department: "",
		jobTitle: "",
		emailAddresses: [],
		urlAddresses: [],
		suffix: null,
		company: "",
		imAddresses: [],
		note: null,
		middleName: "",
		displayName: "Hitesh Fuva",
		familyName: "Fuva",
		givenName: "Hitesh",
		prefix: null,
		hasThumbnail: false,
		rawContactId: "3441",
		recordID: "3717",
	},
	{
		phoneNumbers: [
			{
				id: "7053",
				label: "Mobile",
				number: "991-319-4810",
			},
			{
				id: "7054",
				label: "Mobile",
				number: "991-319-4810",
			},
			{
				id: "20650",
				label: "Mobile",
				number: "9913194810",
			},
		],
		isStarred: false,
		postalAddresses: [],
		thumbnailPath: "",
		department: "",
		jobTitle: "",
		emailAddresses: [],
		urlAddresses: [],
		suffix: null,
		company: "",
		imAddresses: [],
		note: null,
		middleName: "Fuva",
		displayName: "Uka Fuva Dharsenda",
		familyName: "Dharsenda",
		givenName: "Uka",
		prefix: null,
		hasThumbnail: false,
		rawContactId: "3794",
		recordID: "4070",
	},
];
