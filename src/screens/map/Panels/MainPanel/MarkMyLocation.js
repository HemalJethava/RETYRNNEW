import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Modal,
	TouchableWithoutFeedback,
	ActivityIndicator,
} from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { styles } from "./styles";
import CommonStyles from "../../../../styles/CommonStyles";
import { Icons, Loader } from "../../../../components";
import Colors from "../../../../styles/Colors";
import LayoutStyle from "../../../../styles/LayoutStyle";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchLocationName,
	fetchPlaceDetail,
	formatTime,
	getFormattedAddress,
	getPlaceDetail,
	shareLocationURL,
} from "../../../../config/CommonFunctions";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { GOOGLE_MAPS_APIKEY } from "../../../../config/BaseUrl";
import axios from "axios";
import { removeLibraryPlace, storeLibraryPlace } from "../../redux/Action";
import { RemovePinModal } from "../SubComponent/RemovePinModal";
import Api from "../../../../utils/Api";
import { showMessage } from "react-native-flash-message";
import MapStyle from "../../../../styles/MapStyle";
import { useFocusEffect } from "@react-navigation/native";

export const MarkMyLocation = ({
	markPanelRef,
	snapPoints,
	renderBackdrop,
	handleMarkClosePanel,
	currentLocation,
	currentLocationName,
	openNotePanel,
	handleMarkLocation,
	handleClearMarker,
	libraryList,
	getPinnedPlaces,
	pinnedPlacesList,
	reloadNoteTime,
	openRouteDetailPanel,
	changeDestiByPanel,
}) => {
	const userData = useSelector((state) => state.Auth.userData);
	const mapRef = useRef(null);
	const LATITUDE = 37.78825;
	const LONGITUDE = -122.4324;
	const dispatch = useDispatch();

	const [isPageLoader, setIsPageLoader] = useState(false);

	const [customSnapPoints, setCustomSnapPoints] = useState(["45%", "90%"]);
	const [shortName, setShortName] = useState("");

	const [locationDetails, setLocationDetails] = useState(null);
	const [fullAddress, setFullAddress] = useState(null);

	const [showMarkerModal, setShowMarkerModal] = useState(false);
	const [markedLocation, setMarkedLocation] = useState(null);
	const [marker, setMarker] = useState(null);
	const [markerAddress, setMarkerAddress] = useState("");
	const [isShowMore, setIsShowMore] = useState(false);

	const [isSharing, setIsSharing] = useState(false);
	const [isAddedLibrary, setIsAddedLibrary] = useState(false);
	const [isAddingLibrary, setIsAddingLibrary] = useState(false);
	const [isShowPinModal, setIsShowPinModal] = useState(false);
	const [pinnedPlace, setPinnedPlace] = useState(null);

	const [isLoadingNote, setIsLoadingNote] = useState(false);
	const [note, setNote] = useState("");

	useFocusEffect(
		useCallback(() => {
			getNotes();
		}, [locationDetails])
	);

	useEffect(() => {
		if (reloadNoteTime) {
			getNotes();
		}
	}, [reloadNoteTime]);

	useEffect(() => {
		const name = userData?.name
			?.split(" ")
			.map((word) => word[0])
			.join("")
			.toUpperCase();

		setShortName(name);
		getCurrentDetail(currentLocationName);
	}, [currentLocation, currentLocationName]);

	useEffect(() => {
		if (markedLocation) {
			getPlaceName();
		}
	}, [markedLocation]);

	useEffect(() => {
		if (locationDetails) {
			const cleanedItem = formatLocationItem(locationDetails);
			const isAlreadyAdded = libraryList.some(
				(place) => place.place_id === cleanedItem.place_id
			);
			setIsAddedLibrary(isAlreadyAdded);

			if (locationDetails?.place_id && pinnedPlacesList?.length) {
				const match = pinnedPlacesList.find(
					(item) => item.place_id === locationDetails.place_id
				);
				if (match) {
					setPinnedPlace(match);
				} else {
					setPinnedPlace(null);
				}
			}
		}
	}, [locationDetails, pinnedPlacesList]);

	const getPlaceName = async () => {
		const markAddress = await fetchLocationName(
			markedLocation?.latitude,
			markedLocation?.longitude
		);
		setMarkerAddress(markAddress);
	};
	const getNotes = async () => {
		try {
			if (!locationDetails) return;
			setIsLoadingNote(true);
			const response = await Api.get(`user/get-notes`);
			setIsLoadingNote(false);
			if (response.success && locationDetails?.place_id) {
				const found = response.data.find(
					(item) => item.place_id === locationDetails?.place_id
				);
				if (found) {
					setNote(found.notes || "");
				} else {
					setNote("");
				}
			}
		} catch (error) {
			console.warn("Error: ", error);
			setIsLoadingNote(false);
		}
	};
	const getCurrentDetail = async (address) => {
		if (!address) return;
		const suggestedAdrs = await getPlaceDetail(address, currentLocation);
		setLocationDetails(suggestedAdrs);
		const addressComp = suggestedAdrs?.address_components;
		const secondryAdrs = suggestedAdrs?.description;
		const categorizedAdrs = await getFormattedAddress(
			addressComp,
			secondryAdrs
		);
		setFullAddress(categorizedAdrs);
		handleMarkLocation(suggestedAdrs);
	};
	const DetailLoader = () => (
		<View style={{ flex: 1 }}>
			<SkeletonPlaceholder speed={800} backgroundColor={"#E1E9EE"}>
				<SkeletonPlaceholder.Item
					width={"100%"}
					height={180}
					borderRadius={10}
				/>
			</SkeletonPlaceholder>
		</View>
	);
	const onRequestModalClose = () => {
		setShowMarkerModal(false);
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
	const recenterMap = () => {
		if (currentLocation && mapRef.current) {
			mapRef.current.animateToRegion({
				...currentLocation,
				latitudeDelta: 0.003,
				longitudeDelta: 0.003,
			});
		}
	};
	const handleDoneMarker = () => {
		setShowMarkerModal(false);
		getCurrentDetail(markerAddress);
	};
	const onClosePanel = () => {
		handleClearMarker();
		handleMarkClosePanel();
	};
	const handleRemoveLibrary = async () => {
		setIsShowMore(false);
		if (pinnedPlace) {
			setIsShowPinModal(true);
		} else {
			dispatch(removeLibraryPlace([locationDetails.place_id]));
			setIsAddedLibrary(false);
		}
	};
	const MoreOptionRow = ({
		title,
		iconLibrary,
		iconName,
		onPress,
		textColor,
		iconColor,
	}) => (
		<TouchableOpacity style={styles.moreOptionRow} onPress={onPress}>
			<Text style={[styles.moreOption, textColor && { color: textColor }]}>
				{title}
			</Text>
			<Icons
				iconSetName={iconLibrary}
				iconName={iconName}
				iconColor={iconColor ? iconColor : Colors.labelBlack}
				iconSize={18}
			/>
		</TouchableOpacity>
	);
	const MoreOptions = () => (
		<View
			style={{
				position: "absolute",
				top: 40,
				right: 0,
				width: "68%",
			}}
		>
			<View style={styles.moreOptionContainer}>
				{!isAddedLibrary ? (
					<MoreOptionRow
						title={"Add to Library"}
						iconLibrary={"MaterialDesignIcons"}
						iconName={"plus"}
						onPress={handleLibrary}
					/>
				) : (
					<MoreOptionRow
						title={"Remove from Library"}
						iconLibrary={"MaterialIcons"}
						iconName={"check"}
						onPress={handleRemoveLibrary}
					/>
				)}
				<View style={styles.divPopup} />
				<MoreOptionRow
					title={"Add a Note"}
					iconLibrary={"MaterialDesignIcons"}
					iconName={"newspaper-plus"}
					onPress={() => openNotePanel(locationDetails.place_id)}
				/>
				<View style={styles.divPopup} />
				{!pinnedPlace ? (
					<MoreOptionRow
						title={"Pin"}
						iconLibrary={"MaterialDesignIcons"}
						iconName={"pin-outline"}
						onPress={handleAddPin}
					/>
				) : (
					<MoreOptionRow
						title={"Unpin"}
						iconLibrary={"MaterialDesignIcons"}
						iconName={"pin"}
						onPress={handleRemovePin}
					/>
				)}
			</View>
			<View style={styles.reportMoreOption}>
				<MoreOptionRow
					title={"Remove"}
					iconLibrary={"Ionicons"}
					iconName={"trash-sharp"}
					onPress={onClosePanel}
					textColor={Colors.errorBoxRed}
					iconColor={Colors.errorBoxRed}
				/>
			</View>
		</View>
	);
	const onPressWithoutFeedback = () => {
		if (isShowMore) setIsShowMore(false);
	};
	const onPressShare = () => {
		if (isSharing) return;

		const originLatitude = currentLocation?.latitude;
		const originLongitude = currentLocation?.longitude;
		const destinationLatitude =
			markedLocation?.latitude || currentLocation?.latitude;
		const destinationLongitude =
			markedLocation?.longitude || currentLocation?.longitude;

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
	const formatLocationItem = (item) => {
		return {
			description: item.description,
			place_id: item.place_id,
			structured_formatting: {
				main_text: item.structured_formatting?.main_text,
				secondary_text: item.structured_formatting?.secondary_text,
			},
			types: item.types,
			coords: item.coords,
			address_components: item.address_components,
			city: item.city,
			distanceMiles: item.distanceMiles,
			durationETA: item.durationETA,
			id: item.id || "",
			type: item.type || "",
			photos: item?.photos || [],
		};
	};
	const handleAddPin = async () => {
		try {
			setIsPageLoader(true);
			const payload = {
				type: "address",
				label: locationDetails?.structured_formatting?.main_text,
				place_id: locationDetails?.place_id,
			};

			const response = await Api.post(`user/save-library-data`, payload);
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
	const handleRemovePin = async () => {
		try {
			if (!pinnedPlace) return;
			setIsPageLoader(true);
			const data = {
				id: [pinnedPlace?.id],
			};

			const response = await Api.post(`user/delete-saved-library`, data);
			setIsPageLoader(false);
			if (response.success) {
				setPinnedPlace(null);
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
	const handleLibrary = async () => {
		if (isAddedLibrary) {
			setIsShowPinModal(true);
		} else {
			setIsAddingLibrary(true);
			const cleanedItem = formatLocationItem(locationDetails);

			const isAlreadyAdded = libraryList.some(
				(place) => place.place_id === cleanedItem.place_id
			);

			if (!isAlreadyAdded) {
				const updatedList = [cleanedItem, ...libraryList];
				dispatch(storeLibraryPlace(updatedList));
				setIsAddedLibrary(true);
			}
			setTimeout(() => {
				setIsAddingLibrary(false);
			}, 2000);
		}
	};
	const handleRemoveLibraryPlace = () => {
		dispatch(removeLibraryPlace([locationDetails.place_id]));
		setIsAddedLibrary(false);
		setIsShowPinModal(false);

		if (pinnedPlace) {
			handleRemovePin();
		}
	};
	const NoteLoader = () => {
		const array = Array(1).fill(0);
		return (
			<View style={{ flex: 1 }}>
				{array.map((i, index) => (
					<View key={index} style={{ ...LayoutStyle.marginVertical10 }}>
						<SkeletonPlaceholder speed={800} backgroundColor={"#E1E9EE"}>
							<SkeletonPlaceholder.Item
								width={"100%"}
								height={60}
								borderRadius={8}
							/>
						</SkeletonPlaceholder>
					</View>
				))}
			</View>
		);
	};
	const handleMoveToDiretion = async () => {
		try {
			if (locationDetails?.place_id) {
				const detail = await fetchPlaceDetail(
					locationDetails?.place_id,
					currentLocation
				);

				if (detail) {
					openRouteDetailPanel(detail);
					changeDestiByPanel(detail);

					setTimeout(() => {
						markPanelRef.current?.snapToIndex(2);
					}, 1500);
				}
			}
		} catch (error) {
			console.log("Error: ", error);
		}
	};

	return (
		<BottomSheetModal
			ref={markPanelRef}
			snapPoints={customSnapPoints}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={true}
			enableDynamicSizing={false}
			backgroundStyle={styles.backgroundStyle}
		>
			<Loader show={isPageLoader} />
			<BottomSheetScrollView
				style={styles.flex}
				showsVerticalScrollIndicator={false}
			>
				<TouchableWithoutFeedback onPress={onPressWithoutFeedback}>
					<View style={[styles.flex, { ...LayoutStyle.paddingHorizontal20 }]}>
						<View style={[{ ...CommonStyles.directionRowSB }]}>
							<Text style={[styles.reportPanelTitle, { fontSize: 24 }]}>
								{"Marked Location"}
							</Text>
							{!isAddingLibrary ? (
								<View style={{ ...CommonStyles.directionRowCenter }}>
									<TouchableOpacity
										style={[styles.headerSmallBtn]}
										onPress={handleLibrary}
									>
										{isAddedLibrary ? (
											<Icons
												iconSetName={"MaterialIcons"}
												iconName={"check"}
												iconSize={16}
												iconColor={"#888"}
											/>
										) : (
											<Icons
												iconSetName={"Feather"}
												iconName={"plus"}
												iconSize={16}
												iconColor={"#888"}
											/>
										)}
									</TouchableOpacity>
									<TouchableOpacity
										style={[
											styles.headerSmallBtn,
											{ ...LayoutStyle.marginHorizontal10 },
										]}
										onPress={onPressShare}
										disabled={isSharing}
									>
										{isSharing ? (
											<View style={{ height: 16, width: 16 }}>
												<ActivityIndicator size={"small"} color={"#888"} />
											</View>
										) : (
											<Icons
												iconSetName={"MaterialIcons"}
												iconName={"ios-share"}
												iconSize={16}
												iconColor={"#888"}
											/>
										)}
									</TouchableOpacity>
									<TouchableOpacity
										style={[styles.headerSmallBtn]}
										onPress={onClosePanel}
									>
										<Icons
											iconSetName={"MaterialCommunityIcons"}
											iconName={"window-close"}
											iconSize={16}
											iconColor={"#888"}
										/>
									</TouchableOpacity>
								</View>
							) : (
								<View style={[styles.headerSmallBtn, { flexDirection: "row" }]}>
									<Icons
										iconSetName={"MaterialIcons"}
										iconName={"check"}
										iconSize={16}
										iconColor={"#888"}
									/>
									<Text style={styles.addingLibraryTxt}>{"Add Library"}</Text>
								</View>
							)}
						</View>
						<View
							style={{
								...CommonStyles.directionRowSB,
								...LayoutStyle.marginVertical10,
							}}
						>
							<TouchableOpacity
								style={styles.markTopBtn}
								onPress={handleMoveToDiretion}
							>
								{!locationDetails ? (
									<View style={styles.markTopDirectionBack}>
										<Icons
											iconSetName={"MaterialDesignIcons"}
											iconName={"arrow-right-top"}
											iconSize={10}
											iconColor={Colors.blueActiveBtn}
										/>
									</View>
								) : (
									<Icons
										iconSetName={"Ionicons"}
										iconName={"walk-sharp"}
										iconSize={18}
										iconColor={Colors.white}
									/>
								)}
								<Text style={styles.markTopBtnTxt}>
									{!locationDetails
										? "Direction"
										: formatTime(locationDetails?.durationETA)}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.markTopBtn,
									{ backgroundColor: "#E5E5E5", marginHorizontal: 10 },
								]}
								onPress={() => {
									markPanelRef.current.snapToIndex(0);
									setMarkedLocation(currentLocation);
									setShowMarkerModal(true);
								}}
							>
								<Icons
									iconSetName={"Ionicons"}
									iconName={"pin-sharp"}
									iconSize={20}
									iconColor={Colors.blueActiveBtn}
								/>
								<Text
									style={[
										styles.markTopBtnTxt,
										{ color: Colors.blueActiveBtn },
									]}
								>
									{"Move"}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.markTopBtn, { backgroundColor: "#E5E5E5" }]}
								onPress={() => setIsShowMore(!isShowMore)}
							>
								<Icons
									iconSetName={"MaterialDesignIcons"}
									iconName={"dots-horizontal"}
									iconSize={20}
									iconColor={Colors.blueActiveBtn}
								/>
								<Text
									style={[
										styles.markTopBtnTxt,
										{ color: Colors.blueActiveBtn },
									]}
								>
									{"More"}
								</Text>
							</TouchableOpacity>
							{isShowMore && <MoreOptions />}
						</View>
						{isLoadingNote ? (
							<View style={{ ...LayoutStyle.marginTop10 }}>
								<NoteLoader />
							</View>
						) : (
							<View>
								{note && (
									<View
										style={{
											...CommonStyles.directionRowSB,
											...LayoutStyle.marginTop10,
										}}
									>
										<Text style={[styles.destiSubTitle]}>{"Note"}</Text>
										<TouchableOpacity
											onPress={() => openNotePanel(locationDetails.place_id)}
										>
											<View style={{ ...CommonStyles.directionRowCenter }}>
												<Icons
													iconSetName={"MaterialIcons"}
													iconName={"edit"}
													iconColor={Colors.secondary}
													iconSize={14}
												/>
												<Text style={MapStyle.editNoteTxt}>{"Edit"}</Text>
											</View>
										</TouchableOpacity>
									</View>
								)}
								<View
									style={[styles.library, { ...LayoutStyle.marginVertical10 }]}
								>
									{!note ? (
										<TouchableOpacity
											style={{ ...CommonStyles.directionRowCenter }}
											onPress={() => openNotePanel(locationDetails.place_id)}
										>
											<View style={[styles.contactImg]}>
												<Text style={styles.shortName}>{shortName || ""}</Text>
											</View>
											<View style={{ ...LayoutStyle.marginLeft10 }}>
												<Text style={[styles.addNoteTxt, { lineHeight: 20 }]}>
													{"Add a Note"}
												</Text>
												<Text style={[styles.noteDes, { lineHeight: 20 }]}>
													{"Only you'll see waht you write here."}
												</Text>
											</View>
										</TouchableOpacity>
									) : (
										<Text style={styles.libraryCountTxt}>{note}</Text>
									)}
								</View>
							</View>
						)}
						<View
							style={{
								...LayoutStyle.marginBottom20,
								...LayoutStyle.marginTop10,
							}}
						>
							<View style={{ ...CommonStyles.directionRowSB }}>
								<Text style={styles.destiSubTitle}>{"Details"}</Text>
							</View>
							{!locationDetails ? (
								<DetailLoader />
							) : (
								<View style={styles.library}>
									<View style={styles.onlyRowSB}>
										<View style={{ width: "85%" }}>
											<Text style={styles.noteDes}>{"Address"}</Text>
											<Text style={styles.selectedAddressText}>
												{`${fullAddress?.localAddress || ""}\n${
													fullAddress?.city || ""
												}\n${`${fullAddress?.state} ${fullAddress?.zipCode}`}\n${
													fullAddress?.country
												}`}
											</Text>
										</View>
										<TouchableOpacity
											style={styles.directionDarkCircle}
											onPress={handleMoveToDiretion}
										>
											<View style={styles.directionBlueCircle}>
												<Icons
													iconSetName={"Feather"}
													iconName={"corner-up-right"}
													iconColor={Colors.white}
													iconSize={10}
												/>
											</View>
										</TouchableOpacity>
									</View>
									<View style={styles.div} />
									<View>
										<Text style={styles.noteDes}>{"Coordinates"}</Text>
										<Text style={styles.selectedAddressText}>
											{`${locationDetails?.coords?.latitude}° N, ${locationDetails?.coords?.longitude}° E`}
										</Text>
									</View>
								</View>
							)}
						</View>
						<View style={styles.library}>
							{!pinnedPlace ? (
								<TouchableOpacity
									style={{ ...CommonStyles.directionRowCenter }}
									onPress={handleAddPin}
								>
									<View style={styles.directionDarkCircle}>
										<Icons
											iconSetName={"MaterialDesignIcons"}
											iconName={"pin-outline"}
											iconColor={Colors.blueActiveBtn}
											iconSize={16}
										/>
									</View>
									<Text style={styles.reportBtnTxt}>{"Pin"}</Text>
								</TouchableOpacity>
							) : (
								<TouchableOpacity
									style={{ ...CommonStyles.directionRowCenter }}
									onPress={handleRemovePin}
								>
									<View style={styles.directionDarkCircle}>
										<Icons
											iconSetName={"MaterialDesignIcons"}
											iconName={"pin"}
											iconColor={Colors.errorBoxRed}
											iconSize={16}
										/>
									</View>
									<Text
										style={[styles.reportBtnTxt, { color: Colors.errorBoxRed }]}
									>
										{"Unpin"}
									</Text>
								</TouchableOpacity>
							)}
						</View>
					</View>
				</TouchableWithoutFeedback>
			</BottomSheetScrollView>

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
								<TouchableOpacity
									style={{}}
									onPress={handleDoneMarker}
									disabled={!markerAddress}
								>
									<Text style={[styles.headerSend]}>{"Done"}</Text>
								</TouchableOpacity>
							</View>
							<View style={styles.flex}>
								<MapView
									ref={mapRef}
									provider={PROVIDER_GOOGLE}
									style={styles.map}
									region={{
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
										recenterMap();
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
												<View style={styles.pinPoint}>
													<Icons
														iconSetName={"Ionicons"}
														iconName={"caret-down-sharp"}
														iconColor={Colors.errorBoxRed}
														iconSize={14}
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
													getCurrentDetail(currentLocationName);
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

			{isShowPinModal && (
				<RemovePinModal
					show={isShowPinModal}
					onHide={() => setIsShowPinModal(false)}
					onPress={handleRemoveLibraryPlace}
				/>
			)}
		</BottomSheetModal>
	);
};
