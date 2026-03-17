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
	ScrollView,
	StyleSheet,
	Alert,
	Platform,
	BackHandler,
	AppState,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import TimerService from "../../../lib/react-native-camera/App/TimerService";
import { Icons, Overlay, Loader } from "../../../components";
import Colors from "../../../styles/Colors";
import IncidentStyle from "../../../styles/IncidentStyles";
import CommonStyles from "../../../styles/CommonStyles";
import LayoutStyle from "../../../styles/LayoutStyle";
import MESSAGE from "../../../utils/Messages";
import {
	claimUserNameText,
	compareWithBlanks,
	compareWithVehicleDetail,
	driverNameRegex,
	driverNVehicleText,
	incidentDateRegex,
	isMatchWithDateNInjured,
	mergeVideoClips,
	peopleInjuredRegex,
	regexName,
	vehicleRefRegex,
} from "../../../config/CommonFunctions";
import RNFS from "react-native-fs";
import { showMessage } from "react-native-flash-message";
import { Camera, useCameraDevice } from "react-native-vision-camera";

import Voice from "@react-native-community/voice";
import { startSpeechToText } from "react-native-voice-to-text";

const timerService = new TimerService();

const FirstVideoScreen = (props) => {
	var _props = props.route.params;
	const navigation = useNavigation();

	const [isFront, setIsFront] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [recording, setRecording] = useState(false);

	const [onlySec, setOnlySec] = useState(0);
	const [seconds, setSeconds] = useState(1);
	const [minutes, setMinutes] = useState(0);

	const [cameraRef, setCameraRef] = useState(null);
	const [isModal, setIsModal] = useState(true);
	const [videoScr, setVideoScr] = useState("1");

	const [recognizedText, setRecognizedText] = useState("");
	const [driverDetailText, setDriverDetailText] = useState("");
	const [dateNInjuredText, setDateNInjuredText] = useState("");
	const [isListening, setIsListening] = useState(false);
	const [permissionsGranted, setPermissionsGranted] = useState(false);

	const [name, setName] = useState("");
	const [driverName, setDriverName] = useState("");
	const [afterDriverNameText, setAfterDriverNameText] = useState("");
	const [vehicleRef, setVehicleRef] = useState("");
	const [incidentDate, setIncidentDate] = useState("");
	const [peopleInjured, setPeopleInjured] = useState(0);
	const [finalVideo, setFinalVideo] = useState("");

	const videoScrRef = useRef(videoScr);
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
	}, [cameraRef, recording]);

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

	useEffect(() => {
		requestPermissions();
	}, []);

	const requestPermissions = async () => {
		try {
			const cameraPermission = await Camera.getCameraPermissionStatus();
			const micPermission = await Camera.getMicrophonePermissionStatus();

			if (cameraPermission !== "authorized") {
				await Camera.requestCameraPermission();
			}
			if (micPermission !== "authorized") {
				await Camera.requestMicrophonePermission();
			}

			const finalCamera = await Camera.getCameraPermissionStatus();
			const finalMic = await Camera.getMicrophonePermissionStatus();

			if (finalCamera === "granted" && finalMic === "granted") {
				setPermissionsGranted(true);
			}
		} catch (error) {
			console.warn("Permission request error:", error);
		}
	};

	useLayoutEffect(() => {
		if (recording) {
			videoScrRef.current = videoScr;
		}
	}, [videoScr, recording]);

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

			const scr = videoScrRef.current;

			if (scr === "1") {
				if (name) {
					global.incidentClaimerName = name;
					await stopRecordingVideo();
					setVideoScr("2");
				} else if (onlySec >= 15) {
					await stopRecordingVideo(true);
				}
			} else if (scr === "2") {
				if (driverName && vehicleRef) {
					global.driverName = driverName;
					global.vehicleRef = vehicleRef;
					await stopRecordingVideo();
					setVideoScr("3");
				} else if (onlySec >= 20) {
					await stopRecordingVideo(true);
				}
			} else if (scr === "3") {
				const isValid = isMatchWithDateNInjured.test(dateNInjuredText);
				if (dateNInjuredText && isValid) {
					global.incidentDate = incidentDate;
					global.peopleInjured = peopleInjured;
					await stopRecordingVideo(false, true);
				} else if (onlySec >= 25) {
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
			const scr = videoScrRef.current;
			if (scr === "1") {
				const match = spokenText.match(regexName);
				if (match) setName(match[1]);
				setRecognizedText(spokenText);
			} else if (scr === "2") {
				const driverMatch = spokenText.match(driverNameRegex);
				const vehicleMatch = spokenText.match(vehicleRefRegex);

				if (driverMatch) {
					setDriverName(driverMatch[1]);
					setAfterDriverNameText(
						spokenText.slice(driverMatch.index + driverMatch[0].length).trim()
					);
				}
				if (vehicleMatch) setVehicleRef(vehicleMatch[1]);

				setDriverDetailText(spokenText);
			} else if (scr === "3") {
				setIncidentDate(spokenText.match(incidentDateRegex)?.[1] || null);
				setPeopleInjured(spokenText.match(peopleInjuredRegex)?.[1] || null);
				setDateNInjuredText(spokenText);
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
		console.warn("speech error: ", event.error.message);

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
		if (_props && global.firstVideo) {
			return props.navigation.navigate("SecondVideo", {
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
		}/incidentIntro_${Date.now()}.mp4`;
		const merged = await mergeVideoClips(videoClips, output);
		setIsLoading(false);

		if (merged) {
			setFinalVideo(merged);
			global.firstVideo = merged;

			if (_props) {
				await props.navigation.navigate("SecondVideo", {
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
					// <>
					// 	{!global.firstVideo ? (
					<>
						{permissionsGranted && device && (
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
							{videoScr === "1" ? (
								<View>
									{recognizedText &&
									compareWithBlanks(claimUserNameText, recognizedText) ? (
										<Text
											style={[
												IncidentStyle.cameraTextStyle,
												{ color: "green" },
											]}
										>{`Hello! My name is ${name} and I was recently in an incident.`}</Text>
									) : recognizedText &&
									  !compareWithBlanks(claimUserNameText, recognizedText) ? (
										<View>
											<Text
												style={[
													IncidentStyle.cameraTextStyle,
													{ color: "red" },
												]}
											>
												{recognizedText}
											</Text>
											<View style={[CommonStyles.directionRowCenter]}>
												<Text
													style={[IncidentStyle.cameraTextStyle, { flex: 0.5 }]}
												>
													{MESSAGE.videoMsg1Line1}
												</Text>
												<View
													style={{
														borderBottomWidth: 1,
														borderColor: "#FFF",
														marginLeft: 10,
														flex: 0.5,
													}}
												>
													<Text style={[IncidentStyle.placeholderQus]}>
														{MESSAGE.videoPlaseholder1Q1}
													</Text>
												</View>
											</View>
											<Text style={[IncidentStyle.cameraTextStyle]}>
												{MESSAGE.videoMsg1Line2}
											</Text>
										</View>
									) : (
										<>
											<View style={[CommonStyles.directionRowCenter]}>
												<Text
													style={[IncidentStyle.cameraTextStyle, { flex: 0.5 }]}
												>
													{MESSAGE.videoMsg1Line1}
												</Text>
												<View
													style={{
														borderBottomWidth: 1,
														borderColor: "#FFF",
														marginLeft: 10,
														flex: 0.5,
													}}
												>
													<Text style={[IncidentStyle.placeholderQus]}>
														{MESSAGE.videoPlaseholder1Q1}
													</Text>
												</View>
											</View>
											<Text style={[IncidentStyle.cameraTextStyle]}>
												{MESSAGE.videoMsg1Line2}
											</Text>
										</>
									)}
								</View>
							) : videoScr === "2" ? (
								<View>
									{driverName && vehicleRef ? (
										<Text
											style={[
												IncidentStyle.cameraTextStyle,
												{ color: "green" },
											]}
										>{`the driver of the vehicle was ${driverName} and the vehicle in reference is a ${vehicleRef}`}</Text>
									) : driverDetailText &&
									  !compareWithVehicleDetail(
											driverNVehicleText,
											driverDetailText
									  ) ? (
										<View>
											<Text
												style={[
													IncidentStyle.cameraTextStyle,
													{ color: "red" },
												]}
											>
												{driverDetailText}
											</Text>
											<>
												<View style={[CommonStyles.directionRowCenter]}>
													<Text
														style={[
															IncidentStyle.cameraTextStyle,
															{ flex: 0.8 },
														]}
													>
														{MESSAGE.videoMsg1Line3}
													</Text>
													<View
														style={{
															borderBottomWidth: 1,
															borderColor: "#FFF",
															marginLeft: 10,
															flex: 0.3,
														}}
													>
														<Text style={[IncidentStyle.placeholderQus]}>
															{MESSAGE.videoPlaseholder1Q2}
														</Text>
													</View>
												</View>
												<Text style={[IncidentStyle.cameraTextStyle]}>
													{MESSAGE.videoMsg1Line4}
												</Text>
												<View
													style={{
														borderBottomWidth: 1,
														borderColor: "#FFF",
													}}
												>
													<Text style={[IncidentStyle.placeholderQus]}>
														{MESSAGE.videoPlaseholder1Q3}
													</Text>
												</View>
											</>
										</View>
									) : (
										<>
											<View style={[CommonStyles.directionRowCenter]}>
												<Text
													style={[IncidentStyle.cameraTextStyle, { flex: 0.8 }]}
												>
													{MESSAGE.videoMsg1Line3}
												</Text>
												<View
													style={{
														borderBottomWidth: 1,
														borderColor: "#FFF",
														marginLeft: 10,
														flex: 0.3,
													}}
												>
													<Text style={[IncidentStyle.placeholderQus]}>
														{MESSAGE.videoPlaseholder1Q2}
													</Text>
												</View>
											</View>
											<Text style={[IncidentStyle.cameraTextStyle]}>
												{MESSAGE.videoMsg1Line4}
											</Text>
											<View
												style={{
													borderBottomWidth: 1,
													borderColor: "#FFF",
												}}
											>
												<Text style={[IncidentStyle.placeholderQus]}>
													{MESSAGE.videoPlaseholder1Q3}
												</Text>
											</View>
										</>
									)}
								</View>
							) : videoScr === "3" ? (
								<View>
									{dateNInjuredText &&
									isMatchWithDateNInjured.test(dateNInjuredText) ? (
										<Text
											style={[
												IncidentStyle.cameraTextStyle,
												{ color: "green" },
											]}
										>{`The incident occurred on ${incidentDate} there were ${peopleInjured} people injured in the incident at the time of reporting.`}</Text>
									) : dateNInjuredText &&
									  !isMatchWithDateNInjured.test(dateNInjuredText) ? (
										<View>
											<Text
												style={[
													IncidentStyle.cameraTextStyle,
													{ color: "red" },
												]}
											>
												{dateNInjuredText}
											</Text>
											<View>
												<Text style={[IncidentStyle.cameraTextStyle]}>
													Voice Need:{" "}
												</Text>
												<View style={[CommonStyles.directionRowCenter]}>
													<Text
														style={[
															IncidentStyle.cameraTextStyle,
															{ flex: 0.65 },
														]}
													>
														{MESSAGE.videoMsg1Line5}
													</Text>
													<View
														style={{
															borderBottomWidth: 1,
															borderColor: "#FFF",
															marginLeft: 10,
															flex: 0.35,
														}}
													>
														<Text style={[IncidentStyle.placeholderQus]}>
															{MESSAGE.videoPlaseholder1Q4}
														</Text>
													</View>
												</View>

												<View style={[CommonStyles.directionRowCenter]}>
													<Text style={[IncidentStyle.cameraTextStyle, {}]}>
														{MESSAGE.videoMsg1Line6}
													</Text>
													<View
														style={{
															borderBottomWidth: 1,
															borderColor: "#FFF",
															marginHorizontal: 10,
															flex: 0.3,
														}}
													>
														<Text style={[IncidentStyle.placeholderQus]}>
															{MESSAGE.videoPlaseholder1Q5}
														</Text>
													</View>
													<Text
														style={[
															IncidentStyle.cameraTextStyle,
															{ flex: 0.7 },
														]}
													>
														{MESSAGE.videoMsg1Line7}
													</Text>
												</View>

												<Text style={[IncidentStyle.cameraTextStyle]}>
													{MESSAGE.videoMsg1Line8}
												</Text>
											</View>
										</View>
									) : (
										<View>
											<View style={[CommonStyles.directionRowCenter]}>
												<Text
													style={[
														IncidentStyle.cameraTextStyle,
														{ flex: 0.65 },
													]}
												>
													{MESSAGE.videoMsg1Line5}
												</Text>
												<View
													style={{
														borderBottomWidth: 1,
														borderColor: "#FFF",
														marginLeft: 10,
														flex: 0.35,
													}}
												>
													<Text style={[IncidentStyle.placeholderQus]}>
														{MESSAGE.videoPlaseholder1Q4}
													</Text>
												</View>
											</View>

											<View style={[CommonStyles.directionRowCenter]}>
												<Text style={[IncidentStyle.cameraTextStyle, {}]}>
													{MESSAGE.videoMsg1Line6}
												</Text>
												<View
													style={{
														borderBottomWidth: 1,
														borderColor: "#FFF",
														marginHorizontal: 10,
														flex: 0.3,
													}}
												>
													<Text style={[IncidentStyle.placeholderQus]}>
														{MESSAGE.videoPlaseholder1Q5}
													</Text>
												</View>
												<Text
													style={[IncidentStyle.cameraTextStyle, { flex: 0.7 }]}
												>
													{MESSAGE.videoMsg1Line7}
												</Text>
											</View>

											<Text style={[IncidentStyle.cameraTextStyle]}>
												{MESSAGE.videoMsg1Line8}
											</Text>
										</View>
									)}
								</View>
							) : null}
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
									source={{ uri: global.firstVideo }}
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
							<Text style={[IncidentStyle.cameraLabel]}>{"First"}</Text>
							<Text style={[IncidentStyle.cameraName]}>{" Video"}</Text>
						</View>
						<Text
							style={[
								IncidentStyle.messageStyle,
								{ ...LayoutStyle.marginTop10 },
							]}
						>
							{
								"Read the teleprompter to help us gather the necessary information for your claim."
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

export default FirstVideoScreen;
