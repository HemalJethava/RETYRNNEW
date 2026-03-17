import React from "react";
import {
	View,
	Text,
	Pressable,
	StyleSheet,
	TouchableOpacity,
	Image,
} from "react-native";
import { Icons, Overlay } from "../../../components";
import Colors from "../../../styles/Colors";
import LayoutStyle from "../../../styles/LayoutStyle";
import CommonStyles from "../../../styles/CommonStyles";
import FontFamily from "../../../assets/fonts/FontFamily";
import IMAGES from "../../../assets/images/Images";

export const ConfirmBack = ({ show, onHide, onConfirm }) => {
	const onRequestClose = () => {
		onHide();
	};

	return (
		<Overlay onRequestClose={() => onRequestClose()} visible={show}>
			<View style={[styles.actionModal, {}]}>
				<Pressable
					style={({ pressed }) => [
						{
							backgroundColor: pressed ? "#EFEFEF" : "#ffffff",
							alignSelf: "flex-end",
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
				<View style={styles.rowCenter}>
					<View style={styles.mapImgBox}>
						<Image source={IMAGES.MapNavigation} style={styles.mapImg} />
					</View>
				</View>
				<View style={[styles.centerModal]}>
					<Text style={[styles.modalHeader, { flex: 1, textAlign: "center" }]}>
						{"Are you sure?"}
					</Text>
				</View>
				<Text style={styles.desTxt}>
					{
						"Are you sure you want to back while currently navigating on the map?"
					}
				</Text>
				<View style={[CommonStyles.directionRowSB, { marginTop: 20 }]}>
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
						onPress={() => onConfirm()}
						style={[
							CommonStyles.logoutBtn,
							{
								backgroundColor: Colors.primary,
							},
						]}
					>
						<Text style={[CommonStyles.logoutText]}>{"Confirm"}</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Overlay>
	);
};

const styles = StyleSheet.create({
	actionModal: {
		...LayoutStyle.padding20,
		backgroundColor: Colors.white,
		borderRadius: 12,
	},
	centerModal: {
		...CommonStyles.directionRowSB,
	},
	modalHeader: {
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize16,
		color: Colors.labelBlack,
	},
	mapImgBox: {
		height: 80,
		width: 200,
	},
	mapImg: {
		height: "100%",
		width: "100%",
		resizeMode: "contain",
	},
	rowCenter: {
		...CommonStyles.directionRowCenter,
		justifyContent: "center",
	},
	desTxt: {
		fontSize: 14,
		color: Colors.labelDarkGray,
		marginTop: 10,
	},
});
