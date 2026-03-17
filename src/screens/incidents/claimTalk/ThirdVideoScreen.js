import React, {
	useState,
	useCallback,
	useEffect,
	useRef,
	useLayoutEffect,
} from "react";
import {
	SafeAreaView,
	View,
	Text,
	TouchableOpacity,
	Pressable,
	StyleSheet,
	Platform,
	BackHandler,
	AppState,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import TimerService from "../../../lib/react-native-camera/App/TimerService";
import { Icons, Loader, Overlay } from "../../../components";
import Colors from "../../../styles/Colors";
import IncidentStyle from "../../../styles/IncidentStyles";
import CommonStyles from "../../../styles/CommonStyles";
import LayoutStyle from "../../../styles/LayoutStyle";
import MESSAGE from "../../../utils/Messages";
import RNFS from "react-native-fs";
import { mergeVideoClips } from "../../../config/CommonFunctions";
import { Camera, useCameraDevice } from "react-native-vision-camera";

const timerService = new TimerService();

const ThirdVideoScreen = (props) => {
	var _props = props.route.params;
	const navigation = useNavigation();

	const [isFront, setIsFront] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [recording, setRecording] = useState(false);
	const [finalVideo, setFinalVideo] = useState("");

	const [onlySec, setOnlySec] = useState(0);
	const [seconds, setSeconds] = useState(1);
	const [minutes, setMinutes] = useState(0);

	const [cameraRef, setCameraRef] = useState(null);
	const [isModal, setIsModal] = useState(true);
	const [videoScr, setVideoScr] = useState("1");

	const videoScrRef = useRef(videoScr);
	const videoClipsRef = useRef([]);
	const frontCamera = useCameraDevice("front");
	const backCamera = useCameraDevice("back");
	const device = isFront ? frontCamera : backCamera;
	const appState = useRef(AppState.currentState);

	useEffect(() => {
		let backHandler;
		const handleBackPress = () => {
			goToBack();
			return true;
		};
		const setupBackHandler = () => {
			backHandler = BackHandler.addEventListener(
				"hardwareBackPress",
				handleBackPress
			);
		};
		setupBackHandler();
		return () => {
			backHandler?.remove();
		};
	}, []);

	useEffect(() => {
		const subscription = AppState.addEventListener("change", (nextAppState) => {
			if (
				appState.current.match(/inactive|background/) &&
				nextAppState === "active"
			) {
				setIsFront((prev) => !prev);
				setTimeout(() => setIsFront((prev) => !prev), 200);
			}
			appState.current = nextAppState;
		});

		return () => subscription.remove();
	}, []);

	useFocusEffect(
		useCallback(() => {
			videoClipsRef.current = [];
			return () => {
				videoClipsRef.current = [];
			};
		}, [])
	);

	useLayoutEffect(() => {
		if (recording) {
			videoScrRef.current = videoScr;
		}
	}, [videoScr, recording]);

	useEffect(() => {
		if (onlySec < 60) {
			setSeconds(onlySec);
		} else {
			stopRecordingVideo();
		}
	}, [onlySec]);

	const goToBack = async () => {
		if (!cameraRef || !recording) navigation.goBack();

		await cameraRef.stopRecording();
		timerService.stopTimer();
		setRecording(false);

		setSeconds(0);
		setOnlySec(0);
		setMinutes(0);
		navigation.goBack();
	};
	const changeCameraType = () => {
		setIsFront((prev) => !prev);
	};
	const startRecordingVideo = async () => {
		if (_props && global.thirdVideo) {
			return props.navigation.navigate("UploadFile", {
				incidentDate: _props.incidentDate,
				incidentTime: _props.incidentTime,
				location: _props.location,
				locationCoords: _props.locationCoords,
			});
		} else {
			if (!cameraRef) {
				console.log("Camera is not ready");
				return;
			}
			if (cameraRef && !recording) {
				try {
					await new Promise((resolve) => setTimeout(resolve, 1000));
					timerService.startTimer(countdown);
					setRecording(true);

					cameraRef.startRecording({
						onRecordingFinished: (video) => {
							videoClipsRef.current = [...videoClipsRef.current, video.path];
							console.log("Saved clip:", video.path);
						},
						onRecordingError: (error) => {
							console.error("Recording error:", error);
						},
						fileType: "mp4",
						codec: "h264",
						quality: "480p",
					});
				} catch (e) {
					console.warn("Failed to start recording: ", e);
				}
			}
		}
	};
	const stopRecordingVideo = async () => {
		if (cameraRef && recording) {
			try {
				setIsLoading(true);
				await cameraRef.stopRecording();
				timerService.stopTimer();

				setRecording(false);

				setTimeout(async () => {
					const videoClips = videoClipsRef.current;
					if (videoClips.length > 0) {
						await mergeVideos(videoClips);
					}
				}, 1500);
			} catch (e) {
				console.warn("Failed to stop recording: ", e);
			}
		}
	};
	const countdown = useCallback(() => {
		setOnlySec((onlySec) => onlySec + 1);
	}, []);
	const mergeVideos = async (videoClips) => {
		const output = `${
			RNFS.DocumentDirectoryPath
		}/incidentDemmaged_${Date.now()}.mp4`;

		const mergedVideoPath = await mergeVideoClips(videoClips, output);
		setIsLoading(false);

		if (mergedVideoPath) {
			setFinalVideo(mergedVideoPath);
			global.thirdVideo = mergedVideoPath;

			if (_props) {
				await props.navigation.navigate({
					name: "UploadFile",
					params: {
						incidentDate: _props.incidentDate,
						incidentTime: _props.incidentTime,
						location: _props.location,
						locationCoords: _props.locationCoords,
					},
				});
			}
		} else {
			showMessage({
				message: "Something went wrong with \n Please try again",
				type: "danger",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				autoHide: true,
			});
			console.error("Failed to merge videos.");
		}
	};
	const onRequestClose = () => {
		setIsModal(false);
	};
	const gotoDisplayText = () => {
		setVideoScr("2");
	};
	return (
		<>
			<SafeAreaView style={{ ...CommonStyles.mainContainer }}>
				<Loader show={isLoading} />
				{!isLoading && (
					<>
						{device && (
							<Camera
								style={[StyleSheet.absoluteFill]}
								device={device}
								isActive={true}
								video={true}
								audio={Platform.OS === "android" ? false : true}
								ref={(ref) => setCameraRef(ref)}
							/>
						)}
						<View style={[IncidentStyle.cameraStatusBar]}>
							<TouchableOpacity onPress={goToBack}>
								<Icons
									iconName={"angle-left"}
									iconSetName={"FontAwesome6"}
									iconColor={Colors.iconWhite}
									iconSize={24}
								/>
							</TouchableOpacity>
							{recording && (
								<Text style={{ color: "#FFF" }}>
									{onlySec < 60
										? seconds < 10
											? "00:0" + seconds
											: "00:" + seconds
										: seconds < 10
										? "0" + minutes + ":0" + seconds
										: "0" + minutes + ":" + seconds}
								</Text>
							)}
							<TouchableOpacity onPress={changeCameraType}>
								<Icons
									iconName={"flip-camera-android"}
									iconSetName={"MaterialIcons"}
									iconColor={Colors.iconWhite}
									iconSize={24}
								/>
							</TouchableOpacity>
						</View>
						<View style={[IncidentStyle.CameraTextcontainer]}>
							{videoScr === "1" ? (
								<View style={[CommonStyles.directionRowSB]}>
									<Text style={[IncidentStyle.cameraTextStyle]}>
										{MESSAGE.videoMsg3Line1}
									</Text>
									<TouchableOpacity onPress={() => gotoDisplayText()}>
										<View style={[IncidentStyle.btnBorderToday]}>
											<Text style={[IncidentStyle.todayText]}>{"Next"}</Text>
										</View>
									</TouchableOpacity>
								</View>
							) : videoScr === "2" ? (
								<Text style={[IncidentStyle.cameraTextStyle]}>
									{MESSAGE.videoMsg3Line2}
								</Text>
							) : null}
						</View>
						<View
							style={{
								position: "absolute",
								bottom: 0,
								width: "100%",
								backgroundColor: Colors.primary,
								padding: 20,
							}}
						>
							<View
								style={{
									flexDirection: "row",
									justifyContent: "center",
									alignItems: "center",
									alignSelf: "center",
								}}
							>
								{recording ? (
									<TouchableOpacity onPress={stopRecordingVideo}>
										<View
											style={{
												borderWidth: 3,
												borderRadius: 50,
												borderColor: Colors.white,
												padding: 14,
												backgroundColor: Colors.red,
											}}
										>
											<Icons
												iconName={"square-rounded"}
												iconSetName={"MaterialCommunityIcons"}
												iconColor={Colors.white}
												iconSize={30}
											/>
										</View>
									</TouchableOpacity>
								) : (
									<TouchableOpacity onPress={startRecordingVideo}>
										<View
											style={{
												borderWidth: 3,
												borderRadius: 50,
												borderColor: Colors.white,
											}}
										>
											<Icons
												iconName={"circle"}
												iconSetName={"MaterialCommunityIcons"}
												iconColor={Colors.red}
												iconSize={60}
											/>
										</View>
									</TouchableOpacity>
								)}
							</View>
						</View>

						{/* <View style={{ flex: 0.5, marginTop: 220 }}>
							<VideoControls
								source={{ uri: global.thirdVideo }}
								style={{
									width: "100%",
									height: 200,
								}}
								resizeMode="contain"
								autoplay={false}
								disableBack
								tapAnywhereToPause={true}
								playWhenInactive={true}
								disableFullscreen={false}
								disableSeekbar={false}
								disableVolume={false}
								disableTimer={false}
								onEnterFullscreen={() => {}}
							/>
						</View> */}
					</>
				)}
			</SafeAreaView>
			<Overlay onRequestClose={() => onRequestClose()} visible={isModal}>
				<View style={{ ...LayoutStyle.paddingBottom30 }}>
					<View style={[IncidentStyle.cameraModal]}>
						<View style={[IncidentStyle.centerModal]}>
							<Text style={[IncidentStyle.cameraLabel]}>{"Third"}</Text>
							<Text style={[IncidentStyle.cameraName]}>{" Video"}</Text>
						</View>
						<Text
							style={[
								IncidentStyle.messageStyle,
								{ ...LayoutStyle.marginTop10 },
							]}
						>
							{"Next, please provide video evidence of damages to all vehicles"}
						</Text>
					</View>
					<Pressable
						onPress={() => onRequestClose()}
						style={[IncidentStyle.btnGoContainer]}
					>
						<Text style={[IncidentStyle.btnTextGo]}>{"Begin"}</Text>
					</Pressable>
				</View>
			</Overlay>
		</>
	);
};

export default ThirdVideoScreen;
