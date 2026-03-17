import { BASE_URL, GOOGLE_MAPS_APIKEY } from "./BaseUrl";
import axios from "axios";
import RNFS from "react-native-fs";
import moment from "moment";
import { Alert, Linking, Platform, ToastAndroid } from "react-native";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { check, PERMISSIONS, RESULTS, request } from "react-native-permissions";
import { add, format, isToday, isYesterday, parseISO } from "date-fns";
import Clipboard from "@react-native-clipboard/clipboard";
import { trigger } from "react-native-haptic-feedback";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FileViewer from "react-native-file-viewer";
import { getHash } from "react-native-otp-verify";
import { Image } from "react-native-compressor";
import { VideoManager } from "react-native-video-manager";
import momentTimeZone from "moment-timezone";
import emojiRegex from "emoji-regex";
import polyline from "@mapbox/polyline";
import Share from "react-native-share";
import { gpxResponse } from "../json/DummyData";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const US_TIMEZONE = "America/Chicago";

// export const countryCodes =
// 	BASE_URL === "https://retyrn.nxtech.ai/api/"
// 		? ["US"]
// 		: BASE_URL === "https://52.72.147.122/api/"
// 		? ["US"]
// 		: ["US", "IN"];

export const countryCodes = ["US", "IN"];
export const noImgUrl =
	"https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg";
export const noProfilePic =
	"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhwaLDKaK49tsHmdMGOrmTdns5qiw080F2Yw&s";

export const getFormattedDate = () => {
	const date = new Date();
	const options = { month: "short", day: "numeric" };
	return date.toLocaleDateString("en-US", options);
};

export const getFormattedTime = () => {
	const date = new Date();
	const options = { hour: "numeric", minute: "numeric", hour12: true };
	return date.toLocaleTimeString("en-US", options);
};

export const getCurrentTimeFormatHHMM = () => {
	const now = new Date();
	let hours = now.getHours();
	let minutes = now.getMinutes();

	hours = hours < 10 ? `0${hours}` : hours;
	minutes = minutes < 10 ? `0${minutes}` : minutes;

	return `${hours}:${minutes}`;
};

export const fetchLocationName = async (latitude, longitude) => {
	try {
		const response = await fetch(
			`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_APIKEY}`
		);
		const data = await response.json();

		if (data.results.length > 0) {
			return data.results[0].formatted_address;
		} else {
			return "No address found";
		}
	} catch (error) {
		console.error("Error fetching location name:", error);
		return "Error fetching location name";
	}
};

export const fetchWaypointLocationNames = async (waypoints) => {
	try {
		const waypointLocationNames = await Promise.all(
			waypoints.map(async (waypoint) => {
				if (waypoint.latitude && waypoint.longitude) {
					return await fetchLocationName(waypoint.latitude, waypoint.longitude);
				} else {
					return "No location";
				}
			})
		);
		return waypointLocationNames;
	} catch (error) {
		console.error("Error fetching waypoint location names:", error);
		return waypoints.map(() => "Error fetching location name");
	}
};

export const fetchParkingPlaces = async (lat, lng) => {
	try {
		const response = await axios.get(
			`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=parking&key=${GOOGLE_MAPS_APIKEY}`
		);
		return response.data.results;
	} catch (error) {
		console.error("Error fetching parking places: ", error);
	}
};

export const fetchFoodPlaces = async (lat, lng) => {
	try {
		const response = await axios.get(
			`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=restaurant&key=${GOOGLE_MAPS_APIKEY}`
		);
		return response.data.results;
	} catch (error) {
		console.error("Error fetching food places: ", error);
	}
};

export const placeTypeMap = {
	"Gas Stations": "gas_station",
	Lunch: "restaurant",
	Hotels: "lodging",
	"Railway Stations": "train_station",
	Parking: "parking",
	"Metro Station": "subway_station",
	"Bus Stops": "bus_station",
	"Coffee Shops": "cafe",
};

export const fetchNearbyPlacesMap = async (lat, lng, radius, type) => {
	try {
		const response = await axios.get(
			`https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
			{
				params: {
					location: `${lat},${lng}`,
					radius,
					type,
					key: GOOGLE_MAPS_APIKEY,
				},
			}
		);
		return response.data.results;
	} catch (error) {
		console.error(`Error fetching ${type} places:`, error);
		return [];
	}
};

export const fetchShoppingPlaces = async (lat, lng) => {
	try {
		const response = await axios.get(
			`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=shopping_mall&key=${GOOGLE_MAPS_APIKEY}`
		);
		return response.data.results;
	} catch (error) {
		console.error("Error fetching shopping places: ", error);
	}
};

export const fetchHotelPlaces = async (lat, lng) => {
	try {
		const response = await axios.get(
			`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=lodging&key=${GOOGLE_MAPS_APIKEY}`
		);
		return response.data.results;
	} catch (error) {
		console.error("Error fetching hotel places: ", error);
	}
};

export const fetchGasStations = async (lat, lng) => {
	try {
		const response = await axios.get(
			`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=gas_station&key=${GOOGLE_MAPS_APIKEY}`
		);
		return response.data.results;
	} catch (error) {
		console.error("Error fetching gas stations: ", error);
	}
};

export const fetchDistanceAndDuration = async (origin, destination) => {
	try {
		const response = await fetch(
			`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${GOOGLE_MAPS_APIKEY}`
		);
		const data = await response.json();

		if (data.rows[0].elements[0].status === "OK") {
			const distance = data.rows[0].elements[0].distance.value;
			const duration = data.rows[0].elements[0].duration.value;
			const durationText = data.rows[0].elements[0].duration.text;
			return { distance, duration, durationText };
		}
	} catch (error) {
		return { distance: 0, duration: 0 };
	}
};

export const fetchDuration = async (origin, destination) => {
	try {
		const response = await fetch(
			`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${
				origin.latitude ?? origin.lat
			},${origin.longitude ?? origin.lng}&destinations=${
				destination.latitude ?? destination.lat
			},${destination.longitude ?? destination.lng}&key=${GOOGLE_MAPS_APIKEY}`
		);
		const data = await response.json();

		if (data.rows[0].elements[0].status === "OK") {
			return data.rows[0].elements[0].duration.text;
		} else {
			return "No duration found";
		}
	} catch (error) {
		console.error("Error fetching duration:", error);
		return "Error fetching duration";
	}
};

export const fetchRoutes = async (origin, destination) => {
	try {
		const response = await fetch(
			`https://maps.googleapis.com/maps/api/directions/json?origin=${
				origin.latitude
			},${origin.longitude}&destination=${
				destination.lat || destination.latitude
			},${
				destination.lng || destination.longitude
			}&alternatives=true&key=${GOOGLE_MAPS_APIKEY}`
		);
		const data = await response.json();
		return data.routes;
	} catch (error) {
		console.error("Error fetching routes:", error);
		return [];
	}
};

export const fetchRoutesWaypoints = async (
	origin,
	destination,
	waypoints = [],
	avoidTolls = false,
	avoidHighways = false
) => {
	try {
		let waypointString = "";
		if (waypoints.length > 0) {
			waypointString = `&waypoints=${waypoints
				.map((wp) => `${wp.latitude},${wp.longitude}`)
				.join("|")}`;
		}

		let avoidOptions = [];
		if (avoidTolls) avoidOptions.push("tolls");
		if (avoidHighways) avoidOptions.push("highways");
		const avoidString =
			avoidOptions.length > 0 ? `&avoid=${avoidOptions.join(",")}` : "";

		const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${
			origin.latitude
		},${origin.longitude}&destination=${
			destination.lat || destination.latitude
		},${
			destination.lng || destination.longitude
		}${waypointString}${avoidString}&alternatives=true&key=${GOOGLE_MAPS_APIKEY}`;

		const response = await fetch(url);
		const data = await response.json();

		const enrichedRoutes = data.routes.map((route) => {
			const polylinePoints = polyline
				.decode(route.overview_polyline.points)
				.map(([lat, lng]) => ({
					latitude: lat,
					longitude: lng,
				}));

			const allSteps = [];
			route.legs?.forEach((leg) => {
				if (leg?.steps) {
					leg.steps.forEach((step) => {
						let isWaypoint = false;
						const matchedWaypoint = waypoints.find(
							(wp) =>
								Math.abs(wp.latitude - step.end_location.lat) < 0.0003 &&
								Math.abs(wp.longitude - step.end_location.lng) < 0.0003
						);
						if (matchedWaypoint) {
							isWaypoint = true;
							step.waypointId = matchedWaypoint.id;
							step.waypointAddress = matchedWaypoint.address;
							step.waypointLocationName = matchedWaypoint.locationName;
						}

						allSteps.push({ ...step, isWaypoint });
					});
				}
			});

			const totalDistanceValue = route.legs?.reduce(
				(sum, leg) => sum + (leg.distance?.value || 0),
				0
			);

			const totalDurationValue = route.legs?.reduce(
				(sum, leg) => sum + (leg.duration?.value || 0),
				0
			);

			const distanceInMiles = totalDistanceValue
				? `${(totalDistanceValue / 1609.34).toFixed(1)} miles`
				: "N/A";

			return {
				polyline: polylinePoints,
				distance: distanceInMiles,
				duration: `${Math.round(totalDurationValue / 60)} mins`,
				durationValue: totalDurationValue || Infinity,
				summary: route.summary || "",
				overviewPolyline: route.overview_polyline.points,
				steps: allSteps,
			};
		});

		const minDuration = Math.min(...enrichedRoutes.map((r) => r.durationValue));
		const enrichedWithFastest = enrichedRoutes.map((route) => ({
			...route,
			isFastest: route.durationValue === minDuration,
		}));

		return enrichedWithFastest;
	} catch (error) {
		console.error("Error fetching routes:", error);
		return [];
	}
};

