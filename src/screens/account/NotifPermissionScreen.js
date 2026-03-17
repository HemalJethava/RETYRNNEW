import { View, Text, ScrollView, Switch, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { LightHeader, Loader } from "../../components";
import LayoutStyle from "../../styles/LayoutStyle";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";
import Api from "../../utils/Api";
import { showMessage } from "react-native-flash-message";
import ListSkeleton from "../../components/LoaderComponents/ListSkeleton";
import { deviceWidth } from "../../utils/DeviceInfo";
import CommonStyles from "../../styles/CommonStyles";

const NotifPermissionScreen = (props) => {
	const [isListLoading, setIsListLoading] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [notificationType, setNotificationType] = useState([]);

	useEffect(() => {
		getNotificationTypes();
	}, []);

	const getNotificationTypes = async () => {
		try {
			setIsListLoading(true);
			const resNotification = await Api.get(`user/get-notifications`, (res) => {
				return res;
			});
			if (resNotification.success) {
				setIsListLoading(false);
				setNotificationType(resNotification?.data?.notification);
			} else {
				setIsListLoading(false);
			}
		} catch (e) {
			setIsListLoading(false);
			console.warn(e);
		}
	};
	const gotoBack = () => {
		props.navigation.goBack();
	};
	const toggleSwitchSuggest = async (item) => {
		try {
			if (item) {
				setIsLoading(true);
				const data = {
					id: item?.id,
					category_id: item?.notification_permission[0]?.category_id,
					is_enabled:
						item?.notification_permission[0]?.is_enabled === 1 ? 0 : 1,
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
	const renderNotificationType = ({ item }) => {
		return (
			<View style={[AccountStyle.toggleNotifContainer]}>
				<Text style={[AccountStyle.wordsBoldMedium, { width: "80%" }]}>
					{`${item.name} | `}
					<Text style={[AccountStyle.notifLabel]}>{item?.description}</Text>
				</Text>
				<Switch
					style={[AccountStyle.notifToggle, { paddingLeft: 0 }]}
					trackColor={{
						false: Colors.disableBtn,
						true: Colors.secondary,
					}}
					thumbColor={
						item?.notification_permission[0]?.is_enabled
							? Colors.white
							: Colors.white
					}
					onValueChange={() => toggleSwitchSuggest(item)}
					value={
						item?.notification_permission[0]?.is_enabled == 1 ? true : false
					}
				/>
			</View>
		);
	};

	return (
		<>
			<Loader show={isLoading} />
			{!isLoading && (
				<View
					style={[AccountStyle.mainContainer, AccountStyle.backgroundWhite]}
				>
					<LightHeader
						isLogo={false}
						isBackIcon={true}
						iconName={"angle-left"}
						iconSize={24}
						iconSetName={"FontAwesome6"}
						iconColor={Colors.backArrowBlack}
						headerText={"Notifications"}
						headerBG={Colors.lightGrayBG}
						statusBG={Colors.lightGrayBG}
						onPress={() => gotoBack()}
					/>
					<View style={[AccountStyle.securityMainContainer]}>
						<ScrollView
							nestedScrollEnabled
							showsVerticalScrollIndicator={false}
						>
							<View>
								<Text style={[AccountStyle.mediumLabel]}>
									{"Select notification settings:"}
								</Text>
								{isListLoading ? (
									<FlatList
										style={{ ...CommonStyles.emptyList, marginVertical: 0 }}
										data={Array(4).fill(0)}
										keyExtractor={(item, index) => `skeleton-${index}`}
										renderItem={({ item, index }) => (
											<ListSkeleton width={deviceWidth / 1.2} height={40} />
										)}
										scrollEnabled={false}
									/>
								) : (
									<FlatList
										style={{ ...LayoutStyle.marginBottom20 }}
										data={notificationType}
										renderItem={renderNotificationType}
										keyExtractor={(i, index) =>
											`notification-${index.toString()}`
										}
										scrollEnabled={false}
									/>
								)}
							</View>
						</ScrollView>
					</View>
				</View>
			)}
		</>
	);
};

export default NotifPermissionScreen;
