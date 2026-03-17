import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Echo from "laravel-echo";
import { getSharedPusherClient } from "./sharedPusherClient";
import { setChatUserStatusEvent } from "../../screens/chat/redux/Action";
import { AppState } from "react-native";
import { isFreshLaunch, markAppInactive } from "./appStatusUtil";

const chatUsersStatus = () => {
	const dispatch = useDispatch();
	const userData = useSelector((state) => state.Auth.userData);
	const echoRef = useRef(null);
	const [appState, setAppState] = useState(AppState.currentState);

	const initializeEcho = () => {
		if (!userData?.id || !global.userToken) return;

		const pusherClient = getSharedPusherClient(`user-status.${userData?.id}`);
		const echo = new Echo({
			broadcaster: "reverb",
			client: pusherClient,
		});

		pusherClient.connection.bind("state_change", (states) => {
			console.log("++->> Users Status ++->>", states);
		});

		pusherClient.connection.bind("error", (error) => {
			console.error("User Status: error:", error);
		});

		echoRef.current = echo;

		echo.channel(`user.${userData?.id}`).listen("UserStatusChanged", (data) => {
			console.log("User Status Event:", data);
			dispatch(setChatUserStatusEvent(data));
		});
	};

	const cleanupEcho = () => {
		if (echoRef.current) {
			echoRef.current.disconnect();
			echoRef.current = null;
		}
	};

	const handleAppStateChange = async (nextAppState) => {
		if (nextAppState.match(/inactive|background/)) {
			await markAppInactive();
			cleanupEcho();
		}

		if (nextAppState === "active") {
			initializeEcho();
		}

		setAppState(nextAppState);
	};

	useEffect(() => {
		if (!userData?.id || !global.userToken) return;

		const setup = async () => {
			const fresh = await isFreshLaunch();
			if (fresh) {
				dispatch(setChatUserStatusEvent(null));
			}
			if (appState === "active") {
				initializeEcho();
			}
		};
		setup();

		const subscription = AppState.addEventListener(
			"change",
			handleAppStateChange
		);

		return () => {
			subscription.remove();
			cleanupEcho();
		};
	}, [userData?.id]);
};

export default chatUsersStatus;
