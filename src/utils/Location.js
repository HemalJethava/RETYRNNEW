import { showMessage } from "react-native-flash-message";
import { PermissionsAndroid, Platform } from "react-native";
import Geolocation from "react-native-geolocation-service";
import { fetchLocationName } from "../config/CommonFunctions";

export const getCurrentLocation = () =>
	new Promise((resolve, reject) => {
		Geolocation.getCurrentPosition(
			async (position) => {
				const locationName =
					position.coords.latitude && position.coords.longitude
						? await fetchLocationName(
								position.coords.latitude,
								position.coords.longitude
						  )
						: "No location";

				const coords = {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					heading: position.coords.heading,
					locationName: locationName,
				};
				resolve(coords);
			},
			(error) => {
				console.warn("Location error", error);
				reject(error.message);
			},
			{ enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
		);
	});

export const locationPermission = () =>
	new Promise(async (resolve, reject) => {
		if (Platform.OS === "ios") {
			try {
				const permissionStatus = await Geolocation.requestAuthorization(
					"whenInUse"
				);
				if (permissionStatus === "granted") {
					return resolve("granted");
				}
				reject("Permission not granted");
			} catch (error) {
				return reject(error);
			}
		}
		return PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
		)
			.then((granted) => {
				if (granted === PermissionsAndroid.RESULTS.GRANTED) {
					resolve("granted");
				}
				return reject("Location Permission denied");
			})
			.catch((error) => {
				console.log("Ask Location permission error: ", error);
				return reject(error);
			});
	});

const showError = (message) => {
	showMessage({
		message,
		type: "danger",
		icon: "danger",
		duration: 3000,
		statusBarHeight: 40,
	});
};

const showSuccess = (message) => {
	showMessage({
		message,
		type: "success",
		icon: "success",
		statusBarHeight: 40,
	});
};

export { showError, showSuccess };
