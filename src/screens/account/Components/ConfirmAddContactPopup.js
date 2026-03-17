import React from "react";
import { View, Text, Pressable } from "react-native";
import { Icons, Overlay } from "../../../components";
import MapStyle from "../../../styles/MapStyle";
import Colors from "../../../styles/Colors";
import CommonStyles from "../../../styles/CommonStyles";

export const ConfirmAddContactPopup = ({
	show,
	onHide,
	onConfirm,
	onCancel,
}) => {
	const onRequestClose = () => {
		onHide();
	};

	return (
		<Overlay onRequestClose={() => onRequestClose()} visible={show}>
			<View>
				<View style={[MapStyle.actionModal]}>
					<View
						style={{
							...CommonStyles.directionRowCenter,
							justifyContent: "center",
						}}
					>
						<Text
							style={[MapStyle.modalHeader, { flex: 1, textAlign: "center" }]}
						>
							{"Confirm Add Contact"}
						</Text>
						<View style={{}}>
							<Pressable
								style={({ pressed }) => [
									{
										backgroundColor: pressed ? "#EFEFEF" : "#ffffff",
									},
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
					</View>
					<View style={[MapStyle.addrContainer]}>
						<Text style={[MapStyle.addressDisplay, { textAlign: "center" }]}>
							{"Are you sure you want to add this trusted contact?"}
						</Text>
					</View>
					<View
						style={[MapStyle.actionIconContainer, { justifyContent: "center" }]}
					>
						<Pressable
							style={({ pressed }) => [
								MapStyle.actionIconsView,
								{
									backgroundColor: pressed
										? Colors.lightGrayBG
										: Colors.lightGrayBG,
									paddingVertical: 10,
									width: "40%",
								},
							]}
							onPress={() => onCancel()}
						>
							<Text
								style={[
									CommonStyles.logoutText,
									{ color: Colors.labelDarkGray },
								]}
							>
								{"Cancel"}
							</Text>
						</Pressable>
						<Pressable
							style={({ pressed }) => [
								MapStyle.actionIconsView,
								{
									backgroundColor: Colors.primary,
									paddingVertical: 10,
									marginLeft: 10,
									width: "40%",
								},
							]}
							onPress={() => onConfirm()}
						>
							<Text style={[CommonStyles.logoutText]}>{"Confirm"}</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Overlay>
	);
};
