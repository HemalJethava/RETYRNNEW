import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";
import ComponentStyles from "../../../styles/ComponentStyles";
import Colors from "../../../styles/Colors";
import CommonStyles from "../../../styles/CommonStyles";
import { Icons } from "../../../components";
import IncidentStyle from "../../../styles/IncidentStyles";

const SubKeyValue = ({
	keyLabel,
	valueLabel,
	keyColor,
	borderColor,
	valueColor,
	keyTextStyle,
	valueTextStyle,
	borderBottomWidth,

	IsOnPress,
	onPress,
	isIcon,
	iconSetName,
	iconName,
	iconColor,
	iconSize,
	isLoading,
}) => {
	return (
		<View
			style={[
				ComponentStyles.subKeyContainer,
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
			<TouchableOpacity
				disabled={!IsOnPress}
				onPress={onPress}
				style={[{ ...CommonStyles.directionRowCenter }]}
			>
				{isIcon && (
					<>
						{isLoading ? (
							<View
								style={[IncidentStyle.locationPinLoader, { marginRight: 7 }]}
							>
								<ActivityIndicator size="small" color={Colors.secondary} />
							</View>
						) : (
							<Icons
								iconSetName={iconSetName}
								iconName={iconName}
								iconColor={iconColor}
								iconSize={iconSize}
								iconMainstyle={{ marginRight: 7 }}
							/>
						)}
					</>
				)}
				<Text
					style={[
						ComponentStyles.valueStyle,
						valueTextStyle,
						{
							color: valueColor ? valueColor : Colors.labelBlack,
							textAlign: "left",
							marginTop: 2,
							width: "90%",
						},
					]}
				>
					{valueLabel}
				</Text>
			</TouchableOpacity>
		</View>
	);
};

export default SubKeyValue;
