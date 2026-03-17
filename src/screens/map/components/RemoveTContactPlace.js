import React from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import MapStyle from "../../../styles/MapStyle";
import { Icons, Overlay } from "../../../components";
import Colors from "../../../styles/Colors";
import CommonStyles from "../../../styles/CommonStyles";

export const RemoveTContactPlace = ({ show, onHide, onPress }) => {
	const onRequestClose = () => {
		onHide();
	};
	return (
		<Overlay onRequestClose={() => onRequestClose()} visible={show}>
			<View style={{}}>
				<View style={[MapStyle.actionModal, {}]}>
					<View style={[MapStyle.centerModal]}>
						<Text
							style={[MapStyle.modalHeader, { flex: 1, textAlign: "center" }]}
						>
							{"Remove Trusted Contact"}
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
							onPress={onPress}
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
