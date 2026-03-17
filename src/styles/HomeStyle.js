import { Platform, StyleSheet } from "react-native";
import CommonStyles from "./CommonStyles";
import LayoutStyle from "./LayoutStyle";
import Colors from "./Colors";
import FontFamily from "../assets/fonts/FontFamily";
import { RFPercentage } from "./ResponsiveFonts";
import { deviceHeight } from "../utils/DeviceInfo";

const HomeStyle = StyleSheet.create({
	mainContainer: {
		...CommonStyles.mainContainer,
	},
	backgroundWhite: {
		...CommonStyles.backgroundWhite,
	},
	// Home screen style
	homeContainer: {
		justifyContent: "center",
		alignItems: "center",
		flex: 0.6,
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
	headerDesc: {
		fontFamily: FontFamily.PoppinsRegular,
		color: Colors.labelGray,
		...LayoutStyle.fontSize12,
		...LayoutStyle.marginLeft10,
	},
	gradientImgBG: {
		height: "100%",
		width: "100%",
	},
	HomeTextGO: {
		fontFamily: FontFamily.PoppinsBold,
		...LayoutStyle.fontSize28,
		color: Colors.labelWhite,
		height: deviceHeight / 20,
	},
	HomeText: {
		fontFamily: FontFamily.PoppinsBold,
		...LayoutStyle.fontSize28,
		color: Colors.labelWhite,
		height: deviceHeight / 20,
		...LayoutStyle.marginBottom20,
	},
	naviIconContainer: {
		backgroundColor: Colors.navigationIcon,
		borderRadius: 70,
		padding: "4%",
		...LayoutStyle.marginTop20,
	},
	navigationIcon: {
		...LayoutStyle.padding15,
		backgroundColor: Colors.secondary,
		borderRadius: 50,
	},
	welcomeModal: {
		...LayoutStyle.padding20,
		backgroundColor: Colors.primaryBG20,
		borderTopRightRadius: 12,
		borderTopLeftRadius: 12,
	},
	centerModal: {
		...CommonStyles.directionRowCenter,
		justifyContent: "center",
		...LayoutStyle.marginTop20,
	},
	welcomeLabel: {
		...LayoutStyle.fontSize18,
		fontFamily: FontFamily.PoppinsSemiBold,
		color: Colors.labelBlack,
	},
	welcomeName: {
		...LayoutStyle.fontSize18,
		fontFamily: FontFamily.PoppinsSemiBold,
		color: Colors.secondary,
	},
	messageStyle: {
		fontSize: Platform.OS === "android" ? RFPercentage(1.8) : RFPercentage(1.6),
		...LayoutStyle.marginTop10,
		...LayoutStyle.paddingBottom30,
		fontFamily: FontFamily.PoppinsMedium,
		color: Colors.labelBlack,
		textAlign: "center",
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
	btnSkipContainer: {
		...LayoutStyle.marginVertical20,
	},
	btnTextSkip: {
		color: Colors.labelBlue,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize14,
		textAlign: "center",
	},
	containModal: {
		alignItems: "center",
		...LayoutStyle.paddingHorizontal20,
		marginTop: -25,
	},
	iconContainer: {
		borderWidth: 1,
		...LayoutStyle.padding15,
		borderRadius: 7,
		borderColor: Colors.labelBlack,
		backgroundColor: Colors.white,
	},
	moduleName: {
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize18,
		color: Colors.labelBlack,
		...LayoutStyle.marginTop20,
	},
	iconBtnContainer: {
		...LayoutStyle.padding20,
		backgroundColor: Colors.secondary,
		borderRadius: 50,
	},
	carouselContainer: {
		...CommonStyles.directionRowCenter,
		...LayoutStyle.paddingVertical20,
	},
	carousel: {
		padding: "2%",
		...LayoutStyle.margin10,
		borderRadius: 10,
		...LayoutStyle.marginVertical20,
	},
	btnFinishContainer: {
		backgroundColor: Colors.secondary,
		...LayoutStyle.padding15,
		borderRadius: 25,
		width: "100%",
		...LayoutStyle.marginHorizontal20,
	},
	btnTextFinish: {
		color: Colors.labelWhite,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize14,
		textAlign: "center",
	},
});
export default HomeStyle;
