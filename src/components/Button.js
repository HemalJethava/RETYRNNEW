import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import ComponentStyles from "../styles/ComponentStyles";
import Colors from "../styles/Colors";

const Button = ({
	btnName,
	btnColor,
	btnBorderColor,
	onPress,
	isBtnActive,
	btnWidth,
	btnLabelColor,
	props,
	disabled,
}) => {
	return (
		<TouchableOpacity disabled={disabled ? true : false} onPress={onPress}>
			<View
				style={[
					ComponentStyles.btnContainer,
					{
						backgroundColor: disabled ? Colors.disableBtn : btnColor,
						borderColor: btnBorderColor,
						borderWidth: btnWidth,
					},
				]}
			>
				<Text style={[ComponentStyles.btnLabel, { color: btnLabelColor }]}>
					{btnName}
				</Text>
			</View>
		</TouchableOpacity>
	);
};
export default Button;
