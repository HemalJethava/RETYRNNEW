import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import {
	BottomSheetModal,
	BottomSheetScrollView,
	useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { styles } from "./styles";
import LayoutStyle from "../../../../styles/LayoutStyle";
import CommonStyles from "../../../../styles/CommonStyles";
import { Icons } from "../../../../components";
import Colors from "../../../../styles/Colors";
import DraggableFlatList from "react-native-draggable-flatlist";
import {
	fetchCyclingRoutes,
	fetchRoutesWaypoints,
	fetchWalkingRoutes,
	generateUniqueId,
	getShortLocationName,
	hapticVibrate,
} from "../../../../config/CommonFunctions";
import Swipeable from "react-native-gesture-handler/Swipeable";
import moment from "moment";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { NoRouteFound } from "../SubComponent/NoRouteFound";

const directionOptions = [
	{ type: "Drive", iconSet: "FontAwesome6", icon: "car-rear", size: 20 },
	{ type: "Walk", iconSet: "MaterialIcons", icon: "directions-walk", size: 22 },
	{ type: "Train", iconSet: "MaterialDesignIcons", icon: "train", size: 22 },
	{ type: "Bicycle", iconSet: "FontAwesome6", icon: "bicycle", size: 20 },
	{
		type: "Booking",
		iconSet: "MaterialDesignIcons",
		icon: "human-handsup",
		size: 20,
	},
];

export const DirectionPanel = ({
	directionPanelRef,
	snapPoints,
	renderBackdrop,
	handleDirectionClosePanel,
	selectedDirection,
	openAddStopPanel,
	currentLocation,
	currentLocationName,
	selectedWaypoint,
	handleAddStopFromPanel,
	openTurnPanel,
	onPressGo,
	isNavigating,
	isShowTopPanel,
	openDurationPanel,
	reachedWaypoint,
	setReachedWaypoint,
	// Driving Routes
	routesETA,
	getDrivingRoute,
	selectedRouteIndex,

	// Walking Routes
	getWalkingRoutes,
	selectedWalkIndex,

	// Bicycle Routes
	getBicycleRoutes,
	selectedBicycleIndex,

	// Train Routes
	getTrainRoutes,

	// Booking Routes
	getBookingRoutes,

	// Fetch route again if user navigating with wrong path
	fetchWalkRouteAgain,
	setFetchWalkRouteAgain,
	fetchBicycleRouteAgain,
	setFetchBicycleRouteAgain,
}) => {
	const swipeableRefs = useRef({});

	const customSnapPoints = useMemo(() => ["45%", "90%"], []);
	const latestWaypointRef = useRef(null);
	const isInitialized = useRef(false);
	const { dismissAll } = useBottomSheetModal();
	const bottomSheetRef = useRef(null);

	const [isDragging, setIsDragging] = useState(false);

	const [myLocationName, setMyLocationName] = useState("");
	const [destinationName, setDestinationName] = useState(null);

	const [directionType, setDirectionType] = useState("Drive");
	const [waypoints, setWaypoints] = useState([]);
	const [activeItemId, setActiveItemId] = useState(null);

	const [isRoutesLoading, setIsRoutesLoading] = useState(false);
	const [walkingRoutes, setWalkingRoutes] = useState([]);
	const [bicycleRoutes, setBicycleRoutes] = useState([]);
	const [trainRoutes, setTrainRoutes] = useState([]);
	const [bookingRoutes, setBookingRoutes] = useState([]);

	const [showNoDirection, setShowNoDirection] = useState(false);
	const [showAvoidOption, setShowAvoidOption] = useState(false);
	const [avoidTolls, setAvoidTolls] = useState(false);
	const [avoidHighways, setAvoidHighways] = useState(false);

	useEffect(() => {
		if (reachedWaypoint && waypoints.length > 0) {
			const filteredWaypoints = waypoints.filter(
				(wp) =>
					!(
						wp.latitude === reachedWaypoint.latitude &&
						wp.longitude === reachedWaypoint.longitude
					)
			);
			setWaypoints(filteredWaypoints);
			setReachedWaypoint(null);
		}
	}, [reachedWaypoint]);

	useEffect(() => {
		if (
			currentLocation &&
			waypoints.length > 0 &&
			(fetchWalkRouteAgain || fetchBicycleRouteAgain)
		) {
			setWaypoints((prevWaypoints) =>
				prevWaypoints.map((wp) =>
					wp.type === "origin"
						? {
								...wp,
								latitude: currentLocation.latitude,
								longitude: currentLocation.longitude,
						  }
						: wp
				)
			);
		}
	}, [currentLocation, fetchWalkRouteAgain, fetchBicycleRouteAgain]);

	useEffect(() => {
		if (!isInitialized.current && selectedDirection && currentLocation) {
			setWaypoints([
				{
					id: generateUniqueId(),
					type: "origin",
					address: "My Location",
					latitude: currentLocation.latitude,
					longitude: currentLocation.longitude,
				},
				{
					id: generateUniqueId(),
					type: "destination",
					address: selectedDirection?.structured_formatting?.main_text
						? selectedDirection?.structured_formatting?.main_text
						: selectedDirection?.main_text
						? selectedDirection?.main_text
						: "Destination",
					latitude: selectedDirection?.coords?.latitude,
					longitude: selectedDirection?.coords?.longitude,
				},
			]);
			isInitialized.current = true;
		}
	}, [selectedDirection, currentLocation]);

	useEffect(() => {
		if (routesETA) {
		}
	}, [routesETA]);

	useEffect(() => {
		if (selectedWaypoint?.latitude && selectedWaypoint?.longitude) {
			const newWaypoint = {
				id: selectedWaypoint?.id || generateUniqueId(),
				type: selectedWaypoint?.type || "waypoint",
				address: selectedWaypoint?.address || "",
				latitude: selectedWaypoint?.latitude || 0,
				longitude: selectedWaypoint?.longitude || 0,
			};
			latestWaypointRef.current = newWaypoint;

			setWaypoints((prev) => {
				const exists = prev.find((wp) => wp.id === newWaypoint.id);
				let updated;

				if (exists) {
					updated = prev.filter((wp) => wp.id !== newWaypoint.id);
				} else {
					updated = [...prev, newWaypoint];
				}

				handleAddStopFromPanel?.(updated);
				return updated;
			});
		} else if (
			selectedWaypoint &&
			!selectedWaypoint?.latitude &&
			!selectedWaypoint?.longitude
		) {
			directionPanelRef.current?.snapToIndex(0);
			setShowNoDirection(true);
		}
	}, [selectedWaypoint]);

	useEffect(() => {
		const getAddressName = async () => {
			if (waypoints.length > 0) {
				const address = await getShortLocationName(currentLocationName);
				setMyLocationName(address[0]);

				if (selectedDirection?.main_text && selectedDirection?.secondary_text) {
					const directionAddrs = {
						mainText: selectedDirection?.main_text,
						fullText: selectedDirection?.secondary_text,
					};
					setDestinationName(directionAddrs);
				} else {
					const waypointAddrs = await getShortLocationName(
						waypoints[1]?.address
					);
					setDestinationName(waypointAddrs[0]);
				}
			}
		};
		getAddressName();
	}, [waypoints]);

	useEffect(() => {
		const fetchAndHandleRoutes = async (
			type,
			fetchFn,
			setRoutesFn,
			getRoutesFn
		) => {
			setIsRoutesLoading(true);
			const { origin, destination, waypointsArray } = await handleDirection(
				waypoints
			);
			const routes = await fetchFn(origin, destination, waypointsArray);

			if (setRoutesFn) setRoutesFn(routes);
			if (getRoutesFn) getRoutesFn(routes, type);

			if (isShowTopPanel && routes.length > 0) {
				const steps = routes[0]?.steps ?? [];
				onPressGo(steps, 0, type);
				openDurationPanel(
					{
						steps,
						myLocationName,
						destinationName,
					},
					waypoints,
					setWaypoints
				);
			}

			setIsRoutesLoading(false);
		};

		if (directionType === "Drive") {
			fetchAndHandleRoutes("Drive", fetchRoutesWaypoints);
		} else if (directionType === "Walk") {
			fetchAndHandleRoutes(
				"Walk",
				fetchWalkingRoutes,
				setWalkingRoutes,
				getWalkingRoutes
			);
		} else if (directionType === "Bicycle") {
			fetchAndHandleRoutes(
				"Bicycle",
				fetchCyclingRoutes,
				setBicycleRoutes,
				getBicycleRoutes
			);
		} else if (directionType === "Train") {
			(async () => {
				await getTrainTypeRoutes();
			})();
		} else if (directionType === "Booking") {
			(async () => await getBookingTypeRoutes())();
		}
	}, [waypoints, directionType]);

	useEffect(() => {
		const fetchAgainRoute = async () => {
			if (fetchWalkRouteAgain) {
				onPressOption("Walk");
			}
			if (fetchBicycleRouteAgain) {
				onPressOption("Bicycle");
			}
		};
		fetchAgainRoute();
	}, [fetchWalkRouteAgain, fetchBicycleRouteAgain]);

	const onPressOption = async (type) => {
		setDirectionType(type);
		if (type === "Drive") {
			await getDrivingRoute(type, avoidTolls, avoidHighways);
		}
		if (type === "Walk") {
			await getWalkTypeRoutes();
			if (fetchWalkRouteAgain && walkingRoutes.length > 0) {
				onPressGoBtn(walkingRoutes[0]?.steps, 0, "Walk");
				setFetchWalkRouteAgain(false);
			}
		}
		if (type === "Bicycle") {
			await getBicycleTypeRoutes();
			if (fetchBicycleRouteAgain && bicycleRoutes.length > 0) {
				onPressGoBtn(bicycleRoutes[0]?.steps, 0, "Walk");
				setFetchBicycleRouteAgain(false);
			}
		}
		if (type === "Train") {
			await getTrainTypeRoutes();
		}
		if (type === "Booking") {
			await getBookingTypeRoutes();
		}
	};
	const handleDirection = async (locationArray) => {
		if (locationArray.length > 0) {
			const originItem = locationArray.find((item) => item.type === "origin");
			const destinationItem = locationArray.find(
				(item) => item.type === "destination"
			);
			const waypointItems = locationArray
				.filter((item) => item.type === "waypoint")
				.map(({ latitude, longitude, address }) => ({
					latitude,
					longitude,
					locationName: address,
				}));

			const origin = originItem
				? {
						latitude: originItem.latitude,
						longitude: originItem.longitude,
						locationName: originItem.address,
				  }
				: null;

			const destination = destinationItem
				? {
						latitude: destinationItem.latitude,
						longitude: destinationItem.longitude,
						locationName: destinationItem.address,
				  }
				: null;

			const waypointsArray = waypointItems;
			return { origin, destination, waypointsArray };
		}
	};
	const getWalkTypeRoutes = async () => {
		setIsRoutesLoading(true);

		const { origin, destination, waypointsArray } = await handleDirection(
			waypoints
		);
		const walkingArray = await fetchWalkingRoutes(
			origin,
			destination,
			waypointsArray,
			avoidTolls,
			avoidHighways
		);
		setWalkingRoutes(walkingArray);
		getWalkingRoutes(walkingArray, "Walk");
		setIsRoutesLoading(false);
	};
	const getBicycleTypeRoutes = async () => {
		setIsRoutesLoading(true);
		const { origin, destination, waypointsArray } = await handleDirection(
			waypoints
		);
		const bicycleArray = await fetchCyclingRoutes(
			origin,
			destination,
			waypointsArray,
			avoidTolls,
			avoidHighways
		);
		setBicycleRoutes(bicycleArray);
		getBicycleRoutes(bicycleArray, "Bicycle");
		setIsRoutesLoading(false);
	};
	const getTrainTypeRoutes = async () => {
		setIsRoutesLoading(true);
		setTrainRoutes([]);
		getTrainRoutes([], "Train");
		setIsRoutesLoading(false);
	};
	const getBookingTypeRoutes = async () => {
		setIsRoutesLoading(true);
		setBookingRoutes([]);
		getBookingRoutes([], "Booking");
		setIsRoutesLoading(false);
	};
	const handleDragEnd = ({ data }) => {
		setWaypoints([...data]);
		handleAddStopFromPanel?.([...data]);
		setIsDragging(false);
	};
	const RenderWaypointIcon = ({ type, index }) => (
		<View>
			{type === "origin" ? (
				<Icons
					iconSetName={"Ionicons"}
					iconName={"navigate-circle"}
					iconColor={Colors.blueActiveBtn}
					iconSize={22}
				/>
			) : type === "destination" ? (
				<View style={[styles.pinIconContainer]}>
					<Icons
						iconSetName={"Ionicons"}
						iconName={"pin-sharp"}
						iconColor={Colors.white}
						iconSize={12}
					/>
				</View>
			) : type === "waypoint" ? (
				<View style={styles.positionReletiveCenter}>
					<Icons
						iconSetName={"MaterialDesignIcons"}
						iconName={"record-circle"}
						iconColor={"#667cf1"}
						iconSize={22}
					/>
					<View style={styles.indexContainer}>
						<Text style={styles.indexTxt}>{index + 1}</Text>
					</View>
				</View>
			) : null}
		</View>
	);
	const ListItem = ({ item, drag, isActive, waypointIndex }) => {
		return (
			<TouchableOpacity
				style={[CommonStyles.directionRowSB, { opacity: isActive ? 0.5 : 1 }]}
				onPress={() => onPressWaypoint(item)}
				onLongPress={() => {
					setIsDragging(true);
					drag();
					hapticVibrate();
				}}
				delayLongPress={100}
				hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
			>
				<View style={styles.waypointIconContainer}>
					<RenderWaypointIcon type={item?.type} index={waypointIndex} />
					<View style={[styles.dotsContainer]}>
						<View style={styles.pathDot} />
						<View style={styles.pathDot} />
						<View style={styles.pathDot} />
					</View>
				</View>
				<View style={[styles.waypointRow]}>
					<Text numberOfLines={1} style={[styles.waypoint, { width: "90%" }]}>
						{item?.address}
					</Text>
					<Icons
						iconSetName={"Ionicons"}
						iconName={"menu-outline"}
						iconColor={"#888"}
						iconSize={20}
					/>
				</View>
			</TouchableOpacity>
		);
	};
	const renderWaypointItem = ({ item, drag, isActive }) => {
		const key = item?.id;
		const waypointIndex =
			item.type === "waypoint"
				? waypoints
						.filter((w) => w.type === "waypoint")
						.findIndex((w) => w.id === item.id)
				: null;

		return waypoints.length > 2 ? (
			<Swipeable
				ref={(ref) => (ref ? (swipeableRefs.current[key] = ref) : null)}
				renderRightActions={() => rightSwipeActions(item, key)}
				friction={2}
				overshootRight={false}
				containerStyle={{ overflow: "visible" }}
			>
				<ListItem
					item={item}
					drag={drag}
					isActive={isActive}
					waypointIndex={waypointIndex}
				/>
			</Swipeable>
		) : (
			<ListItem
				item={item}
				drag={drag}
				isActive={isActive}
				waypointIndex={waypointIndex}
			/>
		);
	};
	const rightSwipeActions = (item, index) => {
		return (
			<TouchableOpacity
				style={[styles.swipeBtn]}
				onPress={() => onPressDeleteWaypoint(item)}
			>
				<Text style={[styles.swipeBtnTxt]}>Delete</Text>
			</TouchableOpacity>
		);
	};
	const onPressDeleteWaypoint = (item) => {
		const updated = waypoints.filter((w) => w.id !== item.id);
		setWaypoints(updated);
		handleAddStopFromPanel?.(updated);
	};
	const closeAllSwipeables = () => {
		Object.values(swipeableRefs.current).forEach((ref) => {
			ref?.close?.();
		});
	};
	const onPressWaypoint = (item) => {
		openAddStopPanel(item);
	};
	const onPressETA = (steps) => {
		const directions = {
			steps: steps,
			myLocationName: myLocationName,
			destinationName: destinationName,
			destinationCoords: selectedDirection?.coords,
		};
		openTurnPanel(directions);
	};
	const ETA = ({
		duration,
		estimatedTime,
		distance,
		isFastest,
		isFlat,
		isSelected,
		steps,
		onPress,
	}) => (
		<TouchableOpacity onPress={() => onPressETA(steps)} style={styles.etaBox}>
			<View>
				<Text style={styles.etaTimeTxt}>{`${duration}`}</Text>
				<Text
					style={styles.etaDistanceTxt}
				>{`${estimatedTime} ETA • ${distance}`}</Text>
				{isFastest && <Text style={styles.etaTypeTxt}>{"Fastest"}</Text>}
				{isFlat && (
					<>
						<Text style={styles.etaTypeTxt}>{"Mostly Flat"}</Text>
						<View style={styles.flatLine} />
					</>
				)}
			</View>
			<TouchableOpacity
				onPress={onPress}
				style={[styles.goBtn, { opacity: isSelected ? 0.6 : 1 }]}
				disabled={isSelected}
			>
				<Text style={styles.goTxt}>{"GO"}</Text>
			</TouchableOpacity>
		</TouchableOpacity>
	);
	const EmptyContainer = ({ title, description, isLearnMore }) => (
		<View style={styles.emptyDirections}>
			<Text style={styles.emptyTitle}>{title}</Text>
			<Text style={styles.emptyDes}>{description}</Text>
			{isLearnMore && (
				<TouchableOpacity style={{ ...LayoutStyle.marginTop10 }}>
					<Text style={styles.learnMore}>{"Learn More"}</Text>
				</TouchableOpacity>
			)}
		</View>
	);
	const ScheduleCalendar = ({ title }) => (
		<TouchableOpacity style={styles.calendarBtn} onPress={openAvoidOptions}>
			<Text style={styles.calendarTxt}>{"Avoid"}</Text>
			<Icons
				iconSetName={"Entypo"}
				iconName={"chevron-thin-down"}
				iconColor={Colors.labelBlack}
				iconSize={12}
			/>
		</TouchableOpacity>
	);
	const ListLoader = () => {
		const array = Array(3).fill(0);
		return (
			<View style={{ flex: 1 }}>
				<SkeletonPlaceholder speed={800} backgroundColor={"#E1E9EE"}>
					<SkeletonPlaceholder.Item
						width={100}
						height={40}
						borderRadius={20}
						marginBottom={20}
					/>
				</SkeletonPlaceholder>
				{array.map((i, index) => (
					<View key={index} style={{ ...LayoutStyle.marginBottom10 }}>
						<SkeletonPlaceholder speed={800} backgroundColor={"#E1E9EE"}>
							<SkeletonPlaceholder.Item
								width={"100%"}
								height={80}
								borderRadius={8}
							/>
						</SkeletonPlaceholder>
					</View>
				))}
			</View>
		);
	};
	const onPressGoBtn = (steps, index, type) => {
		const directions = {
			steps: steps,
			myLocationName: myLocationName,
			destinationName: destinationName,
		};

		handleDirectionClosePanel();
		onPressGo(steps, index, type);
		setTimeout(() => {
			openDurationPanel(directions, waypoints, setWaypoints);
		}, 500);
	};
	const closeNoRoute = () => {
		directionPanelRef.current?.snapToIndex(1);
		setShowNoDirection(false);
	};
	const openAvoidOptions = () => {
		directionPanelRef.current?.snapToIndex(0);
		setShowAvoidOption(true);
	};
	const closeAvoidOptions = () => {
		directionPanelRef.current?.snapToIndex(1);
		setShowAvoidOption(false);
	};
	const applyAvoidOption = () => {
		setShowAvoidOption(false);
		if (directionType === "Drive") {
			getDrivingRoute(directionType, avoidTolls, avoidHighways);
		}
		if (directionType === "Walk") {
			getWalkTypeRoutes();
		}
		if (directionType === "Bicycle") {
			getBicycleTypeRoutes();
		}
	};
	const getRouteInfo = (item) => {
		const arrivalTime = moment()
			.add(item?.durationValue, "seconds")
			.format("hh:mm A");

		const totalMinutes = parseInt(item.duration.split(" ")[0]) || 0;
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;

		const formattedDuration =
			hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
		const durationLabel = hours > 0 ? "hrs" : "mins";

		return { arrivalTime, formattedDuration, durationLabel };
	};
	return (
		<BottomSheetModal
			ref={directionPanelRef}
			snapPoints={customSnapPoints}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={!isDragging}
			enableHandlePanningGesture={!isDragging}
			enableContentPanningGesture={!isDragging}
			backgroundStyle={styles.backgroundStyle}
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
				{!showNoDirection ? (
					<View style={styles.flex}>
						{!showAvoidOption ? (
							<View>
								<View style={[{ ...CommonStyles.directionRowSB }]}>
									<Text style={styles.recentTitle}>{"Directions"}</Text>
									<TouchableOpacity
										style={[styles.closeBtn]}
										onPress={handleDirectionClosePanel}
									>
										<Icons
											iconSetName={"MaterialCommunityIcons"}
											iconName={"window-close"}
											iconSize={16}
											iconColor={"#888"}
										/>
									</TouchableOpacity>
								</View>
								<View style={styles.directionOptionRow}>
									{directionOptions.map(({ type, iconSet, icon, size }) => {
										const isSelected = directionType === type;
										return (
											<TouchableOpacity
												key={type}
												style={[
													styles.directionOptionBox,
													isSelected && {
														backgroundColor: Colors.blueActiveBtn,
													},
												]}
												onPress={() => onPressOption(type)}
											>
												<Icons
													iconSetName={iconSet}
													iconName={icon}
													iconSize={size}
													iconColor={isSelected ? Colors.white : "#888"}
												/>
											</TouchableOpacity>
										);
									})}
								</View>
								<View style={[styles.waypointsContainer]}>
									<DraggableFlatList
										style={{}}
										data={waypoints}
										keyExtractor={(item) => `map-${item.id}`}
										onDragEnd={handleDragEnd}
										activationDistance={10}
										renderItem={renderWaypointItem}
										keyboardShouldPersistTaps="always"
										scrollEnabled={false}
										nestedScrollEnabled={true}
										ListFooterComponent={() => (
											<TouchableOpacity
												style={{
													...CommonStyles.directionRowSB,
													opacity: waypoints.length >= 7 ? 0.5 : 1,
												}}
												disabled={waypoints.length >= 7}
												onPress={() => openAddStopPanel()}
											>
												<View style={[styles.waypointIconContainer]}>
													<Icons
														iconSetName={"FontAwesome6"}
														iconName={"circle-plus"}
														iconColor={Colors.blueActiveBtn}
														iconSize={18}
													/>
												</View>
												<View style={styles.addStopRow}>
													<Text style={[styles.addStopTxt]}>{"Add Stop"}</Text>
													<View />
												</View>
											</TouchableOpacity>
										)}
									/>
								</View>
								{isRoutesLoading ? (
									<ListLoader />
								) : (
									<>
										{directionType === "Drive" ? (
											<>
												{routesETA.length > 0 ? (
													<View>
														<View style={styles.scheduleRow}>
															<ScheduleCalendar />
														</View>

														<View style={styles.library}>
															{routesETA.map((item, index) => {
																const { arrivalTime, formattedDuration } =
																	getRouteInfo(item);
																return (
																	<View key={index}>
																		<ETA
																			duration={formattedDuration}
																			estimatedTime={arrivalTime}
																			distance={item?.distance}
																			isFastest={item?.isFastest}
																			steps={item?.steps}
																			isSelected={
																				isNavigating &&
																				selectedRouteIndex === index
																			}
																			onPress={() =>
																				onPressGoBtn(
																					item?.steps,
																					index,
																					"Drive"
																				)
																			}
																		/>
																		{index !== routesETA.length - 1 && (
																			<View style={styles.div} />
																		)}
																	</View>
																);
															})}
														</View>
													</View>
												) : (
													<EmptyContainer
														title={"Driving Directions Not Available"}
														description={
															"Driving directions are not yet available."
														}
													/>
												)}
											</>
										) : directionType === "Walk" ? (
											<>
												{walkingRoutes.length > 0 ? (
													<View>
														<View style={styles.scheduleRow}>
															<ScheduleCalendar />
														</View>
														<View style={styles.library}>
															{walkingRoutes.map((item, index) => {
																const { arrivalTime, formattedDuration } =
																	getRouteInfo(item);
																return (
																	<View key={item?.id}>
																		<ETA
																			duration={formattedDuration}
																			estimatedTime={arrivalTime}
																			distance={item?.distance}
																			isFlat={index === 0 ? true : false}
																			steps={item?.steps}
																			isSelected={
																				isNavigating &&
																				selectedWalkIndex === index
																			}
																			onPress={() =>
																				onPressGoBtn(item?.steps, index, "Walk")
																			}
																		/>
																		{index !== walkingRoutes.length - 1 && (
																			<View style={styles.div} />
																		)}
																	</View>
																);
															})}
														</View>
													</View>
												) : (
													<EmptyContainer
														title={"Walking Directions Not Available"}
														description={
															"Walking directions are not yet available."
														}
													/>
												)}
											</>
										) : directionType === "Train" ? (
											<>
												<EmptyContainer
													title={"Public Transport Directions Not Available"}
													description={
														"Public transport directions between these locations are not available in Maps."
													}
												/>
											</>
										) : directionType === "Bicycle" ? (
											<>
												{bicycleRoutes.length > 0 ? (
													<View>
														<View style={styles.scheduleRow}>
															<ScheduleCalendar />
														</View>
														<View style={styles.library}>
															{bicycleRoutes.map((item, index) => {
																const { arrivalTime, formattedDuration } =
																	getRouteInfo(item);
																return (
																	<View key={item?.id}>
																		<ETA
																			duration={formattedDuration}
																			estimatedTime={arrivalTime}
																			distance={item?.distance}
																			steps={item?.steps}
																			isSelected={
																				isNavigating &&
																				selectedBicycleIndex === index
																			}
																			onPress={() =>
																				onPressGoBtn(
																					item?.steps,
																					index,
																					"Bicycle"
																				)
																			}
																		/>
																		{index !== bicycleRoutes.length - 1 && (
																			<View style={styles.div} />
																		)}
																	</View>
																);
															})}
														</View>
													</View>
												) : (
													<EmptyContainer
														title={"Cycling Directions Not Available"}
														description={
															"Cycling directions are not yet available."
														}
														isLearnMore={true}
													/>
												)}
											</>
										) : (
											<>
												<EmptyContainer
													title={"Directions Not Available"}
													description={
														"No ride booking apps for your location are available."
													}
												/>
											</>
										)}
									</>
								)}
							</View>
						) : (
							<View>
								<View style={{ ...CommonStyles.directionRowSB }}>
									<TouchableOpacity onPress={closeAvoidOptions}>
										<Text style={styles.headerBlueBtnTxt}>{"Cancel"}</Text>
									</TouchableOpacity>
									<Text style={styles.smallHeaderTitle}>{"Avoid"}</Text>
									<TouchableOpacity onPress={applyAvoidOption}>
										<Text style={[styles.headerBlueBtnTxt]}>{"Apply"}</Text>
									</TouchableOpacity>
								</View>
								<View style={[styles.library, { marginTop: 10 }]}>
									<View style={CommonStyles.directionRowSB}>
										<Text style={styles.avoidBtnTxt}>{"Avoid Tolls"}</Text>
										<Switch
											value={avoidTolls}
											onValueChange={(val) => setAvoidTolls(val)}
										/>
									</View>

									<View style={styles.div} />

									<View style={CommonStyles.directionRowSB}>
										<Text style={styles.avoidBtnTxt}>{"Avoid Highways"}</Text>
										<Switch
											value={avoidHighways}
											onValueChange={(val) => setAvoidHighways(val)}
										/>
									</View>
								</View>
							</View>
						)}
					</View>
				) : (
					<NoRouteFound onPressClose={closeNoRoute} />
				)}
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
};
