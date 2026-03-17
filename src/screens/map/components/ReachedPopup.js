import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Button, Icons, Overlay } from "../../../components";
import MapStyle from "../../../styles/MapStyle";
import Colors from "../../../styles/Colors";
import FontFamily from "../../../assets/fonts/FontFamily";
import CommonStyles from "../../../styles/CommonStyles";
import { formatTime } from "../../../config/CommonFunctions";
import { styles } from "../../../styles/DirectionMapStyle";

export const ReachedPopup = ({
	onDonePress,
	destination,
	averageSpeed,
	trackTime,
	timeCounters,
	speedReadings,
}) => {
	return (
		<View style={[MapStyle.reachedModal, { zIndex: 999 }]}>
			<View style={[MapStyle.reachedLocationIcon]}>
				<Icons
					iconSetName={"MaterialIcons"}
					iconName={"location-on"}
					iconColor={Colors.white}
					iconSize={26}
				/>
			</View>
			<View style={[MapStyle.reachedTxtContainer]}>
				<Text style={[MapStyle.arrivingTxt]}>{"Arriving At"}</Text>
				<Text style={[MapStyle.arrivingLocation]}>{destination}</Text>

				{/* <View
					style={[
						{
							backgroundColor: Colors.white,
							padding: 12,
							borderRadius: 12,
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							elevation: 5,
							width: "100%",
							marginVertical: 10,
						},
					]}
				>
					<View style={{ ...CommonStyles.directionRowSB, width: "100%" }}>
						<View style={{ justifyContent: "center", alignItems: "center" }}>
							<Text style={[MapStyle.arrivingTxt]}>{`Avg speed: `}</Text>
							<Text style={{ fontFamily: FontFamily.PoppinsMedium }}>
								{averageSpeed > 0 ? averageSpeed : 0}
							</Text>
						</View>
						<View style={{ justifyContent: "center", alignItems: "center" }}>
							<Text style={[MapStyle.arrivingTxt]}>{`Track Time: `}</Text>
							<Text style={{ fontFamily: FontFamily.PoppinsMedium }}>
								{trackTime > 0 ? formatTime(trackTime) : 0}
							</Text>
						</View>

						<View style={{ justifyContent: "center", alignItems: "center" }}>
							<Text style={[MapStyle.arrivingTxt]}>{`Hold Time: `}</Text>
							<Text style={{ fontFamily: FontFamily.PoppinsMedium }}>
								{timeCounters.hold > 0 ? formatTime(timeCounters.hold) : 0}
							</Text>
						</View>
					</View>
					<View style={{ ...CommonStyles.directionRowSB, width: "100%" }}>
						<View style={{ justifyContent: "center", alignItems: "center" }}>
							<Text style={[MapStyle.arrivingTxt]}>{`Break D Time: `}</Text>
							<Text style={{ fontFamily: FontFamily.PoppinsMedium }}>
								{timeCounters.breakdown > 0
									? formatTime(timeCounters.breakdown)
									: 0}
							</Text>
						</View>
						<View style={{ justifyContent: "center", alignItems: "center" }}>
							<Text style={[MapStyle.arrivingTxt]}>{`Avg Time: `}</Text>
							<Text style={{ fontFamily: FontFamily.PoppinsMedium }}>
								{timeCounters.average > 0
									? formatTime(timeCounters.average)
									: 0}
							</Text>
						</View>
						<View style={{ justifyContent: "center", alignItems: "center" }}>
							<Text style={[MapStyle.arrivingTxt]}>{`Race Time: `}</Text>
							<Text style={{ fontFamily: FontFamily.PoppinsMedium }}>
								{timeCounters.race > 0 ? formatTime(timeCounters.race) : 0}
							</Text>
						</View>
					</View>
					<View style={{ justifyContent: "center", alignItems: "center" }}>
						<Text style={[MapStyle.arrivingTxt]}>{`Idle Time: `}</Text>
						<Text style={{ fontFamily: FontFamily.PoppinsMedium }}>
							{timeCounters.idle > 0 ? formatTime(timeCounters.idle) : 0}
						</Text>
					</View>
				</View> */}

				<View style={[MapStyle.doneButton]}>
					<Button
						onPress={() => onDonePress()}
						btnName={"Done"}
						btnColor={Colors.secondary}
						btnLabelColor={Colors.white}
					/>
				</View>
			</View>
		</View>
	);
};