export const fetchWalkingRoutes = async (
	origin,
	destination,
	waypoints = [],
	avoidTolls = false,
	avoidHighways = false
) => {
	try {
		let waypointString = "";
		if (waypoints.length > 0) {
			waypointString = `&waypoints=${waypoints
				.map((wp) => `${wp.latitude},${wp.longitude}`)
				.join("|")}`;
		}

		let avoidOptions = [];
		if (avoidTolls) avoidOptions.push("tolls");
		if (avoidHighways) avoidOptions.push("highways");
		const avoidString =
			avoidOptions.length > 0 ? `&avoid=${avoidOptions.join(",")}` : "";

		const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${
			origin.latitude
		},${origin.longitude}&destination=${
			destination.lat || destination.latitude
		},${
			destination.lng || destination.longitude
		}${waypointString}${avoidString}&alternatives=true&mode=walking&key=${GOOGLE_MAPS_APIKEY}`;

		const response = await fetch(url);
		const data = await response.json();

		const enrichedRoutes = data.routes.map((route) => {
			const polylinePoints = polyline
				.decode(route.overview_polyline.points)
				.map(([lat, lng]) => ({
					latitude: lat,
					longitude: lng,
				}));

			const allSteps = [];
			route.legs?.forEach((leg) => {
				if (leg?.steps) {
					leg.steps.forEach((step) => {
						let isWaypoint = false;
						const matchedWaypoint = waypoints.find(
							(wp) =>
								Math.abs(wp.latitude - step.end_location.lat) < 0.0003 &&
								Math.abs(wp.longitude - step.end_location.lng) < 0.0003
						);
						if (matchedWaypoint) {
							isWaypoint = true;
							step.waypointId = matchedWaypoint.id;
							step.waypointAddress = matchedWaypoint.address;
							step.waypointLocationName = matchedWaypoint.locationName;
						}

						allSteps.push({ ...step, isWaypoint });
					});
				}
			});

			const totalDistanceValue = route.legs?.reduce(
				(sum, leg) => sum + (leg.distance?.value || 0),
				0
			);
			const totalDurationValue = route.legs?.reduce(
				(sum, leg) => sum + (leg.duration?.value || 0),
				0
			);

			const distanceInMiles = totalDistanceValue
				? `${(totalDistanceValue / 1609.34).toFixed(1)} miles`
				: "N/A";

			return {
				polyline: polylinePoints,
				distance: distanceInMiles,
				duration: `${Math.round(totalDurationValue / 60)} mins`,
				durationValue: totalDurationValue || Infinity,
				summary: route.summary || "",
				overviewPolyline: route.overview_polyline.points,
				steps: allSteps,
			};
		});

		return enrichedRoutes;
	} catch (error) {
		console.error("Error fetching walking routes:", error);
		return [];
	}
};

export const fetchCyclingRoutes = async (
	origin,
	destination,
	waypoints = [],
	avoidTolls = false,
	avoidHighways = false
) => {
	try {
		let waypointString = "";
		if (waypoints.length > 0) {
			waypointString = `&waypoints=${waypoints
				.map((wp) => `${wp.latitude},${wp.longitude}`)
				.join("|")}`;
		}

		let avoidOptions = [];
		if (avoidTolls) avoidOptions.push("tolls");
		if (avoidHighways) avoidOptions.push("highways");
		const avoidString =
			avoidOptions.length > 0 ? `&avoid=${avoidOptions.join(",")}` : "";

		const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${
			origin.latitude
		},${origin.longitude}&destination=${
			destination.lat || destination.latitude
		},${
			destination.lng || destination.longitude
		}${waypointString}${avoidString}&alternatives=true&mode=bicycling&key=${GOOGLE_MAPS_APIKEY}`;

		const response = await fetch(url);
		const data = await response.json();

		const enrichedRoutes = data.routes.map((route) => {
			const polylinePoints = polyline
				.decode(route.overview_polyline.points)
				.map(([lat, lng]) => ({
					latitude: lat,
					longitude: lng,
				}));

			const allSteps = [];
			route.legs?.forEach((leg) => {
				if (leg?.steps) {
					leg.steps.forEach((step) => {
						let isWaypoint = false;

						const matchedWaypoint = waypoints.find(
							(wp) =>
								Math.abs(wp.latitude - step.end_location.lat) < 0.0003 &&
								Math.abs(wp.longitude - step.end_location.lng) < 0.0003
						);

						if (matchedWaypoint) {
							isWaypoint = true;
							step.waypointId = matchedWaypoint.id;
							step.waypointAddress = matchedWaypoint.address;
							step.waypointLocationName = matchedWaypoint.locationName;
						}

						allSteps.push({ ...step, isWaypoint });
					});
				}
			});

			const totalDistanceValue = route.legs?.reduce(
				(sum, leg) => sum + (leg.distance?.value || 0),
				0
			);

			const totalDurationValue = route.legs?.reduce(
				(sum, leg) => sum + (leg.duration?.value || 0),
				0
			);

			const distanceInMiles = totalDistanceValue
				? `${(totalDistanceValue / 1609.34).toFixed(1)} miles`
				: "N/A";

			return {
				polyline: polylinePoints,
				distance: distanceInMiles,
				duration: `${Math.round(totalDurationValue / 60)} mins`,
				durationValue: totalDurationValue || Infinity,
				summary: route.summary || "",
				overviewPolyline: route.overview_polyline.points,
				steps: allSteps,
			};
		});

		const minDuration = Math.min(...enrichedRoutes.map((r) => r.durationValue));
		const enrichedWithFastest = enrichedRoutes.map((route) => ({
			...route,
			isFastest: route.durationValue === minDuration,
		}));

		return enrichedWithFastest;
	} catch (error) {
		console.error("Error fetching cycling routes:", error);
		return [];
	}
};

export const calculateAverageSpeed = (distance, duration) => {
	const durationInHours = duration / 3600;
	return durationInHours > 0 ? (distance / durationInHours).toFixed(2) : 0;
};

export const convertLatLongToString = (coordinates) => {
	const { latitude, longitude } = coordinates;
	return `${latitude},${longitude}`;
};

export const parseHtmlInstructions = (htmlInstructions) => {
	const boldText =
		htmlInstructions
			.match(/<b>(.*?)<\/b>/g)
			?.map((tag) => tag.replace(/<\/?b>/g, "")) || [];

	const tempInstructions = htmlInstructions
		.replace(/<\/b>/g, "\n")
		.replace(/<b>/g, "");

	const formattedInstructions = tempInstructions
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0);

	const resultInstructions = [];
	let currentLine = "";
	formattedInstructions.forEach((line) => {
		if (currentLine) {
			resultInstructions.push(currentLine.trim());
			currentLine = "";
		}
		currentLine += line;
	});
	if (currentLine) {
		resultInstructions.push(currentLine.trim());
	}

	return {
		boldText: boldText ? boldText : "-",
		formattedInstructions:
			resultInstructions.length > 0 ? resultInstructions : [],
	};
};

