import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Pressable,
	LayoutAnimation,
	UIManager,
	Platform,
	ScrollView,
} from "react-native";
import Overlay from "./Overlay";
import MapStyle from "../styles/MapStyle";
import Colors from "../styles/Colors";
import Api from "../utils/Api";
import Icons from "./Icons";
import CommonStyles from "../styles/CommonStyles";

// if (
// 	Platform.OS === "android" &&
// 	UIManager.setLayoutAnimationEnabledExperimental
// ) {
// 	UIManager.setLayoutAnimationEnabledExperimental(true);
// }

export const ConfirmDeletePopup = ({
	show,
	onHide,
	title,
	api,
	data,
	setIsLoading,
	onSuccess,
	onFailed,
	isTrustedContact,
	trustedContactList,
	setSelectedItems,
	setMultiSelectMode,
}) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [emergencyContacts, setEmergencyContacts] = useState([]);

	useEffect(() => {
		if (data && isTrustedContact) {
			if (Array.isArray(trustedContactList) && trustedContactList.length > 0) {
				const emergencyArray = trustedContactList.filter(
					(item) => item.isEmergency
				);
				setEmergencyContacts(emergencyArray);
			}
		}
	}, [show]);

	const onRequestClose = () => {
		onHide();
		setSelectedItems([]);
		setMultiSelectMode(false);
	};

	const toggleExpandCollapse = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setIsExpanded(!isExpanded);
	};

	const confirmDelete = async () => {
		if (data.length > 0) {
			try {
				setIsLoading(true);
				const payload = {
					id: data,
				};
				const response = await Api.post(api, payload);
				if (response.success) {
					onSuccess(response?.message);
				} else {
					onFailed(response?.message);
				}
			} catch (error) {
				setIsLoading(false);
				console.warn(error);
			}
		}
	};
	return (
		<Overlay onRequestClose={() => onRequestClose()} visible={show}>
			<View style={{}}>
				<View style={[MapStyle.actionModal, {}]}>
					<View style={[MapStyle.centerModal]}>
						<Text
							style={[MapStyle.modalHeader, { flex: 1, textAlign: "center" }]}
						>
							{"Delete"}
						</Text>
						<Pressable
							style={({ pressed }) => [
								{ backgroundColor: pressed ? "#EFEFEF" : "#ffffff" },
							]}
							onPress={() => onRequestClose()}
						>
							<Icons
								iconColor={Colors.iconBlack}
								iconName={"close"}
								iconSetName={"MaterialCommunityIcons"}
								iconSize={22}
							/>
						</Pressable>
					</View>
					<View style={[MapStyle.addrContainer]}>
						<Text style={[MapStyle.addressDisplay]}>
							{"Are you want to sure delete?"}
						</Text>
						<Text
							style={[MapStyle.addressDisplay, { color: Colors.secondary }]}
						>
							{title}
						</Text>
						{isTrustedContact && emergencyContacts.length > 0 && (
							<>
								<Text style={[MapStyle.emergencyDes]}>
									{
										"Removing trusted contacts will also remove them from emergency contacts."
									}
								</Text>
								<View
									style={[
										MapStyle.emergencyTitleContainer,
										{ ...CommonStyles.directionRowSB },
									]}
								>
									<Text style={[MapStyle.emergencyTitle]}>
										{"Emergency Contacts"}
									</Text>
									{emergencyContacts?.length > 2 && (
										<TouchableOpacity onPress={toggleExpandCollapse}>
											<Icons
												iconColor={Colors.inputBlackText}
												iconSetName={"MaterialCommunityIcons"}
												iconName={isExpanded ? "chevron-up" : "chevron-down"}
												iconSize={22}
											/>
										</TouchableOpacity>
									)}
								</View>
								<ScrollView
									style={[
										{
											maxHeight: isExpanded ? 220 : 70,
											overflow: "hidden",
										},
									]}
									nestedScrollEnabled={true}
									keyboardShouldPersistTaps="handled"
									showsVerticalScrollIndicator={true}
								>
									{emergencyContacts
										.slice(0, isExpanded ? emergencyContacts.length : 2)
										.map((item, index) => (
											<View key={item.id} style={[MapStyle.contactRow]}>
												<Text style={[MapStyle.contactIndex]}>{index + 1}</Text>
												<Text numberOfLines={1} style={[MapStyle.ContactName]}>
													{item?.name}
												</Text>
												<Text style={[MapStyle.ContactNum]}>
													{item?.phoneNumber}
												</Text>
											</View>
										))}
								</ScrollView>
							</>
						)}
					</View>
					<View style={[CommonStyles.directionRowSB]}>
						<TouchableOpacity
							onPress={() => onRequestClose()}
							style={[
								CommonStyles.logoutBtn,
								{
									backgroundColor: Colors.lightGrayBG,
								},
							]}
						>
							<Text style={[CommonStyles.cancelText]}>{"Cancel"}</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => confirmDelete()}
							style={[
								CommonStyles.logoutBtn,
								{
									backgroundColor: Colors.red,
								},
							]}
						>
							<Text style={[CommonStyles.logoutText]}>{"Delete"}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Overlay>
	);
};
