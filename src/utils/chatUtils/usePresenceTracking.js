import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Echo from "laravel-echo";
import Pusher from "pusher-js/react-native";
import Api from "../Api";
import { setChatUnreadCount } from "../../screens/chat/redux/Action";
import { getSharedPusherClient } from "./sharedPusherClient";

const AWAY_TIMEOUT = 2 * 60 * 1000;

// const AWAY_TIMEOUT = 25000;

const usePresenceTracking = () => {
	const dispatch = useDispatch();

	const userData = useSelector((state) => state.Auth.userData);
	const echoRef = useRef(null);
	const presenceChannelRef = useRef(null);
	const awayTimerRef = useRef(null);
	const isAwayRef = useRef(false);
	const isConnectedRef = useRef(false);

	const [appState, setAppState] = useState(AppState.currentState);

	const initializeEcho = () => {
		// Pusher.logToConsole = true;

		if (!userData?.id && !global.userToken) return;
		if (echoRef.current && presenceChannelRef.current) return;

		const pusherClient = getSharedPusherClient(`presence-user.${userData.id}`);

		const echo = new Echo({
			broadcaster: "reverb",
			client: pusherClient,
		});

		pusherClient.connection.bind("state_change", (states) => {
			console.log("-->+>->> Presence Status <<-<+<--", states);
			if (states.current === "connected") {
				isConnectedRef.current = true;
				sendStatus("online");
				startAwayTimer();
			} else if (
				states.current === "disconnected" ||
				states.current === "unavailable"
			) {
				isConnectedRef.current = false;
				clearAwayTimer();
			}
		});

		const presenceChannel = echo.join(`user.${userData.id}`);

		presenceChannel
			.here((users) => {
				console.log("Currently online:", users);
				dispatch(setChatUnreadCount(users[0]?.unread_count || 0));
			})
			.joining((user) => console.log("User joined:", user))
			.leaving((user) => console.log("User left:", user));

		echoRef.current = echo;
		presenceChannelRef.current = presenceChannel;

		echo
			.channel(`user.${userData?.id}`)
			.listen("GetUserNotificationCountEvent", (data) => {
				console.log(">>> Unread Event <<<", data);
				dispatch(setChatUnreadCount(data?.unread_message_count || 0));
			});
	};

	const sendStatus = async (status) => {
		if (!presenceChannelRef.current || !isConnectedRef.current) {
			return;
		}
		isAwayRef.current = status === "away";
		try {
			console.log(`>>> Send Presence Status >>> ${status}`);
			if (status === "offline") return false;
			await Api.post(`user/update-user-status`, { status });
		} catch (error) {
			console.warn("Presence Err: ", error);
		}
	};

	const startAwayTimer = () => {
		clearAwayTimer();
		awayTimerRef.current = setTimeout(() => {
			sendStatus("away");
		}, AWAY_TIMEOUT);
	};

	const clearAwayTimer = () => {
		if (awayTimerRef.current) {
			clearTimeout(awayTimerRef.current);
			awayTimerRef.current = null;
		}
	};

	const handleApiActivity = (request) => {
		if (
			request?.url === "user/app-terminated" ||
			request?.url === "user/update-user-status"
		) {
			return;
		}

		clearAwayTimer();

		if (isAwayRef.current) {
			sendStatus("online");
		}

		startAwayTimer();
	};

	const handleAppStateChange = (nextAppState) => {
		clearAwayTimer();

		if (nextAppState.match(/inactive|background/)) {
			sendStatus("offline");
			cleanupEcho();
		}

		if (nextAppState === "active") {
			initializeEcho();
		}

		setAppState(nextAppState);
	};

	const cleanupEcho = () => {
		if (echoRef.current && presenceChannelRef.current) {
			presenceChannelRef.current.unsubscribe();
			echoRef.current.disconnect();
			echoRef.current = null;
			presenceChannelRef.current = null;
			isConnectedRef.current = false;
		}
	};

	useEffect(() => {
		if (!userData?.id || !global.userToken) return;

		const apiInterceptor = Api.interceptors.request.use((request) => {
			handleApiActivity(request);
			return request;
		});

		if (appState === "active") {
			initializeEcho();
		}

		const subscription = AppState.addEventListener(
			"change",
			handleAppStateChange
		);

		return () => {
			subscription.remove();
			Api.interceptors.request.eject(apiInterceptor);
			clearAwayTimer();
			sendStatus("offline");
			cleanupEcho();
		};
	}, [userData?.id]);

	return null;
};

export default usePresenceTracking;