export const formatDistanceToMiles = (distanceInMeters) => {
	if (distanceInMeters >= 1609.34) {
		const miles = distanceInMeters * 0.000621371;
		return `${miles.toFixed(1)} mi`;
	} else if (distanceInMeters >= 100) {
		return `${Math.round(distanceInMeters)} m`;
	} else {
		return `${distanceInMeters.toFixed(0)} m`;
	}
};

export const getIconLibrary = (maneuver) => {
	switch (maneuver) {
		case "straight":
			return "MaterialCommunityIcons";

		case "turn-left":
			return "MaterialCommunityIcons";
		case "turn-right":
			return "MaterialCommunityIcons";

		case "ramp-right":
			return "MaterialIcons";
		case "ramp-left":
			return "MaterialIcons";

		case "keep-right":
			return "MaterialCommunityIcons";
		case "keep-left":
			return "MaterialCommunityIcons";

		case "turn-slight-left":
			return "MaterialIcons";
		case "turn-slight-right":
			return "MaterialIcons";

		case "roundabout-left":
			return "MaterialIcons";
		case "roundabout-right":
			return "MaterialIcons";

		case "turn-sharp-left":
			return "MaterialIcons";
		case "turn-sharp-right":
			return "MaterialIcons";

		case "uturn-left":
			return "MaterialIcons";
		case "uturn-right":
			return "MaterialIcons";

		case "fork-left":
			return "MaterialIcons";
		case "fork-right":
			return "MaterialIcons";

		case "ferry":
			return "MaterialCommunityIcons";
		case "ferry-train":
			return "MaterialCommunityIcons";
		case "ferry-walk":
			return "MaterialCommunityIcons";

		case "merge":
			return "MaterialIcons";

		default:
			return "MaterialCommunityIcons";
	}
};

export const getTurnIcon = (maneuver) => {
	switch (maneuver) {
		case "straight":
			return "arrow-up";

		case "turn-left":
			return "arrow-left-top";
		case "turn-right":
			return "arrow-right-top";

		case "ramp-right":
			return "ramp-right";
		case "ramp-left":
			return "ramp-left";

		case "keep-right":
			return "arrow-top-right";
		case "keep-left":
			return "arrow-top-left";

		case "turn-slight-left":
			return "turn-slight-left";
		case "turn-slight-right":
			return "turn-slight-right";

		case "roundabout-left":
			return "roundabout-left";
		case "roundabout-right":
			return "roundabout-right";

		case "turn-sharp-left":
			return "turn-sharp-left";
		case "turn-sharp-right":
			return "turn-sharp-right";

		case "uturn-left":
			return "u-turn-left";
		case "uturn-right":
			return "u-turn-right";

		case "fork-left":
			return "fork-left";
		case "fork-right":
			return "fork-right";

		case "ferry":
			return "ferry";
		case "ferry-train":
			return "train";
		case "ferry-walk":
			return "walk";

		case "merge":
			return "merge";

		default:
			return "arrow-up";
	}
};

export const getTurnName = (maneuver) => {
	switch (maneuver) {
		case "straight":
			return "Straight";

		case "merge":
			return "Merge";

		case "turn-left":
			return "Turn Left";
		case "turn-right":
			return "Turn Right";

		case "turn-slight-left":
			return "Turn Slight Left";
		case "turn-slight-right":
			return "Turn Slight Right";

		case "ramp-right":
			return "Ramp Right";
		case "ramp-left":
			return "Ramp Left";

		case "keep-right":
			return "Keep Right";
		case "keep-left":
			return "Keep Left";

		case "roundabout-left":
			return "Round About Left";
		case "roundabout-right":
			return "Round About Right";

		case "turn-sharp-left":
			return "Turn Sharp Left";
		case "turn-sharp-right":
			return "Turn Sharp Right";

		case "uturn-left":
			return "U Turn Left";
		case "uturn-right":
			return "U Turn Right";

		case "fork-left":
			return "Fork Left";
		case "fork-right":
			return "Fork Right";

		case "ferry":
			return "Ferry";
		case "ferry-train":
			return "Ferry Train";
		case "ferry-walk":
			return "Ferry Walk";

		default:
			return "Straight";
	}
};

export function stripHtmlTags(htmlString) {
	return htmlString.replace(/<[^>]*>?/gm, ""); // Removes all HTML tags
}

export const regexName =
	/hello my name is (.+?) and I was recently in an incident/i;

export const claimUserNameText =
	"hello my name is ___ and I was recently in an incident";

export const driverNVehicleText =
	"the driver of the vehicle was ___ and the vehicle in reference is a ___";

export const dateInjuredText =
	"the incident occurred on ___ there were ___ people injured in the incident at time of reporting";

export const compareWithBlanks = (mainString, spokenText) => {
	const normalizedSpoken = spokenText.replace(/\s+/g, " ").trim().toLowerCase();
	const parts = mainString
		.toLowerCase()
		.split("___")
		.map((p) => p.trim());

	let currentIndex = 0;

	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		const index = normalizedSpoken.indexOf(part, currentIndex);

		if (index === -1) {
			return false;
		}
		if (i > 0) {
			const between = normalizedSpoken.slice(currentIndex, index).trim();
			if (between === "") return false;
		}

		currentIndex = index + part.length;
	}
	return true;
};

export const compareWithVehicleDetail = (mainString, spokenText) => {
	const parts = mainString.split("___").map((part) => part.trim());
	let lastIndex = 0;
	const lowerSpoken = spokenText.toLowerCase();

	for (let i = 0; i < parts.length; i++) {
		const part = parts[i].toLowerCase();

		const index = lowerSpoken.indexOf(part, lastIndex);
		if (index === -1) return false;

		// Check filler (text between parts)
		if (i > 0) {
			const filler = lowerSpoken.slice(lastIndex, index).trim();
			if (filler.length === 0) return false; // blank filler not allowed
		}

		lastIndex = index + part.length;
	}

	// Final filler after last part
	const finalFiller = lowerSpoken.slice(lastIndex).trim();
	if (finalFiller.length === 0) return false;

	return true;
};

export const driverNamePhrase = "the driver of the vehicle was";
export const afterDriverNamePhrase = "and the vehicle in reference is a";
export const driverNameRegex = /the driver of the vehicle was\s+(\w+)/i;
export const vehicleRefRegex = /and the vehicle in reference is a\s+(\d+)/i;

export const incidentDateRegex =
	/the incident occurred on ([a-zA-Z0-9\s]+) there were/i;
export const peopleInjuredRegex = /there were (\b\w+\b) people injured/i;
const dateNInjuredText =
	"the incident occurred on ___ there were ___ people injured in the incident at the time of reporting";

const createRegexFromMainString = (mainString) => {
	const escapedString = mainString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const regexString = escapedString.replace(/___/g, "(.+)");
	return new RegExp(`^${regexString}$`, "i");
};

export const isMatchWithDateNInjured =
	createRegexFromMainString(dateNInjuredText);

export const mergeVideoClips = async (videoClips, outputFilePath) => {
	if (videoClips.length === 0) {
		console.warn("No video clips provided for merging.");
		return null;
	}

	try {
		const { uri } = await VideoManager.merge(videoClips);
		console.log("Merged video saved to: ", uri);

		const newPath = outputFilePath;
		await RNFS.moveFile(uri.replace("file://", ""), newPath);

		const statResult = await RNFS.stat(newPath);
		const sizeInBytes = statResult.size;
		const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
		console.log(`Merged video size: ${sizeInMB} MB`);

		console.log("Renamed merged video to: ", newPath);
		return "file://" + newPath;
	} catch (error) {
		console.warn("Error during merging videos: ", error);
		return null;
	}
};

export const convertDateTime = (createdAt) => {
	const date = new Date(createdAt);
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];

	const month = months[date.getMonth()];
	const day = date.getDate();

	let hours = date.getHours();
	const minutes = date.getMinutes().toString().padStart(2, "0");

	const ampm = hours >= 12 ? "PM" : "AM";
	hours = hours % 12 || 12;

	return `${month} ${day} • ${hours}:${minutes} ${ampm}`;
};

