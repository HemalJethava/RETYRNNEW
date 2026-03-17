import React, { useState, useCallback, useEffect } from "react";
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	ScrollView,
	Pressable,
	Image,
} from "react-native";
import MapStyle from "../../styles/MapStyle";
import CommonStyles from "../../styles/CommonStyles";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Button, Icons, Loader, Overlay } from "../../components";
import Colors from "../../styles/Colors";
import Api from "../../utils/Api";
import { deviceWidth } from "../../utils/DeviceInfo";
import {
	convertDateTime,
	convertLatLongToString,
	getCurrentTimeFormatHHMM,
	getStateKey,
	hapticVibrate,
	truncateText,
} from "../../config/CommonFunctions";
import { showMessage } from "react-native-flash-message";
import { ConfirmDeletePopup } from "../../components/ConfirmDeletePopup";
import ListSkeleton from "../../components/LoaderComponents/ListSkeleton";
import IMAGES from "../../assets/images/Images";
import { SelectAllButton } from "../../components/SelectAllButton";
import { useFocusEffect } from "@react-navigation/native";
import { StateFilled } from "../../assets/images/States";
import { GOOGLE_MAPS_APIKEY } from "../../config/BaseUrl";
import { getCurrentLocation, locationPermission } from "../../utils/Location";

