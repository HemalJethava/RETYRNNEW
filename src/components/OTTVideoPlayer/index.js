import React, { useState, useRef, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
	StatusBar,
	ActivityIndicator,
	Modal,
	Animated,
	BackHandler,
	PanResponder,
} from "react-native";
import Video from "react-native-video";
import Orientation from "react-native-orientation-locker";
import Slider from "@react-native-community/slider";
import Icons from "../Icons";
import Colors from "../../styles/Colors";
import LayoutStyle from "../../styles/LayoutStyle";
import SystemSetting from "react-native-system-setting";
import DeviceBrightness from "@adrianso/react-native-device-brightness";
import { styles } from "./styles";

const { width } = Dimensions.get("window");

export const OTTVideoPlayer = ({
	videoUrl,
	title,
	onBack,
	onChangeFullScreen,
}) => {
	const videoRef = useRef(null);
	const [paused, setPaused] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [showControls, setShowControls] = useState(true);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [buffering, setBuffering] = useState(false);
	const [playbackRate, setPlaybackRate] = useState(1.0);
	const [selectedQuality, setSelectedQuality] = useState("Auto");
	const [showQualityMenu, setShowQualityMenu] = useState(false);
	const [showSpeedMenu, setShowSpeedMenu] = useState(false);
	const [seeking, setSeeking] = useState(false);
	const [shouldSeek, setShouldSeek] = useState(false);

	const [showForwardAnim, setShowForwardAnim] = useState(false);
	const [showBackwardAnim, setShowBackwardAnim] = useState(false);

	const [volume, setVolume] = useState(0.5);
	const [isMuted, setIsMuted] = useState(false);
	const [showVolumeBar, setShowVolumeBar] = useState(false);

	const [brightness, setBrightness] = useState(1.0);
	const [showBrightnessBar, setShowBrightnessBar] = useState(false);

	const volumeRef = useRef(volume);
	const brightnessRef = useRef(brightness);
	const volumeAnim = useRef(new Animated.Value(0)).current;
	const brightnessAnim = useRef(new Animated.Value(0)).current;

	const controlsTimeout = useRef(null);
	const controlsOpacity = useRef(new Animated.Value(1)).current;
	const lastTap = useRef(null);

	const qualityOptions = ["Auto", "1080p", "720p", "480p", "360p"];
	const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

	useEffect(() => {
		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			() => {
				if (isFullscreen) {
					exitFullscreen();
					return true;
				}
				return false;
			}
		);
		return () => backHandler.remove();
	}, [isFullscreen]);

	useEffect(() => {
		if (isFullscreen) {
			StatusBar.setHidden(true, "fade");
		} else {
			StatusBar.setHidden(false, "fade");
		}
		onChangeFullScreen(isFullscreen);
	}, [isFullscreen]);

	useEffect(() => {
		volumeRef.current = volume;
	}, [volume]);

	useEffect(() => {
		brightnessRef.current = brightness;
	}, [brightness]);

	useEffect(() => {
		SystemSetting.getVolume().then((v) => {
			setVolume(v);
			volumeRef.current = v;
		});
		DeviceBrightness.getBrightnessLevel()
			.then((b) => {
				setBrightness(b);
				brightnessRef.current = b;
			})
			.catch(console.warn);
	}, []);

	useEffect(() => {
		if (showControls) resetControlsTimer();
	}, [showControls, paused]);

	const panResponder = useRef(
		PanResponder.create({
			onMoveShouldSetPanResponder: (_, gestureState) =>
				Math.abs(gestureState.dy) > 15,
			onPanResponderMove: (_, gestureState) => {
				const isLeftSide = gestureState.x0 < width / 2;
				const screenHeight = Dimensions.get("window").height;
				let delta = -gestureState.dy / (screenHeight * 2.2);
				if (Math.abs(delta) < 0.002) return;
				delta = Math.sign(delta) * Math.pow(Math.abs(delta), 0.8);
				if (isLeftSide) {
					let newVolume = Math.min(Math.max(volumeRef.current + delta, 0), 1);
					SystemSetting.setVolume(newVolume);
					setVolume(newVolume);
					setShowVolumeBar(true);
					animateBar(volumeAnim);
				} else {
					let newBrightness = Math.min(
						Math.max(brightnessRef.current + delta, 0),
						1
					);
					DeviceBrightness.setBrightnessLevel(newBrightness);
					setBrightness(newBrightness);
					setShowBrightnessBar(true);
					animateBar(brightnessAnim);
				}
			},
			onPanResponderRelease: () => {
				setTimeout(() => {
					setShowVolumeBar(false);
					setShowBrightnessBar(false);
				}, 1000);
			},
		})
	).current;

	const animateBar = (animRef) => {
		Animated.sequence([
			Animated.timing(animRef, {
				toValue: 1,
				duration: 150,
				useNativeDriver: true,
			}),
			Animated.timing(animRef, {
				toValue: 0,
				duration: 800,
				delay: 400,
				useNativeDriver: true,
			}),
		]).start();
	};
	const resetControlsTimer = () => {
		if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
		if (!paused) {
			controlsTimeout.current = setTimeout(() => {
				Animated.timing(controlsOpacity, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true,
				}).start(() => setShowControls(false));
			}, 4000);
		}
	};
	const toggleControls = () => {
		if (showControls) setShowControls(false);
		else {
			setShowControls(true);
			Animated.timing(controlsOpacity, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}).start();
			resetControlsTimer();
		}
	};
	const onLoad = (data) => {
		setDuration(data.duration);
		setLoading(false);

		if (shouldSeek && currentTime > 0) {
			videoRef.current?.seek(currentTime);
			setShouldSeek(false);
		}
	};
	const onProgress = (data) => !seeking && setCurrentTime(data.currentTime);
	const onBuffer = ({ isBuffering }) => setBuffering(isBuffering);
	const onSeek = (time) => {
		videoRef.current?.seek(time);
		setCurrentTime(time);
		setSeeking(false);
	};
	const togglePlayPause = () => setPaused((p) => !p);
	const handleTap = (position) => {
		const now = Date.now();
		const DOUBLE_PRESS_DELAY = 300;
		if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
			if (position === "left") {
				skipBackward();
				setShowBackwardAnim(true);
				setTimeout(() => setShowBackwardAnim(false), 500);
			} else {
				skipForward();
				setShowForwardAnim(true);
				setTimeout(() => setShowForwardAnim(false), 500);
			}
			lastTap.current = null;
		} else {
			lastTap.current = now;
			setTimeout(() => {
				if (lastTap.current) {
					toggleControls();
					lastTap.current = null;
				}
			}, DOUBLE_PRESS_DELAY);
		}
	};
	const skipForward = () => {
		const newTime = Math.min(currentTime + 10, duration);
		videoRef.current?.seek(newTime);
		setCurrentTime(newTime);
	};
	const skipBackward = () => {
		const newTime = Math.max(currentTime - 10, 0);
		videoRef.current?.seek(newTime);
		setCurrentTime(newTime);
	};
	const toggleMute = () => setIsMuted(!isMuted);
	const formatTime = (s) => {
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec < 10 ? "0" : ""}${sec}`;
	};
	const enterFullscreen = () => {
		setIsFullscreen(true);
		setShouldSeek(true);
		Orientation.lockToLandscape();
	};
	const exitFullscreen = () => {
		setIsFullscreen(false);
		setShouldSeek(true);
		Orientation.lockToPortrait();
	};

	const renderMenu = (
		visible,
		setVisible,
		options,
		selected,
		onSelect,
		title,
		suffix = ""
	) => (
		<Modal
			transparent
			visible={visible}
			animationType="fade"
			supportedOrientations={["landscape"]}
		>
			<TouchableOpacity
				style={styles.modalOverlay}
				activeOpacity={1}
				onPress={() => setVisible(false)}
			>
				<View style={styles.menuContainer}>
					<Text style={styles.menuTitle}>{title}</Text>
					{options.map((opt) => (
						<TouchableOpacity
							key={opt}
							style={styles.menuItem}
							onPress={() => {
								onSelect(opt);
								setVisible(false);
							}}
						>
							<Text
								style={[
									styles.menuItemText,
									selected === opt && styles.menuItemSelected,
								]}
							>
								{opt}
								{suffix}
							</Text>
							{selected === opt && (
								<Icons
									iconSetName="MaterialIcons"
									iconName="check"
									iconSize={20}
									iconColor={Colors.white}
								/>
							)}
						</TouchableOpacity>
					))}
				</View>
			</TouchableOpacity>
		</Modal>
	);

	const videoPlayerContent = (
		<View style={[styles.videoWrapper]} {...panResponder.panHandlers}>
			<Video
				ref={videoRef}
				source={{ uri: videoUrl }}
				style={styles.video}
				paused={paused}
				rate={playbackRate}
				volume={isMuted ? 0 : volume}
				onLoad={onLoad}
				onProgress={onProgress}
				onBuffer={onBuffer}
				resizeMode={isFullscreen ? "contain" : "cover"}
				ignoreSilentSwitch="ignore"
				bufferConfig={{
					minBufferMs: 1500,
					maxBufferMs: 5000,
					bufferForPlaybackMs: 500,
					bufferForPlaybackAfterRebufferMs: 1000,
				}}
			/>
			<TouchableOpacity
				activeOpacity={1}
				style={StyleSheet.absoluteFillObject}
				onPress={toggleControls}
			/>
			{(loading || buffering) && (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={Colors.white} />
				</View>
			)}
			{showVolumeBar && (
				<Animated.View
					style={[
						styles.volumeGestureOverlay,
						{ left: 30, opacity: volumeAnim },
					]}
				>
					<Icons
						iconSetName="MaterialIcons"
						iconName={
							volume > 0.5
								? "volume-up"
								: volume > 0
								? "volume-down"
								: "volume-off"
						}
						iconSize={30}
						iconColor={Colors.white}
					/>
					<View style={styles.gestureBarContainer}>
						<View
							style={[styles.gestureBarFill, { height: `${volume * 100}%` }]}
						/>
					</View>
				</Animated.View>
			)}
			{showBrightnessBar && (
				<Animated.View
					style={[
						styles.gestureOverlay,
						{ right: 30, opacity: brightnessAnim },
					]}
				>
					<Icons
						iconSetName="MaterialIcons"
						iconName="brightness-6"
						iconSize={16}
						iconColor={Colors.white}
					/>
					<View style={styles.gestureBarContainer}>
						<View
							style={[
								styles.gestureBarFill,
								{ height: `${brightness * 100}%` },
							]}
						/>
					</View>
				</Animated.View>
			)}
			{showControls && (
				<Animated.View
					style={[styles.controlsOverlay, { opacity: controlsOpacity }]}
				>
					<View style={styles.topControls}>
						<TouchableOpacity onPress={isFullscreen ? exitFullscreen : onBack}>
							<Icons
								iconSetName="MaterialIcons"
								iconName="arrow-back"
								iconSize={26}
								iconColor={Colors.white}
							/>
						</TouchableOpacity>
						<Text style={styles.videoTitle} numberOfLines={1}>
							{title ?? ""}
						</Text>
						{/* <TouchableOpacity onPress={() => setShowQualityMenu(true)}>
							<Icons
								iconSetName="MaterialIcons"
								iconName="settings"
								iconSize={24}
								iconColor={Colors.white}
							/>
						</TouchableOpacity> */}
					</View>

					<View style={[styles.centerControls, { width: "100%" }]}>
						<TouchableOpacity
							style={[styles.leftHalf]}
							activeOpacity={1}
							onPress={() => handleTap("left")}
						>
							{showBackwardAnim && (
								<Icons
									iconSetName="MaterialIcons"
									iconName="keyboard-double-arrow-left"
									iconSize={28}
									iconColor={Colors.white}
								/>
							)}
						</TouchableOpacity>
						<TouchableOpacity onPress={togglePlayPause}>
							<Icons
								iconSetName="MaterialIcons"
								iconName={paused ? "play-arrow" : "pause"}
								iconSize={38}
								iconColor={Colors.white}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.rightHalf]}
							activeOpacity={1}
							onPress={() => handleTap("right")}
						>
							{showForwardAnim && (
								<Icons
									iconSetName="MaterialIcons"
									iconName="keyboard-double-arrow-right"
									iconSize={28}
									iconColor={Colors.white}
								/>
							)}
						</TouchableOpacity>
					</View>

					<View style={styles.bottomControls}>
						<Text style={styles.timeText}>{formatTime(currentTime)}</Text>
						<Slider
							style={{
								flex: 1,
								marginHorizontal: 8,
							}}
							minimumValue={0}
							maximumValue={duration}
							value={currentTime}
							onValueChange={(v) => {
								setCurrentTime(v);
								setSeeking(true);
							}}
							onSlidingComplete={onSeek}
							minimumTrackTintColor="#E50914"
							maximumTrackTintColor="#666"
							thumbTintColor="#E50914"
						/>
						<Text style={styles.timeText}>{formatTime(duration)}</Text>
						<TouchableOpacity onPress={toggleMute} style={{ marginLeft: 8 }}>
							<Icons
								iconSetName="MaterialIcons"
								iconName={isMuted ? "volume-off" : "volume-up"}
								iconSize={22}
								iconColor={Colors.white}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => setShowSpeedMenu(true)}
							style={LayoutStyle.marginLeft10}
						>
							<Text style={styles.speedText}>{playbackRate}x</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={!isFullscreen ? enterFullscreen : exitFullscreen}
							style={LayoutStyle.marginLeft10}
						>
							<Icons
								iconSetName="MaterialIcons"
								iconName={!isFullscreen ? "fullscreen" : "fullscreen-exit"}
								iconSize={24}
								iconColor={Colors.white}
							/>
						</TouchableOpacity>
					</View>
				</Animated.View>
			)}
		</View>
	);

	return (
		<View style={styles.container}>
			<StatusBar hidden={isFullscreen} />
			{!isFullscreen && (
				<>
					{videoPlayerContent}
					{/* {renderMenu(
						showQualityMenu,
						setShowQualityMenu,
						qualityOptions,
						selectedQuality,
						setSelectedQuality,
						"Quality"
					)} */}
					{renderMenu(
						showSpeedMenu,
						setShowSpeedMenu,
						speedOptions,
						playbackRate,
						setPlaybackRate,
						"Playback Speed",
						"x"
					)}
				</>
			)}
			<Modal
				visible={isFullscreen}
				supportedOrientations={["landscape"]}
				animationType="slide"
			>
				<View style={{ flex: 1, backgroundColor: "black" }}>
					{videoPlayerContent}
					{/* {renderMenu(
						showQualityMenu,
						setShowQualityMenu,
						qualityOptions,
						selectedQuality,
						setSelectedQuality,
						"Quality"
					)} */}
					{renderMenu(
						showSpeedMenu,
						setShowSpeedMenu,
						speedOptions,
						playbackRate,
						setPlaybackRate,
						"Playback Speed",
						"x"
					)}
				</View>
			</Modal>
		</View>
	);
};

// Import
// const [isFullScreenVideo, setIsFullScreenVideo] = useState(false);
// <View>
// 	<StatusBar hidden={isFullScreenVideo} />
// 	<OTTVideoPlayer
// 		videoUrl={{videoUrl}}
// 		title=""
// 		onBack={gotoBack}
// 		onChangeFullScreen={(isFullScreen) => {
// 			setIsFullScreenVideo(isFullScreen);
// 		}}
// 	/>
// </View>
