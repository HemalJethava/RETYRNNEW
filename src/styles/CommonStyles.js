import { StatusBar, StyleSheet } from "react-native";
import LayoutStyle from "./LayoutStyle";
import Colors from "./Colors";
import FontFamily from "../assets/fonts/FontFamily";
const CommonStyles = StyleSheet.create({
	// Container styles
	mainContainer: {
		flex: 1,
	},
	mainPadding: {
		...LayoutStyle.padding20,
	},
	mainPaddingH: {
		...LayoutStyle.paddingHorizontal20,
	},
	mainPaddingV: {
		...LayoutStyle.paddingVertical20,
	},
	directionRowCenter: {
		flexDirection: "row",
		alignItems: "center",
	},
	directionRowSB: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	backgroundWhite: {
		backgroundColor: Colors.white,
	},
	emptyDataWhite: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.labelWhite,
		...LayoutStyle.paddingVertical30,
	},
	emptyDataBlack: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
		...LayoutStyle.paddingVertical30,
	},
	emptyDataAlign: { justifyContent: "center", alignItems: "center" },
	notFountText: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
		textAlign: "center",
	},
	logoutBtn: {
		paddingVertical: 12,
		borderRadius: 7,
		width: "48%",
		justifyContent: "center",
		alignItems: "center",
	},
	cancelText: {
		color: Colors.inputBlackText,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsMedium,
	},
	logoutText: {
		color: Colors.white,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
	emptyList: {
		flex: 1,
		marginVertical: 20,
	},
	emptyListContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	emptyImg: {
		height: 150,
		width: "100%",
		marginTop: "20%",
	},
	emptyTitle: {
		fontSize: 16,
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
	emptyDescription: {
		fontSize: 14,
		color: Colors.labelDarkGray,
		textAlign: "center",
		marginBottom: 20,
	},
	dotsContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 10,
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: Colors.inputfillBG,
		marginHorizontal: 5,
	},
	activeDot: {
		backgroundColor: Colors.secondary,
	},
	closeVideo: {
		position: "absolute",
		top: StatusBar.currentHeight || 20, // Position below the status bar
		right: 20,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		borderRadius: 20,
		padding: 10,
	},
	addLocationBtn: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: Colors.secondary,
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 25,
	},
	criteriaContainer: {
		position: "absolute",
		left: 10,
	},
	criteriaBox: {
		padding: 10,
		borderRadius: 5,
		backgroundColor: Colors.white,

		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 3,
		elevation: 5,
	},
	criteriaTitle: {
		color: Colors.black,
		fontSize: 12,
		fontFamily: FontFamily.PoppinsSemiBold,
		marginBottom: 3,
	},
	criteriaTxt: {
		marginLeft: 3,
		fontSize: 12,
		color: Colors.red,
	},
});

export default CommonStyles;
