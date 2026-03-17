import React from "react";
import { TouchableOpacity, View } from "react-native";
import AccountStyle from "../styles/AccountStyle";
import Icons from "./Icons";
import Colors from "../styles/Colors";
import { Text } from "react-native";

export const SelectAllButton = ({
	toggleSelectAll,
	selectedItems,
	mainList,
}) => {
	return (
		<TouchableOpacity
			style={[AccountStyle.destiSelectAll]}
			onPress={toggleSelectAll}
		>
			<View style={{ top: 1 }}>
				<Icons
					iconSetName={"MaterialIcons"}
					iconName={
						selectedItems.length === mainList.length
							? "check-box"
							: "check-box-outline-blank"
					}
					iconColor={
						selectedItems.length === mainList.length
							? Colors.secondary
							: Colors.labelBlack
					}
					iconSize={17}
				/>
			</View>
			<Text
				style={{
					marginHorizontal: 4,
					color:
						selectedItems.length === mainList.length
							? Colors.secondary
							: Colors.labelBlack,
				}}
			>
				{"|"}
			</Text>
			<Text
				style={{
					color:
						selectedItems.length === mainList.length
							? Colors.secondary
							: Colors.labelBlack,
					fontSize: 11.5,
					textAlignVertical: "center",
				}}
			>
				{selectedItems.length === mainList.length
					? "Deselect All"
					: "Select All"}
			</Text>
		</TouchableOpacity>
	);
};
