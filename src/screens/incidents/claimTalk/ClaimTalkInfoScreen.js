import React, { useState, useRef, useEffect } from "react";
import {
	ActivityIndicator,
	BackHandler,
	Keyboard,
	Platform,
	SafeAreaView,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import IncidentStyle from "../../../styles/IncidentStyles";
import Colors from "../../../styles/Colors";
import { Button, Icons, ValidationText } from "../../../components";
import LayoutStyle from "../../../styles/LayoutStyle";
import CommonStyles from "../../../styles/CommonStyles";
import { CalendarList } from "react-native-calendars";
import moment from "moment";
import FontFamily from "../../../assets/fonts/FontFamily";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
	isEmpty,
	validateAddressWithGeocoding,
} from "../../../utils/Validation";
import MESSAGE from "../../../utils/Messages";
import { showMessage } from "react-native-flash-message";
import { Dropdown } from "react-native-element-dropdown";
import MarkerLocationScreen from "./MarkerLocationScreen";
import { NoLocationPanel } from "../../../components/NoLocationPanel";
import CalendarLoader from "../../../components/CalendarLoader";
import ComponentStyles from "../../../styles/ComponentStyles";
import { fetchSuggestions } from "../../../config/CommonFunctions";
import {
	getCurrentLocation,
	locationPermission,
} from "../../../utils/Location";

