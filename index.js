import "react-native-gesture-handler";
import "react-native-get-random-values";
import { useEffect, useRef } from "react";
import { AppRegistry, Text, View } from "react-native";
import App from "./src/App";
import { name as appName } from "./app.json";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import { CrashProvider, useCrash } from "./src/context/CrashContext";
import { storeNotification } from "./src/config/CommonFunctions";
import Geolocation from "@react-native-community/geolocation";
import { getApp } from "@react-native-firebase/app";

navigator.geolocation = Geolocation;

const displayNotification = async (data) => {
	const channelId = await notifee.createChannel({
		id: "retyrn",
		name: "Retyrn",
		sound: "default",
		importance: AndroidImportance.HIGH,
	});

	await notifee.displayNotification({
		title: data.title,
		body: data.body,
		android: {
			channelId,
			showTimestamp: true,
			timestamp: new Date().getTime(),
			importance: AndroidImportance.HIGH,
			smallIcon: "ic_notification",
			pressAction: {
				launchActivity: "default",
				id: "default",
			},
		},
		ios: {
			sound: "default",
		},
		data: data,
	});
};

getApp()
	.messaging()
	.setBackgroundMessageHandler(async (remoteMessage) => {
		if (remoteMessage.data) {
			displayNotification(remoteMessage.data);

			const { sender_id } = remoteMessage.data;
			const notificationId = remoteMessage.messageId;

			await storeNotification(sender_id, notificationId);
		}
	});

const logErrorToConsole = (error) => {
	console.error("Unhandled error:", error);
};

// Catch unhandled errors in the app
const globalErrorHandler = (error, isFatal) => {
	console.log("Global error caught: ", error);
	if (isFatal) {
		logErrorToConsole(error);
	}
};

ErrorUtils.setGlobalHandler(globalErrorHandler);

const AppScreen = () => {
	return <App />;
};

const RootApp = () => (
	<CrashProvider>
		<AppScreen />
	</CrashProvider>
);

AppRegistry.registerComponent(appName, () => RootApp);
