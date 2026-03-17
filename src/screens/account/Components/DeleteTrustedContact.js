import React from "react";
import { View, Text, Pressable } from "react-native";
import { Icons, Overlay } from "../../../components";
import MapStyle from "../../../styles/MapStyle";
import Colors from "../../../styles/Colors";
import Api from "../../../utils/Api";
import CommonStyles from "../../../styles/CommonStyles";

export const DeleteTrustedContact = ({
	show,
	onHide,
	data,
	setIsLoading,
	onSuccess,
	onFailed,
}) => {
	const onRequestClose = () => {
		onHide();
	};

	const onPressDelete = async () => {
		try {
			setIsLoading(true);
			const payload = {
				id: [data.id],
			};
			const removeRes = await Api.post(
				`user/delete-multiple-trusted-contact`,
				payload
			).then((res) => {
				return res;
			});
			if (removeRes.success) {
				setIsLoading(false);
				onRequestClose();
				onSuccess(removeRes.message);
			} else {
				setIsLoading(false);
				onFailed(removeRes.message);
			}
		} catch (error) {
			console.warn(error);
		}
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
							{"Delete Trusted Contact"}
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
							{"Are you sure you want to delete this trusted contact?"}
						</Text>
						<Text
							style={[
								MapStyle.addressDisplay,
								{ color: Colors.secondary, textAlign: "center" },
							]}
						>
							{data?.name}
							<Text style={{ color: Colors.darkBGColor }}>{" • "}</Text>
							{data?.phoneNumber}
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
							onPress={() => onHide()}
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
									backgroundColor: pressed ? "#FF5C5C" : Colors.red,
									paddingVertical: 10,
									marginLeft: 10,
									width: "40%",
								},
							]}
							onPress={() => onPressDelete()}
						>
							<Text style={[CommonStyles.logoutText]}>{"Delete"}</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Overlay>
	);
};
