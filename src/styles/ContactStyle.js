import { StyleSheet } from "react-native";
import CommonStyles from "./CommonStyles";
import Colors from "./Colors";
import LayoutStyle from "./LayoutStyle";
import FontFamily from "../assets/fonts/FontFamily";
import { RFPercentage } from "./ResponsiveFonts";
import { deviceHeight, deviceWidth } from "../utils/DeviceInfo";

const ContactStyle = StyleSheet.create({
	mainContainer: {
		...CommonStyles.mainContainer,
	},
	backgroundDarkBlue: {
		backgroundColor: Colors.white,
	},
	centerModal: {
		...CommonStyles.directionRowCenter,
		justifyContent: "center",
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
		fontSize: RFPercentage(1.6),
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
	claimMainContainer: {},
	welcomeBold: {
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
		width: "75%",
	},
	document: {
		...LayoutStyle.marginBottom20,
		alignItems: "center",
	},
	documentText: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.iconBlack,
		...LayoutStyle.marginTop10,
	},
	selectImgs: {
		height: deviceHeight / 7.5,
		width: deviceWidth / 2.35,
		borderRadius: 12,
	},
	uploadImgSmall: {
		backgroundColor: Colors.darkBGColor,
		justifyContent: "center",
		borderRadius: 12,
		...LayoutStyle.paddingHorizontal20,
		marginTop: 10,
	},
	minusIcon: {
		justifyContent: "flex-end",
		alignItems: "flex-end",
		alignSelf: "flex-end",
		padding: 4,
		...LayoutStyle.margin10,
		backgroundColor: Colors.lightBlue,
		borderRadius: 20,
	},
	textGallery: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		...LayoutStyle.marginTop10,
		color: Colors.secondary,
	},
	uploadImg: {
		backgroundColor: Colors.inputfillBG,
		justifyContent: "center",
	},
	selectImgsBig: {
		borderRadius: 12,
		height: deviceHeight / 3,
	},
	input: {
		color: Colors.inputBlackText,
		width: "90%",
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize14,
		...LayoutStyle.marginLeft10,
		marginLeft: 10,
	},
	optionalTxt: {
		fontSize: 10,
		color: Colors.labelDarkGray,
	},
});

export default ContactStyle;
