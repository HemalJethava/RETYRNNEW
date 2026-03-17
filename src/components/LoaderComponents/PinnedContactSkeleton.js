import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import Colors from "../../styles/Colors";

const PinnedContactSkeleton = ({ height, width, backgroundColor }) => {
	return (
		<View style={styles.container}>
			<SkeletonPlaceholder
				speed={800}
				backgroundColor={
					backgroundColor ? backgroundColor : Colors.labelDarkGray
				}
			>
				<SkeletonPlaceholder.Item
					width={width ? width : 50}
					height={height ? height : 50}
					borderRadius={25}
				/>
			</SkeletonPlaceholder>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		top: 5,
		paddingHorizontal: 5,
	},
});

export default PinnedContactSkeleton;