const ClaimTalkInfoScreen = (props) => {
	const calendarRef = useRef(null);
	const refOrigin = useRef();
	const today = new Date();
	today.setDate(today.getDate() - 1);
	const maxSelectableDate = today.toISOString().split("T")[0];

	const [isStartLoading, setIsStartLoading] = useState(false);
	const [screenName, setScreenName] = useState("1");
	const [selected, setSelected] = useState("");
	const [selectedDate, setSelectedDate] = useState(
		moment().format("YYYY-MM-DD")
	);
	const [selectedMonth, setSelectedMonth] = useState(moment().format("MMMM"));
	const [selectedYear, setSelectedYear] = useState(moment().format("YYYY"));
	const [currentDate, setCurrentDate] = useState(moment().format("YYYY-MM-DD"));

	const [isCalendarLoading, setIsCalendarLoading] = useState(false);

	// for incident time
	const [incidentTime, setIncidentTime] = useState("");
	const [incidentTimeMsg, setIncidentTimeMsg] = useState("");
	const [incidentTimeOpen, setIncidentTimeOpen] = useState(false);
	const [isIncidentTime, setIsIncidentTime] = useState(false);
	const [incidentTimePress, setIncidentTimePress] = useState(true);

	const [showNoLocation, setShowNoLocation] = useState(false);
	const [markertScreen, setMarkerScreen] = useState(false);

	const [currentLocation, setCurrentLocation] = useState(null);

	const [searchLoading, setSearchLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [prevSearchTxt, setPrevSearchTxt] = useState("");
	const [placeId, setPlaceId] = useState("");
	const [searchCoords, setSearchCoords] = useState(null);
	const [searchTextPress, setSearchTextPress] = useState(true);
	const [isValidSearchedText, setIsValidSearchedTxt] = useState(false);
	const [validationMsg, setValidationMsg] = useState("");
	const [suggestions, setSuggestions] = useState([]);

	const months = [
		{ name: "January", abbreviation: "Jan", id: "1" },
		{ name: "February", abbreviation: "Feb", id: "2" },
		{ name: "March", abbreviation: "Mar", id: "3" },
		{ name: "April", abbreviation: "Apr", value: "4" },
		{ name: "May", abbreviation: "May", value: "5" },
		{ name: "June", abbreviation: "Jun", value: "6" },
		{ name: "July", abbreviation: "Jul", value: "7" },
		{ name: "August", abbreviation: "Aug", value: "8" },
		{ name: "September", abbreviation: "Sep", value: "9" },
		{ name: "October", abbreviation: "Oct", value: "10" },
		{ name: "November", abbreviation: "Nov", value: "11" },
		{ name: "December", abbreviation: "Dec", value: "12" },
	];
	const currentYear = moment().format("YYYY");
	const previouseYear = moment().subtract(1, "year").format("YYYY");

	const years = [
		{ name: currentYear ? currentYear : "", id: "1" },
		{ name: previouseYear ? previouseYear : "", id: "2" },
	];

	const getLiveLocation = async () => {
		const locPermissionGranted = await locationPermission();

		if (locPermissionGranted) {
			const { latitude, longitude } = await getCurrentLocation();
			setCurrentLocation({ latitude, longitude });
		}
	};

	useEffect(() => {
		getLiveLocation();
	}, []);

	useEffect(() => {
		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			gotoBack
		);
		return () => backHandler.remove();
	}, [screenName, markertScreen, props.navigation]);

	const gotoBack = () => {
		if (markertScreen) {
			setMarkerScreen(false);
		} else if (screenName === "4") {
			setScreenName("3");
		} else if (screenName === "3") {
			setScreenName("2");
		} else if (screenName === "2") {
			setScreenName("1");
		} else {
			props.navigation.goBack();
		}
		return true;
	};
	const gotoScreen2 = () => {
		setScreenName("2");
	};
	const gotoScreen3 = () => {
		setScreenName("3");
	};
	const gotoScreen4 = () => {
		const today = moment().format("YYYY-MM-DD");
		if (selectedDate > today) {
			showMessage({
				message: MESSAGE.incidentDateValid,
				type: "danger",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				autoHide: true,
			});
		} else {
			if (isEmpty(incidentTime)) {
				setIsIncidentTime(true);
				setIncidentTimeMsg(MESSAGE.incidentTime);
				return false;
			}
			setScreenName("4");
		}
	};
	const handleNextMonth = () => {
		setIsCalendarLoading(true);
		const nextMonth = moment(currentDate).add(1, "month").format("YYYY-MM-DD");
		setCurrentDate(nextMonth);
		const date = new Date(nextMonth);
		const monthName = date.toLocaleString("default", { month: "long" });
		setSelectedMonth(monthName);

		const newYear = date.getFullYear();
		setSelectedYear(newYear);
		setTimeout(() => {
			setIsCalendarLoading(false);
		}, 200);
	};
	const handlePreviousMonth = () => {
		setIsCalendarLoading(true);
		const previousMonth = moment(currentDate)
			.subtract(1, "month")
			.format("YYYY-MM-DD");
		setCurrentDate(previousMonth);
		const date = new Date(previousMonth);
		const monthName = date.toLocaleString("default", { month: "long" });
		setSelectedMonth(monthName);

		const newYear = date.getFullYear();
		setSelectedYear(newYear);
		setTimeout(() => {
			setIsCalendarLoading(false);
		}, 200);
	};
	const gotoToday = () => {
		setIsCalendarLoading(true);

		const today = moment();
		const formattedDate = today.format("YYYY-MM-DD");

		setSelectedDate(formattedDate);
		setCurrentDate(formattedDate);
		setSelectedMonth(today.format("MMMM"));
		setSelectedYear(today.format("YYYY"));

		setTimeout(() => {
			setIsCalendarLoading(false);
		}, 200);

		if (calendarRef.current) {
			calendarRef.current.scrollToMonth(today.format("YYYY-MM-01"), true);
		}
	};
	const gotoChangeMonth = async (month) => {
		setIsCalendarLoading(true);
		setSelectedMonth(month);
		const currentMonth = moment().format("M");
		const selectMonth = moment().month(month).format("M");
		const tempDate = selectedYear + "-" + currentMonth + "-" + "01";

		if (currentMonth < selectMonth) {
			const addMonth = selectMonth - currentMonth;
			const tempNextMonth = await moment(tempDate)
				.add(addMonth, "month")
				.format("YYYY-MM-DD");

			setIsCalendarLoading(false);
			setCurrentDate(tempNextMonth);
		} else {
			const subMonth = currentMonth - selectMonth;
			const tempPreMonth = await moment()
				.subtract(subMonth, "month")
				.format("YYYY-MM-DD");
			setIsCalendarLoading(false);
			setCurrentDate(tempPreMonth);
		}
	};
	const gotoChangeYear = async (year) => {
		setIsCalendarLoading(true);
		setSelectedYear(year);
		const currentYear = moment().format("YYYY");
		const monthCount = moment().month(selectedMonth).format("MM");
		const tempDate = currentYear + "-" + monthCount + "-" + "01";

		if (currentYear > year) {
			const tempYear = await moment(tempDate)
				.subtract(1, "year")
				.format("YYYY-MM-DD");

			setIsCalendarLoading(false);
			setCurrentDate(tempYear);
		} else if (currentYear == year) {
			const momentDate = await moment(tempDate).format("YYYY-MM-DD");
			setIsCalendarLoading(false);
			setCurrentDate(momentDate);
		}
	};
	const openIncidentTime = () => {
		setIncidentTimeOpen(true);
		setIncidentTimePress(true);
		setIsIncidentTime(false);
	};
	const confirmIncidentTime = (time) => {
		const formattedTime = moment(time).format("hh:mm A");
		setIncidentTime(formattedTime);
		setIncidentTimePress(false);
		hideIncidentTime();
	};
	const hideIncidentTime = () => {
		setIncidentTimeOpen(false);
	};
	const gotoCurrentLocation = () => {
		setMarkerScreen(!markertScreen);
		setShowNoLocation(false);
	};
	const fetchDatafromChild = (data, location) => {
		setMarkerScreen(false);

		setSearchText(data);
		setSearchCoords(location);

		setIsValidSearchedTxt(false);
		setValidationMsg("");
	};
	const closeMarkerScreen = () => {
		setMarkerScreen(false);
	};
	const gotoStartVideo = async () => {
		Keyboard.dismiss();
		if (searchText) {
			setIsStartLoading(true);
			const isValidAddress = await validateAddressWithGeocoding(searchText);
			setIsStartLoading(false);

			if (!isValidAddress) {
				setShowNoLocation(true);
			} else {
				if (isEmpty(searchText)) {
					setIsValidSearchedTxt(true);
					setValidationMsg(MESSAGE.location);
					return false;
				} else {
					props.navigation.navigate({
						name: "FirstVideo",
						// name: "UploadFile",
						params: {
							incidentDate: currentDate,
							incidentTime: incidentTime,
							location: searchText,
							locationCoords: searchCoords,
						},
					});
				}
			}
		} else {
			setIsValidSearchedTxt(true);
			setValidationMsg(MESSAGE.location);
			return false;
		}
	};
	const onChangeSearchText = (text) => {
		fetchSuggestions(
			text,
			setSearchLoading,
			setSearchText,
			setSuggestions,
			currentLocation
		);
	};
	const onBlurSearchText = () => {
		setSearchTextPress(false);
	};
	const onFocusSearchText = () => {
		setSearchTextPress(true);
		setShowNoLocation(false);
	};
	const onPressSuggestion = (item) => {
		setPlaceId(item?.place_id);
		setSearchText(item?.structured_formatting?.main_text);
		setPrevSearchTxt(item?.structured_formatting?.main_text);
		setSearchCoords(item?.coords);

		setTimeout(() => {
			setIsValidSearchedTxt(false);
			Keyboard.dismiss();
			setSuggestions([]);
			setSearchTextPress(false);
		}, 200);
	};
	const clearLocation = () => {
		setSearchText("");
		setSearchCoords(null);
		setSearchTextPress(true);
		setIsValidSearchedTxt(false);
		setSuggestions([]);
		setShowNoLocation(false);
	};
	const SuggestionLocation = ({ item }) => {
		const place = item?.structured_formatting;
		if (!place) return <></>;

		return (
			<>
				<TouchableOpacity
					onPress={() => onPressSuggestion(item)}
					style={styles.locationRow}
				>
					<View style={styles.locationTxtBox}>
						<Text style={styles.locationTxt}>{place.main_text}</Text>
						<View style={{ ...CommonStyles.directionRowCenter }}>
							<Text
								numberOfLines={1}
								ellipsizeMode="tail"
								style={styles.locationDesTxt}
							>
								{place.secondary_text}
							</Text>
						</View>
					</View>
				</TouchableOpacity>
				<View style={styles.divDark} />
			</>
		);
	};

	return (
		<>
			{showNoLocation && (
				<NoLocationPanel
					show={showNoLocation}
					onHide={() => setShowNoLocation(false)}
					snapHeight={"30%"}
				/>
			)}
			{!markertScreen ? (
				<View style={[IncidentStyle.mainContainer]}>
					<SafeAreaView style={[IncidentStyle.darkContainer]}>
						<StatusBar
							translucent
							barStyle={"dark-content"}
							animated={true}
							backgroundColor={Colors.primaryBG20}
							networkActivityIndicatorVisible={true}
						/>
					</SafeAreaView>
					<View style={[IncidentStyle.headerContainer, { paddingTop: 20 }]}>
						<TouchableOpacity onPress={() => gotoBack()}>
							<View style={[IncidentStyle.backArrow]}>
								<Icons
									iconName={"angle-left"}
									iconSetName={"FontAwesome6"}
									iconColor={Colors.backArrowBlack}
									iconSize={24}
								/>
							</View>
						</TouchableOpacity>
						<Text style={[IncidentStyle.headerTextBlack]}>{"Claim Talk"}</Text>
					</View>
					<View style={[IncidentStyle.claimMainContainer]}>
						{screenName === "1" ? (
							<View style={[CommonStyles.mainPaddingH]}>
								<Text style={[IncidentStyle.welcomeLabel]}>
									{"Welcome to"}
									<Text style={[IncidentStyle.welcomeBold]}>
										{" ClaimTalk!"}
									</Text>
								</Text>
								<Text style={[IncidentStyle.claimTalkDesc]}>
									{
										"Retyrn’s fastest way to submit your claim. ClaimTalk is a video recording service where you can speak exactly what happened and show images all  while on video. Don’t worry if you mess up you can send another when finished."
									}
								</Text>
								<Text style={[IncidentStyle.welcomeLabel]}>
									{"Let’s get started - Click NEXT to begin"}
								</Text>
								<View
									style={{
										...LayoutStyle.marginVertical20,
									}}
								>
									<Button
										onPress={() => gotoScreen2()}
										btnLabelColor={Colors.white}
										btnColor={Colors.secondary}
										btnName={"Next"}
										isBtnActive={true}
									/>
								</View>
							</View>
						) : screenName === "2" ? (
							<View style={[CommonStyles.mainPaddingH]}>
								<Text style={[IncidentStyle.welcomeLabel]}>
									{"Let’s get"}
									<Text style={[IncidentStyle.welcomeBold]}>{" two "}</Text>
									<Text style={[IncidentStyle.welcomeLabel]}>
										{"quick questions out the way, then record a video."}
									</Text>
								</Text>
								<View
									style={{
										...LayoutStyle.marginVertical20,
									}}
								>
									<Button
										onPress={() => gotoScreen3()}
										btnLabelColor={Colors.white}
										btnColor={Colors.secondary}
										btnName={"Next"}
										isBtnActive={true}
									/>
								</View>
							</View>
						) : screenName === "3" ? (
							<View>
								<View
									style={[
										CommonStyles.directionRowSB,
										CommonStyles.mainPaddingH,
									]}
								>
									<Text style={[IncidentStyle.welcomeBold]}>
										{"When"}
										<Text style={[IncidentStyle.welcomeLabel]}>
											{" did the accident occur?"}
										</Text>
									</Text>
									<TouchableOpacity onPress={() => gotoToday()}>
										<View style={[IncidentStyle.btnBorderToday]}>
											<Text style={[IncidentStyle.todayText]}>{"Today"}</Text>
										</View>
									</TouchableOpacity>
								</View>

								<View style={styles.calendarContainer}>
									{isCalendarLoading ? (
										<View style={{}}>
											<CalendarLoader />
										</View>
									) : (
										<CalendarList
											style={{
												backgroundColor: Colors.lightBlue,
											}}
											displayLoadingIndicator={isCalendarLoading}
											current={currentDate}
											markedDates={{
												[selectedDate]: {
													selected: true,
													selectedColor: Colors.secondary,
												},
											}}
											onDayPress={(day) => {
												setSelectedDate(day.dateString);
												setCurrentDate(
													moment(day.dateString).format("YYYY-MM-DD")
												);
											}}
											maxDate={maxSelectableDate}
											disableMonthChange={false}
											pastScrollRange={12}
											futureScrollRange={12}
											scrollEnabled={false}
											horizontal={true}
											enableSwipeMonths={false}
											monthFormat={""}
											theme={{
												calendarBackground: Colors.lightBlue,
												monthTextColor: Colors.secondary,
												textDayFontSize: 14,
												textDayHeaderFontSize: 12,
												color: Colors.primary,
												textMonthFontSize: 14,
												textDayFontFamily: FontFamily.PoppinsLight,
												textMonthFontFamily: FontFamily.PoppinsMedium,
												textDayHeaderFontFamily: FontFamily.PoppinsBold,

												textSectionTitleColor: "#888",
												textDisabledColor: "#ccc",
											}}
										/>
									)}
									<View style={styles.arrowContainer}>
										<TouchableOpacity
											onPress={() => handlePreviousMonth()}
											disabled={isCalendarLoading}
										>
											<Icons
												iconName={"chevron-left"}
												iconSetName={"MaterialCommunityIcons"}
												iconColor={"#050200"}
												iconSize={28}
											/>
										</TouchableOpacity>
										<View
											style={{
												flexDirection: "row",
												flex: 1,
												justifyContent: "center",
											}}
										>
											<Dropdown
												placeholderStyle={[IncidentStyle.dropdownMonth]}
												selectedTextStyle={[IncidentStyle.dropdownMonth]}
												style={{ width: "22%" }}
												itemContainerStyle={{
													paddingHorizontal: 2,
													justifyContent: "center",
													alignItems: "center",
													borderBottomWidth: 1,
													borderBottomColor: "#f5f5f5",
												}}
												containerStyle={{
													width: 65,
												}}
												itemTextStyle={{
													fontSize: 12,
												}}
												activeColor={Colors.secondary}
												data={months}
												maxHeight={200}
												labelField="abbreviation"
												valueField="name"
												placeholder={selectedMonth}
												value={selectedMonth}
												onChange={(item) => {
													gotoChangeMonth(item.name);
												}}
											/>
											<Dropdown
												placeholderStyle={[IncidentStyle.dropdownMonth]}
												selectedTextStyle={[IncidentStyle.dropdownMonth]}
												style={{ width: "22%", marginLeft: 10 }}
												itemContainerStyle={{
													paddingHorizontal: 2,
													justifyContent: "center",
													alignItems: "center",
													borderBottomWidth: 1,
													borderBottomColor: "#f5f5f5",
												}}
												containerStyle={{
													width: 75,
												}}
												itemTextStyle={{
													fontSize: 12,
												}}
												activeColor={Colors.secondary}
												data={years}
												maxHeight={200}
												labelField="name"
												valueField="name"
												placeholder={selectedYear}
												value={selectedYear}
												onChange={(item) => {
													gotoChangeYear(item.name);
												}}
											/>
										</View>
										<TouchableOpacity
											onPress={() => handleNextMonth()}
											disabled={isCalendarLoading}
										>
											<Icons
												iconName={"chevron-right"}
												iconSetName={"MaterialCommunityIcons"}
												iconColor={"#050200"}
												iconSize={28}
											/>
										</TouchableOpacity>
									</View>
								</View>

								<View
									style={{
										...CommonStyles.mainPaddingH,
									}}
								>
									{!incidentTime ? (
										<TouchableOpacity onPress={() => openIncidentTime()}>
											<View style={[IncidentStyle.timePickerContainer]}>
												<Icons
													iconName={"clock-time-ten-outline"}
													iconSetName={"MaterialCommunityIcons"}
													iconColor={Colors.iconGray}
													iconSize={22}
												/>
												<Text style={[IncidentStyle.timePickerPlaceholder]}>
													{incidentTime ? incidentTime : "Time"}
												</Text>
											</View>
										</TouchableOpacity>
									) : (
										<TouchableOpacity onPress={() => openIncidentTime()}>
											<View style={[IncidentStyle.claimTalkDateText]}>
												<Text
													style={[
														IncidentStyle.claimTalkDate,
														{ color: Colors.secondary },
													]}
												>
													{"Time:  "}
												</Text>
												<Text style={[IncidentStyle.claimTalkDate]}>
													{incidentTime}
												</Text>
											</View>
										</TouchableOpacity>
									)}

									<DateTimePickerModal
										isVisible={incidentTimeOpen}
										mode="time"
										onConfirm={confirmIncidentTime}
										onCancel={hideIncidentTime}
									/>
									<ValidationText
										validationMessage={incidentTimeMsg}
										isValidationShow={isIncidentTime}
									/>
									<View style={{ ...LayoutStyle.marginTop20 }}>
										<Button
											onPress={() => gotoScreen4()}
											btnLabelColor={Colors.white}
											btnColor={Colors.secondary}
											btnName={"Next"}
											isBtnActive={true}
										/>
									</View>
								</View>
							</View>
						) : screenName === "4" ? (
							<View style={[CommonStyles.mainPaddingH]}>
								<View style={[CommonStyles.directionRowSB]}>
									<Text style={[IncidentStyle.welcomeBold]}>
										{"When"}
										<Text style={[IncidentStyle.welcomeLabel]}>
											{" did the accident occur?"}
										</Text>
									</Text>
								</View>
								<View style={styles.searchLocRow}>
									<View
										style={[
											styles.searchContainer,
											searchCoords &&
												!searchTextPress && {
													backgroundColor: Colors.inputfillBG,
													borderWidth: 0,
												},
											{},
										]}
									>
										{searchCoords && !searchTextPress && (
											<Icons
												iconSetName={"MaterialCommunityIcons"}
												iconName={"map-marker"}
												iconColor={Colors.secondary}
												iconSize={22}
											/>
										)}
										<TextInput
											style={styles.searchInput}
											value={searchText}
											onChangeText={(text) => onChangeSearchText(text)}
											placeholder={"Add to Stop"}
											placeholderTextColor={Colors.secondary60}
											onBlur={onBlurSearchText}
											onFocus={onFocusSearchText}
											onEndEditing={({ nativeEvent: { text } }) => {
												if (text == prevSearchTxt) return;
												setIsValidSearchedTxt(false);
												setSearchCoords(null);
											}}
										/>
										{searchText && (
											<TouchableOpacity onPress={() => clearLocation()}>
												<Icons
													iconName={"close-circle-outline"}
													iconSetName={"MaterialCommunityIcons"}
													iconColor={Colors.secondary}
													iconSize={20}
												/>
											</TouchableOpacity>
										)}
									</View>
								</View>
								{suggestions.length > 0 && (
									<ScrollView
										style={[styles.suggestionContainer]}
										showsVerticalScrollIndicator={false}
									>
										{suggestions.map((item) => (
											<SuggestionLocation item={item} />
										))}
									</ScrollView>
								)}
								{isValidSearchedText && (
									<ValidationText
										isValidationShow={isValidSearchedText}
										validationMessage={validationMsg}
									/>
								)}
								<TouchableOpacity
									onPress={() => gotoCurrentLocation()}
									style={[IncidentStyle.iconTextContainer]}
								>
									<Text style={[IncidentStyle.smallGrayLabel]}>
										{"Current Location"}
									</Text>
									<Icons
										iconColor={Colors.iconBlack}
										iconSetName={"MaterialCommunityIcons"}
										iconName={"map-marker-plus-outline"}
										iconSize={20}
									/>
								</TouchableOpacity>
								<View style={{ ...LayoutStyle.marginVertical20 }}>
									<TouchableOpacity
										style={[
											styles.startVideoBtn,
											{ opacity: isStartLoading ? 0.7 : 1 },
										]}
										disabled={isStartLoading}
										onPress={() => gotoStartVideo()}
									>
										<View style={styles.rowItemCenter}>
											{isStartLoading && (
												<ActivityIndicator
													color={Colors.white}
													size={"small"}
												/>
											)}
											<Text style={styles.startVideoTxt}>{"Start Video"}</Text>
										</View>
									</TouchableOpacity>
								</View>
							</View>
						) : null}
					</View>
				</View>
			) : (
				<MarkerLocationScreen
					onData={fetchDatafromChild}
					setMarkerScreen={setMarkerScreen}
					closeMarkerScreen={closeMarkerScreen}
				/>
			)}
		</>
	);
};