export const convertHistotyTime = (createdAt) => {
	const date = new Date(createdAt);

	const month = (date.getMonth() + 1).toString();
	const day = date.getDate().toString();
	const year = date.getFullYear().toString().slice(-2);

	let hours = date.getHours();
	const minutes = date.getMinutes().toString().padStart(2, "0");

	const ampm = hours >= 12 ? "PM" : "AM";
	hours = hours % 12 || 12;

	return `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;
};

export const formatMessageTime = (messageTime) => {
	const now = moment();
	const messageDate = moment(messageTime);

	if (now.isSame(messageDate, "day")) {
		return messageDate.format("h:mm A");
	}

	if (now.subtract(1, "days").isSame(messageDate, "day")) {
		return "Yesterday";
	}

	if (now.isSame(messageDate, "week")) {
		return messageDate.format("dddd");
	}

	return messageDate.format("MM/DD/YYYY");
};

// export const convertToISODate = (dateStr) => {
// 	return momentTimeZone(dateStr, "MM/DD/YYYY")
// 		.tz(US_TIMEZONE)
// 		.startOf("day")
// 		.toDate();
// };

export const convertToISODate = (dateString) => {
	if (!dateString || typeof dateString !== "string") return new Date();

	const [month, day, year] = dateString.split("/");
	if (!month || !day || !year) return new Date();

	return new Date(`${year}-${month}-${day}T00:00:00`);
};

export const getFileType = (url) => {
	const extension = url?.split(".").pop().toLowerCase();

	if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(extension)) {
		return "image";
	} else if (extension === "pdf") {
		return "pdf";
	} else {
		return "unknown";
	}
};

export const moveLocalFileToDownloads = async (
	sourcePath,
	setIsDownloading
) => {
	const fileName = sourcePath.split("/").pop();
	const destPath = `${
		Platform.OS === "android"
			? RNFS.DownloadDirectoryPath
			: RNFS.DocumentDirectoryPath
	}/${fileName}`;

	setIsDownloading(true);

	try {
		await RNFS.copyFile(sourcePath, destPath);

		if (Platform.OS === "android") {
			await RNFS.scanFile(destPath);
			ToastAndroid.show("Image Saved to Downloads!", ToastAndroid.LONG);
		} else {
			await CameraRoll.save(destPath, { type: "photo" });
			Alert.alert("Image Saved!");
		}
	} catch (error) {
		if (Platform.OS === "android") {
			ToastAndroid.show(`Failed: ${error.message}`, ToastAndroid.LONG);
		} else {
			Alert.alert(`Failed \n${error.message}`);
		}
	} finally {
		setIsDownloading(false);
	}
};

export const downloadImage = async (
	url,
	setIsDownloading,
	setDownloadProgress
) => {
	const fileName = generateUniqueId();
	const downloadPath = `${
		Platform.OS === "android"
			? RNFS.DownloadDirectoryPath
			: RNFS.DocumentDirectoryPath
	}/${fileName}.jpg`;

	setIsDownloading(true);
	setDownloadProgress(0);

	try {
		const options = {
			fromUrl: url,
			toFile: downloadPath,
			progress: (res) => {
				const progress = (res.bytesWritten / res.contentLength) * 100;
				setDownloadProgress(progress.toFixed(0));
			},
			progressDivider: 1,
		};

		const result = await RNFS.downloadFile(options).promise;
		if (result.statusCode === 200) {
			setDownloadProgress(100);
			await new Promise((resolve) => setTimeout(resolve, 300));

			if (Platform.OS === "android") {
				await RNFS.scanFile(downloadPath);
				ToastAndroid.showWithGravity(
					"Image Downloaded Successfully!",
					ToastAndroid.LONG,
					ToastAndroid.CENTER
				);
			} else {
				await CameraRoll.save(downloadPath, { type: "photo" });
				Alert.alert("Image Downloaded Successfully!");
			}
		} else {
			if (Platform.OS === "android") {
				ToastAndroid.showWithGravity(
					"Image Download Failed!",
					ToastAndroid.LONG,
					ToastAndroid.CENTER
				);
			} else {
				Alert.alert("Image Download Failed!");
			}
		}
	} catch (error) {
		if (Platform.OS === "android") {
			ToastAndroid.showWithGravity(
				`Download Failed: ${error.message}`,
				ToastAndroid.LONG,
				ToastAndroid.CENTER
			);
		} else {
			Alert.alert(`Download Failed \n ${error.message}`);
		}
	} finally {
		setIsDownloading(false);
	}
};

export const getLocationPermissionStatus = async () => {
	const locationPermission =
		Platform.OS === "ios"
			? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
			: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

	try {
		const permissionResult = await check(locationPermission);

		switch (permissionResult) {
			case RESULTS.GRANTED:
				return { label: "GRANTED", showPopup: false };

			case RESULTS.DENIED:
				const requestResult = await request(locationPermission);
				if (requestResult === RESULTS.GRANTED) {
					return { label: "GRANTED", showPopup: false };
				} else {
					return { label: "DENIED", showPopup: true };
				}

			case RESULTS.BLOCKED:
				return { label: "BLOCKED", showPopup: true };

			case RESULTS.UNAVAILABLE:
				return { label: "UNAVAILABLE", showPopup: false };

			case RESULTS.RESTRICTED:
				return { label: "RESTRICTED", showPopup: true };

			default:
				return { label: "UNKNOWN", showPopup: true };
		}
	} catch (error) {
		console.error("Error checking location permission:", error);
		return { label: "ERROR", showPopup: true };
	}
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
	const toRad = (value) => (value * Math.PI) / 180;
	const R = 6371; // Radius of the Earth in km
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) *
			Math.cos(toRad(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const distance = R * c * 1000; // Convert km to meters
	return distance; // Distance in meters
};

export const getDistanceInMeters = (coord1, coord2) => {
	const toRad = (value) => (value * Math.PI) / 180;

	const R = 6371e3;
	const lat1 = toRad(coord1.latitude);
	const lat2 = toRad(coord2.latitude);
	const dLat = toRad(coord2.latitude - coord1.latitude);
	const dLon = toRad(coord2.longitude - coord1.longitude);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
};

export const getFileNameFromPath = (filePath) =>
	filePath.substring(filePath.lastIndexOf("/") + 1);

export const formatMessageDate = (date) => {
	let parsedDate;

	if (typeof date === "string") {
		parsedDate = parseISO(date);
	} else if (typeof date === "number") {
		parsedDate = new Date(date);
	} else {
		throw new Error("Invalid date format");
	}

	return format(parsedDate, "yyyy-MM-dd");
};

export const getFriendlyDate = (date) => {
	let parsedDate;

	if (typeof date === "string") {
		parsedDate = parseISO(date);
	} else if (typeof date === "number") {
		parsedDate = new Date(date);
	} else {
		throw new Error("Invalid date format");
	}

	if (isToday(parsedDate)) {
		return "Today";
	} else if (isYesterday(parsedDate)) {
		return "Yesterday";
	} else {
		return format(parsedDate, "dd MMM yyyy");
	}
};

export const hiddenFields = [
	"incident_type_id",
	"incident_name",
	"incident_date",
	"incident_time",
	"state",
	"state_id",
	"vehicle",
	"vehicle_id",
	"driver_name",
	// "other_info",
	"photo",
	"damage_area",
	"deleted_image_id",
	"incident_id",
	"type",
];

export const formatKeyToWord = (key) => {
	return key
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

export const removeEmojis = (input) => {
	// return input.replace(/\p{Emoji}/gu, "");
	// return input.replace(
	// 	/([\u2700-\u27BF]|[\uE000-\uF8FF]|\u24C2|[\uD83C-\uDBFF\uDC00-\uDFFF])/g,
	// 	""
	// );
	const regex = emojiRegex();
	return input.replace(regex, "");
};

export const checkCameraPermission = async () => {
	const cameraPermission =
		Platform.OS === "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;

	let permissionStatus = await check(cameraPermission);

	if (permissionStatus === RESULTS.DENIED) {
		// Request permission
		permissionStatus = await request(cameraPermission);
	}

	if (permissionStatus === RESULTS.GRANTED) {
		return true;
	}

	if (
		permissionStatus === RESULTS.BLOCKED ||
		permissionStatus === RESULTS.DENIED
	) {
		Alert.alert(
			"Permission Required",
			"You have blocked camera access. Please enable it in settings to proceed.",
			[
				{ text: "Cancel", style: "cancel" },
				{ text: "Open Settings", onPress: () => Linking.openSettings() },
			]
		);
	}

	return false;
};

export const copyToClipboard = (text) => {
	Clipboard.setString(text);
};

const hapticOptions = {
	enableVibrateFallback: true,
	ignoreAndroidSystemSettings: false,
};

export const hapticVibrate = () => {
	trigger("impactMedium", hapticOptions);
};

export const storeNotification = async (senderId, notificationId) => {
	try {
		const storedData = await AsyncStorage.getItem("notificationStore");
		const notificationStore = storedData ? JSON.parse(storedData) : {};

		notificationStore[senderId] = notificationId;

		await AsyncStorage.setItem(
			"notificationStore",
			JSON.stringify(notificationStore)
		);
	} catch (error) {
		console.error("Error storing notification:", error);
	}
};

export const setCurrentChatUser = async (userId) => {
	await AsyncStorage.setItem("currentChatUserId", userId.toString());
};

export const getCurrentChatUser = async () => {
	const userId = await AsyncStorage.getItem("currentChatUserId");
	return userId;
};

function getUrlExtension(url) {
	return url.split(/[#?]/)[0].split(".").pop().trim();
}

export const openFileByThirdPartyApp = async (file) => {
	let localFile = "";

	if (file.base64) {
		const fileName = file.name || "temp_file.pdf";
		localFile = `${RNFS.DocumentDirectoryPath}/${fileName}`;

		await RNFS.writeFile(localFile, file.base64, "base64")
			.then(() => {})
			.catch((err) => console.warn("Error writing Base64 file: ", err));
	} else if (file.file_url || file.uri) {
		const url = file.file_url ? file.file_url : file.uri;
		const fileName = file?.file_name ? file?.file_name : file?.name;

		const extension = getUrlExtension(url) || "pdf";
		localFile = `${RNFS.DocumentDirectoryPath}/${fileName}.${extension}`;

		const options = {
			fromUrl: url,
			toFile: localFile,
		};

		await RNFS.downloadFile(options).promise.catch((error) => {
			console.warn("Error downloading file: ", error);
		});
	}

	FileViewer.open(localFile)
		.then(() => {})
		.catch((error) => console.warn("Error while opening file: ", error));
};

export const getHashCode = async () => {
	try {
		const hashArray = await getHash(); // getHash returns a promise
		return hashArray?.[0] || ""; // Return the first hash code as a string
	} catch (error) {
		console.warn("Hash Code Error: ", error);
		return ""; // Return an empty string to prevent errors
	}
};

export const truncateText = (text, maxLength) => {
	return text?.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
};

export const compressImage = async (image) => {
	try {
		const compressedUri = await Image.compress(image.uri, {
			maxWidth: 800,
			maxHeight: 800,
			quality: 0.8,
		});
		return { ...image, uri: compressedUri };
	} catch (error) {
		console.warn("Image compression error: ", error);
		return image;
	}
};

export const formatTime = (seconds) => {
	if (seconds < 60) return `${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
};

export const getStartDetails = async (originLat, originLng, destination) => {
	try {
		const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${
			destination.lat || destination.latitude
		},${destination.lng || destination.longitude}&key=${GOOGLE_MAPS_APIKEY}`;

		const response = await axios.get(url);

		if (response.data.routes.length > 0) {
			const route = response.data.routes[0].legs[0];

			const distanceInMiles = route.distance.value / 1609.34;
			const estimatedTimeInSeconds = route.duration.value;
			const arrivalTimestamp = new Date(
				Date.now() + estimatedTimeInSeconds * 1000
			);

			const year = arrivalTimestamp.getFullYear();
			const month = String(arrivalTimestamp.getMonth() + 1).padStart(2, "0");
			const day = String(arrivalTimestamp.getDate()).padStart(2, "0");
			const hours = String(arrivalTimestamp.getHours()).padStart(2, "0");
			const minutes = String(arrivalTimestamp.getMinutes()).padStart(2, "0");
			const seconds = String(arrivalTimestamp.getSeconds()).padStart(2, "0");

			const formattedArrivalTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

			return {
				distance: distanceInMiles.toFixed(2),
				estimatedTime: estimatedTimeInSeconds,
				formattedArrivalTime,
			};
		} else {
			console.warn("No route found");
			return null;
		}
	} catch (error) {
		console.error("Error fetching route details:", error);
		return null;
	}
};

export const calculateDrivingScore = async ({
	trackTime,
	idleTime,
	holdSpeedTime,
	breakdownTime,
	raceSpeedTime,
}) => {
	if (trackTime === 0) return 0;

	const W1 = 0.1,
		W2 = 0.15,
		W3 = 0.25,
		W4 = 0.5;

	const score =
		100 -
		(W1 * (idleTime / trackTime) +
			W2 * (holdSpeedTime / trackTime) +
			W3 * (breakdownTime / trackTime) +
			W4 * (raceSpeedTime / trackTime)) *
			100;

	return Math.max(0, Math.min(score, 100));
};

export const getCityStateCountryByAddress = async (
	latitude,
	longitude,
	address
) => {
	try {
		const response = await fetch(
			`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
				address
			)}&key=${GOOGLE_MAPS_APIKEY}`
		);
		const data = await response.json();

		if (data.status === "OK") {
			const addressComponents = data.results[0].address_components;

			let city = "";
			let state = "";
			let country = "";
			let zipCode = "";
			let formattedAddress = data.results[0].formatted_address;

			const addressParts = formattedAddress.split(", ");

			if (addressParts.length > 3) {
				formattedAddress = addressParts
					.slice(0, addressParts.length - 3)
					.join(", ");
			}

			for (let component of addressComponents) {
				if (component.types.includes("locality")) {
					city = component.long_name;
				}
				if (component.types.includes("administrative_area_level_1")) {
					state = component.long_name;
				}
				if (component.types.includes("country")) {
					country = component.long_name;
				}
				if (component.types.includes("postal_code")) {
					zipCode = component.long_name;
				}
			}
			return {
				localAddress: formattedAddress,
				city1: city,
				state1: state,
				country1: country,
				zipCode1: zipCode,
			};
		} else {
			throw new Error("Geocoding failed");
		}
	} catch (error) {
		console.error("Error getting address from lat/lng:", error);
		return {};
	}
};

export const getCityStateCountry = async (latitude, longitude, address) => {
	try {
		const response = await fetch(
			`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_APIKEY}`
		);
		const data = await response.json();

		if (data.status === "OK") {
			const addressComponents = data.results[0].address_components;

			let city = "";
			let state = "";
			let country = "";
			let zipCode = "";
			let formattedAddress = data.results[0].formatted_address;

			const addressParts = formattedAddress.split(", ");

			if (addressParts.length > 3) {
				formattedAddress = addressParts
					.slice(0, addressParts.length - 3)
					.join(", ");
			}

			for (let component of addressComponents) {
				if (component.types.includes("locality")) {
					city = component.long_name;
				}
				if (component.types.includes("administrative_area_level_1")) {
					state = component.long_name;
				}
				if (component.types.includes("country")) {
					country = component.long_name;
				}
				if (component.types.includes("postal_code")) {
					zipCode = component.long_name;
				}
			}
			return {
				localAddress: formattedAddress,
				city1: city,
				state1: state,
				country1: country,
				zipCode1: zipCode,
			};
		} else {
			throw new Error("Geocoding failed");
		}
	} catch (error) {
		console.error("Error getting address from lat/lng:", error);
		return {};
	}
};

export const incrementDailyAppOpenCount = async () => {
	const today = new Date().toISOString().split("T")[0];
	const stored = await AsyncStorage.getItem("dailyOpenCount");

	let count = 1;
	let saveData = { date: today, count: 1 };

	if (stored) {
		const parsed = JSON.parse(stored);
		if (parsed.date === today) {
			count = parsed.count + 1;
			saveData = { date: today, count };
		}
	}

	await AsyncStorage.setItem("dailyOpenCount", JSON.stringify(saveData));
};

export const calculateSpeedImprovement = async ({
	estimatedTime,
	distance,
	trackTime,
}) => {
	const parsedDistance = parseFloat(distance);
	const parsedEstimatedTime = parseFloat(estimatedTime);
	const parsedTrackTime = parseFloat(trackTime);

	if (
		!parsedDistance ||
		parsedDistance <= 0 ||
		!parsedEstimatedTime ||
		parsedEstimatedTime <= 0 ||
		!parsedTrackTime ||
		parsedTrackTime <= 0
	) {
		return {
			actualSpeed: 0,
			estimatedSpeed: 0,
			speedImprovement: 0,
			netDrivingTime: 0,
		};
	}

	// convert to miles per hour
	const actualSpeed = (parsedDistance / parsedTrackTime) * 3600;
	const estimatedSpeed = (parsedDistance / parsedEstimatedTime) * 3600;

	//speed improvement
	let speedImprovement =
		((actualSpeed - estimatedSpeed) / estimatedSpeed) * 100;
	speedImprovement = Math.max(0, Math.min(100, speedImprovement));

	return {
		actualSpeed: actualSpeed.toFixed(0),
		estimatedSpeed: estimatedSpeed.toFixed(0),
		speedImprovement: speedImprovement.toFixed(0),
		netDrivingTime: formatTime(parsedTrackTime),
	};
};

export const getSuggestions = async (improvementPoints, scoreData) => {
	const actualSpeed = parseInt(improvementPoints?.actualSpeed) || 0;
	const estimatedSpeed = parseInt(improvementPoints?.estimatedSpeed) || 0;
	const improvement = parseInt(improvementPoints?.speedImprovement) || 0;

	const {
		trackTime = 0,
		idleTime = 0,
		holdSpeedTime = 0,
		breakdownTime = 0,
		raceSpeedTime = 0,
	} = scoreData || {};

	const score = await calculateDrivingScore(scoreData);
	const lostPoints = 100 - parseFloat(score);

	const W1 = 0.1, // idleTime
		W2 = 0.15, // holdSpeedTime
		W3 = 0.25, // breakdownTime
		W4 = 0.5; // raceSpeedTime

	// Calculate score loss percentage from each factor
	const idleLoss = Math.round(W1 * lostPoints);
	const holdLoss = Math.round(W2 * lostPoints);
	const breakdownLoss = Math.round(W3 * lostPoints);
	const raceLoss = Math.round(W4 * lostPoints);

	const suggestions = [];

	// 1. Speed & Time Suggestion (arrival speed vs estimated speed)
	if (actualSpeed < estimatedSpeed - 10) {
		suggestions.push({
			title: "Manage Time",
			description:
				"You arrived later than expected. Try to maintain route timing unless impacted by safety or road conditions.",
			percentage: improvement,
		});
	} else if (improvement >= 75) {
		suggestions.push({
			title: "Speed",
			description:
				"You reached too fast. Ensure you are not over-speeding or skipping necessary checks.",
			percentage: improvement,
		});
	} else if (improvement >= 50) {
		suggestions.push({
			title: "Speed",
			description:
				"Nice improvement. Just make sure it stays within safe driving limits.",
			percentage: improvement,
		});
	} else {
		suggestions.push({
			title: "Speed",
			description:
				"You're close to the estimated time. Very consistent performance!",
			percentage: improvement,
		});
	}

	// 2. Fuel Efficiency (race speed)
	if (raceSpeedTime > 0) {
		suggestions.push({
			title: "Fuel Efficiency",
			description:
				"High speeds and race behavior can reduce fuel efficiency. Try to drive at a moderate and steady pace.",
			percentage: raceLoss,
		});
	} else {
		suggestions.push({
			title: "Fuel Efficiency",
			description:
				"Your consistent driving pace helps improve fuel efficiency. Keep it up!",
			percentage: 0,
		});
	}

	// 3. Idle Time
	if (idleTime / trackTime > 0.1) {
		suggestions.push({
			title: "Idle Time",
			description:
				"You had long idle periods. Try to turn off the engine when stationary for extended durations.",
			percentage: idleLoss,
		});
	}

	// 4. Hold Speed Time
	if (holdSpeedTime / trackTime > 0.2) {
		suggestions.push({
			title: "Constant Speed",
			description:
				"Holding speed for too long may indicate lack of responsiveness. Try adapting speed to traffic flow.",
			percentage: holdLoss,
		});
	}

	// 5. Vehicle Health
	if (breakdownTime / trackTime > 0.05) {
		suggestions.push({
			title: "Maintenance Required",
			description:
				"Frequent breakdowns detected. Please ensure regular vehicle maintenance checks.",
			percentage: breakdownLoss,
		});
	}

	// 6. Overall Driving Performance
	if (score >= 90) {
		suggestions.push({
			title: "Performance",
			description: "Excellent driving performance. Keep up the great work!",
			percentage: Math.round(score),
		});
	} else if (score >= 70) {
		suggestions.push({
			title: "Performance",
			description:
				"Good job! A few small improvements could make it even better.",
			percentage: Math.round(score),
		});
	} else {
		suggestions.push({
			title: "Performance",
			description:
				"There is room for improvement. Focus on reducing idle, racing, and breakdown time.",
			percentage: Math.round(score),
		});
	}

	return suggestions;
};

export const fileTypesAndroid = [
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const fileTypesIOS = [
	"public.content",
	"public.data",
	"com.adobe.pdf",
	"com.microsoft.word.doc",
	"org.openxmlformats.wordprocessingml.document",
	"com.microsoft.excel.xls",
	"org.openxmlformats.spreadsheetml.sheet",
];

export const InviteMessage = (name, appUrl) => {
	if (!name || !appUrl) return null;

	const firstName = name.split(" ")[0];
	const message = `Hey ${firstName}, you’ve been invited to join the Retyrn app — your all-in-one hub to track and manage returns with ease.\nTap to get started: ${appUrl}`;

	return message;
};

export const moveAndRenameFile = async (uri, newName) => {
	try {
		const decodedURI = decodeURIComponent(uri.replace("file://", ""));
		const newPath = `${RNFS.DocumentDirectoryPath}/${newName}`;

		const exists = await RNFS.exists(decodedURI);
		if (!exists) {
			console.log("File does not exist at:", decodedURI);
			return null;
		}

		await RNFS.copyFile(decodedURI, newPath);
		return `file://${newPath}`;
	} catch (error) {
		console.error("File move error:", error);
		return null;
	}
};

