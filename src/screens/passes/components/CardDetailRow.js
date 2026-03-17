import React from "react";
import { View, Text, Linking } from "react-native";
import PassesStyle from "../../../styles/PassesStyle";
import Colors from "../../../styles/Colors";

export const CardDetailRow = ({
	code,
	title1,
	detail1,
	onPressDetail1,
	title2,
	detail2,
	onPressDetail2,
	isMore,
	title3,
	detail3,
	onPressDetail3,
	isLast,
}) => (
	<View
		style={[
			PassesStyle.relateSection,
			{
				borderBottomColor: code,
				borderBottomWidth: isLast ? 0 : 0.7,
			},
		]}
	>
		{detail1 && (
			<View style={[PassesStyle.rowBetween]}>
				<Text style={{ color: Colors.inputBlackText }}>{`${title1}: `}</Text>
				<Text
					numberOfLines={1}
					style={{ color: code, width: "60%", textAlign: "right" }}
					onPress={onPressDetail1}
				>
					{detail1}
				</Text>
			</View>
		)}
		{detail2 && (
			<View style={[PassesStyle.rowBetween]}>
				<Text style={{ color: Colors.inputBlackText }}>{`${title2}: `}</Text>
				<Text
					numberOfLines={1}
					style={{ color: code, width: "60%", textAlign: "right" }}
					onPress={onPressDetail2}
				>
					{detail2}
				</Text>
			</View>
		)}
		{isMore && detail3 && (
			<View style={[PassesStyle.rowBetween]}>
				<Text style={{ color: Colors.inputBlackText }}>{`${title3}: `}</Text>
				<Text
					numberOfLines={1}
					style={{ color: code, width: "60%", textAlign: "right" }}
					onPress={onPressDetail3}
				>
					{detail3}
				</Text>
			</View>
		)}
	</View>
);
