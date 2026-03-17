import React, { useEffect, useRef, useState } from "react";
import {
	View,
	TouchableOpacity,
	StyleSheet,
	TouchableWithoutFeedback,
	StatusBar,
	Text,
	Platform,
} from "react-native";
import { Icons } from "../../../components";
import Colors from "../../../styles/Colors";
import { BlurView } from "@react-native-community/blur";
import CommonStyles from "../../../styles/CommonStyles";
import FontFamily from "../../../assets/fonts/FontFamily";
import CircularProgress from "react-native-circular-progress-indicator";
import LayoutStyle from "../../../styles/LayoutStyle";
import {
	downloadImage,
	moveLocalFileToDownloads,
} from "../../../config/CommonFunctions";
import Swiper from "react-native-swiper";
import { ImageZoom } from "@likashefqet/react-native-image-zoom";
import { deviceHeight, deviceWidth } from "../../../utils/DeviceInfo";

export const ImagesPopup = ({ show, onHide, title, data }) => {
	const swiperRef = useRef(null);

	const [images, setImages] = useState([]);
	const [downloadingIndex, setDownloadingIndex] = useState(null);
	const [downloadProgress, setDownloadProgress] = useState(0);
	const [isDownloading, setIsDownloading] = useState(false);

	const [isZoomed, setIsZoomed] = useState(false);
	const [errorIndexes, setErrorIndexes] = useState([]);

	useEffect(() => {
		if (show && data) {
			const imagesArray = data?.chat_files.map((i) => i?.uri || i?.file_url);
			setImages(imagesArray);
			setErrorIndexes([]);
		}
	}, [data]);

	const onRequestClose = () => {
		onHide();
	};
	const onPressDownload = async (index) => {
		if (
			(!data?.chat_files || data.chat_files.length === 0) &&
			errorIndexes.includes(index)
		)
			return;

		const image = data.chat_files[index];

		setDownloadingIndex(index);

		try {
			const sourcePath = image?.uri || image?.file_url;

			if (sourcePath.startsWith("file://")) {
				await moveLocalFileToDownloads(sourcePath, setIsDownloading);
			} else {
				await downloadImage(sourcePath, setIsDownloading, setDownloadProgress);
			}
		} finally {
			setTimeout(() => {
				setDownloadingIndex(null);
				setDownloadProgress(0);
			}, 500);
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
				<View
					style={[
						styles.mainContainer,
						{ paddingTop: Platform.OS === "ios" ? 50 : 0 },
					]}
				>
					<View style={[styles.header]}>
						<Text style={[styles.headerTitle]}>{title}</Text>
						<View style={[styles.closeBtnRow, {}]}>
							<View style={LayoutStyle.marginRight10}>
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
										valueSuffixStyle={{ left: 2 }}
									/>
								) : (
									<TouchableOpacity
										disabled={errorIndexes.includes(getCurrentIndex())}
										onPress={() => onPressDownload(getCurrentIndex())}
										style={{
											opacity: errorIndexes.includes(getCurrentIndex())
												? 0.5
												: 1,
										}}
									>
										<Icons
											iconSetName={"Ionicons"}
											iconName={"download-outline"}
											iconSize={26}
											iconColor={Colors.white}
										/>
									</TouchableOpacity>
								)}
							</View>

							<TouchableOpacity onPress={() => onRequestClose()}>
								<Icons
									iconSetName={"MaterialCommunityIcons"}
									iconName={"close"}
									iconSize={26}
									iconColor={Colors.white}
								/>
							</TouchableOpacity>
						</View>
					</View>
					{data?.chat_files?.length > 0 && (
						<View style={styles.mainContainer}>
							<Swiper
								ref={swiperRef}
								horizontal={true}
								loop={false}
								showsButtons={false}
								scrollEnabled={true}
								index={0}
								containerStyle={[styles.swiperContainer]}
								dotColor={Colors.secondary60}
								activeDotColor={Colors.secondary}
								activeDotStyle={styles.activeDot}
								dotStyle={styles.dot}
								paginationStyle={[styles.pagination]}
							>
								{images.map((image, index) => {
									const hasError = errorIndexes.includes(index);
									return (
										// <TouchableWithoutFeedback key={index} onPress={onHide}>
										<View style={styles.imageContainer}>
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
													<View
														style={[
															StyleSheet.absoluteFill,
															styles.failLoadView,
														]}
													>
														<Icons
															iconSetName={"MaterialIcons"}
															iconName={"error-outline"}
															iconSize={40}
															iconColor={Colors.errorBoxRed}
														/>
														<Text style={styles.failTxt}>
															{"Failed to load image"}
														</Text>
													</View>
												</>
											)}
										</View>
										// </TouchableWithoutFeedback>
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
	progressValueStyle: {
		fontSize: 12,
		fontWeight: "bold",
		color: Colors.black,
	},
	imageContainer: {
		flex: 0.9,
		justifyContent: "center",
		top: 5,
	},
	image: {
		maxHeight: deviceHeight / 1.34,
		width: deviceWidth / 1.2,
		resizeMode: "contain",
		alignSelf: "center",
	},
	swiperContainer: {
		flex: 1,
		// ...LayoutStyle.paddingVertical20,
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
});
