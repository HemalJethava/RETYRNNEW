import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { Overlay, Icons } from "../../../components";
import MapStyle from "../../../styles/MapStyle";
import Colors from "../../../styles/Colors";
import Api from "../../../utils/Api";
import CommonStyles from "../../../styles/CommonStyles";

export const RemovePinContactPopup = ({
	show,
	onHide,
	title,
	api,
	data,
	setIsLoading,
	onSuccess,
	onFailed,
}) => {
	const onRequestClose = () => {
		onHide();
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
							{"Remove Pinned Contact"}
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
							{"Are you want to remove pinned contacts?"}
						</Text>
						<Text
							style={[MapStyle.addressDisplay, { color: Colors.secondary }]}
						>
							{title}
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
