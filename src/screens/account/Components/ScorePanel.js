import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Platform,
	FlatList,
	StyleSheet,
	ScrollView,
} from "react-native";
import IMAGES from "../../../assets/images/Images";
import { Image } from "react-native";
import { Icons } from "../../../components";
import Colors from "../../../styles/Colors";
import { checkupStyles } from "../../../styles/CheckupStyle";
import LayoutStyle from "../../../styles/LayoutStyle";
import FontFamily from "../../../assets/fonts/FontFamily";
import CommonStyles from "../../../styles/CommonStyles";
import AccountStyle from "../../../styles/AccountStyle";
import {
	calculateDrivingScore,
	calculateSpeedImprovement,
	getSuggestions,
} from "../../../config/CommonFunctions";
import CheckupDetailSkeleton from "../../../components/LoaderComponents/CheckupDetailSkeleton";
import {
	BottomSheetModal,
	BottomSheetModalProvider,
	BottomSheetBackdrop,
	BottomSheetFlatList,
	BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

export const ScorePanel = ({
	show,
	onHide,
	drivingScoreData,
	improvementData,
}) => {
	const [isLoading, setIsLoading] = useState(true);
	const [drivingScore, setDrivingScore] = useState(0);
	const [improvement, setImprovement] = useState(null);
	const [improvementSuggestion, setImprovementSuggestion] = useState([]);

	const snapPoints = useMemo(() => ["40%", "80%"], []);

	const panelRef = useRef(null);

	useEffect(() => {
		if (show) {
			handlePresentModalPress();
			getData();
		}
	}, [show]);

	const handlePresentModalPress = useCallback(() => {
		panelRef.current?.present();
	}, []);

	const handleclosePanel = useCallback(() => {
		panelRef.current?.close();
	}, []);

	const handleSheetChanges = useCallback((index) => {
		if (index === -1) onHide();
	}, []);

	const renderBackdrop = useCallback(
		(props) => <BottomSheetBackdrop {...props} pressBehavior="close" />,
		[]
	);

	const getData = async () => {
		const dummyDrivingData = {
			trackTime: 8000,
			idleTime: 300,
			holdSpeedTime: 700,
			breakdownTime: 500,
			raceSpeedTime: 240,
		};

		const score = await calculateDrivingScore(
			drivingScoreData
			// dummyDrivingData
		);
		setDrivingScore(score.toFixed(0));

		const dummyImprovementData = {
			estimatedTime: 8500,
			distance: 100,
			trackTime: 8000,
		};

		const improvementPoints = await calculateSpeedImprovement(
			improvementData
			// dummyImprovementData
		);
		setImprovement(improvementPoints);

		const suggestion = await getSuggestions(
			improvementPoints,
			drivingScoreData
			// dummyDrivingData
		);
		setImprovementSuggestion(suggestion);

		setIsLoading(false);
	};

	const renderImprovement = ({ item, index }) => {
		const isLastItem = index === improvementSuggestion.length - 1;
		return (
			<View key={index} style={{}}>
				<View style={[AccountStyle.detailsContainer, { marginVertical: "2%" }]}>
					<View style={{ width: "80%" }}>
						<Text style={[checkupStyles.titleTxt]}>{item?.title}</Text>
						<Text style={[checkupStyles.desTxt]}>{item?.description}</Text>
					</View>
					<Text
						style={[
							AccountStyle.percentageValue,
							{
								color:
									item?.title !== "Performance"
										? Colors.danger
										: Colors.secondary,
							},
						]}
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
		<BottomSheetModalProvider>
			<BottomSheetModal
				ref={panelRef}
				snapPoints={snapPoints}
				onChange={handleSheetChanges}
				backdropComponent={renderBackdrop}
				enablePanDownToClose={true}
				enableDynamicSizing={false}
				backgroundStyle={styles.backgroundStyle}
			>
				<View style={{ flex: 1 }}>
					<View
						style={{
							marginHorizontal: 20,
							paddingTop: Platform.OS === "ios" ? 20 : 0,
						}}
					>
						<View style={[styles.rowBetween, { width: "100%" }]}>
							<Text style={styles.text}>{"Score Card"}</Text>
							<TouchableOpacity
								onPress={handleclosePanel}
								style={styles.closePanelBtn}
							>
								<Icons
									iconSetName={"MaterialCommunityIcons"}
									iconName={"close"}
									iconColor={Colors.iconBlack}
									iconSize={20}
								/>
							</TouchableOpacity>
						</View>
					</View>
					<View style={[styles.div, { marginHorizontal: 20 }]} />
					{isLoading ? (
						<BottomSheetFlatList
							data={Array(3).fill(0)}
							renderItem={(item, index) => (
								<View key={index}>
									<CheckupDetailSkeleton height={80} />
								</View>
							)}
							scrollEnabled={false}
							keyExtractor={(item, index) => `score-${index}`}
						/>
					) : (
						<BottomSheetScrollView
							style={{ flex: 1 }}
							showsVerticalScrollIndicator={false}
						>
							<Text style={[checkupStyles.groupTitle]}>{"Score Details"}</Text>
							<View style={[checkupStyles.groupContainer]}>
								<View style={[CommonStyles.directionRowSB]}>
									<View style={[styles.row]}>
										<Icons
											iconSetName={"MaterialIcons"}
											iconName={"bar-chart"}
											iconSize={22}
											iconColor={Colors.secondary}
										/>
										<Text style={[styles.titleTxt, { marginLeft: 5, top: 2 }]}>
											{"Driving Score"}
										</Text>
									</View>
									<Text
										style={[AccountStyle.percentageValue]}
									>{`${drivingScore}%`}</Text>
								</View>
							</View>
							<Text style={[checkupStyles.groupTitle]}>
								{"Improvement Details"}
							</Text>
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
										<View style={[{ marginLeft: 7 }]}>
											<Text style={[styles.titleTxt]}>{"Actual Speed"}</Text>
											<Text style={[checkupStyles.desTxt, { lineHeight: 20 }]}>
												{improvement
													? `${improvement?.actualSpeed} mph`
													: "0 mph"}
											</Text>
										</View>
									</View>
									<View style={[checkupStyles.rowStart]}>
										<View style={[{ width: 20 }]}>
											<Icons
												iconSetName={"MaterialIcons"}
												iconName={"speed"}
												iconSize={20}
												iconColor={Colors.secondary}
											/>
										</View>
										<View style={[{ marginLeft: 7 }]}>
											<Text style={[styles.titleTxt]}>{"Est. Speed"}</Text>
											<Text
												style={[
													checkupStyles.desTxt,
													{ lineHeight: 20, textAlign: "right" },
												]}
											>
												{improvement
													? `${improvement?.estimatedSpeed} mph`
													: "0 mph"}
											</Text>
										</View>
									</View>
								</View>
								<View style={[checkupStyles.div]} />
								<View style={[CommonStyles.directionRowSB]}>
									<View style={[checkupStyles.rowStart]}>
										<View style={[{ width: 20 }]}>
											<Icons
												iconSetName={"MaterialCommunityIcons"}
												iconName={"clock-time-eight-outline"}
												iconSize={20}
												iconColor={"green"}
											/>
										</View>
										<View style={[{ marginLeft: 7 }]}>
											<Text style={[styles.titleTxt]}>{"Track Time"}</Text>
											<Text style={[checkupStyles.desTxt, { lineHeight: 20 }]}>
												{improvement ? improvement?.netDrivingTime : "0 mins"}
											</Text>
										</View>
									</View>
									<View style={[checkupStyles.rowStart]}>
										<View style={[{ width: 20 }]}>
											<Icons
												iconSetName={"MaterialIcons"}
												iconName={"ssid-chart"}
												iconSize={20}
												iconColor={Colors.danger}
											/>
										</View>
										<View style={[{ marginLeft: 7 }]}>
											<Text style={[styles.titleTxt]}>{"Improvement"}</Text>
											<Text
												style={[
													AccountStyle.percentageValue,
													{ color: Colors.danger, textAlign: "right" },
												]}
											>
												{improvement
													? `${improvement?.speedImprovement}%`
													: "0%"}
											</Text>
										</View>
									</View>
								</View>
							</View>
							<Text style={[checkupStyles.groupTitle]}>
								{"Improvement Suggestions"}
							</Text>
							<View style={[checkupStyles.groupContainer, { flex: 1 }]}>
								<BottomSheetFlatList
									contentContainerStyle={{
										flexGrow: 1,
									}}
									data={improvementSuggestion}
									renderItem={(item) => renderImprovement(item)}
									keyExtractor={(item, index) => `suggestion-${index}`}
									scrollEnabled={false}
								/>
							</View>
						</BottomSheetScrollView>
					)}
				</View>
			</BottomSheetModal>
		</BottomSheetModalProvider>
	);
};

const styles = StyleSheet.create({
	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	text: {
		fontSize: 14,
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
	closePanelBtn: {
		backgroundColor: "#F5F5F5",
		height: 30,
		width: 30,
		borderRadius: 15,
		justifyContent: "center",
		alignItems: "center",
	},
	div: {
		height: 1,
		borderColor: "#EFEFEF",
		borderWidth: 0.7,
		borderRadius: 5,
		marginVertical: 15,
	},
	titleTxt: {
		fontSize: 14,
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsSemiBold,
		lineHeight: 20,
	},
	desTxt: {
		color: Colors.labelDarkGray,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
	},
	backgroundStyle: {
		backgroundColor: "#fff",
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: -2 },
				shadowOpacity: 0.1,
				shadowRadius: 8,
			},
			android: {
				elevation: 10,
			},
		}),
	},
});
