import React from "react";
import { View, StyleSheet, Modal } from "react-native";
import Colors from "../../../styles/Colors";
import { deviceHeight, deviceWidth } from "../../../utils/DeviceInfo";
import VideoControls from "react-native-video-controls";

export const FullScreenVideoPlayer = ({ show, onHide, data }) => {
	const onRequestClose = () => {
		onHide();
	};
	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={show}
			onRequestClose={onRequestClose}
		>
			<View
				style={[
					styles.container,
					{ paddingTop: Platform.OS === "ios" ? 50 : 0 },
				]}
			>
				<VideoControls
					source={{ uri: data?.video_path }}
					style={styles.fullscreenVideo}
					resizeMode="contain"
					autoplay={false}
					paused={false}
					disableBack={false}
					tapAnywhereToPause={true}
					playWhenInactive={true}
					disableFullscreen={true}
					disableSeekbar={false}
					disableVolume={false}
					disableTimer={false}
					onBack={onRequestClose}
				/>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: {
		width: deviceWidth,
		height: deviceHeight,
		backgroundColor: Colors.white,
		position: "absolute",
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
	},
});
