import React from "react";
import { View, StyleSheet } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

const CrashDetetionLoader = ({}) => {
	return (
		<View style={styles.container}>
			<View style={{ width: "100%" }}>
				<SkeletonPlaceholder borderRadius={4}>
					<SkeletonPlaceholder.Item height={180} />
				</SkeletonPlaceholder>
			</View>
			<View style={{ marginVertical: 10, width: "100%" }}>
				<SkeletonPlaceholder borderRadius={4}>
					<SkeletonPlaceholder.Item height={40} />
				</SkeletonPlaceholder>
			</View>
			<View style={{ width: "100%" }}>
				<SkeletonPlaceholder borderRadius={4}>
					<SkeletonPlaceholder.Item
						flexDirection={"row"}
						alignItems={"center"}
						justifyContent={"center"}
					>
						<SkeletonPlaceholder.Item
							width={40}
							height={40}
							borderRadius={20}
						/>
						<View style={{ width: "85%" }}>
							<SkeletonPlaceholder.Item marginLeft={20}>
								<SkeletonPlaceholder.Item height={40} />
							</SkeletonPlaceholder.Item>
						</View>
					</SkeletonPlaceholder.Item>
				</SkeletonPlaceholder>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
	},
});

export default CrashDetetionLoader;
