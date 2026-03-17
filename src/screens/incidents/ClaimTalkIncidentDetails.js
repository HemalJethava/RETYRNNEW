import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Image,
	ToastAndroid,
	Platform,
	Alert,
	LayoutAnimation,
	StatusBar,
} from "react-native";
import { LightHeader, KeyValue, Icons } from "../../components";
import IncidentStyle from "../../styles/IncidentStyles";
import Colors from "../../styles/Colors";
import CommonStyles from "../../styles/CommonStyles";
import MESSAGE from "../../utils/Messages";
import { createThumbnail } from "react-native-create-thumbnail";
import IMAGES from "../../assets/images/Images";
import { ImagesPopup } from "../../components/ImagesPopup";
import RNFS from "react-native-fs";
import CircularProgress from "react-native-circular-progress-indicator";
import VideoLoading from "../../components/LoaderComponents/VideoLoading";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import SubKeyValue from "./Components/SubKeyValue";
import {
	generateUniqueId,
	getFileNameFromPath,
	openFileByThirdPartyApp,
} from "../../config/CommonFunctions";
import { showMessage } from "react-native-flash-message";

import moment from "moment";
import { FullScreenVideoPlayer } from "./Components/FullScreenVideoPlayer";
import { checkAddressValidity, isValidJSON } from "../../utils/Validation";
import Swiper from "react-native-swiper";
import FastImage from "react-native-fast-image";
import { OTTVideoPlayer } from "../../components/OTTVideoPlayer";

