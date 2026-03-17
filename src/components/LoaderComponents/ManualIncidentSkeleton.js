import React from "react";
import { View, StyleSheet } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import Colors from "../../styles/Colors";
import { deviceWidth } from "../../utils/DeviceInfo";

const ManualIncidentSkeleton = ({ height, width, backgroundColor }) => {
	return (
		<View style={styles.container}>
			<SkeletonPlaceholder
				speed={800}
				backgroundColor={backgroundColor ? backgroundColor : Colors.darkBGColor}
				highlightColor={"#304F6B"}
			>
				<SkeletonPlaceholder.Item
					width={width ? width : deviceWidth / 1.2}
					height={height ? height : 60}
					borderRadius={8}
				/>
			</SkeletonPlaceholder>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		marginBottom: 10,
		alignItems: "flex-start",
		paddingHorizontal: 10,
		width: "100%",
	},
});

export default ManualIncidentSkeleton;
