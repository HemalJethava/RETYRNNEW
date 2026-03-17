import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { deviceWidth } from "../../utils/DeviceInfo";

const ListSkeleton = ({ height, width, backgroundColor, borderRadius }) => {
	return (
		<View style={styles.container}>
			<SkeletonPlaceholder
				speed={800}
				backgroundColor={backgroundColor ? backgroundColor : "#E1E9EE"}
			>
				<SkeletonPlaceholder.Item
					width={width ? width : deviceWidth - 20}
					height={height ? height : 60}
					borderRadius={borderRadius ? borderRadius : 8}
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

export default ListSkeleton;
