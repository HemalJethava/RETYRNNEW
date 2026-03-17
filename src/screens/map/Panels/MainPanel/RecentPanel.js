import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Pressable,
	Image,
	Modal,
} from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { styles } from "./styles";
import LayoutStyle from "../../../../styles/LayoutStyle";
import CommonStyles from "../../../../styles/CommonStyles";
import { Icons } from "../../../../components";
import Colors from "../../../../styles/Colors";
import { isToday, isThisWeek, parse } from "date-fns";
import { fetchPlaceDetail } from "../../../../config/CommonFunctions";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { removeRecentLocationArrayItems } from "../../redux/Action";
import { useDispatch } from "react-redux";
import { getApps, showLocation } from "react-native-map-link";

export const RecentPanel = ({
	recentPanelRef,
	snapPoints,
	renderBackdrop,
	handleRecentclosePanel,
	recentHistory,
	currentLocation,
	openRouteDetailPanel,
	changeDestiByPanel,
}) => {
	const swipeableRefs = useRef({});
	const dispatch = useDispatch();

	const [showMapAppsPanel, setShowMapAppsPanel] = useState(false);
	const [availableApps, setAvailableApps] = useState([]);
	const [selectedShare, setSelectedShare] = useState(null);

	useEffect(() => {
		if (recentHistory) {
			// Recent History
		}
	}, [recentHistory]);

	const parseDate = (dateStr) =>
		parse(dateStr, "MMM d", new Date(new Date().getFullYear(), 0, 1));

	const RecentFilteredTrips = useMemo(() => {
		if (!recentHistory || recentHistory.length === 0) return {};

		const today = [];
		const week = [];
		const older = [];

		recentHistory.forEach((item) => {
			const itemDate = parseDate(item?.date?.createdAtDate);
			if (isToday(itemDate)) {
				today.push(item);
			} else if (isThisWeek(itemDate, { weekStartsOn: 1 })) {
				week.push(item);
			} else {
				older.push(item);
			}
		});
		return {
			today,
			week,
			older,
		};
	}, [recentHistory]);

	const onPressRecent = async (location) => {
		const detail = await fetchPlaceDetail(location?.place_id, currentLocation);

		if (detail) {
			openRouteDetailPanel(detail);
			changeDestiByPanel(detail);
		}
	};
	const ListItem = ({ location, index }) => (
		<TouchableOpacity
			style={{
				...CommonStyles.directionRowCenter,
				...LayoutStyle.margin10,
			}}
			onPress={() => onPressRecent(location)}
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
	const RecentLocation = ({ location, index, isLast }) => {
		const key = location?.id || index;
		return (
			<Swipeable
				ref={(ref) => {
					if (ref) swipeableRefs.current[key] = ref;
				}}
				renderLeftActions={() => LeftSwipeActions(location, index, isLast)}
				renderRightActions={() => rightSwipeActions(location, index, isLast)}
				friction={1}
				containerStyle={{
					overflow: "hidden",
				}}
			>
				<ListItem location={location} index={index} />
			</Swipeable>
		);
	};
	const LeftSwipeActions = (location, index, isLast) => {
		return <></>;
	};
	const rightSwipeActions = (location, index, isLast) => {
		return (
			<View style={{ ...CommonStyles.directionRowCenter, flex: 0.4 }}>
				<TouchableOpacity
					style={[styles.recentSwipeBtn]}
					onPress={() => {
						onPressShare();
						setSelectedShare(location);
					}}
				>
					<Text style={styles.recentSwipeBtnTxt}>{"Share"}</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.recentSwipeBtn,
						{
							backgroundColor: Colors.red,
							borderTopRightRadius: index == 0 ? 5 : 0,
							borderBottomRightRadius: isLast ? 5 : 0,
						},
					]}
					onPress={() => {
						const ids = location.id;
						dispatch(removeRecentLocationArrayItems(ids));
					}}
				>
					<Text style={styles.recentSwipeBtnTxt}>{"Delete"}</Text>
				</TouchableOpacity>
			</View>
		);
	};
	const onPressClear = (type) => {
		if (type === "today") {
			const todayIds = RecentFilteredTrips?.today.map((item) => item.id);
			dispatch(removeRecentLocationArrayItems(todayIds));
		}
		if (type === "week") {
			const weekIds = RecentFilteredTrips?.week.map((item) => item.id);
			dispatch(removeRecentLocationArrayItems(weekIds));
		}
		if (type === "older") {
			const olderIds = RecentFilteredTrips?.older.map((item) => item.id);
			dispatch(removeRecentLocationArrayItems(olderIds));
		}
	};
	const onPressShare = async () => {
		try {
			const result = await getApps({
				googleForceLatLon: false,
				alwaysIncludeGoogle: true,
				appsWhiteList: ["apple-maps", "google-maps", "waze"],
				appsBlackList: ["uber"],
			});
			setAvailableApps(result);
			setTimeout(() => {
				setShowMapAppsPanel(true);
			}, 300);
		} catch (error) {
			console.error("Error fetching available apps: ", error);
		}
	};
	const onPressApp = async (selectedAppId) => {
		setShowMapAppsPanel(false);
		try {
			if (!selectedShare) return;
			await showLocation({
				latitude: selectedShare?.destinationLocation?.latitude,
				longitude: selectedShare?.destinationLocation?.longitude,
				directionsMode: "driving",
				origin: `${currentLocation?.latitude},${currentLocation?.longitude}`,
				app: selectedAppId,
				alwaysIncludeGoogle: true,
			});
		} catch (err) {
			console.error("Error opening map app:", err);
		}
	};

	return (
		<BottomSheetModal
			ref={recentPanelRef}
			snapPoints={snapPoints}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={true}
			enableDynamicSizing={false}
			backgroundStyle={styles.backgroundStyle}
		>
			<BottomSheetScrollView
				style={{ ...LayoutStyle.paddingHorizontal20 }}
				showsVerticalScrollIndicator={false}
			>
				<View style={[{ ...CommonStyles.directionRowSB }]}>
					<Text style={styles.recentTitle}>{"Recents"}</Text>
					<TouchableOpacity
						style={[styles.closeBtn]}
						onPress={handleRecentclosePanel}
					>
						<Icons
							iconSetName={"MaterialCommunityIcons"}
							iconName={"window-close"}
							iconSize={16}
							iconColor={"#888"}
						/>
					</TouchableOpacity>
				</View>

				<>
					{RecentFilteredTrips?.today &&
						RecentFilteredTrips?.today.length > 0 && (
							<View>
								<View style={styles.titleHeaderRow}>
									<Text style={styles.headerTxt}>{"Today"}</Text>
									<TouchableOpacity onPress={() => onPressClear("today")}>
										<Text style={styles.moreBtnTxt}>{"Clear"}</Text>
									</TouchableOpacity>
								</View>
								<View style={[styles.library, { padding: 0 }]}>
									{RecentFilteredTrips?.today.map((location, index) => {
										const isLast =
											index == RecentFilteredTrips?.today.length - 1;
										return (
											<View key={location?.id}>
												<RecentLocation
													location={location}
													index={index}
													isLast={isLast}
												/>
												{index !== RecentFilteredTrips.today.length - 1 && (
													<View style={[styles.div, { marginVertical: 0 }]} />
												)}
											</View>
										);
									})}
								</View>
							</View>
						)}
					{RecentFilteredTrips.week && RecentFilteredTrips.week.length > 0 && (
						<View>
							<View style={styles.titleHeaderRow}>
								<Text style={styles.headerTxt}>{"This Week"}</Text>
								<TouchableOpacity onPress={() => onPressClear("week")}>
									<Text style={styles.moreBtnTxt}>{"Clear"}</Text>
								</TouchableOpacity>
							</View>
							<View style={[styles.library, { padding: 0 }]}>
								{RecentFilteredTrips?.week.map((location, index) => {
									const isLast = index == RecentFilteredTrips?.week.length - 1;
									return (
										<View key={location?.id}>
											<RecentLocation
												location={location}
												index={index}
												isLast={isLast}
											/>
											{index !== RecentFilteredTrips.week.length - 1 && (
												<View style={[styles.div, { marginVertical: 0 }]} />
											)}
										</View>
									);
								})}
							</View>
						</View>
					)}
					{RecentFilteredTrips?.older &&
						RecentFilteredTrips?.older.length > 0 && (
							<View>
								<View style={styles.titleHeaderRow}>
									<Text style={styles.headerTxt}>{"Older"}</Text>
									<TouchableOpacity onPress={() => onPressClear("older")}>
										<Text style={styles.moreBtnTxt}>{"Clear"}</Text>
									</TouchableOpacity>
								</View>
								<View style={[styles.library, { padding: 0 }]}>
									{RecentFilteredTrips?.older.map((location, index) => {
										const isLast =
											index == RecentFilteredTrips?.older.length - 1;
										return (
											<View key={location?.id}>
												<RecentLocation
													location={location}
													index={index}
													isLast={isLast}
												/>
												{index !== RecentFilteredTrips.older.length - 1 && (
													<View style={[styles.div, { marginVertical: 0 }]} />
												)}
											</View>
										);
									})}
								</View>
							</View>
						)}
				</>
			</BottomSheetScrollView>
			<Modal
				animationType={"slide"}
				transparent={true}
				visible={showMapAppsPanel}
				onRequestClose={() => {
					setShowMapAppsPanel(false);
					setSelectedShare(null);
				}}
			>
				<View style={styles.shareAppModalBack}>
					<View style={styles.shareAppWhiteBack}>
						<View style={[styles.header, { marginHorizontal: 0 }]}>
							<View style={[styles.rowBetween, { width: "100%" }]}>
								<Text style={styles.text}>{"Choose Maps App"}</Text>
								<TouchableOpacity
									onPress={() => {
										setShowMapAppsPanel(false);
										setSelectedShare(null);
									}}
									style={styles.closePanelBtn}
								>
									<Icons
										iconSetName={"MaterialCommunityIcons"}
										iconName={"window-close"}
										iconSize={14}
										iconColor={Colors.iconBlack}
									/>
								</TouchableOpacity>
							</View>
						</View>

						<View style={[styles.div]} />

						<View style={[styles.appsList, { paddingVertical: 20 }]}>
							<View
								style={[CommonStyles.directionRowCenter, { flexWrap: "wrap" }]}
							>
								{availableApps.map((app) => (
									<Pressable
										style={styles.appBox}
										key={app.id}
										onPress={() => onPressApp(app.id)}
									>
										<View style={styles.appImgBox}>
											<Image source={app.icon} style={styles.appImg} />
										</View>
										<Text style={[styles.appName, { marginTop: 0 }]}>
											{app.name}
										</Text>
									</Pressable>
								))}
							</View>
						</View>
					</View>
				</View>
			</Modal>
		</BottomSheetModal>
	);
};
