// CrashDetectionManager.js
import React from "react";
import { Platform } from "react-native";
import { useSelector } from "react-redux";
import CrashDetectionIOS from "../utils/CrashDetectionIOS";

const CrashDetectionManagerIOS = () => {
	const isEnableCrashDetection = useSelector(
		(state) => state.Auth.isEnableCrashDetection
	);

	if (Platform.OS !== "ios") return null;

	return <CrashDetectionIOS enabled={isEnableCrashDetection} />;
};

export default CrashDetectionManagerIOS;
