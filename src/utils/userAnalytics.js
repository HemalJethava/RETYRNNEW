// userAnalytics.js
import { useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { useSelector } from "react-redux";
import Echo from "laravel-echo";
import Pusher from "pusher-js/react-native";
import { getCurrentLocation, locationPermission } from "./Location";
import {
	getCityStateCountry,
	incrementDailyAppOpenCount,
} from "../config/CommonFunctions";
import { getDeviceId } from "react-native-device-info";

import {
	REVERB_APP_KEY,
	REVERB_ENDPOINT,
	REVERB_HOST,
	REVERB_PORT,
	REVERB_SCHEME,
} from "../config/BaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useUserAnalytics = () => {
	const userData = useSelector((state) => state.Auth.userData);
	const echoRef = useRef(null);
	const [appState, setAppState] = useState(AppState.currentState);
	const [userDetails, setUserDetails] = useState(null);

	const formatStartTime = () => {
		const now = Date.now();
		const date = new Date(now);

		const pad = (n) => n.toString().padStart(2, "0");

		const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
			date.getDate()
		)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
			date.getSeconds()
		)}`;

		return formatted;
	};

	const getUserAnalyticsData = async () => {
		try {
			await incrementDailyAppOpenCount();

			const dailyData = await AsyncStorage.getItem("dailyOpenCount");
			const dailyParsed = dailyData ? JSON.parse(dailyData) : { count: 1 };

			const hasPermission = await locationPermission();

			if (hasPermission) {
				const { latitude, longitude, locationName } =
					await getCurrentLocation();
				const { zipCode1, city1, state1, country1 } = await getCityStateCountry(
					latitude,
					longitude
				);

				const deviceUniqueId = await getDeviceId();
				const devicePlatform = Platform.OS === "android" ? "android" : "ios";

				return {
					locationName,
					zipCode1,
					city1,
					state1,
					country1,
					deviceUniqueId,
					devicePlatform,
					startTime: formatStartTime(),
					timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
					daily_open_count: dailyParsed.count || 1,
				};
			}
		} catch (error) {
			console.warn("getUserAnalyticsData error:", error);
			return null;
		}
	};

	const initializeEcho = () => {
		if (!userData?.id || !global.userToken || !userDetails) return;

		console.log("userDetails: ", userDetails);

		// Pusher.logToConsole = true;

		const pusherClient = new Pusher(REVERB_APP_KEY, {
			wsHost: REVERB_HOST,
			wsPort: REVERB_PORT,
			forceTLS: REVERB_SCHEME === "https",
			enabledTransports: ["ws", "wss"],
			cluster: "mt1",
			authorizer: (channel, options) => ({
				authorize: (socketId, callback) => {
					fetch(REVERB_ENDPOINT, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Accept: "application/json",
							Authorization: `Bearer ${global.userToken}`,
						},
						body: JSON.stringify({
							socket_id: socketId,
							channel_name: `private-user-info.${userData?.id}`,
							user_data: userDetails,
						}),
					})
						.then((response) => response.json())
						.then((data) => {
							callback(false, data);
						})
						.catch((error) => {
							console.error("Authorization failed:", error);
							callback(true, error);
						});
				},
			}),
		});

		const echo = new Echo({
			broadcaster: "reverb",
			client: pusherClient,
		});

		pusherClient.connection.bind("state_change", (states) => {
			console.log("-->+>->> User Analytics Connection <<-<+<--", states);
		});

		const privateChannel = echo.private(`user-info.${userData?.id}`);

		privateChannel.subscribed(() => {
			console.log("User Analytics Subscribed:", `user-info.${userData?.id}`);
		});

		echoRef.current = echo;
	};

	const cleanupEcho = () => {
		if (echoRef.current) {
			echoRef.current.disconnect();
			echoRef.current = null;
		}
	};

	const handleAppStateChange = (nextAppState) => {
		if (nextAppState.match(/inactive|background/)) {
			cleanupEcho();
		} else if (nextAppState === "active") {
			initializeEcho();
		}
		setAppState(nextAppState);
	};

	useEffect(() => {
		const fetchDetails = async () => {
			const details = await getUserAnalyticsData();
			setUserDetails(details);
		};
		fetchDetails();
	}, []);

	useEffect(() => {
		if (!userData?.id || !global.userToken) return;

		if (appState === "active") {
			initializeEcho();
		}

		const subscription = AppState.addEventListener(
			"change",
			handleAppStateChange
		);

		return () => {
			subscription.remove();
			cleanupEcho();
		};
	}, [userData?.id, userDetails]);

	return null;
};

export default useUserAnalytics;