const ClaimTalkIncidentDetails = (props) => {
	const incidentDetails = props?.route.params?.incident;

	const [incidentVideos, setIncidentVideos] = useState([]);
	const [videoThumbnails, setVideoThumbnails] = useState([]);
	const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isFullScreen, setIsFullScreen] = useState(false);
	const [selectedItem, setSelectedItem] = useState(null);

	const [downloadingVideos, setDownloadingVideos] = useState({});
	const [downloadProgress, setDownloadProgress] = useState({});

	const [incidentImages, setIncidentImages] = useState([]);
	const [showImagesPopup, setShowImagesPopup] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [voiceNotes, setVoiceNotes] = useState(null);

	const [loadingItem, setLoadingItem] = useState(false);
	const [errorIndexes, setErrorIndexes] = useState([]);

	const [isFullScreenVideo, setIsFullScreenVideo] = useState(false);

	useEffect(() => {
		const getIncidentVideos = () => {
			if (incidentDetails?.incident_image?.length > 0) {
				const videoPaths = incidentDetails.incident_image
					.filter((item) => item.type === "video" && item.video_path)
					.map((item) => ({ video_path: item.video_path }));
				setIncidentVideos(videoPaths);

				const images = incidentDetails?.incident_image.filter(
					(item) => item.photo_path
				);

				const imagesArray = images.map((img) => img?.photo_path);
				setIncidentImages(imagesArray);
			}
		};

		const getVoiceNotes = () => {
			if (
				incidentDetails?.voice_notes &&
				incidentDetails?.voice_notes.length > 0
			) {
				const mergedVoiceNotes = incidentDetails?.voice_notes.reduce(
					(acc, curr) => {
						return { ...acc, ...curr };
					}
				);
				setVoiceNotes(mergedVoiceNotes);
			}
		};

		getVoiceNotes();
		getIncidentVideos();
	}, [incidentDetails]);

	useEffect(() => {
		const generateThumbnails = async () => {
			if (incidentVideos.length > 0) {
				setIsLoadingThumbnail(true);
				const thumbnails = await Promise.all(
					incidentVideos.map(async (item) => {
						try {
							const thumbnail = await createThumbnail({
								url: item.video_path,
								timeStamp: 1000,
							});
							return thumbnail.path;
						} catch (error) {
							console.error("Thumbnail generation error: ", error);
							return null;
						}
					})
				);
				setIsLoadingThumbnail(false);
				setVideoThumbnails(thumbnails);
			}
		};
		generateThumbnails();
	}, [incidentVideos]);

	const handleImageError = (index) => {
		setErrorIndexes((prev) => [...new Set([...prev, index])]);
	};
	const downloadVideo = async (url) => {
		if (!url) return;

		const videoName = generateUniqueId();
		const downloadPath = `${
			Platform.OS === "android"
				? RNFS.DownloadDirectoryPath
				: RNFS.DocumentDirectoryPath
		}/${videoName}.mp4`;

		setDownloadingVideos((prev) => ({ ...prev, [url]: true }));
		setDownloadProgress((prev) => ({ ...prev, [url]: 0 }));

		try {
			const options = {
				fromUrl: url,
				toFile: downloadPath,
				progress: (res) => {
					const progress = (res.bytesWritten / res.contentLength) * 100;
					setDownloadProgress((prev) => ({
						...prev,
						[url]: progress.toFixed(0),
					}));
				},
				progressDivider: 1,
			};

			const result = await RNFS.downloadFile(options).promise;

			if (result.statusCode === 200) {
				if (Platform.OS === "android") {
					ToastAndroid.showWithGravity(
						"Video Downloaded Successfully!",
						ToastAndroid.LONG,
						ToastAndroid.CENTER
					);
				} else {
					await CameraRoll.save(downloadPath, { type: "video" });
					Alert.alert("Video Downloaded Successfully!");
				}
			} else {
				throw new Error("Video Download Failed!");
			}
		} catch (error) {
			const errorMessage = `Download Failed: ${error.message}`;
			if (Platform.OS === "android") {
				ToastAndroid.showWithGravity(
					errorMessage,
					ToastAndroid.LONG,
					ToastAndroid.CENTER
				);
			} else {
				Alert.alert(errorMessage);
			}
		} finally {
			setDownloadingVideos((prev) => ({ ...prev, [url]: false }));
		}
	};
	const gotoBack = () => {
		props.navigation.goBack();
	};
	const onPressPDF = (url) => {
		try {
			const file_name = getFileNameFromPath(incidentDetails?.doc_file_path);
			const file = {
				file_url: url,
				file_name: file_name,
			};
			openFileByThirdPartyApp(file);
		} catch (error) {
			console.warn("Error: ", error);
		}
	};
	const toggleExpandCollapse = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setIsExpanded(!isExpanded);
	};
	const onPressLocation = async (item) => {
		setLoadingItem(true);
		const locationCoords =
			typeof item?.location_coords === "string" &&
			isValidJSON(item.location_coords)
				? JSON.parse(item.location_coords)
				: item.location_coords;

		const isValidAddress = await checkAddressValidity(
			locationCoords?.latitude,
			locationCoords?.longitude
		);

		setLoadingItem(false);

		if (isValidAddress) {
			props.navigation.navigate("ClaimTalkIncidentMap", {
				claimTalkIncident: item,
			});
		} else {
			showMessage({
				message: "Location not found!",
				type: "danger",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				autoHide: true,
			});
		}
	};

	return (
		<View style={[CommonStyles.mainContainer, { backgroundColor: "#FFF2CD" }]}>
			<StatusBar hidden={isFullScreenVideo} />
			<FullScreenVideoPlayer
				show={isFullScreen}
				onHide={() => setIsFullScreen(false)}
				data={selectedItem}
			/>
			<ImagesPopup
				show={showImagesPopup}
				onHide={() => setShowImagesPopup(false)}
				data={incidentImages}
			/>
			<LightHeader
				isLogo={false}
				iconName={"angle-left"}
				iconSize={24}
				iconSetName={"FontAwesome6"}
				iconColor={Colors.primary}
				isBackIcon={true}
				headerBG={Colors.white}
				statusBG={Colors.white}
				onPress={() => gotoBack()}
				headerText={"Claim Talk"}
				isSmallText={true}
				smallLabel={
					incidentDetails?.incident_date
						? moment(incidentDetails?.incident_date, "YYYY-MM-DD").format(
								"MM/DD/YYYY"
						  )
						: ""
				}
			/>
			<ScrollView overScrollMode={"never"} showsVerticalScrollIndicator={false}>
				<View style={[IncidentStyle.imgCardContainer, { paddingBottom: 0 }]}>
					<View style={[IncidentStyle, { justifyContent: "center" }]}>
						{incidentVideos.length > 0 && (
							<>
								<Text style={[IncidentStyle.detailTitle, { marginLeft: 20 }]}>
									{"Incident Videos"}
								</Text>

								<View style={IncidentStyle.claimVideoContainer}>
									<Swiper
										showsButtons={false}
										dotColor={Colors.secondary60}
										activeDotColor={Colors.secondary}
										containerStyle={{}}
										loadMinimal
										paginationStyle={{
											bottom: -30,
										}}
									>
										{incidentVideos.map((item, index) => (
											<View style={IncidentStyle.videoBox}>
												{isLoadingThumbnail ? (
													<VideoLoading />
												) : (
													<>
														{!isPlaying ? (
															<TouchableOpacity
																style={IncidentStyle.thumbnailContainer}
																onPress={() => setIsPlaying(true)}
															>
																{videoThumbnails[index] && (
																	<Image
																		source={{ uri: videoThumbnails[index] }}
																		style={IncidentStyle.thumbnail}
																	/>
																)}

																{!downloadingVideos[item?.video_path] ? (
																	<TouchableOpacity
																		style={IncidentStyle.videoDownloadBtn}
																		onPress={() =>
																			downloadVideo(item?.video_path)
																		}
																		disabled={
																			downloadingVideos[item?.video_path]
																		}
																	>
																		<Icons
																			iconSetName={"Ionicons"}
																			iconName={"download-outline"}
																			iconSize={26}
																			iconColor={Colors.white}
																		/>
																	</TouchableOpacity>
																) : (
																	<View
																		style={[
																			IncidentStyle.videoDownloadBtn,
																			{
																				justifyContent: "center",
																				alignItems: "center",
																			},
																		]}
																	>
																		<CircularProgress
																			value={
																				downloadProgress[item?.video_path] || 0
																			}
																			maxValue={100}
																			radius={15}
																			textColor="#000"
																			activeStrokeColor={Colors.white}
																			inActiveStrokeColor="#ccc"
																			inActiveStrokeOpacity={0.5}
																			progressValueStyle={{
																				fontSize: 11,
																				fontWeight: "bold",
																				color: Colors.white,
																			}}
																			activeStrokeWidth={4}
																			inActiveStrokeWidth={4}
																			valueSuffix="%"
																			valueSuffixStyle={{ left: -4 }}
																		/>
																	</View>
																)}
															</TouchableOpacity>
														) : (
															<OTTVideoPlayer
																videoUrl={item?.video_path}
																title=""
																onBack={gotoBack}
																onChangeFullScreen={(isFullScreen) => {
																	setIsFullScreenVideo(isFullScreen);
																}}
															/>
														)}
													</>
												)}
											</View>
										))}
									</Swiper>
								</View>
							</>
						)}
					</View>
				</View>
				<View style={[IncidentStyle.claimImageContainer]}>
					<Text style={[IncidentStyle.detailTitle]}>{"Incident Images"}</Text>
					{incidentImages?.length > 0 ? (
						<View style={IncidentStyle.claimImageCarousel}>
							<View style={[IncidentStyle.sliderBox]}>
								<Swiper
									style={{ height: 160, marginTop: 10 }}
									showsButtons={false}
									dotColor={Colors.secondary60}
									activeDotColor={Colors.secondary}
									containerStyle={{}}
									loadMinimal
									paginationStyle={{
										bottom: -30,
									}}
									// autoplay
									// autoplayTimeout={4}
								>
									{incidentImages.map((image, index) => {
										const hasError = errorIndexes.includes(index);
										return (
											<View>
												<TouchableOpacity
													style={{ marginBottom: 10 }}
													onPress={() => setShowImagesPopup(true)}
												>
													<FastImage
														source={{ uri: image }}
														style={{
															height: 160,
															width: "100%",
														}}
														resizeMode={"contain"}
														onError={() => handleImageError(index)}
													/>
												</TouchableOpacity>
												{hasError && (
													<View style={[IncidentStyle.talkImageErr]}>
														<Icons
															iconSetName={"MaterialIcons"}
															iconName={"error-outline"}
															iconSize={40}
															iconColor={Colors.errorBoxRed}
														/>
														<Text style={[IncidentStyle.imageErrTxt]}>
															{"Failed to load image"}
														</Text>
													</View>
												)}
											</View>
										);
									})}
								</Swiper>
							</View>
						</View>
					) : (
						<View style={[CommonStyles.emptyDataAlign]}>
							<Text style={[CommonStyles.emptyDataBlack]}>
								{MESSAGE.noIncidentImgs}
							</Text>
						</View>
					)}
				</View>
				<View style={[IncidentStyle.detailContainer]}>
					<Text style={[IncidentStyle.detailTitle, { paddingTop: 20 }]}>
						{"Details"}
					</Text>

					<KeyValue
						keyLabel={"Incident"}
						valueLabel={"Claim Talk"}
						keyColor={Colors.labelBlack}
					/>

					<KeyValue
						keyLabel={"Date Submitted"}
						valueLabel={moment(
							incidentDetails?.incident_date,
							"YYYY-MM-DD"
						).format("MM/DD/YYYY")}
						keyColor={Colors.labelBlack}
					/>

					<KeyValue
						keyLabel={"Time Submitted"}
						valueLabel={incidentDetails?.incident_time}
						keyColor={Colors.labelBlack}
					/>

					<KeyValue
						keyLabel={"Status"}
						valueLabel={
							incidentDetails?.status
								? incidentDetails?.status.charAt(0).toUpperCase() +
								  incidentDetails?.status.slice(1)
								: ""
						}
						valueColor={"#FFBA00"}
						keyColor={Colors.labelBlack}
					/>

					<SubKeyValue
						keyLabel={"Location"}
						valueLabel={incidentDetails?.location}
						keyColor={Colors.labelBlack}
						valueColor={Colors.secondary}
						isIcon={true}
						iconSetName={"MaterialIcons"}
						iconName={"location-pin"}
						iconColor={Colors.secondary}
						iconSize={26}
						IsOnPress={true}
						onPress={() => onPressLocation(incidentDetails)}
						isLoading={loadingItem}
					/>

					<View>
						<View style={{ ...CommonStyles.directionRowSB }}>
							<Text style={[IncidentStyle.detailsLabel]}>{"Sub Details"}</Text>
							<TouchableOpacity
								style={{ ...CommonStyles.directionRowSB }}
								onPress={toggleExpandCollapse}
							>
								<Text style={IncidentStyle.seeMoreTxt}>{`See ${
									isExpanded ? "less" : "more"
								}`}</Text>
								<Icons
									iconColor={Colors.secondary}
									iconSetName={"MaterialCommunityIcons"}
									iconName={isExpanded ? "chevron-up" : "chevron-down"}
									iconSize={22}
								/>
							</TouchableOpacity>
						</View>

						{isExpanded && (
							<>
								{voiceNotes && (
									<>
										<SubKeyValue
											keyLabel={"Name Detail"}
											valueLabel={voiceNotes?.claimer_name || "-"}
											keyColor={Colors.labelBlack}
										/>
										<SubKeyValue
											keyLabel={"Driver & Vehicle Detail"}
											valueLabel={voiceNotes?.vehicle_details || "-"}
											keyColor={Colors.labelBlack}
										/>
										<SubKeyValue
											keyLabel={"Date & Other Details"}
											valueLabel={voiceNotes?.incident_details || "-"}
											keyColor={Colors.labelBlack}
										/>
										<SubKeyValue
											keyLabel={"Incident Type"}
											valueLabel={voiceNotes?.incident_type || "-"}
											keyColor={Colors.labelBlack}
										/>
										<SubKeyValue
											keyLabel={"Weather Detail"}
											valueLabel={voiceNotes?.weather_detail || "-"}
											keyColor={Colors.labelBlack}
										/>
										<SubKeyValue
											keyLabel={"Critical Information"}
											valueLabel={voiceNotes?.critical_info || "-"}
											keyColor={Colors.labelBlack}
											borderBottomWidth={
												incidentDetails?.doc_file_path ? "yes" : "no"
											}
										/>
										{incidentDetails?.doc_file_path && (
											<TouchableOpacity
												style={[
													IncidentStyle.document,
													{
														...CommonStyles.directionRowSB,
														paddingVertical: 10,
													},
												]}
												onPress={() =>
													onPressPDF(incidentDetails?.doc_file_path)
												}
											>
												<Image
													source={IMAGES.pdfImg}
													style={{
														height: 25,
														width: 25,
														resizeMode: "contain",
													}}
												/>
												<Text style={[IncidentStyle.documentText]}>
													{`${getFileNameFromPath(
														`${incidentDetails?.doc_file_path.slice(
															0,
															15
														)}...${incidentDetails?.doc_file_path
															.split(".")
															.pop()}`
													)}`}
												</Text>
											</TouchableOpacity>
										)}
									</>
								)}
							</>
						)}
					</View>
				</View>
			</ScrollView>
		</View>
	);
};

export default ClaimTalkIncidentDetails;