const SavedMapScreen = (props) => {
	const [currentLocation, setCurrentlocation] = useState(null);
	const [isListLoading, setIsListLoading] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [destinationList, setDestinationList] = useState([]);
	const [selectedItems, setSelectedItems] = useState([]);
	const [multiSelectMode, setMultiSelectMode] = useState(false);
	const [showConfirmDelete, setShowConfirmDelete] = useState(false);

	const [isModal, setIsModal] = useState(false);
	const [selectedItem, setSelectedItem] = useState(null);

	useFocusEffect(
		useCallback(() => {
			setTimeout(() => {
				getDestionationList();
			}, 300);
		}, [])
	);

	useEffect(() => {
		setMultiSelectMode(selectedItems.length > 0);
	}, [selectedItems]);

	useEffect(() => {
		getLiveLocation();
	}, []);

	const getLiveLocation = async () => {
		const locPermissionGranted = await locationPermission();

		if (locPermissionGranted) {
			const { latitude, longitude } = await getCurrentLocation();
			setCurrentlocation({ latitude, longitude });
		}
	};

	const getDestionationList = async () => {
		try {
			setIsListLoading(true);
			const response = await Api.get(`user/get-saved-destinations`);

			if (response?.data) {
				const blankNameLocationArray = response.data.filter(
					(item) => !item.name
				);

				setDestinationList([...blankNameLocationArray]);
			} else {
				setDestinationList([]);
			}
		} catch (error) {
			console.warn(error);
		} finally {
			setIsListLoading(false);
		}
	};
	const rightSwipeActions = (item) => {
		return (
			<TouchableOpacity
				style={[MapStyle.swipeBtn]}
				onPress={() => handleDeleteDestination(item)}
			>
				<Text style={[MapStyle.swipeBtnTxt]}>Remove</Text>
			</TouchableOpacity>
		);
	};
	const handleDeleteDestination = async (item) => {
		if (item) {
			setSelectedItems([item.id]);
			setShowConfirmDelete(true);
		}
	};
	const fetchDistanceAndDuration = async (origin, placeId) => {
		try {
			if (!origin?.latitude || !origin?.longitude || !placeId) {
				throw new Error("Invalid origin or placeId");
			}

			const originParam = `${origin.latitude},${origin.longitude}`;
			const destinationParam = `place_id:${placeId}`;

			const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originParam}&destinations=${destinationParam}&key=${GOOGLE_MAPS_APIKEY}`;

			const response = await fetch(url);
			const data = await response.json();

			if (data?.rows?.[0]?.elements?.[0]?.status === "OK") {
				const distance = data.rows[0].elements[0].distance.value;
				const duration = data.rows[0].elements[0].duration.value;
				const durationText = data.rows[0].elements[0].duration.text;

				return { distance, duration, durationText };
			} else {
				console.warn("Google API status not OK:", data);
				return { distance: 0, duration: 0, durationText: "" };
			}
		} catch (error) {
			console.warn("Error fetching distance/duration:", error);
			return { distance: 0, duration: 0, durationText: "" };
		}
	};

	const gotoMapNavigation = async (item) => {
		try {
			console.log("item: ", item);

			const { distance } = await fetchDistanceAndDuration(
				currentLocation,
				item?.place_id
			);

			const distanceInMiles = distance * 0.000621371;

			const getCurrentDate = () => {
				const date = new Date();
				const day = String(date.getDate()).padStart(2, "0");
				const month = String(date.getMonth() + 1).padStart(2, "0");
				const year = String(date.getFullYear()).slice(-2);
				return `${day}/${month}/${year}`;
			};

			const data = {
				date: getCurrentDate(),
				time: getCurrentTimeFormatHHMM(),
				destination: distanceInMiles,
				saved_destination_id: item?.id,
			};

			const historyRes = await Api.post(`user/save-dest-history`, data).then(
				(res) => {
					return res;
				}
			);

			if (historyRes.success) {
				props.navigation.navigate("MainMap", { tripId: item?.id });
			} else {
				props.navigation.navigate("MainMap", { tripId: item?.id });
				console.warn(historyRes.message);
			}
		} catch (e) {
			console.log("Error: ", e);
		}
	};
	const ListItem = ({ item, index }) => {
		const isLastItem = index === destinationList.length - 1;

		const stateKey = getStateKey(item?.state);
		const stateImage = StateFilled[stateKey] || IMAGES.ImgPlaceholder;

		return (
			<TouchableOpacity
				onPress={() =>
					multiSelectMode ? handlePress(item) : gotoMapNavigation(item)
				}
				onLongPress={() => handleLongPress(item)}
				style={{
					backgroundColor: selectedItems.includes(item.id)
						? Colors.highlightSelected
						: Colors.white,
				}}
			>
				<View style={[MapStyle.listContainer, { paddingHorizontal: 20 }]}>
					<View style={[MapStyle.svgTextContain]}>
						<View
							style={[MapStyle.cityBG, { backgroundColor: Colors.primaryBG20 }]}
						>
							{StateFilled[stateKey] ? (
								<Image source={stateImage} style={MapStyle.mapLayoutImg} />
							) : (
								<Text
									style={[MapStyle.locStateCode, { color: Colors.secondary }]}
								>
									{item?.state_code}
								</Text>
							)}
						</View>
						<View>
							<Text
								style={[
									MapStyle.destinationLabel,
									{ width: deviceWidth / 1.7 },
								]}
							>
								{truncateText(item?.destination_location_name, 50)}
							</Text>
							<Text style={[MapStyle.destinationValue]}>
								{convertDateTime(item?.created_at)}
							</Text>
						</View>
					</View>
					{selectedItems.length > 0 ? (
						<TouchableOpacity
							// style={MapStyle.deleteIcon}
							onPress={() => handlePress(item)}
						>
							<Icons
								iconName={
									selectedItems.includes(item.id)
										? "checkbox-marked-circle-outline"
										: "checkbox-blank-circle-outline"
								}
								iconSetName={"MaterialCommunityIcons"}
								iconColor={Colors.secondary}
								iconSize={20}
							/>
						</TouchableOpacity>
					) : (
						// onPress={() => gotoSaveDestiScreen(item)}
						<TouchableOpacity onPress={() => onRequestModalOpen(item)}>
							<View style={[MapStyle.actionIcon, { paddingLeft: 0 }]}>
								<Icons
									iconName={"dots-horizontal"}
									iconSetName={"MaterialCommunityIcons"}
									iconColor={Colors.backArrowBlack}
									iconSize={22}
								/>
							</View>
						</TouchableOpacity>
					)}
				</View>
				{!isLastItem && <View style={[MapStyle.borderBottomGray]} />}
			</TouchableOpacity>
		);
	};
	const renderDestination = ({ item, index }) => {
		return (
			<>
				{multiSelectMode ? (
					<ListItem item={item} index={index} />
				) : (
					<Swipeable
						renderRightActions={() => rightSwipeActions(item)}
						friction={2}
						containerStyle={{
							overflow: "hidden",
						}}
					>
						<ListItem item={item} index={index} />
					</Swipeable>
				)}
			</>
		);
	};
	const gotoSaveDestiScreen = (item) => {
		onRequestClose();
		props.navigation.navigate("SaveDesti", { tripId: item?.id });
	};
	const handleLongPress = (item) => {
		setMultiSelectMode(true);
		toggleItemSelection(item);
	};
	const toggleItemSelection = (item) => {
		setSelectedItems((prevSelectedItems) =>
			prevSelectedItems.includes(item.id)
				? prevSelectedItems.filter((id) => id !== item.id)
				: [...prevSelectedItems, item.id]
		);
		hapticVibrate();
	};
	const toggleSelectAll = () => {
		if (selectedItems.length === destinationList.length) {
			setSelectedItems([]);
			setMultiSelectMode(false);
		} else {
			const allIds = destinationList.map((item) => item.id);
			setSelectedItems(allIds);
			setMultiSelectMode(true);
			hapticVibrate();
		}
	};
	const handlePress = (item) => {
		toggleItemSelection(item);
	};
	const RenderEmptyList = () => (
		<View style={[CommonStyles.emptyListContainer]}>
			<Image
				style={CommonStyles.emptyImg}
				source={IMAGES.NoDestination}
				resizeMode={"contain"}
			/>

			<Text style={CommonStyles.emptyTitle}>{"No Destination Found!"}</Text>
			<Text style={CommonStyles.emptyDescription}>
				{"No destination found. Please add new destination."}
			</Text>
			<Button
				btnColor={Colors.primary}
				btnName={"Add Destination"}
				btnLabelColor={Colors.white}
				isBtnActive={true}
				onPress={() => props.navigation.navigate("AddDestination")}
			/>
		</View>
	);
	const onRequestModalOpen = (item) => {
		setSelectedItem(item);
		setIsModal(true);
	};
	const onRequestClose = () => {
		setSelectedItem(null);
		setIsModal(false);
	};

	return (
		<View style={[MapStyle.mainContainer, { backgroundColor: Colors.white }]}>
			<Loader show={isLoading} />
			<ConfirmDeletePopup
				show={showConfirmDelete}
				onHide={() => setShowConfirmDelete(false)}
				title={`${
					selectedItems.length > 1
						? `${selectedItems.length} Destinations`
						: `${selectedItems.length} Destination`
				}`}
				setSelectedItems={setSelectedItems}
				setMultiSelectMode={setMultiSelectMode}
				api={`user/delete-multiple-saved-destination`}
				data={selectedItems}
				setIsLoading={setIsLoading}
				onSuccess={(message) => {
					setIsLoading(false);
					setShowConfirmDelete(false);
					setSelectedItems([]);
					setMultiSelectMode(false);
					showMessage({
						message: message,
						type: "success",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
					getDestionationList();
				}}
				onFailed={(message) => {
					setIsLoading(false);
					showMessage({
						message: message,
						type: "danger",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				}}
			/>
			<View style={[CommonStyles.mainPadding, { padding: 0, flex: 1 }]}>
				<View
					style={[
						MapStyle.rowBetween,
						{ width: "100%", paddingHorizontal: 20, paddingBottom: 10 },
					]}
				>
					<Text
						style={[
							MapStyle.headerTextPadding,
							{ paddingBottom: 0, paddingTop: 10 },
						]}
					>
						{"Saved Destinations"}
					</Text>
					{destinationList.length !== 0 && (
						<View style={{ marginTop: 15 }}>
							<SelectAllButton
								toggleSelectAll={toggleSelectAll}
								selectedItems={selectedItems}
								mainList={destinationList}
							/>
						</View>
					)}
				</View>
				{!isLoading && (
					<>
						<ScrollView
							style={{ flex: 1 }}
							showsVerticalScrollIndicator={false}
						>
							<>
								{isListLoading ? (
									<FlatList
										style={{ ...CommonStyles.emptyList }}
										data={Array(7).fill(0)}
										keyExtractor={(item, index) =>
											`skeleton2-${index.toString()}`
										}
										renderItem={({ item, index }) => <ListSkeleton />}
										scrollEnabled={false}
									/>
								) : (
									<FlatList
										contentContainerStyle={{}}
										data={destinationList}
										renderItem={renderDestination}
										scrollEnabled={false}
										keyExtractor={(item, index) => `saved-${index.toString()}`}
										ListEmptyComponent={() => <RenderEmptyList />}
									/>
								)}
							</>
						</ScrollView>
						{selectedItems.length > 0 && (
							<View style={[MapStyle.deleteContainer, { width: "100%" }]}>
								<Button
									onPress={() => setShowConfirmDelete(true)}
									btnName={`${
										selectedItems?.length > 1
											? `${selectedItems?.length} Remove Destinations`
											: `${selectedItems?.length} Remove Destination`
									} `}
									isBtnActive={true}
									btnColor={Colors.red}
									btnLabelColor={Colors.white}
								/>
							</View>
						)}
					</>
				)}
			</View>
			<Overlay onRequestClose={() => onRequestClose()} visible={isModal}>
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
							<Text style={[MapStyle.modalHeader]}>{"Actions"}</Text>
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
								{"Choose what you would like to do with"}
							</Text>
							<Text
								style={[
									MapStyle.addressDisplay,
									{ color: Colors.secondary, textAlign: "center" },
								]}
							>
								{selectedItem?.destination_location_name}
							</Text>
						</View>
						<View style={[MapStyle.actionIconContainer]}>
							<Pressable
								onPress={() => gotoSaveDestiScreen(selectedItem)}
								style={({ pressed }) => [
									{ backgroundColor: pressed ? "#EFEFEF80" : "#EFEFEF" },
									MapStyle.actionIconsView,
								]}
							>
								<Icons
									iconColor={Colors.iconBlack}
									iconName={"card-search-outline"}
									iconSetName={"MaterialCommunityIcons"}
									iconSize={18}
								/>
								<Text style={[MapStyle.iconText]}>{"Trip Details"}</Text>
							</Pressable>
							<Pressable
								style={({ pressed }) => [
									{ backgroundColor: pressed ? "#FFCBCB80" : "#FFCBCB" },
									MapStyle.actionIconsView,
								]}
								onPress={() => {
									onRequestClose();
									handleDeleteDestination(selectedItem);
								}}
							>
								<Icons
									iconColor={Colors.iconBlack}
									iconName={"delete"}
									iconSetName={"MaterialCommunityIcons"}
									iconSize={18}
								/>
								<Text style={[MapStyle.iconText]}>{"Remove"}</Text>
							</Pressable>
							<Pressable
								style={({ pressed }) => [
									{ backgroundColor: pressed ? "#DAECF780" : "#DAECF7" },
									MapStyle.actionIconsView,
								]}
								onPress={() => onRequestClose()}
							>
								<Icons
									iconColor={Colors.iconBlack}
									iconName={"close-circle-outline"}
									iconSetName={"MaterialCommunityIcons"}
									iconSize={18}
								/>
								<Text style={[MapStyle.iconText]}>{"Close"}</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Overlay>
		</View>
	);
};

export default SavedMapScreen;
