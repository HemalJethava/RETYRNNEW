import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Icons } from ".";
import Colors from "../styles/Colors";
import ComponentStyles from "../styles/ComponentStyles";

const AnswerOptions = ({
	keyIndex,
	selectIcon,
	isSelected,
	isIcon,
	iconName,
	iconSetName,
	iconColor,
	iconSize,
	optionLabel,
	onPress,
}) => {
	return (
		<TouchableOpacity key={keyIndex} onPress={onPress}>
			<View
				style={[
					ComponentStyles.optionContainer,
					isSelected && { backgroundColor: Colors.secondary },
				]}
			>
				<View style={[ComponentStyles.iconTextcontainer]}>
					{isIcon && (
						<Icons
							iconName={iconName}
							iconSetName={iconSetName}
							iconColor={isSelected ? iconColor : Colors.labelGray}
							iconSize={iconSize}
						/>
					)}
					<Text style={[ComponentStyles.answerText]}>{optionLabel}</Text>
				</View>
				{isSelected ? (
					<Icons
						iconName={"check-circle-outline"}
						iconSetName={"MaterialCommunityIcons"}
						iconColor={Colors.iconWhite}
						iconSize={20}
					/>
				) : null}
			</View>
		</TouchableOpacity>
	);
};

export default AnswerOptions;
