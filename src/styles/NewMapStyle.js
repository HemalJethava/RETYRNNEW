import { Platform, StatusBar, StyleSheet } from "react-native";
import CommonStyles from "./CommonStyles";
import LayoutStyle from "./LayoutStyle";
import Colors from "./Colors";
import FontFamily from "../assets/fonts/FontFamily";
import { deviceHeight, deviceWidth } from "../utils/DeviceInfo";

export const NewMapStyle = StyleSheet.create({
	mainInputContainer: {
		flexDirection: "row",
		marginBottom: 10,
	},
	blackDot: {
		backgroundColor: Colors.primary,
		height: 10,
		width: 10,
		borderRadius: 5,
		marginTop: 12,
		marginRight: 10,
	},
	blueSquare: {
		backgroundColor: Colors.secondary,
		height: 10,
		width: 10,
		borderRadius: 0,
		marginTop: 12,
		marginRight: 10,
	},
	originTextInput: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize12,
		height: 30,
		backgroundColor: "transparent",
		textAlign: "left",
		marginTop: 5,
	},
	onlyRow: {
		flexDirection: "row",
	},
	inputBox: {
		flex: 1,
		flexDirection: "row",
		borderWidth: 1,
		borderColor: Colors.secondary,
		borderRadius: 20,
		paddingHorizontal: 10,
	},
	inputLabel: {
		color: Colors.secondary,
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize12,
		marginTop: 8,
	},
	inputContainer: {
		position: "relative",
		justifyContent: "center",
		alignItems: "center",
	},
	listContainer: {
		padding: 0,
		margin: 0,
	},
	listView: {
		overflow: "hidden",
		marginBottom: 10,
	},
	myLocationBtn: {
		marginTop: 10.5,
	},
	plusBtn: {
		marginTop: 6,
		marginLeft: 5,
	},
	blankSquare: {
		height: 22,
		width: 22,
		marginTop: 9,
		marginLeft: 5,
	},
	swapBox: {
		flexDirection: "row",
		alignItems: "center",
		marginLeft: 10,
	},
	verticalLine: {
		backgroundColor: Colors.secondary,
		height: 32,
		width: 1.5,
		position: "absolute",
		zIndex: 999,
		left: 4,
		top: -22,
	},
	rowWidth: {
		width: "100%",
		flexDirection: "row",
	},
	downline: {
		backgroundColor: Colors.secondary,
		height: 25,
		width: 1.5,
		position: "absolute",
		zIndex: 999,
		left: 4,
		top: 24,
	},
});
