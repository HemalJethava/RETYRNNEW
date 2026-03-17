import { Platform, StyleSheet } from "react-native";
import CommonStyles from "./CommonStyles";
import LayoutStyle from "./LayoutStyle";
import Colors from "./Colors";
import FontFamily from "../assets/fonts/FontFamily";
import { heightPercentageToDP as hp } from "./ResponsiveScreens";

const AuthStyle = StyleSheet.create({
	testSmallText: {
		alignSelf: "flex-end",
		marginTop: 10,
		...LayoutStyle.fontSize12,
		fontFamily: FontFamily.PoppinsMedium,
		color: Colors.secondary,
	},
	mainContainer: {
		...CommonStyles.mainContainer,
	},
	backgroundWhite: {
		...CommonStyles.backgroundWhite,
	},
	// Splash screen
	splashContainer: {
		flex: 0.9,
		...CommonStyles.mainPadding,
		...CommonStyles.flexCol,
		justifyContent: "space-around",
	},
	bgImage: {
		height: "100%",
		width: "100%",
		resizeMode: "cover",
	},
	gradientImgBG: {
		height: "100%",
		width: "100%",
	},
	textLogoWhite: { width: "35%", height: "25%", alignSelf: "center" },
	appMsg: {
		...LayoutStyle.fontSize14,
		color: Colors.labelWhite,
		fontFamily: FontFamily.PoppinsRegular,
		textAlign: "center",
	},
	arrowBorder: {
		...LayoutStyle.padding15,
		borderWidth: 2,
		borderRadius: 60,
		alignSelf: "center",
		borderColor: Colors.secondary,
	},
	arrowIconContainer: {
		...LayoutStyle.padding25,
		backgroundColor: Colors.secondary,
		alignSelf: "center",
		borderRadius: 50,
	},

	// EULA Screen

	formContainer: {
		maxHeight: "70%",
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
		backgroundColor: Colors.primary,
		...CommonStyles.mainPaddingH,
		...LayoutStyle.paddingBottom20,
	},
	overrideGradient: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	updateDate: {
		color: Colors.labelGray,
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize10,
		// ...LayoutStyle.marginBottom20,
		...LayoutStyle.marginBottom10,
	},
	eulaDescription: {
		color: Colors.labelWhite,
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize12,
		lineHeight: Platform.OS === "android" ? 24 : 22,
	},
	btnContain: {
		justifyContent: "center",
		...LayoutStyle.marginHorizontal20,
		...LayoutStyle.paddingVertical20,
	},
	// Login screen
	loginContainer: {
		backgroundColor: Colors.white,
		...CommonStyles.mainPadding,
	},
	headerLabel: {
		...LayoutStyle.fontSize20,
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
	bottomTextContain: {
		...CommonStyles.directionRowCenter,
		backgroundColor: Colors.white,
		justifyContent: "center",
		paddingBottom: "30%",
	},
	bottomText: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
	},
	flexContainer: {
		flex: 1,
		backgroundColor: Colors.white,
	},
	loginScrollViewStyle: {
		flexDirection: "column",
		justifyContent: "space-between",
		flexGrow: 1,
	},

	// Business info screen
	businessContainer: {
		backgroundColor: Colors.white,
	},
	companyName: {
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize20,
		color: Colors.labelBlue,
	},
	businessInfo: {
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderTopColor: Colors.cardBorder,
		borderBottomColor: Colors.cardBorder,
		paddingVertical: "16%",
		...LayoutStyle.paddingHorizontal20,
		...LayoutStyle.marginTop20,
	},
	companyAddr: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize14,
		color: Colors.labelBlack,
		...LayoutStyle.marginTop10,
	},
	busiBtnContainer: {
		...CommonStyles.mainPaddingH,
		paddingBottom: hp(6),
	},

	// Verify account Screen

	verifyContainer: {
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
		backgroundColor: Colors.primary,
		...CommonStyles.mainPaddingH,
		...LayoutStyle.paddingBottom20,
	},
	headerTitle: {
		fontFamily: FontFamily.PoppinsRegular,
		color: Colors.inputLabel,
		...LayoutStyle.fontSize14,
		...LayoutStyle.marginBottom10,
	},
	resendBtnContainer: {
		...LayoutStyle.padding25,
	},
	resendBtn: {
		fontFamily: FontFamily.PoppinsMedium,
		color: Colors.secondary,
		...LayoutStyle.fontSize16,
		...LayoutStyle.paddingTop10,
		alignSelf: "center",
	},
	verifyBtn: { ...LayoutStyle.paddingTop30, ...CommonStyles.mainPaddingH },

	// Password screen
	passwdContainer: {
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
		backgroundColor: Colors.primary,
		...CommonStyles.mainPaddingH,
		...LayoutStyle.paddingBottom20,
	},
	// Sign up Screen
	// Password screen
	signUpContainer: {
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
		backgroundColor: Colors.primary,
		...CommonStyles.mainPaddingH,
		...LayoutStyle.paddingBottom20,
	},
	nextBtn: { ...LayoutStyle.paddingTop30, ...CommonStyles.mainPaddingH },
	countryCode: {
		width: 50,
	},
	criteriaContainer: {
		position: "absolute",
		left: 10,
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
		maxHeight: 120,
		overflow: "hidden",
		marginBottom: 20,
	},
	originTextInput: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize12,
		height: 30,
		// backgroundColor: "transparent",
		// textAlign: "left",
		// marginTop: 5,

		backgroundColor: Colors.transparent,
		color: Colors.inputWhiteText,
	},
	mainInputContainer: {
		flexDirection: "row",
		marginBottom: 10,
	},
	inputBox: {
		flex: 1,
		flexDirection: "row",
		borderWidth: 1,
		borderColor: Colors.inputBorderDark,
		borderRadius: 20,
		paddingHorizontal: 10,
	},
	rowWidth: {
		width: "100%",
		flexDirection: "row",
	},
	inputLabel: {
		color: Colors.white,
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize12,
		marginTop: 8,
	},
	welcomeContainer: {
		height: "25%",
		justifyContent: "center",
		alignItems: "center",
	},
	welcomeTxt: {
		color: Colors.labelWhite,
		fontSize: 28,
		fontFamily: FontFamily.PoppinsBold,
		textAlign: "center",
	},
	loginFlex: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "space-between",
		...LayoutStyle.paddingHorizontal20,
	},
	loginHeaderRow: {
		...CommonStyles.directionRowSB,
		...LayoutStyle.paddingVertical10,
	},
	retyrnLogo: {
		height: 34,
		width: 34,
		resizeMode: "contain",
	},
	policyRow: {
		...CommonStyles.directionRowCenter,
		...LayoutStyle.paddingTop20,
		...LayoutStyle.paddingBottom10,
		justifyContent: "center",
	},
	forgotRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	forgotTxt: {
		color: Colors.labelBlue,
		...LayoutStyle.fontSize12,
		fontFamily: FontFamily.PoppinsMedium,
	},
	bottomActiveText: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlue,
		marginLeft: "5%",
	},
	newCompnayRow: {
		...CommonStyles.directionRowCenter,
		...LayoutStyle.paddingTop20,
		justifyContent: "center",
	},
});

export default AuthStyle;
