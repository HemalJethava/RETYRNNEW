import { View, Text } from "react-native";
import React from "react";
import ComponentStyles from "../styles/ComponentStyles";

const ValidationText = ({ validationMessage, isValidationShow }) => {
	return (
		<View>
			{isValidationShow && (
				<Text style={[ComponentStyles.validationMsg]}>{validationMessage}</Text>
			)}
		</View>
	);
};

export default ValidationText;
