import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	Switch,
	NativeModules,
	Platform,
} from "react-native";
import { LightHeader, Loader } from "../../components";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";
import Api from "../../utils/Api";
import { showMessage } from "react-native-flash-message";
import { useDispatch } from "react-redux";
import { crashDetectionSuccess } from "../auth/redux/Action";

const CrashDetectionScreen = (props) => {
	// Init state variables
	const dispatch = useDispatch();

	const [isToogle, setIsToogle] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [crashDetection, setCrashDetection] = useState(null);
	const [isEnabled, setIsEnabled] = useState(1);

	const { CrashDetectionModule } = NativeModules;

	useEffect(() => {
		getNotificationType();
	}, []);

	const getNotificationType = async () => {
		try {
			setIsLoading(true);
			const resNotification = await Api.get(`user/get-notifications`, (res) => {
				return res;
			});
			if (resNotification.success) {
				setIsLoading(false);
				setCrashDetection(resNotification?.data?.crash_detaction);
				setIsEnabled(
					resNotification?.data?.crash_detaction?.notification_permission[0]
						?.is_enabled
				);
			} else {
				setIsLoading(false);
			}
		} catch (e) {
			setIsLoading(false);
			console.warn(e);
		}
	};
	const toggleSwitchSuggest = async () => {
		try {
			setIsLoading(true);
			const data = {
				id: crashDetection?.id,
				category_id: crashDetection?.notification_permission[0]?.category_id,
				is_enabled: isEnabled === 1 ? 0 : 1,
			};

			const response = await Api.post(
				`user/update-notification-permission`,
				data
			);

			if (response.success) {
				setIsLoading(false);
				getNotificationType();
				if (isEnabled === 1) {
					if (Platform.OS === "android") {
						CrashDetectionModule.stopCrashDetectionService();
					}
					dispatch(crashDetectionSuccess({ isEnabled: false }));
				} else {
					if (Platform.OS === "android") {
						CrashDetectionModule.startCrashDetectionService();
					}
					dispatch(crashDetectionSuccess({ isEnabled: true }));
				}
				showMessage({
					message: response?.message,
					type: "success",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			} else {
				setIsLoading(false);
				const extractMessages = (data) => {
					if (!Array.isArray(data)) return "";

					const step1 = data.map((item) => Object.values(item));
					const step2 = step1.flatMap((messages) =>
						Array.isArray(messages)
							? messages.flatMap((msg) =>
									typeof msg === "object" ? Object.values(msg) : msg
							  )
							: [messages]
					);
					const step3 = step2.filter(
						(message) => typeof message === "string" && message.trim() !== ""
					);
					const result = step3.join("\n ");
					return result;
				};

				const messagesString = extractMessages(response?.data?.data);
				showMessage({
					message: messagesString ? messagesString : response?.data?.message,
					type: "danger",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			}
		} catch (error) {
			setIsLoading(false);
			console.warn(error);
		}
	};
	const gotoBack = () => {
		props.navigation.goBack();
	};

	return (
		<>
			<View style={[AccountStyle.mainContainer, AccountStyle.backgroundWhite]}>
				<Loader show={isLoading} />
				<LightHeader
					isLogo={false}
					isBackIcon={true}
					iconName={"angle-left"}
					iconSize={24}
					iconSetName={"FontAwesome6"}
					iconColor={Colors.backArrowBlack}
					headerText={"Crash Detection"}
					headerBG={Colors.lightGrayBG}
					statusBG={Colors.lightGrayBG}
					onPress={() => gotoBack()}
				/>
				{!isLoading && (
					<View style={[AccountStyle.securityMainContainer]}>
						<ScrollView
							nestedScrollEnabled
							showsVerticalScrollIndicator={false}
						>
							<View>
								<Text style={[AccountStyle.question]}>
									{"What’s CrashDetection?"}
								</Text>
								<Text style={[AccountStyle.qusDescription]}>
									{
										"In the case of an unexpected incident, Retyrn will initiate CrashDetection, providing you with relevant safety tools so you can quickly get the help you need."
									}
								</Text>
								<View
									style={[
										AccountStyle.toggleTextContainer,
										{
											borderColor: isToogle
												? Colors.lightBlueBorder
												: Colors.darkBorder,
										},
									]}
								>
									<Text style={[AccountStyle.verifiactionText]}>
										{"Crash Detection Notifications"}
									</Text>
									<Switch
										trackColor={{
											false: Colors.disableBtn,
											true: Colors.secondary,
										}}
										thumbColor={isEnabled === 1 ? Colors.white : Colors.white}
										ios_backgroundColor={Colors.disableBtn}
										onValueChange={toggleSwitchSuggest}
										value={isEnabled === 1 ? true : false}
									/>
								</View>
								<Text style={[AccountStyle.lightDescription]}>
									{"When turned on, Retyrn will send you a Crash Detection" +
										" notification if an incident is detected and notify"}
									<Text style={[AccountStyle.wordsBold]}>
										{" with trusted contacts, emergency personnel,"}
									</Text>
									{" and "}
									<Text style={[AccountStyle.wordsBold]}>{" family "}</Text>
									{"should you not respond to the notification in" +
										"adequate time."}
								</Text>
							</View>
						</ScrollView>
					</View>
				)}
			</View>
		</>
	);
};

export default CrashDetectionScreen;
