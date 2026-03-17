import AsyncStorage from "@react-native-async-storage/async-storage";

const storeData = async (setKeyName, setValue) => {
	try {
		const jsonValue = JSON.stringify(setValue);
		await AsyncStorage.setItem(setKeyName, jsonValue);
	} catch (e) {
		// saving error
	}
};
const getData = async (getKeyName) => {
	try {
		const jsonValue = await AsyncStorage.getItem(getKeyName);
		return jsonValue != null ? JSON.parse(jsonValue) : null;
	} catch (e) {
		// error reading value
	}
};
const removeData = async (removeKeyName) => {
	try {
		await AsyncStorage.removeItem(removeKeyName);
	} catch (e) {
		// remove error
	}
};

const clearAll = async () => {
	try {
		await AsyncStorage.clear();
	} catch (e) {
		// clear error
	}
};

export { storeData, getData, removeData, clearAll };
