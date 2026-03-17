import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	FlatList,
	TouchableOpacity,
} from "react-native";
import CommonStyles from "../../styles/CommonStyles";
import AccountStyle from "../../styles/AccountStyle";
import { Icons, LightHeader } from "../../components";
import Colors from "../../styles/Colors";
import { checkupStyles } from "../../styles/CheckupStyle";
import CheckupDetailSkeleton from "../../components/LoaderComponents/CheckupDetailSkeleton";
import Api from "../../utils/Api";
import { convertHistotyTime, formatTime } from "../../config/CommonFunctions";
import { ScorePanel } from "./Components/ScorePanel";

const CheckupDetailsScreen = (props) => {
	const { trip } = props?.route?.params;

	const [isLoading, setIsLoading] = useState(false);
	const [tripDetail, setTripDetail] = useState(null);
	const [showScorePanel, setShowScorePanel] = useState(false);

	useEffect(() => {
		if (trip) {
			const getTripDetail = async () => {
				try {
					setIsLoading(true);
					const detailResponse = await Api.get(
						`user/get-trip-detail/${trip?.id}`
					);
					setIsLoading(false);
					if (detailResponse.success) {
						setTripDetail(detailResponse.data);
					}
				} catch (error) {
					setIsLoading(false);
					console.warn("Error: ", error);
				}
			};
			getTripDetail();
		}
	}, []);

	const goBack = () => {
		props.navigation.goBack();
	};
	const renderImprovement = ({ item, index }) => {
		const isLastItem = index === tripDetail?.improvements_suggestion.length - 1;
		return (
			<View key={index} style={{}}>
				<View style={[AccountStyle.detailsContainer, { marginVertical: "2%" }]}>
					<View style={{ width: "80%" }}>
						<Text style={[checkupStyles.titleTxt]}>{item?.title}</Text>
						<Text style={[checkupStyles.desTxt]}>{item?.description}</Text>
					</View>
					<Text
						style={[AccountStyle.percentageValue, { color: Colors.danger }]}
					>
						{`${item?.percentage}%`}
					</Text>
				</View>
				{!isLastItem && (
					<View style={[AccountStyle.borderBottomGrayLoop]}></View>
				)}
			</View>
		);
	};

	return (
		<View style={[AccountStyle.mainContainer, AccountStyle.backgroundWhite]}>
			<LightHeader
				isLogo={false}
				isBackIcon={true}
				iconName={"angle-left"}
				iconSize={24}
				iconSetName={"FontAwesome6"}
				iconColor={Colors.backArrowBlack}
				headerText={"Safety Checkup Details"}
				headerBG={Colors.lightGrayBG}
				statusBG={Colors.lightGrayBG}
				onPress={() => goBack()}
			/>
			<ScrollView
				style={[AccountStyle.mainContainer, {}]}
				contentContainerStyle={{ paddingVertical: 10 }}
				showsVerticalScrollIndicator={false}
			>
				{isLoading ? (
					<FlatList
						data={Array(5).fill(0)}
						renderItem={(item, index) => (
							<View key={index}>
								<CheckupDetailSkeleton />
							</View>
						)}
						scrollEnabled={false}
						keyExtractor={(item, index) => `first-${index}`}
					/>
				) : (
					<>
						<Text style={[checkupStyles.groupTitle]}>
							{"Destination Detail"}
						</Text>
						<View style={[checkupStyles.groupContainer]}>
							<View style={[checkupStyles.rowStart]}>
								<View style={[checkupStyles.iconBox]}>
									<Icons
										iconSetName={"MaterialCommunityIcons"}
										iconName={"map-marker"}
										iconSize={26}
										iconColor={Colors.red}
									/>
								</View>
								<View style={[checkupStyles.txtContainer]}>
									<Text style={[checkupStyles.titleTxt]}>
										{"Origin Location:"}
									</Text>
									<Text style={[checkupStyles.desTxt]}>
										{tripDetail?.origin_location}
									</Text>
								</View>
							</View>
							<View style={[checkupStyles.div]} />
							<View style={[checkupStyles.rowStart]}>
								<View style={[checkupStyles.iconBox]}>
									<Icons
										iconSetName={"FontAwesome6"}
										iconName={"map-location-dot"}
										iconSize={20}
										iconColor={Colors.secondary}
									/>
								</View>
								<View style={[checkupStyles.txtContainer]}>
									<Text style={[checkupStyles.titleTxt]}>
										{"Destination Location:"}
									</Text>
									<Text style={[checkupStyles.desTxt]}>
										{tripDetail?.destination_location}
									</Text>
								</View>
							</View>
						</View>
						<Text style={[checkupStyles.groupTitle]}>{"Score Detail"}</Text>
						<View style={[checkupStyles.groupContainer]}>
							<View style={[CommonStyles.directionRowSB]}>
								<View style={[checkupStyles.rowStart]}>
									<View style={[{ width: 20 }]}>
										<Icons
											iconSetName={"MaterialCommunityIcons"}
											iconName={"speedometer"}
											iconSize={20}
											iconColor={"orange"}
										/>
									</View>
									<View style={[{ marginLeft: 10 }]}>
										<Text style={[checkupStyles.titleTxt]}>
											{"Average Speed"}
										</Text>
										<Text style={[checkupStyles.desTxt, { lineHeight: 26 }]}>
											{`${
												tripDetail?.average_speed < 1
													? 0
													: Number(tripDetail?.average_speed).toFixed(0)
											} mph`}
										</Text>
									</View>
								</View>
								<TouchableOpacity
									style={[checkupStyles.rowStart]}
									onPress={() => setShowScorePanel(true)}
								>
									<View style={[{ width: 20 }]}>
										<Icons
											iconSetName={"MaterialIcons"}
											iconName={"bar-chart"}
											iconSize={22}
											iconColor={Colors.secondary}
										/>
									</View>
									<View style={[{ marginLeft: 10 }]}>
										<Text style={[checkupStyles.titleTxt]}>{"Score"}</Text>
										<Text style={[AccountStyle.percentageValue]}>{`${Math.round(
											tripDetail?.driving_score
										)}%`}</Text>
									</View>
								</TouchableOpacity>
							</View>
						</View>
						<Text style={[checkupStyles.groupTitle]}>{"Duration Detail"}</Text>
						<View style={[checkupStyles.groupContainer]}>
							<View style={[CommonStyles.directionRowSB]}>
								<View style={[checkupStyles.alignCenter, { width: "33%" }]}>
									<Text style={[checkupStyles.titleTxt]}>{"Est. Time"}</Text>
									<Text style={[checkupStyles.desTxt]}>
										{formatTime(tripDetail?.estimated_time)}
									</Text>
								</View>
								<View style={[checkupStyles.alignCenter, { width: "33%" }]}>
									<Text style={[checkupStyles.titleTxt]}>{"Distance"}</Text>
									<Text
										style={[checkupStyles.desTxt]}
									>{`${tripDetail?.distance} miles`}</Text>
								</View>
								<View style={[checkupStyles.alignCenter, { width: "33%" }]}>
									<Text style={[checkupStyles.titleTxt]}>{"Arrival Time"}</Text>
									<Text style={[checkupStyles.desTxt]}>
										{convertHistotyTime(tripDetail?.arrival_time)}
									</Text>
								</View>
							</View>
							<View style={[checkupStyles.div]} />
							<View style={[CommonStyles.directionRowSB]}>
								<View style={[checkupStyles.alignCenter, {}]}>
									<Text style={[checkupStyles.titleTxt]}>{"Start Time"}</Text>
									<Text style={[checkupStyles.desTxt]}>
										{convertHistotyTime(tripDetail?.start_time)}
									</Text>
								</View>
								<View style={[checkupStyles.alignCenter, {}]}>
									<Text style={[checkupStyles.titleTxt]}>{"End Time"}</Text>
									<Text style={[checkupStyles.desTxt]}>
										{convertHistotyTime(tripDetail?.end_time)}
									</Text>
								</View>
							</View>
						</View>
						<Text style={[checkupStyles.groupTitle]}>{"Track Detail"}</Text>
						<View style={[checkupStyles.groupContainer]}>
							<View style={[CommonStyles.directionRowSB]}>
								<View style={[checkupStyles.alignCenter, { width: "33%" }]}>
									<Text style={[checkupStyles.titleTxt]}>{"Track Time"}</Text>
									<Text style={[checkupStyles.desTxt]}>
										{formatTime(tripDetail?.track_time)}
									</Text>
								</View>
								<View style={[checkupStyles.alignCenter, { width: "33%" }]}>
									<Text style={[checkupStyles.titleTxt]}>{"Hold Time"}</Text>
									<Text style={[checkupStyles.desTxt]}>
										{formatTime(tripDetail?.hold_time)}
									</Text>
								</View>
								<View style={[checkupStyles.alignCenter, { width: "33%" }]}>
									<Text style={[checkupStyles.titleTxt]}>{"Break D Time"}</Text>
									<Text style={[checkupStyles.desTxt]}>
										{formatTime(tripDetail?.break_down_time)}
									</Text>
								</View>
							</View>
							<View style={[checkupStyles.div]} />
							<View style={[CommonStyles.directionRowSB, { marginBottom: 0 }]}>
								<View style={[checkupStyles.alignCenter, { width: "33%" }]}>
									<Text style={[checkupStyles.titleTxt]}>{"Avg. Time"}</Text>
									<Text style={[checkupStyles.desTxt]}>
										{formatTime(tripDetail?.average_time)}
									</Text>
								</View>
								<View style={[checkupStyles.alignCenter, { width: "33%" }]}>
									<Text style={[checkupStyles.titleTxt]}>{"Race Time"}</Text>
									<Text style={[checkupStyles.desTxt]}>
										{formatTime(tripDetail?.race_time)}
									</Text>
								</View>
								<View style={[checkupStyles.alignCenter, { width: "33%" }]}>
									<Text style={[checkupStyles.titleTxt]}>{"Idle Time"}</Text>
									<Text style={[checkupStyles.desTxt]}>
										{formatTime(tripDetail?.idle_time)}
									</Text>
								</View>
							</View>
						</View>
						<Text style={[checkupStyles.groupTitle]}>
							{"Improvement suggestions"}
						</Text>
						<View style={[checkupStyles.groupContainer]}>
							<FlatList
								data={tripDetail?.improvements_suggestion}
								renderItem={(item) => renderImprovement(item)}
								keyExtractor={(item, index) => `second-${index}`}
								scrollEnabled={false}
							/>
						</View>
					</>
				)}
			</ScrollView>

			<ScorePanel
				show={showScorePanel}
				onHide={() => setShowScorePanel(false)}
				drivingScoreData={{
					trackTime: tripDetail?.track_time,
					idleTime: tripDetail?.idle_time,
					holdSpeedTime: tripDetail?.hold_time,
					breakdownTime: tripDetail?.break_down_time,
					raceSpeedTime: tripDetail?.race_time,
				}}
				improvementData={{
					estimatedTime: tripDetail?.estimated_time,
					distance: tripDetail?.distance,
					trackTime: tripDetail?.track_time,
				}}
			/>
		</View>
	);
};

export default CheckupDetailsScreen;
