import { Platform, StatusBar, StyleSheet } from "react-native";
import CommonStyles from "./CommonStyles";
import LayoutStyle from "./LayoutStyle";
import Colors from "./Colors";
import FontFamily from "../assets/fonts/FontFamily";
import { RFPercentage } from "./ResponsiveFonts";
import { deviceHeight, deviceWidth } from "../utils/DeviceInfo";
import { heightPercentageToDP as hp } from "./ResponsiveScreens";

const IncidentStyle = StyleSheet.create({
	mainContainer: {
		...CommonStyles.mainContainer,
	},
	mainBG: {
		backgroundColor: Colors.darkBGColor,
		flex: 1,
	},
	backgroundWhite: {
		...CommonStyles.backgroundWhite,
	},
	// Incident home screen style start...
	headerDescContainer: {
		...CommonStyles.directionRowCenter,
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
	container: {
		backgroundColor: Colors.primary,
		...LayoutStyle.paddingHorizontal20,
		...LayoutStyle.paddingBottom20,
		height: Platform.OS === "android" ? deviceHeight / 1.7 : deviceHeight / 2.1,
	},
	flexEndcontainer: {
		alignItems: "flex-end",
		...LayoutStyle.marginTop20,
	},
	// Incident flatList  style
	incidentListContainer: {
		...LayoutStyle.paddingTop20,
	},
	incidentImg: {
		height: Platform.OS === "android" ? deviceHeight / 8 : deviceHeight / 12,
		width: deviceWidth / 2.39,
	},
	incidentViewImg: {
		flexDirection: "column",
		height: Platform.OS === "android" ? deviceHeight / 8 : deviceHeight / 12,
		width: deviceWidth / 2.39,
		justifyContent: "space-between",
		padding: 5,
		backgroundColor: Colors.blackTransparent,
		borderTopRightRadius: 8,
		borderTopLeftRadius: 8,
	},
	incidentImgAll: {
		height: deviceHeight / 8,
		width: deviceWidth / 2.39,
	},
	incidentViewImgAll: {
		flexDirection: "column",
		height: deviceHeight / 8,
		width: deviceWidth / 2.39,
		justifyContent: "space-between",
		padding: 5,
		backgroundColor: Colors.blackTransparent,
		borderTopLeftRadius: 8,
		borderBottomLeftRadius: 8,
	},
	incidentEnd: {
		justifyContent: "flex-end",
		alignItems: "flex-end",
		alignContent: "flex-end",
	},
	incidentTextContainer: {
		borderBottomRightRadius: 8,
		borderBottomLeftRadius: 8,
		backgroundColor: Colors.darkBGColor,
		...LayoutStyle.padding15,
	},
	incidentDesc: {
		color: Colors.white,
		...LayoutStyle.fontSize8,
		fontFamily: FontFamily.PoppinsRegular,
		lineHeight: 20,
		textAlign: "center",
	},
	incidentTitle: {
		color: Colors.white,
		...LayoutStyle.fontSize12,
		fontFamily: FontFamily.PoppinsRegular,
		textAlign: "center",
	},

	textIconContainer: {
		...CommonStyles.directionRowCenter,
	},

	// Incident archive flatList text container style
	incidentATextContainer: {
		borderBottomRightRadius: 8,
		borderBottomLeftRadius: 8,
		backgroundColor: "#235174",
		...LayoutStyle.padding15,
	},
	viewMoreText: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		...LayoutStyle.marginRight10,
		color: Colors.secondary,
	},
	btnContainer: {
		...LayoutStyle.paddingTop30,
		...LayoutStyle.paddingBottom20,
		...LayoutStyle.paddingHorizontal20,
	},
	// All incident screen style start
	allContainer: {
		...LayoutStyle.paddingHorizontal20,
		...LayoutStyle.paddingBottom20,
		flex: 1,
	},
	backgroundColorBlue: {
		backgroundColor: Colors.primary,
	},
	// all incident flatlist style
	allIncidentListContainer: {
		...LayoutStyle.marginTop20,
		...CommonStyles.directionRowCenter,
		backgroundColor: Colors.darkBGColor,
		borderRadius: 8,
	},
	allIncidentTextContainer: {
		...LayoutStyle.padding15,
		height: deviceHeight / 10,
		justifyContent: "center",
		...LayoutStyle.marginLeft10,
	},
	allIncidentDesc: {
		color: Colors.white,
		...LayoutStyle.fontSize8,
		fontFamily: FontFamily.PoppinsRegular,
		lineHeight: 20,
	},
	allIncidentTitle: {
		color: Colors.white,
		...LayoutStyle.fontSize12,
		fontFamily: FontFamily.PoppinsRegular,
	},

	// Add incident style
	addIncidentcontainer: {
		backgroundColor: Colors.lightBlue,
		...LayoutStyle.paddingHorizontal20,
	},
	listIncident: {
		flexDirection: "row",
	},
	incidentInfoText: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
		...LayoutStyle.marginLeft20,
		...LayoutStyle.paddingVertical20,
	},
	incidentInfoIndex: {
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
		...LayoutStyle.paddingVertical20,
	},
	// one line border in loop
	borderBottomGrayLoop: {
		borderBottomColor: Colors.loopBorder,
		borderBottomWidth: 1,
	},
	// List of incident
	darkBlackText: {
		fontFamily: FontFamily.PoppinsRegular,
		color: Colors.labelWhite,
		...LayoutStyle.fontSize12,
	},
	lightText: {
		fontFamily: FontFamily.PoppinsRegular,
		color: Colors.labelGray,
		...LayoutStyle.fontSize12,
	},
	paddingFormContainer: {
		...LayoutStyle.paddingHorizontal20,
		...LayoutStyle.paddingBottom50,
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20,
	},
	incidentListView: {
		...LayoutStyle.padding20,
		...LayoutStyle.marginTop20,
		backgroundColor: Colors.darkBGColor,
		borderRadius: 12,
	},
	incidentNameIcon: {
		...CommonStyles.directionRowCenter,
	},
	incidentLable: {
		...LayoutStyle.fontSize12,
		color: Colors.white,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.marginLeft20,
	},
	imgCardContainer: {
		...LayoutStyle.paddingBottom30,
		backgroundColor: Colors.white,
	},
	incidentBGImg: {
		height: deviceHeight / 4.5,
		width: 300,
	},
	incidentBGFlexEnd: {
		justifyContent: "flex-end",
		alignItems: "flex-end",
		alignContent: "flex-end",
		...LayoutStyle.marginRight10,
		...LayoutStyle.marginTop10,
	},
	animatedViewContainer: {
		height: deviceHeight / 4.5,
		width: "100%",
		alignItems: "center",
	},
	animatedView: {
		height: deviceHeight / 4.5,
		width: 300,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	detailsLabel: {
		...LayoutStyle.paddingBottom10,
		...LayoutStyle.paddingTop20,
		...LayoutStyle.fontSize12,
		fontFamily: FontFamily.PoppinsRegular,
		color: Colors.labelBlack,
	},
	// Incident manual style
	answerOptions: {
		...LayoutStyle.paddingVertical20,
	},
	lightQusText: {
		fontFamily: FontFamily.PoppinsRegular,
		color: Colors.labelGray,
		...LayoutStyle.fontSize12,
	},
	darkQusText: {
		fontFamily: FontFamily.PoppinsRegular,
		color: Colors.labelWhite,
		...LayoutStyle.fontSize12,
	},
	scanIcon: {
		flexDirection: "row",
	},
	cameraIcon: {
		justifyContent: "space-between",
		flexDirection: "row",
	},
	flexEnd: {
		justifyContent: "flex-end",
		alignItems: "flex-end",
		...LayoutStyle.paddingTop30,
		...LayoutStyle.marginVertical10,
	},
	scanText: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.secondary,
		...LayoutStyle.marginRight20,
	},
	uploadImg: {
		backgroundColor: Colors.darkBGColor,
		justifyContent: "center",
		...LayoutStyle.paddingHorizontal20,
		...LayoutStyle.marginTop20,
	},
	selectImgsBig: {
		borderRadius: 12,
		height: deviceHeight / 3,
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
	},

	uploadImgText: {
		backgroundColor: Colors.darkBGColor,
		height: deviceHeight / 3.8,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 12,
		...LayoutStyle.marginBottom10,
		...LayoutStyle.marginTop20,
	},
	textGallery: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		...LayoutStyle.marginTop10,
		color: Colors.secondary,
	},
	// glass only
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
	dateLabel: {
		color: Colors.secondary,
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize12,
	},
	width75: {
		width: "75%",
	},
	// answerOption for accident type rear-end style start
	answerOptionsAccident: {
		...LayoutStyle.paddingBottom20,
	},
	lightQusTextAccident: {
		fontFamily: FontFamily.PoppinsRegular,
		color: Colors.labelGray,
		...LayoutStyle.fontSize12,
		...LayoutStyle.marginBottom10,
	},
	darkQusTextAccident: {
		fontFamily: FontFamily.PoppinsRegular,
		color: Colors.labelWhite,
		...LayoutStyle.fontSize12,
	},
	carFrontImg: {
		height: 50,
		width: deviceWidth / 1.6,
	},
	carMidddleImg: {
		height: 50,
		width: deviceWidth / 1.3,
	},
	carBackImg: {
		height: 50,
		width: deviceWidth / 1.6,
	},
	carImgRadio: {
		...CommonStyles.directionRowSB,
		...LayoutStyle.marginTop20,
	},
	imgTextPaddingTop: {
		fontFamily: FontFamily.PoppinsRegular,
		color: Colors.white,
		...LayoutStyle.fontSize12,
		...LayoutStyle.marginTop20,
	},
	mainFlex94: {
		flex: 0.94,
	},
	// Truck image style in all screen
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

	// Incident review screen style start...
	reviewIncident: {
		height: 100,
		width: deviceWidth / 1.5,
	},
	imgBGContainer: {
		...LayoutStyle.marginTop10,
	},
	indexDisplay: {
		padding: "1%",
		borderWidth: 0.5,
	},
	descContainer: {
		...LayoutStyle.marginBottom20,
	},
	reviewDesc: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize8,
		color: Colors.labelDarkGray,
	},
	incidentReviewForm: {
		...LayoutStyle.padding20,
		backgroundColor: Colors.lightBlue,
		flex: 1,
	},
	keyLabelContainer: {
		paddingVertical: Platform.OS === "ios" ? "4%" : "3.2%",
		borderColor: "#C1DEF1",
		borderBottomWidth: 0.5,
		...LayoutStyle.marginBottom20,
	},
	labelKey: {
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize10,
		color: Colors.secondary,
	},
	labelValue: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
	},
	// Reimbursement screen
	darkContainer: {
		backgroundColor: Colors.lightBlue,
		height: StatusBar.currentHeight,
	},
	headerContainer: {
		...CommonStyles.directionRowSB,
		...CommonStyles.mainPaddingH,
		...LayoutStyle.paddingBottom10,
		backgroundColor: Colors.lightBlue,
		paddingTop: Platform.OS === "ios" ? 0 : 10,
		marginTop: Platform.OS === "ios" ? -30 : 0,
	},
	backArrow: {
		...LayoutStyle.paddingVertical10,
		...LayoutStyle.paddingRight20,
	},
	headerTextBlack: {
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize18,
	},
	headerSmallText: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize8,
		justifyContent: "flex-end",
		alignSelf: "flex-end",
		lineHeight: 14,
	},
	tabBarContainer: {
		backgroundColor: Colors.lightBlue,
		...LayoutStyle.padding20,
		borderBottomRightRadius: 20,
		borderBottomLeftRadius: 20,
	},
	darkTabview: {
		...CommonStyles.directionRowSB,
		borderWidth: 1,
		borderRadius: 12,
		borderColor: Colors.primary,
		...LayoutStyle.marginBottom20,
	},
	darkLayout: {
		// backgroundColor: Colors.primary,
		...LayoutStyle.padding15,
		borderTopLeftRadius: 10,
		borderBottomLeftRadius: 10,
		borderColor: Colors.primary,
		width: deviceWidth / 1.7,
	},
	lightLayout: {
		backgroundColor: Colors.transparent,
		...LayoutStyle.padding15,
	},
	totalLabel: {
		fontFamily: FontFamily.PoppinsRegular,
		color: Colors.white,
		...LayoutStyle.fontSize12,
		marginVertical: "2%",
		paddingTop: 2,
	},
	totalPriceText: {
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize16,
		color: Colors.labelBlack,
		paddingTop: 2,
	},
	// submit screen style started..
	bigTitle: {
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize34,
		color: Colors.labelWhite,
		textAlign: "center",
	},
	smallLabel: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize12,
		color: Colors.labelWhite,
		textAlign: "center",
		lineHeight: 18,
	},
	claimMainContainer: {
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
		backgroundColor: Colors.lightBlue,
		...LayoutStyle.paddingBottom20,
	},
	welcomeTitle: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
	},
	welcomeLabel: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
	},
	welcomeBold: {
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
		width: "75%",
	},
	claimTalkDesc: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
		...LayoutStyle.marginVertical20,
		lineHeight: 22,
	},
	claimTalkDate: {
		color: Colors.white,
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize12,
	},
	timePickerContainer: {
		...CommonStyles.directionRowCenter,
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: Colors.inputBorder,
	},
	timePickerPlaceholder: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize14,
		color: Colors.placeholder,
		marginTop: 2,
		marginLeft: "9%",
	},
	claimTalkDateText: {
		...CommonStyles.directionRowCenter,
		...LayoutStyle.marginVertical20,
		backgroundColor: Colors.primary,
		height: 50,
		...LayoutStyle.paddingHorizontal20,
		borderRadius: 20,
	},
	btnBorderToday: {
		...LayoutStyle.padding10,
		borderWidth: 1,
		borderColor: Colors.secondary,
		borderRadius: 20,
	},
	todayText: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlue,
		...LayoutStyle.paddingHorizontal10,
	},
	cameraStatusBar: {
		...CommonStyles.directionRowSB,
		paddingTop: "12%",
		paddingBottom: "2%",
		...LayoutStyle.paddingHorizontal20,
		backgroundColor: Colors.modalTransparent,
	},
	CameraTextcontainer: {
		position: "absolute",
		bottom: 105,
		width: "100%",
		backgroundColor: Colors.darkBGColor,
		...LayoutStyle.padding20,
	},
	cameraTextStyle: {
		color: Colors.white,
		...LayoutStyle.fontSize14,
		fontFamily: FontFamily.PoppinsRegular,
	},
	placeholderQus: {
		fontFamily: FontFamily.PoppinsRegular,
		color: Colors.white,
		...LayoutStyle.fontSize8,
		textAlign: "center",
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
		...LayoutStyle.marginTop20,
	},
	cameraLabel: {
		...LayoutStyle.fontSize18,
		fontFamily: FontFamily.PoppinsSemiBold,
		color: Colors.labelBlack,
	},
	cameraName: {
		...LayoutStyle.fontSize18,
		fontFamily: FontFamily.PoppinsSemiBold,
		color: Colors.secondary,
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
	iconTextContainer: {
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",
		...LayoutStyle.marginVertical10,
	},
	smallGrayLabel: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize8,
		color: Colors.labelBlack,
		...LayoutStyle.marginRight10,
	},
	imgDisplay: {
		height: deviceHeight / 10,
		width: deviceWidth / 1.5,
		...LayoutStyle.marginBottom20,
		alignSelf: "center",
	},
	inputLocation: {
		backgroundColor: Colors.primary,
		borderRadius: 25,
		...LayoutStyle.paddingHorizontal20,
		flexDirection: "row",
		alignItems: "center",
		...LayoutStyle.paddingVertical10,
	},
	locationText: {
		color: Colors.secondary,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize10,
	},
	locationValue: {
		color: Colors.labelWhite,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize10,
		width: "80%",
	},
	loadingText: {
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize10,
		...LayoutStyle.marginBottom20,
	},
	document: {
		...LayoutStyle.marginBottom20,
		alignItems: "center",
	},
	documentText: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
		...LayoutStyle.marginTop10,
	},
	dropdownMonth: {
		fontFamily: FontFamily.PoppinsLight,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlue,
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
	progressContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f0f0f0",
	},
	progressCard: {
		width: 300,
		padding: 20,
		backgroundColor: "#fff",
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.5,
		elevation: 5,
		justifyContent: "center",
		alignItems: "center",
	},
	detailContainer: {
		paddingHorizontal: 20,
		paddingBottom: 10,
	},
	detailTitle: {
		fontSize: 14,
		fontFamily: FontFamily.PoppinsSemiBold,
		color: Colors.labelBlack,
	},
	videoBox: {
		height: "100%",
		width: "100%",
		backgroundColor: "#f5f5f5",
		borderRadius: 10,
		overflow: "hidden",
	},
	videoPlayer: {
		height: "100%",
		width: "100%",
		backgroundColor: "#f5f5f5",
		borderRadius: 10,
	},
	claimImageContainer: {
		paddingHorizontal: 20,
		backgroundColor: Colors.white,
		...LayoutStyle.paddingVertical20,
	},
	claimImageCarousel: {
		justifyContent: "center",
		alignItems: "center",
		flex: 1,
	},
	thumbnailContainer: {
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		height: "100%",
		backgroundColor: "#000",
	},
	thumbnail: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
	},
	thumbnailPlaceholder: {
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#ccc",
	},
	placeholderImage: {
		width: 50,
		height: 50,
		resizeMode: "contain",
	},
	videoDownloadBtn: {
		position: "absolute",
		top: 10,
		right: 10,
	},
	seeMoreTxt: {
		fontSize: 12,
		fontFamily: FontFamily.PoppinsRegular,
		color: Colors.secondary,
	},
	fullVideo: {
		position: "absolute",
		height: deviceHeight,
		width: deviceWidth,
	},
	allIncidentTitle1: {
		color: Colors.white,
		...LayoutStyle.fontSize10,
		fontFamily: FontFamily.PoppinsRegular,
	},
	sliderBox: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
	},
	locationPinLoader: {
		height: 18,
		width: 18,
		justifyContent: "center",
		alignItems: "center",
	},
	swiperContainer: {
		height: 250,
	},
	swiperDot: {
		height: 12,
		width: 12,
		borderRadius: 6,
		marginHorizontal: 3,
	},
	swiperActiveDot: {
		height: 12,
		width: 12,
		borderRadius: 6,
		marginHorizontal: 3,
	},
	swiperPagination: {
		// bottom: 20,
		paddingVertical: 20,
	},
	swiperImage: {
		height: 160,
		width: "90%",
		alignSelf: "center",
	},
	draftLabel: {
		backgroundColor: Colors.secondary,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: 20,
	},
	draftTxt: {
		color: Colors.white,
		fontSize: 10,
	},
	detailSwiperContainer: {
		height: 160,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 10,
		marginBottom: 0,
	},
	detailSwiperImg: {
		height: "100%",
		width: "100%",
		borderRadius: 10,
	},
	detailNoImg: {
		height: 160,
		width: "100%",
		borderRadius: 10,
		marginBottom: 0,
	},
	continueDraft: {
		paddingHorizontal: 20,
		paddingVertical: 25,
		backgroundColor: "#fff",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -3 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 5,
		borderTopWidth: 1,
		borderTopColor: "#ddd",
	},
	containerColumn: {
		flexGrow: 1,
		flexDirection: "column",
		justifyContent: "space-between",
	},
	detailYelloBox: {
		flex: 1,
		paddingHorizontal: 20,
		paddingBottom: 10,
		backgroundColor: "#FFF2CD",
	},
	submittedTitleBox: {
		flex: 1.6,
		justifyContent: "center",
		padding: 20,
		flexDirection: "column",
		paddingTop: "60%",
		position: "relative",
		zIndex: 9,
	},
	claimVideoContainer: {
		height: deviceHeight / 4,
		width: deviceWidth / 1.12,
		marginHorizontal: 20,
		marginBottom: 30,
		marginTop: 10,
	},
	imageErrContainer: {
		...StyleSheet.absoluteFill,
		backgroundColor: "rgba(0,0,0,0.6)",
		justifyContent: "center",
		alignItems: "center",
		...LayoutStyle.marginHorizontal20,
		borderRadius: 16,
	},
	imageErrTxt: {
		color: Colors.white,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsMedium,
		marginTop: 5,
	},
	talkImageErr: {
		...StyleSheet.absoluteFill,
		backgroundColor: "rgba(0,0,0,0.6)",
		justifyContent: "center",
		alignItems: "center",
		height: 160,
		width: "100%",
		borderRadius: 16,
	},
	animReimbursement: {
		backgroundColor: Colors.primary,
		position: "absolute",
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		borderTopLeftRadius: 10,
		borderBottomLeftRadius: 10,
	},
});
export default IncidentStyle;
