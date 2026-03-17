import { Platform, StatusBar, StyleSheet } from "react-native";
import CommonStyles from "./CommonStyles";
import LayoutStyle from "./LayoutStyle";
import Colors from "./Colors";
import FontFamily from "../assets/fonts/FontFamily";
import { deviceHeight, deviceWidth } from "../utils/DeviceInfo";

export const checkupStyles = StyleSheet.create({
	mainContainer: {
		...CommonStyles.mainContainer,
	},
	backgroundWhite: {
		...CommonStyles.backgroundWhite,
	},
	groupTitle: {
		fontSize: 14,
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsBold,
		marginHorizontal: 20,
	},
	groupContainer: {
		marginTop: 10,
		marginBottom: 20,
		marginHorizontal: 20,
		backgroundColor: Colors.white,
		padding: 10,
		borderRadius: 7,
		borderWidth: 0.7,
		borderColor: Colors.cardBorder,
		shadowColor: "#ccc",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.25,
		shadowRadius: Platform.OS === "android" ? 10 : 5,
		elevation: 1.5,
	},
	rowStart: {
		...CommonStyles.directionRowCenter,
		alignItems: "flex-start",
	},
	iconBox: {
		width: 30,
	},
	txtContainer: {
		width: "85%",
		marginLeft: 10,
	},
	titleTxt: {
		fontSize: 14,
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
	desTxt: {
		color: Colors.labelDarkGray,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize8,
	},
	div: {
		marginVertical: 7,
		borderBottomColor: Colors.lightGrayBG,
		borderBottomWidth: 0.9,
	},
	alignCenter: {
		justifyContent: "center",
		alignItems: "flex-start",
	},
});
