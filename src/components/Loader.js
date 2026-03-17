import React, { useEffect, useState } from "react";
import { View, Modal, Text } from "react-native";
import FastImage from "react-native-fast-image";
import ComponentStyles from "../styles/ComponentStyles";

const Loader = ({ show }) => {
	return (
		<Modal
			animationType="fade"
			transparent={true}
			visible={show}
			presentationStyle="overFullScreen"
		>
			<View style={[ComponentStyles.loaderHorizontal]}>
				<View style={[ComponentStyles.loaderView]}>
					<FastImage
						style={[ComponentStyles.loaderIcon]}
						source={require("../assets/images/svg/loading.gif")}
						resizeMode={FastImage.resizeMode.contain}
					/>
					<Text style={[ComponentStyles.loaderText]}>{"Loading ..."}</Text>
				</View>
			</View>
		</Modal>
	);
};

export default Loader;
