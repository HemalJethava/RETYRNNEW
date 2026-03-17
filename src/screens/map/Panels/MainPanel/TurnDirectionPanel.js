import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { styles } from "./styles";
import LayoutStyle from "../../../../styles/LayoutStyle";
import CommonStyles from "../../../../styles/CommonStyles";
import { Icons } from "../../../../components";
import {
	formatDistanceToMiles,
	getIconLibrary,
	getTurnIcon,
	shareLocationURL,
	stripHtmlTags,
} from "../../../../config/CommonFunctions";
import Colors from "../../../../styles/Colors";
import FontFamily from "../../../../assets/fonts/FontFamily";

export const TurnDirectionPanel = ({
	turnPanelRef,
	snapPoints,
	renderBackdrop,
	handleTurnClosePanel,
	directionSteps,
	currentLocation,
}) => {
	const customSnapPoints = useMemo(() => ["90%"], []);

	const [isSharing, setIsSharing] = useState(false);

	useEffect(() => {
		if (directionSteps) {
			// direction steps
		}
	}, [directionSteps]);

	const TurnDirection = ({ item, index, isWaypoint }) => {
		return (
			<>
				{!isWaypoint ? (
					<View style={[styles.turnRow]}>
						<View style={styles.turnIcon}>
							<Icons
								iconSetName={getIconLibrary(item?.maneuver)}
								iconName={getTurnIcon(item?.maneuver)}
								iconSize={30}
								iconColor={Colors.black}
							/>
						</View>
						<View style={styles.flex}>
							<Text style={styles.turnDistacne}>
								{formatDistanceToMiles(item?.distance?.value)}
							</Text>
							<Text style={styles.trunDesTxt}>
								{stripHtmlTags(item.html_instructions)}
							</Text>
						</View>
					</View>
				) : (
					<View style={[styles.turnRow]}>
						<View style={styles.turnIcon}>
							<Icons
								iconSetName={"MaterialDesignIcons"}
								iconName={"record-circle"}
								iconColor={"#667cf1"}
								iconSize={30}
							/>
						</View>
						<View style={styles.flex}>
							<Text style={styles.turnDistacne}>
								{formatDistanceToMiles(item?.distance?.value)}
							</Text>
							<Text style={styles.trunDesTxt}>
								{isWaypoint
									? item?.waypointLocationName || "Waypoint"
									: stripHtmlTags(item?.html_instructions)}
							</Text>
						</View>
					</View>
				)}
			</>
		);
	};
	const onPressShare = () => {
		if (isSharing) return;

		setIsSharing(true);
		const coords = directionSteps?.destinationCoords;

		const originLatitude = currentLocation?.latitude;
		const originLongitude = currentLocation?.longitude;
		const destinationLatitude = coords?.latitude;
		const destinationLongitude = coords?.longitude;

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
			ref={turnPanelRef}
			snapPoints={customSnapPoints}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={true}
			enableDynamicSizing={false}
			backgroundStyle={styles.backgroundStyle}
		>
			<BottomSheetScrollView
				style={{ ...LayoutStyle.paddingHorizontal20 }}
				contentContainerStyle={{ ...LayoutStyle.paddingBottom20 }}
				showsVerticalScrollIndicator={false}
			>
				<View style={[{ ...CommonStyles.directionRowSB }]}>
					<Text style={styles.recentTitle}>{"Details"}</Text>
					<TouchableOpacity
						style={[styles.closeBtn]}
						onPress={handleTurnClosePanel}
					>
						<Icons
							iconSetName={"MaterialCommunityIcons"}
							iconName={"window-close"}
							iconSize={16}
							iconColor={"#888"}
						/>
					</TouchableOpacity>
				</View>
				{directionSteps?.steps && directionSteps?.steps.length > 0 && (
					<View style={[styles.library, { ...LayoutStyle.marginTop10 }]}>
						<View style={styles.turnRow}>
							<View style={styles.turnIcon}>
								<Icons
									iconSetName={"Ionicons"}
									iconName={"navigate-circle"}
									iconColor={Colors.blueActiveBtn}
									iconSize={30}
								/>
							</View>
							<View style={styles.flex}>
								<Text style={styles.turnDistacne}>{"From My Location"}</Text>
								<Text style={styles.trunDesTxt}>
									{directionSteps?.myLocationName.fullText}
								</Text>
							</View>
						</View>
						<View style={[styles.div, { marginVertical: 0 }]} />
						{directionSteps?.steps.map((item, index) => {
							return (
								<View key={index}>
									<TurnDirection
										item={item}
										index={index}
										isWaypoint={item.isWaypoint}
									/>
									<View style={[styles.div, { marginVertical: 0 }]} />
								</View>
							);
						})}
						<View style={styles.turnRow}>
							<View style={styles.turnIcon}>
								<View style={[styles.pinIconContainer]}>
									<Icons
										iconSetName={"Ionicons"}
										iconName={"pin-sharp"}
										iconColor={Colors.white}
										iconSize={20}
									/>
								</View>
							</View>
							<View style={styles.flex}>
								<Text style={styles.turnDistacne}>
									{directionSteps?.destinationName?.mainText}
								</Text>
								<Text style={styles.trunDesTxt}>
									{directionSteps?.destinationName?.fullText}
								</Text>
							</View>
						</View>
						<View style={[styles.div, { marginVertical: 0 }]} />
						<View style={styles.rowFlexEnd}>
							<TouchableOpacity
								style={{
									...LayoutStyle.paddingTop10,
									opacity: isSharing ? 0.5 : 1,
								}}
								onPress={onPressShare}
								disabled={isSharing}
							>
								<Text style={styles.addPinTxt}>{"Share"}</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
};
