import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	TextInput,
	Keyboard,
} from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { styles } from "./styles";
import LayoutStyle from "../../../../styles/LayoutStyle";
import CommonStyles from "../../../../styles/CommonStyles";
import { Icons } from "../../../../components";
import Colors from "../../../../styles/Colors";
import { fetchSuggestions } from "../../../../config/CommonFunctions";

export const AddStopPanel = ({
	addStopPanelRef,
	snapPoints,
	renderBackdrop,
	handleAddStopClosePanel,
	currentLocation,
	currentLocationName,
	selectedWaypoint,
}) => {
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [suggestions, setSuggestions] = useState([]);

	useEffect(() => {
		if (!selectedWaypoint || !selectedWaypoint?.address) {
			setSearchText("");
			setSuggestions([]);
			return;
		}
		setSearchText(
			selectedWaypoint?.type === "origin"
				? "My Location"
				: selectedWaypoint?.address
		);
		fetchSuggestions(
			selectedWaypoint?.type === "origin"
				? currentLocationName
				: selectedWaypoint?.address,
			setLoading,
			setSearchText,
			setSuggestions,
			currentLocation,
			selectedWaypoint?.id,
			selectedWaypoint?.type
		);
	}, [selectedWaypoint]);

	const onPressSuggestion = (item) => {
		const newItem = {
			id: item?.id,
			type: item?.type,
			address:
				item?.type === "origin"
					? "My Location"
					: item?.structured_formatting?.main_text,
			latitude: parseFloat(item?.coords?.latitude),
			longitude: parseFloat(item?.coords?.longitude),
		};
		onPressCloseLocation();
		handleAddStopClosePanel?.(newItem);
	};
	const SuggestionLocation = ({ item }) => {
		const location = item?.structured_formatting;
		if (!location) return <></>;

		return (
			<>
				<TouchableOpacity
					onPress={() => onPressSuggestion(item)}
					style={styles.locationRow}
				>
					<Icons
						iconSetName={"MaterialDesignIcons"}
						iconName={"record-circle"}
						iconColor={"#667cf1"}
						iconSize={38}
					/>
					<View style={styles.locationTxtBox}>
						<Text style={styles.locationTxt}>{location.main_text}</Text>
						<View style={{ ...CommonStyles.directionRowCenter }}>
							{item?.distanceMiles && (
								<Text style={styles.distanceTxt}>
									{`${item.distanceMiles.toFixed(2)} Miles • `}
								</Text>
							)}
							<Text
								numberOfLines={1}
								ellipsizeMode="tail"
								style={styles.locationDesTxt}
							>
								{location.secondary_text}
							</Text>
						</View>
					</View>
				</TouchableOpacity>
				<View style={styles.divDark} />
			</>
		);
	};
	const onPressCloseLocation = () => {
		setLoading(false);
		setSearchText("");
		setSuggestions([]);
	};
	const onPressCancel = () => {
		onPressCloseLocation();
		handleAddStopClosePanel();
	};

	return (
		<BottomSheetModal
			ref={addStopPanelRef}
			snapPoints={["90%"]}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={true}
			enableDynamicSizing={false}
			backgroundStyle={styles.backgroundStyle}
		>
			<BottomSheetScrollView
				style={styles.flex}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					...LayoutStyle.paddingHorizontal20,
					...LayoutStyle.paddingBottom20,
				}}
			>
				<View style={styles.flex}>
					<View style={[{ ...CommonStyles.directionRowSB }]}>
						<TouchableOpacity style={{}} onPress={() => onPressCancel()}>
							<Text style={styles.headerCancelTxt}>{"Cancel"}</Text>
						</TouchableOpacity>

						<Text style={[styles.reportPanelTitle, { right: 22 }]}>
							{"Add Stop"}
						</Text>
						<View />
					</View>
				</View>

				<View style={styles.searchRow}>
					<View style={[styles.searchContainer, { flex: 1 }]}>
						<View style={{ bottom: 1 }}>
							<Icons
								iconSetName={"Ionicons"}
								iconName={"search"}
								iconColor={"#888"}
								iconSize={14}
							/>
						</View>
						<TextInput
							style={styles.searchInput}
							value={searchText}
							onChangeText={(text) =>
								fetchSuggestions(
									text,
									setLoading,
									setSearchText,
									setSuggestions,
									currentLocation,
									selectedWaypoint?.id,
									selectedWaypoint?.type
								)
							}
							placeholder={"Search Maps"}
							placeholderTextColor={Colors.labelDarkGray}
						/>
						{searchText && (
							<TouchableOpacity onPress={() => onPressCloseLocation()}>
								<Icons
									iconSetName={"Ionicons"}
									iconName={"close-circle"}
									iconColor={"#888"}
									iconSize={20}
								/>
							</TouchableOpacity>
						)}
					</View>
				</View>

				{suggestions.length > 0 &&
					suggestions.map((item) => <SuggestionLocation item={item} />)}
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
};
