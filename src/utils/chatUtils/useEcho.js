import { useEffect, useState } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js/react-native";
import {
	REVERB_APP_KEY,
	REVERB_HOST,
	REVERB_PORT,
	REVERB_SCHEME,
	REVERB_ENDPOINT,
	REVERB_CHANNEL_NAME,
	REVERB_EVENT_NAME,
	REVERB_APP_SECRET,
} from "../../config/BaseUrl";

const useEcho = (onMessageReceived) => {
	const [echoInstance, setEchoInstance] = useState(null);

	useEffect(() => {
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
							channel_name: REVERB_CHANNEL_NAME,
						}),
					})
						.then((response) => response.json())
						.then((data) => {
							console.log("Authorization successful:");
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
			client: PusherClient,
		});

		PusherClient.connection.bind("state_change", (states) => {
			console.log("+>+>+> Message state +>+>+>", states);
		});

		PusherClient.connection.bind("error", (error) => {
			console.error("Message error:", error);
		});

		echo.channel(REVERB_CHANNEL_NAME).listen(REVERB_EVENT_NAME, (data) => {
			console.log("Message Event: ", data);
			if (onMessageReceived) onMessageReceived(data);
		});

		setEchoInstance(echo);

		return () => {
			if (echo) {
				echo.disconnect();
			}
		};
	}, []);

	return echoInstance;
};

export default useEcho;
