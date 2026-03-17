import React, { useEffect, useState, useRef } from "react";
import {
	View,
	KeyboardAvoidingView,
	Keyboard,
	BackHandler,
	Platform,
	TextInput,
	Text,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { Button, DarkHeader, Icons, Input, Loader } from "../../components";
import LayoutStyle from "../../styles/LayoutStyle";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";
import Api from "../../utils/Api";
import { showMessage } from "react-native-flash-message";
import { isEmpty } from "../../utils/Validation";
import { getCurrentLocation, locationPermission } from "../../utils/Location";
import MapStyle from "../../styles/MapStyle";
import { fetchSuggestions } from "../../config/CommonFunctions";
import CommonStyles from "../../styles/CommonStyles";

const EditDestinationScreen = (props) => {
	const tripId = props?.route?.params?.tripId;

	const refDestination = useRef();

	const [isLoading, setIsLoading] = useState(false);
	const [location, setLocation] = useState(null);

	const [searchLoading, setSearchLoading] = useState(false);
	const [currentLocation, setCurrentLocation] = useState(null);

	const [destinationName, setDestinationName] = useState("");
	const [destinationNameMsg, setDestinationNameMsg] = useState("");
	const [isDestinationName, setIsDestinationName] = useState(false);
	const [destinationNamePress, setDestinationNamePress] = useState(true);
	const [isChangeName, setIsChangeName] = useState(false);

	const [searchText, setSearchText] = useState("");
	const [prevSearchTxt, setPrevSearchTxt] = useState("");
	const [isSearchTextMsg, setIsSearchTextMsg] = useState(false);
	const [searchTextMsg, setSearchTextMsg] = useState("");

	const [searchCity, setSearchCity] = useState("");
	const [searchState, setSearchState] = useState("");
	const [searchStateCode, setSearchStateCode] = useState("");
	const [placeId, setPlaceId] = useState("");
	const [searchCoords, setSearchCoords] = useState(null);
	const [searchTextPress, setSearchTextPress] = useState(true);
	const [suggestions, setSuggestions] = useState([]);

	useEffect(() => {
		const handleBackPress = () => {
			if (Keyboard.isVisible()) {
				Keyboard.dismiss();
				return true;
			}
			return false;
		};

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			handleBackPress
		);

		return () => {
			backHandler.remove();
		};
	}, []);

	useEffect(() => {
		getDestinationDetail();
		getLiveLocation();
	}, []);

	useEffect(() => {
		if (!location) return;

		setDestinationName(location?.name);
		setDestinationNameMsg("");
		setIsDestinationName(false);
		setDestinationNamePress(false);

		const latLng = {
			latitude: location?.destination_latitude,
			longitude: location?.destination_longitude,
		};

		setSearchText(location?.destination_location_name);
		setPrevSearchTxt(location?.destination_location_name);

		setSearchTextMsg("");
		setSearchTextPress(false);
		setSearchCoords(latLng);

		setPlaceId(location?.place_id);
		setSearchCity(location?.city);
		setSearchState(location?.state);
		setSearchStateCode(location?.state_code);
	}, [location]);

	const getDestinationDetail = async () => {
		try {
			if (!tripId) return;
			setIsLoading(true);
			const response = await Api.get(
				`user/get-saved-destination-detail/${tripId}`
			);
			setIsLoading(false);
			if (response.success) {
				setLocation(response?.data);
			}
		} catch (error) {
			setIsLoading(false);
			console.warn("error: ", error);
		}
	};
	const getLiveLocation = async () => {
		const locPermissionDenied = await locationPermission();

		if (locPermissionDenied) {
			const { latitude, longitude, locationName } = await getCurrentLocation();
			setCurrentLocation({ latitude, longitude });
		}
	};
	const gotoBack = () => {
		props.navigation.goBack();
	};
	const validateName = (text) => {
		const trimmed = text.trim();
		if (trimmed?.length === 0) {
			setIsDestinationName(true);
			setDestinationNameMsg("Please enter a valid name");
		} else {
			setIsDestinationName(false);
			setDestinationNameMsg("");
		}
	};
	const onChangeDestinationName = (text) => {
		const cleanedText = text
			.replace(/[^\w\s]/gi, "")
			.replace(
				/([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])/g,
				""
			);

		setDestinationName(cleanedText);
	};
	const isValidFields = () => {
		let isValid = true;

		if (isEmpty(destinationName)) {
			setIsDestinationName(true);
			setDestinationNameMsg("Please Enter Destination Label");
			isValid = false;
		}
		if (isEmpty(searchText)) {
			setIsSearchTextMsg(true);
			setSearchTextMsg("Please Select Destination Address");
			isValid = false;
		}
		return isValid;
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
	};
	const onPressSuggestion = (item) => {
		setPlaceId(item?.place_id);
		setSearchText(item?.structured_formatting?.main_text);
		setPrevSearchTxt(item?.structured_formatting?.main_text);
		setSearchCoords(item?.coords);
		setSearchCity(item?.city);
		setSearchState(item?.state);
		setSearchStateCode(item?.stateCode);
		setTimeout(() => {
			Keyboard.dismiss();
			setSuggestions([]);
			setSearchTextPress(false);
		}, 200);
	};
	const clearAllFields = () => {
		setSearchText("");
		setSearchCoords(null);
		setSearchTextPress(true);
		setSuggestions([]);
	};
	const SuggestionLocation = ({ item }) => {
		const location = item?.structured_formatting;
		if (!location) return <></>;

		return (
			<>
				<TouchableOpacity
					onPress={() => onPressSuggestion(item)}
					style={MapStyle.locationRow}
				>
					<View style={MapStyle.locationTxtBox}>
						<Text style={[MapStyle.locationTxt, { color: Colors.white }]}>
							{location.main_text}
						</Text>
						<View style={{ ...CommonStyles.directionRowCenter }}>
							{item?.distanceMiles && (
								<Text
									style={[MapStyle.distanceTxt, { color: Colors.labelGray }]}
								>
									{`${item.distanceMiles.toFixed(2)} Miles • `}
								</Text>
							)}
							<Text
								numberOfLines={1}
								ellipsizeMode="tail"
								style={[MapStyle.locationDesTxt, { color: Colors.labelGray }]}
							>
								{location.secondary_text}
							</Text>
						</View>
					</View>
				</TouchableOpacity>
				<View style={[MapStyle.divDark, { backgroundColor: "#3d4e63" }]} />
			</>
		);
	};
	const onPressSave = async () => {
		let isValid = isValidFields();
		if (isValid) {
			try {
				setIsLoading(true);
				const data = {
					destination_latitude: searchCoords?.latitude,
					destination_longitude: searchCoords?.longitude,
					destination_location_name: searchText,
					name: destinationName,

					destination_id: location?.id,
					waypoint: [],
					waypoint_name: [],
					flag: 1,
					note: "",
					place_id: placeId,
					city: searchCity || searchText,
					state: searchState,
					state_code: searchStateCode,
				};

				const response = await Api.post(`user/edit-saved-destination`, data);
				setIsLoading(false);

				if (response.success) {
					props.navigation.goBack();
					showMessage({
						message: "Destination updated successfully",
						type: "success",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				} else {
					showMessage({
						message: response.data?.data?.name
							? response.data?.data?.name
							: response.data?.data?.address,
						type: "danger",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				}
			} catch (error) {
				setIsLoading(false);
				console.warn(error);
			}
		}
	};

	return (
		<>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={[AccountStyle.mainContainer]}
			>
				<Loader show={isLoading} />
				<DarkHeader
					iconName={"close"}
					iconSetName={"MaterialCommunityIcons"}
					iconColor={Colors.backArrowWhite}
					iconSize={24}
					whiteLabel={"Edit"}
					grayLabel={"Destination"}
					onPress={() => gotoBack()}
				/>
				{!isLoading && (
					<View style={[AccountStyle.mainContainer]}>
						<View
							style={[
								AccountStyle.backgroundDarkBlue,
								{
									paddingHorizontal: 20,
									borderBottomLeftRadius: 30,
									borderBottomRightRadius: 30,
									...LayoutStyle.paddingBottom20,
								},
							]}
						>
							<Input
								isDarkBG={true}
								value={destinationName}
								maxLength={50}
								placeholder={"Name"}
								onChangeText={(text) => onChangeDestinationName(text)}
								iconName={"business"}
								iconSetName={"MaterialIcons"}
								isValidationShow={isDestinationName}
								validationMessage={destinationNameMsg}
								keyboardType={"default"}
								returnKeyType={"done"}
								blurOnSubmit={true}
								onFocus={() => {
									setIsChangeName(true);
									setDestinationNamePress(true);
								}}
								onBlur={() => {
									validateName(destinationName);
									setDestinationNamePress(false);
								}}
								isPressOut={destinationNamePress}
								onPressFocus={() => setDestinationNamePress(true)}
								inputMainStyle={{ ...LayoutStyle.marginBottom20 }}
							/>
							<View
								style={[
									searchTextPress
										? MapStyle.locationInput
										: MapStyle.filledLocationInput,
								]}
							>
								<View style={MapStyle.rowFlex}>
									{searchTextPress ? (
										<Icons
											iconSetName={"MaterialCommunityIcons"}
											iconName={"map-marker"}
											iconColor={Colors.inputIconDark}
											iconSize={22}
										/>
									) : (
										<Text style={MapStyle.adrsBlueTxt}>{"Address: "}</Text>
									)}
									<TextInput
										style={[MapStyle.inputAddress, { top: 0 }]}
										value={searchText}
										onChangeText={(text) => onChangeSearchText(text)}
										placeholder={"Add to Stop"}
										placeholderTextColor={Colors.inputIconDark}
										onBlur={onBlurSearchText}
										onFocus={onFocusSearchText}
										onEndEditing={({ nativeEvent: { text } }) => {
											if (text == prevSearchTxt) return;
											setSearchCoords(null);
										}}
									/>
								</View>
								{searchText && (
									<TouchableOpacity onPress={() => clearAllFields()}>
										<Icons
											iconName={"close-circle-outline"}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={
												searchTextPress
													? Colors.inputIconDark
													: Colors.secondary
											}
											iconSize={20}
										/>
									</TouchableOpacity>
								)}
							</View>
							{suggestions.length > 0 && (
								<ScrollView
									style={[
										MapStyle.suggestionContainer,
										{ maxHeight: "60%", borderColor: "#3d4e63" },
									]}
									showsVerticalScrollIndicator={false}
								>
									{suggestions.map((item) => (
										<SuggestionLocation item={item} />
									))}
								</ScrollView>
							)}
						</View>
						<View
							style={[
								LayoutStyle.paddingTop30,
								LayoutStyle.paddingHorizontal20,
							]}
						>
							<Button
								onPress={() => onPressSave()}
								isBtnActive={true}
								btnName={"Save"}
								btnColor={Colors.secondary}
								btnLabelColor={Colors.white}
								disabled={!destinationName || !searchCoords}
							/>
						</View>
					</View>
				)}
			</KeyboardAvoidingView>
		</>
	);
};

export default EditDestinationScreen;