export const getTruckKeyFromSide = (sideKey) => {
	switch (sideKey) {
		case "Top":
			return "truckTop";
		case "Middle Left":
			return "truckMiddleLeft";
		case "Middle Right":
			return "truckMiddleRight";
		case "Front":
			return "truckFront";
		case "Front Left":
			return "truckFrontLeft";
		case "Front Right":
			return "truckFrontRight";
		case "Back":
			return "truckBack";
		case "Back Left":
			return "truckBackLeft";
		case "Back Right":
			return "truckBackRight";
		default:
			return null;
	}
};

export const fetchSuggestions = async (
	text,
	setLoading,
	setSearchText,
	setSuggestions,
	currentLocation,
	selectedId,
	selectedType
) => {
	setLoading(true);
	setSearchText(text);
	try {
		const res = await fetch(
			`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
				text
			)}&key=${GOOGLE_MAPS_APIKEY}`
		);
		const json = await res.json();
		const predictions = json.predictions || [];

		const enriched = await Promise.all(
			predictions.map(async (place) => {
				try {
					const detailsRes = await fetch(
						`https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=geometry,address_components,photos&key=${GOOGLE_MAPS_APIKEY}`
					);

					const detailsJson = await detailsRes.json();
					const details = detailsJson.result || {};

					const location = details.geometry?.location || {};
					const addressComponents = details.address_components || [];
					const photos = details.photos || [];

					const destiData = {
						latitude: parseFloat(location?.lat),
						longitude: parseFloat(location?.lng),
					};

					let city = "";
					let state = "";
					let stateCode = "";

					if (addressComponents.length) {
						const cityComp =
							addressComponents.find((comp) =>
								comp.types.includes("locality")
							) ||
							addressComponents.find((comp) =>
								comp.types.includes("administrative_area_level_2")
							) ||
							addressComponents.find((comp) =>
								comp.types.includes("sublocality")
							);
						city = cityComp?.long_name || "";

						const stateComp = addressComponents.find((comp) =>
							comp.types.includes("administrative_area_level_1")
						);
						state = stateComp?.long_name || "";
						stateCode = stateComp?.short_name || "";
					}

					let distanceMiles = null;
					let durationETA = "";
					if (currentLocation?.latitude && currentLocation?.longitude) {
						const originString = `${currentLocation.latitude},${currentLocation.longitude}`;
						const destinationString = `${destiData.latitude},${destiData.longitude}`;

						try {
							const { distance, duration } = await fetchDistanceAndDuration(
								originString,
								destinationString
							);
							distanceMiles = distance * 0.000621371;
							durationETA = duration;
						} catch (err) {
							console.warn("Distance/Duration fetch failed:", err);
						}
					}

					const photoUrls = photos.map((photo) => {
						return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${GOOGLE_MAPS_APIKEY}`;
					});

					let id = selectedId || "";
					let type = selectedType || "";

					return {
						...place,
						coords: destiData,
						address_components: addressComponents,
						photos: photoUrls,
						city,
						state,
						stateCode,
						distanceMiles,
						durationETA,
						id,
						type,
					};
				} catch (err) {
					console.warn("Error in enrich map: ", err);
					return place;
				}
			})
		);

		setSuggestions(enriched);
	} catch (error) {
		console.error("Autocomplete fetch error:", error);
	}
	setLoading(false);
};

export const generateUniqueId = () => {
	return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const getShortLocationName = async (text) => {
	try {
		const res = await fetch(
			`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
				text
			)}&key=${GOOGLE_MAPS_APIKEY}`
		);
		const json = await res.json();
		const predictions = json.predictions || [];

		const shortNames = predictions.map((prediction) => ({
			mainText: prediction.structured_formatting?.main_text,
			fullText: prediction.description,
			place_id: prediction.place_id,
		}));

		return shortNames;
	} catch (error) {
		console.error("Autocomplete error:", error);
	}
};

export const getNearbyPlaces = async (
	type,
	currentLocation,
	setIsLoadingNearBy,
	keyword = ""
) => {
	try {
		setIsLoadingNearBy(true);
		const nearbyResponse = await axios.get(
			"https://maps.googleapis.com/maps/api/place/nearbysearch/json",
			{
				params: {
					location: `${currentLocation.latitude},${currentLocation.longitude}`,
					radius: 3000,
					type,
					keyword,
					key: GOOGLE_MAPS_APIKEY,
				},
			}
		);

		const stations = nearbyResponse.data.results.slice(0, 10);

		if (!stations.length) return [];

		const destinations = stations
			.map(
				(place) =>
					`${place.geometry.location.lat},${place.geometry.location.lng}`
			)
			.join("|");

		const distanceResponse = await axios.get(
			`https://maps.googleapis.com/maps/api/distancematrix/json`,
			{
				params: {
					origins: `${currentLocation?.latitude},${currentLocation?.longitude}`,
					destinations,
					key: GOOGLE_MAPS_APIKEY,
				},
			}
		);

		const distanceData = distanceResponse.data.rows[0].elements;

		const metersToMiles = (meters) => (meters / 1609.344).toFixed(2);

		const combined = stations.map((place, index) => {
			const element = distanceData[index];
			return {
				place_id: place.place_id,
				name: place.name,
				address: place.vicinity,
				latitude: place.geometry.location.lat,
				longitude: place.geometry.location.lng,
				distance: `${metersToMiles(element.distance.value)} mi`,
				duration: element.duration.text,
				distanceValue: element.distance.value,
			};
		});
		setIsLoadingNearBy(false);
		return combined;
	} catch (err) {
		console.error("Error fetching petrol pumps: ", err);
		setIsLoadingNearBy(false);
		return [];
	}
};

export const fetchPlaceDetail = async (placeId, currentLocation) => {
	if (!placeId) return;
	try {
		const res = await fetch(
			`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,address_components,geometry,types,photos,formatted_phone_number,website&key=${GOOGLE_MAPS_APIKEY}`
		);

		const detailsJson = await res.json();
		const details = detailsJson.result || {};

		const location = details.geometry?.location || {};
		const addressComponents = details.address_components || [];
		const photos = details.photos || [];
		const phoneNumber = details?.formatted_phone_number || "";
		const website = details?.website || "";

		let city = "";
		let state = "";
		let stateCode = "";

		if (addressComponents.length) {
			const cityComp =
				addressComponents.find((comp) => comp.types.includes("locality")) ||
				addressComponents.find((comp) =>
					comp.types.includes("administrative_area_level_2")
				) ||
				addressComponents.find((comp) => comp.types.includes("sublocality"));
			city = cityComp?.long_name || "";

			const stateComp = addressComponents.find((comp) =>
				comp.types.includes("administrative_area_level_1")
			);
			state = stateComp?.long_name || "";
			stateCode = stateComp?.short_name || "";

			if (city) city = city.charAt(0).toLowerCase() + city.slice(1);
			if (state) state = state.charAt(0).toLowerCase() + state.slice(1);
		}

		const originData = {
			latitude: parseFloat(currentLocation?.latitude),
			longitude: parseFloat(currentLocation?.longitude),
		};

		const destiData = {
			latitude: parseFloat(location?.lat),
			longitude: parseFloat(location?.lng),
		};

		const originString = convertLatLongToString(originData);
		const destinationString = convertLatLongToString(destiData);

		let distanceMiles = null;
		let durationETA = "";
		if (currentLocation) {
			const { distance, duration } = await fetchDistanceAndDuration(
				originString,
				destinationString
			);

			distanceMiles = distance * 0.000621371;
			durationETA = duration;
		}

		const photoUrls = photos.map((photo) => {
			return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${GOOGLE_MAPS_APIKEY}`;
		});

		return {
			place_id: placeId,
			main_text: details?.name || "",
			secondary_text: details?.formatted_address || "",
			address_components: details?.address_components || [],
			type: details?.types || [],
			coords: destiData,
			distanceMiles,
			durationETA,
			city,
			state,
			stateCode,
			photos: photoUrls,
			phoneNumber,
			website,
		};
	} catch (error) {
		console.error("Error fetching place detail:", error);
		setLoading(false);
	}
};

export const getFormattedAddress = async (addressComponents, addressF) => {
	let city = "";
	let state = "";
	let country = "";
	let zipCode = "";
	let formattedAddress = addressF;

	const addressParts = formattedAddress.split(", ");

	if (addressParts.length > 3) {
		formattedAddress = addressParts
			.slice(0, addressParts.length - 3)
			.join(", ");
	}

	for (let component of addressComponents) {
		if (component.types.includes("locality")) {
			city = component.long_name;
		}
		if (component.types.includes("administrative_area_level_1")) {
			state = component.long_name;
		}
		if (component.types.includes("country")) {
			country = component.long_name;
		}
		if (component.types.includes("postal_code")) {
			zipCode = component.long_name;
		}
	}
	return {
		localAddress: formattedAddress,
		city,
		state,
		country,
		zipCode,
	};
};

export const getPlaceDetail = async (text, currentLocation) => {
	try {
		const res = await fetch(
			`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_MAPS_APIKEY}`
		);
		const json = await res.json();
		const predictions = json.predictions || [];

		const enriched = await Promise.all(
			predictions.map(async (place) => {
				try {
					const detailsRes = await fetch(
						`https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=geometry,address_components,photos,formatted_phone_number,website&key=${GOOGLE_MAPS_APIKEY}`
					);
					const detailsJson = await detailsRes.json();
					const location = detailsJson.result.geometry.location;
					const addressComponents = detailsJson.result.address_components;
					const photos = detailsJson.result.photos || [];

					const destiData = {
						latitude: parseFloat(location?.lat),
						longitude: parseFloat(location?.lng),
					};
					const phoneNumber = detailsJson.result?.formatted_phone_number || "";
					const website = detailsJson.result?.website || "";

					let city = "";
					let state = "";
					let stateCode = "";

					if (addressComponents?.length) {
						const cityComp =
							addressComponents.find((comp) =>
								comp.types.includes("locality")
							) ||
							addressComponents.find((comp) =>
								comp.types.includes("administrative_area_level_2")
							);
						city = cityComp?.long_name || "";

						const stateComp = addressComponents.find((comp) =>
							comp.types.includes("administrative_area_level_1")
						);
						state = stateComp?.long_name || "";
						stateCode = stateComp?.short_name || "";

						if (city) city = city.charAt(0).toLowerCase() + city.slice(1);
						if (state) state = state.charAt(0).toLowerCase() + state.slice(1);
					}

					let distanceMiles = null;
					let durationETA = "";
					if (currentLocation) {
						const originString = `${currentLocation.latitude},${currentLocation.longitude}`;
						const destinationString = `${destiData.latitude},${destiData.longitude}`;

						const { distance, duration } = await fetchDistanceAndDuration(
							originString,
							destinationString
						);
						distanceMiles = distance * 0.000621371;
						durationETA = duration;
					}

					const photoUrls = photos.map((photo) => {
						return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${GOOGLE_MAPS_APIKEY}`;
					});

					return {
						...place,
						coords: destiData,
						address_components: addressComponents,
						city,
						state,
						stateCode,
						photos: photoUrls,
						distanceMiles,
						durationETA,
						phoneNumber,
						website,
					};
				} catch (err) {
					console.warn("Error in enrich map: ", err);
					return place;
				}
			})
		);
		return enriched[0];
	} catch (error) {
		console.error("Autocomplete fetch error:", error);
	}
};

