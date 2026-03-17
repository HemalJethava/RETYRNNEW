import { Platform, StatusBar, StyleSheet } from "react-native";
import LayoutStyle from "./LayoutStyle";
import Colors from "./Colors";
import FontFamily from "../assets/fonts/FontFamily";
import CommonStyles from "./CommonStyles";

export const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	container: {
		flex: 1,
		...LayoutStyle.paddingHorizontal20,
		paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
	},
	flexCenter: {
		flex: 1,
		justifyContent: "center",
	},
	headerTxt: {
		color: Colors.labelBlack,
		fontSize: 18,
		fontFamily: FontFamily.PoppinsSemiBold,
		textAlign: "left",
	},
	middleContainer: {
		// flexGrow: 1,
		justifyContent: "flex-start",
		alignItems: "center",
	},
	iconBox: {
		height: 50,
		width: 50,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1.3,
		borderColor: Colors.secondary,
	},
	pageDesTxt: {
		color: Colors.labelBlack,
		fontSize: 20,
		fontFamily: FontFamily.PoppinsSemiBold,
		textAlign: "center",
		...LayoutStyle.marginTop20,
		...LayoutStyle.marginBottom10,
	},

	continueBtn: {
		width: "100%",
		...LayoutStyle.marginVertical10,
	},
	backLoginBtn: {
		...CommonStyles.directionRowCenter,
		...LayoutStyle.marginTop10,
	},
	backLoginTxt: {
		color: Colors.labelBlack,
		fontSize: 16,
		fontFamily: FontFamily.PoppinsMedium,
		marginLeft: 7,
	},
	otpInput: {
		marginTop: 35,
		...LayoutStyle.marginBottom10,
	},
	receiveTxt: {
		color: Colors.labelDarkGray,
		fontSize: 13,
		fontFamily: FontFamily.PoppinsMedium,
	},
	resendTxt: {
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
	criteriaContainer: {
		position: "absolute",
		left: 10,
		top: -95,
		zIndex: 99,
	},
	pinBox: {
		width: "100%",
		alignItems: "flex-start",
		top: -7,
	},
	pinIcon: {
		transform: [{ rotateZ: "90deg" }],
	},
	criteriaBox: {
		padding: 10,
		borderRadius: 5,
		backgroundColor: Colors.white,

		shadowColor: "#000",
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.2,
		shadowRadius: 3,
		elevation: 5,
	},
	otpContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "90%",
		...LayoutStyle.marginVertical20,
	},
	input: {
		width: 50,
		height: 55,
		borderWidth: 1,
		borderColor: "#d4d4d4",
		textAlign: "center",
		textAlignVertical: "center",
		color: Colors.labelBlack,
		fontSize: 22,
		fontFamily: FontFamily.PoppinsMedium,
		borderRadius: 10,
	},
	commonBtn: {
		...LayoutStyle.padding10,
		...CommonStyles.directionRowCenter,
		justifyContent: "center",
		width: "100%",
		borderRadius: 30,
	},
	btnTitle: {
		color: Colors.labelWhite,
		fontFamily: FontFamily.PoppinsMedium,
		alignSelf: "center",
		...LayoutStyle.fontSize14,
		padding: "1%",
	},
});
