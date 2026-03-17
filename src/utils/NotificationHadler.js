import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import notifee, { EventType } from "@notifee/react-native";
import { useSelector } from "react-redux";

const NotificationHandler = () => {
	const navigation = useNavigation();
	const userData = useSelector((state) => state.Auth.userData);
	const [pendingNotification, setPendingNotification] = useState(null);

	const safeParse = (str) => {
		try {
			return str ? JSON.parse(str) : null;
		} catch {
			return null;
		}
	};

	const handleNotification = async (detail) => {
		const data = detail?.notification?.data;
		if (!data || data?.type === "crash") return;

		const parsedData = {
			...data,
			company_detail: safeParse(data.company_detail),
			emergency_contacts_rel: safeParse(data.emergency_contacts_rel),
		};

		const chatItem = {
			name: parsedData?.name,
			mobile: parsedData?.mobile,
			company_detail: parsedData?.company_detail,
			email: parsedData?.email,
			emergency_contacts_rel: parsedData?.emergency_contacts_rel,
			user_status: parsedData?.user_status,
			last_seen_at: parsedData?.last_seen_at,
		};

		if (!userData?.id) {
			setPendingNotification({ item: chatItem, chatID: parsedData.sender_id });
			return;
		}

		navigation.navigate("Message", {
			item: chatItem,
			chatID: parsedData.sender_id,
		});
	};

	useEffect(() => {
		const onEvent = async ({ type, detail }) => {
			if (type === EventType.ACTION_PRESS || type === EventType.PRESS) {
				await handleNotification(detail);
			}
		};

		const unsubscribeForeground = notifee.onForegroundEvent(onEvent);
		const unsubscribeBackground = notifee.onBackgroundEvent(onEvent);

		return () => {
			unsubscribeForeground?.();
			unsubscribeBackground?.();
		};
	}, []);

	useEffect(() => {
		if (pendingNotification && userData?.id) {
			navigation.navigate("Message", {
				item: pendingNotification.item,
				chatID: pendingNotification.chatID,
			});
			setPendingNotification(null);
		}
	}, [pendingNotification, userData]);

	return null;
};

export default NotificationHandler;
