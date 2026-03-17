import React from "react";
import { View, StyleSheet } from "react-native";
import Colors from "../styles/Colors";

const ProgressBar = ({ progress }) => {
	return (
		<View style={styles.container}>
			<View style={[styles.filler, { width: `${progress * 1000}%` }]} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		height: 10,
		width: "100%",
		backgroundColor: "#e0e0e0",
		borderRadius: 5,
		overflow: "hidden",
	},
	filler: {
		height: "100%",
		backgroundColor: Colors.secondary,
		borderRadius: 5,
	},
});

export default ProgressBar;
