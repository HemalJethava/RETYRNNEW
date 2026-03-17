import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../MainPanel/styles";
import CommonStyles from "../../../../styles/CommonStyles";
import { Icons } from "../../../../components";
import Colors from "../../../../styles/Colors";

export const NoRouteFound = ({ onPressClose }) => {
	return (
		<View style={styles.flex}>
			<View style={{ ...CommonStyles.directionRowSB }}>
				<Text style={[styles.bigTitle]}>{"Location"}</Text>
				<TouchableOpacity
					style={[styles.directionHeaderBtn]}
					onPress={onPressClose}
				>
					<Icons
						iconSetName={"MaterialCommunityIcons"}
						iconName={"window-close"}
						iconSize={18}
						iconColor={"#888"}
					/>
				</TouchableOpacity>
			</View>
			<View style={styles.noDirection}>
				<View style={styles.alignCenter}>
					<Icons
						iconSetName={"MaterialDesignIcons"}
						iconName={"compass-off-outline"}
						iconSize={45}
						iconColor={Colors.black}
					/>
					<Text style={[styles.locationTxt, { marginTop: 10 }]}>
						{"Can't seem to find a way there"}
					</Text>
					<Text style={styles.etaTypeTxt}>{"Try a Google search"}</Text>
				</View>
			</View>
		</View>
	);
};
