import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { styles } from "./styles";
import LayoutStyle from "../../../../styles/LayoutStyle";
import MapStyle from "../../../../styles/MapStyle";
import { Button, Icons } from "../../../../components";
import Colors from "../../../../styles/Colors";
import FontFamily from "../../../../assets/fonts/FontFamily";
import CommonStyles from "../../../../styles/CommonStyles";
import { formatTime } from "../../../../config/CommonFunctions";

export const ReachedPanel = ({
	reachedPanelRef,
	snapPoints,
	renderBackdrop,
	handleReachedClosePanel,
	onPressReachedDone,
	destinationName,
	averageSpeed = 0,
	trackTime = 0,
	timeCounters = 0,
}) => {
	const Counter = ({ title, value }) => (
		<View style={styles.justifyCenter}>
			<Text style={[MapStyle.arrivingTxt]}>{title}</Text>
			<Text style={{ fontFamily: FontFamily.PoppinsMedium }}>{value}</Text>
		</View>
	);
	return (
		<BottomSheetModal
			ref={reachedPanelRef}
			snapPoints={["30%"]}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={true}
			enableDynamicSizing={false}
			backgroundStyle={styles.backgroundStyle}
		>
			<BottomSheetScrollView
				style={{ ...LayoutStyle.paddingHorizontal20 }}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.reachedIconRow}>
					<View style={[styles.pinIconContainer, { padding: 5 }]}>
						<Icons
							iconSetName={"Ionicons"}
							iconName={"pin-sharp"}
							iconColor={Colors.white}
							iconSize={34}
						/>
					</View>
				</View>

				<View style={[MapStyle.reachedTxtContainer]}>
					<Text style={[MapStyle.arrivingTxt]}>{"Arriving At"}</Text>
					<Text style={[MapStyle.arrivingLocation]}>
						{destinationName || ""}
					</Text>

					{/* <View style={styles.analyticBoard}>
						<View style={{ ...CommonStyles.directionRowSB, width: "100%" }}>
							<Counter
								title={"Avg speed"}
								value={averageSpeed > 0 ? averageSpeed : 0}
							/>
							<Counter
								title={"Track Time"}
								value={trackTime > 0 ? formatTime(trackTime) : 0}
							/>
							<Counter
								title={"Hold Time"}
								value={
									timeCounters.hold > 0 ? formatTime(timeCounters.hold) : 0
								}
							/>
						</View>
						<View style={{ ...CommonStyles.directionRowSB, width: "100%" }}>
							<Counter
								title={"Break D Time"}
								value={
									timeCounters.breakdown > 0
										? formatTime(timeCounters.breakdown)
										: 0
								}
							/>
							<Counter
								title={"Avg Time"}
								value={
									timeCounters.average > 0
										? formatTime(timeCounters.average)
										: 0
								}
							/>
							<Counter
								title={"Race Time"}
								value={
									timeCounters.race > 0 ? formatTime(timeCounters.race) : 0
								}
							/>
						</View>
						<Counter
							title={"Idle Time"}
							value={timeCounters.idle > 0 ? formatTime(timeCounters.idle) : 0}
						/>
					</View> */}

					<View style={[MapStyle.doneButton]}>
						<TouchableOpacity
							style={[
								styles.endRouteBtn,
								{
									backgroundColor: Colors.blueActiveBtn,
									marginTop: 0,
									paddingVertical: 8,
								},
							]}
							onPress={onPressReachedDone}
						>
							<Text style={[styles.endRouteTxt, { fontSize: 16 }]}>
								{"Done"}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
};
