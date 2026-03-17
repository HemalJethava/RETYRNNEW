import React from "react";
import { Text, View, TouchableOpacity, TextInput } from "react-native";
import { styles } from "../MainPanel/styles";
import { Icons } from "../../../../components";
import { fetchSuggestions } from "../../../../config/CommonFunctions";
import Colors from "../../../../styles/Colors";
import CommonStyles from "../../../../styles/CommonStyles";
import LayoutStyle from "../../../../styles/LayoutStyle";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

export const AddStop = ({
	selectedNPlaceType,
	onPressCloseAddStop,
	currentLocation,
	onPressCloseLocation,
	onPressLocationType,
	onPressClosePlacesList,
	onCloseNearbyPlace,
	onPressAddPlace,

	setSuggestionLoading,
	searchText,
	setSearchText,
	suggestions,
	setSuggestions,
	onPressSuggestion,

	isLoadingNearBy,
	nearByPlaces,
}) => {
	const SuggestionLocation = ({ item, onPress }) => {
		const location = item?.structured_formatting;
		if (!location) return <></>;

		return (
			<>
				<TouchableOpacity onPress={onPress} style={styles.locationRow}>
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
	const NearByLocation = ({
		backgroundColor,
		iconLibrary,
		iconName,
		iconSize,
		placeName,
		isShowDiv = true,
	}) => {
		const item = {
			backgroundColor,
			iconLibrary,
			iconName,
			iconSize,
			placeName,
		};
		return (
			<TouchableOpacity onPress={() => onPressLocationType(item)}>
				<View style={styles.searchedRow}>
					<View
						style={[
							styles.nearByIcon,
							backgroundColor && { backgroundColor: backgroundColor },
						]}
					>
						<Icons
							iconSetName={iconLibrary}
							iconName={iconName}
							iconColor={Colors.white}
							iconSize={iconSize || 18}
						/>
					</View>
					<Text style={[styles.searchedDestination, { fontSize: 17 }]}>
						{placeName}
					</Text>
				</View>
				{isShowDiv && <View style={styles.divDark} />}
			</TouchableOpacity>
		);
	};
	const ListLoader = () => {
		const array = Array(3).fill(0);
		return (
			<View style={{ flex: 1 }}>
				{array.map((i, index) => (
					<View key={index} style={{ ...LayoutStyle.marginBottom10 }}>
						<SkeletonPlaceholder speed={800} backgroundColor={"#E1E9EE"}>
							<SkeletonPlaceholder.Item
								width={"100%"}
								height={80}
								borderRadius={8}
							/>
						</SkeletonPlaceholder>
					</View>
				))}
			</View>
		);
	};
	const NearByPlaceType = ({ title, duration, distance, address, onPress }) => (
		<View style={{ ...CommonStyles.directionRowSB }}>
			<View style={{ width: "77%", marginRight: 10 }}>
				<Text numberOfLines={1} style={styles.navNearbyPlace}>
					{title}
				</Text>
				<Text
					style={[styles.navNearbyDes]}
				>{`Adds ${duration} • ${distance}`}</Text>
				<Text numberOfLines={1} style={[styles.navNearbyDes]}>
					{address}
				</Text>
			</View>
			<View style={styles.flex}>
				<TouchableOpacity style={styles.nearByAddBtn} onPress={onPress}>
					<Icons
						iconSetName={"FontAwesome6"}
						iconName={"circle-plus"}
						iconColor={Colors.blueActiveBtn}
						iconSize={16}
					/>
					<Text style={styles.nearByAddTxt}>{"Add"}</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
	return (
		<>
			{!selectedNPlaceType && (
				<>
					<View style={styles.rowWithMarginTop}>
						<Text style={[styles.dTitleDetail, { fontSize: 20 }]}>
							{"Add Stop"}
						</Text>
						<TouchableOpacity
							style={styles.dArrowBtn}
							onPress={() => onPressCloseAddStop()}
						>
							<Icons
								iconSetName={"MaterialCommunityIcons"}
								iconName={"window-close"}
								iconColor={"#888"}
								iconSize={20}
							/>
						</TouchableOpacity>
					</View>
					<View style={[styles.searchContainer, { flex: 1, marginTop: 10 }]}>
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
									setSuggestionLoading,
									setSearchText,
									setSuggestions,
									currentLocation
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
									iconSize={18}
								/>
							</TouchableOpacity>
						)}
					</View>
					{suggestions.length > 0 &&
						suggestions.map((item, index) => (
							<View key={index}>
								<SuggestionLocation
									item={item}
									onPress={() => onPressSuggestion(item)}
								/>
							</View>
						))}
					{!searchText && (
						<View style={{ ...LayoutStyle.marginTop10 }}>
							<NearByLocation
								iconLibrary={"FontAwesome6"}
								iconName={"gas-pump"}
								placeName={"Gas Stations"}
							/>
							<NearByLocation
								iconLibrary={"MaterialIcons"}
								iconName={"restaurant"}
								placeName={"Lunch"}
								backgroundColor={"orange"}
							/>
							<NearByLocation
								iconLibrary={"FontAwesome"}
								iconName={"hotel"}
								placeName={"Hotels"}
								backgroundColor={"#f5389e"}
							/>
							<NearByLocation
								iconLibrary={"MaterialIcons"}
								iconName={"train"}
								placeName={"Railway Stations"}
								iconSize={20}
							/>
							<NearByLocation
								iconLibrary={"MaterialDesignIcons"}
								iconName={"parking"}
								placeName={"Parking"}
								iconSize={20}
							/>
							<NearByLocation
								iconLibrary={"Ionicons"}
								iconName={"train-sharp"}
								placeName={"Metro Station"}
								iconSize={20}
							/>
							<NearByLocation
								iconLibrary={"FontAwesome"}
								iconName={"bus"}
								placeName={"Bus Stops"}
								iconSize={20}
							/>
							<NearByLocation
								iconLibrary={"MaterialDesignIcons"}
								iconName={"coffee"}
								placeName={"Coffee Shops"}
								iconSize={20}
								backgroundColor={"orange"}
								isShowDiv={false}
							/>
						</View>
					)}
				</>
			)}
			{selectedNPlaceType && (
				<>
					<View style={[styles.nearByHearRow]}>
						<View style={{ ...CommonStyles.directionRowCenter }}>
							<View
								style={[
									styles.nearByIcon,
									selectedNPlaceType?.backgroundColor && {
										backgroundColor: selectedNPlaceType?.backgroundColor,
										bottom: 0,
									},
								]}
							>
								<Icons
									iconSetName={selectedNPlaceType?.iconLibrary}
									iconName={selectedNPlaceType?.iconName}
									iconColor={Colors.white}
									iconSize={selectedNPlaceType?.iconSize || 18}
								/>
							</View>
							<View>
								<Text style={styles.nearByTitle}>
									{selectedNPlaceType?.placeName || ""}
								</Text>
								<Text
									style={styles.placeLengthTxt}
								>{`${nearByPlaces.length} found`}</Text>
							</View>
						</View>
						<TouchableOpacity
							style={styles.dArrowBtn}
							onPress={() => {
								onPressClosePlacesList();
								onCloseNearbyPlace();
							}}
						>
							<Icons
								iconSetName={"MaterialCommunityIcons"}
								iconName={"window-close"}
								iconColor={"#888"}
								iconSize={20}
							/>
						</TouchableOpacity>
					</View>
					<View style={[{ ...LayoutStyle.marginTop20 }]}>
						{isLoadingNearBy ? (
							<ListLoader />
						) : (
							<View>
								{nearByPlaces.length > 0 ? (
									<View style={[styles.library]}>
										{nearByPlaces.map((item, index) => (
											<View key={index}>
												<NearByPlaceType
													title={item?.name}
													duration={item?.duration}
													distance={item?.distance}
													address={item?.address}
													onPress={() => onPressAddPlace(item)}
												/>
												{index !== nearByPlaces.length - 1 && (
													<View style={styles.div} />
												)}
											</View>
										))}
									</View>
								) : (
									<Text style={styles.noNearByPlace}>{`No Near By ${
										selectedNPlaceType?.placeName || ""
									} Found.`}</Text>
								)}
							</View>
						)}
					</View>
				</>
			)}
		</>
	);
};
