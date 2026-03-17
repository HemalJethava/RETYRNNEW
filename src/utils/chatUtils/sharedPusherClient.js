// getSharedPusherClient.js
import Pusher from "pusher-js";
import {
	REVERB_APP_KEY,
	REVERB_HOST,
	REVERB_PORT,
	REVERB_SCHEME,
	REVERB_ENDPOINT,
} from "../../config/BaseUrl";

let sharedPusherClient = null;

export const getSharedPusherClient = (channelName) => {
	if (
		!sharedPusherClient ||
		sharedPusherClient.connection.state === "disconnected" ||
		sharedPusherClient.connection.state === "failed"
	) {
		// Pusher.logToConsole = true;

		sharedPusherClient = new Pusher(REVERB_APP_KEY, {
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
							channel_name: channelName,
						}),
					})
						.then((res) => res.json())
						.then((data) => {
							callback(false, data);
						})
						.catch((err) => callback(true, err));
				},
			}),
		});
	}
	return sharedPusherClient;
};