export const getPlaceDetailByLatLng = async (coords, currentLocation) => {
	try {
		const res = await fetch(
			`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords?.latitude},${coords?.longitude}&key=${GOOGLE_MAPS_APIKEY}`
		);
		const json = await res.json();
		const results = json.results || [];

		if (results.length === 0) {
			console.warn("No results found for given coordinates.");
			return null;
		}

		const place = results[0];

		const detailsRes = await fetch(
			`https://maps.googleapis.com/maps/api/place/details/json?place_id=${place?.place_id}&fields=geometry,address_components,photos,formatted_phone_number,website,types,formatted_address,name&key=${GOOGLE_MAPS_APIKEY}`
		);

		const detailsJson = await detailsRes.json();
		const location = detailsJson.result.geometry.location;
		const addressComponents = detailsJson.result.address_components;
		const photos = detailsJson.result.photos || [];

		const destiData = {
			latitude: parseFloat(location?.lat),
			longitude: parseFloat(location?.lng),
		};
		const phoneNumber = detailsJson.result?.formatted_phone_number || "";
		const website = detailsJson.result?.website || "";

		let city = "";
		let state = "";
		let stateCode = "";

		if (addressComponents?.length) {
			const cityComp =
				addressComponents.find((comp) => comp.types.includes("locality")) ||
				addressComponents.find((comp) =>
					comp.types.includes("administrative_area_level_2")
				);
			city = cityComp?.long_name || "";

			const stateComp = addressComponents.find((comp) =>
				comp.types.includes("administrative_area_level_1")
			);
			state = stateComp?.long_name || "";
			stateCode = stateComp?.short_name || "";

			if (city) city = city.charAt(0).toLowerCase() + city.slice(1);
			if (state) state = state.charAt(0).toLowerCase() + state.slice(1);
		}

		let distanceMiles = null;
		let durationETA = "";
		if (currentLocation) {
			const originString = `${currentLocation.latitude},${currentLocation.longitude}`;
			const destinationString = `${destiData.latitude},${destiData.longitude}`;

			const { distance, duration } = await fetchDistanceAndDuration(
				originString,
				destinationString
			);
			distanceMiles = distance * 0.000621371;
			durationETA = duration;
		}

		const photoUrls = photos.map((photo) => {
			return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${GOOGLE_MAPS_APIKEY}`;
		});

		return {
			...place,
			place_id: place?.place_id,
			main_text: detailsJson?.result?.name || "",
			secondary_text: detailsJson?.result?.formatted_address || "",
			coords: destiData,
			address_components: addressComponents,
			city,
			state,
			stateCode,
			photos: photoUrls,
			distanceMiles,
			durationETA,
			phoneNumber,
			website,
			type: detailsJson?.result?.types || [],
		};
	} catch (error) {
		console.error("Error fetching place details:", error);
		return null;
	}
};

export const shareLocationURL = async (
	originLatitude,
	originLongitude,
	destinationLatitude,
	destinationLongitude,
	waypoints = [],
	setIsSharing
) => {
	setIsSharing(true);

	const waypointsString = waypoints
		.map((point) => `${point.latitude},${point.longitude}`)
		.join("|");

	const url = `https://www.google.com/maps/dir/?api=1&origin=${originLatitude},${originLongitude}&destination=${destinationLatitude},${destinationLongitude}${
		waypointsString ? `&waypoints=${waypointsString}` : ""
	}`;
	try {
		const response = await fetch(
			`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
		);
		const shortUrl = await response.text();
		setIsSharing(false);
		if (shortUrl) {
			const title = "Destination";
			const message = "Share Destination:";
			const icon = "data:<data_type>/<file_extension>;base64,<base64_data>";
			const options = Platform.select({
				ios: {
					activityItemSources: [
						{
							placeholderItem: {
								type: "text",
								content: message,
							},
							item: {
								default: {
									type: "text",
									content: shortUrl,
								},
								message: null,
							},
							linkMetadata: {
								title: title,
								icon: icon,
							},
						},
					],
				},
				default: {
					title,
					subject: title,
					message: `${shortUrl}`,
				},
			});
			Share.open(options).catch((err) => console.warn("Share Error: ", err));
		}
	} catch (error) {
		console.error("Error shortening URL: ", error);
	}
};

