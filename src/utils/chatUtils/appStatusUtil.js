// appStatusUtil.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const APP_ACTIVE_KEY = "appActiveFlag";

export const isFreshLaunch = async () => {
	const active = await AsyncStorage.getItem(APP_ACTIVE_KEY);
	if (!active) {
		await AsyncStorage.setItem(APP_ACTIVE_KEY, "true");
		return true;
	}
	return false;
};

export const markAppInactive = async () => {
	await AsyncStorage.removeItem(APP_ACTIVE_KEY);
};
