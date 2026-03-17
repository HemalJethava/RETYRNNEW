// SharedFileListener.js
import { useEffect } from "react";
import ShareMenu from "react-native-share-menu";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";

const SharedFileListener = () => {
	const navigation = useNavigation();
	const userData = useSelector((state) => state.Auth.userData);

	const isValidShare = (item) =>
		item && ((item.data && item.data.length) || item.text || item.webUrl);

	useEffect(() => {
		const handleShare = (item) => {
			if (!isValidShare(item)) return;

			if (userData?.id && global.userToken && Platform.OS === "ios") {
				navigation?.navigate("Chats", { sharedFile: item });
			} else {
				global.isShareLaunch = true;
				global.pendingSharedItem = item;
			}
		};

		ShareMenu.getInitialShare(handleShare);
		const listener = ShareMenu.addNewShareListener(handleShare);
		return () => listener.remove();
	}, [userData, global.userToken]);

	useEffect(() => {
		if (
			global.isShareLaunch &&
			global.pendingSharedItem &&
			userData?.id &&
			global.userToken
		) {
			navigation.navigate("Chats", { sharedFile: global.pendingSharedItem });
			global.pendingSharedItem = null;
			global.isShareLaunch = false;
		}
	}, [userData, global.userToken]);

	return null;
};

export default SharedFileListener;
