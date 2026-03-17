import { View, Text } from "react-native";
import React from "react";
import ComponentStyles from "../styles/ComponentStyles";
import Colors from "../styles/Colors";

const KeyValue = ({
	keyLabel,
	valueLabel,
	keyColor,
	borderColor,
	valueColor,
	keyTextStyle,
	valueTextStyle,
	borderBottomWidth,
}) => {
	return (
		<View
			style={[
				ComponentStyles.keyContainer,
				{
					borderColor: borderColor,
					borderBottomWidth: borderBottomWidth === "no" ? 0 : 0.5,
				},
			]}
		>
			<Text
				style={[ComponentStyles.keyStyle, keyTextStyle, { color: keyColor }]}
			>
				{keyLabel}
			</Text>
			<Text
				style={[
					ComponentStyles.valueStyle,
					valueTextStyle,
					{
						color: valueColor ? valueColor : Colors.labelBlack,
					},
				]}
			>
				{valueLabel}
			</Text>
		</View>
	);
};

export default KeyValue;
