// NavigationService.js
import { createNavigationContainerRef } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { getMessaging } from "@react-native-firebase/messaging";

const dispatch = useDispatch();
const messagingInstance = getMessaging();

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
	if (navigationRef.isReady()) {
		navigationRef.navigate(name, params);
	}
}

let navigator;

export function setNavigator(ref) {
	navigator = ref;
}

// export function navigate(name, params) {
// 	if (navigator) {
// 		navigator.dispatch(
// 			CommonActions.navigate({
// 				name,
// 				params,
// 			})
// 		);
// 	}
// }
