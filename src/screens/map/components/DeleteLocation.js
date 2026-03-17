import React, { useState, useEffect } from "react";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import { Icons, Overlay } from "../../../components";
import MapStyle from "../../../styles/MapStyle";
import Colors from "../../../styles/Colors";
import { useDispatch } from "react-redux";
import { removeRecentLocationArrayItem } from "../redux/Action";
import CommonStyles from "../../../styles/CommonStyles";

export const DeleteLocation = ({
	show,
	onHide,
	data,
	setIsLoading,
	onSuccess,
	onFailed,
	type,
	setLocationList,
	selectedIndex,
}) => {
	const dispatch = useDispatch();

	const onRequestClose = () => {
		onHide();
	};

	const onPressDelete = async () => {
		if (data) {
			if (type === "again") {
				setLocationList((prevState) =>
					prevState.filter((item, i) => i !== selectedIndex)
				);
				dispatch(removeRecentLocationArrayItem(selectedIndex));
				onSuccess("Destination Deleted Successfully");
			}
		}
	};
	return (
		<Overlay onRequestClose={() => onRequestClose()} visible={show}>
			<View>
				<View style={[MapStyle.actionModal]}>
					<View style={[MapStyle.centerModal]}>
						<Pressable
							style={({ pressed }) => [
								{ backgroundColor: pressed ? "#EFEFEF" : "#ffffff" },
							]}
							onPress={() => onRequestClose()}
						>
							<Icons
								iconColor={Colors.iconBlack}
								iconName={"close"}
								iconSetName={"MaterialCommunityIcons"}
								iconSize={22}
							/>
						</Pressable>
						<Text style={[MapStyle.modalHeader]}>{"Delete Destination"}</Text>
						<Pressable>
							<Icons
								iconColor={Colors.white}
								iconName={"close"}
								iconSetName={"MaterialCommunityIcons"}
							/>
						</Pressable>
					</View>
					<View style={[MapStyle.addrContainer]}>
						<Text style={[MapStyle.addressDisplay, { textAlign: "center" }]}>
							{"Are you sure you want to delete this destination?"}
						</Text>
						<Text
							style={[
								MapStyle.addressDisplay,
								{ color: Colors.secondary, textAlign: "center" },
							]}
						>
							{`${
								type === "again"
									? `${data?.originLocation?.originLocationName} \n ${data?.destinationLocation?.destinationLocationName}`
									: `${data?.origin_location_name} \n ${data?.address}`
							}`}
						</Text>
					</View>
					<View style={[CommonStyles.directionRowSB]}>
						<TouchableOpacity
							onPress={() => onRequestClose()}
							style={[
								CommonStyles.logoutBtn,
								{
									backgroundColor: Colors.lightGrayBG,
								},
							]}
						>
							<Text style={[CommonStyles.cancelText]}>{"Cancel"}</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => onPressDelete()}
							style={[
								CommonStyles.logoutBtn,
								{
									backgroundColor: Colors.red,
								},
							]}
						>
							<Text style={[CommonStyles.logoutText]}>{"Delete"}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Overlay>
	);
};
