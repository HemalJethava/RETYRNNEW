import React, { useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Modal,
	StyleSheet,
	Platform,
	TouchableWithoutFeedback,
	StatusBar,
	Dimensions,
	SafeAreaView,
} from "react-native";
import Icons from "./Icons";
import Colors from "../styles/Colors";
import CircularProgress from "react-native-circular-progress-indicator";
import { downloadImage } from "../config/CommonFunctions";
import { BlurView } from "@react-native-community/blur";
import CommonStyles from "../styles/CommonStyles";
import FontFamily from "../assets/fonts/FontFamily";
import Swiper from "react-native-swiper";
import FastImage from "react-native-fast-image";
import { ImageZoom } from "@likashefqet/react-native-image-zoom";
import LayoutStyle from "../styles/LayoutStyle";
import { deviceHeight, deviceWidth } from "../utils/DeviceInfo";

export const ImagesPopup = ({ show, onHide, data }) => {
	const [downloadingIndex, setDownloadingIndex] = useState(null);
	const [downloadProgress, setDownloadProgress] = useState(0);
	const [isDownloading, setIsDownloading] = useState(false);
	const [isZoomed, setIsZoomed] = useState(false);

	const [errorIndexes, setErrorIndexes] = useState([]);

	const swiperRef = useRef(null);

	useEffect(() => {}, [data]);

	const onRequestClose = () => {
		onHide();
	};
	const onPressDownload = async (index) => {
		if ((!data || data.length === 0) && errorIndexes.includes(index)) return;

		const image = data[index];

		setDownloadingIndex(index);

		try {
			await downloadImage(
				image
					? image
					: "https://cdn.pixabay.com/photo/2016/11/21/16/37/loader-1846346_1280.jpg",
				setIsDownloading,
				setDownloadProgress
			);
		} finally {
			setDownloadingIndex(null);
			setDownloadProgress(0);
		}
	};
	const handleImageError = (index) => {
		setErrorIndexes((prev) => [...new Set([...prev, index])]);
	};
	const getCurrentIndex = () => {
		return swiperRef.current?.state?.index;
	};

	if (show)
		return (
			<View style={styles.modal}>
				<StatusBar
					translucent
					barStyle={"light-content"}
					animated={true}
					backgroundColor={Colors.primary}
					networkActivityIndicatorVisible={true}
				/>
				<BlurView
					style={StyleSheet.absoluteFill}
					blurType="light"
					blurAmount={5}
				/>
				<View style={[styles.mainContainer]}>
					<View
						style={[
							styles.header,
							{
								paddingTop: Platform.OS === "ios" ? 50 : 20,
							},
						]}
					>
						<Text style={[styles.headerTitle]}>{"Incident Images"}</Text>
						<View style={[styles.closeBtnRow, {}]}>
							{downloadingIndex === getCurrentIndex() && isDownloading ? (
								<CircularProgress
									value={parseFloat(downloadProgress)}
									maxValue={100}
									radius={15}
									textColor="#000"
									activeStrokeColor={Colors.white}
									inActiveStrokeColor={Colors.white}
									inActiveStrokeOpacity={0.5}
									progressValueStyle={[
										styles.progressValueStyle,
										{ color: Colors.white },
									]}
									activeStrokeWidth={2.5}
									inActiveStrokeWidth={2.5}
									valueSuffix="%"
									valueSuffixStyle={{ left: Platform.OS === "ios" ? -4 : 1 }}
								/>
							) : (
								<TouchableOpacity
									style={{
										opacity: errorIndexes.includes(getCurrentIndex()) ? 0.5 : 1,
									}}
									disabled={errorIndexes.includes(getCurrentIndex())}
									onPress={() => onPressDownload(getCurrentIndex())}
								>
									<Icons
										iconSetName={"Ionicons"}
										iconName={"download-outline"}
										iconSize={26}
										iconColor={Colors.white}
									/>
								</TouchableOpacity>
							)}
							<TouchableOpacity
								style={{ marginLeft: 10 }}
								onPress={() => onRequestClose()}
							>
								<Icons
									iconSetName={"MaterialCommunityIcons"}
									iconName={"close"}
									iconSize={26}
									iconColor={Colors.white}
								/>
							</TouchableOpacity>
						</View>
					</View>
					{data?.length > 0 && (
						<View style={[{ flex: 1 }]}>
							<Swiper
								ref={swiperRef}
								horizontal={true}
								loop={false}
								showsButtons={false}
								scrollEnabled={true}
								index={0}
								containerStyle={styles.swiperContainer}
								dotColor={Colors.secondary60}
								activeDotColor={Colors.secondary}
								activeDotStyle={styles.activeDot}
								dotStyle={styles.dot}
								paginationStyle={styles.pagination}
							>
								{data.map((image, index) => {
									const hasError = errorIndexes.includes(index);
									return (
										<View style={{ flex: 0.86, justifyContent: "center" }}>
											<ImageZoom
												key={index}
												uri={image}
												minScale={1}
												maxScale={5}
												doubleTapScale={3}
												isSingleTapEnabled
												isDoubleTapEnabled
												resizeMode="contain"
												style={styles.image}
												onInteractionStart={() => {
													setIsZoomed(true);
												}}
												onInteractionEnd={() => {
													setIsZoomed(false);
												}}
												onError={() => handleImageError(index)}
											/>
											{hasError && (
												<>
													<View style={styles.failLoadView}>
														<Icons
															iconSetName={"MaterialIcons"}
															iconName={"error-outline"}
															iconSize={40}
															iconColor={Colors.errorBoxRed}
														/>
														<Text style={[styles.failTxt]}>
															{"Failed to load image"}
														</Text>
													</View>
												</>
											)}
										</View>
									);
								})}
							</Swiper>
						</View>
					)}
				</View>
			</View>
		);
};

const styles = StyleSheet.create({
	modal: {
		position: "absolute",
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		marginTop: Platform.OS === "ios" ? 0 : StatusBar.currentHeight,
		zIndex: 999,
	},
	mainContainer: {
		flex: 1,
	},
	header: {
		...CommonStyles.directionRowCenter,
		justifyContent: "space-between",
		backgroundColor: Colors.primary,
		padding: 20,
	},
	headerTitle: {
		fontSize: 14,
		color: Colors.white,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
	closeBtnRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
	},
	imageSlider: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	progressValueStyle: {
		fontSize: 14,
		fontWeight: "bold",
		color: Colors.black,
	},
	image: {
		maxHeight: deviceHeight / 1.34,
		width: deviceWidth / 1.2,
		resizeMode: "contain",
		alignSelf: "center",
	},
	swiperContainer: {
		flex: 1,
		...LayoutStyle.paddingVertical20,
	},
	dot: {
		height: 12,
		width: 12,
		borderRadius: 6,
		marginHorizontal: 3,
	},
	activeDot: {
		height: 12,
		width: 12,
		borderRadius: 6,
		marginHorizontal: 3,
	},
	pagination: {
		backgroundColor: Colors.primary,
		paddingVertical: 20,
		bottom: 0,
	},
	failLoadView: {
		marginTop: "25%",
		backgroundColor: "rgba(0,0,0,0.6)",
		height: 240,
		justifyContent: "center",
		alignItems: "center",
		...LayoutStyle.marginHorizontal20,
		borderRadius: 16,
	},
	failTxt: {
		color: Colors.white,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsMedium,
		marginTop: 5,
	},
	failedTxt: {
		color: Colors.white,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsMedium,
		marginTop: 5,
	},
});
