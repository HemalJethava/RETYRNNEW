import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Echo from "laravel-echo";
import { getSharedPusherClient } from "./sharedPusherClient";
import {
	setChatUpdateEvent,
	setChatUserMarkReadEvent,
} from "../../screens/chat/redux/Action";
import { AppState } from "react-native";

const userChatListEcho = () => {
	const dispatch = useDispatch();
	const userData = useSelector((state) => state.Auth.userData);
	const echoRef = useRef(null);

	const [appState, setAppState] = useState(AppState.currentState);

	const initializeEcho = () => {
		if (!userData?.id || !global.userToken) return;

		const pusherClient = getSharedPusherClient(`chat.${userData?.id}`);

		const echo = new Echo({
			broadcaster: "reverb",
			client: pusherClient,
		});

		pusherClient.connection.bind("state_change", (states) => {
			console.log("->>->> Chat List state ->>->>", states);
		});

		pusherClient.connection.bind("error", (error) => {
			console.error("Chat list error:", error);
		});

		echo
			.channel(`chat.${userData?.id}`)
			.listen("UpdateChatListEvent", (data) => {
				console.log("chat list event >>>", data);

				if (data?.employee) {
					dispatch(setChatUpdateEvent(data));
				} else if (data?.mark_read) {
					dispatch(setChatUserMarkReadEvent(data));
				}
			});
	};

	const handleAppStateChange = (nextAppState) => {
		if (nextAppState.match(/inactive|background/)) {
			cleanupEcho();
		}
		if (nextAppState === "active") {
			initializeEcho();
		}

		setAppState(nextAppState);
	};

	const cleanupEcho = () => {
		if (echoRef.current) {
			echoRef.current.disconnect();
			echoRef.current = null;
		}
	};

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
	}, [userData?.id]);
};

export default userChatListEcho;