export const getStateKey = (stateName) => {
	if (!stateName) return "";
	return stateName
		.toLowerCase()
		.replace(/\s+/g, " ")
		.split(" ")
		.map((word, idx) =>
			idx === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
		)
		.join("");
};

export const getShortAddress = async (lat, lng) => {
	try {
		const response = await axios.get(
			"https://maps.googleapis.com/maps/api/geocode/json",
			{
				params: {
					latlng: `${lat},${lng}`,
					key: GOOGLE_MAPS_APIKEY,
				},
			}
		);

		if (response.data.results && response.data.results.length > 0) {
			const firstResult = response.data.results[0];
			const formattedAddress = firstResult.formatted_address;
			const placeId = firstResult.place_id || "";

			const parts = formattedAddress.split(",");
			const main_text = parts[0]?.trim() || "";
			const secondary_text = parts.slice(1).join(",").trim();

			return { main_text, secondary_text, place_id: placeId };
		}

		return { main_text: "", secondary_text: "", place_id: "" };
	} catch (error) {
		console.error("Error in reverse geocoding:", error);
		return { main_text: "", secondary_text: "", place_id: "" };
	}
};

export const generateGpxFile = async () => {
	try {
		if (!gpxResponse?.routes?.length) {
			console.warn("No routes found in directions response");
			return;
		}
		const steps = gpxResponse.routes[0].legs[0].steps;

		let gpx = `<?xml version="1.0" encoding="UTF-8"?>
				<gpx version="1.1" creator="Xcode">\n`;

		steps.forEach((step, index) => {
			const points = polyline.decode(step.polyline.points);
			points.forEach(([lat, lng], i) => {
				gpx += `  <wpt lat="${lat}" lon="${lng}"><name>Step-${index}-${i}</name></wpt>\n`;
			});
		});

		gpx += `</gpx>`;

		console.log(">>> gpx: ", gpx);
	} catch (error) {
		console.error("Error generating GPX file:", error);
	}
};

