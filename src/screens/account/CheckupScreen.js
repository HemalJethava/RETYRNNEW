import {
	View,
	Text,
	ScrollView,
	SafeAreaView,
	StatusBar,
	FlatList,
	TouchableOpacity,
	Dimensions,
	Animated,
	Easing,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import FastImage from "react-native-fast-image";
import CircularProgress from "../../lib/react-native-circular-progress-indicator";
import { Icons, Loader } from "../../components";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";
import IMAGES from "../../assets/images/Images";
import { deviceWidth } from "../../utils/DeviceInfo";
import CommonStyles from "../../styles/CommonStyles";
import Api from "../../utils/Api";
import { convertHistotyTime } from "../../config/CommonFunctions";
import ListSkeleton from "../../components/LoaderComponents/ListSkeleton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CheckupScreen = (props) => {
	const scrollRef = useRef(null);
	const animatedWidth = useRef(new Animated.Value(0)).current;

	const [isLoading, setIsLoading] = useState(false);

	const [overallDrivingScore, setOverallDrivingScore] = useState(0);
	const [improvementSuggestions, setImprovementSuggestions] = useState([]);
	const [tripHistory, setTripHistory] = useState([]);
	const [drivingScoreAPi, setDrivingScoreAPi] = useState(0);

	const [calculatedOverAllScore, setCalculateOverAllScore] = useState(0);

	const [showAll, setShowAll] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);

	const radius = deviceWidth / 2.25;
	const strokeWidth = 60;
	const pages = [0, 1];

	useEffect(() => {
		getSafetyDetails();
	}, []);

	useEffect(() => {
		if (activeIndex === 1 && drivingScoreAPi != null) {
			animatedWidth.stopAnimation();
			Animated.timing(animatedWidth, {
				toValue: Math.min(drivingScoreAPi, 100),
				duration: 800,
				easing: Easing.inOut(Easing.ease),
				useNativeDriver: false,
			}).start();
		} else if (activeIndex !== 1) {
			animatedWidth.setValue(0);
		}
	}, [activeIndex, drivingScoreAPi]);

	const widthInterpolate = animatedWidth.interpolate({
		inputRange: [0, 100],
		outputRange: ["0%", "100%"],
	});

	const getSafetyDetails = async () => {
		try {
			setIsLoading(true);
			const detailsRes = await Api.get(`user/get-trip-list`);
			setIsLoading(false);
			if (detailsRes.success) {
				setOverallDrivingScore(detailsRes.data?.over_all_score);
				setImprovementSuggestions(detailsRes.data?.improvements_suggestion);
				setTripHistory(detailsRes?.data?.user_trip);
				setDrivingScoreAPi(detailsRes.data?.over_all_score);
			}
		} catch (error) {
			setIsLoading(false);
			console.warn("Error: ", error);
		}
	};
	const gotoBack = () => {
		props.navigation.goBack();
	};
	const renderHistory = (item, index) => {
		return (
			<TouchableOpacity
				key={index}
				onPress={() =>
					props.navigation.navigate("CheckupDetails", { trip: item })
				}
			>
				<View style={[{ marginTop: "3%" }]}>
					<View style={CommonStyles.directionRowSB}>
						<Text style={[AccountStyle.dateTimeValue]}>
							{convertHistotyTime(item?.start_time)}
						</Text>
						<Text style={[AccountStyle.dateTimeValue]}>
							{convertHistotyTime(item?.end_time)}
						</Text>
					</View>
					<View style={[CommonStyles.directionRowSB, {}]}>
						<Text
							style={[AccountStyle.mileValue]}
						>{`${item?.distance} miles`}</Text>
						<Text
							style={[
								AccountStyle.percentageValue,
								{ lineHeight: 30, textAlignVertical: "bottom" },
							]}
						>
							{Math.round(item?.driving_score) + "%"}
						</Text>
					</View>
				</View>
				<View style={[AccountStyle.borderBottomGrayLoop]}></View>
			</TouchableOpacity>
		);
	};
	const renderScore = (item, index) => {
		return (
			<View key={index} style={{}}>
				<View style={[AccountStyle.detailsContainer]}>
					<View style={{ width: "90%" }}>
						<Text style={[AccountStyle.speedValue]}>{item?.title}</Text>
						<Text style={[AccountStyle.speedDescValue]}>
							{item?.description}
						</Text>
					</View>
					<Text
						style={[AccountStyle.percentageValue, { color: Colors.danger }]}
					>
						{`${item?.percentage}%`}
					</Text>
				</View>
				<View style={[AccountStyle.borderBottomGrayLoop]}></View>
			</View>
		);
	};
	const calculateOverallScore = () => {
		const scoreArray = tripHistory.map((trip) => {
			return {
				score: parseFloat(trip?.driving_score),
				trackTime: parseFloat(trip?.track_time),
			};
		});

		const totalWeightedScore = scoreArray.reduce(
			(sum, trip) => sum + trip.score * trip.trackTime,
			0
		);
		const totalTrackTime = scoreArray.reduce(
			(sum, trip) => sum + trip.trackTime,
			0
		);

		const overallScore = totalWeightedScore / totalTrackTime;

		setCalculateOverAllScore(overallScore.toFixed(2));
	};
	const handleScroll = (e) => {
		const pageIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
		setActiveIndex(pageIndex);
	};
	const visibleTrips = showAll ? tripHistory : tripHistory.slice(0, 5);

	return (
		<>
			<View style={[AccountStyle.mainContainer]}>
				<Loader show={isLoading} />
				<SafeAreaView style={[AccountStyle.safetyStatusBar]}>
					<StatusBar
						translucent
						barStyle={"dark-content"}
						animated={true}
						backgroundColor={Colors.lightGrayBG}
						networkActivityIndicatorVisible={true}
					/>
				</SafeAreaView>
				<View style={[AccountStyle.safetyheaderBar]}>
					<TouchableOpacity onPress={() => gotoBack()}>
						<View style={[AccountStyle.leftIcon]}>
							<Icons
								iconName={"angle-left"}
								iconSetName={"FontAwesome6"}
								iconColor={Colors.backArrowBlack}
								iconSize={24}
							/>
						</View>
					</TouchableOpacity>
					<Text style={[AccountStyle.safetyHeaderText]}>
						{"Safety Checkup"}
					</Text>
					<View>
						<Icons
							iconName={"arrow-up-from-bracket"}
							iconSetName={"FontAwesome6"}
							iconColor={Colors.lightGrayBG}
							iconSize={20}
						/>
					</View>
				</View>
				<ScrollView
					style={[AccountStyle.flex]}
					contentContainerStyle={{ flexGrow: 1 }}
					showsVerticalScrollIndicator={false}
				>
					<View>
						<ScrollView
							ref={scrollRef}
							style={[AccountStyle.flex]}
							horizontal
							pagingEnabled
							showsHorizontalScrollIndicator={false}
							onMomentumScrollEnd={handleScroll}
						>
							<View style={[AccountStyle.checkupDPage]}>
								{isLoading ? (
									<ListSkeleton height={320} width={deviceWidth / 1.2} />
								) : (
									<CircularProgress
										activeStrokeColor={"#4CA7DA"}
										activeStrokeSecondaryColor={"#4CA7DA"}
										inActiveStrokeColor={"#B6D6E8"}
										strokeLinecap={"round"}
										circleBackgroundColor={"#FFFFFF"}
										activeStrokeWidth={strokeWidth}
										inActiveStrokeWidth={strokeWidth}
										value={overallDrivingScore}
										radius={radius}
										duration={800}
										inActiveStrokeOpacity={1}
										maxValue={100}
										title={"Learn More"}
									/>
								)}
							</View>

							<View style={[AccountStyle.checkupDPage]}>
								<FastImage
									source={IMAGES.blueLogo}
									style={[AccountStyle.smallLogo]}
									resizeMode={FastImage.resizeMode.contain}
								/>
								<Text style={[AccountStyle.suggestedLabel]}>
									{"Suggested Improvements"}
								</Text>
								<View style={[AccountStyle.drivingBackground]}>
									<Animated.View
										style={[
											AccountStyle.fillDrivingBack,
											{ width: widthInterpolate },
										]}
									/>

									<View style={[AccountStyle.drivingScoreRow]}>
										<View style={{ ...CommonStyles.directionRowCenter }}>
											<Icons
												iconSetName={"MaterialCommunityIcons"}
												iconName={"truck-outline"}
												iconColor={
													drivingScoreAPi >= 65
														? Colors.white
														: Colors.labelBlack
												}
												iconSize={24}
											/>
											<Text
												style={[
													AccountStyle.overallTxt,
													{
														color:
															drivingScoreAPi >= 65
																? Colors.white
																: Colors.black,
													},
												]}
											>
												{"Overall Driving Score"}
											</Text>
										</View>

										<Text
											style={[
												AccountStyle.drivingScorePR,
												{
													color:
														drivingScoreAPi >= 93
															? Colors.white
															: Colors.labelBlack,
												},
											]}
										>
											{Math.round(drivingScoreAPi) + "%"}
										</Text>
									</View>
								</View>
								<View>
									<FlatList
										data={improvementSuggestions}
										renderItem={({ item: historyItem, index }) =>
											renderScore(historyItem, index)
										}
										scrollEnabled={false}
										keyExtractor={(item, index) => index}
									/>
								</View>
							</View>
						</ScrollView>
						<View style={AccountStyle.checkupDotRow}>
							{pages.map((_, i) => (
								<View
									key={i}
									style={[
										AccountStyle.checkupDot,
										{
											backgroundColor:
												activeIndex === i
													? Colors.secondary
													: Colors.lightGrayBG,
											borderColor:
												activeIndex === i
													? Colors.secondary
													: Colors.labelDarkGray,
										},
									]}
								/>
							))}
						</View>
					</View>
					<View style={[AccountStyle.historyListContainer]}>
						<Text
							style={[AccountStyle.titleHistory, { color: Colors.labelBlack }]}
						>
							{"Destination"}
							<Text style={{ color: Colors.labelDarkGray }}>
								{" History/Score"}
							</Text>
						</Text>
						<View style={[AccountStyle.borderBottomGrayLoop]}></View>
						<FlatList
							data={visibleTrips}
							renderItem={({ item, index }) => renderHistory(item, index)}
							keyExtractor={(item, index) =>
								item?.id?.toString() || index.toString()
							}
							scrollEnabled={false}
						/>
						{tripHistory.length > 5 && (
							<TouchableOpacity
								onPress={() => setShowAll((prev) => !prev)}
								style={AccountStyle.showAllRow}
							>
								<Text style={AccountStyle.showAllTxt}>
									{showAll ? "Show Less" : "Show More"}
								</Text>
								<Icons
									iconSetName={"Ionicons"}
									iconName={showAll ? "chevron-up" : "chevron-down"}
									iconColor={Colors.secondary}
									iconSize={16}
								/>
							</TouchableOpacity>
						)}
					</View>
				</ScrollView>
			</View>
		</>
	);
};

export default CheckupScreen;

{
	/* <View style={AccountStyle.deleteContainer}>
	<Button
		onPress={() => calculateOverallScore()}
		btnName={
			calculatedOverAllScore
				? `Overall Score ${Math.round(calculatedOverAllScore)}%`
				: `Calculate Overall Score`
		}
		isBtnActive={true}
		btnColor={Colors.primary}
		btnLabelColor={Colors.white}
	/>
</View>; */
}
