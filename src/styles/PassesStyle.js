import { Platform, StatusBar, StyleSheet } from "react-native";
import CommonStyles from "./CommonStyles";
import LayoutStyle from "./LayoutStyle";
import Colors from "./Colors";
import FontFamily from "../assets/fonts/FontFamily";
import { deviceHeight, deviceWidth } from "../utils/DeviceInfo";
import { RFPercentage } from "./ResponsiveFonts";

const PassesStyle = StyleSheet.create({
	mainContainer: {
		...CommonStyles.mainContainer,
	},
	backgroundWhite: {
		...CommonStyles.backgroundWhite,
	},
	backgroundDarkBlue: {
		backgroundColor: Colors.primary,
	},
	// Passes screen style
	passMainConatiner: {
		flex: 1,
		...LayoutStyle.paddingHorizontal20,
	},
	passTextCompnay: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize12,
		color: Colors.white,
		...LayoutStyle.marginRight10,
	},
	passMainText: {
		...LayoutStyle.marginBottom20,
		...LayoutStyle.marginHorizontal20,
		...CommonStyles.directionRowSB,
	},
	PassTextContainer: {
		...CommonStyles.directionRowCenter,
	},
	headerDescContainer: {
		...CommonStyles.directionRowCenter,
		...CommonStyles.mainPaddingH,
		...LayoutStyle.paddingBottom20,
		backgroundColor: Colors.primary,
	},
	headerDescWhite: {
		fontFamily: FontFamily.PoppinsRegular,
		color: Colors.labelWhite,
		...LayoutStyle.fontSize12,
	},
	cardImage: {
		width: "100%",
	},
	cardContainer: {
		width: "100%",
		justifyContent: "center",
		borderWidth: 1,
		elevation: 5,
	},
	cardTitle: {
		fontFamily: FontFamily.PoppinsSemiBold,
		color: Colors.labelWhite,
		...LayoutStyle.fontSize16,
		...LayoutStyle.marginHorizontal20,
	},
	backArrow: {
		...LayoutStyle.paddingVertical10,
		...LayoutStyle.paddingRight20,
	},
	headerTextWhite: {
		color: Colors.labelWhite,
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize20,
	},

	subTitleContainer: {
		...LayoutStyle.marginVertical20,
		...CommonStyles.directionRowSB,
	},
	subTitles: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize12,
		color: Colors.labelWhite,
	},

	// Company details Screen
	StatusBarHight: {
		height: StatusBar.currentHeight,
		backgroundColor: Colors.white,
	},
	companyHeader: {
		...CommonStyles.directionRowSB,
		...CommonStyles.mainPaddingH,
	},
	companyAddr: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize14,
		color: Colors.labelWhite,
		width: 200,
		...LayoutStyle.marginVertical20,
	},
	// Pass details Screen

	companyHeader: {
		...CommonStyles.directionRowSB,
		...CommonStyles.mainPaddingH,
	},
	passDetails: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize14,
		color: Colors.labelWhite,
	},
	// Gradient style
	bottomNotch: {
		padding: "1%",
		marginHorizontal: "35%",
		marginTop: "10%",
		borderRadius: 5,
		backgroundColor: Colors.disableBtn,
	},
	imgBorderGradient: {
		borderBottomStartRadius: 20,
		borderBottomEndRadius: 20,
		borderStartWidth: 1,
		borderEndWidth: 1,
		borderBottomWidth: 1,
	},
	gradientImg: {
		height: deviceHeight / 2,
		width: "100%",
	},
	gradientImgBorder: {
		borderBottomEndRadius: 20,
		borderBottomStartRadius: 20,
		overflow: "hidden",
	},
	gradientIcon: {
		...LayoutStyle.paddingVertical10,
		...LayoutStyle.paddingHorizontal20,
	},
	gradientIconContainer: {
		justifyContent: "center",
		...CommonStyles.directionRowCenter,
	},

	// Company Full details screen (After click on see more)
	topContainer: {
		...CommonStyles.directionRowSB,
		marginTop: Platform.OS === "ios" ? -30 : 0,
	},
	leftIcon: {
		...LayoutStyle.padding20,
	},
	centerTitle: {
		fontFamily: FontFamily.PoppinsRegular,
		color: Colors.labelBlack,
		...LayoutStyle.fontSize16,
	},
	rightIcon: {
		...LayoutStyle.padding20,
	},
	gradientImgDetail: {
		height: Platform.OS === "ios" ? deviceHeight / 3.8 : deviceHeight / 3.5,
		width: "100%",
	},
	passText: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize14,
		color: Colors.labelBlack,
	},
	passValue: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
		...LayoutStyle.marginTop10,
	},
	detailsCard: {
		...LayoutStyle.padding20,
	},
	lastUpdateDate: {
		textAlign: "right",
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize8,
		color: Colors.labelDarkGray,
		...LayoutStyle.paddingVertical10,
	},
	TextWhiteIcon: {
		color: Colors.labelWhite,
		fontFamily: FontFamily.PoppinsBold,
		...LayoutStyle.fontSize26,
		...LayoutStyle.paddingTop30,
		...LayoutStyle.paddingBottom10,
	},
	cardTitleLable: {
		...LayoutStyle.fontSize16,
	},
	imgContainer: { ...LayoutStyle.paddingTop10 },
	profileImg: {
		height: 35,
		width: 35,
		borderRadius: 20,
	},
	companyImg: {
		height: 40,
		width: 40,
		borderRadius: 20,
	},
	logoPosition: {
		alignItems: "center",
		marginBottom:
			Platform.OS === "ios" ? -deviceHeight / 3.9 : -deviceHeight / 3.6,
		zIndex: 9999,
	},
	imgMainBorder: {
		height: 160,
		width: deviceWidth / 1.1,
		borderRadius: 12,
		borderWidth: 1,
		backgroundColor: Colors.white,
		justifyContent: "center",
		alignItems: "center",
	},
	logoSet: {
		height: deviceHeight / 6.5,
		width: deviceWidth / 1.29,
		borderRadius: 12,
	},
	darkName: {
		...LayoutStyle.fontSize12,
		fontFamily: FontFamily.PoppinsBold,
		color: Colors.labelBlack,
	},
	lightPosition: {
		...LayoutStyle.fontSize8,
		fontFamily: FontFamily.PoppinsMedium,
		color: Colors.labelBlack,
	},
	borders: {
		borderBottomWidth: 1,
		borderBottomColor: Colors.userBorder,
	},
	smallText: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize8,
		color: Colors.labelBlack,
	},

	// Add Pass screen design
	imgDisplay: {
		height: deviceHeight / 4,
		width: deviceWidth / 1.5,
		...LayoutStyle.marginBottom20,
		alignSelf: "center",
	},
	document: {
		...LayoutStyle.marginBottom20,
		alignItems: "center",
	},
	documentText: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.labelWhite,
		...LayoutStyle.marginTop10,
	},
	randormCard: {
		borderRadius: 12,
		height: 80,
		width: "100%",
	},
	randormImg: {
		borderRadius: 12,
	},
	borderBottom: {
		borderBottomColor: Colors.primaryBG20,
		borderBottomWidth: 1,
		marginVertical: "12%",
	},
	textColor: {
		alignSelf: "center",
		textAlign: "center",
		fontFamily: FontFamily.PoppinsMedium,
		color: Colors.labelWhite,
		...LayoutStyle.fontSize18,
		marginTop: "15%",
	},

	cameraModal: {
		...LayoutStyle.padding20,
		backgroundColor: Colors.primaryBG20,
		borderTopRightRadius: 12,
		borderTopLeftRadius: 12,
	},
	centerModal: {
		...CommonStyles.directionRowCenter,
		justifyContent: "center",
		// ...LayoutStyle.marginTop20,
	},
	cameraLabel: {
		...LayoutStyle.fontSize18,
		fontFamily: FontFamily.PoppinsSemiBold,
		color: Colors.labelBlack,
	},
	btnGoContainer: {
		backgroundColor: Colors.secondary,
		...LayoutStyle.padding15,
		borderRadius: 25,
		marginTop: -25,
		...LayoutStyle.marginHorizontal20,
	},
	btnTextGo: {
		color: Colors.labelWhite,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize14,
		textAlign: "center",
	},
	messageStyle: {
		fontSize: Platform.OS === "android" ? RFPercentage(1.8) : RFPercentage(1.6),
		...LayoutStyle.marginTop10,
		...LayoutStyle.paddingBottom30,
		fontFamily: FontFamily.PoppinsRegular,
		color: Colors.labelBlack,
		textAlign: "center",
	},
	passImg: {
		height: 130,
		width: "100%",
		borderRadius: 12,
		backgroundColor: Colors.white,
		justifyContent: "center",
		alignItems: "center",
	},
	cardTitleTxt: {
		fontSize: 14,
	},
	cardDetailText: {
		color: Colors.labelBlack,
		fontWeight: "500",
	},
	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
	},
	pdfButton: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		height: "100%",
		width: "100%",
	},
	passImg: {
		height: "100%",
		width: "100%",
		borderRadius: 12,
		borderWidth: 1,
	},
	passShareBtn: {
		position: "absolute",
		bottom: 10,
		right: 10,
	},

	// View ID card

	cardModal: {
		...LayoutStyle.padding20,
		backgroundColor: Colors.primaryBG20,
		borderTopRightRadius: 12,
		borderTopLeftRadius: 12,
		// height: 330,
		marginHorizontal: 20,
		padding: 10,
	},
	alignCenter: {
		alignItems: "center",
		justifyContent: "center",
	},
	cardImg: {
		height: deviceHeight / 6,
		width: deviceWidth / 1.25,
		borderRadius: 12,
	},
	relateSection: {
		paddingVertical: 7,
		justifyContent: "center",
		borderBottomWidth: 1,
		borderBottomColor: Colors.inputBorder,
		borderStyle: Platform.OS === "android" ? "dashed" : "solid",
	},
	shareBox: {
		justifyContent: "center",
		alignItems: "center",
		marginRight: 10,
		backgroundColor: Colors.primary,
		height: 35,
		width: 35,
		padding: 3,
		borderRadius: 4,
	},
	passDetailHeaderIcon: {
		paddingVertical: 20,
	},
	editPassImageBtn: {
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.primary,
		padding: 5,
		borderRadius: 4,
	},
	randomizeBtn: {
		// backgroundColor: Colors.secondary60,
		justifyContent: "center",
		alignItems: "center",
		padding: 7,
		borderRadius: 5,
		alignSelf: "flex-end",
		marginRight: 10,
		position: "absolute",
		top: "57%",
	},
	randomizeTxt: {
		color: Colors.white,
		fontSize: 10,
		fontFamily: FontFamily.PoppinsMedium,
	},
});
export default PassesStyle;
