import React, { useState, useEffect, useRef, useCallback } from "react";
import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	FlatList,
	Linking,
	Platform,
	LayoutAnimation,
	KeyboardAvoidingView,
	Keyboard,
	PermissionsAndroid,
} from "react-native";
import { Button, DarkHeader, Icons, KeyValue, Loader } from "../../components";
import Colors from "../../styles/Colors";
import LayoutStyle from "../../styles/LayoutStyle";
import MapStyle from "../../styles/MapStyle";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import CommonStyles from "../../styles/CommonStyles";
import { PassesColors } from "../../json/PassesColors";
import FastImage from "react-native-fast-image";
import { GOOGLE_MAPS_APIKEY } from "../../config/BaseUrl";
import MapViewDirections from "react-native-maps-directions";
import {
	convertHistotyTime,
	convertLatLongToString,
	fetchDistanceAndDuration,
	getCurrentTimeFormatHHMM,
	getShortLocationName,
	hapticVibrate,
} from "../../config/CommonFunctions";
import Api from "../../utils/Api";
import { showMessage } from "react-native-flash-message";
import { useFocusEffect } from "@react-navigation/native";
import { deviceHeight, deviceWidth } from "../../utils/DeviceInfo";
import { ConfirmDeletePopup } from "../../components/ConfirmDeletePopup";
import AccountStyle from "../../styles/AccountStyle";
import ListSkeleton from "../../components/LoaderComponents/ListSkeleton";
import { SelectAllButton } from "../../components/SelectAllButton";
import { getCurrentLocation, locationPermission } from "../../utils/Location";
import { RemoveTContactPlace } from "./components/RemoveTContactPlace";
import { TextInput } from "react-native-gesture-handler";
import { AddTrustedContact } from "./components/AddTrustedContact";
import Contacts from "react-native-contacts/src/NativeContacts";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { useSelector } from "react-redux";

