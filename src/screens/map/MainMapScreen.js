import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	View,
	TouchableOpacity,
	Platform,
	Text,
	Animated,
	BackHandler,
	AppState,
	NativeModules,
	StatusBar,
} from "react-native";
import MapView, {
	AnimatedRegion,
	Marker,
	Polyline,
	PROVIDER_GOOGLE,
} from "react-native-maps";
import Colors from "../../styles/Colors";
import { Icons } from "../../components";
import { Loader } from "../../components";
import CommonStyles from "../../styles/CommonStyles";
import { getCurrentLocation, locationPermission } from "../../utils/Location";
import { styles } from "../../styles/DirectionMapStyle";
import MainPanel from "./Panels/MainPanel/MainPanel";
import MapStyle from "../../styles/MapStyle";
import Api from "../../utils/Api";
import {
	convertLatLongToString,
	fetchDistanceAndDuration,
	fetchNearbyPlacesMap,
	fetchPlaceDetail,
	fetchRoutesWaypoints,
	generateCircleDots,
	getDistanceInMeters,
	getIconLibrary,
	getShortLocationName,
	getStartDetails,
	getTurnIcon,
	placeTypeMap,
	stripHtmlTags,
} from "../../config/CommonFunctions";
import Speech from "@mhpdev/react-native-speech";
import Geolocation from "react-native-geolocation-service";
import { useDispatch, useSelector } from "react-redux";
import { pinnedPlaceListRequest } from "./redux/Action";
import { showMessage } from "react-native-flash-message";
import { getDistance } from "geolib";
import polyline from "@mapbox/polyline";
import NavigationCalculation, {
	distMeters,
} from "./Panels/SubComponent/NavigationCalculation";

import PipHandler, { usePipModeListener } from "react-native-pip-android";

import { runOnUI, runOnJS } from "react-native-reanimated";
import { EndRouteModal } from "./Panels/SubComponent/EndRouteModal";
import { RoutePolyline } from "./Panels/SubComponent/RoutePolyline";
import LayoutStyle from "../../styles/LayoutStyle";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { PipAndroid } = NativeModules;

const decodeStepPolyline = (encoded) =>
	polyline
		.decode(encoded)
		.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));

