import { StatusBar, Platform } from "react-native";
import { StyleSheet } from "react-native";
import CommonStyles from "./CommonStyles";
import LayoutStyle from "./LayoutStyle";
import Colors from "./Colors";
import FontFamily from "../assets/fonts/FontFamily";
import { deviceHeight, deviceWidth } from "../utils/DeviceInfo";

const ComponentStyles = StyleSheet.create({
	// Dark header component style start
	darkContainer: {
		backgroundColor: Colors.primary,
		height: StatusBar.currentHeight,
	},
	headerTextWhite: {
		color: Colors.labelWhite,
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize18,
	},
	headerTextGray: {
		color: Colors.labelGray,
		...LayoutStyle.fontSize18,
		fontFamily: FontFamily.PoppinsRegular,
		marginLeft: 7,
	},
	headerContainer: {
		...CommonStyles.directionRowSB,
		...CommonStyles.mainPaddingH,
		...LayoutStyle.paddingBottom20,
		backgroundColor: Colors.primary,
		paddingTop: Platform.OS === "ios" ? 0 : "5%",
		marginTop: Platform.OS === "ios" ? -30 : 0,
	},
	labelContainer: {
		...CommonStyles.directionRowCenter,
	},
	backArrow: {
		...LayoutStyle.paddingVertical10,
		...LayoutStyle.paddingRight20,
	},
	darkLogo: {
		height: 30,
		width: 30,
		resizeMode: "contain",
		tintColor: Colors.primaryBG20,
	},
	// Dark header component style end

	// light header component style start
	lightContainer: {
		height: StatusBar.currentHeight,
	},
	lightHeaderContainer: {
		...CommonStyles.directionRowSB,
		...CommonStyles.mainPaddingH,
		...LayoutStyle.paddingBottom30,
		paddingTop: Platform.OS === "ios" ? 0 : 10,
		marginTop: Platform.OS === "ios" ? -30 : 0,
	},
	headerSmallLogo: {
		height: 30,
		width: 30,
		resizeMode: "contain",
	},
	lightHeaderText: {
		...LayoutStyle.fontSize18,
		fontFamily: FontFamily.PoppinsMedium,
		color: Colors.labelBlack,
	},
	headerSmallText: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize8,
		justifyContent: "flex-end",
		alignSelf: "flex-end",
		lineHeight: 14,
		color: Colors.iconBlack,
	},

	// light header component style end

	// Button component style start
	btnContainer: {
		...LayoutStyle.padding10,
		borderRadius: 30,
	},
	btnLabel: {
		color: Colors.labelWhite,
		fontFamily: FontFamily.PoppinsMedium,
		alignSelf: "center",
		...LayoutStyle.fontSize14,
		padding: "1%",
	},
	// Button component style End

	// InputText component style start
	textInputContainer: {
		borderBottomWidth: 0.5,
		// borderColor: Colors.inputBorder,
		// borderBottomColor: Colors.inputBorder,
		...CommonStyles.directionRowCenter,
	},
	textInput: {
		height: 50,
		width: "90%",
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize14,
		...LayoutStyle.marginLeft10,
		marginTop: Platform.OS === "android" ? 2 : 0,
	},
	inputLabel: {
		color: Colors.secondary,
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize14,
	},
	focusOutView: {
		backgroundColor: Colors.inputfillBG,
		height: 50,
		fontFamily: FontFamily.PoppinsRegular,
		...CommonStyles.directionRowCenter,
		...LayoutStyle.fontSize14,
		borderRadius: 25,
		...LayoutStyle.paddingHorizontal20,
	},
	inputLableKey: { ...CommonStyles.directionRowCenter },
	validationMsg: {
		color: Colors.danger,
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize8,
		...LayoutStyle.marginTop10,
	},

	// Tab Naviation design start...
	tabLabel: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize10,
		...LayoutStyle.marginTop5,
	},
	homeTab: {
		// ...LayoutStyle.padding15,

		borderRadius: 50,
		borderWidth: 1,
	},
	tabIcons: { height: 25, width: 25 },

	// Key value component style start..
	keyContainer: {
		...CommonStyles.directionRowSB,
		borderBottomWidth: 0.5,
		paddingVertical: Platform.OS === "ios" ? "4%" : "3.5%",
		backgroundColor: "",
	},
	flexKeyContainer: {
		// alignItems: "center",
		justifyContent: "center",
		borderBottomWidth: 0.5,
		paddingVertical: Platform.OS === "ios" ? "4%" : "3.5%",
		backgroundColor: "",
	},
	subKeyContainer: {
		borderBottomWidth: 0.5,
		paddingVertical: Platform.OS === "ios" ? "4%" : "3.5%",
		backgroundColor: "",
	},
	keyStyle: {
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize10,
		color: Colors.labelBlack,
	},
	valueStyle: {
		textAlign: "right",
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
	},

	// TextIcon Component
	subTitleContainer: {
		...LayoutStyle.marginVertical20,
		...CommonStyles.directionRowSB,
	},
	subTitles: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize12,
	},
	// Date time picker custom component style start

	dateContainer: {
		borderBottomWidth: 0.5,
		borderColor: Colors.inputBorder,
		...CommonStyles.directionRowCenter,
		height: 50,
		width: "100%",
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize14,
		...LayoutStyle.marginTop20,
	},
	iconTextContainer: {
		...CommonStyles.directionRowCenter,
	},
	datePlaceholder: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize14,
		color: Colors.placeholder70,
		// marginTop: Platform.OS === "android" ? 10 : 0,
		marginTop: 2,
		marginLeft: "9%",
	},
	dateLabel: {
		color: Colors.secondary,
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize14,
	},
	dateFocusOutView: {
		backgroundColor: Colors.inputfillBG,
		height: 50,
		fontFamily: FontFamily.PoppinsRegular,
		...CommonStyles.directionRowCenter,
		...LayoutStyle.fontSize14,
		borderRadius: 25,
		...LayoutStyle.paddingHorizontal20,
		...LayoutStyle.marginTop20,
	},
	// Date time picker custom component style

	// BottomSheet custom component style start
	mainSheetAlign: {
		justifyContent: "flex-end",
		alignItems: "flex-end",
	},
	bottomSheet: {
		backgroundColor: "#FFF",
		borderRadius: 30,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,

		elevation: 5,
	},
	selctTextLabel: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize14,
		color: Colors.labelBlack,
		...LayoutStyle.paddingLeft20,
		...LayoutStyle.marginTop20,
	},
	sheetComponent: {
		...CommonStyles.directionRowCenter,
		...LayoutStyle.padding20,
	},
	iconStyle: {
		borderRadius: 7,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 0.4,
		...LayoutStyle.padding15,
		...LayoutStyle.paddingHorizontal20,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		// shadowOpacity: 0.25, //check in Real device
		shadowRadius: 3.84,
		elevation: 1,
	},
	iconTextStyle: {
		alignItems: "center",
	},
	cancelContainer: {
		...LayoutStyle.paddingTop20,
		alignItems: "center",
	},
	borderContainer: {
		borderBottomWidth: 1,
		borderColor: Colors.cardBorder,
	},
	textIconLabel: {
		textAlign: "center",
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize10,
		color: Colors.primary,
		width: deviceWidth / 6.2,
		...LayoutStyle.marginTop5,
	},
	cancelText: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize18,
		color: Colors.secondary,
	},
	// BottomSheet custom component style End

	//Overlay/Modal style start
	mainModal: {
		justifyContent: "center",
		alignItems: "center",
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		...LayoutStyle.padding20,
		backgroundColor: Colors.modalTransparent,
	},
	modalView: {
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25, //check in Real device
		shadowRadius: 3.84,
		elevation: 5,
		backgroundColor: Colors.white,
	},
	darkModalView: {
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25, //check in Real device
		shadowRadius: 3.84,
		elevation: 5,
		backgroundColor: Colors.primary,
	},
	// Overlay/Modal style end
	// Loader style started
	loaderIcon: { width: 30, height: 30 },
	loaderHorizontal: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.modalTransparent,
	},
	loaderView: {
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25, //check in Real device
		shadowRadius: 3.84,
		elevation: 5,
		backgroundColor: Colors.white,
		...LayoutStyle.paddingVertical20,
		...LayoutStyle.paddingHorizontal20,
		alignItems: "center",
	},
	loaderText: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize10,
		color: Colors.primary,
		...LayoutStyle.marginTop10,
	},
	// Loader style end

	// Dropdown component style start
	dropdown: {
		height: 50,
		borderBottomWidth: 0.5,
		paddingHorizontal: 5,
		borderColor: Colors.inputBorder,
		...LayoutStyle.marginTop20,
	},
	placeholderStyle: {
		color: Colors.placeholder70,
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize14,
		...LayoutStyle.paddingLeft10,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 5,
	},
	container: {
		padding: 1,
	},
	listStyle: {
		...LayoutStyle.fontSize10,
		fontFamily: FontFamily.PoppinsRegular,
	},
	selectedTextStyle: {
		...LayoutStyle.fontSize12,
		fontFamily: FontFamily.PoppinsMedium,
		color: Colors.white,
		...LayoutStyle.paddingLeft10,
	},
	inputSearchStyle: {
		...LayoutStyle.fontSize12,
		padding: 0,
		margin: 0,
	},
	dropdownFocusOutView: {
		backgroundColor: Colors.inputfillBG,
		height: 50,
		fontFamily: FontFamily.PoppinsRegular,
		...CommonStyles.directionRowCenter,
		...LayoutStyle.fontSize14,
		borderRadius: 25,
		...LayoutStyle.paddingHorizontal20,
		...LayoutStyle.marginTop20,
	},
	// Dropdown component style end...

	// Answer option component style start...
	optionContainer: {
		padding: "5%",
		borderRadius: 12,
		backgroundColor: Colors.darkBGColor,
		...CommonStyles.directionRowSB,
		...LayoutStyle.marginTop20,
	},
	iconTextcontainer: {
		...CommonStyles.directionRowCenter,
	},
	answerText: {
		fontFamily: FontFamily.PoppinsMedium,
		color: Colors.labelWhite,
		...LayoutStyle.marginLeft10,
		width: "85%",
	},
	// Answer option component style end...
	// Radio button style start...
	mainFlex06: {
		...LayoutStyle.paddingVertical10,
		...LayoutStyle.paddingLeft10,
	},
	// Code scanner component style start...
	scannerMarker: {
		borderWidth: 2,
		borderColor: Colors.secondary,
		borderRadius: 12,
		marginTop: "-20%",
	},
	scannerTopView: {
		backgroundColor: Colors.primary,
	},
	scannerBottomView: { backgroundColor: Colors.white },
	scannerTopContainer: {
		paddingBottom: "25%",
	},
	scanQRText: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize14,
		color: Colors.labelBlue,
		alignSelf: "center",
	},
	// Code scanner component style end...

	// Damage truck part image with side check box style start

	sideContainer: {
		...LayoutStyle.padding10,
		alignSelf: "center",
		...LayoutStyle.marginVertical10,
	},
	viewRoundSide: {
		...LayoutStyle.padding10,
		borderWidth: 1,
		borderRadius: 30,
		borderColor: Colors.secondary,
	},
	fullTruckImg: {
		height: deviceHeight / 3,
		width: 60,
		justifyContent: "center",
		alignItems: "center",
		alignSelf: "center",
	},
	displayCenter: {
		flexDirection: "row",
		justifyContent: "center",
	},
	displayColumn: {
		flexDirection: "column",
		justifyContent: "space-between",
		...LayoutStyle.padding20,
	},
	iconBox: {
		flex: 1,
		height: 100,
		alignItems: "center",
		marginHorizontal: 5,
		borderColor: Colors.iconLightGray,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 7,
		borderWidth: 0.8,
		padding: 10,
	},
	gradientBtn: {
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		height: 84,
		borderRadius: 7,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 3.84,
		elevation: 1,
	},
	defaultLoader: {
		position: "absolute",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.modalTransparent,
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 9999,
		elevation: 9999,
	},
	notiBadge: {
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.errorBoxRed,
		height: 16,
		minWidth: 16,
		borderRadius: 8,
		position: "absolute",
		top: 5,
		right: 11,
		paddingHorizontal: 3,
		paddingVertical: 1,
	},
	notiCount: {
		color: Colors.white,
		fontSize: 10,
		fontFamily: FontFamily.PoppinsSemiBold,
		textAlign: "center",
	},
});

export default ComponentStyles;
