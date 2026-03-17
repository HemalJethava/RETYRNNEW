import React from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { Overlay, Icons } from "../../../components";
import MapStyle from "../../../styles/MapStyle";
import Colors from "../../../styles/Colors";
import CommonStyles from "../../../styles/CommonStyles";
import { useDispatch, useSelector } from "react-redux";
import { removeRecentLocationArrayItems } from "../redux/Action";

export const MultipleDelete = ({
	show,
	onHide,
	title,
	data,
	setIsLoading,
	onSuccess,
	onFailed,
	setSelectedItems,
	setMultiSelectMode,
}) => {
	const dispatch = useDispatch();

	const onRequestClose = () => {
		onHide();
		setSelectedItems([]);
		setMultiSelectMode(false);
	};

	const confirmDelete = async () => {
		try {
			setIsLoading(true);
			if (data.length > 0) {
				setIsLoading(true);
				dispatch(removeRecentLocationArrayItems(data));
			}
			onSuccess("Destination Deleted Successfully");
		} catch (error) {
			setIsLoading(false);
			onFailed("Something went wrong!");
			console.warn(error);
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
						<Text style={[MapStyle.modalHeader]}>{"Delete"}</Text>
						<Pressable>
							<Icons
								iconColor={Colors.white}
								iconName={"close"}
								iconSetName={"MaterialCommunityIcons"}
							/>
						</Pressable>
					</View>
					<View style={[MapStyle.addrContainer]}>
						<Text style={[MapStyle.addressDisplay]}>
							{"Are you want to sure delete?"}
						</Text>
						<Text
							style={[MapStyle.addressDisplay, { color: Colors.secondary }]}
						>
							{title}
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
							onPress={() => confirmDelete()}
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
