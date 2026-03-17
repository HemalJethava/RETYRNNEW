import React from "react";
import { View, StyleSheet } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import Colors from "../../styles/Colors";
import Icons from "../Icons";

const ChatMessageSkeleton = ({ isSender }) => {
	return (
		<View
			style={[styles.container, isSender ? styles.sender : styles.receiver]}
		>
			<View
				style={[
					styles.imageBubble,
					{
						alignItems: isSender ? "flex-end" : "flex-start",
						backgroundColor: isSender ? Colors.primary : Colors.lightGrayBG,
						padding: 10,
						borderRadius: 10,
						justifyContent: "center",
					},
				]}
			>
				<SkeletonPlaceholder
					speed={1000}
					backgroundColor={isSender ? "#b6bcc4" : "#ccc"}
				>
					<SkeletonPlaceholder.Item width={50} height={8} borderRadius={2} />
					<SkeletonPlaceholder.Item
						width={90}
						height={8}
						borderRadius={2}
						marginTop={10}
					/>
				</SkeletonPlaceholder>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		marginBottom: 10,
		alignItems: "flex-start",
		paddingHorizontal: 10,
	},
	sender: {
		justifyContent: "flex-end",
	},
	receiver: {
		justifyContent: "flex-start",
	},
	imageBubble: {
		marginTop: 5,
	},
});

export default ChatMessageSkeleton;
