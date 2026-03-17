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
	Platform,
	PermissionsAndroid,
	TextInput,
	Image,
	Alert,
	Linking,
	ActivityIndicator,
} from "react-native";
import {
	BottomSheetFlatList,
	BottomSheetModal,
	BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { styles } from "./styles";
import LayoutStyle from "../../../../styles/LayoutStyle";
import CommonStyles from "../../../../styles/CommonStyles";
import { Icons } from "../../../../components";
import Colors from "../../../../styles/Colors";
import {
	generateUniqueId,
	getNearbyPlaces,
	placeTypeMap,
	shareLocationURL,
} from "../../../../config/CommonFunctions";
import { AddStop } from "../SubComponent/AddStop";
import { NoRouteFound } from "../SubComponent/NoRouteFound";
import { PassesColors } from "../../../../json/PassesColors";
import * as Progress from "react-native-progress";
import { EndRouteModal } from "../SubComponent/EndRouteModal";
import { getDistance } from "geolib";
import { ETAContactModal } from "../SubComponent/ETAContactModal";

export const DurationPanel = ({
	durationPanelRef,
	snapPoints,
	renderBackdrop,
	directionSteps,
	handleDurationClosePanel,
	closeTopTurnDirection,
	onChangeNearbyPlace,
	onCloseNearbyPlace,
	isNavigating,
	navigationSteps,
	currentStepIndex,
	onEndRoute,
	voiceVolume,
	setVoiceVolume,
	currentLocation,
	handleAddStopClosePanel,
	handleAddStopFromPanel,
	waypoints,
	setWaypoints,
	setArrivalTimePip,
	setRemainingDistancePip,
}) => {
	const [panelType, setPanelType] = useState("");

	const [formattedDuration, setFormattedDuration] = useState("");
	const [durationLabel, setDurationLabel] = useState("");
	const [remainingDistance, setRemainingDistance] = useState(0);
	const [arrivalTime, setArrivalTime] = useState("");

	const [suggestionLoading, setSuggestionLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [suggestions, setSuggestions] = useState([]);

	const [selectedNPlaceType, setSelectedNPlaceType] = useState(null);
	const [isLoadingNearBy, setIsLoadingNearBy] = useState(false);
	const [nearByPlaces, setNearByPlaces] = useState([]);

	const [newWaypoints, setNewWaypoints] = useState([]);
	const [showNoDirection, setShowNoDirection] = useState(false);

	const [selectedIncident, setSelectedIncident] = useState("");

	const [isShowContactList, setIsShowContactList] = useState(false);
	const [selectedContact, setSelectedContact] = useState([]);
	const [contactProgressMap, setContactProgressMap] = useState({});
	const [showConfirmModal, setShowConfirmModal] = useState(false);

	const locationRef = useRef(currentLocation);

	const volumeOptions = [
		{ level: "low", icon: "volume-low", label: "Softer" },
		{ level: "medium", icon: "volume-medium", label: "Normal" },
		{ level: "high", icon: "volume-high", label: "Louder" },
	];

	useEffect(() => {
		if (directionSteps) {
			// direction steps
		}
	}, [directionSteps]);

	useEffect(() => {
		if (!isNavigating || !navigationSteps?.length) return;

		let intervalId;

		const updateDurationPanel = () => {
			locationRef.current = currentLocation;

			const now = new Date();
			const remainingSteps = navigationSteps.slice(currentStepIndex);

			if (!remainingSteps.length) return;

			let currentStepRemaining = remainingSteps[0]?.distance.value || 0;
			let currentStepDuration = remainingSteps[0]?.duration.value || 0;

			if (locationRef.current) {
				const stepEnd = remainingSteps[0].end_location;
				const userPos = {
					latitude: locationRef.current.latitude,
					longitude: locationRef.current.longitude,
				};

				const distLeft = getDistance(userPos, stepEnd);
				const stepDist = remainingSteps[0].distance.value;

				currentStepRemaining = distLeft;
				if (stepDist > 0) {
					currentStepDuration =
						(distLeft / stepDist) * remainingSteps[0].duration.value;
				}
			}

			const totalDistance =
				currentStepRemaining +
				remainingSteps
					.slice(1)
					.reduce((sum, step) => sum + step.distance.value, 0);

			const totalDuration =
				currentStepDuration +
				remainingSteps
					.slice(1)
					.reduce((sum, step) => sum + step.duration.value, 0);

			const hours = Math.floor(totalDuration / 3600);
			const minutes = Math.floor((totalDuration % 3600) / 60);

			let formattedDuration = "";
			let durationLabel = "";

			if (hours > 0) {
				formattedDuration = `${hours}:${minutes.toString().padStart(2, "0")}`;
				durationLabel = "hrs";
			} else {
				formattedDuration = `${minutes}m`;
				durationLabel = "mins";
			}

			setRemainingDistance(totalDistance);
			setRemainingDistancePip(totalDistance);
			setFormattedDuration(formattedDuration);
			setDurationLabel(durationLabel);

			const arrival = new Date(now.getTime() + totalDuration * 1000);
			const formattedArrival = arrival.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			});

			setArrivalTime(formattedArrival);
			setArrivalTimePip(formattedArrival);
		};
		updateDurationPanel();

		intervalId = setInterval(updateDurationPanel, 7000);

		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	}, [isNavigating, navigationSteps, currentStepIndex, currentLocation]);

	useEffect(() => {
		const intervals = [];

		Object.entries(contactProgressMap).forEach(([id, { timer }]) => {
			if (timer > 0) {
				const interval = setInterval(() => {
					setContactProgressMap((prev) => {
						const current = prev[id];
						if (!current || current.timer <= 1) {
							clearInterval(interval);
							return { ...prev, [id]: { ...current, timer: 0, progress: 0 } };
						}

						const updatedTimer = current.timer - 1;
						return {
							...prev,
							[id]: {
								timer: updatedTimer,
								progress: updatedTimer / 3,
							},
						};
					});
				}, 1000);

				intervals.push(interval);
			}
		});

		return () => {
			intervals.forEach(clearInterval);
		};
	}, [contactProgressMap]);

	const handleSheetChanges = useCallback(
		(index) => {
			if (panelType === "detail_options" && (index === 0 || index === 1)) {
				setPanelType("");
			} else if (!panelType && index !== 0) {
				setPanelType("detail_options");
			}
		},
		[panelType]
	);
	const onPressUpArrow = () => {
		setPanelType("detail_options");
		if (durationPanelRef.current) {
			durationPanelRef.current.snapToIndex(2);
		}
	};
	const onPressDownArrow = () => {
		setPanelType("");
		if (durationPanelRef.current) {
			durationPanelRef.current.snapToIndex(0);
		}
	};
	const DirectionOptionButton = ({
		iconSetName,
		iconName,
		iconSize,
		iconColor,
		iconBgColor,
		label,
		onPress,
	}) => {
		return (
			<TouchableOpacity
				style={CommonStyles.directionRowCenter}
				onPress={onPress}
			>
				<View
					style={[styles.optionIconContainer, { backgroundColor: iconBgColor }]}
				>
					<Icons
						iconSetName={iconSetName}
						iconName={iconName}
						iconColor={iconColor}
						iconSize={iconSize}
					/>
				</View>
				<View style={[styles.flex, { marginLeft: 12 }]}>
					<Text style={styles.destiTitleTxt}> {label} </Text>
				</View>
			</TouchableOpacity>
		);
	};
	const onPressCloseLocation = () => {
		setSuggestionLoading(false);
		setSearchText("");
		setSuggestions([]);
	};
	const onPressLocationType = async (item) => {
		onChangeNearbyPlace(item);
		setSelectedNPlaceType(item);

		const type = placeTypeMap[item?.placeName];
		if (!type) {
			console.warn("Unknown place type:", item?.placeName);
			return;
		}

		const keyword = item?.placeName === "CNG Stations" ? "CNG" : undefined;

		const nearByPlaces = await getNearbyPlaces(
			type,
			currentLocation,
			setIsLoadingNearBy,
			keyword
		);
		setNearByPlaces(nearByPlaces);
	};
	const onPressCloseAddStop = () => {
		setSearchText("");
		setSuggestions([]);
		setSelectedNPlaceType(null);
		setPanelType("detail_options");
	};
	const onPressClosePlacesList = () => {
		setIsLoadingNearBy(false);
		setSelectedNPlaceType(null);
		setNearByPlaces([]);
	};
	const onPressAddPlace = async (item) => {
		const newItem = {
			id: generateUniqueId(),
			type: "waypoint",
			address: item?.name,
			latitude: parseFloat(item?.latitude),
			longitude: parseFloat(item?.longitude),
		};

		onPressCloseAddStop();
		onPressClosePlacesList();
		durationPanelRef.current.snapToIndex(0);
		handleAddStopClosePanel?.(newItem);
		setNewWaypoints((prev) => [...prev, newItem]);
	};
	const onPressSuggestion = async (item) => {
		if (!item?.coords) {
			durationPanelRef.current?.snapToIndex(2);
			setShowNoDirection(true);
		} else {
			const newItem = {
				id: generateUniqueId(),
				type: "waypoint",
				address: item?.structured_formatting?.main_text || "Waypoiny",
				latitude: parseFloat(item?.coords?.latitude),
				longitude: parseFloat(item?.coords?.longitude),
			};
			onPressCloseAddStop();
			onPressClosePlacesList();
			durationPanelRef.current.snapToIndex(0);
			handleAddStopClosePanel?.(newItem);
			setNewWaypoints((prev) => [...prev, newItem]);
		}
	};
	const removeWaypoint = async (item) => {
		const updatedWaypoints = waypoints.filter(
			(waypoint) => waypoint.id !== item.id
		);
		const updatedNewWaypoints = newWaypoints.filter(
			(waypoint) => waypoint.id !== item.id
		);

		durationPanelRef.current.snapToIndex(0);
		setWaypoints(updatedWaypoints);
		setNewWaypoints(updatedNewWaypoints);
		await handleAddStopFromPanel?.(updatedWaypoints);
		setTimeout(() => {
			handleAddStopClosePanel?.(item);
		}, 300);
	};
	const closeNoRoute = () => {
		durationPanelRef.current?.snapToIndex(2);
		setShowNoDirection(false);
	};
	const openAddPerson = () => {
		setPanelType("add_stop");
	};
	const openShareETA = () => {
		setPanelType("share_ETA");
		durationPanelRef.current.snapToIndex(1);
	};
	const openReportIncident = () => {
		setPanelType("incident");
	};
	const openVolumeSetting = () => {
		setPanelType("volume");
		durationPanelRef.current.snapToIndex(1);
	};
	const PanelOptions = () => (
		<View style={styles.flex}>
			<View style={[{ ...CommonStyles.directionRowSB }]}>
				<Text style={styles.recentTitle}> {"Route Details"} </Text>
				<TouchableOpacity style={styles.dArrowBtn} onPress={onPressDownArrow}>
					<Icons
						iconSetName={"MaterialIcons"}
						iconName={"keyboard-arrow-down"}
						iconColor={"#888"}
						iconSize={26}
					/>
				</TouchableOpacity>
			</View>
			<View style={{ ...LayoutStyle.marginVertical20 }}>
				<View style={styles.library}>
					<View style={{ ...CommonStyles.directionRowCenter }}>
						<View style={[styles.optionIconContainer]}>
							<Icons
								iconSetName={"Ionicons"}
								iconName={"pin-sharp"}
								iconColor={Colors.white}
								iconSize={24}
							/>
						</View>
						<View style={[styles.flex, { marginLeft: 12 }]}>
							<Text style={styles.destiTitleTxt}>
								{directionSteps?.destinationName?.mainText}
							</Text>
							<Text style={styles.destiArriveTxt}>
								{`${arrivalTime} arrival`}
							</Text>
						</View>
					</View>
					{newWaypoints.length > 0 && <View style={styles.div} />}
					{newWaypoints.length > 0 &&
						newWaypoints.map((item, index) => {
							return (
								<View key={index}>
									<View style={{ ...CommonStyles.directionRowSB }}>
										<View
											style={{
												...CommonStyles.directionRowCenter,
												width: "80%",
											}}
										>
											<Icons
												iconSetName={"MaterialDesignIcons"}
												iconName={"record-circle"}
												iconColor={"#667cf1"}
												iconSize={36}
											/>
											<View style={{ marginHorizontal: 12 }}>
												<Text numberOfLines={1} style={styles.destiTitleTxt}>
													{item?.address}
												</Text>
											</View>
										</View>
										<TouchableOpacity onPress={() => removeWaypoint(item)}>
											<Icons
												iconSetName={"FontAwesome6"}
												iconName={"minus"}
												iconColor={Colors.errorBoxRed}
												iconSize={20}
											/>
										</TouchableOpacity>
									</View>
									{index !== newWaypoints.length - 1 && (
										<View style={styles.div} />
									)}
								</View>
							);
						})}
				</View>
			</View>
			<View style={styles.library}>
				<DirectionOptionButton
					iconSetName={"Feather"}
					iconName={"plus"}
					iconColor={Colors.white}
					iconSize={28}
					iconBgColor={Colors.blueActiveBtn}
					label={"Add Stop"}
					onPress={openAddPerson}
				/>
				<View style={[styles.div, { marginVertical: 10 }]} />
				<DirectionOptionButton
					iconSetName={"MaterialIcons"}
					iconName={"person-add"}
					iconColor={Colors.white}
					iconSize={20}
					iconBgColor={"#34c753"}
					label={"Share ETA"}
					onPress={openShareETA}
				/>
				<View style={[styles.div, { marginVertical: 10 }]} />
				<DirectionOptionButton
					iconSetName={"MaterialDesignIcons"}
					iconName={"message-alert"}
					iconColor={Colors.white}
					iconSize={20}
					iconBgColor={"#fe2c56"}
					label={"Report an Incident"}
					onPress={openReportIncident}
				/>
				<View style={[styles.div, { marginVertical: 10 }]} />
				<DirectionOptionButton
					iconSetName={"Ionicons"}
					iconName={"volume-medium-outline"}
					iconColor={Colors.white}
					iconSize={24}
					iconBgColor={"#89888c"}
					label={"Voice Volume"}
					onPress={openVolumeSetting}
				/>
			</View>
			<TouchableOpacity
				style={[styles.endRouteBtn]}
				onPress={() => {
					if (durationPanelRef.current) {
						durationPanelRef.current.snapToIndex(0);
					}
					setShowConfirmModal(true);
				}}
			>
				<Text style={styles.endRouteTxt}> {"End Route"} </Text>
			</TouchableOpacity>
		</View>
	);
	const VolumeSetting = () => (
		<View style={styles.flex}>
			<View
				style={{
					...CommonStyles.directionRowSB,
					...LayoutStyle.marginTop10,
				}}
			>
				<Text style={styles.dTitleDetail}> {"Voice Volume"} </Text>
				<TouchableOpacity
					style={styles.dArrowBtn}
					onPress={() => {
						onPressUpArrow();
					}}
				>
					<Icons
						iconSetName={"MaterialCommunityIcons"}
						iconName={"window-close"}
						iconColor={"#888"}
						iconSize={20}
					/>
				</TouchableOpacity>
			</View>
			<View style={styles.soundIconContainer}>
				{volumeOptions.map((option) => (
					<TouchableOpacity
						key={option.level}
						onPress={() => setVoiceVolume(option.level)}
						style={{
							backgroundColor:
								voiceVolume === option.level ? Colors.white : "transparent",
							borderRadius: 30,
							padding: 5,
						}}
					>
						<Icons
							iconSetName={"Ionicons"}
							iconName={option.icon}
							iconColor={
								voiceVolume === option.level
									? Colors.iconBlack
									: Colors.labelDarkGray
							}
							iconSize={50}
						/>
					</TouchableOpacity>
				))}
			</View>

			<View style={styles.soundOptionTxtRow}>
				{volumeOptions.map((option) => (
					<Text key={option.level} style={styles.soundOptionTxt}>
						{option.label}
					</Text>
				))}
			</View>
		</View>
	);
	const onPressIncident = (type) => {
		setSelectedIncident(type);
	};
	const IncidentTypeRow = ({
		iconLibrary,
		iconName,
		iconSize,
		iconColor,
		title,
		onPress,
		backgroundColor,
	}) => (
		<TouchableOpacity
			style={{ ...CommonStyles.directionRowCenter }}
			onPress={onPress}
		>
			<View
				style={[
					styles.incidentTypeIcon,
					backgroundColor && { backgroundColor: backgroundColor },
				]}
			>
				<Icons
					iconSetName={iconLibrary}
					iconName={iconName}
					iconColor={iconColor}
					iconSize={iconSize}
				/>
			</View>
			<View style={{ ...LayoutStyle.marginLeft10 }}>
				<Text style={styles.incidentTypeTxt}> {title} </Text>
			</View>
		</TouchableOpacity>
	);
	const closeIncident = () => {
		if (!selectedIncident) {
			setPanelType("detail_options");
		} else {
			setSelectedIncident("");
		}
	};
	const ReportIncident = () => (
		<View style={styles.flex}>
			<View style={{ ...CommonStyles.directionRowSB }}>
				<Text style={styles.recentTitle}> {"Report an Incident"} </Text>
				<TouchableOpacity style={[styles.closeBtn]} onPress={closeIncident}>
					<Icons
						iconSetName={"MaterialCommunityIcons"}
						iconName={"window-close"}
						iconSize={16}
						iconColor={"#888"}
					/>
				</TouchableOpacity>
			</View>
			{!selectedIncident ? (
				<View style={[styles.incidentTypeRow]}>
					<IncidentTypeRow
						title={"Crash"}
						iconLibrary={"FontAwesome6"}
						iconName={"car-burst"}
						iconColor={Colors.white}
						iconSize={20}
						onPress={() => onPressIncident("crash")}
					/>
					<View style={styles.div} />
					<IncidentTypeRow
						title={"Speed Check"}
						iconLibrary={"MaterialDesignIcons"}
						iconName={"speedometer"}
						iconColor={Colors.white}
						iconSize={20}
						onPress={() => onPressIncident("speed")}
						backgroundColor={Colors.blueActiveBtn}
					/>
					<View style={styles.div} />
					<IncidentTypeRow
						title={"Hazard"}
						iconLibrary={"Ionicons"}
						iconName={"alert"}
						iconColor={Colors.iconBlack}
						iconSize={20}
						onPress={() => onPressIncident("hazard")}
						backgroundColor={"#fdcb00"}
					/>
				</View>
			) : selectedIncident === "crash" ? (
				<View style={[styles.incidentTypeRow]}>
					<IncidentTypeRow
						title={"Crash"}
						iconLibrary={"FontAwesome6"}
						iconName={"car-burst"}
						iconColor={Colors.white}
						iconSize={20}
						onPress={() => {}}
					/>
				</View>
			) : selectedIncident === "speed" ? (
				<View style={[styles.incidentTypeRow]}>
					<IncidentTypeRow
						title={"Speed Check"}
						iconLibrary={"MaterialDesignIcons"}
						iconName={"speedometer"}
						iconColor={Colors.white}
						iconSize={20}
						onPress={() => {}}
						backgroundColor={Colors.blueActiveBtn}
					/>
				</View>
			) : selectedIncident === "hazard" ? (
				<View style={[styles.incidentTypeRow]}>
					<IncidentTypeRow
						title={"Hazard"}
						iconLibrary={"Ionicons"}
						iconName={"alert"}
						iconColor={Colors.iconBlack}
						iconSize={20}
						onPress={() => {}}
						backgroundColor={"#fdcb00"}
					/>
				</View>
			) : null}
		</View>
	);
	const NavigatingInfo = () => (
		<View>
			<View
				style={{
					...CommonStyles.directionRowSB,
					...LayoutStyle.paddingVertical10,
				}}
			>
				<View style={{ ...CommonStyles.directionRowCenter, flex: 0.8 }}>
					<View>
						<Text style={styles.dTitleDetail}>
							{arrivalTime ? arrivalTime : "00:00"}
						</Text>
						<Text style={styles.dPanelTitle}> {"arrival"} </Text>
					</View>
					<View style={{ ...LayoutStyle.marginHorizontal20 }}>
						<Text style={styles.dTitleDetail}>
							{formattedDuration ? formattedDuration : "0m"}
						</Text>
						<Text style={styles.dPanelTitle}>
							{durationLabel ? durationLabel : "mins"}
						</Text>
					</View>
					<View>
						<Text style={styles.dTitleDetail}>
							{(remainingDistance / 1609.34).toFixed(1)}
							{/* {1001.05548} */}
						</Text>
						<Text style={styles.dPanelTitle}> {"miles"} </Text>
					</View>
				</View>
				<TouchableOpacity
					style={[
						styles.dArrowBtn,
						{ top: Platform.OS === "ios" ? 0 : -10, flex: 0.1 },
					]}
					onPress={onPressUpArrow}
				>
					<Icons
						iconSetName={"MaterialIcons"}
						iconName={"keyboard-arrow-up"}
						iconColor={"#888"}
						iconSize={26}
					/>
				</TouchableOpacity>
			</View>
			{selectedContact.length > 0 && (
				<TouchableOpacity style={styles.shareLenghtBtn} onPress={openShareETA}>
					<Text style={styles.shareLengthTxt}>
						{`Sharing ETA with ${selectedContact.length} person`}
					</Text>
				</TouchableOpacity>
			)}
		</View>
	);
	const onPressContact = (item) => {
		if (!item?.phoneNumbers || item.phoneNumbers.length === 0) {
			Alert.alert("No phone number found.");
			return;
		}

		const phoneNumber = item.phoneNumbers[0].number;
		const formattedNumber = phoneNumber.replace(/\s+/g, "");

		const message = `I will arrive at ${directionSteps?.destinationName?.mainText} around ${arrivalTime}. I'll let you know if I'm running late.`;
		const smsUrl = `sms:${formattedNumber}?body=${message}`;

		if (formattedNumber) {
			setSelectedContact((prev) => [...prev, item]);
			setContactProgressMap((prevMap) => ({
				...prevMap,
				[item.recordID]: { timer: 3, progress: 1 },
			}));

			setIsShowContactList(false);
			setTimeout(() => {
				Linking.openURL(smsUrl);
			}, 2000);
		} else {
			Alert.alert("Something went wrong!");
		}
	};
	const onPressStopSharing = (item) => {
		const updatedContacts = selectedContact.filter(
			(contact) => contact.recordID !== item.recordID
		);
		setSelectedContact(updatedContacts);

		setContactProgressMap((prevMap) => {
			const updated = { ...prevMap };
			delete updated[item.recordID];
			return updated;
		});
	};
	const StopSharingItem = ({ item, index }) => {
		const colorName = PassesColors[Math.floor(Math.random() * 6)]?.color;
		const progressData = contactProgressMap[item.recordID] || { progress: 0 };

		const { givenName, familyName } = item;
		const firstLetter = givenName?.[0] || "";

		return (
			<TouchableOpacity
				style={{
					...CommonStyles.directionRowSB,
					paddingVertical: 7,
				}}
				onPress={() => onPressStopSharing(item)}
			>
				<View style={{ ...CommonStyles.directionRowCenter }}>
					<View style={{ ...LayoutStyle.marginRight10 }}>
						<Progress.Circle
							progress={progressData.progress}
							size={40}
							thickness={2.5}
							color={Colors.white}
							unfilledColor={Colors.blueActiveBtn}
							borderWidth={0}
							style={{
								position: "absolute",
								top: 0,
								bottom: 0,
								left: 0,
								right: 0,
							}}
						/>
						{item.hasThumbnail && item.thumbnailPath ? (
							<Image
								source={{ uri: item.thumbnailPath }}
								style={styles.contactProfile}
								resizeMode={"cover"}
							/>
						) : (
							<View
								style={[
									styles.fLatterCircle,
									{ backgroundColor: `${colorName}99` },
								]}
							>
								<Text style={styles.fLatter}>{firstLetter}</Text>
							</View>
						)}
					</View>
					<View>
						<Text style={styles.contactName}> {getName(item)} </Text>
						<Text style={styles.stopShareTxt}> {"Stop sharing ETA"} </Text>
					</View>
				</View>
				<Text style={styles.smsTxt}> {"SMS"} </Text>
			</TouchableOpacity>
		);
	};
	const onRequestModalClose = () => {
		setShowConfirmModal(false);
	};

	const getName = useCallback((c) => {
		return Platform.OS === "ios"
			? `${c.givenName || ""} ${c.middleName ? `${c.middleName} ` : ""}${
					c.familyName || ""
			  }`.trim()
			: c.displayName || "";
	}, []);

	return (
		<BottomSheetModal
			ref={durationPanelRef}
			snapPoints={["27%", "65%"]}
			enableDynamicSizing={true}
			enablePanDownToClose={false}
			backgroundStyle={styles.backgroundStyle}
			onChange={handleSheetChanges}
		>
			<BottomSheetScrollView
				style={styles.flex}
				contentContainerStyle={{
					...LayoutStyle.paddingHorizontal20,
					...LayoutStyle.paddingBottom20,
				}}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps={"always"}
			>
				<View style={styles.flex}>
					{!showNoDirection ? (
						<View style={styles.flex}>
							{panelType === "detail_options" ? (
								<PanelOptions />
							) : panelType === "volume" ? (
								<VolumeSetting />
							) : panelType === "add_stop" ? (
								<AddStop
									selectedNPlaceType={selectedNPlaceType}
									onPressCloseAddStop={onPressCloseAddStop}
									currentLocation={currentLocation}
									onPressCloseLocation={onPressCloseLocation}
									onPressLocationType={onPressLocationType}
									onPressClosePlacesList={onPressClosePlacesList}
									setSuggestionLoading={setSuggestionLoading}
									searchText={searchText}
									setSearchText={setSearchText}
									suggestions={suggestions}
									setSuggestions={setSuggestions}
									isLoadingNearBy={isLoadingNearBy}
									nearByPlaces={nearByPlaces}
									onPressAddPlace={(item) => onPressAddPlace(item)}
									onPressSuggestion={(item) => onPressSuggestion(item)}
									onCloseNearbyPlace={onCloseNearbyPlace}
								/>
							) : panelType === "incident" ? (
								<ReportIncident />
							) : panelType === "share_ETA" ? (
								<View style={[styles.flex]}>
									{!isShowContactList && (
										<>
											<View style={styles.onlyRowSB}>
												<View style={{ width: "85%" }}>
													<Text style={styles.recentTitle}>
														{selectedContact.length === 0
															? "Share ETA"
															: selectedContact.length === 1
															? `Sharing ETA with ${getName(
																	selectedContact[0]
															  )}`
															: `Sharing ETA with ${getName(
																	selectedContact[0]
															  )} & ${selectedContact.length - 1} more`}
													</Text>

													<Text style={styles.shareETADes}>
														{
															"Share your live location and all stops along your route while navigating."
														}
													</Text>
												</View>
												<TouchableOpacity
													style={[styles.closeBtn]}
													onPress={() => setPanelType("detail_options")}
												>
													<Icons
														iconSetName={"MaterialCommunityIcons"}
														iconName={"window-close"}
														iconSize={16}
														iconColor={"#888"}
													/>
												</TouchableOpacity>
											</View>
											{selectedContact.length > 0 && (
												<View
													style={[
														styles.library,
														{ ...LayoutStyle.marginTop10 },
													]}
												>
													<BottomSheetFlatList
														data={selectedContact}
														renderItem={({ item, index }) => (
															<StopSharingItem item={item} />
														)}
														keyExtractor={(_, index) => index.toString()}
														ItemSeparatorComponent={() => (
															<View style={styles.divDark} />
														)}
													/>
												</View>
											)}
											<TouchableOpacity
												style={[
													styles.library,
													{ ...LayoutStyle.marginVertical20 },
												]}
												onPress={() => setIsShowContactList(true)}
											>
												<View style={{ ...CommonStyles.directionRowCenter }}>
													<View style={styles.grayContactCircle}>
														<View style={styles.blueContactCircle}>
															<Icons
																iconSetName={"Ionicons"}
																iconName={"person"}
																iconColor={Colors.white}
																iconSize={20}
															/>
														</View>
													</View>
													<View style={{ ...LayoutStyle.marginLeft10 }}>
														<Text style={styles.openContactTxt}>
															{"Open Contacts"}
														</Text>
													</View>
												</View>
											</TouchableOpacity>
										</>
									)}
								</View>
							) : (
								<NavigatingInfo />
							)}
						</View>
					) : (
						<NoRouteFound onPressClose={closeNoRoute} />
					)}
				</View>
			</BottomSheetScrollView>
			{showConfirmModal && (
				<EndRouteModal
					show={showConfirmModal}
					onHide={onRequestModalClose}
					onConfirm={onEndRoute}
				/>
			)}
			{isShowContactList && (
				<ETAContactModal
					show={isShowContactList}
					onHide={() => {
						setIsShowContactList(false);
						durationPanelRef.current.snapToIndex(1);
					}}
					onPressContact={(item) => onPressContact(item)}
				/>
			)}
		</BottomSheetModal>
	);
};
