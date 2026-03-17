// utils/resetToLoginHelper.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";
import { crashDetectionSuccess } from "../screens/auth/redux/Action";
import { getMessaging } from "@react-native-firebase/messaging";
import { navigationRef } from "../navigations/NavigationService";
import { CommonActions } from "@react-navigation/native";
import { store } from "../store";

const { CrashDetectionModule } = NativeModules;

export const resetToLogin = async () => {
	try {
		const state = store.getState();
		const dispatch = store.dispatch;

		const userData = state.Auth.userData;
		const isEnableCrashDetection = state.Auth.isEnableCrashDetection;

		if (global.userToken) {
			await AsyncStorage.clear();
			global.userToken = "";

			if (Platform.OS === "android" && isEnableCrashDetection) {
				await CrashDetectionModule.stopCrashDetectionService();
			}

			dispatch(crashDetectionSuccess({ isEnabled: false }));

			const messagingInstance = getMessaging();
			await messagingInstance.deleteToken();

			dispatch({ type: "RESET_APP" });

			if (navigationRef.current) {
				navigationRef.dispatch(
					CommonActions.reset({
						index: 0,
						routes: [{ name: "Login" }],
					})
				);
			}
		}
	} catch (error) {
		console.error("resetToLogin Error:", error);
	}
};
