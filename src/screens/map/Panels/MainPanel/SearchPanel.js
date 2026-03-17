import React, { useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	TextInput,
	Keyboard,
	StyleSheet,
	Linking,
	ActivityIndicator,
	Platform,
} from "react-native";
import Colors from "../../../../styles/Colors";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { styles } from "./styles";
import LayoutStyle from "../../../../styles/LayoutStyle";
import CommonStyles from "../../../../styles/CommonStyles";
import { Icons, Loader } from "../../../../components";
import {
	fetchPlaceDetail,
	fetchSuggestions,
	getFormattedAddress,
	getPlaceDetailByLatLng,
	shareLocationURL,
} from "../../../../config/CommonFunctions";
import { NoRouteFound } from "../SubComponent/NoRouteFound";
import Share from "react-native-share";
import { ScrollView } from "react-native-gesture-handler";
import Api from "../../../../utils/Api";
import { showMessage } from "react-native-flash-message";
import { BlurView } from "@react-native-community/blur";
import { SelectedLibraryModal } from "../SubComponent/SelectedLibraryModal";
import { RecentSelected } from "../SubComponent/RecentSelected";

export const SearchPanel = ({
	panelRef,
	snapPoints,
	handleSheetChanges,
	renderBackdrop,
	openPinPanel,
	currentLocation,
	recentHistory,
	libraryList,
	openLibraryPanel,
	openRecentPanel,
	gotoLegalDataScreen,
	setIsFocusSearch,
	isFocusSearch,
	openRouteDetailPanel,
	openNearbyPanel,
	selectedDestination,
	changeDestiByPanel,
	onChangeNearbyPlace,
	openMarkPanel,
	pinnedPlacesList,
	selectedNearbyType,
	getPinnedPlaces,
}) => {
	const [isPageLoader, setIsPageLoader] = useState(false);

	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [suggestions, setSuggestions] = useState([]);
	const [showNoDirection, setShowNoDirection] = useState(false);
	const [filteredPinnedList, setFilteredPinnedList] = useState([]);
	const [homePinned, setHomePinned] = useState(null);
	const [workPinned, setWorkPinned] = useState(null);
	const [schoolPinned, setSchoolPinned] = useState(null);
	const [selectedItem, setSelectedItem] = useState(null);
	const [selectedRecentLoc, setSelectedRecentLoc] = useState(null);

	const [loadingInitPlace, setLoadingInitPlace] = useState(true);

	const [detailRecentHistory, setDetailRecentHistory] = useState([]);
	const [isSharing, setIsSharing] = useState(false);

	const hasRunRef = useRef(false);

	useEffect(() => {
		getInitPlaceDetail();
	}, [selectedDestination]);

	useEffect(() => {
		const processRecentHistory = async () => {
			let rawList = [];

			if (recentHistory?.length > 0) {
				const detailedHistory = await Promise.all(
					recentHistory.map(async (historyItem) => {
						const detail = await fetchPlaceDetail(
							historyItem?.place_id,
							currentLocation
						);
						return {
							...historyItem,
							...detail,
						};
					})
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
			setDetailRecentHistory(formattedList);
		};

		processRecentHistory();
	}, [recentHistory, currentLocation]);

	useEffect(() => {
		if (Array.isArray(pinnedPlacesList)) {
			const home = pinnedPlacesList.find((item) => item.pinnedType === "home");
			const work = pinnedPlacesList.find((item) => item.pinnedType === "work");
			const school = pinnedPlacesList.find(
				(item) => item.pinnedType === "school"
			);

			const others = pinnedPlacesList.filter(
				(item) =>
					item.pinnedType !== "home" &&
					item.pinnedType !== "work" &&
					item.pinnedType !== "school"
			);

			setHomePinned(home || null);
			setWorkPinned(work || null);
			setSchoolPinned(school || null);
			setFilteredPinnedList(others);
		}
	}, [pinnedPlacesList]);

	useEffect(() => {
		if (selectedNearbyType) {
			getSelectedNearbyType();
		}
	}, [selectedNearbyType]);

	const getInitPlaceDetail = async () => {
		try {
			if (selectedDestination && !hasRunRef.current) {
				hasRunRef.current = true;

				const timeoutPromise = new Promise((_, reject) =>
					setTimeout(() => reject(new Error("timeout")), 4000)
				);

				let detail = null;
				const coords = {
					latitude: selectedDestination?.latitude,
					longitude: selectedDestination?.longitude,
				};
				if (selectedDestination?.placeId) {
					detail = await Promise.race([
						fetchPlaceDetail(selectedDestination?.placeId, currentLocation),
						timeoutPromise,
					]);
				} else {
					detail = await Promise.race([
						getPlaceDetailByLatLng(coords, currentLocation),
						timeoutPromise,
					]);
				}

				if (detail) {
					openRouteDetailPanel(detail);
					changeDestiByPanel(detail);

					setTimeout(() => {
						panelRef.current?.snapToIndex(2);
						setLoadingInitPlace(false);
					}, 1500);
				} else {
					setLoadingInitPlace(false);
				}
			}
		} catch (error) {
			console.warn("Error: ", error.message);
			setLoadingInitPlace(false);
		}
	};
	const getSelectedNearbyType = async () => {
		if (selectedNearbyType === "Food") {
			const foodPlaces = {
				backgroundColor: "orange",
				iconLibrary: "MaterialIcons",
				iconName: "restaurant",
				iconSize: 14,
				placeName: "Lunch",
			};
			onPressNearByType(foodPlaces);
		}
		if (selectedNearbyType === "Hotel") {
			const hotelPlaces = {
				backgroundColor: "#f5389e",
				iconLibrary: "FontAwesome",
				iconName: "hotel",
				iconSize: 14,
				placeName: "Hotels",
			};
			onPressNearByType(hotelPlaces);
		}
		if (selectedNearbyType === "Fuel") {
			const fuelPlaces = {
				iconLibrary: "FontAwesome6",
				iconName: "gas-pump",
				iconSize: 14,
				placeName: "Gas Stations",
			};
			onPressNearByType(fuelPlaces);
		}
	};
	const onPressCancelSearch = () => {
		Keyboard.dismiss();
		setIsFocusSearch(false);

		onPressCloseLocation();
	};
	const onPressNearByType = async (item) => {
		openNearbyPanel(item);
		onChangeNearbyPlace(item);
	};
	const NearByLocation = ({
		backgroundColor,
		iconLibrary,
		iconName,
		iconSize,
		placeName,
		isShowDiv = true,
	}) => {
		const item = {
			backgroundColor,
			iconLibrary,
			iconName,
			iconSize: iconSize || 14,
			placeName,
		};
		return (
			<TouchableOpacity onPress={() => onPressNearByType(item)}>
				<View style={styles.searchedRow}>
					<View
						style={[
							styles.nearByIcon,
							backgroundColor && { backgroundColor: backgroundColor },
						]}
					>
						<Icons
							iconSetName={iconLibrary}
							iconName={iconName}
							iconColor={Colors.white}
							iconSize={iconSize || 14}
						/>
					</View>
					<Text style={styles.searchedDestination}>{placeName}</Text>
				</View>
				{isShowDiv && <View style={styles.divDark} />}
			</TouchableOpacity>
		);
	};
	const onPressRecent = async (location) => {
		const detail = await fetchPlaceDetail(location?.place_id, currentLocation);

		if (detail) {
			openRouteDetailPanel(detail);
			changeDestiByPanel(detail);
		}
	};
	const RecentLocation = ({ location, index }) => (
		<TouchableOpacity
			style={{ ...CommonStyles.directionRowCenter }}
			onPress={() => onPressRecent(location)}
			onLongPress={() => setSelectedRecentLoc(location)}
		>
			<View style={[styles.directionCircle]}>
				<Icons
					iconSetName={"Feather"}
					iconName={"corner-up-right"}
					iconColor={Colors.white}
					iconSize={18}
				/>
			</View>
			<View style={styles.flex}>
				<Text numberOfLines={2} style={styles.recentDestination}>
					{location?.destinationLocation?.destinationLocationName}
				</Text>
				<Text numberOfLines={2} style={[styles.fromLocationTxt]}>
					{"From My Location" || location?.originLocation?.originLocationName}
				</Text>
			</View>
		</TouchableOpacity>
	);
	const onPressSuggestion = (item) => {
		if (!item?.distanceMiles) {
			panelRef.current?.snapToIndex(1);
			setShowNoDirection(true);
		} else {
			openRouteDetailPanel(item);
			changeDestiByPanel(item);

			setTimeout(() => {
				setSearchText("");
				setSuggestions([]);
			}, 300);
		}
	};
	const SuggestionLocation = ({ item }) => {
		const location = item?.structured_formatting;
		if (!location) return <></>;

		return (
			<>
				<TouchableOpacity
					onPress={() => onPressSuggestion(item)}
					style={styles.locationRow}
				>
					<Icons
						iconSetName={"MaterialDesignIcons"}
						iconName={"record-circle"}
						iconColor={"#667cf1"}
						iconSize={38}
					/>
					<View style={styles.locationTxtBox}>
						<Text style={styles.locationTxt}>{location.main_text}</Text>
						<View style={{ ...CommonStyles.directionRowCenter }}>
							{item?.distanceMiles && (
								<Text style={styles.distanceTxt}>
									{`${item.distanceMiles.toFixed(2)} Miles • `}
								</Text>
							)}
							<Text
								numberOfLines={1}
								ellipsizeMode="tail"
								style={styles.locationDesTxt}
							>
								{location.secondary_text}
							</Text>
						</View>
					</View>
				</TouchableOpacity>
				<View style={styles.divDark} />
			</>
		);
	};
	const onPressCloseLocation = () => {
		setLoading(false);
		setSearchText("");
		setSuggestions([]);
	};
	const closeNoRoute = () => {
		panelRef.current?.snapToIndex(2);
		setShowNoDirection(false);
	};
	const shareMyLocation = () => {
		const url = `https://maps.google.com/?q=${currentLocation?.latitude},${currentLocation?.longitude}`;
		Share.open({
			title: "My Location",
			message: "",
			url: url,
		});
	};
	const handlePinned = (item, type) => {
		if (!item) {
			openPinPanel(`Set Up ${type}`, null);
		} else if (item?.coords) {
			openRouteDetailPanel(item);
			changeDestiByPanel(item);
		} else {
			panelRef.current?.snapToIndex(1);
			setShowNoDirection(true);
		}
	};
	const handleUnpin = async () => {
		try {
			if (!selectedItem) return;

			setIsPageLoader(true);
			const data = {
				id: [selectedItem?.id],
			};

			const response = await Api.post(`user/delete-saved-library`, data);
			setIsPageLoader(false);

			if (response.success) {
				setSelectedItem(null);
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
	const handlePinnedInfo = async () => {
		const addressF =
			selectedItem?.secondary_text ||
			selectedItem?.structured_formatting?.secondary_text;

		const formatted = await getFormattedAddress(
			selectedItem?.address_components || [],
			addressF || ""
		);

		let title = "Add Pin";
		if (selectedItem?.pinnedType === "home") {
			title = "Set Up Home";
		} else if (selectedItem?.pinnedType === "work") {
			title = "Set Up Work";
		} else if (selectedItem?.pinnedType === "school") {
			title = "Set Up School";
		} else {
			title = "Add Pin";
		}

		const pinnedPlace = {
			id: selectedItem?.id,
			display_id: selectedItem?.display_id,
			place_id: selectedItem?.place_id,
			main_text:
				selectedItem?.main_text ||
				selectedItem?.structured_formatting?.main_text,
			secondary_text: addressF,
			formatted_address: formatted,
			user_contacts: selectedItem?.user_contacts,
			coords: selectedItem?.coords,
			distanceMiles: selectedItem?.distanceMiles,
			durationETA: selectedItem?.durationETA,
			photos: selectedItem?.photos || [],
		};

		setSelectedItem(null);
		openPinPanel(title, pinnedPlace);
	};
	const handleRecentDirection = async () => {
		const detail = await fetchPlaceDetail(
			selectedRecentLoc?.place_id,
			currentLocation
		);

		if (detail) {
			setSelectedRecentLoc(null);
			openRouteDetailPanel(detail);
			changeDestiByPanel(detail);
		}
	};
	const handleRecentCall = () => {
		if (!selectedRecentLoc?.phoneNumber) return;
		setSelectedRecentLoc(null);

		Linking.openURL(`tel:${selectedRecentLoc?.phoneNumber}`);
	};
	const handleRecentWebsite = () => {
		if (!selectedRecentLoc?.website) return;
		setSelectedRecentLoc(null);

		const url = selectedRecentLoc?.website;
		Linking.canOpenURL(url).then((supported) => {
			if (supported) {
				Linking.openURL(url);
			} else {
				// Don't know how to open URI
			}
		});
	};
	const handleRecentShareLocation = () => {
		if (!selectedRecentLoc?.coords) return;
		if (isSharing) return;

		setSelectedRecentLoc(null);
		const originLatitude = currentLocation?.latitude;
		const originLongitude = currentLocation?.longitude;
		const destinationLatitude = selectedRecentLoc?.coords?.latitude;
		const destinationLongitude = selectedRecentLoc?.coords?.longitude;

		const waypoints = [];

		setTimeout(() => {
			shareLocationURL(
				originLatitude,
				originLongitude,
				destinationLatitude,
				destinationLongitude,
				waypoints,
				setIsSharing
			);
		}, 300);
	};

	return (
		<BottomSheetModal
			ref={panelRef}
			snapPoints={snapPoints}
			onChange={handleSheetChanges}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={false}
			enableDynamicSizing={false}
			backgroundStyle={{ backgroundColor: styles.backgroundStyle }}
		>
			<Loader show={isPageLoader} />
			<BottomSheetScrollView
				style={[styles.mainContainer]}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ ...LayoutStyle.paddingBottom20 }}
				keyboardShouldPersistTaps={"always"}
			>
				{!showNoDirection ? (
					<>
						{loadingInitPlace ? (
							<View style={{ ...LayoutStyle.marginVertical20 }}>
								<ActivityIndicator
									color={Colors.primary}
									size={Platform.OS === "ios" ? "small" : "large"}
								/>
							</View>
						) : (
							<View style={styles.flex}>
								<>
									<View style={styles.searchRow}>
										<View
											style={[
												styles.searchContainer,
												{ flex: isFocusSearch ? 0.95 : 1 },
											]}
										>
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
												onFocus={() => {
													setIsFocusSearch(true);
													setTimeout(
														() => panelRef.current?.snapToIndex(2),
														300
													);
												}}
											/>
											{searchText && (
												<TouchableOpacity
													onPress={() => onPressCloseLocation()}
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

										{isFocusSearch && (
											<TouchableOpacity
												style={styles.cancelSearchBtn}
												onPress={onPressCancelSearch}
											>
												<Text style={styles.cancelSearchTxt}>{"Cancel"}</Text>
											</TouchableOpacity>
										)}
									</View>
									{suggestions.length > 0 &&
										suggestions.map((item, index) => (
											<View key={index}>
												<SuggestionLocation item={item} />
											</View>
										))}
								</>
								{!searchText && (
									<>
										{!isFocusSearch ? (
											<View>
												<View style={[styles.titleHeaderRow, { marginTop: 0 }]}>
													<Text style={styles.headerTxt}>{"Library"}</Text>
												</View>

												<View style={[styles.library]}>
													<ScrollView
														style={{ flex: 1, ...LayoutStyle.marginVertical10 }}
														horizontal
														showsHorizontalScrollIndicator={false}
														nestedScrollEnabled={true}
													>
														{!homePinned ? (
															<TouchableOpacity
																style={[styles.libraryBtn]}
																onPress={() => handlePinned(null, "Home")}
															>
																<View style={[styles.libraryIcon]}>
																	<Icons
																		iconSetName={"Ionicons"}
																		iconName={"home"}
																		iconColor={Colors.blueActiveBtn}
																		iconSize={28}
																	/>
																</View>
																<Text style={[styles.libraryTag]}>
																	{"Home"}
																</Text>
																<Text style={styles.libraryBlueTxt}>
																	{"Add"}
																</Text>
															</TouchableOpacity>
														) : (
															<View style={[styles.libraryBtn]}>
																<TouchableOpacity
																	style={[
																		styles.libraryIcon,
																		{ backgroundColor: "#33d0eb" },
																	]}
																	onPress={() =>
																		handlePinned(homePinned, "Home")
																	}
																	onLongPress={() => {
																		setSelectedItem(homePinned);
																	}}
																>
																	<Icons
																		iconSetName={"Ionicons"}
																		iconName={"home"}
																		iconColor={Colors.white}
																		iconSize={28}
																	/>
																</TouchableOpacity>
																<Text style={[styles.libraryTag]}>
																	{"Home"}
																</Text>
																<TouchableOpacity style={{}}>
																	<Text style={styles.libraryBlueTxt}>
																		{`${
																			homePinned?.label.length > 7
																				? `${homePinned?.label.slice(0, 7)}...`
																				: homePinned?.label
																		}`}
																	</Text>
																</TouchableOpacity>
															</View>
														)}
														{!workPinned ? (
															<TouchableOpacity
																style={styles.libraryBtn}
																onPress={() => handlePinned(null, "Work")}
															>
																<View style={[styles.libraryIcon]}>
																	<Icons
																		iconSetName={"Ionicons"}
																		iconName={"briefcase"}
																		iconColor={Colors.blueActiveBtn}
																		iconSize={28}
																	/>
																</View>
																<Text style={[styles.libraryTag]}>
																	{"Work"}
																</Text>
																<Text style={styles.libraryBlueTxt}>
																	{"Add"}
																</Text>
															</TouchableOpacity>
														) : (
															<View style={styles.libraryBtn}>
																<TouchableOpacity
																	style={[
																		styles.libraryIcon,
																		{ backgroundColor: "#94694f" },
																	]}
																	onPress={() =>
																		handlePinned(workPinned, "Work")
																	}
																	onLongPress={() =>
																		setSelectedItem(workPinned)
																	}
																>
																	<Icons
																		iconSetName={"Ionicons"}
																		iconName={"briefcase"}
																		iconColor={Colors.white}
																		iconSize={28}
																	/>
																</TouchableOpacity>
																<Text style={[styles.libraryTag]}>
																	{"Work"}
																</Text>
																<TouchableOpacity style={{}}>
																	<Text style={styles.libraryBlueTxt}>
																		{`${
																			workPinned?.label.length > 7
																				? `${workPinned?.label.slice(0, 7)}...`
																				: workPinned?.label
																		}`}
																	</Text>
																</TouchableOpacity>
															</View>
														)}
														{schoolPinned && (
															<TouchableOpacity
																style={styles.libraryBtn}
																onPress={() =>
																	handlePinned(schoolPinned, "School")
																}
																onLongPress={() =>
																	setSelectedItem(schoolPinned)
																}
															>
																<View
																	style={[
																		styles.libraryIcon,
																		{ backgroundColor: "#94694f" },
																	]}
																>
																	<Icons
																		iconSetName={"Ionicons"}
																		iconName={"school"}
																		iconColor={Colors.white}
																		iconSize={28}
																	/>
																</View>
																<Text style={[styles.libraryTag]}>
																	{"School"}
																</Text>
																<Text style={styles.libraryBlueTxt}>
																	{`${
																		schoolPinned?.label.length > 7
																			? `${schoolPinned?.label.slice(0, 7)}...`
																			: schoolPinned?.label
																	}`}
																</Text>
															</TouchableOpacity>
														)}
														{filteredPinnedList.length > 0 &&
															filteredPinnedList.map((item) => (
																<>
																	<TouchableOpacity
																		style={styles.libraryBtn}
																		onPress={() => handlePinned(item, "Other")}
																		onLongPress={() => setSelectedItem(item)}
																	>
																		<View
																			style={[
																				styles.libraryIcon,
																				{ backgroundColor: "#E5E5E5" },
																			]}
																		>
																			<Icons
																				iconSetName={"MaterialDesignIcons"}
																				iconName={"record-circle"}
																				iconColor={"#667cf1"}
																				iconSize={42}
																			/>
																		</View>
																		<Text style={[styles.libraryTag]}>
																			{`${
																				item?.label.length > 7
																					? `${item?.label.slice(0, 7)}...`
																					: item?.label
																			}`}
																		</Text>
																		<Text style={styles.libraryBlueTxt}>
																			{item?.distanceMiles
																				? `${item?.distanceMiles.toFixed(0)} mi`
																				: `${item?.distanceMiles} mi`}
																		</Text>
																	</TouchableOpacity>
																</>
															))}
														<TouchableOpacity
															style={styles.libraryBtn}
															onPress={() => openPinPanel("Add Pin", null)}
														>
															<View style={[styles.libraryIcon]}>
																<Icons
																	iconSetName={"MaterialIcons"}
																	iconName={"add"}
																	iconColor={Colors.blueActiveBtn}
																	iconSize={32}
																/>
															</View>
															<Text
																style={[
																	styles.libraryTag,
																	{ color: Colors.blueActiveBtn },
																]}
															>
																{"Add"}
															</Text>
															<Text style={{}}>{""}</Text>
														</TouchableOpacity>
													</ScrollView>
													<View style={styles.div} />
													<TouchableOpacity
														style={{ ...CommonStyles.directionRowSB }}
														onPress={openLibraryPanel}
													>
														<View
															style={{ ...CommonStyles.directionRowCenter }}
														>
															<Text style={styles.libraryCountTxt}>
																{`${libraryList?.length} Places`}
															</Text>
															{pinnedPlacesList?.length > 0 && (
																<Text style={styles.libraryCountTxt}>
																	{` • ${pinnedPlacesList?.length} Pinned`}
																</Text>
															)}
														</View>
														<Icons
															iconSetName={"Entypo"}
															iconName={"chevron-small-right"}
															iconColor={Colors.labelDarkGray}
															iconSize={24}
														/>
													</TouchableOpacity>
												</View>
												{detailRecentHistory.length > 0 && (
													<>
														<View style={styles.titleHeaderRow}>
															<Text style={styles.headerTxt}>{"Recents"}</Text>
															<TouchableOpacity
																style={[]}
																onPress={openRecentPanel}
															>
																<Text style={styles.moreBtnTxt}>{"More"}</Text>
															</TouchableOpacity>
														</View>
														<View style={[styles.library]}>
															{detailRecentHistory
																.slice(0, 3)
																.map((location, index) => (
																	<View key={location.id}>
																		<RecentLocation
																			location={location}
																			index={index}
																		/>
																		{index !==
																			detailRecentHistory.length - 1 && (
																			<View style={styles.div} />
																		)}
																	</View>
																))}
														</View>
													</>
												)}
												<View style={{ ...LayoutStyle.marginVertical20 }}>
													<TouchableOpacity
														style={styles.shareBtn}
														onPress={shareMyLocation}
													>
														<Text style={styles.shareBtnTxt}>
															{"Share My Location"}
														</Text>
													</TouchableOpacity>
													<TouchableOpacity
														style={[styles.shareBtn, { marginVertical: 10 }]}
														onPress={openMarkPanel}
													>
														<Text style={styles.shareBtnTxt}>
															{"Mark My Location"}
														</Text>
													</TouchableOpacity>
													{/* <TouchableOpacity style={styles.shareBtn}>
										<Text style={styles.shareBtnTxt}>{"Report an Issue"}</Text>
									</TouchableOpacity> */}
												</View>
												<TouchableOpacity
													style={{ ...CommonStyles.directionRowCenter }}
													onPress={gotoLegalDataScreen}
												>
													<Text style={styles.termsTxt}>
														{"Terms & Conditions"}
													</Text>
													<Icons
														iconSetName={"Entypo"}
														iconName={"chevron-small-right"}
														iconColor={Colors.labelDarkGray}
														iconSize={14}
													/>
												</TouchableOpacity>
											</View>
										) : (
											<View>
												{recentHistory && recentHistory.length > 0 && (
													<>
														<View
															style={[styles.titleHeaderRow, { marginTop: 0 }]}
														>
															<Text style={styles.headerTxt}>{"Recents"}</Text>
															<TouchableOpacity
																style={[]}
																onPress={openRecentPanel}
															>
																<Text style={styles.moreBtnTxt}>{"More"}</Text>
															</TouchableOpacity>
														</View>
														<View style={styles.divDark} />
														<View style={{}}>
															{recentHistory
																.slice(0, 3)
																.map((location, index) => (
																	<>
																		<TouchableOpacity
																			onPress={() => onPressRecent(location)}
																			style={styles.searchedRow}
																		>
																			<View style={styles.searchedIcon}>
																				<Icons
																					iconSetName={"Ionicons"}
																					iconName={"search"}
																					iconColor={"#888"}
																					iconSize={18}
																				/>
																			</View>
																			<Text style={styles.searchedDestination}>
																				{
																					location?.destinationLocation
																						?.destinationLocationName
																				}
																				{location?.city && (
																					<>
																						<Text style={styles.middleDot}>
																							{" • "}
																						</Text>
																						<Text
																							style={styles.searchedDestiCity}
																						>
																							{location?.city || ""}
																						</Text>
																					</>
																				)}
																			</Text>
																		</TouchableOpacity>
																		{index !== recentHistory.length - 1 && (
																			<View style={styles.divDark} />
																		)}
																	</>
																))}
														</View>
													</>
												)}
												<>
													<View style={[styles.titleHeaderRow, {}]}>
														<Text style={styles.headerTxt}>
															{"Find Nearby"}
														</Text>
													</View>
													<View style={styles.divDark} />
													<NearByLocation
														iconLibrary={"FontAwesome6"}
														iconName={"gas-pump"}
														placeName={"Gas Stations"}
													/>
													<NearByLocation
														iconLibrary={"MaterialIcons"}
														iconName={"restaurant"}
														placeName={"Lunch"}
														backgroundColor={"orange"}
													/>
													<NearByLocation
														iconLibrary={"FontAwesome"}
														iconName={"hotel"}
														placeName={"Hotels"}
														backgroundColor={"#f5389e"}
													/>
													<NearByLocation
														iconLibrary={"MaterialIcons"}
														iconName={"train"}
														placeName={"Railway Stations"}
														iconSize={18}
													/>
													<NearByLocation
														iconLibrary={"MaterialDesignIcons"}
														iconName={"parking"}
														placeName={"Parking"}
														iconSize={18}
													/>
													<NearByLocation
														iconLibrary={"Ionicons"}
														iconName={"train-sharp"}
														placeName={"Metro Station"}
														iconSize={18}
													/>
													<NearByLocation
														iconLibrary={"FontAwesome"}
														iconName={"bus"}
														placeName={"Bus Stops"}
														iconSize={18}
													/>
													<NearByLocation
														iconLibrary={"MaterialDesignIcons"}
														iconName={"coffee"}
														placeName={"Coffee Shops"}
														iconSize={18}
														backgroundColor={"orange"}
														isShowDiv={false}
													/>
												</>
											</View>
										)}
									</>
								)}
							</View>
						)}
					</>
				) : (
					<NoRouteFound onPressClose={closeNoRoute} />
				)}
			</BottomSheetScrollView>
			{(!!selectedItem || !!selectedRecentLoc) && (
				<BlurView
					style={StyleSheet.absoluteFill}
					blurType="light"
					blurAmount={2}
				/>
			)}
			{!!selectedItem && (
				<SelectedLibraryModal
					show={!!selectedItem}
					onHide={() => setSelectedItem(null)}
					data={selectedItem}
					handleUnpin={() => handleUnpin()}
					handleDetails={() => handlePinnedInfo()}
				/>
			)}
			{!!selectedRecentLoc && (
				<RecentSelected
					show={!!selectedRecentLoc}
					onHide={() => setSelectedRecentLoc(null)}
					data={selectedRecentLoc}
					handleDirection={handleRecentDirection}
					handleCall={handleRecentCall}
					handleHomePage={handleRecentWebsite}
					handleShareLocation={handleRecentShareLocation}
				/>
			)}
		</BottomSheetModal>
	);
};
