import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Icons } from ".";
import ComponentStyles from "../styles/ComponentStyles";

const TextIcon = ({
	textName,
	iconName,
	iconSetName,
	iconSize,
	iconColor,
	textColor,
	onPress,
	isOnPress,
	disabled,
	textIconMainStyle,
	textStyle,
}) => {
	return (
		<View style={[ComponentStyles.subTitleContainer, textIconMainStyle]}>
			<Text
				style={[ComponentStyles.subTitles, textStyle, { color: textColor }]}
			>
				{textName}
			</Text>
			<TouchableOpacity
				style={{ opacity: disabled ? 0.5 : 1 }}
				disabled={disabled}
				onPress={isOnPress ? onPress : null}
			>
				<Icons
					iconSetName={iconSetName}
					iconName={iconName}
					iconColor={iconColor}
					iconSize={iconSize}
				/>
			</TouchableOpacity>
		</View>
	);
};

export default TextIcon;