const MainMapScreen = (props) => {
	const mapRef = useRef(null);
	const dispatch = useDispatch();
	const insets = useSafeAreaInsets();

	const tripDetail = props.route.params.coordinates;
	const tripId = props.route.params?.tripId;
	const fetchPlace = props.route.params?.place;

	const recentHistory = useSelector(
		(state) => state.Map.recentSearchLocationList
	);
	const libraryList = useSelector((state) => state.Map.libraryList);
	const pinnedPlaceList = useSelector((state) => state.Map.pinnedPlaceList);
	const mapLayoutType = useSelector((state) => state.Map?.mapLayoutType);
	const shakeAnim = useRef(new Animated.Value(0)).current;

	const [locationReady, setLocationReady] = useState(false);
	const [mapReady, setMapReady] = useState(false);
	const [followMode, setFollowMode] = useState(true);

	const [showSearchPanel, setShowsearchPanel] = useState(true);
	const [showLayoutPanel, setShowLayoutPanel] = useState(false);

	const [initialOrigin, setInitialOrigin] = useState(null);
	const [initialOriginName, setInitialOriginName] = useState("");

	const [initialLocations, setInitialLocations] = useState([]);
	const [location, setLocation] = useState([]);
	const [coordinates, setCoordinates] = useState([]);

	const [currentLocation, setCurrentLocation] = useState(null);
	const [currentLocationName, setCurrentLocationName] = useState(null);
	const [currentHeading, setCurrentHeading] = useState(0);
	const [origin, setOrigin] = useState(null);

	const [destination, setDestination] = useState(null);
	const [selectedDestination, setSelectedDestination] = useState(null);
	const [waypoints, setWaypoints] = useState([]);
	const [reachedWaypoint, setReachedWaypoint] = useState(null);

	const [nearbyType, setNearbyType] = useState(null);
	const [nearbyPlaces, setNearbyPlaces] = useState([]);

	const [routeType, setRouteType] = useState("Drive");
	const [currentStepIndex, setCurrentStepIndex] = useState(0);

	const [isFindRoute, setIsFindRoute] = useState(false);
	const [routeOptions, setRouteOptions] = useState([]);
	const [selectedRouteIndex, setSelectedRouteIndex] = useState(null);
	const [routesETA, setRoutesETA] = useState([]);

	const [walkingOptions, setWalkingOptions] = useState([]);
	const [selectedWalkIndex, setSelectedWalkIndex] = useState(null);

	const [bicycleOptions, setBicycleOptions] = useState([]);
	const [selectedBicycleIndex, setSelectedBicycleIndex] = useState(null);

	const [isNavigating, setIsNavigating] = useState(false);
	const [navigationSteps, setNavigationSteps] = useState([]);

	const [isRecenterVisible, setIsRecenterVisible] = useState(false);
	const [isShowVolumeOption, setIsShowVolumeOption] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [isSpeaking, setIsSpeaking] = useState(true);
	const [voiceVolume, setVoiceVolume] = useState("medium");

	const [markLocation, setMarkLocation] = useState(null);
	const [showConfirmBack, setShowConfirmBack] = useState(false);

	const [pinnedPlacesList, setPinnedPlacesList] = useState([]);

	const [speed, setSpeed] = useState(0);
	const [averageSpeed, setAverageSpeed] = useState(0);
	const [speedReadings, setSpeedReadings] = useState([]);
	const [speedDisplay, setSpeedDisplay] = useState("0.0");

	const [arrivalTimePip, setArrivalTimePip] = useState("");
	const [remainingDistancePip, setRemainingDistancePip] = useState(0);

	const [isStartMovingVehicle, setIsStartMovingVehicle] = useState(false);
	const [activeCounter, setActiveCounter] = useState(null);
	const [timeCounters, setTimeCounters] = useState({
		idle: 0,
		hold: 0,
		breakdown: 0,
		average: 0,
		race: 0,
	});

	const [startNavTime, setStartNavTime] = useState(null);
	const [startDetails, setStartDetails] = useState(null);
	const [showReachedPopup, setShowReachedPopup] = useState(false);

	const [fetchWalkRouteAgain, setFetchWalkRouteAgain] = useState(false);
	const [fetchBicycleRouteAgain, setFetchBicycleRouteAgain] = useState(false);

	const [coordinate] = useState(
		new AnimatedRegion({
			latitude: currentLocation?.latitude,
			longitude: currentLocation?.longitude,
			latitudeDelta: 0.005,
			longitudeDelta: 0.005,
		})
	);

	const ARRIVAL_THRESHOLD_METERS = 25;
	const ARRIVAL_CONFIRM_SAMPLES = 2;
	const UPDATE_THROTTLE_MS = 1000;
	const STEP_END_THRESHOLD = 15;
	const PROGRESS_COMPLETE_FRAC = 0.98;
	const OFF_ROUTE_THRESHOLD = 35;
	const PROGRESS_MIN_DELTA = 4;
	const OFF_ROUTE_STRIKES = 2;
	const MAX_SPEED_READINGS = 60;

	const pipState = usePipModeListener();
	const inPipMode = pipState?.isInPiPMode ?? false;

	const arrivalCloseCountRef = useRef(0);
	const lastProgressRef = useRef({ step: -1, progress: 0 });
	const offRouteCountRef = useRef(0);
	const locationUpdateRef = useRef(0);

	const currentLocationRef = useRef(null);
	const currentStepIndexRef = useRef(currentStepIndex);
	const navigationStepsRef = useRef(navigationSteps);
	const destinationRef = useRef(destination);
	const waypointsRef = useRef(waypoints);
	const locationRef = useRef(location);
	const speedRef = useRef(speed);

	const initialOriginNameRef = useRef(initialOriginName);
	const selectedDestinationRef = useRef(selectedDestination);

	const speedIntervalRef = useRef(null);
	const watchIdRef = useRef(null);
	const followModeRef = useRef(followMode);

	const timeCountersRef = useRef(timeCounters);
	const averageSpeedRef = useRef(averageSpeed);
	const startDetailsRef = useRef(null);
	const startNavTimeRef = useRef(null);

	const isMutedRef = useRef(isMuted);
	const isSpeakingRef = useRef(isSpeaking);
	const voiceVolumeRef = useRef("medium");

	const getLiveLocation = async () => {
		const locPermissionGranted = await locationPermission();

		if (locPermissionGranted) {
			const { latitude, longitude, locationName } = await getCurrentLocation();
			setInitialOrigin({ latitude, longitude });
			getProcessedPinnedPlace({ latitude, longitude });
			if (locationName) {
				const shortName = await getShortLocationName(locationName);
				setInitialOriginName(shortName[0]?.mainText || locationName);
			}
		}
	};

	useEffect(() => {
		getLiveLocation();
	}, []);

	useEffect(() => {
		const handleBackPress = () => {
			if (isNavigating && initialOrigin && currentLocation) {
				setShowConfirmBack(true);
				return true;
			}
			return false;
		};

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			handleBackPress
		);

		return () => backHandler.remove();
	}, [isNavigating, initialOrigin, currentLocation]);

	useEffect(() => {
		const initializeMap = async () => {
			await initializeLocation();
			if (origin && location.length > 0) {
				await fetchLocationRoutes();
			}
		};
		initializeMap();
	}, [initialLocations, location, recentHistory]);

	useEffect(() => {
		if (initialLocations) {
			getPinnedPlaces();
		}
	}, []);

	useEffect(() => {
		getProcessedPinnedPlace();
	}, [pinnedPlaceList]);

	useEffect(() => {
		getTripDetail();
	}, [initialOrigin, initialOriginName]);

	useEffect(() => {
		if (origin && destination) {
			setCoordinates([
				{ latitude: origin.latitude, longitude: origin.longitude },
				{ latitude: destination.latitude, longitude: destination.longitude },
			]);
		}
	}, [origin, destination]);

	useEffect(() => {
		if (isNavigating && navigationSteps[currentStepIndex]) {
			const rawInstruction =
				navigationSteps[currentStepIndex].html_instructions;
			if (rawInstruction) {
				const instruction = rawInstruction.replace(/<[^>]+>/g, "");
				if (!isMutedRef.current) {
					isSpeakingRef.current = true;
					setIsSpeaking(true);
					Speech.speakWithOptions(instruction, {
						language: "en-US",
						pitch: 1.5,
						rate: 0.5,
						volume:
							voiceVolumeRef.current === "low"
								? 0.3
								: voiceVolumeRef.current === "high"
								? 1.0
								: 0.6,
					});
				}
			}
		}
	}, [navigationSteps, currentStepIndex]);

	const handleSpeedCounters = useCallback(
		async (speedMph) => {
			try {
				if (!isNavigating) {
					clearSpeedCounter();
					setActiveCounter(null);
					return;
				}

				let counterType = null;

				if (!isStartMovingVehicle && speedMph < 1) {
					counterType = "idle";
				} else {
					setIsStartMovingVehicle(true);
					if (speedMph < 1) counterType = "hold";
					else if (speedMph >= 1 && speedMph < 25) counterType = "breakdown";
					else if (speedMph >= 25 && speedMph < 70) counterType = "average";
					else if (speedMph > 70) counterType = "race";
				}

				if (counterType !== activeCounter) {
					clearSpeedCounter();
					setActiveCounter(counterType);

					setTimeCounters((prev) => ({
						...prev,
						[counterType]: (prev[counterType] || 0) + 1,
					}));

					speedIntervalRef.current = setInterval(() => {
						setTimeCounters((prev) => ({
							...prev,
							[counterType]: prev[counterType] + 1,
						}));
					}, 1000);
				}
			} catch (error) {
				console.error("Error in handleSpeedCounters:", error);
			}
		},
		[
			isNavigating,
			isStartMovingVehicle,
			activeCounter,
			clearSpeedCounter,
			setIsStartMovingVehicle,
		]
	);
	const processProgressResultJS = useCallback(
		(pos, stepIndex, total, progress, crossTrack, decodedStepPath) => {
			const steps = navigationStepsRef.current;
			const step = steps[stepIndex];

			const end = {
				latitude: step.end_location.lat,
				longitude: step.end_location.lng,
			};
			const distToEnd = NavigationCalculation.distMeters(pos, end);
			const progressFrac = total > 0 ? progress / total : 1;

			let last = lastProgressRef.current;
			if (last.step !== stepIndex) last = { step: stepIndex, progress: 0 };
			const progressed = progress - last.progress;

			let shouldAdvance = false;
			if (
				distToEnd < STEP_END_THRESHOLD ||
				progressFrac >= PROGRESS_COMPLETE_FRAC
			) {
				shouldAdvance = true;
			} else if (progressed >= PROGRESS_MIN_DELTA) {
				if (crossTrack < OFF_ROUTE_THRESHOLD) {
					offRouteCountRef.current = 0;
				} else if (++offRouteCountRef.current >= OFF_ROUTE_STRIKES) {
					offRouteCountRef.current = 0;
					try {
						triggerReroute?.(pos);
					} catch (e) {
						console.warn("triggerReroute failed:", e);
					}
					return;
				}
			} else if (crossTrack > OFF_ROUTE_THRESHOLD) {
				if (++offRouteCountRef.current >= OFF_ROUTE_STRIKES) {
					offRouteCountRef.current = 0;
					try {
						triggerReroute?.(pos);
					} catch (e) {
						console.warn("triggerReroute failed:", e);
					}
					return;
				}
			} else {
				offRouteCountRef.current = 0;
			}

			if (shouldAdvance && stepIndex + 1 < steps.length) {
				currentStepIndexRef.current = stepIndex + 1;
				setCurrentStepIndex(stepIndex + 1);
				lastProgressRef.current = { step: stepIndex + 1, progress: 0 };
			} else {
				lastProgressRef.current = { step: stepIndex, progress };
			}

			if (waypointsRef.current?.length > 0) {
				try {
					onReachedWaypoint?.(pos);
				} catch (e) {
					console.warn("onReachedWaypoint failed:", e);
				}
			}

			const dest = destinationRef.current;
			if (dest) {
				const dDest = NavigationCalculation.distMeters(pos, {
					latitude: dest.latitude,
					longitude: dest.longitude,
				});

				if (dDest <= ARRIVAL_THRESHOLD_METERS) {
					arrivalCloseCountRef.current = arrivalCloseCountRef.current + 1;
					if (arrivalCloseCountRef.current >= ARRIVAL_CONFIRM_SAMPLES) {
						try {
							stopNavigation?.(true);
						} catch (e) {
							console.warn("stopNavigation failed:", e);
						}
					}
				} else {
					arrivalCloseCountRef.current = Math.max(
						arrivalCloseCountRef.current - 1,
						0
					);
				}
			}
		},
		[]
	);
	const runPolylineProgressWorklet = (pos, stepPath, stepIndex) => {
		// runOnUI expects a function that contains a worklet body; we pass minimal data
		runOnUI(() => {
			"worklet";
			try {
				// call the worklet progress calc
				const res = NavigationCalculation.getPolylineProgressMetersWorklet(
					stepPath,
					pos
				);
				// res = { total, progress, crossTrack }
				// forward to JS for exact same branching and state updates
				runOnJS(processProgressResultJS)(
					pos,
					stepIndex,
					res.total,
					res.progress,
					res.crossTrack
				);
			} catch (e) {
				// forward error to JS console
				runOnJS(() => console.warn)("worklet progress calc failed", e);
			}
		})();
	};

	useEffect(() => {
		const clearWatchIfAny = () => {
			if (watchIdRef.current !== null) {
				Geolocation.clearWatch(watchIdRef.current);
				watchIdRef.current = null;
			}
		};

		if (!isNavigating) {
			clearWatchIfAny();
			clearSpeedCounter?.();
			return;
		}

		watchIdRef.current = Geolocation.watchPosition(
			(position) => {
				const now = Date.now();
				if (now - locationUpdateRef.current < UPDATE_THROTTLE_MS) {
					// preserved throttle logic - identical
				} else {
					locationUpdateRef.current = now;
				}

				const {
					latitude,
					longitude,
					speed: rawSpeed,
					heading,
				} = position.coords;
				const pos = { latitude, longitude };

				const headingToUse =
					Number.isFinite(heading) && heading >= 0 ? heading : currentHeading;

				if (mapRef.current && isNavigating && followModeRef.current) {
					if (now - (locationUpdateRef.current || 0) >= 0) {
						try {
							mapRef.current.animateCamera(
								{
									center: pos,
									heading: headingToUse,
									pitch: 40,
									zoom: 18,
								},
								{ duration: 800 }
							);
						} catch (e) {
							console.warn("animateCamera failed:", e);
						}
					}
				}

				setCurrentLocation(pos);
				setCurrentHeading(headingToUse);

				const speedMps = Number.isFinite(rawSpeed) ? rawSpeed : 0;
				const speedMph = speedMps * 2.23694;
				setSpeedDisplay((prev) => {
					const s = (Math.round(speedMph * 10) / 10).toFixed(1);
					return prev === s ? prev : s;
				});

				setSpeedReadings((prev) => {
					const updated =
						prev.length >= MAX_SPEED_READINGS
							? [...prev.slice(1), speedMph]
							: [...prev, speedMph];
					const sum = updated.reduce((acc, v) => acc + v, 0);
					const avg = updated.length ? sum / updated.length : 0;
					setAverageSpeed(Number(avg.toFixed(2)));
					return updated;
				});

				try {
					handleSpeedCounters?.(speedMph, true);
				} catch (e) {
					console.warn("handleSpeedCounters failed:", e);
				}

				const steps = navigationStepsRef.current;
				const stepIndex = currentStepIndexRef.current;

				if (!steps?.length || !steps[stepIndex]?.polyline?.points) {
					return;
				}

				const step = steps[stepIndex];
				const stepPath = decodeStepPolyline(step.polyline.points);

				try {
					runPolylineProgressWorklet(pos, stepPath, stepIndex);
				} catch (e) {
					console.warn("runPolylineProgressWorklet failed:", e);
					try {
						const { total, progress, crossTrack } =
							NavigationCalculation.getPolylineProgressMeters(stepPath, pos);
						processProgressResultJS(
							pos,
							stepIndex,
							total,
							progress,
							crossTrack
						);
					} catch (e2) {
						console.warn("fallback progress calc failed:", e2);
					}
				}
			},
			(err) => {
				console.warn("Location error:", err);
			},
			{
				enableHighAccuracy: true,
				distanceFilter: 1,
				interval: 1000,
				fastestInterval: 1000,
			}
		);

		return () => {
			clearWatchIfAny();
		};
	}, [isNavigating]);

	useEffect(() => {
		if (currentLocation && isFindRoute && coordinate) {
			const newCoordinate = {
				latitude: currentLocation.latitude,
				longitude: currentLocation.longitude,
			};

			coordinate
				.timing({
					...newCoordinate,
					duration: 1000,
					useNativeDriver: false,
				})
				.start();
		}
	}, [currentLocation, isFindRoute, coordinate]);

	function useSyncRef(ref, value) {
		useEffect(() => {
			ref.current = value;
		}, [value]);
	}

	useSyncRef(isMutedRef, isMuted);
	useSyncRef(isSpeakingRef, isSpeaking);
	useSyncRef(voiceVolumeRef, voiceVolume);
	useSyncRef(currentLocationRef, currentLocation);
	useSyncRef(currentStepIndexRef, currentStepIndex);
	useSyncRef(navigationStepsRef, navigationSteps);
	useSyncRef(destinationRef, destination);
	useSyncRef(waypointsRef, waypoints);
	useSyncRef(locationRef, location);
	useSyncRef(speedRef, speed);
	useSyncRef(timeCountersRef, timeCounters);
	useSyncRef(averageSpeedRef, averageSpeed);
	useSyncRef(startDetailsRef, startDetails);
	useSyncRef(startNavTimeRef, startNavTime);
	useSyncRef(followModeRef, followMode);
	useSyncRef(initialOriginNameRef, initialOriginName);
	useSyncRef(selectedDestinationRef, selectedDestination);

	const getProcessedPinnedPlace = async (currentLoc) => {
		if (Array.isArray(pinnedPlaceList)) {
			const enrichedPlaces = await Promise.all(
				pinnedPlaceList.map(async (item) => {
					try {
						const placeDetail = await fetchPlaceDetail(
							item.place_id,
							currentLocation || currentLoc
						);
						return { ...item, pinnedType: item.type, ...placeDetail };
					} catch (err) {
						return {
							...item,
							pinnedType: item.type,
						};
					}
				})
			);
			setPinnedPlacesList(enrichedPlaces);
		}
	};
	const triggerReroute = async (currentPos) => {
		try {
			const newOrigin = {
				...locationRef.current[0],
				latitude: currentPos.latitude,
				longitude: currentPos.longitude,
				type: "origin",
			};

			const newLocation = [newOrigin, ...locationRef.current.slice(1)];
			setLocation(newLocation);

			if (routeType === "Drive")
				await fetchLocationRoutes(false, false, newLocation, true);
			if (routeType === "Walk") setFetchWalkRouteAgain(true);
			if (routeType === "Bicycle") setFetchBicycleRouteAgain(true);
		} catch (err) {
			console.error("Reroute failed:", err);
		}
	};
	const fetchLocationRoutes = async (
		avoidTolls = false,
		avoidHighways = false,
		loc = location,
		fetchAgain = false
	) => {
		try {
			if (loc?.length > 1) {
				const origin = loc.find((l) => l.type === "origin") || loc[0];
				const destination = loc.find((l) => l.type === "destination") || loc[1];
				const waypoints = loc.filter((l) => l.type === "waypoint");

				setDestination({
					latitude: destination.latitude,
					longitude: destination.longitude,
				});

				const routes = await fetchRoutesWaypoints(
					origin,
					destination,
					waypoints,
					avoidTolls,
					avoidHighways
				);

				if (!routes || routes.length === 0) {
					return;
				}

				const polylineRoutesOnly = routes.map((route) => route.polyline);
				setRouteOptions(polylineRoutesOnly);
				setIsFindRoute(true);

				const sorted = routes.map(
					({ distance, duration, durationValue, isFastest, steps }) => ({
						distance,
						duration,
						durationValue,
						isFastest,
						steps,
					})
				);

				setRoutesETA(sorted);
				if (polylineRoutesOnly.length > 0) {
					selectRoute(0);
					setCurrentStepIndex(0);
					// handleRouteReady(polylineRoutesOnly[0]);
					setIsFindRoute(true);
					if (fetchAgain) {
						setNavigationSteps(sorted[0]?.steps);
					}
				}
			}
		} catch (err) {
			console.error("Data fetching error:", err);
		}
	};
	const clearSpeedCounter = () => {
		if (speedIntervalRef.current) {
			clearInterval(speedIntervalRef.current);
			speedIntervalRef.current = null;
		}
		setActiveCounter(null);
	};
	const formatDateTime = () => {
		const now = new Date();
		return (
			`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
				2,
				"0"
			)}-${String(now.getDate()).padStart(2, "0")} ` +
			`${String(now.getHours()).padStart(2, "0")}:${String(
				now.getMinutes()
			).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
		);
	};
	const onReachedWaypoint = async (pos) => {
		const nextWp = waypoints[0];
		const distToWp = distMeters(pos, {
			latitude: nextWp.latitude,
			longitude: nextWp.longitude,
		});

		if (distToWp < STEP_END_THRESHOLD) {
			const filteredLocation = location.filter(
				(wp) =>
					!(
						wp.latitude === waypoints[0]?.latitude &&
						wp.longitude === waypoints[0]?.longitude
					)
			);
			setWaypoints((prev) => {
				const updated = prev.slice(1);
				return updated;
			});
			setReachedWaypoint(waypoints[0]);
			setLocation(filteredLocation);
		}
	};
	const onDestinationReached = async (isReachedDestination) => {
		try {
			const counters = timeCountersRef.current;
			const avgSpeed = averageSpeedRef.current;
			const details = startDetailsRef.current;
			const startTime = startNavTimeRef.current;

			const travelingTime = Object.values(counters).reduce(
				(sum, time) => sum + (Number(time) || 0),
				0
			);

			let manualDestination = "";

			if (!isReachedDestination) {
				const { locationName } = await getCurrentLocation();
				if (locationName) {
					const shortNames = await getShortLocationName(locationName);
					manualDestination =
						shortNames?.[0]?.mainText?.trim() || locationName.trim();
				}
			}

			const payload = {
				origin_location: initialOriginNameRef.current || "",
				destination_location: isReachedDestination
					? selectedDestinationRef.current?.locationName || ""
					: manualDestination,
				average_speed: parseFloat(avgSpeed) > 0 ? avgSpeed.toString() : "0",
				start_time: startTime,
				end_time: formatDateTime(),

				track_time: travelingTime.toString(),
				hold_time: (counters.hold || 0).toString(),
				break_down_time: (counters.breakdown || 0).toString(),
				average_time: (counters.average || 0).toString(),
				race_time: (counters.race || 0).toString(),
				idle_time: (counters.idle || 0).toString(),

				arrival_time: details?.formattedArrivalTime || "",
				distance: details?.distance || "",
				estimated_time: details?.estimatedTime?.toString() || "",
			};

			console.log("payload:", payload);
			const response = await Api.post(`user/save-trip-detail`, payload);
			console.log("response:", response);

			if (response?.success) {
				showMessage({
					message: response.message || "Trip details saved successfully!",
					type: "success",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			} else {
				console.warn("Failed to save trip details:", response);
			}
		} catch (error) {
			console.warn("Error in onDestinationReached:", error);
		}
	};
	const stopNavigation = async (isReached) => {
		setIsNavigating(false);
		setIsFindRoute(false);

		arrivalCloseCountRef.current = 0;
		await handleSpeedCounters(0.0, false);

		if (speedIntervalRef.current) {
			clearInterval(speedIntervalRef.current);
			speedIntervalRef.current = null;
		}

		setCoordinates([]);
		setDestination(null);
		setRouteOptions([]);
		setSelectedRouteIndex(null);
		setCurrentStepIndex(0);

		if (isReached) {
			setShowReachedPopup(true);
			if (!isMutedRef.current && isSpeakingRef.current) {
				await Speech.stop();
				setIsSpeaking(false);
				isSpeakingRef.current = false;
			}
			setNavigationSteps([]);
			await onDestinationReached(true);
		}
	};
	const onPressReachedDone = () => {
		setShowReachedPopup(false);
		gotoBack();
	};
	const getPinnedPlaces = () => {
		dispatch(pinnedPlaceListRequest());
	};
	const getRadiusFromRegion = (region) => {
		const EARTH_RADIUS = 6378137;
		const latDelta = region.latitudeDelta;
		return (latDelta * Math.PI * EARTH_RADIUS) / 180;
	};
	const gotoBack = () => {
		props.navigation.goBack();
	};
	const onPressMap = () => {
		setShowLayoutPanel(true);
	};
	const initializeLocation = async () => {
		const permissionGranted = await locationPermission();
		if (!permissionGranted) return;

		const { latitude, longitude, locationName } = await getCurrentLocation();
		setCurrentLocation({ latitude, longitude });

		if (locationName) {
			const shortName = await getShortLocationName(locationName);
			setCurrentLocationName(shortName[0]?.mainText);
		}

		if (Array.isArray(initialLocations) && initialLocations.length > 1) {
			const filteredDestination = {
				latitude: initialLocations[1]?.latitude,
				longitude: initialLocations[1]?.longitude,
				locationName: initialLocations[1]?.locationName,
				placeId: initialLocations[1]?.placeId,
			};
			setSelectedDestination(filteredDestination);
			setOrigin(initialLocations[0]);
		}

		setLocationReady(true);
	};
	const getTripDetail = async () => {
		try {
			if (tripId && initialOrigin && initialOriginName) {
				const response = await Api.get(
					`user/get-saved-destination-detail/${tripId}`
				);

				if (response.success) {
					const item = response?.data;
					let initialCoords = [];
					if (item) {
						initialCoords.push({
							latitude: parseFloat(initialOrigin?.latitude),
							longitude: parseFloat(initialOrigin?.longitude),
							locationName: initialOriginName,
						});
						if (Array.isArray(item.waypoint)) {
							item.waypoint.forEach((waypoint) => {
								initialCoords.push({
									latitude: parseFloat(waypoint.latitude),
									longitude: parseFloat(waypoint.longitude),
									locationName: waypoint.address
										? waypoint.address
										: waypoint.locationName,
									placeId: item?.place_id,
								});
							});
						}
						initialCoords.push({
							latitude: parseFloat(item?.destination_latitude),
							longitude: parseFloat(item?.destination_longitude),
							locationName: item?.destination_location_name,
							placeId: item?.place_id,
						});
					}
					setInitialLocations(initialCoords);
				}
			} else if (tripDetail) {
				setInitialLocations(tripDetail);
			}
		} catch (error) {
			console.warn("Error: ", error);
		}
	};
	const selectRoute = (index) => {
		setSelectedRouteIndex(index);
	};
	const handleAddStop = (newStop) => {
		const updated = newStop.map(({ address, ...rest }) => ({
			...rest,
			locationName: address,
		}));

		const sorted = [
			...updated.filter((i) => i.type === "origin"),
			...updated.filter((i) => i.type === "waypoint"),
			...updated.filter((i) => i.type === "destination"),
		];
		setLocation(sorted);

		const filteredWaypoints = sorted
			.filter((item) => item.type === "waypoint")
			.map(({ latitude, longitude }) => ({ latitude, longitude }));

		setWaypoints(filteredWaypoints);
	};
	const renderMarkLocation = () => (
		<Marker
			coordinate={{
				latitude: markLocation?.coords?.latitude,
				longitude: markLocation?.coords?.longitude,
			}}
			style={{ flex: 1 }}
		>
			<Animated.View
				style={{
					transform: [{ translateX: shakeAnim }],
					paddingVertical: 20,
				}}
			>
				<View style={MapStyle.markerWhiteBox}>
					<View style={MapStyle.markerBackground}>
						<Icons
							iconSetName={"Ionicons"}
							iconName={"pin-sharp"}
							iconColor={Colors.white}
							iconSize={26}
						/>
					</View>
					<View style={MapStyle.markerBottomPin}>
						<Icons
							iconSetName={"Ionicons"}
							iconName={"caret-down-sharp"}
							iconColor={Colors.white}
							iconSize={10}
						/>
						<View style={MapStyle.pinkDot} />
					</View>
				</View>
			</Animated.View>
		</Marker>
	);
	const renderMarkers = () => {
		return coordinates.map((coordinate, index) =>
			index !== 0 ? (
				<Marker
					key={index}
					coordinate={{
						latitude: coordinate.latitude,
						longitude: coordinate.longitude,
					}}
				>
					<View style={[styles.pinWhiteContainer, { zIndex: 9999 }]}>
						<View style={[styles.pinIconContainer]}>
							<Icons
								iconSetName={"Ionicons"}
								iconName={"pin-sharp"}
								iconColor={Colors.white}
								iconSize={14}
							/>
						</View>
					</View>
				</Marker>
			) : null
		);
	};
	const renderWaypoints = () => {
		return waypoints.map((waypoint, index) =>
			waypoint.latitude && waypoint.longitude ? (
				<Marker
					key={waypoint.id}
					coordinate={{
						latitude: waypoint.latitude,
						longitude: waypoint.longitude,
					}}
					anchor={{ x: 0.5, y: 0.5 }}
					style={styles.destiIndexContainer}
				>
					<View style={{ paddingRight: 12 }}>
						<View style={styles.positionReletiveCenter}>
							<View style={[styles.pinWhiteContainer]}>
								<View
									style={[
										styles.pinIconContainer,
										{ backgroundColor: "#667cf1", padding: 5 },
									]}
								>
									<Icons
										iconSetName={"MaterialDesignIcons"}
										iconName={"checkbox-blank-circle"}
										iconColor={Colors.white}
										iconSize={8}
									/>
								</View>
								<View style={styles.indexContainer}>
									<Text style={styles.indexTxt}>{index + 1}</Text>
								</View>
							</View>
						</View>
					</View>
				</Marker>
			) : null
		);
	};
	const handleRouteReady = (result) => {
		if (!result || result.length === 0) return;
		setTimeout(() => {
			mapRef?.current?.fitToCoordinates(result, {
				edgePadding: { top: 230, right: 100, bottom: 150, left: 100 },
				animated: true,
			});
		}, 500);
	};
	const getDrivingRoute = async (type, avoidTolls, avoidHighways) => {
		setRouteType(type);
		await fetchLocationRoutes(avoidTolls, avoidHighways);
	};
	const getWalkingRoutes = (routes, type) => {
		setRouteType(type);
		const polylineRoutesOnly = routes.map((route) => route.polyline);
		setWalkingOptions(polylineRoutesOnly);
		setIsFindRoute(true);

		if (polylineRoutesOnly.length > 0) {
			setSelectedWalkIndex(0);
			// handleRouteReady(polylineRoutesOnly[0]);
		}
	};
	const getBicycleRoutes = (routes, type) => {
		setRouteType(type);
		const polylineRoutesOnly = routes.map((route) => route.polyline);
		setBicycleOptions(polylineRoutesOnly);
		setIsFindRoute(true);

		if (polylineRoutesOnly.length > 0) {
			setSelectedBicycleIndex(0);
			// handleRouteReady(polylineRoutesOnly[0]);
		}
	};
	const getTrainRoutes = (routes, type) => {
		setRouteType(type);
	};
	const getBookingRoutes = (routes, type) => {
		setRouteType(type);
	};
	const onPressGo = async (steps, routeIndex, type) => {
		if (!steps?.length) return;

		arrivalCloseCountRef.current = 0;

		setNavigationSteps(steps);
		setIsNavigating(true);
		setRouteType(type);
		recenterMap();

		const indexSetters = {
			Drive: setSelectedRouteIndex,
			Walk: setSelectedWalkIndex,
			Bicycle: setSelectedBicycleIndex,
		};

		const stepIndexSetters = {
			Drive: setCurrentStepIndex,
			Walk: setCurrentStepIndex,
			Bicycle: setCurrentStepIndex,
		};

		indexSetters[type]?.(routeIndex);
		stepIndexSetters[type]?.(0);

		if (currentLocation && destination) {
			const details = await getStartDetails(
				currentLocation?.latitude,
				currentLocation?.longitude,
				destination
			);
			if (details) {
				setStartDetails(details);
			}
			const startTime = formatDateTime();
			setStartNavTime(startTime);
			setSpeed(0);
			setAverageSpeed(0);
			setSpeedReadings([]);
		}
	};
	const recenterMap = () => {
		if (currentLocation && mapRef.current) {
			mapRef.current.animateCamera({
				center: {
					latitude: currentLocation.latitude,
					longitude: currentLocation.longitude,
				},
				pitch: 40,
				heading: currentHeading,
				zoom: 18,
			});
			setFollowMode(true);
		}
	};
	const onPressFitToCoords = () => {
		const optionsMap = {
			Drive: routeOptions,
			Walk: walkingOptions,
			Bicycle: bicycleOptions,
		};

		const selectedOptions = optionsMap[routeType];
		if (selectedOptions?.length) {
			handleRouteReady(selectedOptions[0]);
			setFollowMode(false);
		}
	};
	const handleRegionChange = () => {
		if (followMode) {
			setFollowMode(false);
			setIsRecenterVisible(true);
		}
	};
	const handleRegionChangeComplete = (region) => {
		if (!currentLocation) return;

		const distanceMoved = getDistance(
			{ latitude: region.latitude, longitude: region.longitude },
			{
				latitude: currentLocation.latitude,
				longitude: currentLocation.longitude,
			}
		);
		if (distanceMoved > 100) {
			setIsRecenterVisible(true);
		} else {
			setIsRecenterVisible(false);
		}

		if (nearbyType?.placeName) {
			getFeaturedPlaces(nearbyType?.placeName, region);
		}
	};
	const getFeaturedPlaces = async (placeType, region) => {
		if (!placeType || !region) return;

		const mappedType = placeTypeMap[placeType];
		if (!mappedType) return;

		const radius = getRadiusFromRegion(region);

		const places = await fetchNearbyPlacesMap(
			region.latitude,
			region.longitude,
			radius,
			mappedType
		);

		setNearbyPlaces(places);
	};
	const changeDestiByPanel = (item) => {
		const newDestiCoords = {
			latitude: item?.coords?.latitude,
			longitude: item?.coords?.longitude,
		};
		const filteredDestination = {
			latitude: item?.coords?.latitude,
			longitude: item?.coords?.longitude,
			locationName: item?.structured_formatting?.main_text || item?.main_text,
		};

		if (newDestiCoords && filteredDestination) {
			setDestination(newDestiCoords);
			setSelectedDestination(filteredDestination);

			const previousLocations =
				location.length > 0 ? location : initialLocations;

			if (Array.isArray(previousLocations) && previousLocations.length === 2) {
				const updated = [...previousLocations];
				updated[1] = filteredDestination;
				setLocation(updated);
			}
		}
	};
	const onChangeNearbyPlace = (item) => {
		setNearbyType(item);
		if (currentLocation && mapRef.current) {
			mapRef.current.animateToRegion({
				...currentLocation,
				latitudeDelta: 0.05,
				longitudeDelta: 0.05,
			});
		}
	};
	const onCloseNearbyPlace = () => {
		setNearbyType(null);
		setNearbyPlaces([]);
	};
	const resetLocations = async () => {
		setIsFindRoute(false);
		setLocation([]);
		setCoordinates([]);
		setDestination(null);
		setWaypoints([]);

		setRouteType("Drive");
		setCurrentStepIndex(0);

		setRouteOptions([]);
		setSelectedRouteIndex(null);
		setRoutesETA([]);

		setWalkingOptions([]);
		setSelectedWalkIndex(null);

		setBicycleOptions([]);
		setSelectedBicycleIndex(null);

		setIsNavigating(false);
		setNavigationSteps([]);
	};
	const shakeMarker = () => {
		const shake = Animated.loop(
			Animated.sequence([
				Animated.timing(shakeAnim, {
					toValue: 3,
					duration: 250,
					useNativeDriver: true,
				}),
				Animated.timing(shakeAnim, {
					toValue: -3,
					duration: 250,
					useNativeDriver: true,
				}),
				Animated.timing(shakeAnim, {
					toValue: 0,
					duration: 250,
					useNativeDriver: true,
				}),
			]),
			{
				iterations: 3,
			}
		);
		shake.start();
		const timeout = setTimeout(() => {
			shake.stop();
		}, 3000);

		return () => clearTimeout(timeout);
	};
	const handleMarkLocation = (item) => {
		setMarkLocation(item);
		setTimeout(() => {
			shakeMarker();
		}, 1000);
	};
	const handleClearMarker = () => {
		setMarkLocation(null);
	};
	const confirmEndRoute = async () => {
		if (!isNavigating || !initialOrigin || !currentLocation) return;

		const distance = getDistanceInMeters(initialOrigin, currentLocation);
		stopNavigation(false);

		if (!isMutedRef.current && isSpeakingRef.current) {
			await Speech.stop();
			setIsSpeaking(false);
			isSpeakingRef.current = false;
		}

		setNavigationSteps([]);

		if (distance > 100) await onDestinationReached(false);

		props.navigation.goBack();
	};
	const RouteWithDestinationDots = ({
		routeType,
		options,
		selectedIndex,
		setSelectedIndex,
		currentLocation,
		isNavigating,
		destinationCoordinates,
	}) => {
		if (!options || options.length === 0) return null;

		const fullRoute = options[selectedIndex];
		if (!fullRoute || fullRoute.length === 0) return null;

		const lastPoint = fullRoute[fullRoute.length - 1];
		const destination =
			destinationCoordinates[destinationCoordinates.length - 1];

		const dots =
			lastPoint && destination
				? generateCircleDots(lastPoint, destination, 0.00009, 0.00009)
				: [];

		return (
			<>
				<RoutePolyline
					type={routeType}
					options={options}
					selectedIndex={selectedIndex}
					setSelectedIndex={setSelectedIndex}
					currentLocation={currentLocation}
					isNavigating={isNavigating}
					mapReady={mapReady}
				/>

				{dots.length > 0 &&
					dots.map((dot, i) => (
						<Marker
							key={`dot-${routeType}-${i}`}
							coordinate={dot}
							anchor={{ x: 0.5, y: 0.5 }}
							tracksViewChanges={false}
						>
							<View style={[MapStyle.pathBlueDot]} />
						</Marker>
					))}
			</>
		);
	};

	return (
		<View style={{ ...CommonStyles.mainContainer }}>
			<Loader show={!currentLocation} />

			{currentLocation && (
				<View style={[MapStyle.mainContainer]}>
					<MapView
						key={"default-map"}
						ref={mapRef}
						provider={PROVIDER_GOOGLE}
						style={[styles.map, { top: Platform.OS === "android" ? 30 : 0 }]}
						initialRegion={{
							latitude: currentLocation.latitude,
							longitude: currentLocation.longitude,
							latitudeDelta: 0.005,
							longitudeDelta: 0.005,
						}}
						showsUserLocation={mapReady && locationReady && !isFindRoute}
						showsMyLocationButton={!mapReady}
						followsUserLocation={true}
						mapType={mapLayoutType}
						zoomEnabled
						zoomTapEnabled
						zoomControlEnabled={false}
						showsScale
						showsCompass
						userInterfaceStyle="light"
						onMapLoaded={() => setMapReady(true)}
						onRegionChangeComplete={handleRegionChangeComplete}
						onPanDrag={handleRegionChange}
						onMapReady={() => {
							if (currentLocation && mapRef.current) {
								mapRef.current.animateToRegion({
									...currentLocation,
									latitudeDelta: 0.005,
									longitudeDelta: 0.005,
								});
							}
						}}
					>
						{isFindRoute && coordinate && (
							<Marker.Animated
								coordinate={coordinate}
								anchor={{ x: 0.5, y: 0.5 }}
								flat
								rotation={0}
							>
								<View style={MapStyle.navigationIndicator}>
									<Icons
										iconSetName="MaterialIcons"
										iconName="navigation"
										iconColor="#0f53fe"
										iconSize={30}
									/>
								</View>
							</Marker.Animated>
						)}
						{markLocation && !isFindRoute && renderMarkLocation()}
						{renderMarkers()}
						{renderWaypoints()}
						{routeType === "Drive" && (
							<RouteWithDestinationDots
								routeType="Drive"
								options={routeOptions}
								selectedIndex={selectedRouteIndex}
								setSelectedIndex={setSelectedRouteIndex}
								currentLocation={currentLocation}
								isNavigating={isNavigating}
								destinationCoordinates={coordinates}
							/>
						)}
						{routeType === "Walk" && (
							<RouteWithDestinationDots
								routeType="Walk"
								options={walkingOptions}
								selectedIndex={selectedWalkIndex}
								setSelectedIndex={setSelectedWalkIndex}
								destinationCoordinates={coordinates}
							/>
						)}
						{routeType === "Bicycle" && (
							<RouteWithDestinationDots
								routeType="Bicycle"
								options={bicycleOptions}
								selectedIndex={selectedBicycleIndex}
								setSelectedIndex={setSelectedBicycleIndex}
								destinationCoordinates={coordinates}
							/>
						)}
						{routeType === "Train" && <></>}
						{routeType === "Booking" && <></>}
						{nearbyPlaces.map((place, index) => {
							const placeLat = place.geometry.location.lat;
							const placeLng = place.geometry.location.lng;

							const isDuplicate = waypoints.some(
								(wp) =>
									parseFloat(wp.latitude.toFixed(6)) ===
										parseFloat(placeLat.toFixed(6)) &&
									parseFloat(wp.longitude.toFixed(6)) ===
										parseFloat(placeLng.toFixed(6))
							);

							if (isDuplicate) return null;

							const desti = destinationRef.current;

							if (desti?.latitude && desti?.longitude) {
								const isDestination =
									desti?.latitude === placeLat && desti?.longitude === placeLng;

								if (isDestination) return null;
							}
							return (
								<Marker
									key={index}
									coordinate={{
										latitude: placeLat,
										longitude: placeLng,
									}}
									title={place.name}
									description={place.vicinity}
								>
									<View style={[styles.MapLocationIconContainer]}>
										<View
											style={[
												styles.parkingIconContainer,
												{
													backgroundColor:
														nearbyType?.backgroundColor || Colors.blueActiveBtn,
												},
											]}
										>
											<Icons
												iconSetName={nearbyType?.iconLibrary}
												iconName={nearbyType?.iconName}
												iconColor={Colors.white}
												iconSize={10}
											/>
										</View>
									</View>
								</Marker>
							);
						})}
					</MapView>
					{!isNavigating ? (
						<View style={[MapStyle.backMapRow, { marginTop: insets.top }]}>
							<TouchableOpacity
								style={[MapStyle.backDirectionIos]}
								onPress={gotoBack}
							>
								<Icons
									iconSetName={"FontAwesome6"}
									iconName={"angle-left"}
									iconColor={Colors.backArrowBlack}
									iconSize={24}
								/>
							</TouchableOpacity>
							<View style={MapStyle.mapLayoutOption}>
								<TouchableOpacity
									style={{ ...LayoutStyle.padding10 }}
									onPress={() => onPressMap()}
								>
									<Icons
										iconSetName={"Ionicons"}
										iconName={"map"}
										iconColor={"#767b7f"}
										iconSize={20}
									/>
								</TouchableOpacity>
								<View style={{ height: 1, backgroundColor: "#f1f1f1" }} />
								<TouchableOpacity
									onPress={recenterMap}
									style={{ ...LayoutStyle.padding10 }}
								>
									<Icons
										iconSetName={"Ionicons"}
										iconName={"navigate-outline"}
										iconColor={"#767b7f"}
										iconSize={18}
									/>
								</TouchableOpacity>
							</View>
						</View>
					) : (
						<View style={[MapStyle.navOptions]}>
							<TouchableOpacity
								style={MapStyle.navLayoutOption}
								onPress={() => {
									if (isRecenterVisible) {
										recenterMap();
									} else {
										onPressFitToCoords();
									}
								}}
							>
								<Icons
									iconSetName={
										isRecenterVisible ? "MaterialIcons" : "FontAwesome6"
									}
									iconName={isRecenterVisible ? "navigation" : "route"}
									iconColor={Colors.blueActiveBtn}
									iconSize={isRecenterVisible ? 25 : 20}
								/>
							</TouchableOpacity>
							<View style={[MapStyle.soundOptions]}>
								{!isShowVolumeOption ? (
									<TouchableOpacity
										style={[
											MapStyle.soundOptionActive,
											{ backgroundColor: "#F5F5F5" },
										]}
										onPress={() => setIsShowVolumeOption(!isShowVolumeOption)}
									>
										<Icons
											iconSetName={isMuted ? "MaterialDesignIcons" : "Ionicons"}
											iconName={
												isMuted ? "volume-variant-off" : "volume-medium"
											}
											iconColor={Colors.blueActiveBtn}
											iconSize={30}
										/>
									</TouchableOpacity>
								) : (
									<>
										<TouchableOpacity
											style={[
												MapStyle.soundOptionActive,
												!isMuted && { backgroundColor: "#F5F5F5" },
											]}
											onPress={() => {
												setIsMuted(false);
												setIsShowVolumeOption(false);
											}}
										>
											<Icons
												iconSetName={"Ionicons"}
												iconName={"volume-medium"}
												iconColor={Colors.blueActiveBtn}
												iconSize={30}
											/>
										</TouchableOpacity>
										<TouchableOpacity
											style={[
												MapStyle.soundOptionActive,
												isMuted && { backgroundColor: "#F5F5F5" },
											]}
											onPress={async () => {
												if (isSpeakingRef.current) {
													await Speech.stop();
													setIsSpeaking(false);
												}
												setIsMuted(true);
												setIsShowVolumeOption(false);
											}}
										>
											<Icons
												iconSetName={"MaterialDesignIcons"}
												iconName={"volume-variant-off"}
												iconColor={Colors.blueActiveBtn}
												iconSize={30}
											/>
										</TouchableOpacity>
									</>
								)}
							</View>
							{/* <TouchableOpacity
								style={[MapStyle.pipOptionActive]}
								onPress={togglePip}
							>
								<Icons
									iconSetName={"MaterialIcons"}
									iconName={"picture-in-picture-alt"}
									iconColor={Colors.blueActiveBtn}
									iconSize={30}
								/>
							</TouchableOpacity> */}
						</View>
					)}

					<EndRouteModal
						show={showConfirmBack}
						onHide={() => setShowConfirmBack(false)}
						onConfirm={confirmEndRoute}
					/>

					<MainPanel
						show={showSearchPanel}
						hidden={inPipMode}
						closePanel={() => setShowsearchPanel(true)}
						goBack={() => props.navigation.goBack()}
						navigation={props.navigation}
						gotoLegalDataScreen={() => {
							props.navigation.navigate("LegalDescription", {
								legalData: "terms_conditions",
							});
						}}
						currentLocation={currentLocation}
						currentLocationName={currentLocationName}
						stopNavigation={() => stopNavigation()}
						selectedNearbyType={fetchPlace}
						onChangeNearbyPlace={(item) => onChangeNearbyPlace(item)}
						onCloseNearbyPlace={onCloseNearbyPlace}
						recentHistory={recentHistory}
						libraryList={Array.isArray(libraryList) ? libraryList : []}
						pinnedPlacesList={pinnedPlacesList}
						getPinnedPlaces={getPinnedPlaces}
						selectedDestination={selectedDestination}
						changeDestiByPanel={(item) => changeDestiByPanel(item)}
						resetLocations={resetLocations}
						handleMarkLocation={(item) => handleMarkLocation(item)}
						handleClearMarker={handleClearMarker}
						fetchWalkRouteAgain={fetchWalkRouteAgain}
						setFetchWalkRouteAgain={setFetchWalkRouteAgain}
						fetchBicycleRouteAgain={fetchBicycleRouteAgain}
						setFetchBicycleRouteAgain={setFetchBicycleRouteAgain}
						// Reached Panel
						showReachedPanel={showReachedPopup}
						closeReachedPanel={() => setShowReachedPopup(false)}
						destinationName={selectedDestination?.locationName || ""}
						onPressReachedDone={onPressReachedDone}
						averageSpeed={averageSpeed}
						trackTime={Object.values(timeCountersRef.current).reduce(
							(sum, time) => sum + time,
							0
						)}
						timeCounters={timeCounters}
						confirmEndRoute={confirmEndRoute}
						// Map Layout Panel
						showMapLayout={showLayoutPanel}
						closeMapLayout={() => setShowLayoutPanel(false)}
						mapLayoutType={mapLayoutType}
						// Direction Panel
						handleAddStopFromPanel={handleAddStop}
						handleRouteReady={(route) => handleRouteReady(route)}
						isNavigating={isNavigating}
						setIsNavigating={setIsNavigating}
						setNavigationSteps={setNavigationSteps}
						currentStepIndex={currentStepIndex}
						setCurrentStepIndex={setCurrentStepIndex}
						navigationSteps={navigationSteps}
						onPressGo={(steps, routeIndex, type) =>
							onPressGo(steps, routeIndex, type)
						}
						reachedWaypoint={reachedWaypoint}
						setReachedWaypoint={setReachedWaypoint}
						// Driving Route
						routesETA={routesETA}
						selectedRouteIndex={selectedRouteIndex}
						setSelectedRouteIndex={setSelectedRouteIndex}
						routeOptions={routeOptions}
						getDrivingRoute={getDrivingRoute}
						// Walking Route
						getWalkingRoutes={(routes, type) => getWalkingRoutes(routes, type)}
						selectedWalkIndex={selectedWalkIndex}
						setSelectedWalkIndex={setSelectedWalkIndex}
						// Bicycle Route
						getBicycleRoutes={(routes, type) => getBicycleRoutes(routes, type)}
						selectedBicycleIndex={selectedBicycleIndex}
						setSelectedBicycleIndex={setSelectedBicycleIndex}
						// Train Route
						getTrainRoutes={(routes, type) => getTrainRoutes(routes, type)}
						// Booking Route
						getBookingRoutes={(routes, type) => getBookingRoutes(routes, type)}
						// Navigation
						voiceVolume={voiceVolume}
						setVoiceVolume={setVoiceVolume}
						// Pip details
						setArrivalTimePip={setArrivalTimePip}
						setRemainingDistancePip={setRemainingDistancePip}
					/>
				</View>
			)}
		</View>
	);
};

export default MainMapScreen;
