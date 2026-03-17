import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Reanimated, {
	useSharedValue,
	withSpring,
	useAnimatedStyle,
} from "react-native-reanimated";
import { Icons } from "../../../components";
import Colors from "../../../styles/Colors";
import ChatStyle from "../../../styles/ChatStyle";
import FastImage from "react-native-fast-image";
import { PassesColors } from "../../../json/PassesColors";
import FontFamily from "../../../assets/fonts/FontFamily";

export const ProfilePopup = ({
	show,
	onHide,
	position = { x: 100, y: 100 },
	data,
	type,
	onPressMsg,
	onPressCall,
	onPressInfo,
}) => {
	const scale = useSharedValue(0);
	const opacity = useSharedValue(0);

	useEffect(() => {
		if (show) {
			scale.value = withSpring(1);
			opacity.value = withSpring(1);
		} else {
			scale.value = withSpring(0);
			opacity.value = withSpring(0);
		}
	}, [show]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
		opacity: opacity.value,
		position: "absolute",
		top: position?.y - 250,
		left: position?.x + 30,
		padding: 10,
		borderRadius: 8,
	}));

	var string = data?.name ? data?.name : "";
	const randomColor = Math.floor(Math.random() * 6);
	const colorName = PassesColors[randomColor].color;

	if (!show) return null;

	return (
		<View style={styles.overlay}>
			<TouchableOpacity
				activeOpacity={1}
				style={styles.background}
				onPress={onHide}
			/>
			<Reanimated.View style={[styles.popup, animatedStyle]}>
				{data?.photo_path ? (
					<FastImage
						style={[styles.profileImg]}
						source={{
							uri: data?.photo_path,
						}}
						resizeMode={FastImage.resizeMode.cover}
					/>
				) : (
					<View
						style={[
							styles.profileImg,
							{
								backgroundColor: colorName,
							},
						]}
					>
						<Text
							style={[
								ChatStyle.textColor,
								{ fontSize: 80, fontFamily: FontFamily.PoppinsRegular },
							]}
						>
							{string.charAt(0).toUpperCase()}
						</Text>
					</View>
				)}
				<View style={[styles.optionRow]}>
					<TouchableOpacity
						style={{
							opacity: type === "profile" && !data?.app_user_id ? 0.5 : 1,
						}}
						disabled={type === "profile" && !data?.app_user_id}
						onPress={() => onPressMsg(data)}
					>
						<Icons
							iconSetName={"MaterialCommunityIcons"}
							iconName={"message-text-outline"}
							iconSize={24}
							iconColor={Colors.white}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => onPressCall(data)}>
						<Icons
							iconSetName={"MaterialCommunityIcons"}
							iconName={"phone-outline"}
							iconSize={24}
							iconColor={Colors.white}
						/>
					</TouchableOpacity>
					<TouchableOpacity
						style={{
							opacity: type === "profile" && !data?.app_user_id ? 0.5 : 1,
						}}
						disabled={type === "profile" && !data?.app_user_id}
						onPress={() => onPressInfo(data)}
					>
						<Icons
							iconSetName={"MaterialCommunityIcons"}
							iconName={"information-outline"}
							iconSize={24}
							iconColor={Colors.white}
						/>
					</TouchableOpacity>
				</View>
			</Reanimated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 999,
	},
	background: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.85)",
	},
	popup: {
		position: "absolute",
	},
	profileImg: {
		height: 200,
		width: 200,
		borderRadius: 7,
		justifyContent: "center",
	},
	optionRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: 20,
		backgroundColor: "#38393e",
		padding: 16,
		borderRadius: 25,
		width: 160,
	},
});
