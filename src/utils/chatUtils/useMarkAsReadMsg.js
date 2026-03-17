import { useEffect, useState } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js/react-native";
import {
	REVERB_APP_KEY,
	REVERB_HOST,
	REVERB_PORT,
	REVERB_SCHEME,
	REVERB_ENDPOINT,
} from "../../config/BaseUrl";
import { useSelector } from "react-redux";

const useMarkAsReadMsg = (chatID) => {
	const [echoInstance, setEchoInstance] = useState(null);

	const userData = useSelector((state) => state.Auth.userData);

	useEffect(() => {
		if (!global.userToken || !chatID || !userData?.id) return;

		// Pusher.logToConsole = true;

		const PusherClient = new Pusher(REVERB_APP_KEY, {
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
							channel_name: `private-markRead.${chatID}.${userData?.id}`,
						}),
					})
						.then((res) => res.json())
						.then((data) => {
							callback(false, data);
						})
						.catch((err) => {
							console.error("Authorization failed:", err);
							callback(true, err);
						});
				},
			}),
		});

		const echo = new Echo({
			broadcaster: "reverb",
			client: PusherClient,
		});

		PusherClient.connection.bind("state_change", (states) => {
			console.log("-->+>->> Mark Read Status <<-<+<--", states);
		});

		const privateChannel = echo.private(`markRead.${chatID}.${userData?.id}`);

		privateChannel.subscribed(() => {
			console.log("markRead Subscribed:", `markRead.${chatID}.${userData?.id}`);
		});

		setEchoInstance(echo);

		return () => {
			console.log(">>> markRead disconnected");
			echo.disconnect();
		};
	}, [chatID]);

	return echoInstance;
};

export default useMarkAsReadMsg;
