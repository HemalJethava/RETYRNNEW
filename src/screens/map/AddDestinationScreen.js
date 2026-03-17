import React, {
	useState,
	useEffect,
	useRef,
	useMemo,
	useCallback,
} from "react";
import {
	View,
	StyleSheet,
	Text,
	TouchableOpacity,
	Keyboard,
	BackHandler,
	ScrollView,
	Platform,
	KeyboardAvoidingView,
	TextInput,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { useFocusEffect } from "@react-navigation/native";
import MapViewDirections from "react-native-maps-directions";
import { useDispatch, useSelector } from "react-redux";
import { Icons, Loader } from "../../components";
import Colors from "../../styles/Colors";
import MapStyle from "../../styles/MapStyle";
import { storeRecentLocationArray } from "./redux/Action";
import {
	fetchDuration,
	fetchSuggestions,
	generateUniqueId,
	getFormattedDate,
	getFormattedTime,
	getShortLocationName,
} from "../../config/CommonFunctions";
import { GOOGLE_MAPS_APIKEY } from "../../config/BaseUrl";
import { getCurrentLocation, locationPermission } from "../../utils/Location";
import { NoLocationPanel } from "../../components/NoLocationPanel";
import { NewMapStyle } from "../../styles/NewMapStyle";
import CommonStyles from "../../styles/CommonStyles";

const AddDestinationScreen = (props) => {
	const dispatch = useDispatch();
	const RecentLocationArray = useSelector(
		(state) => state.Map.recentSearchLocationList
	);

	const mapView = useRef(null);

	const [isLoading, setIsLoading] = useState(false);
	const [keyboardVisible, setKeyboardVisible] = useState(false);

	const [locationReady, setLocationReady] = useState(false);
	const [mapReady, setMapReady] = useState(false);

	const [currentLocation, setCurrentLocation] = useState(null);

	const [originName, setOriginName] = useState(null);
	const [originLatLong, setOriginLatLong] = useState(null);

	const [searchLoading, setSearchLoading] = useState(false);

	const [searchText, setSearchText] = useState("");
	const [prevSearchTxt, setPrevSearchTxt] = useState("");
	const [searchCity, setSearchCity] = useState("");
	const [searchState, setSearchState] = useState("");
	const [searchStateCode, setSearchStateCode] = useState("");
	const [placeId, setPlaceId] = useState("");
	const [searchCoords, setSearchCoords] = useState(null);
	const [searchTextPress, setSearchTextPress] = useState(true);
	const [isValidSearchedText, setIsValidSearchedTxt] = useState(false);
	const [suggestions, setSuggestions] = useState([]);

	const [showNoLocation, setShowNoLocation] = useState(false);
	const [isFocused, setIsFocused] = useState(false);

	const [isValidFields, setIsValidFields] = useState(false);

	const LATITUDE = 37.78825;
	const LONGITUDE = -122.4324;

	useFocusEffect(
		useCallback(() => {
			setIsFocused(true);
			return () => setIsFocused(false);
		}, [])
	);

	useEffect(() => {
		getLiveLocation();
	}, [mapReady]);

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
		const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
			setKeyboardVisible(true);
		});
		const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
			setKeyboardVisible(false);
		});

		return () => {
			showSubscription.remove();
			hideSubscription.remove();
		};
	}, []);

	useEffect(() => {
		const isValidForm = isValidSearchedText;
		setIsValidFields(isValidForm);
	}, [isValidSearchedText]);

	const coordinates = useMemo(() => {
		if (originLatLong && searchCoords) {
			return [
				{ latitude: originLatLong.lat, longitude: originLatLong.lng },
				{ latitude: searchCoords.latitude, longitude: searchCoords.longitude },
			];
		}
		return [];
	}, [originLatLong, searchCoords]);
	const getLiveLocation = async () => {
		const locPermissionGranted = await locationPermission();

		if (locPermissionGranted) {
			const { latitude, longitude, locationName } = await getCurrentLocation();

			const currentLocation = {
				lat: latitude,
				lng: longitude,
			};

			setCurrentLocation({ latitude, longitude });
			setOriginLatLong(currentLocation);
			setLocationReady(true);

			if (locationName) {
				const shortName = await getShortLocationName(locationName);
				setOriginName(shortName[0]?.mainText);
			}

			if (mapView.current && mapReady) {
				mapView.current.animateToRegion(
					{
						latitude: latitude,
						longitude: longitude,
						latitudeDelta: 0.005,
						longitudeDelta: 0.005,
					},
					1000
				);
			}
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
		setSearchCity(item?.city);
		setSearchState(item?.state);
		setSearchStateCode(item?.stateCode);
		setTimeout(() => {
			setIsValidSearchedTxt(true);
			Keyboard.dismiss();
			setSuggestions([]);
			setSearchTextPress(false);
		}, 200);
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
						<Text style={MapStyle.locationTxt}>{location.main_text}</Text>
						<View style={{ ...CommonStyles.directionRowCenter }}>
							{item?.distanceMiles && (
								<Text style={MapStyle.distanceTxt}>
									{`${item.distanceMiles.toFixed(2)} Miles • `}
								</Text>
							)}
							<Text
								numberOfLines={1}
								ellipsizeMode="tail"
								style={MapStyle.locationDesTxt}
							>
								{location.secondary_text}
							</Text>
						</View>
					</View>
				</TouchableOpacity>
				<View style={MapStyle.divDark} />
			</>
		);
	};
	const renderMarkers = () => {
		return coordinates.map((coordinate, index) => (
			<Marker key={index} coordinate={coordinate}>
				<Icons
					iconName="map-marker"
					iconSetName="MaterialCommunityIcons"
					iconColor={Colors.red}
					iconSize={30}
				/>
			</Marker>
		));
	};
	const handleRouteReady = (result) => {
		setShowNoLocation(false);
		setTimeout(() => {
			mapView?.current?.fitToCoordinates(result?.coordinates, {
				edgePadding: { right: 20, bottom: 20, left: 20, top: 20 },
			});
		}, 0);
	};
	const clearAllFields = () => {
		setSearchText("");
		setSearchCoords(null);
		setSearchTextPress(true);
		setIsValidSearchedTxt(false);
		setSuggestions([]);
		setShowNoLocation(false);
	};
	const gotoDirectAPI = async () => {
		if (!originLatLong || !searchCoords) {
			setShowNoLocation(true);
			return;
		}

		const locationsToCheck = [searchCoords];

		for (const location of locationsToCheck) {
			setIsLoading(true);
			const duration = await fetchDuration(originLatLong, location);
			setIsLoading(false);
			if (
				duration === "No duration found" ||
				duration === "Error fetching duration"
			) {
				setShowNoLocation(true);
				return;
			}
		}

		if (originLatLong && searchCoords) {
			const newLocation = {
				id: generateUniqueId(),
				place_id: placeId,
				originLocation: {
					latitude: originLatLong.lat,
					longitude: originLatLong.lng,
					originLocationName: originName,
				},
				destinationLocation: {
					latitude: searchCoords.latitude,
					longitude: searchCoords.longitude,
					destinationLocationName: searchText,
				},
				city: searchCity,
				state: searchState,
				stateCode: searchStateCode,
				date: {
					createdAtDate: getFormattedDate(),
				},
				time: {
					createdAtTime: getFormattedTime(),
				},
			};

			const isDuplicate = RecentLocationArray?.some((item) => {
				return (
					item.originLocation.originLocationName ===
						newLocation.originLocation.originLocationName &&
					item.destinationLocation.destinationLocationName ===
						newLocation.destinationLocation.destinationLocationName
				);
			});

			if (!isDuplicate) {
				const updatedList = [
					newLocation,
					...(Array.isArray(RecentLocationArray)
						? RecentLocationArray.slice(0, 9)
						: []),
				];
				dispatch(storeRecentLocationArray(updatedList));
			}
			setIsLoading(false);

			clearAllFields();
			props.navigation.navigate("MainMap", {
				coordinates: [
					{
						latitude: originLatLong.lat,
						longitude: originLatLong.lng,
						locationName: originName,
					},
					{
						latitude: searchCoords.latitude,
						longitude: searchCoords.longitude,
						locationName: searchText,
						placeId: placeId,
					},
				],
			});
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			style={{ flex: 1 }}
			keyboardVerticalOffset={80}
		>
			{isLoading && <Loader show={isLoading} />}

			<View style={{ flex: 1, marginBottom: keyboardVisible ? -150 : 0 }}>
				<View
					style={[
						MapStyle.mapInputContainer,
						{ marginBottom: -10, zIndex: 9999999 },
					]}
				>
					<View style={{ maxHeight: 240 }}>
						<Text style={[MapStyle.headerText, { marginBottom: 10 }]}>
							{"Go Somewhere"}
						</Text>
						<View style={[{ ...CommonStyles.directionRowSB }]}>
							<View
								style={[
									MapStyle.searchContainer,
									searchCoords &&
										!searchTextPress && {
											backgroundColor: Colors.inputfillBG,
											borderWidth: 0,
										},
									{},
								]}
							>
								{searchCoords && !searchTextPress && (
									<View style={{}}>
										<Text style={[NewMapStyle.inputLabel, { marginTop: -3 }]}>
											{"Stop: "}
										</Text>
									</View>
								)}
								<TextInput
									style={MapStyle.searchInput}
									value={searchText}
									onChangeText={(text) => onChangeSearchText(text)}
									placeholder={"Add to Stop"}
									placeholderTextColor={Colors.labelDarkGray}
									onBlur={onBlurSearchText}
									onFocus={onFocusSearchText}
									onEndEditing={({ nativeEvent: { text } }) => {
										if (text == prevSearchTxt) return;
										setIsValidSearchedTxt(false);
										setSearchCoords(null);
									}}
								/>
								{searchText && (
									<TouchableOpacity onPress={() => clearAllFields()}>
										<Icons
											iconName={"close-circle-outline"}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={Colors.secondary}
											iconSize={16}
										/>
									</TouchableOpacity>
								)}
							</View>
						</View>
						{suggestions.length > 0 && (
							<ScrollView
								style={[MapStyle.suggestionContainer]}
								showsVerticalScrollIndicator={false}
							>
								{suggestions.map((item) => (
									<SuggestionLocation item={item} />
								))}
							</ScrollView>
						)}
					</View>
				</View>
				<View style={[MapStyle.mapContainer]}>
					<MapView
						ref={mapView}
						provider={PROVIDER_GOOGLE}
						style={StyleSheet.absoluteFillObject}
						initialRegion={{
							latitude: originLatLong?.latitude || LATITUDE,
							longitude: originLatLong?.longitude || LONGITUDE,
							latitudeDelta: 0.005,
							longitudeDelta: 0.005,
						}}
						showsUserLocation={mapReady && locationReady && isFocused}
						showsMyLocationButton
						showsCompass
						showsBuildings
						zoomEnabled
						zoomTapEnabled
						showsScale
						showsIndoors
						userInterfaceStyle={"light"}
						onMapLoaded={() => {
							setMapReady(true);
						}}
						onMapReady={() => {
							if (currentLocation && mapView.current) {
								mapView.current.animateToRegion({
									...currentLocation,
									latitudeDelta: 0.005,
									longitudeDelta: 0.005,
								});
							}
						}}
					>
						{renderMarkers()}

						{coordinates.length >= 2 && (
							<MapViewDirections
								origin={coordinates[0]}
								destination={coordinates[coordinates.length - 1]}
								apikey={GOOGLE_MAPS_APIKEY}
								strokeWidth={3}
								strokeColor={Colors.primary}
								onReady={handleRouteReady}
							/>
						)}
					</MapView>

					{Platform.OS === "android" ? (
						<TouchableOpacity
							style={[MapStyle.navigationButton]}
							onPress={gotoDirectAPI}
							disabled={!isValidFields}
						>
							<View
								style={[
									isValidFields ? MapStyle.activeGoBtn : MapStyle.inactiveGoBtn,
								]}
							>
								<Text style={[MapStyle.goText]}>GO</Text>
							</View>
						</TouchableOpacity>
					) : (
						<TouchableOpacity
							style={[MapStyle.navigationButtonIos]}
							onPress={gotoDirectAPI}
							disabled={!isValidFields}
						>
							<View
								style={[
									isValidFields
										? MapStyle.activeGoBtnIos
										: MapStyle.inactiveGoBtn,
								]}
							>
								<Text style={[MapStyle.goText, { fontSize: 15 }]}>GO</Text>
							</View>
						</TouchableOpacity>
					)}
				</View>
			</View>

			{showNoLocation && (
				<NoLocationPanel
					show={showNoLocation}
					onHide={() => setShowNoLocation(false)}
					snapHeight={"40%"}
				/>
			)}
		</KeyboardAvoidingView>
	);
};

export default AddDestinationScreen;
