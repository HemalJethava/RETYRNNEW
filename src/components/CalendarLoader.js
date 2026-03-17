import { View, Modal, Text, ActivityIndicator } from "react-native";
import React from "react";
import { Colors } from "react-native/Libraries/NewAppScreen";
import LayoutStyle from "../styles/LayoutStyle";

const CalendarLoader = ({ loaderTeaxt }) => {
	return (
		<View
			style={[
				{
					justifyContent: "center",
					alignItems: "center",
					height: 300,
					marginTop: 45,
				},
			]}
		>
			<View
				style={{
					...LayoutStyle.paddingVertical20,
					...LayoutStyle.paddingHorizontal20,
					alignItems: "center",
				}}
			>
				<ActivityIndicator size={"large"} color={Colors.primary} />
			</View>
		</View>
	);
};

export default CalendarLoader;
