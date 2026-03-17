import { View, TouchableOpacity } from "react-native";
import React from "react";
import ComponentStyles from "../styles/ComponentStyles";
import Icons from "./Icons";
import Colors from "../styles/Colors";

const RadioButton = ({ isRadioSelected, mainRadioStyle, onPress }) => {
	return (
		<TouchableOpacity
			style={[ComponentStyles.mainFlex06, { mainRadioStyle }]}
			onPress={onPress}
		>
			<View>
				{isRadioSelected ? (
					<Icons
						iconName={"circle-dot"}
						iconSetName={"FontAwesome6"}
						iconColor={Colors.secondary}
						iconSize={18}
					/>
				) : (
					<Icons
						iconName={"circle-thin"}
						iconSetName={"FontAwesome"}
						iconColor={Colors.secondary}
						iconSize={20}
					/>
				)}
			</View>
		</TouchableOpacity>
	);
};

export default RadioButton;