export const generateCircleDots = (
	start,
	end,
	dotSpacing = 0.0001,
	offset = 0.00005
) => {
	if (!start || !end) return [];

	const latDiff = end.latitude - start.latitude;
	const lngDiff = end.longitude - start.longitude;

	const distance = Math.hypot(latDiff, lngDiff);
	if (distance <= 2 * offset) return [];

	const startFraction = offset / distance;
	const endFraction = 1 - offset / distance;

	const numDots = Math.floor((distance - 2 * offset) / dotSpacing);
	const dots = [];

	for (let i = 0; i <= numDots; i++) {
		const fraction =
			startFraction + ((endFraction - startFraction) * i) / numDots;
		dots.push({
			latitude: start.latitude + latDiff * fraction,
			longitude: start.longitude + lngDiff * fraction,
		});
	}

	return dots;
};

export const formatJoiningDuration = (joining_date) => {
	const joinDate = new Date(joining_date);
	const now = new Date();

	let years = now.getFullYear() - joinDate.getFullYear();
	let months = now.getMonth() - joinDate.getMonth();
	let days = now.getDate() - joinDate.getDate();

	if (days < 0) {
		months -= 1;
		const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
		days += prevMonth.getDate();
	}

	if (months < 0) {
		years -= 1;
		months += 12;
	}

	let result = "";
	if (years > 0) result += `${years} year${years > 1 ? "s" : ""} `;
	if (months > 0) result += `${months} month${months > 1 ? "s" : ""} `;
	if (days > 0 || result === "") result += `${days} day${days > 1 ? "s" : ""}`;

	return result.trim();
};
