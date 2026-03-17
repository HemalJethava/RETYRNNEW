import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	View,
	Text,
	TouchableOpacity,
	TextInput,
	Modal,
	Image,
	Platform,
	PermissionsAndroid,
	Linking,
	ActivityIndicator,
} from "react-native";
import Colors from "../../../../styles/Colors";
import {
	BottomSheetFlatList,
	BottomSheetModal,
	BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { styles } from "./styles";
import LayoutStyle from "../../../../styles/LayoutStyle";
import FontFamily from "../../../../assets/fonts/FontFamily";
import CommonStyles from "../../../../styles/CommonStyles";
import { Icons, Loader } from "../../../../components";
import { pinTypes } from "../../../../json/DummyData";
import {
	fetchLocationName,
	fetchPlaceDetail,
	fetchSuggestions,
	getFormattedAddress,
	getPlaceDetail,
	getShortAddress,
} from "../../../../config/CommonFunctions";
import Api from "../../../../utils/Api";
import { showMessage } from "react-native-flash-message";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { GOOGLE_MAPS_APIKEY } from "../../../../config/BaseUrl";
import axios from "axios";
import { PassesColors } from "../../../../json/PassesColors";
import Contacts from "react-native-contacts/src/NativeContacts";
import debounce from "lodash.debounce";

const BATCH_SIZE = 100;

export const AddPinPanel = ({
	pinPanelRef,
	renderBackdrop,
	snapPoints,
	navigation,
	handlePinClosePanel,
	pinPanelTitle,
	recentHistory,
	currentLocation,
	currentLocationName,
	getPinnedPlaces,
	selectedPinned,
	pinnedPlacesList,
}) => {
	const LATITUDE = 37.78825;
	const LONGITUDE = -122.4324;

	const [isPageLoader, setIsPageLoader] = useState(false);

	const [loading, setLoading] = useState(false);
	const [isLoadingSave, setIsLoadingSave] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [suggestions, setSuggestions] = useState([]);

	const [pinTypeList, setPinTypeList] = useState(pinTypes);
	const [selectedPinType, setSelectedPinType] = useState(null);
	const [selectedPin, setSelectedPin] = useState(null);
	const [processedSuggestions, setProcessedSuggestions] = useState([]);
	const [label, setLabel] = useState("");

	const [showMarkerModal, setShowMarkerModal] = useState(false);
	const [markedLocation, setMarkedLocation] = useState(null);
	const [markerAddress, setMarkerAddress] = useState("");

	const [isShowContact, setIsShowContact] = useState(false);
	const [contacts, setContacts] = useState([]);
	const [filteredContacts, setFilteredContacts] = useState([]);
	const [contactSearch, setContactSearch] = useState("");
	const [selectedContacts, setSelectedContacts] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const [savedDestinationList, setSavedDestinationList] = useState([]);

	const mapRef = useRef(null);
	const listRef = useRef(null);
	const isFetchingMore = useRef(false);

	useEffect(() => {
		if (markedLocation) {
			getPlaceName();
		}
	}, [markedLocation]);

	useEffect(() => {
		const processSuggestionsAndHistory = async () => {
			let rawList = [];

			if (searchText && suggestions.length > 0) {
				rawList = suggestions;
			} else if (recentHistory?.length > 0) {
				const detailedHistory = await Promise.all(
					recentHistory.map((item) =>
						fetchPlaceDetail(item?.place_id, currentLocation)
					)
				);
				rawList = detailedHistory;
			}

			const formattedList = await Promise.all(
				rawList.map(async (item) => {
					const addressF =
						item?.secondary_text || item?.structured_formatting?.secondary_text;

					const formatted = await getFormattedAddress(
						item?.address_components || [],
						addressF || ""
					);

					return {
						...item,
						secondary_text: addressF,
						formatted_address: formatted,
					};
				})
			);

			setProcessedSuggestions(formattedList);
		};

		processSuggestionsAndHistory();
	}, [searchText, suggestions, recentHistory, currentLocation]);

	useEffect(() => {
		if (pinPanelTitle === "Set Up Home") {
			const pinType = pinTypeList.find((item) => item.type === "My Home");
			selectPinType(pinType.id);
		} else if (pinPanelTitle === "Set Up Work") {
			const pinType = pinTypeList.find((item) => item.type === "My Work");
			selectPinType(pinType.id);
		} else {
			const pinType = pinTypeList.find((item) => item.type === "Address");
			selectPinType(pinType.id);
		}
	}, [pinPanelTitle]);

	useEffect(() => {
		const updatePlace = async () => {
			if (pinnedPlacesList?.length > 0 && selectedPinned?.id) {
				const selectedItem = pinnedPlacesList.find(
					(item) => item?.id === selectedPinned?.id
				);

				const addressF =
					selectedItem?.secondary_text ||
					selectedItem?.structured_formatting?.secondary_text;

				const formatted = await getFormattedAddress(
					selectedItem?.address_components || [],
					addressF || ""
				);

				if (selectedItem) {
					const newPlace = {
						user_contacts: selectedItem.user_contacts,
						secondary_text: addressF,
						formatted_address: formatted,
						...selectedItem,
					};
					setSelectedPin(newPlace);
					setMarkedLocation(newPlace?.coords);
					setLabel(newPlace?.main_text);
				}
			}
		};

		updatePlace();
	}, [pinnedPlacesList, selectedPinned?.id]);

	useEffect(() => {
		handleSearch(contactSearch);
	}, [contactSearch]);

	useEffect(() => {
		const getSavedDestinationList = async () => {
			try {
				setIsPageLoader(true);
				const response = await Api.get(`user/get-saved-destinations`);
				if (response?.data) {
					const blankNameLocationArray = response.data.filter(
						(item) => !item.name
					);
					setSavedDestinationList([...blankNameLocationArray]);
				} else {
					setSavedDestinationList([]);
				}
			} catch (error) {
				console.warn(error);
			} finally {
				setIsPageLoader(false);
			}
		};
		getSavedDestinationList();
	}, []);

	const getPlaceName = async () => {
		const markAddress = await getShortAddress(
			markedLocation?.latitude,
			markedLocation?.longitude
		);
		setMarkerAddress(markAddress?.main_text);
	};
	const PinSuggestion = ({ item }) => {
		const addressF =
			item?.secondary_text || item?.structured_formatting?.secondary_text;

		const location = {
			place_id: item?.place_id,
			main_text: item?.main_text || item?.structured_formatting?.main_text,
			secondary_text: addressF,
			formatted_address: item?.formatted_address,
			coords: item?.coords,
			distanceMiles: item?.distanceMiles,
			durationETA: item?.durationETA,
			photos: item?.photos || [],
		};

		return (
			<TouchableOpacity onPress={() => setSelectedPin(location)}>
				<View style={styles.suggestionRow}>
					<View style={{ ...CommonStyles.directionRowCenter }}>
						<View
							style={[
								styles.nearByIcon,
								{ backgroundColor: Colors.errorBoxRed },
							]}
						>
							<Icons
								iconSetName={"FontAwesome6"}
								iconName={"map-pin"}
								iconColor={Colors.white}
								iconSize={18}
							/>
						</View>
						<View style={{ flex: 0.9 }}>
							<Text
								numberOfLines={2}
								style={[
									styles.searchedDestination,
									{ fontFamily: FontFamily.PoppinsSemiBold },
								]}
							>
								{location?.main_text}
							</Text>
							<Text numberOfLines={2} style={styles.suggestionDesTxt}>
								{location?.secondary_text}
							</Text>
						</View>
					</View>
					<TouchableOpacity>
						<Icons
							iconSetName={"MaterialIcons"}
							iconName={"push-pin"}
							iconColor={Colors.blueActiveBtn}
							iconSize={22}
						/>
					</TouchableOpacity>
				</View>
			</TouchableOpacity>
		);
	};
	const onPressCloseLocation = () => {
		setLoading(false);
		setSearchText("");
		setSuggestions([]);
	};
	const selectPinType = (selectedId) => {
		const updatedList = pinTypes.map((item) => ({
			...item,
			isChecked: item.id === selectedId,
		}));
		setPinTypeList(updatedList);

		const selectedItem = updatedList.find((item) => item.id === selectedId);
		setSelectedPinType(selectedItem);
	};
	const handleAddPin = async () => {
		try {
			setIsLoadingSave(true);
			let type = "address";

			if (selectedPinType?.type === "My Home") {
				type = "home";
			} else if (selectedPinType?.type === "My Work") {
				type = "work";
			} else if (selectedPinType?.type === "My School") {
				type = "school";
			} else {
				type = "address";
			}

			const payload = {
				type: type,
				label:
					selectedPin?.main_text ||
					selectedPin?.structured_formatting?.main_text,
				place_id: selectedPin?.place_id,
				...(selectedPin?.display_id && { display_id: selectedPin.display_id }),
			};

			const response = await Api.post(`user/save-library-data`, payload);
			setIsLoadingSave(false);
			if (response.success) {
				setSearchText("");
				setSuggestions([]);
				setSelectedPin(null);
				setProcessedSuggestions([]);
				getPinnedPlaces();
				handlePinClosePanel();
				showMessage({
					message: response.message,
					type: "success",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			} else {
				showMessage({
					message: response.message,
					type: "danger",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			}
		} catch (error) {
			console.warn("Error: ", error);
			setIsLoadingSave(false);
		}
	};
	const handleCancelPin = () => {
		setSelectedPin(null);
		if (selectedPinned) handlePinClosePanel();
	};
	const handleUnpinPlace = async () => {
		try {
			const data = {
				id: [selectedPinned?.id],
			};

			setIsPageLoader(true);
			const response = await Api.post(`user/delete-saved-library`, data);
			setIsPageLoader(false);
			if (response.success) {
				getPinnedPlaces();
				setSelectedPin(null);
				handlePinClosePanel();
				showMessage({
					message: response.message,
					type: "success",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			} else {
				showMessage({
					message: response.message,
					type: "danger",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			}
		} catch (error) {
			setIsPageLoader(false);
			console.warn("Error: ", error);
		}
	};
	const PinnedIcon = () => (
		<View>
			{pinTypeList.map((item, index) => (
				<>
					{item.isChecked && (
						<View
							style={[
								styles.nearByIcon,
								item?.icon_background_color && {
									backgroundColor: item?.icon_background_color,
								},
							]}
						>
							<Icons
								iconSetName={item?.icon_library}
								iconName={item?.icon_name}
								iconColor={Colors.white}
								iconSize={18}
							/>
						</View>
					)}
				</>
			))}
		</View>
	);
	const onRequestModalClose = () => {
		setShowMarkerModal(false);
	};
	const getCurrentDetail = async (address) => {
		if (!address) return;
		const suggestedAdrs = await getPlaceDetail(address, currentLocation);
		const addressComp = suggestedAdrs?.address_components;
		const secondryAdrs = suggestedAdrs?.description;
		const categorizedAdrs = await getFormattedAddress(
			addressComp,
			secondryAdrs
		);

		const newLocation = {
			...selectedPinned,
			place_id: suggestedAdrs?.place_id,
			main_text: suggestedAdrs?.structured_formatting?.main_text,
			secondary_text: suggestedAdrs?.structured_formatting?.secondary_text,
			formatted_address: categorizedAdrs,
			coords: suggestedAdrs?.coords,
			distanceMiles: suggestedAdrs?.distanceMiles,
			durationETA: suggestedAdrs?.durationETA,
			photos: suggestedAdrs?.photos || [],
		};
		setSelectedPin(newLocation);
	};
	const handleDoneMarker = () => {
		setShowMarkerModal(false);
		getCurrentDetail(markerAddress);
	};
	const handlePoiClick = async (event) => {
		const placeId = event.nativeEvent.placeId;

		if (placeId) {
			try {
				const response = await axios.get(
					`https://maps.googleapis.com/maps/api/place/details/json`,
					{
						params: {
							place_id: placeId,
							key: GOOGLE_MAPS_APIKEY,
						},
					}
				);
				const userLocation = response.data.result.geometry.location;
				setMarkedLocation({
					latitude: userLocation.lat,
					longitude: userLocation.lng,
				});
			} catch (error) {
				console.error("Error fetching place details:", error);
			}
		}
	};
	const handleMapPress = (event) => {
		const { coordinate } = event.nativeEvent;
		setMarkedLocation(coordinate);
	};
	const handleDragEnd = (event) => {
		const { coordinate } = event.nativeEvent;
		setMarkedLocation({
			latitude: coordinate.latitude,
			longitude: coordinate.longitude,
		});
	};
	const getFirstLetter = (name) => {
		if (!name) return "";
		return name.trim().charAt(0).toUpperCase();
	};
	const normalizeNumber = (number) => {
		if (!number) return "";

		let cleaned = number
			.trim()
			.replace(/\s+/g, "")
			.replace(/[^+\d]/g, "");

		if (cleaned.startsWith("+") && cleaned.length > 11) {
			const phone = cleaned.slice(-10);
			const countryCode = cleaned.slice(0, cleaned.length - 10);
			return `${countryCode} ${phone}`;
		}

		if (!cleaned.startsWith("+")) {
			const digits = cleaned.replace(/\D/g, "");
			if (digits.length > 10) {
				const phone = digits.slice(-10);
				const countryCode = `+${digits.slice(0, digits.length - 10)}`;
				return `${countryCode} ${phone}`;
			}
			return `+91 ${digits}`;
		}

		return cleaned;
	};
	const handleAddContact = async () => {
		try {
			const existingDestination = savedDestinationList?.find(
				(item) => item?.place_id === selectedPin?.place_id
			);

			if (existingDestination) {
				await addDestinationContact(existingDestination);
				await addTrustedContact();
			} else {
				await addTrustedContact();
			}
		} catch (error) {
			console.warn("Error in handleAddContact:", error);
		}
	};
	const addDestinationContact = async (existingDestination) => {
		try {
			if (selectedContacts.length > 0 && existingDestination) {
				const contactsArray = selectedContacts.map((item) => {
					const rawNumber = item?.phoneNumbers[0]?.number || "";
					return {
						name: getName(item),
						mobile_number: normalizeNumber(rawNumber),
					};
				});

				const data = {
					destination_id: existingDestination?.id,
					contacts: contactsArray,
				};

				const response = await Api.post(`user/add-destination-contact`, data);
				console.log("response: ", response);
			}
		} catch (error) {
			console.warn("Error: ", error);
		}
	};
	const addTrustedContact = async () => {
		try {
			if (selectedContacts.length > 0) {
				const contactsArray = selectedContacts.map((item) => {
					const rawNumber = item?.phoneNumbers[0]?.number || "";
					return {
						name: getName(item),
						mobile_number: normalizeNumber(rawNumber),
					};
				});

				setIsPageLoader(true);
				const data = {
					library_id: selectedPinned?.id,
					contacts: contactsArray,
				};

				console.log("data: ", data);
				const response = await Api.post(`user/add-destination-contact`, data);
				console.log("response: ", response);

				setIsPageLoader(false);
				if (response.success) {
					setIsShowContact(false);
					setSelectedContacts([]);
					getPinnedPlaces();
					showMessage({
						message: response.message,
						type: "success",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				} else {
					showMessage({
						message: response.message,
						type: "danger",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				}
			} else {
				setIsShowContact(false);
			}
		} catch (error) {
			setIsPageLoader(false);
			console.warn("Error: ", error);
		}
	};
	const handleRemoveTrusted = async (item) => {
		try {
			const existingDestination = savedDestinationList?.find(
				(i) => i.place_id === selectedPin?.place_id
			);

			if (existingDestination) {
				await removeDestinationTrusted(item, existingDestination);
				await removeTrustedContact(item);
			} else {
				await removeTrustedContact(item);
			}
		} catch (error) {
			console.warn("Error in handleAddContact:", error);
		}
	};
	const removeDestinationTrusted = async (item, destination) => {
		try {
			if (!destination?.id) return;

			const data = {
				destination_id: destination?.id,
				id: [item?.contacts?.id],
			};

			const response = await Api.post(
				`user/remove-destination-trusted-contact`,
				data
			);

			console.log("response: ", response);
		} catch (error) {
			console.warn("Error: ", error);
		}
	};
	const removeTrustedContact = async (item) => {
		try {
			setIsPageLoader(true);
			const data = {
				library_id: selectedPinned?.id,
				id: [item?.contacts?.id],
			};

			const response = await Api.post(
				`user/remove-destination-trusted-contact`,
				data
			);
			setIsPageLoader(false);

			if (response.success) {
				getPinnedPlaces();
				showMessage({
					message: response.message,
					type: "success",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			} else {
				showMessage({
					message: response.message,
					type: "danger",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			}
		} catch (error) {
			setIsPageLoader(false);
			console.warn("Error: ", error);
		}
	};

	const getName = useCallback((c) => {
		return Platform.OS === "ios"
			? `${c.givenName || ""} ${c.middleName ? `${c.middleName} ` : ""}${
					c.familyName || ""
			  }`.trim()
			: c.displayName || "";
	}, []);

	const handleAddPerson = useCallback(async () => {
		try {
			if (Platform.OS === "android") {
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.READ_CONTACTS
				);
				if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
					console.warn("Contacts permission denied");
					return;
				}
			}

			setLoading(true);
			const allContacts = await Contacts.getAll();

			const valid = allContacts.filter(
				(c) => Array.isArray(c.phoneNumbers) && c.phoneNumbers.length > 0
			);

			const sorted = valid.sort((a, b) => getName(a).localeCompare(getName(b)));
			setContacts(sorted);
			setFilteredContacts(sorted.slice(0, BATCH_SIZE));
			setPage(1);
			setHasMore(sorted.length > BATCH_SIZE);
			setIsShowContact(true);
		} catch (e) {
			console.error("Failed to load contacts:", e);
		} finally {
			setLoading(false);
		}
	}, [getName]);

	const handleSearch = useMemo(
		() =>
			debounce((text) => {
				if (text.trim() === "") {
					setFilteredContacts(contacts.slice(0, BATCH_SIZE));
					setPage(1);
					setHasMore(contacts.length > BATCH_SIZE);
					return;
				}

				const filtered = contacts.filter((contact) =>
					getName(contact).toLowerCase().includes(text.toLowerCase())
				);
				setFilteredContacts(filtered.slice(0, BATCH_SIZE));
				setPage(1);
				setHasMore(filtered.length > BATCH_SIZE);
			}, 300),
		[contacts, getName]
	);

	const handleEndReached = () => {
		if (isFetchingMore.current || loading || !hasMore) return;

		isFetchingMore.current = true;
		setLoading(true);

		setTimeout(() => {
			const start = page * BATCH_SIZE;
			const next = start + BATCH_SIZE;
			const newBatch = contacts.slice(0, next);

			setFilteredContacts(newBatch);
			setPage((prev) => prev + 1);
			setHasMore(contacts.length > next);
			setLoading(false);
			isFetchingMore.current = false;
		}, 200);
	};
	const handleContact = (item) => {
		setSelectedContacts((prev) => {
			const exists = prev.some((c) =>
				Platform.OS === "ios"
					? c.recordID === item.recordID
					: c.phoneNumbers[0]?.id === item.phoneNumbers[0]?.id
			);
			return exists
				? prev.filter((c) =>
						Platform.OS === "ios"
							? c.recordID !== item.recordID
							: c.phoneNumbers[0]?.id !== item.phoneNumbers[0]?.id
				  )
				: [...prev, item];
		});
	};
	const renderContact = ({ item, index }) => {
		const { givenName, familyName } = item;
		const firstLetter = givenName?.[0] || "";
		const colorName = PassesColors[Math.floor(Math.random() * 6)]?.color;
		const isSelected = selectedContacts.some((contact) =>
			Platform.OS === "ios"
				? contact?.recordID === item?.recordID
				: contact?.phoneNumbers[0]?.id === item.phoneNumbers[0]?.id
		);

		return (
			<View key={item?.recordID}>
				<TouchableOpacity
					style={{
						...CommonStyles.directionRowSB,
						paddingVertical: 7,
					}}
					onPress={() => handleContact(item)}
				>
					<View style={{ ...CommonStyles.directionRowCenter, flex: 0.95 }}>
						<View style={{ ...LayoutStyle.marginRight10 }}>
							{item.hasThumbnail && item.thumbnailPath ? (
								<Image
									source={{ uri: item.thumbnailPath }}
									style={styles.contactProfile}
								/>
							) : (
								<View
									style={[
										styles.fLatterCircle,
										{
											backgroundColor: `${colorName}99`,
										},
									]}
								>
									<Text style={styles.fLatter}>{firstLetter}</Text>
								</View>
							)}
						</View>
						<View style={styles.flex}>
							<Text numberOfLines={1} style={styles.contactName}>
								{getName(item)}
							</Text>
							{item.phoneNumbers[0]?.number && (
								<Text style={styles.contactNum}>
									{item.phoneNumbers[0].number}
								</Text>
							)}
						</View>
					</View>
					<Icons
						iconSetName={isSelected ? "Ionicons" : "Feather"}
						iconName={isSelected ? "checkmark-circle" : "circle"}
						iconColor={isSelected ? Colors.blueActiveBtn : Colors.labelDarkGray}
						iconSize={20}
					/>
				</TouchableOpacity>
				{index !== filteredContacts.length - 1 && (
					<View style={styles.divDark} />
				)}
			</View>
		);
	};
	const gotoDialOpen = (item) => {
		const mobile = item?.contacts?.mobile;
		Linking.openURL(`tel:${mobile}`);
	};
	const gotoChatScreen = (item) => {
		if (item?.contacts?.app_user_id) {
			const screen = "Message";
			navigation.navigate(screen, {
				item: item?.contacts?.user,
				chatID: item?.contacts?.app_user_id,
			});
		}
	};

	return (
		<BottomSheetModal
			ref={pinPanelRef}
			snapPoints={snapPoints}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={true}
			enableDynamicSizing={false}
			backgroundStyle={styles.backgroundStyle}
		>
			<Loader show={isPageLoader} />
			{!isShowContact ? (
				<BottomSheetScrollView
					style={{ ...LayoutStyle.paddingHorizontal20 }}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ ...LayoutStyle.paddingBottom20 }}
				>
					<View style={styles.flex}>
						<View style={{ ...CommonStyles.directionRowSB }}>
							{!selectedPin ? (
								<>
									<Text style={[styles.recentTitle, { fontSize: 18 }]}>
										{pinPanelTitle ? pinPanelTitle : "Add Pin"}
									</Text>
									<TouchableOpacity onPress={handlePinClosePanel}>
										<Text style={styles.headerActionBtnTxt}>{"Done"}</Text>
									</TouchableOpacity>
								</>
							) : (
								<>
									<TouchableOpacity onPress={handleCancelPin}>
										<Text style={styles.headerActionBtnTxt}>{"Cancel"}</Text>
									</TouchableOpacity>
									<Text style={[styles.headerDetailTxt]}>{"Details"}</Text>
									<TouchableOpacity onPress={() => handleAddPin()}>
										<Text style={styles.headerActionBtnTxt}>{"Done"}</Text>
									</TouchableOpacity>
								</>
							)}
						</View>
						<View style={[styles.divDark, { marginVertical: 10 }]} />
						{!selectedPin ? (
							<>
								<View style={[styles.searchContainer, { flex: 1, height: 40 }]}>
									<View style={{ bottom: 1 }}>
										<Icons
											iconSetName={"Ionicons"}
											iconName={"search"}
											iconColor={"#888"}
											iconSize={14}
										/>
									</View>
									<TextInput
										style={styles.searchInput}
										value={searchText}
										onChangeText={(text) =>
											fetchSuggestions(
												text,
												setLoading,
												setSearchText,
												setSuggestions,
												currentLocation
											)
										}
										placeholder={"Search Maps"}
										placeholderTextColor={Colors.labelDarkGray}
									/>
									{searchText && (
										<TouchableOpacity onPress={() => onPressCloseLocation()}>
											<Icons
												iconSetName={"Ionicons"}
												iconName={"close-circle"}
												iconColor={"#888"}
												iconSize={20}
											/>
										</TouchableOpacity>
									)}
								</View>
								<View style={[styles.titleHeaderRow]}>
									<Text style={styles.headerTxt}>{"Suggestions"}</Text>
								</View>
								<View style={styles.divDark} />
								<View>
									{processedSuggestions.length > 0 &&
										processedSuggestions.map((location, index) => (
											<View key={location?.id || index}>
												<PinSuggestion item={location} />
												{index !== processedSuggestions.length - 1 && (
													<View style={styles.divDark} />
												)}
											</View>
										))}
								</View>
							</>
						) : (
							<View>
								<View
									style={[
										styles.titleHeaderRow,
										{ marginTop: 0, marginBottom: 0 },
									]}
								>
									<Text style={[styles.headerTxt, { fontSize: 16 }]}>
										{"Label"}
									</Text>
								</View>
								<View style={[styles.library]}>
									<View style={{ ...CommonStyles.directionRowCenter }}>
										<PinnedIcon />
										<View>
											<Text style={styles.selectedLabel}>
												{selectedPin?.main_text}
											</Text>
										</View>
										{/* <TextInput
									style={styles.selectedLabel}
									value={label}
									onChangeText={(text) => setLabel(text)}
								/> */}
									</View>
								</View>
								<View style={[styles.titleHeaderRow, { marginBottom: 0 }]}>
									<Text style={[styles.headerTxt, { fontSize: 16 }]}>
										{"Address"}
									</Text>
								</View>
								<View style={[styles.library]}>
									<Text style={styles.selectedAddress}>
										{`${selectedPin?.formatted_address?.localAddress}\n${
											selectedPin?.formatted_address?.city
										}\n${
											selectedPin?.formatted_address?.state +
											` ${selectedPin?.formatted_address?.zipCode}`
										}\n${selectedPin?.formatted_address?.country}`}
									</Text>
								</View>
								<View style={[styles.titleHeaderRow, { marginBottom: 0 }]}>
									<Text style={[styles.headerTxt, { fontSize: 16 }]}>
										{"Type"}
									</Text>
								</View>
								<View style={[styles.library]}>
									{pinTypeList.map((item, index) => (
										<TouchableOpacity
											key={item.id}
											onPress={() => selectPinType(item.id)}
										>
											<View style={{ ...CommonStyles.directionRowSB, flex: 1 }}>
												<View style={{ ...CommonStyles.directionRowCenter }}>
													<View
														style={[
															styles.nearByIcon,
															item?.icon_background_color && {
																backgroundColor: item?.icon_background_color,
															},
														]}
													>
														<Icons
															iconSetName={item?.icon_library}
															iconName={item?.icon_name}
															iconColor={Colors.white}
															iconSize={18}
														/>
													</View>
													<View style={{ flex: 0.9 }}>
														<Text style={styles.selectedLabel}>
															{item?.type}
														</Text>
													</View>
												</View>
												{item.isChecked && (
													<Icons
														iconSetName={"FontAwesome6"}
														iconName={"check"}
														iconColor={Colors.blueActiveBtn}
														iconSize={20}
													/>
												)}
											</View>
											{index !== pinTypes.length - 1 && (
												<View
													style={[styles.divDark, { marginVertical: 10 }]}
												/>
											)}
										</TouchableOpacity>
									))}
								</View>
								<View style={[styles.titleHeaderRow, { marginBottom: 0 }]}>
									<Text style={[styles.headerTxt, { fontSize: 16 }]}>
										{"Share ETA"}
									</Text>
								</View>
								<View style={styles.library}>
									{selectedPin && selectedPin?.user_contacts?.length > 0 && (
										<View>
											{selectedPin?.user_contacts?.map((item) => (
												<>
													<View style={{ ...CommonStyles.directionRowSB }}>
														<View
															style={{ ...CommonStyles.directionRowCenter }}
														>
															{!item?.contacts?.photo_path ? (
																<View style={styles.trustedNameProfile}>
																	<Text style={styles.singleCharTxt}>
																		{getFirstLetter(item?.contacts?.name)}
																	</Text>
																</View>
															) : (
																<View style={styles.trustedProfileCircle}>
																	<Image
																		source={item?.contacts?.photo_path}
																		style={styles.trustedProfileImg}
																	/>
																</View>
															)}
															<Text style={styles.trustedConTxt}>
																{item?.contacts?.name}
															</Text>
														</View>
														<View
															style={{ ...CommonStyles.directionRowCenter }}
														>
															<TouchableOpacity
																style={{ marginRight: 7 }}
																onPress={() => gotoDialOpen(item)}
															>
																<Icons
																	iconSetName={"MaterialDesignIcons"}
																	iconName={"phone"}
																	iconColor={Colors.blueActiveBtn}
																	iconSize={22}
																/>
															</TouchableOpacity>
															{item?.contacts?.app_user_id && (
																<TouchableOpacity
																	style={{ marginRight: 7 }}
																	onPress={() => gotoChatScreen(item)}
																>
																	<Icons
																		iconSetName={"MaterialDesignIcons"}
																		iconName={"message-reply-text-outline"}
																		iconColor={"green"}
																		iconSize={22}
																	/>
																</TouchableOpacity>
															)}
															<TouchableOpacity
																onPress={() => handleRemoveTrusted(item)}
															>
																<Icons
																	iconSetName={"Ionicons"}
																	iconName={"close-circle"}
																	iconColor={"#888"}
																	iconSize={22}
																/>
															</TouchableOpacity>
														</View>
													</View>
													<View style={styles.div} />
												</>
											))}
										</View>
									)}
									<TouchableOpacity
										style={{ ...CommonStyles.directionRowCenter }}
										onPress={handleAddPerson}
									>
										<View style={styles.addPersonIcon}>
											<Icons
												iconSetName={"Ionicons"}
												iconName={"person-sharp"}
												iconColor={Colors.blueActiveBtn}
												iconSize={14}
											/>
										</View>
										<Text style={styles.addPersonTxt}>{"Add Person"}</Text>
									</TouchableOpacity>
								</View>
								<Text
									style={{
										color: Colors.labelDarkGray,
										marginTop: 5,
										fontSize: 12,
									}}
								>
									{
										"Automatically notify another person every time you navigate to this Pin. Your location, route and ETA will be viewable until you arrive."
									}
								</Text>
								{selectedPinned && (
									<View
										style={[styles.library, { ...LayoutStyle.marginTop20 }]}
									>
										<TouchableOpacity
											onPress={() => setShowMarkerModal(true)}
											style={{ ...CommonStyles.directionRowCenter }}
										>
											<View
												style={[
													styles.unpinGrayCircle,
													{ backgroundColor: "transparent" },
												]}
											>
												<Icons
													iconSetName={"Ionicons"}
													iconName={"pin-sharp"}
													iconColor={Colors.blueActiveBtn}
													iconSize={20}
												/>
											</View>
											<Text
												style={[
													styles.unpinPlaceTxt,
													{ color: Colors.blueActiveBtn },
												]}
											>
												{"Refine Location on the Map"}
											</Text>
										</TouchableOpacity>
										<View style={styles.div} />
										<TouchableOpacity
											onPress={handleUnpinPlace}
											style={{ ...CommonStyles.directionRowCenter }}
										>
											<View style={styles.unpinGrayCircle}>
												<Icons
													iconSetName={"MaterialDesignIcons"}
													iconName={"delete-outline"}
													iconColor={Colors.errorBoxRed}
													iconSize={16}
												/>
											</View>
											<Text style={styles.unpinPlaceTxt}>{"Unpin"}</Text>
										</TouchableOpacity>
									</View>
								)}
							</View>
						)}
					</View>
				</BottomSheetScrollView>
			) : (
				<View style={[styles.flex, { ...LayoutStyle.paddingHorizontal20 }]}>
					<View style={{ ...CommonStyles.directionRowSB }}>
						<Text style={styles.smallHeaderTitle}>{"Add Trusted Contact"}</Text>
						<TouchableOpacity onPress={handleAddContact}>
							<Text style={styles.headerBlueBtnTxt}>{"Done"}</Text>
						</TouchableOpacity>
					</View>
					<View style={[styles.searchContactBox, { marginVertical: 14 }]}>
						{!contactSearch && (
							<View style={{ bottom: 1 }}>
								<Icons
									iconSetName={"Ionicons"}
									iconName={"search"}
									iconColor={"#888"}
									iconSize={14}
								/>
							</View>
						)}
						<TextInput
							style={[styles.searchInput, {}]}
							value={contactSearch}
							onChangeText={(t) => {
								setContactSearch(t);
								handleSearch(t);
							}}
							placeholder={"Search"}
							placeholderTextColor={Colors.labelDarkGray}
						/>
						{contactSearch && (
							<TouchableOpacity
								onPress={() => {
									setContactSearch("");
									handleSearch("");
								}}
							>
								<Icons
									iconSetName={"Ionicons"}
									iconName={"close-circle"}
									iconColor={"#888"}
									iconSize={18}
								/>
							</TouchableOpacity>
						)}
					</View>

					<BottomSheetFlatList
						// style={{ ...LayoutStyle.paddingTop10 }}
						ref={listRef}
						data={filteredContacts}
						keyExtractor={(item) => item.recordID}
						renderItem={renderContact}
						showsVerticalScrollIndicator={false}
						scrollEventThrottle={16}
						onEndReached={handleEndReached}
						initialNumToRender={30}
						maxToRenderPerBatch={50}
						windowSize={15}
						removeClippedSubviews
						ListFooterComponent={
							loading ? (
								<ActivityIndicator
									color={Colors.secondary}
									size="small"
									style={{ marginVertical: 10 }}
								/>
							) : null
						}
					/>
				</View>
			)}
			{showMarkerModal && markedLocation && (
				<Modal
					animationType={"slide"}
					transparent={true}
					visible={showMarkerModal}
					onRequestClose={onRequestModalClose}
				>
					<View style={styles.shareAppModalBack}>
						<View style={[styles.mapWhiteBack]}>
							<View style={styles.markerHeader}>
								<TouchableOpacity style={{}} onPress={onRequestModalClose}>
									<Text style={styles.headerCancelTxt}>{"Cancel"}</Text>
								</TouchableOpacity>
								<Text style={styles.reportPanelTitle}>{"Move Location"}</Text>
								<TouchableOpacity style={{}} onPress={handleDoneMarker}>
									<Text style={[styles.headerSend]}>{"Done"}</Text>
								</TouchableOpacity>
							</View>
							<View style={styles.flex}>
								<MapView
									ref={mapRef}
									provider={PROVIDER_GOOGLE}
									style={styles.map}
									initialRegion={{
										latitude: markedLocation.latitude || LATITUDE,
										longitude: markedLocation.longitude || LONGITUDE,
										latitudeDelta: 0.005,
										longitudeDelta: 0.005,
									}}
									onPress={handleMapPress}
									onPoiClick={handlePoiClick}
									userInterfaceStyle={"light"}
									mapType={"satellite"}
									onMapReady={() => {
										mapRef.current.animateToRegion({
											...markedLocation,
											latitudeDelta: 0.003,
											longitudeDelta: 0.003,
										});
									}}
								>
									<Marker
										coordinate={{
											latitude: markedLocation.latitude,
											longitude: markedLocation.longitude,
										}}
										draggable={true}
										onDragEnd={handleDragEnd}
									>
										<View style={styles.pinMarkerContainer}>
											<View style={styles.redPin}>
												<Icons
													iconSetName={"Ionicons"}
													iconName={"pin-sharp"}
													iconColor={Colors.white}
													iconSize={20}
												/>
												<View style={[styles.pinPoint, { bottom: -8 }]}>
													<Icons
														iconSetName={"Ionicons"}
														iconName={"caret-down-sharp"}
														iconColor={Colors.errorBoxRed}
														iconSize={16}
													/>
												</View>
											</View>
											<View style={styles.pinDot} />
										</View>
									</Marker>
								</MapView>
								<View style={styles.mapCompContainer}>
									<View style={styles.mapHeaderDesBox}>
										<Text style={styles.mapHeaderDes}>
											{"Move the map to the correct location"}
										</Text>
									</View>
									<View>
										<TouchableOpacity
											style={styles.mapNavIcon}
											onPress={() => setMarkedLocation(currentLocation)}
										>
											<Icons
												iconSetName={"Ionicons"}
												iconName={"navigate-outline"}
												iconColor={Colors.blueActiveBtn}
												iconSize={24}
											/>
										</TouchableOpacity>
										<View style={styles.removeLocContainer}>
											<TouchableOpacity
												onPress={() => {
													setShowMarkerModal(false);
													getCurrentDetail(selectedPinned?.main_text);
												}}
											>
												<Text style={styles.removeLocTxt}>
													{"Remove Location"}
												</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>
							</View>
						</View>
					</View>
				</Modal>
			)}
		</BottomSheetModal>
	);
};
