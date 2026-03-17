import React from "react";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import ChatStyle from "../../../styles/ChatStyle";
import { Icons, Overlay } from "../../../components";
import Api from "../../../utils/Api";
import Colors from "../../../styles/Colors";
import CommonStyles from "../../../styles/CommonStyles";

export const DeleteMessagePopup = ({
	show,
	onHide,
	data,
	setIsToggleLoading,
	onSuccess,
	onFailed,
}) => {
	const onRequestClose = () => {
		onHide();
	};
	const onPressDelete = async () => {
		if (data?.length > 0) {
			try {
				setIsToggleLoading(true);
				const ids = data.map((item) => item.id);

				const payload = {
					id: ids,
				};

				const response = await Api.post(
					`user/delete-multiple-message`,
					payload
				);

				if (response.success) {
					onSuccess(response.message);
				} else {
					onFailed(response.message);
				}
			} catch (err) {
				console.warn("Error: ", err);
			}
		}
	};

	return (
		<Overlay onRequestClose={() => onRequestClose()} visible={show}>
			<View style={[ChatStyle.actionModal]}>
				<View style={[ChatStyle.centerModal]}>
					<Text style={[ChatStyle.modalHeader]}>{`Delete ${
						data.length > 1 ? "messages" : "message"
					}`}</Text>
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
				<View style={[ChatStyle.addrContainer]}>
					<Text style={[ChatStyle.addressDisplay, { textAlign: "center" }]}>
						{`Are you sure you want to delete this ${
							data.length > 1 ? "messages" : "message"
						}?`}
					</Text>
					<Text
						style={[
							ChatStyle.addressDisplay,
							{ color: Colors.secondary, textAlign: "center" },
						]}
					>
						{`${data?.length} ${data.length > 1 ? "messages" : "message"}`}
					</Text>
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
						onPress={() => onPressDelete()}
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
		</Overlay>
	);
};