const SaveDestiScreen = (props) => {
	const { tripId } = props?.route?.params;
	const userData = useSelector((state) => state.Auth.userData);
	const pinnedPlaceList = useSelector((state) => state.Map.pinnedPlaceList);

	const mapRef = useRef(null);
	const swipeableRefs = useRef({});

	const [tripDetail, setTripDetail] = useState(null);
	const [trustedContactList, setTrustedContactList] = useState([]);
	const [isListLoading, setIsListLoading] = useState(false);
	const [loading, setLoading] = useState(false);
	const [origin, setOrigin] = useState(null);
	const [originName, setOriginName] = useState("");
	const [destination, setDestination] = useState(null);
	const [currentPosition, setCurrentPosition] = useState(null);
	const [waypoints, setWaypoints] = useState([]);
	const [distance, setDistance] = useState(0);
	const [duration, setDuration] = useState(0);
	const [destinationHistory, setDestinationHistory] = useState([]);
	const [isExpanded, setIsExpanded] = useState(false);
	const [isExpandedMap, setIsExpandedMap] = useState(false);
	const [selectedItems, setSelectedItems] = useState([]);
	const [multiSelectMode, setMultiSelectMode] = useState(false);
	const [showConfirmDelete, setShowConfirmDelete] = useState(false);
	const [showRemoveContact, setShowRemoveContact] = useState(false);
	const [dottedPaths, setDottedPaths] = useState([]);

	const [enableEditNote, setEnableEditNote] = useState(false);
	const [isKeyboardVisible, setKeyboardVisible] = useState(false);
	const [note, setNote] = useState("");
	const [placeNote, sePlacetNote] = useState("");

	const [isShowContact, setIsShowContact] = useState(false);

	const getLiveLocation = async () => {
		const locPermissionGranted = await locationPermission();

		if (locPermissionGranted) {
			const { latitude, longitude, locationName } = await getCurrentLocation();
			setOrigin({ latitude, longitude });
			if (locationName) {
				const shortName = await getShortLocationName(locationName);
				setOriginName(shortName[0]?.mainText);
			}
		}
	};

	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			"keyboardDidShow",
			() => setKeyboardVisible(true)
		);
		const keyboardDidHideListener = Keyboard.addListener(
			"keyboardDidHide",
			() => setKeyboardVisible(false)
		);

		return () => {
			keyboardDidShowListener.remove();
			keyboardDidHideListener.remove();
		};
	}, []);

	useEffect(() => {
		getLiveLocation();
	}, []);

	useFocusEffect(
		useCallback(() => {
			getAllDetails();
		}, [props.navigation])
	);

	useEffect(() => {
		const fetchAndCalculate = async () => {
			if (tripDetail && origin) {
				setLoading(true);

				const destiData = {
					latitude: parseFloat(tripDetail?.destination_latitude),
					longitude: parseFloat(tripDetail?.destination_longitude),
				};

				setDestination(destiData);

				const currentData = {
					latitude: parseFloat(origin?.latitude),
					longitude: parseFloat(origin?.longitude),
				};

				setCurrentPosition(currentData);

				const waypointArray = tripDetail?.waypoint ? tripDetail?.waypoint : [];
				setWaypoints(waypointArray);
				setLoading(false);

				const originString = convertLatLongToString(origin);
				const destinationString = convertLatLongToString(destiData);

				const { distance, duration, durationText } =
					await fetchDistanceAndDuration(originString, destinationString);

				const distanceInMiles = distance * 0.000621371;

				setDistance(distanceInMiles);
				setDuration(durationText);
			}
		};

		fetchAndCalculate();
	}, [tripDetail, origin]);

	useEffect(() => {
		findDottedPaths();
	}, []);

	const getAllDetails = async () => {
		await getTripDetail();
		await getHistory();
		await getPinnedPlaces();
	};
	const getTripDetail = async () => {
		try {
			if (!tripId) return;
			const response = await Api.get(
				`user/get-saved-destination-detail/${tripId}`
			);
			if (response?.success) {
				setTripDetail(response?.data);
				setTrustedContactList(response?.data?.user_contacts);

				if (response?.data?.note) {
					setNote(response?.data?.note);
					sePlacetNote(response?.data?.note);
				}
			}
		} catch (error) {
			console.warn("Error: ", error);
		}
	};
	const getPinnedPlaces = async () => {
		dispatch(pinnedPlaceListRequest());
	};
	const findDottedPaths = async () => {
		try {
			if (origin && destination) {
				const response = await fetch(
					`https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_APIKEY}`
				);
				const data = await response.json();

				if (data.routes.length > 0) {
					const routePoints = decodePolyline(
						data.routes[0].overview_polyline.points
					);
					let newDottedPaths = [];

					const closestPointToDestination = findClosestPoint(
						routePoints,
						destination
					);
					const destinationDistance = getDistance(
						destination,
						closestPointToDestination
					);

					if (destinationDistance > 400) {
						newDottedPaths.push({
							start: destination,
							end: closestPointToDestination,
						});
					}

					setDottedPaths(newDottedPaths);
				} else {
					console.warn("No routes found from Google Maps API.");
					setDottedPaths([]);
				}
			}
		} catch (error) {
			console.error("Error fetching route data:", error);
		}
	};
	const decodePolyline = (polyline) => {
		let points = [];
		let index = 0,
			len = polyline.length;
		let lat = 0,
			lng = 0;

		while (index < len) {
			let b,
				shift = 0,
				result = 0;
			do {
				b = polyline.charCodeAt(index++) - 63;
				result |= (b & 0x1f) << shift;
				shift += 5;
			} while (b >= 0x20);
			let dlat = result & 1 ? ~(result >> 1) : result >> 1;
			lat += dlat;

			shift = 0;
			result = 0;
			do {
				b = polyline.charCodeAt(index++) - 63;
				result |= (b & 0x1f) << shift;
				shift += 5;
			} while (b >= 0x20);
			let dlng = result & 1 ? ~(result >> 1) : result >> 1;
			lng += dlng;

			points.push({
				latitude: lat / 1e5,
				longitude: lng / 1e5,
			});
		}
		return points;
	};
	const findClosestPoint = (routePoints, waypoint) => {
		let closestPoint = routePoints[0];
		let minDistance = getDistance(routePoints[0], waypoint);

		routePoints.forEach((point) => {
			const distance = getDistance(point, waypoint);
			if (distance < minDistance) {
				minDistance = distance;
				closestPoint = point;
			}
		});
		return closestPoint;
	};
	const getDistance = (coord1, coord2) => {
		const toRad = (value) => (value * Math.PI) / 180;

		const R = 6371e3; // Earth radius in meters
		const lat1 = toRad(coord1.latitude);
		const lat2 = toRad(coord2.latitude);
		const deltaLat = toRad(coord2.latitude - coord1.latitude);
		const deltaLon = toRad(coord2.longitude - coord1.longitude);

		const a =
			Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
			Math.cos(lat1) *
				Math.cos(lat2) *
				Math.sin(deltaLon / 2) *
				Math.sin(deltaLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c; // Distance in meters
	};
	const getHistory = async () => {
		try {
			setIsListLoading(true);
			const historyRes = await Api.get(`user/get-dest-history/${tripId}`);

			if (historyRes.success) {
				setIsListLoading(false);
				setDestinationHistory(historyRes?.data.reverse());
			} else {
				setIsListLoading(false);
				console.warn(historyRes.data);
			}
		} catch (error) {
			setIsListLoading(false);
			console.warn(error);
		}
	};
	const calculateDeltas = (coords) => {
		const latitudes = coords.map((coord) => coord.latitude);
		const longitudes = coords.map((coord) => coord.longitude);

		const minLat = Math.min(...latitudes);
		const maxLat = Math.max(...latitudes);
		const minLng = Math.min(...longitudes);
		const maxLng = Math.max(...longitudes);

		const latitudeDelta = (maxLat - minLat) * 1.1;
		const longitudeDelta = (maxLng - minLng) * 1.1;

		return { latitudeDelta, longitudeDelta };
	};
	const handleOnReady = (result) => {
		let allCoordinates = [];

		let bounds = {
			minLat: Number.MAX_VALUE,
			maxLat: Number.MIN_VALUE,
			minLng: Number.MAX_VALUE,
			maxLng: Number.MIN_VALUE,
		};

		result.routes?.forEach((route) => {
			const coordinates = route.coordinates;
			allCoordinates = allCoordinates.concat(coordinates);
			coordinates.forEach((coord) => {
				bounds.minLat = Math.min(bounds.minLat, coord.latitude);
				bounds.maxLat = Math.max(bounds.maxLat, coord.latitude);
				bounds.minLng = Math.min(bounds.minLng, coord.longitude);
				bounds.maxLng = Math.max(bounds.maxLng, coord.longitude);
			});
		});

		const { latitudeDelta, longitudeDelta } = calculateDeltas(allCoordinates);
		const midLat = (bounds.minLat + bounds.maxLat) / 2;
		const midLng = (bounds.minLng + bounds.maxLng) / 2;

		mapRef.current?.animateToRegion(
			{
				latitude: midLat,
				longitude: midLng,
				latitudeDelta,
				longitudeDelta,
			},
			1000
		);
		mapRef.current?.fitToCoordinates(allCoordinates, {
			edgePadding: {
				right: 20,
				bottom: 20,
				left: 20,
				top: 100,
			},
		});
	};
	const toggleExpandCollapse = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setIsExpanded(!isExpanded);
	};
	const toggleMapExpnadCollapse = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setIsExpandedMap(!isExpandedMap);
	};
	const gotoBack = () => {
		props.navigation.goBack();
	};
	const renderDestinationHistory = (item) => {
		return (
			<View>
				<KeyValue
					keyLabel={`${convertHistotyTime(item?.created_at)}`}
					valueLabel={`${distance.toFixed(2)} Miles`}
					keyColor={Colors.labelBlack}
				/>
			</View>
		);
	};
	const gotoDialOpen = (mobile) => {
		Linking.openURL(`tel:${mobile}`);
	};
	const gotoSMSOpen = (mobile) => {
		Linking.openURL(`sms:${mobile}`);
	};
	const handleLongPress = (item) => {
		setMultiSelectMode(true);
		toggleItemSelection(item);
	};
	const toggleItemSelection = (item) => {
		if (selectedItems.includes(item?.contacts?.id)) {
			if (selectedItems.length == 1) {
				setMultiSelectMode(false);
			}
			setSelectedItems(selectedItems.filter((id) => id !== item?.contacts?.id));
		} else {
			setSelectedItems([...selectedItems, item?.contacts?.id]);
			hapticVibrate();
		}
	};
	const toggleSelectAll = () => {
		if (selectedItems.length === trustedContactList.length) {
			setSelectedItems([]);
			setMultiSelectMode(false);
		} else {
			const allIds = trustedContactList.map((item) => item?.contacts?.id);
			setSelectedItems(allIds);
			setMultiSelectMode(true);
			hapticVibrate();
		}
	};
	const handlePress = (item) => {
		toggleItemSelection(item);
	};
	const ListItem = ({ item, index }) => {
		var string = item?.contacts?.name;
		const randomColor = Math.floor(Math.random() * 6);
		const colorName = PassesColors[randomColor].color;
		const isLastItem = trustedContactList.length - 1;

		return (
			<View
				style={[
					MapStyle.borders,
					{ borderBottomWidth: isLastItem === index ? 0 : 1 },
				]}
			>
				<TouchableOpacity
					style={{
						...CommonStyles.directionRowSB,
						paddingHorizontal: 20,
						backgroundColor: selectedItems.includes(item?.contacts?.id)
							? Colors.highlightSelected
							: Colors.lightGrayBG,
					}}
					onPress={() => handlePress(item)}
					onLongPress={() => handleLongPress(item)}
				>
					<View style={{ ...CommonStyles.directionRowCenter }}>
						{item?.contacts?.photo_path ? (
							<FastImage
								style={[MapStyle.profileImg]}
								source={{ uri: item?.contacts?.photo_path }}
								resizeMode={FastImage.resizeMode.cover}
							/>
						) : (
							<View
								style={[MapStyle.profileImg, { backgroundColor: colorName }]}
							>
								<Text style={[MapStyle.textColor]}>
									{string ? string.charAt(0) : ""}
								</Text>
							</View>
						)}

						<View style={{ paddingLeft: 15, width: "65%" }}>
							<Text style={[[MapStyle.darkName, {}]]} numberOfLines={1}>
								{item?.contacts?.name}
							</Text>
							<Text style={[AccountStyle.phoneNumber]}>
								{item?.contacts?.mobile}
							</Text>
						</View>
					</View>
					<View>
						{selectedItems.length > 0 ? (
							<TouchableOpacity
								style={[{ paddingVertical: 20 }]}
								onPress={() => handlePress(item)}
							>
								<Icons
									iconName={
										selectedItems.includes(item?.contacts?.id)
											? "checkbox-marked-circle-outline"
											: "checkbox-blank-circle-outline"
									}
									iconSetName={"MaterialCommunityIcons"}
									iconColor={Colors.secondary}
									iconSize={20}
								/>
							</TouchableOpacity>
						) : (
							<View style={{ ...CommonStyles.directionRowCenter }}>
								{item?.contacts?.app_user_id && (
									<TouchableOpacity
										onPress={() => gotoChatScreeen(item)}
										style={{ paddingVertical: 10 }}
									>
										<Icons
											iconColor={Colors.secondary}
											iconName={"message-text-outline"}
											iconSetName={"MaterialCommunityIcons"}
											iconSize={24}
										/>
									</TouchableOpacity>
								)}
								<TouchableOpacity
									onPress={() => gotoDialOpen(item?.contacts?.mobile)}
									style={{ paddingVertical: 20, paddingLeft: 20 }}
								>
									<Icons
										iconColor={Colors.secondary}
										iconName={"phone-outline"}
										iconSetName={"MaterialCommunityIcons"}
										iconSize={24}
									/>
								</TouchableOpacity>
							</View>
						)}
					</View>
				</TouchableOpacity>
			</View>
		);
	};
	const renderContactList = (item, index) => {
		const key = item?.id || index;
		return (
			<>
				{multiSelectMode ? (
					<ListItem item={item} index={index} />
				) : (
					<Swipeable
						ref={(ref) => {
							if (ref) swipeableRefs.current[key] = ref;
						}}
						renderRightActions={() => rightSwipeActions(item, index)}
						friction={1}
						containerStyle={{
							overflow: "hidden",
						}}
					>
						<ListItem item={item} index={index} />
					</Swipeable>
				)}
			</>
		);
	};
	const rightSwipeActions = (item, index) => {
		return (
			<TouchableOpacity
				style={[MapStyle.swipeBtn]}
				onPress={() => {
					removeContactItem(item);
				}}
			>
				<Text style={[MapStyle.swipeBtnTxt]}>Delete</Text>
			</TouchableOpacity>
		);
	};
	const gotoDirectionMap = (place) => {
		setLoading(false);
		const fetchPlace =
			place === "Food"
				? "Food"
				: place === "Hotel"
				? "Hotel"
				: place === "Fuel"
				? "Fuel"
				: "";
		props.navigation.navigate("MainMap", {
			tripId: tripId,
			place: fetchPlace,
		});
	};
	const gotoMapNavigation = async (place) => {
		try {
			setLoading(true);
			const getCurrentDate = () => {
				const date = new Date();
				const day = String(date.getDate()).padStart(2, "0");
				const month = String(date.getMonth() + 1).padStart(2, "0");
				const year = String(date.getFullYear()).slice(-2);
				return `${day}/${month}/${year}`;
			};

			const data = {
				date: getCurrentDate(),
				time: getCurrentTimeFormatHHMM(),
				destination: distance,
				saved_destination_id: tripId,
			};

			const historyRes = await Api.post(`user/save-dest-history`, data).then(
				(res) => {
					return res;
				}
			);

			if (historyRes.success) {
				gotoDirectionMap(place);
			} else {
				gotoDirectionMap(place);
				console.warn(historyRes.message);
			}
		} catch (error) {
			console.warn(error);
		}
	};
	const RenderEmptyList = () => (
		<View
			style={[
				CommonStyles.emptyListContainer,
				{ ...LayoutStyle.paddingVertical30 },
			]}
		>
			<Text style={CommonStyles.emptyTitle}>{"No Trusted Contact Found!"}</Text>
			<Text
				style={[
					CommonStyles.emptyDescription,
					{ marginBottom: 0, marginTop: 10 },
				]}
			>
				{"No trusted contact found for this trip. Please add new contact."}
			</Text>
		</View>
	);
	const removeContactItem = async (item) => {
		if (!item) return;
		setLoading(true);
		const data = {
			destination_id: tripDetail?.id,
			id: [item?.contacts?.id],
		};
		await handleRemoveTrustedContact(data);
	};
	const removeTrustedContacts = async () => {
		if (selectedItems.length === 0) return;
		setLoading(true);
		const data = {
			destination_id: tripDetail?.id,
			id: selectedItems,
		};
		await handleRemoveTrustedContact(data);
	};
	const handleRemoveTrustedContact = async (data) => {
		try {
			const existingPinnedPlace = pinnedPlaceList?.find(
				(item) => item.place_id === tripDetail?.place_id
			);

			if (existingPinnedPlace) {
				await removeTrustedPinned(existingPinnedPlace, data?.id);
				await handleRemoveContactAPI(data);
			} else {
				await handleRemoveContactAPI(data);
			}
		} catch (error) {
			console.warn("Error in handleAddContact:", error);
		}
	};
	const handleRemoveContactAPI = async (payload) => {
		try {
			const response = await Api.post(
				`user/remove-destination-trusted-contact`,
				payload
			);
			setLoading(false);
			if (response.success) {
				getAllDetails();
				setSelectedItems([]);
				setMultiSelectMode(false);
				setShowRemoveContact(false);
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
			setLoading(false);
		}
	};
	const removeTrustedPinned = async (selectedPinned, ids) => {
		try {
			const data = {
				library_id: selectedPinned?.id,
				id: ids,
			};

			const response = await Api.post(
				`user/remove-destination-trusted-contact`,
				data
			);

			console.log("response: ", response);
		} catch (e) {
			console.log("Error: ", error);
		}
	};
	const cancelPlaceNote = () => {
		setEnableEditNote(false);
		setKeyboardVisible(false);
		setNote("");
	};
	const handleAddNote = async () => {
		if (note) {
			setLoading(true);
			const data = {
				id: tripDetail?.id,

				destination_latitude: tripDetail?.destination_latitude,
				destination_longitude: tripDetail?.destination_longitude,
				destination_location_name: tripDetail?.destination_location_name,

				waypoint: [],
				waypoint_name: [],

				flag: 0,
				note: note,
				place_id: tripDetail?.place_id,
				city: tripDetail?.city,
				state: tripDetail?.state,
				state_code: tripDetail?.state_code,
			};
			handleNoteAPI(data);
		}
	};
	const handleClearNote = async () => {
		setLoading(true);
		const data = {
			id: tripDetail?.id,

			destination_latitude: tripDetail?.destination_latitude,
			destination_longitude: tripDetail?.destination_longitude,
			destination_location_name: tripDetail?.destination_location_name,

			waypoint: [],
			waypoint_name: [],

			flag: 0,
			note: "",
			place_id: tripDetail?.place_id,
			city: tripDetail?.city,
			state: tripDetail?.state,
			state_code: tripDetail?.state_code,
		};
		handleNoteAPI(data);
	};
	const handleNoteAPI = async (payload) => {
		try {
			const response = await Api.post("user/save-destination", payload);
			setLoading(false);
			if (response.success) {
				getAllDetails();
				setEnableEditNote(false);
				setNote("");
				sePlacetNote("");
				showMessage({
					message: response.message,
					type: "success",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			} else {
				const extractMessages = (messagesArray) => {
					return messagesArray
						.flatMap((item) => Object.values(item))
						.flat()
						.join(", ");
				};
				const messagesString = extractMessages(response.data.data);
				showMessage({
					message: messagesString,
					type: "danger",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			}
		} catch (error) {
			console.warn("Error: ", error);
		}
	};
	const onRequestModalClose = () => {
		setIsShowContact(false);
	};
	const onSuccessAddContact = (message) => {
		onRequestModalClose();
		showMessage({
			message: message,
			type: "success",
			floating: true,
			statusBarHeight: 40,
			icon: "auto",
			autoHide: true,
		});
		getAllDetails();
	};
	const gotoChatScreeen = (item) => {
		if (item?.contacts?.app_user_id) {
			const screen = "Message";
			props.navigation.navigate(screen, {
				item: item?.contacts?.user,
				chatID: item?.contacts?.app_user_id,
			});
		}
	};

	return (
		<KeyboardAvoidingView
			style={[MapStyle.mainContainer]}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={
				Platform.OS === "ios" ? 0 : isKeyboardVisible ? 0 : -40
			}
		>
			<Loader show={loading} />
			<ConfirmDeletePopup
				show={showConfirmDelete}
				onHide={() => setShowConfirmDelete(false)}
				title={` Destination`}
				api={`user/delete-multiple-saved-destination`}
				data={selectedItems.length > 0 ? selectedItems : [tripId]}
				setIsLoading={setLoading}
				onSuccess={(message) => {
					showMessage({
						message: message,
						type: "success",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
					gotoBack();
					setLoading(false);
					setShowConfirmDelete(false);
				}}
				onFailed={(message) => {
					setLoading(false);
					showMessage({
						message: message,
						type: "danger",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				}}
			/>
			<RemoveTContactPlace
				show={showRemoveContact}
				onHide={() => setShowRemoveContact(false)}
				onPress={removeTrustedContacts}
			/>
			<DarkHeader
				iconName={"angle-left"}
				iconSetName={"FontAwesome6"}
				iconColor={Colors.backArrowWhite}
				iconSize={24}
				whiteLabel={"Maps"}
				DarkHeaderMainStyle={[LayoutStyle.paddingTop30]}
				onPress={() => gotoBack()}
			/>
			{!loading && (
				<ScrollView
					nestedScrollEnabled={true}
					showsVerticalScrollIndicator={false}
					overScrollMode={"never"}
				>
					<View style={[MapStyle.mapCardContainer]}>
						<Text style={[MapStyle.tripDetailsText]}>
							{"Destination Details"}
						</Text>
						{origin && destination && (
							<View
								style={[
									MapStyle.mapImgContainer,
									{
										height: isExpandedMap
											? deviceHeight / 1.8
											: deviceHeight / 4.5,
										borderRadius: 7,
										overflow: "hidden",
									},
								]}
							>
								<MapView
									provider={PROVIDER_GOOGLE}
									style={styles.map}
									initialRegion={{
										latitude: origin.latitude,
										longitude: origin.longitude,
										latitudeDelta: 0.005,
										longitudeDelta: 0.005,
									}}
									userInterfaceStyle={"light"}
								>
									<Marker coordinate={origin}>
										<Icons
											iconName={"circle"}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={Colors.primary}
											iconSize={10}
										/>
									</Marker>
									<Marker coordinate={destination}>
										<Icons
											iconName={"square"}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={Colors.secondary}
											iconSize={10}
										/>
									</Marker>
									{Array.isArray(waypoints) &&
										waypoints.length !== 0 &&
										waypoints.map((waypoint, index) => (
											<Marker key={index} coordinate={waypoint}>
												<Icons
													iconName={"square"}
													iconSetName={"MaterialCommunityIcons"}
													iconColor={Colors.secondary}
													iconSize={10}
												/>
											</Marker>
										))}
									<MapViewDirections
										origin={origin}
										destination={destination}
										waypoints={waypoints}
										apikey={GOOGLE_MAPS_APIKEY}
										strokeColor="#112D4E"
										strokeWidth={2}
										onReady={handleOnReady}
									/>
									{dottedPaths.map((path, index) => (
										<Polyline
											key={index}
											coordinates={[path.start, path.end]}
											strokeColor={Colors.primary}
											strokeWidth={3}
											lineDashPattern={[10, 10]}
										/>
									))}
								</MapView>
								<TouchableOpacity
									onPress={toggleMapExpnadCollapse}
									style={[MapStyle.expandCollapseBtn]}
								>
									<Icons
										iconSetName={
											isExpandedMap ? "MaterialCommunityIcons" : "FontAwesome6"
										}
										iconName={isExpandedMap ? "arrow-collapse" : "expand"}
										iconColor={Colors.primary}
										iconSize={isExpandedMap ? 22 : 18}
									/>
								</TouchableOpacity>
							</View>
						)}
					</View>
					<View
						style={[MapStyle.tripDetailsDesti, { padding: 0, paddingTop: 20 }]}
					>
						<View style={{ paddingHorizontal: 20 }}>
							<View style={[CommonStyles.directionRowSB]}>
								<Text style={[MapStyle.destinationTitle]}>{"Address"}</Text>
								<TouchableOpacity onPress={() => gotoMapNavigation()}>
									<View
										style={[CommonStyles.directionRowCenter, MapStyle.startBtn]}
									>
										<Icons
											iconName={"location-arrow"}
											iconSetName={"FontAwesome6"}
											iconColor={Colors.secondary}
											iconSize={16}
										/>
										<Text style={[MapStyle.startText]}>{"Start"}</Text>
									</View>
								</TouchableOpacity>
							</View>
							<View style={[MapStyle.tripDetailsDesti, { padding: 0 }]}>
								<ScrollView
									nestedScrollEnabled={true}
									style={{ maxHeight: 170 }}
									scrollEnabled={true}
									showsVerticalScrollIndicator={false}
								>
									<Text style={[MapStyle.destinationTitle]}>
										{"Destination"}
									</Text>
									<View style={{ flexDirection: "row" }}>
										<View style={MapStyle.flexColumn}>
											<View style={MapStyle.originPrimaryCircle} />
											<View style={MapStyle.pathLine} />
										</View>
										<Text style={[MapStyle.originAddrText, { bottom: 4 }]}>
											{originName}
										</Text>
									</View>

									{tripDetail?.waypoint_name &&
										tripDetail?.waypoint_name !== 0 && (
											<>
												{tripDetail?.waypoint_name?.map((item, index) => (
													<View key={index} style={{ flexDirection: "row" }}>
														<View style={MapStyle.flexColumn}>
															<View style={MapStyle.blueSquare} />
															<View style={MapStyle.pathLine} />
														</View>
														<Text
															style={[
																MapStyle.originAddrText,
																{ color: "#4CA7DA", bottom: 4 },
															]}
														>
															{item ? item : "-"}
														</Text>
													</View>
												))}
											</>
										)}

									<View style={{ flexDirection: "row" }}>
										<View style={MapStyle.flexColumn}>
											<View style={MapStyle.blueSquare} />
										</View>
										<Text style={[MapStyle.originAddrText, { bottom: 4 }]}>
											{tripDetail?.destination_location_name}
										</Text>
									</View>
								</ScrollView>
							</View>
							{isListLoading ? (
								<FlatList
									style={{
										...CommonStyles.emptyList,
									}}
									data={Array(2).fill(0)}
									keyExtractor={(item, index) => `skeleton-${index.toString()}`}
									renderItem={({ item, index }) => (
										<ListSkeleton width={deviceWidth / 1.2} />
									)}
									scrollEnabled={false}
								/>
							) : (
								<>
									{destinationHistory.length > 0 && (
										<View
											style={[MapStyle.historyContainer, { marginBottom: 0 }]}
										>
											<View style={MapStyle.rowBetween}>
												<Text
													style={[
														MapStyle.destinationTitle,
														{ marginBottom: 0 },
													]}
												>
													{"History"}
												</Text>
												{destinationHistory?.length > 3 && (
													<TouchableOpacity onPress={toggleExpandCollapse}>
														<Icons
															iconColor={Colors.inputBlackText}
															iconSetName={"MaterialCommunityIcons"}
															iconName={
																isExpanded ? "chevron-up" : "chevron-down"
															}
															iconSize={22}
														/>
													</TouchableOpacity>
												)}
											</View>

											<FlatList
												data={
													isExpanded
														? destinationHistory
														: destinationHistory.slice(0, 3)
												}
												renderItem={({ item: historyItem }) =>
													renderDestinationHistory(historyItem)
												}
												scrollEnabled={false}
												keyExtractor={(item, index) =>
													`desti-${index.toString()}`
												}
											/>
										</View>
									)}
								</>
							)}
							<View style={[MapStyle.historyContainer]}>
								<Text style={[MapStyle.destinationTitle]}>{"Local"}</Text>
								<View style={[MapStyle.loaclContainer, { marginTop: 0 }]}>
									<TouchableOpacity
										style={[MapStyle.loaclCard, { backgroundColor: "orange" }]}
										onPress={() => gotoMapNavigation("Food")}
									>
										<View style={{ alignItems: "center" }}>
											<Icons
												iconSetName={"MaterialIcons"}
												iconName={"restaurant"}
												iconColor={Colors.backArrowWhite}
												iconSize={22}
											/>
											<Text style={[MapStyle.localText]}>{"Food"}</Text>
										</View>
									</TouchableOpacity>
									<TouchableOpacity
										style={[MapStyle.loaclCard, { backgroundColor: "#f5389e" }]}
										onPress={() => gotoMapNavigation("Hotel")}
									>
										<View style={{ alignItems: "center" }}>
											<Icons
												iconSetName={"FontAwesome"}
												iconName={"hotel"}
												iconColor={Colors.backArrowWhite}
												iconSize={22}
											/>
											<Text style={[MapStyle.localText]}>{"Rest Areas"}</Text>
										</View>
									</TouchableOpacity>
									<TouchableOpacity
										style={[
											MapStyle.loaclCard,
											{ backgroundColor: Colors.blueActiveBtn },
										]}
										onPress={() => gotoMapNavigation("Fuel")}
									>
										<View style={{ alignItems: "center" }}>
											<Icons
												iconSetName={"FontAwesome6"}
												iconName={"gas-pump"}
												iconColor={Colors.backArrowWhite}
												iconSize={22}
											/>
											<Text style={[MapStyle.localText]}>{"Fuel"}</Text>
										</View>
									</TouchableOpacity>
								</View>
							</View>
						</View>
						<View style={MapStyle.noteBox}>
							<View style={{ ...CommonStyles.directionRowSB }}>
								<Text style={[MapStyle.destinationTitle, { marginBottom: 0 }]}>
									{"Note"}
								</Text>
								{placeNote && !enableEditNote && (
									<TouchableOpacity onPress={() => setEnableEditNote(true)}>
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
								)}
							</View>

							{placeNote && !enableEditNote ? (
								<View style={MapStyle.noteContainer}>
									<Text style={{ color: Colors.labelBlack, fontSize: 14 }}>
										{placeNote}
									</Text>
								</View>
							) : enableEditNote ? (
								<View>
									<View style={MapStyle.noteInputContainer}>
										<TextInput
											style={MapStyle.noteInput}
											placeholder={
												"What do you want to remember about this place?"
											}
											value={note}
											onChangeText={(text) => setNote(text)}
											multiline
											scrollEnabled
											maxLength={255}
										/>
										<View style={MapStyle.noteDiv} />
										<View style={{ paddingBottom: 7 }}>
											<Text
												style={MapStyle.noteLengthTxt}
											>{`${note.length}/255`}</Text>
										</View>
									</View>
									<View style={MapStyle.noteBtnContainer}>
										<View style={MapStyle.noteBtnRow}>
											<TouchableOpacity
												style={MapStyle.noteCancelBtn}
												onPress={cancelPlaceNote}
											>
												<Text style={MapStyle.noteCancelBtnTxt}>
													{"Cancel"}
												</Text>
											</TouchableOpacity>
											{placeNote && (
												<TouchableOpacity
													style={[
														MapStyle.noteCancelBtn,
														{ backgroundColor: Colors.errorBoxRed },
													]}
													onPress={handleClearNote}
												>
													<Text style={MapStyle.noteSaveTxt}>{"Clear"}</Text>
												</TouchableOpacity>
											)}
											<TouchableOpacity
												style={[
													MapStyle.noteSaveBtn,
													{ opacity: !note ? 0.5 : 1 },
												]}
												disabled={!note}
												onPress={handleAddNote}
											>
												<Text style={MapStyle.noteSaveTxt}>{"Save"}</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>
							) : (
								<View style={[MapStyle.noteContainer]}>
									<TouchableOpacity
										style={{ ...CommonStyles.directionRowCenter }}
										onPress={() => setEnableEditNote(true)}
									>
										<Icons
											iconSetName={"MaterialIcons"}
											iconName={"edit-note"}
											iconColor={Colors.secondary}
											iconSize={20}
										/>
										<View style={{ ...LayoutStyle.marginLeft10 }}>
											<Text style={MapStyle.addNoteTxt}>{"Add a Note"}</Text>
											<Text style={MapStyle.addNoteDesTxt}>
												{"Only you'll see waht you write here."}
											</Text>
										</View>
									</TouchableOpacity>
								</View>
							)}
						</View>
						<View
							style={[
								CommonStyles.directionRowSB,
								{ marginBottom: 10, paddingHorizontal: 20 },
							]}
						>
							<Text style={[MapStyle.destinationTitle, { marginBottom: 0 }]}>
								{"Trusted Contacts"}
							</Text>
							<View style={[{ flexDirection: "row", alignItems: "center" }]}>
								<TouchableOpacity
									onPress={() => setIsShowContact(true)}
									style={{ marginRight: 7 }}
								>
									<Icons
										iconName={"plus-circle"}
										iconSetName={"MaterialCommunityIcons"}
										iconColor={Colors.secondary}
										iconSize={24}
									/>
								</TouchableOpacity>
								{trustedContactList.length !== 0 && (
									<View style={{ marginTop: 15 }}>
										<SelectAllButton
											toggleSelectAll={toggleSelectAll}
											selectedItems={selectedItems}
											mainList={trustedContactList}
										/>
									</View>
								)}
							</View>
						</View>
						<ScrollView
							nestedScrollEnabled={true}
							style={{ maxHeight: 240 }}
							scrollEnabled={true}
							showsVerticalScrollIndicator={false}
						>
							<View style={{ marginBottom: 20 }}>
								<FlatList
									data={
										trustedContactList.length !== 0 ? trustedContactList : []
									}
									renderItem={({ item: contactItem, index }) =>
										renderContactList(contactItem, index)
									}
									keyExtractor={(item, index) => `contact-${index.toString()}`}
									ListEmptyComponent={() => <RenderEmptyList />}
								/>
							</View>
						</ScrollView>
					</View>
					<View style={[MapStyle.tripDetailBottomBox]}>
						{selectedItems.length > 0 ? (
							<Button
								btnBorderColor={Colors.red}
								btnColor={Colors.red}
								isBtnActive={true}
								btnName={`${
									selectedItems.length > 1
										? `${selectedItems.length} Delete Trusted Contacts`
										: `${selectedItems.length} Delete Trusted Contact`
								}`}
								btnWidth={1}
								btnLabelColor={Colors.white}
								onPress={() => setShowRemoveContact(true)}
							/>
						) : (
							<Button
								btnBorderColor={Colors.secondary}
								btnColor={Colors.transparent}
								isBtnActive={true}
								btnName={"Unsave Destination"}
								btnWidth={1}
								btnLabelColor={Colors.secondary}
								onPress={() => setShowConfirmDelete(true)}
							/>
						)}
					</View>
				</ScrollView>
			)}

			{isShowContact && (
				<AddTrustedContact
					show={isShowContact}
					onHide={onRequestModalClose}
					destinationId={tripDetail?.id}
					placeId={tripDetail?.place_id}
					pinnedPlaceList={pinnedPlaceList}
					onSuccess={(message) => onSuccessAddContact(message)}
				/>
			)}
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "flex-end",
		alignItems: "center",
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
});

export default SaveDestiScreen;
