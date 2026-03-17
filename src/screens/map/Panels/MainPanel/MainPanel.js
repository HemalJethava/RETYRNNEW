import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Keyboard, View } from "react-native";
import {
	BottomSheetModalProvider,
	BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { LibraryPanel } from "./LibraryPanel";
import { RecentPanel } from "./RecentPanel";
import { AddPinPanel } from "./AddPinPanel";
import { SearchPanel } from "./SearchPanel";
import { RouteDetailPanel } from "./RouteDetailPanel";
import { DirectionPanel } from "./DirectionPanel";
import { ReportIssuePanel } from "./ReportIssuePanel";
import { FindNearbyPanel } from "./FindNearbyPanel";
import { NotePanel } from "./NotePanel";
import { AddStopPanel } from "./AddStopPanel";
import { TurnDirectionPanel } from "./TurnDirectionPanel";
import { DurationPanel } from "./DurationPanel";
import { TopDirectionPanel } from "./TopDirectionPanel";
import { MapLayoutPanel } from "./MapLayoutPanel";
import { MarkMyLocation } from "./MarkMyLocation";
import { ReachedPanel } from "./ReachedPanel";

const MainPanel = ({
	show,
	hidden,
	closePanel,
	goBack,
	navigation,
	handleBackPress,
	gotoLegalDataScreen,
	currentLocation,
	currentLocationName,
	stopNavigation,
	onChangeNearbyPlace,
	onCloseNearbyPlace,
	recentHistory,
	libraryList,
	pinnedPlacesList,
	getPinnedPlaces,
	selectedDestination,
	handleAddStopFromPanel,
	handleRouteReady,
	isNavigating,
	setIsNavigating,
	setNavigationSteps,
	currentStepIndex,
	navigationSteps,
	onPressGo,
	changeDestiByPanel,
	resetLocations,
	handleMarkLocation,
	handleClearMarker,
	selectedNearbyType,
	fetchWalkRouteAgain,
	setFetchWalkRouteAgain,
	fetchBicycleRouteAgain,
	setFetchBicycleRouteAgain,
	reachedWaypoint,
	setReachedWaypoint,

	// Reached Panel
	showReachedPanel,
	closeReachedPanel,
	destinationName,
	onPressReachedDone,
	averageSpeed,
	trackTime,
	timeCounters,
	confirmEndRoute,

	// Layout Panel
	showMapLayout,
	closeMapLayout,
	mapLayoutType,

	// Driving Route
	routesETA,
	selectedRouteIndex,
	setSelectedRouteIndex,
	setCurrentStepIndex,
	routeOptions,
	getDrivingRoute,

	// Walking Route
	getWalkingRoutes,
	selectedWalkIndex,
	setSelectedWalkIndex,
	setWalkCurrentStepIndex,

	// Bicycle Route
	getBicycleRoutes,
	selectedBicycleIndex,
	setSelectedBicycleIndex,
	setBicycleCurrentStepIndex,

	// Train Route
	getTrainRoutes,

	// Booking Route
	getBookingRoutes,

	// Navigation
	voiceVolume,
	setVoiceVolume,
	setArrivalTimePip,
	setRemainingDistancePip,
}) => {
	const snapPoints = useMemo(() => ["12%", "45%", "90%"]);

	const panelRef = useRef(null);
	const layoutPanelRef = useRef(null);
	const recentPanelRef = useRef(null);
	const pinPanelRef = useRef(null);
	const libraryPanelRef = useRef(null);
	const routePanelRef = useRef(null);
	const directionPanelRef = useRef(null);
	const reportPanelRef = useRef(null);
	const nearbyPanelRef = useRef(null);
	const notePanelRef = useRef(null);
	const addStopPanelRef = useRef(null);
	const turnPanelRef = useRef(null);
	const durationPanelRef = useRef(null);
	const markPanelRef = useRef(null);
	const reachedPanelRef = useRef(null);

	const [isMarkVisible, setIsMarkVisible] = useState(false);
	const [isFocusSearch, setIsFocusSearch] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState(null);
	const [selectedDirection, setSelectedDirection] = useState(null);
	const [selectedNearBy, setSelectedNearBy] = useState(null);
	const [selectedWaypoint, setSelectedWaypoint] = useState(null);
	const [directionSteps, setDirectionSteps] = useState(null);

	const [isShowTopPanel, setIsShowTopPanel] = useState(false);
	const [waypoints, setWaypoints] = useState([]);

	const [pinPanelTitle, setPinPanelTitle] = useState("Add Pin");
	const [selectedPinned, setSelectedPinned] = useState(null);

	const [notePlaceId, setNotePlaceId] = useState("");
	const [reloadNoteTime, setReloadNoteTime] = useState(null);

	useEffect(() => {
		if (show) {
			handlePresentModalPress();
		} else {
			handleclosePanel();
		}
	}, [show]);

	useEffect(() => {
		if (showMapLayout) {
			openMapLayoutPanel();
		}
	}, [showMapLayout]);

	useEffect(() => {
		if (showReachedPanel) {
			setIsShowTopPanel(false);
			openReachedPanel();
		}
	}, [showReachedPanel]);

	const renderBackdrop = useCallback(
		(props) => <BottomSheetBackdrop {...props} pressBehavior="none" />,
		[]
	);

	// Search Panel
	const handlePresentModalPress = useCallback(() => {
		panelRef.current?.present();
		closePanel();
	}, []);
	const handleclosePanel = useCallback(() => {
		panelRef.current?.close();
	}, []);
	const handleSheetChanges = useCallback(
		(index) => {
			if (index !== 2 && isFocusSearch) {
				Keyboard.dismiss();
				setIsFocusSearch(false);
			}
			if (index === -1) {
				handleclosePanel();
			}
		},
		[isFocusSearch]
	);

	// Map layout panel
	const openMapLayoutPanel = useCallback(() => {
		setTimeout(() => layoutPanelRef.current?.present(), 300);
	}, []);
	const handleLayoutClosePanel = useCallback(() => {
		layoutPanelRef.current?.close();
		closeMapLayout();
	}, []);

	// Mark My Location Panel
	const openMarkPanel = useCallback(() => {
		setIsMarkVisible(true);
		setTimeout(() => markPanelRef.current?.present(), 300);
	}, []);
	const handleMarkClosePanel = useCallback(() => {
		setIsMarkVisible(false);
		markPanelRef.current?.close();
	}, []);

	// Recent Panel
	const openRecentPanel = useCallback(() => {
		setTimeout(() => recentPanelRef.current?.present(), 300);
	}, []);
	const handleRecentclosePanel = useCallback(() => {
		recentPanelRef.current?.close();
	}, []);

	// Pin Panel
	const openPinPanel = useCallback(
		(type, item, setStoreTitle, setStorePinned) => {
			setPinPanelTitle(type);
			if (item) {
				setSelectedPinned(item);
			}

			setTimeout(() => pinPanelRef.current?.present(), 300);
		},
		[]
	);
	const handlePinClosePanel = useCallback(() => {
		setPinPanelTitle("Add Pin");
		setSelectedPinned(null);
		pinPanelRef.current?.close();
	}, []);

	// Library Panel
	const openLibraryPanel = useCallback(() => {
		setTimeout(() => libraryPanelRef.current?.present(), 300);
	}, []);
	const handleLibraryClosePanel = useCallback(() => {
		libraryPanelRef.current?.close();
	}, []);

	// Route detail
	const openRouteDetailPanel = useCallback((item) => {
		setSelectedLocation(item);
		setTimeout(() => {
			routePanelRef.current?.present();
		}, 300);
	}, []);
	const handleRouteDetailclosePanel = useCallback(() => {
		routePanelRef.current?.close();
		resetLocations();
		setTimeout(() => panelRef.current?.snapToIndex(2), 500);
	}, []);

	// Direction Panel
	const openDirectionPanel = useCallback((item) => {
		setSelectedDirection(item);
		setTimeout(() => {
			directionPanelRef.current?.present();
		}, 300);
	}, []);
	const handleDirectionclosePanel = useCallback(() => {
		directionPanelRef.current?.close();
	}, []);

	// Report an Issue Panel
	const openReportPanel = useCallback(() => {
		setTimeout(() => reportPanelRef.current?.present(), 300);
	}, []);
	const handleReportClosePanel = useCallback(() => {
		reportPanelRef.current?.close();
	}, []);

	// Near by Places Panel
	const openNearbyPanel = useCallback((item) => {
		setSelectedNearBy(item);
		setTimeout(() => nearbyPanelRef.current?.present(), 300);
	}, []);
	const handleNearbyClosePanel = useCallback(() => {
		nearbyPanelRef.current?.close();
	}, []);

	// Add a Note Panel
	const openNotePanel = useCallback((item) => {
		setNotePlaceId(item);
		setTimeout(() => notePanelRef.current?.present(), 300);
	}, []);
	const handleNoteClosePanel = useCallback((isReload) => {
		if (isReload) {
			setReloadNoteTime(Date.now());
		}
		setNotePlaceId("");
		notePanelRef.current?.close();
	}, []);

	// Add Stop points Panel
	const openAddStopPanel = useCallback((item = null) => {
		setSelectedWaypoint(null);
		setTimeout(() => {
			setSelectedWaypoint(item);
			addStopPanelRef.current?.present();
		}, 50);
	}, []);
	const handleAddStopClosePanel = useCallback((item) => {
		setSelectedWaypoint(null);
		setTimeout(() => {
			setSelectedWaypoint(item);
			addStopPanelRef.current?.close();
		}, 50);
	}, []);

	// Turn Direction Panel
	const openTurnPanel = useCallback((item) => {
		setDirectionSteps(item);
		setTimeout(() => turnPanelRef.current?.present(), 300);
	}, []);
	const handleTurnClosePanel = useCallback(() => {
		turnPanelRef.current?.close();
	}, []);

	// Duration Panel
	const openDurationPanel = useCallback((item, waypointArray) => {
		setDirectionSteps(item);
		setWaypoints(waypointArray);
		setIsShowTopPanel(true);
		setTimeout(() => durationPanelRef.current?.present(), 300);
	}, []);
	const handleDurationClosePanel = useCallback(() => {
		setIsShowTopPanel(false);
		setDirectionSteps(null);
		durationPanelRef.current?.close();
	});

	// reached Panel
	const openReachedPanel = useCallback(() => {
		setTimeout(() => reachedPanelRef.current?.present(), 300);
	}, []);
	const handleReachedClosePanel = useCallback(() => {
		reachedPanelRef.current?.close();
		closeReachedPanel();
	}, []);

	return (
		<BottomSheetModalProvider>
			<View
				style={[{ flex: 1 }, hidden && { opacity: 0, pointerEvents: "none" }]}
			>
				{/* SearchPanel */}
				<SearchPanel
					panelRef={panelRef}
					snapPoints={snapPoints}
					handleSheetChanges={handleSheetChanges}
					renderBackdrop={renderBackdrop}
					openLibraryPanel={openLibraryPanel}
					openRecentPanel={openRecentPanel}
					recentHistory={recentHistory}
					libraryList={libraryList}
					pinnedPlacesList={pinnedPlacesList}
					getPinnedPlaces={getPinnedPlaces}
					gotoLegalDataScreen={gotoLegalDataScreen}
					openPinPanel={openPinPanel}
					isFocusSearch={isFocusSearch}
					setIsFocusSearch={setIsFocusSearch}
					currentLocation={currentLocation}
					openRouteDetailPanel={openRouteDetailPanel}
					changeDestiByPanel={changeDestiByPanel}
					openNearbyPanel={openNearbyPanel}
					selectedDestination={selectedDestination}
					onChangeNearbyPlace={onChangeNearbyPlace}
					openMarkPanel={openMarkPanel}
					selectedNearbyType={selectedNearbyType}
				/>
				{/* Route Detail Panel */}
				<RouteDetailPanel
					routePanelRef={routePanelRef}
					snapPoints={snapPoints}
					renderBackdrop={renderBackdrop}
					handleRouteDetailclosePanel={handleRouteDetailclosePanel}
					selectedLocation={selectedLocation}
					openDirectionPanel={openDirectionPanel}
					openReportPanel={openReportPanel}
					openNotePanel={openNotePanel}
					currentLocation={currentLocation}
					libraryList={libraryList}
					getPinnedPlaces={getPinnedPlaces}
					pinnedPlacesList={pinnedPlacesList}
					reloadNoteTime={reloadNoteTime}
				/>
				{/* Map Layout Panel */}
				<MapLayoutPanel
					layoutPanelRef={layoutPanelRef}
					snapPoints={snapPoints}
					renderBackdrop={renderBackdrop}
					handleLayoutClosePanel={handleLayoutClosePanel}
					mapLayoutType={mapLayoutType}
				/>
				{isMarkVisible && (
					<MarkMyLocation
						markPanelRef={markPanelRef}
						snapPoints={snapPoints}
						renderBackdrop={renderBackdrop}
						handleMarkClosePanel={handleMarkClosePanel}
						currentLocation={currentLocation}
						currentLocationName={currentLocationName}
						openNotePanel={openNotePanel}
						handleMarkLocation={handleMarkLocation}
						handleClearMarker={handleClearMarker}
						libraryList={libraryList}
						getPinnedPlaces={getPinnedPlaces}
						pinnedPlacesList={pinnedPlacesList}
						reloadNoteTime={reloadNoteTime}
						openRouteDetailPanel={openRouteDetailPanel}
					/>
				)}
				{/* Recent List Modal */}
				<RecentPanel
					recentPanelRef={recentPanelRef}
					snapPoints={["90%"]}
					renderBackdrop={renderBackdrop}
					handleRecentclosePanel={handleRecentclosePanel}
					recentHistory={recentHistory}
					currentLocation={currentLocation}
					openRouteDetailPanel={openRouteDetailPanel}
					changeDestiByPanel={changeDestiByPanel}
				/>
				{/* Add Pin Modal */}
				<AddPinPanel
					pinPanelRef={pinPanelRef}
					renderBackdrop={renderBackdrop}
					snapPoints={["90%"]}
					handlePinClosePanel={handlePinClosePanel}
					recentHistory={recentHistory}
					pinnedPlacesList={pinnedPlacesList}
					getPinnedPlaces={getPinnedPlaces}
					currentLocation={currentLocation}
					currentLocationName={currentLocationName}
					navigation={navigation}
					pinPanelTitle={pinPanelTitle}
					selectedPinned={selectedPinned}
				/>
				{/* Library Modal */}
				<LibraryPanel
					libraryPanelRef={libraryPanelRef}
					snapPoints={["90%"]}
					renderBackdrop={renderBackdrop}
					handleLibraryClosePanel={handleLibraryClosePanel}
					recentHistory={recentHistory}
					currentLocation={currentLocation}
					libraryList={libraryList}
					pinnedPlacesList={pinnedPlacesList}
					getPinnedPlaces={getPinnedPlaces}
					openNotePanel={openNotePanel}
					openRouteDetailPanel={openRouteDetailPanel}
					changeDestiByPanel={changeDestiByPanel}
					openPinPanel={openPinPanel}
				/>
				{/* Direction Panel */}
				<DirectionPanel
					directionPanelRef={directionPanelRef}
					snapPoints={snapPoints}
					renderBackdrop={renderBackdrop}
					handleDirectionClosePanel={handleDirectionclosePanel}
					selectedDirection={selectedDirection}
					openAddStopPanel={openAddStopPanel}
					currentLocation={currentLocation}
					currentLocationName={currentLocationName}
					selectedWaypoint={selectedWaypoint}
					handleAddStopFromPanel={handleAddStopFromPanel}
					handleRouteReady={handleRouteReady}
					openTurnPanel={openTurnPanel}
					isNavigating={isNavigating}
					onPressGo={onPressGo}
					openDurationPanel={openDurationPanel}
					isShowTopPanel={isShowTopPanel}
					setNavigationSteps={setNavigationSteps}
					reachedWaypoint={reachedWaypoint}
					setReachedWaypoint={setReachedWaypoint}
					// Driving Route
					routesETA={routesETA}
					selectedRouteIndex={selectedRouteIndex}
					setSelectedRouteIndex={setSelectedRouteIndex}
					setCurrentStepIndex={setCurrentStepIndex}
					routeOptions={routeOptions}
					getDrivingRoute={getDrivingRoute}
					// Walking Route
					getWalkingRoutes={getWalkingRoutes}
					selectedWalkIndex={selectedWalkIndex}
					setSelectedWalkIndex={setSelectedWalkIndex}
					setWalkCurrentStepIndex={setWalkCurrentStepIndex}
					fetchWalkRouteAgain={fetchWalkRouteAgain}
					setFetchWalkRouteAgain={setFetchWalkRouteAgain}
					// Bicycle Route
					getBicycleRoutes={getBicycleRoutes}
					selectedBicycleIndex={selectedBicycleIndex}
					setSelectedBicycleIndex={setSelectedBicycleIndex}
					setBicycleCurrentStepIndex={setBicycleCurrentStepIndex}
					fetchBicycleRouteAgain={fetchBicycleRouteAgain}
					setFetchBicycleRouteAgain={setFetchBicycleRouteAgain}
					// Train Route
					getTrainRoutes={getTrainRoutes}
					// Booking Route
					getBookingRoutes={getBookingRoutes}
				/>
				{/* Report an Issue Panel */}
				<ReportIssuePanel
					reportPanelRef={reportPanelRef}
					snapPoints={snapPoints}
					renderBackdrop={renderBackdrop}
					handleReportClosePanel={handleReportClosePanel}
				/>
				{/* Find Nearby Panel */}
				<FindNearbyPanel
					nearbyPanelRef={nearbyPanelRef}
					snapPoints={snapPoints}
					renderBackdrop={renderBackdrop}
					handleNearbyClosePanel={handleNearbyClosePanel}
					selectedNearBy={selectedNearBy}
					currentLocation={currentLocation}
					openRouteDetailPanel={openRouteDetailPanel}
					changeDestiByPanel={changeDestiByPanel}
					onCloseNearbyPlace={onCloseNearbyPlace}
				/>
				{/* Add Note Panel */}
				<NotePanel
					notePanelRef={notePanelRef}
					snapPoints={snapPoints}
					renderBackdrop={renderBackdrop}
					handleNoteClosePanel={handleNoteClosePanel}
					notePlaceId={notePlaceId}
				/>
				{/* Add Stop Panel */}
				<AddStopPanel
					addStopPanelRef={addStopPanelRef}
					snapPoints={snapPoints}
					renderBackdrop={renderBackdrop}
					handleAddStopClosePanel={handleAddStopClosePanel}
					currentLocation={currentLocation}
					currentLocationName={currentLocationName}
					selectedWaypoint={selectedWaypoint}
				/>
				{/* Turn Direction Panel */}
				<TurnDirectionPanel
					turnPanelRef={turnPanelRef}
					snapPoints={snapPoints}
					renderBackdrop={renderBackdrop}
					handleTurnClosePanel={handleTurnClosePanel}
					directionSteps={directionSteps}
					currentLocation={currentLocation}
				/>
				{/* Duration Panel */}
				<DurationPanel
					durationPanelRef={durationPanelRef}
					snapPoints={snapPoints}
					renderBackdrop={renderBackdrop}
					handleDurationClosePanel={handleDurationClosePanel}
					directionSteps={directionSteps}
					isNavigating={isNavigating}
					navigationSteps={navigationSteps}
					currentStepIndex={currentStepIndex}
					voiceVolume={voiceVolume}
					setVoiceVolume={setVoiceVolume}
					currentLocation={currentLocation}
					handleAddStopClosePanel={handleAddStopClosePanel}
					handleAddStopFromPanel={handleAddStopFromPanel}
					onChangeNearbyPlace={onChangeNearbyPlace}
					onCloseNearbyPlace={onCloseNearbyPlace}
					waypoints={waypoints}
					setWaypoints={setWaypoints}
					onEndRoute={confirmEndRoute}
					setArrivalTimePip={setArrivalTimePip}
					setRemainingDistancePip={setRemainingDistancePip}
				/>

				{/* Top Direction Panel */}
				{isShowTopPanel && (
					<TopDirectionPanel
						isVisible={isShowTopPanel}
						onClose={() => setIsShowTopPanel(false)}
						directionSteps={directionSteps}
						currentStepIndex={currentStepIndex}
						navigationSteps={navigationSteps}
					/>
				)}

				<ReachedPanel
					reachedPanelRef={reachedPanelRef}
					snapPoints={snapPoints}
					renderBackdrop={renderBackdrop}
					handleReachedClosePanel={handleReachedClosePanel}
					destinationName={destinationName}
					averageSpeed={averageSpeed}
					trackTime={trackTime}
					timeCounters={timeCounters}
					onPressReachedDone={() => {
						onPressReachedDone();
					}}
				/>
			</View>
		</BottomSheetModalProvider>
	);
};

export default MainPanel;
