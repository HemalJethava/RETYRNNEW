import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { deviceWidth } from "../../utils/DeviceInfo";

const CheckupDetailSkeleton = ({ height, width, backgroundColor }) => {
	return (
		<View style={styles.container}>
			<SkeletonPlaceholder
				speed={800}
				backgroundColor={backgroundColor ? backgroundColor : "#E1E9EE"}
			>
				<View style={{ marginVertical: 10 }}>
					<SkeletonPlaceholder width={120} height={26} borderRadius={5} />
				</View>

				<SkeletonPlaceholder.Item
					width={width ? width : deviceWidth - 40}
					height={height ? height : 120}
					borderRadius={8}
				/>
			</SkeletonPlaceholder>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "row",
		marginBottom: 10,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 10,
		width: "100%",
	},
});

export default CheckupDetailSkeleton;
