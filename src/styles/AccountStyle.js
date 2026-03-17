import { Platform, StatusBar, StyleSheet } from "react-native";
import CommonStyles from "./CommonStyles";
import LayoutStyle from "./LayoutStyle";
import Colors from "./Colors";
import FontFamily from "../assets/fonts/FontFamily";
import { deviceHeight, deviceWidth } from "../utils/DeviceInfo";

const AccountStyle = StyleSheet.create({
	mainContainer: {
		...CommonStyles.mainContainer,
	},
	backgroundWhite: {
		...CommonStyles.backgroundWhite,
	},
	flex: {
		flex: 1,
	},
	backgroundDarkBlue: {
		backgroundColor: Colors.primary,
	},
	acHeaderConatiner: {
		backgroundColor: Colors.primary,
		...LayoutStyle.paddingHorizontal20,
		...LayoutStyle.paddingBottom20,
	},
	acProfileContainer: {
		...CommonStyles.directionRowCenter,
	},
	acDesc: {
		...LayoutStyle.marginHorizontal20,
	},
	profile: {
		borderWidth: 1,
		borderRadius: 50,
		borderColor: Colors.secondary,
	},
	headeProfileIcon: {
		height: 45,
		width: 45,
		borderRadius: 50,
	},
	userNameDark: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize10,
		color: Colors.labelWhite,
		height: 18,
	},
	memberShipDate: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize10,
		color: Colors.labelGray,
		height: 18,
	},
	buttonContainer: {
		...CommonStyles.directionRowSB,
	},
	btnViews: {
		backgroundColor: Colors.primaryBG20,
		...LayoutStyle.padding15,
		borderRadius: 7,
		alignItems: "center",
		width: deviceWidth / 2.4,
	},
	btnLabel: {
		...LayoutStyle.fontSize12,
		fontFamily: FontFamily.PoppinsMedium,
		color: Colors.labelBlack,
	},
	mainProgressBar: {
		...CommonStyles.directionRowSB,
		...LayoutStyle.marginTop20,
		...LayoutStyle.padding20,
		backgroundColor: Colors.primaryBG20,
		borderRadius: 7,
	},
	labelBlack: {
		...LayoutStyle.fontSize12,
		fontFamily: FontFamily.PoppinsMedium,
		color: Colors.labelBlack,
	},
	labelGray: {
		...LayoutStyle.fontSize10,
		fontFamily: FontFamily.PoppinsRegular,
		color: Colors.labelDarkGray,
	},
	progressText: {
		...LayoutStyle.fontSize8,
		fontFamily: FontFamily.PoppinsMedium,
		color: Colors.labelBlack,
		marginTop: 3,
	},
	cardImage: {
		width: "100%",
		...LayoutStyle.marginTop20,
		...LayoutStyle.marginBottom10,
	},
	cardContainer: {
		width: "100%",
		justifyContent: "center",
		height: 75,
		borderRadius: 12,
		backgroundColor: "#392E96DB",
	},
	cardCompnayName: {
		fontFamily: FontFamily.PoppinsSemiBold,
		color: Colors.labelWhite,
		...LayoutStyle.fontSize16,
		...LayoutStyle.marginHorizontal20,
	},
	selectPassContainer: {
		width: "100%",
		justifyContent: "center",
		height: 60,
		borderRadius: 12,
		backgroundColor: "#392E96DB",
	},
	checkboxPassContainer: {
		...CommonStyles.mainPaddingH,
		...LayoutStyle.marginTop20,
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	// one line border with light primary color
	borderBottom: {
		borderBottomColor: Colors.darkBorder,
		borderBottomWidth: 1,
		...LayoutStyle.marginTop20,
	},
	optionContainer: {
		flexDirection: "row-reverse",
		justifyContent: "flex-end",
		alignItems: "center",
		marginVertical: 0,
		...LayoutStyle.marginTop20,
	},
	optionsLabel: {
		...LayoutStyle.marginLeft20,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize14,
	},
	accountInfo: {
		...LayoutStyle.paddingTop30,
		...CommonStyles.directionRowSB,
	},
	version: {
		...LayoutStyle.fontSize8,
		fontFamily: FontFamily.PoppinsRegular,
		color: "#25252585",
	},
	resetApp: {
		...LayoutStyle.fontSize16,
		fontFamily: FontFamily.PoppinsSemiBold,
		color: Colors.danger,
	},

	// Settings screen
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
	profileCard: {
		borderBottomRightRadius: 20,
		borderBottomLeftRadius: 20,
		...LayoutStyle.paddingBottom30,
		...CommonStyles.mainPaddingH,
		backgroundColor: Colors.lightBlue,
	},
	settingProfileView: {
		...CommonStyles.directionRowCenter,
		...LayoutStyle.marginBottom20,
	},
	mobileNumb: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
		...LayoutStyle.marginRight10,
	},
	profileImgView: {
		borderWidth: 1.5,
		borderRadius: 100,
		borderColor: Colors.secondary,
	},
	profileImg: {
		height: deviceHeight / 9,
		width: deviceHeight / 9,
		borderRadius: 100,
	},
	verifyContainer: {
		...CommonStyles.directionRowCenter,
	},
	userInfo: { ...LayoutStyle.marginHorizontal20 },
	userName: {
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize14,
		color: Colors.labelBlack,
	},
	detailsView: {
		...CommonStyles.mainPadding,
		backgroundColor: Colors.white,
	},
	titleLabel: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize16,
		color: Colors.labelBlack,
	},
	subTitle: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize10,
		color: Colors.labelDarkGray,
		...LayoutStyle.marginBottom10,
	},
	cityBG: {
		backgroundColor: Colors.primaryBG20,
		borderRadius: 5,
		padding: "4%",
		...LayoutStyle.marginRight10,
		width: 64,
		justifyContent: "center",
		alignItems: "center",
	},
	borderBottomGray: {
		borderBottomColor: Colors.cardBorder,
		borderBottomWidth: 1,
		...LayoutStyle.marginTop10,
	},
	listContainer: {
		...CommonStyles.directionRowSB,
		...LayoutStyle.marginTop10,
	},
	svgTextContain: { ...CommonStyles.directionRowCenter },
	destinationLabel: {
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
		lineHeight: 18,
	},
	destinationValue: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize8,
		color: Colors.labelBlack,
		lineHeight: 16,
	},
	actionIcon: {
		...LayoutStyle.paddingVertical10,
		...LayoutStyle.paddingLeft20,
	},
	manuContainer: {
		flexDirection: "row",
		...LayoutStyle.marginVertical10,
	},
	manuTitle: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize16,
		color: Colors.labelBlack,
		...LayoutStyle.marginVertical10,
	},
	manuLabel: {
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
		lineHeight: 22,
		width: "90%",
	},
	manuDesc: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize10,
		color: Colors.labelDarkGray,
		lineHeight: 18,
		...LayoutStyle.marginRight10,
		flexWrap: "wrap",
	},
	actionModal: {
		...LayoutStyle.padding20,
		backgroundColor: Colors.white,
		borderRadius: 12,
	},
	modalHeader: {
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize16,
		color: Colors.labelBlack,
	},
	shareModalCenter: {
		flexGrow: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.blackTransparent,
		...LayoutStyle.padding15,
		marginTop: "20%",
	},
	centerModal: {
		...CommonStyles.directionRowSB,
	},
	addrContainer: {
		justifyContent: "center",
		alignItems: "center",
		...LayoutStyle.marginVertical20,
	},
	addressDisplay: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
	},
	actionIconContainer: {
		...CommonStyles.directionRowSB,
	},
	actionIconsView: {
		alignItems: "center",
		borderRadius: 6,
		width: "31.5%",
		...LayoutStyle.paddingVertical20,
	},
	iconText: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize8,
		marginTop: "8%",
		color: Colors.labelBlack,
	},

	// Safety check up screen design started

	safetyStatusBar: {
		backgroundColor: Colors.lightGrayBG,
		height: StatusBar.currentHeight,
	},
	safetyheaderBar: {
		...CommonStyles.mainPaddingH,
		...LayoutStyle.paddingBottom30,
		backgroundColor: Colors.lightGrayBG,
		paddingTop: Platform.OS === "ios" ? 0 : 10,
		// marginTop: Platform.OS === "ios" ? -30 : 0,
		...CommonStyles.directionRowSB,
	},
	safetyHeaderText: {
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize18,
	},
	progressBarContainer: {
		backgroundColor: Colors.lightGrayBG,
		justifyContent: "center",
		paddingBottom: "10%",
		...LayoutStyle.paddingHorizontal20,
	},
	historyListContainer: {
		...LayoutStyle.padding20,
		backgroundColor: Colors.white,
		flex: 1,
	},
	titleHistory: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize14,
		...LayoutStyle.marginBottom10,
		...LayoutStyle.paddingVertical10,
	},
	// History Card
	detailsContainer: {
		...CommonStyles.directionRowSB,
		marginVertical: "4%",
	},
	dateTimeValue: {
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize10,
	},
	mileValue: {
		color: Colors.labelDarkGray,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize8,
	},
	percentageValue: {
		color: Colors.secondary,
		fontFamily: FontFamily.PoppinsBold,
		...LayoutStyle.fontSize14,
	},
	// Score card
	suggestedLabel: {
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize10,
		...LayoutStyle.marginTop10,
		alignSelf: "center",
	},
	smallLogo: { height: 20, width: 20, alignSelf: "center" },
	speedValue: {
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsBold,
		...LayoutStyle.fontSize10,
	},
	speedDescValue: {
		color: Colors.labelDarkGray,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize8,
	},
	// one line border in loop
	borderBottomGrayLoop: {
		borderBottomColor: Colors.loopBorder,
		borderBottomWidth: 1,
	},
	carouselContainer: {
		...CommonStyles.directionRowCenter,
		...LayoutStyle.marginTop20,
		justifyContent: "center",
	},
	carousel: {
		padding: "1.5%",
		...LayoutStyle.margin10,
		borderRadius: 10,
		borderWidth: 1,
	},
	barMainContainer: {
		marginTop: "10%",
		flexDirection: "row",
		width: "100%",
	},
	progressLine: {
		backgroundColor: Colors.secondary,
		borderTopLeftRadius: 25,
		borderBottomLeftRadius: 25,
		paddingVertical: "7%",
	},
	scoreText: {
		fontFamily: FontFamily.PoppinsRegular,
		color: Colors.labelBlack,
		...LayoutStyle.fontSize8,
	},
	lineBar: {
		...CommonStyles.directionRowSB,
		...LayoutStyle.paddingHorizontal20,
		marginTop: -deviceHeight / 23.5,
	},
	rowProgressLine: {
		...CommonStyles.directionRowCenter,
	},
	scoreValue: {
		fontFamily: FontFamily.PoppinsBold,
		color: Colors.labelBlack,
		...LayoutStyle.fontSize14,
		alignSelf: "center",
	},
	scoreValueContainer: {
		backgroundColor: Colors.lightBlue,
		borderTopRightRadius: 25,
		borderBottomRightRadius: 25,
		borderTopWidth: 1,
		borderEndWidth: 1,
		borderBottomWidth: 1,
		borderTopColor: Colors.secondary,
		borderBottomColor: Colors.secondary,
		borderEndColor: Colors.secondary,
	},
	// Edit profile style start
	editProfileMainForm: {
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
		...LayoutStyle.paddingBottom30,
	},

	editProfileContainer: {
		height: 80,
		width: 80,
		backgroundColor: "#00000022",
		borderRadius: 80,
		justifyContent: "center",
		alignItems: "center",
	},
	verificationText: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize10,
		color: Colors.secondary,
		textAlign: "center",
	},
	editProfileCenter: { justifyContent: "center", alignItems: "center" },
	editProfileBorder: {
		borderWidth: 2,
		borderColor: Colors.secondary,
		borderRadius: 100,
	},
	// Legal List style start
	legalListStyle: {
		...LayoutStyle.marginHorizontal20,
		borderTopWidth: 1,
		borderTopColor: Colors.darkBorder,
	},
	legalLsitContainer: {
		borderBottomWidth: 1,
		borderBottomColor: Colors.darkBorder,
	},
	legalLsitText: {
		...LayoutStyle.paddingVertical20,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
	},
	// Legal Data descroiption style start
	legalDataContainer: {
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
	},
	legalDescription: {
		color: Colors.labelWhite,
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize12,
		lineHeight: Platform.OS === "android" ? 24 : 22,
	},
	// Security with 2FA toogle style start
	securityMainContainer: {
		maxHeight: "70%",
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
		backgroundColor: Colors.lightGrayBG,
		// ...CommonStyles.mainPaddingH,
		paddingHorizontal: 20,
		...LayoutStyle.paddingBottom20,
	},
	question: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
	},
	qusDescription: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize10,
		color: Colors.labelBlack,
		...LayoutStyle.marginTop10,
	},
	toggleTextContainer: {
		...CommonStyles.directionRowSB,
		...LayoutStyle.paddingVertical20,
		...LayoutStyle.marginVertical20,
		borderBottomWidth: 1,
		borderTopWidth: 1,
	},
	verifiactionText: {
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
	},
	// modal button container style start
	modalBtnContainer: {
		...LayoutStyle.padding10,
		borderRadius: 30,
		...LayoutStyle.marginTop20,
	},
	modalBtnLabel: {
		color: Colors.labelWhite,
		fontFamily: FontFamily.PoppinsMedium,
		alignSelf: "center",
		...LayoutStyle.fontSize14,
		padding: "1%",
	},
	smallLabel: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize8,
		textAlign: "center",
		...LayoutStyle.marginTop20,
		color: Colors.labelBlack,
	},
	// Legal policy titles tyle start
	policyTitle: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize14,
		color: Colors.labelBlack,
	},
	// Crash Detection style start
	wordsBold: {
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize10,
		color: Colors.labelBlack,
	},
	lightDescription: {
		textAlign: "auto",
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize10,
		color: Colors.labelBlack,
	},
	// Notification style start
	mediumLabel: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
		...LayoutStyle.paddingBottom20,
	},
	notifLabel: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
	},
	wordsBoldMedium: {
		fontFamily: FontFamily.PoppinsSemiBold,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
		width: "84%",
	},
	notifToggle: {
		...LayoutStyle.paddingLeft10,
	},
	toggleNotifContainer: {
		...CommonStyles.directionRowSB,
		...LayoutStyle.paddingVertical10,
		borderColor: Colors.darkBorder,
		borderTopWidth: 1,
	},
	// Add contact style start
	addContactContainer: {
		maxHeight: "70%",
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
		backgroundColor: Colors.lightGrayBG,
		...CommonStyles.mainPaddingH,
		...LayoutStyle.paddingBottom20,
		...LayoutStyle.marginBottom20,
	},
	addContactName: {
		fontFamily: FontFamily.PoppinsSemiBold,
		color: Colors.labelBlack,
		...LayoutStyle.fontSize12,
	},
	contactList: {
		justifyContent: "space-between",
		flexDirection: "row",
		paddingHorizontal: 20,
		paddingVertical: 10,
		alignItems: "center",
	},
	textImage: {
		height: 45,
		width: 45,
		borderRadius: 50,
		justifyContent: "center",
	},
	contactImg: {
		height: 45,
		width: 45,
		borderRadius: 50,
		justifyContent: "center",
	},
	textColor: {
		alignSelf: "center",
		textAlign: "center",
		fontFamily: FontFamily.PoppinsSemiBold,
		color: Colors.labelWhite,
		...LayoutStyle.fontSize24,
	},
	addBtn: {
		...LayoutStyle.paddingHorizontal20,
		...LayoutStyle.paddingBottom30,
		borderRadius: 20,
	},
	counterSelected: {
		...LayoutStyle.padding10,
		...LayoutStyle.fontSize12,
		fontFamily: FontFamily.PoppinsMedium,
		color: Colors.labelBlack,
		alignSelf: "center",
		...LayoutStyle.paddingBottom30,
		...LayoutStyle.paddingTop20,
	},
	// invite contact style start
	mainInviteContainer: {
		...CommonStyles.mainPaddingH,
	},
	inviteText: {
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
		color: Colors.labelBlack,
	},
	// trusted contact list style start
	contactContainer: {
		backgroundColor: Colors.white,
	},

	container: {
		padding: 24,
	},
	title: {
		fontSize: 32,
		fontWeight: "700",
		color: "#1d1d1d",
		marginBottom: 12,
	},
	// Contact list container
	contactListContainer: {
		...LayoutStyle.marginRight20,
		...LayoutStyle.paddingHorizontal20,
		paddingVertical: "1%",
	},
	contactName: {
		fontFamily: FontFamily.PoppinsMedium,
		color: Colors.labelBlack,
		...LayoutStyle.fontSize12,
	},
	AZContianer: {
		...LayoutStyle.marginRight20,
		...LayoutStyle.paddingHorizontal20,
		paddingVertical: "1%",
		backgroundColor: Colors.lightGrayBG,
	},
	AZFontSize: {
		...LayoutStyle.fontSize8,
		lineHeight: 16,
		fontFamily: FontFamily.PoppinsSemiBold,
		paddingHorizontal: "1%",
		color: "#007AFE",
	},
	letterHeader: {
		fontFamily: FontFamily.PoppinsBold,
		...LayoutStyle.fontSize14,
		color: Colors.labelBlack,
	},
	indicatorFontStyle: {
		color: Colors.white,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
	},
	selectCardContainer: {
		width: "100%",
		justifyContent: "center",
	},
	selectCardImage: {
		width: "90%",
	},
	selectCardTitle: {
		fontFamily: FontFamily.PoppinsSemiBold,
		color: Colors.labelWhite,
		...LayoutStyle.fontSize16,
		...LayoutStyle.marginHorizontal20,
	},
	listPaddingDestination: {
		...CommonStyles.mainPaddingH,
		...LayoutStyle.marginTop10,
	},
	overrideGradient: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	textInput: {
		height: 50,
		width: "90%",
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize14,
		...LayoutStyle.marginLeft10,
		marginTop: Platform.OS === "android" ? 2 : 0,
		color: Colors.inputBlackText,
	},
	textInputContainer: {
		borderBottomWidth: 0.5,
		borderColor: Colors.inputBorder,
		...CommonStyles.directionRowCenter,
	},
	badgeCount: {
		padding: 3,
		backgroundColor: Colors.secondary60,
		borderRadius: 30,
		minWidth: 15,
		minHeight: 15,
		justifyContent: "center",
		alignItems: "center",
		position: "absolute",
		right: 5,
		top: 5,
	},
	countTxt: {
		color: Colors.white,
		fontSize: 8,
		fontWeight: "600",
	},
	permissionRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 10,
	},
	rowBetween: {
		marginTop: 5,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	deleteContainer: {
		paddingHorizontal: 20,
		paddingVertical: 15,
		backgroundColor: "#fff",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -3 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 5,
		borderTopWidth: 1,
		borderTopColor: "#ddd",
	},
	countryClose: {
		height: 15,
		width: 15,
	},
	destiSelectAll: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		marginBottom: 15,
	},
	phoneNumber: {
		fontSize: 12,
		fontFamily: FontFamily.PoppinsRegular,
	},
	SearchContainer: {
		backgroundColor: Colors.lightGrayBG,
		paddingVertical: 10,
		paddingHorizontal: 20,
	},
	searchContactInput: {
		backgroundColor: Colors.white,
		height: 35,
		borderRadius: 5,
	},
	searchBox: {
		backgroundColor: Colors.white,
		height: 35,
		borderRadius: 5,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	searchTxt: {
		fontSize: 14,
		color: Colors.labelDarkGray,
		fontFamily: FontFamily.PoppinsRegular,
	},
	emptyImg: {
		height: 70,
		width: "100%",
		marginTop: "2%",
	},
	emptyTitle: {
		fontSize: 14,
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
	emptyDescription: {
		fontSize: 12,
		color: Colors.labelDarkGray,
		textAlign: "center",
		marginBottom: 0,
	},
	inviteContact: {
		...LayoutStyle.marginRight20,
		...LayoutStyle.paddingHorizontal20,
		paddingVertical: "1%",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderBottomWidth: 0.5,
		borderBottomColor: Colors.cardBorder,
	},
	updateBtn: {
		...LayoutStyle.marginTop20,
		backgroundColor: Colors.white,
		borderColor: Colors.cardBorder,
		borderWidth: 1,
		padding: 10,
		borderRadius: 7,
		shadowColor: "#aaa",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.2,
		shadowRadius: 5,
		elevation: 0,
	},
	updateAvailableImg: {
		height: 34,
		width: 34,
		resizeMode: "contain",
	},
	updateDesTxt: {
		fontFamily: FontFamily.PoppinsRegular,
		...LayoutStyle.fontSize8,
		color: Colors.labelDarkGray,
		lineHeight: 15,
		...LayoutStyle.marginRight10,
		flexWrap: "wrap",
	},
	startEndTxt: {
		color: Colors.labelDarkGray,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize10,
	},
	addNewContact: {
		backgroundColor: Colors.secondary,
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: 5,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 10,
		width: "30%",
		alignSelf: "flex-end",
	},
	addNewTxt: {
		color: Colors.white,
		fontFamily: FontFamily.PoppinsRegular,
		fontSize: 12,
	},
	swipeDeleteBtn: {
		width: 100,
		backgroundColor: "#DA4C4C",
		justifyContent: "center",
		alignItems: "center",
		marginLeft: 5,
		borderBottomColor: Colors.cardBorder,
		borderBottomWidth: 1,
	},
	swipeDltTxt: {
		color: "#fff",
		fontWeight: "600",
	},
	showAllRow: {
		...LayoutStyle.marginTop10,
		...CommonStyles.directionRowCenter,
		justifyContent: "center",
	},
	showAllTxt: {
		color: Colors.secondary,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsMedium,
		marginRight: 5,
	},
	checkupDPage: {
		width: deviceWidth,
		...LayoutStyle.paddingHorizontal20,
	},
	checkupDotRow: {
		flexDirection: "row",
		justifyContent: "center",
		...LayoutStyle.paddingVertical20,
	},
	checkupDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginHorizontal: 5,
		borderWidth: 1.5,
	},
	drivingBackground: {
		backgroundColor: "#dceef8",
		...LayoutStyle.marginVertical20,
		...LayoutStyle.paddingVertical10,
		borderRadius: 30,
		borderWidth: 1,
		borderColor: Colors.secondary,
		overflow: "hidden",
	},
	fillDrivingBack: {
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		backgroundColor: Colors.secondary,
		borderTopLeftRadius: 30,
		borderBottomLeftRadius: 30,
	},
	rowSBCenter: {
		...CommonStyles.directionRowSB,
		alignItems: "center",
	},
	overallTxt: {
		fontSize: 12,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.marginLeft10,
	},
	drivingScorePR: {
		color: Colors.labelBlack,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsMedium,
	},
	drivingScoreRow: {
		...CommonStyles.directionRowSB,
		...LayoutStyle.paddingHorizontal20,
	},
});

export default AccountStyle;
