import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { Overlay, Icons } from "../../../components";
import Colors from "../../../styles/Colors";
import ChatStyle from "../../../styles/ChatStyle";
import Share from "react-native-share";
import Api from "../../../utils/Api";
import { appUrl } from "../../../config/BaseUrl";
import { InviteMessage } from "../../../config/CommonFunctions";

export const InvitePopup = ({
	show,
	onHide,
	data,
	setLoading,
	onSuccess,
	onFailed,
}) => {
	const icon = "data:<data_type>/<file_extension>;base64,<base64_data>";
	const message = InviteMessage(data.name, appUrl);
	const title = "Retyrn";

	const [isEmergency, setIsEmergency] = useState(false);
	const [isSharing, setIsSharing] = useState(false);

	useEffect(() => {
		if (data && show) {
			const isEmergencyContact = data?.user_contacts ? true : false;

			setIsEmergency(isEmergencyContact);
		}
	}, [data]);

	const onRequestClose = () => {
		onHide();
	};
	const onPressShare = async () => {
		if (isSharing) return;
		setIsSharing(true);

		try {
			const options = Platform.select({
				ios: {
					activityItemSources: [
						{
							placeholderItem: {
								type: "text",
								content: message,
							},
							item: {
								default: {
									type: "text",
									content: message,
								},
							},
							linkMetadata: {
								title: title,
								icon: icon,
							},
						},
					],
				},
				default: {
					title,
					subject: title,
					message: message,
				},
			});

			Share.open(options);
		} catch (err) {
			console.warn("Share Error: ", err);
		} finally {
			setIsSharing(false);
		}
	};
	const onPressEmergency = async () => {
		try {
			setLoading(true);
			const payload = {
				user_contact_id: data?.id,
				action: isEmergency ? "remove" : "add",
			};
			const resEmergency = await Api.post(
				`user/add-emergency-contact`,
				payload
			);

			if (resEmergency.success) {
				onSuccess(resEmergency?.message);
			} else {
				const msg = resEmergency?.message
					? resEmergency?.message
					: resEmergency.data.message;
				onFailed(msg);
			}
		} catch (error) {
			setLoading(false);
			console.warn(error);
		}
	};

	return (
		<Overlay onRequestClose={() => onRequestClose()} visible={show}>
			<View>
				<View style={[ChatStyle.actionModal]}>
					<View style={[ChatStyle.centerModal]}>
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
						<Text style={[ChatStyle.modalHeader]}>{"Actions"}</Text>
						<Pressable>
							<Icons
								iconColor={Colors.white}
								iconName={"close"}
								iconSetName={"MaterialCommunityIcons"}
							/>
						</Pressable>
					</View>
					<View style={[ChatStyle.addrContainer]}>
						<Text style={[ChatStyle.addressDisplay, { textAlign: "center" }]}>
							{`${data?.name} is not an app user or company employee. you can ${
								isEmergency ? "remove" : "add"
							} them as a emergency contact or invite them.`}
						</Text>
						<Text
							style={[
								ChatStyle.addressDisplay,
								{ color: Colors.secondary, textAlign: "center" },
							]}
						>
							{data?.name ? `${data?.name} \n ${data?.mobile}` : ""}
						</Text>
					</View>
					<View style={[ChatStyle.actionIconContainer]}>
						<Pressable
							onPress={() => onPressEmergency()}
							style={({ pressed }) => [
								{
									backgroundColor:
										isEmergency && pressed
											? "#FF8A8A"
											: isEmergency
											? "#FF5C5C"
											: !isEmergency && pressed
											? "#DAECF780"
											: !isEmergency && pressed
											? "#DAECF7"
											: "#DAECF7",
									height: 90,
									paddingHorizontal: 7,
								},
								ChatStyle.actionIconsView,
							]}
						>
							<Icons
								iconColor={isEmergency ? Colors.white : Colors.iconBlack}
								iconName={isEmergency ? "phone-off" : "phone-plus"}
								iconSetName={"MaterialCommunityIcons"}
								iconSize={18}
							/>
							<Text
								// numberOfLines={1}
								style={[
									ChatStyle.iconText,
									{
										textAlign: "center",
										color: isEmergency ? Colors.white : Colors.iconBlack,
									},
								]}
							>{`${isEmergency ? "Remove" : "Add"} \n Emergency`}</Text>
						</Pressable>
						<Pressable
							style={({ pressed }) => [
								{
									backgroundColor: pressed ? "#DAECF780" : "#DAECF7",
									height: 90,
									opacity: isSharing ? 0.5 : 1,
								},
								ChatStyle.actionIconsView,
							]}
							disabled={isSharing}
							onPress={() => onPressShare()}
						>
							<Icons
								iconColor={Colors.iconBlack}
								iconName={"share-variant"}
								iconSetName={"MaterialCommunityIcons"}
								iconSize={18}
							/>
							<Text style={[ChatStyle.iconText]}>{"Invite"}</Text>
						</Pressable>
						<Pressable
							style={({ pressed }) => [
								{
									backgroundColor: pressed ? "#FFCBCB80" : "#FFCBCB",
									height: 90,
								},
								ChatStyle.actionIconsView,
							]}
							onPress={() => onRequestClose()}
						>
							<Icons
								iconColor={Colors.iconBlack}
								iconName={"close-circle"}
								iconSetName={"MaterialCommunityIcons"}
								iconSize={18}
							/>
							<Text style={[ChatStyle.iconText]}>{"Cancel"}</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Overlay>
	);
};