export default ClaimTalkInfoScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	buttonContainer: {
		marginTop: 20,
		width: "80%",
	},
	calendarContainer: {
		flexGrow: 1,
		width: "100%",
		position: "relative",
	},
	arrowContainer: {
		position: "absolute",
		top: "10%",
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		paddingHorizontal: 20,
		transform: [{ translateY: -25 }],
	},
	locationContainer: {
		flex: 0,
	},
	textInputContainer: {
		width: "100%",
		borderBottomWidth: 1,
		borderBottomColor: Colors.inputIcon,
		justifyContent: "center",
		alignItems: "center",
	},
	locationTextInput: {
		height: 40,
		color: "#5d5d5d",
		fontSize: 16,
		backgroundColor: "transparent",
		textAlignVertical: "center",
		marginRight: 20,
	},
	startVideoBtn: {
		...LayoutStyle.padding10,
		borderRadius: 30,
		backgroundColor: Colors.secondary,
		borderColor: Colors.secondary,
	},
	rowItemCenter: {
		...CommonStyles.directionRowCenter,
		justifyContent: "center",
	},
	startVideoTxt: {
		...ComponentStyles.btnLabel,
		color: Colors.white,
		marginLeft: 3,
	},
	searchInput: {
		flex: 1,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsRegular,
		marginLeft: 3,
	},
	suggestionContainer: {
		...LayoutStyle.paddingHorizontal10,
		marginTop: 14,
		borderWidth: 1,
		borderColor: Colors.secondary60,
		borderRadius: 10,
		maxHeight: 180,
	},
	locationRow: {
		...LayoutStyle.paddingVertical10,
	},
	locationTxtBox: {
		flex: 1,
	},
	locationTxt: {
		color: Colors.labelBlack,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsMedium,
	},
	distanceTxt: {
		color: Colors.labelDarkGray,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsRegular,
	},
	locationDesTxt: {
		flex: 1,
		color: Colors.labelDarkGray,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsRegular,
	},
	divDark: {
		backgroundColor: Colors.secondary60,
		height: 1,
	},
	searchContainer: {
		backgroundColor: Colors.transparent,
		...CommonStyles.directionRowCenter,
		flex: 1,
		borderWidth: 1,
		borderColor: Colors.secondary,
		borderRadius: 25,
		paddingHorizontal: 10,
		paddingVertical: Platform.OS === "ios" ? 10 : 0,
	},
	searchLocRow: {
		...CommonStyles.directionRowSB,
		...LayoutStyle.marginTop20,
	},
});
