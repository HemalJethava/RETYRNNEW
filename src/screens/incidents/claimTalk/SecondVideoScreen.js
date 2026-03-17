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
	Alert,
	ScrollView,
	StyleSheet,
	Platform,
	BackHandler,
	AppState,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import TimerService from "../../../lib/react-native-camera/App/TimerService";
import { Icons, Overlay, Loader } from "../../../components";
import Colors from "../../../styles/Colors";
import IncidentStyle from "../../../styles/IncidentStyles";
import LayoutStyle from "../../../styles/LayoutStyle";
import MESSAGE from "../../../utils/Messages";
import RNFS from "react-native-fs";
import { mergeVideoClips } from "../../../config/CommonFunctions";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import CommonStyles from "../../../styles/CommonStyles";

import Voice from "@react-native-community/voice";
import { startSpeechToText } from "react-native-voice-to-text";

const timerService = new TimerService();

const SecondVideoScreen = (props) => {
	var _props = props.route.params;
	const navigation = useNavigation();

	const [isFront, setIsFront] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [recording, setRecording] = useState(false);
	const [onlySec, setOnlySec] = useState(0);
	const [seconds, setSeconds] = useState(1);
	const [statementNumber, setStatementNumber] = useState("1");
	const [minutes, setMinutes] = useState(0);
	const [cameraRef, setCameraRef] = useState(null);
	const [isModal, setIsModal] = useState(true);

	const [incidentTypeText, setIncidentTypeText] = useState("");
	const [weatherText, setWeatherText] = useState("");
	const [criticalInfotext, setCriticalInfoText] = useState("");
	const [isListening, setIsListening] = useState(false);
	const [finalVideo, setFinalVideo] = useState("");

	const statementRef = useRef(statementNumber);
	const videoClipsRef = useRef([]);
	const device = isFront ? useCameraDevice("front") : useCameraDevice("back");
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
			return () => (videoClipsRef.current = []);
		}, [])
	);

	useLayoutEffect(() => {
		if (recording) {
			statementRef.current = statementNumber;
		}
	}, [statementNumber, recording]);

	useEffect(() => {
		if (Platform.OS == "ios") {
			Voice.onSpeechStart = onSpeechStart;
			Voice.onSpeechResults = onSpeechResults;
			Voice.onSpeechError = onSpeechError;

			Voice.isAvailable().catch((err) =>
				console.error("Speech init error:", err)
			);

			return () => Voice.destroy().then(Voice.removeAllListeners);
		}
	}, []);

	useEffect(() => {
		const manageVideoClips = async () => {
			if (onlySec >= 60) return await stopRecordingVideo();

			const scr = statementRef.current;

			if (scr === "1") {
				if (incidentTypeText) {
					global.incidentTypeText = incidentTypeText;
					await stopRecordingVideo();
					setStatementNumber("2");
				} else if (onlySec >= 20) {
					await stopRecordingVideo(true);
				}
			} else if (scr === "2") {
				if (weatherText) {
					global.weatherText = weatherText;
					await stopRecordingVideo();
					setStatementNumber("3");
				} else if (onlySec >= 20) {
					await stopRecordingVideo(true);
				}
			} else if (scr === "3") {
				if (criticalInfotext) {
					global.criticalInfotext = criticalInfotext;
					await stopRecordingVideo(false, true);
				} else if (onlySec >= 20) {
					await stopRecordingVideo(true);
				}
			}
			setSeconds(onlySec);
		};
		manageVideoClips();
	}, [onlySec]);

	const goToBack = async () => {
		if (!cameraRef || !recording) navigation.goBack();

		await cameraRef.stopRecording();
		await stopListening();
		timerService.stopTimer();
		setRecording(false);

		if (Platform.OS === "ios") Voice.destroy().then(Voice.removeAllListeners);
		setSeconds(0);
		setOnlySec(0);
		setMinutes(0);
		navigation.goBack();
	};
	const onSpeechResults = ({ value }) => {
		if (!value?.[0]) return;
		handleSpeechResult(value[0]);
	};

	let speechTimeout;
	const handleSpeechResult = async (spokenText) => {
		if (speechTimeout) clearTimeout(speechTimeout);

		speechTimeout = setTimeout(() => {
			if (statementRef.current === "1") {
				setIncidentTypeText(spokenText);
			} else if (statementRef.current === "2") {
				setWeatherText(spokenText);
			} else if (statementRef.current === "3") {
				setCriticalInfoText(spokenText);
			}
			setIsListening(false);
		}, 2000);
	};
	const changeCameraType = () => {
		setIsFront((prev) => !prev);
	};
	const onSpeechStart = () => {
		setIsListening(true);
	};
	const onSpeechError = (event) => {
		if (event.error.message === "7/No match") {
			startListeningWithRetry();
		} else {
			setIsListening(false);
		}
	};
	const startListening = async () => {
		if (Platform.OS === "ios") {
			try {
				await Voice.removeAllListeners();
				await Voice.start("en-US");
			} catch (error) {
				console.error("iOS voice recognition error:", error);
			}
		} else {
			try {
				const audioText = await startSpeechToText();
				handleSpeechResult(audioText);
			} catch (error) {
				console.error("Android voice recognition error:", error);
			}
		}
	};
	const stopListening = async () => {
		if (Platform.OS === "ios") {
			try {
				await Voice.stop();
			} catch (error) {
				console.error("Error stopping voice recognition:", error);
			}
		}
	};
	const startListeningWithRetry = async (retryCount = 0) => {
		if (recording) {
			const maxRetries = 3;
			if (retryCount < maxRetries) {
				try {
					await Voice.start("en-US");
				} catch (error) {
					console.error("Retry failed:", error);
					startListeningWithRetry(retryCount + 1);
				}
			} else {
				Alert.alert(
					"Failed to recognize speech after multiple attempts. Please try again later."
				);
				setIsListening(false);
			}
		}
	};
	const countdown = useCallback(() => {
		setOnlySec((onlySec) => onlySec + 1);
	}, []);
	const startRecordingVideo = async () => {
		if (_props && global.secondVideo) {
			return props.navigation.navigate("ThirdVideo", {
				incidentDate: _props.incidentDate,
				incidentTime: _props.incidentTime,
				location: _props.location,
				locationCoords: _props.locationCoords,
			});
		}

		if (!cameraRef || recording)
			return console.log("Camera not ready or already recording");

		try {
			await new Promise((res) => setTimeout(res, 500));
			timerService.startTimer(countdown);
			setRecording(true);
			startListening();

			cameraRef.startRecording({
				onRecordingFinished: (video) => {
					videoClipsRef.current.push(video.path);
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
			console.warn("Failed to start recording:", e);
		}
	};
	const stopRecordingVideo = async (
		shouldPopClip = false,
		shouldMerge = false
	) => {
		if (!cameraRef || !recording) return;

		try {
			await cameraRef.stopRecording();
			await stopListening();
			timerService.stopTimer();
			setRecording(false);

			if (Platform.OS === "ios") Voice.destroy().then(Voice.removeAllListeners);
			setSeconds(0);
			setOnlySec(0);
			setMinutes(0);

			setTimeout(async () => {
				const videoClips = videoClipsRef.current;
				if (shouldPopClip && videoClips.length) {
					videoClips.pop();
					console.log("Removed clip:", videoClips);
				} else if (shouldMerge && videoClips.length) {
					setIsLoading(true);
					await mergeVideos(videoClips);
				}
			}, 1500);
		} catch (e) {
			console.warn("Failed to stop recording:", e);
		}
	};
	const handleStartRecording = async () => {
		await startRecordingVideo();
	};
	const mergeVideos = async (videoClips) => {
		if (!videoClips.length) return;
		const output = `${
			RNFS.DocumentDirectoryPath
		}/incidentInfo_${Date.now()}.mp4`;
		const merged = await mergeVideoClips(videoClips, output);
		setIsLoading(false);

		if (merged) {
			setFinalVideo(merged);
			global.secondVideo = merged;

			if (_props) {
				await props.navigation.navigate("ThirdVideo", {
					incidentDate: _props.incidentDate,
					incidentTime: _props.incidentTime,
					location: _props.location,
					locationCoords: _props.locationCoords,
				});
			}
		} else {
			showMessage({
				message: "Something went wrong\nPlease try again",
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

	return (
		<>
			<SafeAreaView style={{ ...CommonStyles.mainContainer }}>
				<Loader show={isLoading} />
				{!isLoading && (
					<>
						{/* {!global.secondVideo ? (
							<> */}
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
						<ScrollView
							style={[
								IncidentStyle.CameraTextcontainer,
								{ maxHeight: 220, paddingVertical: 0 },
							]}
							contentContainerStyle={{ paddingVertical: 20 }}
						>
							<View>
								<Text
									style={[
										IncidentStyle.cameraTextStyle,
										{
											flex: 0.5,
											color: statementRef.current === "1" ? "#FFBA00" : "#fff",
										},
									]}
								>
									{MESSAGE.videoMsg2Line1}
								</Text>
								{incidentTypeText && (
									<View style={{ marginBottom: 5 }}>
										<Text
											style={[
												IncidentStyle.cameraTextStyle,
												{ color: "#ffffff80" },
											]}
										>
											Incident type: {incidentTypeText}
										</Text>
									</View>
								)}
								<Text
									style={[
										IncidentStyle.cameraTextStyle,
										{
											color:
												!statementRef.current === "2" && !weatherText
													? "#ffffff80"
													: statementRef.current === "2"
													? "#FFBA00"
													: "#fff",
										},
									]}
								>
									{MESSAGE.videoMsg2Line2}
								</Text>
								{weatherText && (
									<View style={{ marginBottom: 5 }}>
										<Text
											style={[
												IncidentStyle.cameraTextStyle,
												{ color: "#ffffff80" },
											]}
										>
											Weather: {weatherText}
										</Text>
									</View>
								)}
								<Text
									style={[
										IncidentStyle.cameraTextStyle,
										{
											color:
												!statementRef.current === "3" && !criticalInfotext
													? "#ffffff80"
													: statementRef.current === "3"
													? "#FFBA00"
													: "#fff",
										},
									]}
								>
									{MESSAGE.videoMsg2Line3}
								</Text>
								{criticalInfotext && (
									<View style={{ marginBottom: 5 }}>
										<Text
											style={[
												IncidentStyle.cameraTextStyle,
												{ color: "#ffffff80" },
											]}
										>
											Critical Info: {criticalInfotext}
										</Text>
									</View>
								)}
							</View>
						</ScrollView>
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
									<TouchableOpacity onPress={handleStartRecording}>
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
						{/* </>
						) : (
							<View style={{ flex: 0.5, marginTop: 220 }}>
								<VideoControls
									source={{ uri: global.secondVideo }}
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
							</View>
						)} */}
					</>
				)}
			</SafeAreaView>
			<Overlay onRequestClose={() => onRequestClose()} visible={isModal}>
				<View style={{ ...LayoutStyle.paddingBottom30 }}>
					<View style={[IncidentStyle.cameraModal]}>
						<View style={[IncidentStyle.centerModal]}>
							<Text style={[IncidentStyle.cameraLabel]}>{"Second"}</Text>
							<Text style={[IncidentStyle.cameraName]}>{" Video"}</Text>
						</View>
						<Text
							style={[
								IncidentStyle.messageStyle,
								{ ...LayoutStyle.marginTop10 },
							]}
						>
							{
								"Next, please explain in your words what occurred in this incident."
							}
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

export default SecondVideoScreen;
