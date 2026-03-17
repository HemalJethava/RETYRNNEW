import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { deviceHeight, deviceWidth } from "../../utils/DeviceInfo";

const VideoLoading = ({ height, width, backgroundColor }) => {
	return (
		<SkeletonPlaceholder
			speed={800}
			backgroundColor={backgroundColor ? backgroundColor : "#E1E9EE"}
		>
			<View style={styles.container}>
				<SkeletonPlaceholder.Item
					width={"100%"}
					height={"100%"}
					borderRadius={8}
				/>
			</View>
		</SkeletonPlaceholder>
	);
};

const styles = StyleSheet.create({
	container: {
		height: deviceHeight / 4,
		width: deviceWidth,
		backgroundColor: "#f5f5f5",
		borderRadius: 10,
		overflow: "hidden",
	},
});

export default VideoLoading;
