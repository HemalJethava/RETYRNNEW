import { View, Text, ScrollView, Switch, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { LightHeader, Button, Loader } from "../../components";
import AccountStyle from "../../styles/AccountStyle";
import LayoutStyle from "../../styles/LayoutStyle";
import Colors from "../../styles/Colors";
import Api from "../../utils/Api";
import { showMessage } from "react-native-flash-message";

const DataShareScreen = (props) => {
	const [isLoading, setIsLoading] = useState(false);
	const [shareData, setShareData] = useState(null);
	const [isEnable, setIsEnable] = useState(false);

	useEffect(() => {
		getNotificationTypes();
	}, []);

	const getNotificationTypes = async () => {
		try {
			setIsLoading(true);
			const resNotification = await Api.get(`user/get-notifications`, (res) => {
				return res;
			});
			if (resNotification.success) {
				setIsLoading(false);
				setShareData(resNotification?.data?.notification_for_911[0]);
				setIsEnable(
					resNotification?.data?.notification_for_911[0]
						?.notification_permission[0]?.is_enabled === 1
						? true
						: false
				);
			} else {
				setIsLoading(false);
			}
		} catch (e) {
			setIsLoading(false);
			console.warn(e);
		}
	};
	const gotoBack = () => {
		props.navigation.goBack();
	};
	const toggleSwitch = async () => {
		try {
			if (shareData) {
				setIsLoading(true);
				const data = {
					id: shareData?.id,
					category_id: shareData?.notification_permission[0]?.category_id,
					is_enabled: isEnable ? 0 : 1,
				};

				const response = await Api.post(
					`user/update-notification-permission`,
					data
				);

				if (response.success) {
					setIsLoading(false);
					getNotificationTypes();
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
					showMessage({
						message: response?.message
							? response?.message
							: response?.data?.message,
						type: "danger",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				}
			}
		} catch (error) {
			setIsLoading(false);
			console.warn(error);
		}
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
					headerText={"Emergency Data Sharing"}
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
									{"What’s Emergency Data Sharing?"}
								</Text>
								<Text style={[AccountStyle.qusDescription]}>
									{
										"When this is on, your live location, trip and contact details will be automatically shared with authorities if you call 911 from the app or CrashDetection is not responded to in timely manner.  Only available in certain cities."
									}
								</Text>
								<View
									style={[
										AccountStyle.toggleTextContainer,
										{
											borderColor: isEnable
												? Colors.lightBlueBorder
												: Colors.darkBorder,
										},
									]}
								>
									<Text style={[AccountStyle.verifiactionText]}>
										{"Share Trip details with 911"}
									</Text>
									<Switch
										trackColor={{
											false: Colors.disableBtn,
											true: Colors.secondary,
										}}
										thumbColor={isEnable ? Colors.white : Colors.white}
										ios_backgroundColor={Colors.disableBtn}
										onValueChange={toggleSwitch}
										value={isEnable}
									/>
								</View>
								<View style={{ ...LayoutStyle.marginVertical20 }}>
									<Button
										isBtnActive={true}
										btnLabelColor={Colors.white}
										btnName={"Learn More"}
										btnColor={Colors.secondary}
									/>
								</View>
							</View>
						</ScrollView>
					</View>
				)}
			</View>
		</>
	);
};

export default DataShareScreen;
