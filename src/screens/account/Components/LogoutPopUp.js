import React, { useEffect } from "react";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { Icons, Overlay } from "../../../components";
import MapStyle from "../../../styles/MapStyle";
import Colors from "../../../styles/Colors";
import CommonStyles from "../../../styles/CommonStyles";
import Api from "../../../utils/Api";

export const LogoutPopUp = ({
	show,
	onHide,
	setIsLoading,
	onSuccess,
	onFailed,
	onCatch,
}) => {
	useEffect(() => {
		if (!show) {
			return;
		}
	}, [show]);

	const onRequestClose = () => {
		onHide();
	};

	const onPressLogout = async () => {
		setIsLoading(true);
		try {
			const response = await Api.post(`user/logout`, {});
			console.log("response: ", response);

			setIsLoading(false);
			if (response.success) {
				onSuccess(response.message);
			} else {
				onFailed(response.message);
			}
		} catch (error) {
			setIsLoading(false);
			console.warn("Error: ", error);
		}
	};

	return (
		<Modal
			isVisible={show}
			onBackdropPress={onRequestClose}
			animationIn="slideInUp"
			animationOut="slideOutDown"
			renderToHardwareTextureAndroid
			animationInTiming={300}
			animationOutTiming={300}
			backdropTransitionOutTiming={1}
			backdropTransitionInTiming={0}
			useNativeDriver={true}
			// backdropColor={theme.color.gray["064"]}
			style={{ margin: 0 }}
		>
			<View style={[MapStyle.actionModal, { marginHorizontal: 10 }]}>
				<View style={[MapStyle.centerModal]}>
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
					<Text style={[MapStyle.modalHeader]}>{"Logout"}</Text>
					<Pressable>
						<Icons
							iconColor={Colors.white}
							iconName={"close"}
							iconSetName={"MaterialCommunityIcons"}
						/>
					</Pressable>
				</View>
				<View style={[MapStyle.addrContainer]}>
					<Text style={[MapStyle.addressDisplay, { textAlign: "center" }]}>
						{"Are you sure you want to logout?"}
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
						onPress={() => onPressLogout()}
						style={[
							CommonStyles.logoutBtn,
							{
								backgroundColor: Colors.red,
							},
						]}
					>
						<Text style={[CommonStyles.logoutText]}>{"Logout"}</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};
