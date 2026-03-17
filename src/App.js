import React, { useEffect, useRef, useState } from "react";
import {
	LogBox,
	Text,
	Platform,
	DeviceEventEmitter,
	TextInput,
	AppState as ApplicationState,
} from "react-native";
import FlashMessage from "react-native-flash-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppState from "./context/AppState";
import NetInfo from "@react-native-community/netinfo";
import { NoInternetPopup } from "./components/NoInternetPopup";
import { ReportCrashDetection } from "./components/ReportCrashDetection";
import { useCrash } from "./context/CrashContext";
import {
	getCurrentChatUser,
	storeNotification,
} from "./config/CommonFunctions";
import { store, persistor } from "./store";
import { Provider as ReduxProvider, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AppNavigation from "./navigations/AppNavigation";
import messaging, {
	getMessaging,
	onMessage,
} from "@react-native-firebase/messaging";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import CrashDetectionManagerIOS from "./context/CrashDetectionManagerIOS";
import { SafeAreaProvider } from "react-native-safe-area-context";
import usePresenceTracking from "./utils/chatUtils/usePresenceTracking";
import userChatListEcho from "./utils/chatUtils/userChatListEcho";
import chatUsersStatus from "./utils/chatUtils/chatUsersStatus";
import userAnalytics from "./utils/userAnalytics";

// Handling the device size
if (Text.defaultProps) {
	Text.defaultProps.allowFontScaling = false;
} else {
	Text.defaultProps = {};
	Text.defaultProps.allowFontScaling = false;
}

// Override Text scaling in input fields
if (TextInput.defaultProps) {
	TextInput.defaultProps.allowFontScaling = false;
} else {
	TextInput.defaultProps = {};
	TextInput.defaultProps.allowFontScaling = false;
}

const PresenceListener = () => usePresenceTracking();
const ChatListListener = () => userChatListEcho();
const UsersStatusListener = () => chatUsersStatus();
const UserAnalytics = () => userAnalytics();

global.isShareLaunch = false;
global.pendingSharedItem = null;

const App = () => {
	LogBox.ignoreAllLogs();

	const [isConnected, setIsConnected] = useState(true);
	const [showInternetPopup, setShowInternetPopup] = useState(false);
	const [isTryAgain, setIsTryAgain] = useState(false);

	const { showCrashPopup, hidePopup, force, showPopup } = useCrash();
	const messagingInstance = getMessaging();

	const onPressAgain = () => {
		setIsTryAgain(true);

		setTimeout(() => {
			NetInfo.fetch().then((state) => {
				if (state.isConnected) {
					setIsConnected(true);
					setShowInternetPopup(false);
				} else {
					setIsConnected(false);
				}
				setIsTryAgain(false);
			});
		}, 2000);
	};

	useEffect(() => {
		const eventListener = DeviceEventEmitter.addListener(
			"NotificationTapped",
			(data) => {
				if (data) {
					showPopup(data?.force?.toFixed(2));
					if (global.NativeModules?.CrashDetectionModule?.markDelivered) {
						global.NativeModules.CrashDetectionModule.markDelivered();
					}
				}
			}
		);

		return () => {
			eventListener.remove();
		};
	}, []);

	useEffect(() => {
		if (Platform.OS !== "ios") return;

		const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
			if (
				type === EventType.PRESS &&
				detail?.notification?.data?.type === "crash"
			) {
				showPopup(10);
			}
		});

		return () => unsubscribe();
	}, []);

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener((state) => {
			if (state.isConnected) {
				setIsConnected(true);
				setShowInternetPopup(false);
			} else {
				setIsConnected(false);
				setShowInternetPopup(true);
			}
		});

		return () => unsubscribe();
	}, []);

	useEffect(() => {
		if (Platform.OS === "ios") {
			const unsubscribe = onMessage(messagingInstance, async (notification) => {
				if (notification) {
					const senderId = notification?.data?.sender_id;
					const currentChatUserId = await getCurrentChatUser();
					if (senderId === currentChatUserId) {
						console.log("Ignoring notification:", senderId);
						return;
					}

					const channelId = await notifee.createChannel({
						id: "retyrn",
						name: "Retyrn",
						sound: "default",
					});

					await notifee.displayNotification({
						title: notification?.data?.title,
						body: notification?.data?.body,
						android: {
							channelId: channelId,
							smallIcon: "ic_notification",
						},
						ios: {
							sound: "default",
						},
						data: notification?.data,
					});

					const { sender_id } = notification.data;
					const notificationId = notification.messageId;
					await storeNotification(sender_id, notificationId);
				}
			});
			return () => {
				unsubscribe();
			};
		}
	}, []);

	useEffect(() => {
		if (Platform.OS === "android") {
			messagingInstance.setBackgroundMessageHandler(async (remoteMessage) => {
				if (remoteMessage.data) {
					const senderId = remoteMessage?.data?.sender_id;
					const currentChatUserId = await getCurrentChatUser();

					if (senderId === currentChatUserId) {
						console.log("Ignoring notification:", senderId);
						return;
					}

					displayNotification(remoteMessage.data);

					const { sender_id } = remoteMessage.data;
					const notificationId = remoteMessage.messageId;
					await storeNotification(sender_id, notificationId);
				}
			});

			const foregroundListener = messagingInstance.onMessage(
				async (remoteMessage) => {
					if (remoteMessage.data) {
						const senderId = remoteMessage?.data?.sender_id;
						const currentChatUserId = await getCurrentChatUser();

						if (senderId === currentChatUserId) {
							console.log("Ignoring notification: ", senderId);
							return;
						}

						displayNotification(remoteMessage.data);

						const { sender_id } = remoteMessage.data;
						const notificationId = remoteMessage.messageId;
						await storeNotification(sender_id, notificationId);
					}
				}
			);
			return () => {
				foregroundListener();
			};
		}
	}, []);

	const displayNotification = async (data) => {
		if (!data || !data.title || !data.body) return;

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

	return (
		<SafeAreaProvider style={{}}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<ReduxProvider store={store}>
					<PersistGate loading={null} persistor={persistor}>
						<PresenceListener />
						<ChatListListener />
						<UsersStatusListener />
						<UserAnalytics />
						<CrashDetectionManagerIOS />
						<FlashMessage position="top" />
						<NoInternetPopup
							show={showInternetPopup}
							onHide={() => setShowInternetPopup(false)}
							onPressAgain={onPressAgain}
							isTryAgain={isTryAgain}
						/>
						{showCrashPopup && (
							<ReportCrashDetection
								show={showCrashPopup}
								onHide={hidePopup}
								force={force}
							/>
						)}
						<AppState>
							<AppNavigation />
						</AppState>
					</PersistGate>
				</ReduxProvider>
			</GestureHandlerRootView>
		</SafeAreaProvider>
	);
};

export default App;





// /Chnage 