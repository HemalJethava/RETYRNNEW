import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	Dimensions,
	Platform,
	ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { Icons } from "../../../../components";
import Colors from "../../../../styles/Colors";
import { styles } from "./styles";
import {
	formatDistanceToMiles,
	getIconLibrary,
	getTurnIcon,
	getTurnName,
	stripHtmlTags,
} from "../../../../config/CommonFunctions";

import Animated, {
	Layout,
	runOnJS,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import LayoutStyle from "../../../../styles/LayoutStyle";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const TopDirectionPanel = ({
	isVisible,
	onClose,
	directionSteps,
	navigationSteps,
	currentStepIndex,
}) => {
	const scrollViewRef = useRef(null);
	const sheetHeight = useSharedValue(0);
	const [collapsedHeight, setCollapsedHeight] = useState(0);
	const [isFullScreen, setIsFullScreen] = useState(false);

	const currentStep = navigationSteps?.[currentStepIndex + 1];
	const remainingSteps = navigationSteps?.slice(currentStepIndex + 2) || [];

	const scrollToTop = useCallback((animated = true) => {
		try {
			scrollViewRef.current?.scrollTo({ y: 0, animated });
		} catch (e) {
			console.warn("scrollToTop failed:", e);
		}
	}, []);

	const collapseSheetJS = useCallback(() => {
		sheetHeight.value = withSpring(collapsedHeight, { damping: 15 });
		setIsFullScreen(false);
		scrollToTop(true);
	}, [collapsedHeight, scrollToTop]);

	useEffect(() => {
		if (!isVisible) {
			collapseSheetJS();
		}
	}, [isVisible, collapseSheetJS]);

	const panGesture = Gesture.Pan()
		.onUpdate((e) => {
			const newHeight = e.translationY;
			const clamped = Math.max(0, Math.min(SCREEN_HEIGHT, newHeight));
			sheetHeight.value = clamped;
		})
		.onEnd((e) => {
			if (e.translationY > 100) {
				sheetHeight.value = withSpring(SCREEN_HEIGHT);
				runOnJS(setIsFullScreen)(true);
			} else {
				runOnJS(setIsFullScreen)(false);
				sheetHeight.value = withSpring(collapsedHeight, { damping: 15 });
				runOnJS(scrollToTop)(true);
			}
		});

	const collapseSheet = () => {
		sheetHeight.value = withSpring(collapsedHeight, { damping: 15 });
		setIsFullScreen(false);
		scrollToTop(true);
	};

	const TurnRow = ({ item, isWaypoint }) => (
		<TouchableOpacity style={styles.topTurnRow} onPress={collapseSheet}>
			<View style={styles.turnIcon}>
				<Icons
					iconSetName={
						isWaypoint ? "MaterialDesignIcons" : getIconLibrary(item?.maneuver)
					}
					iconName={isWaypoint ? "record-circle" : getTurnIcon(item?.maneuver)}
					iconSize={40}
					iconColor={isWaypoint ? "#667cf1" : Colors.white}
				/>
			</View>
			<View style={styles.flex}>
				<Text style={styles.topTurnDistacne}>
					{formatDistanceToMiles(item?.distance?.value)}
				</Text>
				<Text style={styles.topTrunDesTxt}>
					{isWaypoint
						? item?.waypointLocationName || "Waypoint"
						: stripHtmlTags(item?.html_instructions)}
				</Text>
			</View>
		</TouchableOpacity>
	);
	const CurrentStep = () => (
		<TouchableOpacity
			style={[styles.topTurnRow, { backgroundColor: "#313035" }]}
		>
			<View style={styles.turnIcon}>
				<Icons
					iconSetName={getIconLibrary(currentStep?.maneuver)}
					iconName={getTurnIcon(currentStep?.maneuver)}
					iconSize={40}
					iconColor={Colors.white}
				/>
			</View>
			<View style={styles.flex}>
				<Text numberOfLines={2} style={styles.topTurnDistacne}>
					{stripHtmlTags(currentStep?.html_instructions || "")}
				</Text>
				<Text style={styles.topTrunDesTxt}>
					{getTurnName(currentStep?.maneuver)}
				</Text>
			</View>
		</TouchableOpacity>
	);

	return (
		<Animated.View
			layout={Layout.springify().damping(20).stiffness(160)}
			style={[
				styles.topPanelContainer,
				isFullScreen ? { height: SCREEN_HEIGHT, maxHeight: SCREEN_HEIGHT } : {},
			]}
		>
			<StatusBar translucent backgroundColor={"#313035"} />
			{isVisible && directionSteps?.steps?.length > 0 && (
				<ScrollView
					ref={scrollViewRef}
					style={{
						flex: 1,
						backgroundColor: "#1c1c1e",
						marginTop: Platform.OS === "ios" ? 40 : 26,
					}}
					contentContainerStyle={{ paddingBottom: 16 }}
					showsVerticalScrollIndicator={false}
				>
					<CurrentStep />

					{isFullScreen && (
						<View style={{ backgroundColor: "#1c1c1e" }}>
							<View style={styles.topPanelDiv} />
							{remainingSteps.map((item, idx) => (
								<View key={`${idx}-${item?.maneuver || "m"}`}>
									<TurnRow item={item} isWaypoint={item.isWaypoint} />
									<View style={styles.topPanelDiv} />
								</View>
							))}

							<TouchableOpacity
								style={styles.topTurnRow}
								onPress={collapseSheet}
							>
								<View style={styles.turnIcon}>
									<View style={styles.pinIconContainer}>
										<Icons
											iconSetName={"Ionicons"}
											iconName={"pin-sharp"}
											iconColor={Colors.white}
											iconSize={20}
										/>
									</View>
								</View>
								<View style={styles.flex}>
									<Text style={styles.topTurnDistacne}>
										{directionSteps?.destinationName?.mainText}
									</Text>
									<Text style={styles.topTrunDesTxt}>
										{directionSteps?.destinationName?.fullText}
									</Text>
								</View>
							</TouchableOpacity>
						</View>
					)}
				</ScrollView>
			)}

			<GestureDetector gesture={panGesture}>
				<View
					style={[
						styles.dragHandle,
						{ paddingVertical: isFullScreen ? 7 : 12 },
					]}
				>
					{!isFullScreen ? (
						<View style={styles.dragBar} />
					) : (
						<Icons
							iconSetName={"Feather"}
							iconName={"chevron-up"}
							iconColor={"#ccc"}
							iconSize={40}
						/>
					)}
				</View>
			</GestureDetector>

			{!isFullScreen && remainingSteps.length > 0 && (
				<TouchableOpacity
					style={styles.nextTurnRow}
					onPress={() => setIsFullScreen(true)}
				>
					<View style={[styles.turnIcon, { height: 40, width: 40 }]}>
						<Icons
							iconSetName={getIconLibrary(remainingSteps[0]?.maneuver)}
							iconName={getTurnIcon(remainingSteps[0]?.maneuver)}
							iconSize={26}
							iconColor={Colors.white}
						/>
					</View>
					<Text style={[styles.topTrunDesTxt, { fontSize: 16 }]}>
						{getTurnName(remainingSteps[0]?.maneuver)}
					</Text>
				</TouchableOpacity>
			)}
		</Animated.View>
	);
};
