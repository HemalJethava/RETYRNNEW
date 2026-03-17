import { BlurView } from "@react-native-community/blur";
import React from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	Modal,
	StyleSheet,
	TouchableWithoutFeedback,
} from "react-native";
import { deviceHeight } from "../../../utils/DeviceInfo";
import LayoutStyle from "../../../styles/LayoutStyle";
import Colors from "../../../styles/Colors";
import FontFamily from "../../../assets/fonts/FontFamily";
import IMAGES from "../../../assets/images/Images";

export const ProfilePictureModal = ({
	show,
	onHide,
	imageUri,
	profileTxt,
	type,
	userType,
}) => {
	return (
		<Modal
			visible={show}
			onRequestClose={onHide}
			transparent
			animationType={"fade"}
		>
			<TouchableWithoutFeedback onPress={onHide}>
				<View style={styles.modalContainer}>
					<BlurView
						style={StyleSheet.absoluteFill}
						blurType="light"
						blurAmount={5}
					/>
					<View style={[styles.mainContainer]}>
						{type === "image" ? (
							<Image
								source={
									userType !== 1 ? { uri: imageUri } : IMAGES.appWhiteLogo
								}
								style={styles.profileImg}
							/>
						) : (
							<Text style={styles.profileTxt}>{profileTxt}</Text>
						)}
					</View>
				</View>
			</TouchableWithoutFeedback>
		</Modal>
	);
};

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		...LayoutStyle.padding20,
	},
	mainContainer: {
		height: deviceHeight / 2.5,
		width: "100%",
		backgroundColor: Colors.labelBlack,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	profileImg: {
		height: "100%",
		width: "100%",
		// borderRadius: 160,
		resizeMode: "contain",
	},
	profileTxt: {
		color: Colors.white,
		fontSize: 100,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
});
