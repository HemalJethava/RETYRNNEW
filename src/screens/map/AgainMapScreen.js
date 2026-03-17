import React, { useState, useEffect, useRef } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import {
	getShortLocationName,
	getStateKey,
	hapticVibrate,
	truncateText,
} from "../../config/CommonFunctions";
import Api from "../../utils/Api";
import { showMessage } from "react-native-flash-message";
import { DeleteLocation } from "./components/DeleteLocation";
import { MultipleDelete } from "./components/MultipleDelete";
import IMAGES from "../../assets/images/Images";
import ListSkeleton from "../../components/LoaderComponents/ListSkeleton";
import { SelectAllButton } from "../../components/SelectAllButton";
import { StateOutline } from "../../assets/images/States";
import { getCurrentLocation, locationPermission } from "../../utils/Location";

const AgainMapScreen = (props) => {
	const dispatch = useDispatch();

	const swipeableRefs = useRef({});
	const RecentLocationArray = useSelector(
		(state) => state.Map.recentSearchLocationList
	);

	const [isListLoading, setIsListLoading] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isModal, setIsModal] = useState(false);
	const [origin, setOrigin] = useState(null);
	const [originName, setOriginName] = useState("");
	const [locationList, setLocationList] = useState([]);
	const [selectedItem, setSelectedItem] = useState(null);
	const [selectedItems, setSelectedItems] = useState([]);
	const [multiSelectMode, setMultiSelectMode] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState("");
	const [showDeletePopUp, setShowDeletePopUp] = useState(false);
	const [showConfirmDelete, setShowConfirmDelete] = useState(false);

	const getLiveLocation = async () => {
		const locPermissionGranted = await locationPermission();

		if (locPermissionGranted) {
			const { latitude, longitude, locationName } = await getCurrentLocation();
			setOrigin({ latitude, longitude });
			if (locationName) {
				const shortName = await getShortLocationName(locationName);
				setOriginName(shortName[0]?.mainText);
			}
		}
	};

	useEffect(() => {
		getLiveLocation();
	}, []);

	useEffect(() => {
		setTimeout(() => {
			getLocationNames();
		}, 300);
	}, [RecentLocationArray, multiSelectMode]);

	const getLocationNames = async () => {
		if (RecentLocationArray.length > 0) {
			setIsListLoading(true);
			const updatedLocations = await Promise.all(
				RecentLocationArray.map(async (item) => {
					if (item?.waypointLocation) {
						const waypointLocationNames = item.waypointLocation.map(
							(location) => location?.address
						);
						return {
							...item,
							waypointLocationNames,
						};
					} else {
						return { ...item };
					}
				})
			);
			setIsListLoading(false);
			setLocationList(updatedLocations);
		} else {
			setLocationList([]);
		}
		setIsListLoading(false);
	};
	const onRequestModalOpen = (item, index) => {
		setSelectedItem(item);
		setSelectedIndex(index), setIsModal(true);
	};
	const onRequestClose = () => {
		setSelectedItem(null);
		setSelectedIndex("");
		setIsModal(false);
	};
	const gotoTripDetailScreen = () => {
		setIsModal(false);
		props.navigation.navigate("TripDetails", {
			tripDetail: selectedItem,
			itemIndex: selectedIndex,
		});
	};
	const LeftSwipeActions = (item, index) => {
		return (
			<TouchableOpacity
				style={[MapStyle.swipeBtn, { backgroundColor: "#4CA7DA" }]}
				onPress={() => saveDestination(item, index)}
			>
				<Text style={[MapStyle.swipeBtnTxt]}>Save</Text>
			</TouchableOpacity>
		);
	};
	const rightSwipeActions = (item, index) => {
		return (
			<TouchableOpacity
				style={[MapStyle.swipeBtn]}
				onPress={() => {
					setSelectedItem(item);
					setSelectedIndex(index);
					setIsModal(false);
					setShowDeletePopUp(true);
				}}
			>
				<Text style={[MapStyle.swipeBtnTxt]}>Remove</Text>
			</TouchableOpacity>
		);
	};
	const gotoMapNavigation = (item) => {
		let coordinates = [];

		if (RecentLocationArray.length && origin) {
			coordinates.push({
				latitude: origin.latitude,
				longitude: origin.longitude,
				locationName: originName,
			});

			if (item.waypointLocation) {
				item.waypointLocation.forEach((waypoint) => {
					coordinates.push({
						latitude: waypoint.latitude,
						longitude: waypoint.longitude,
						locationName: waypoint?.address,
						placeId: waypoint?.place_id,
					});
				});
			}

			coordinates.push({
				latitude: item.destinationLocation.latitude,
				longitude: item.destinationLocation.longitude,
				locationName: item?.destinationLocation?.destinationLocationName,
				placeId: item?.place_id,
			});
		}
		props.navigation.navigate("MainMap", {
			coordinates: coordinates,
		});
	};
	const handleLongPress = (item) => {
		setMultiSelectMode(true);
		toggleItemSelection(item);
	};
	const toggleItemSelection = (item) => {
		if (selectedItems.includes(item.id)) {
			if (selectedItems.length == 1) {
				setMultiSelectMode(false);
			}
			setSelectedItems(selectedItems.filter((id) => id !== item.id));
		} else {
			setSelectedItems([...selectedItems, item.id]);
			hapticVibrate();
		}
	};
	const toggleSelectAll = () => {
		if (selectedItems.length === locationList.length) {
			setSelectedItems([]);
			setMultiSelectMode(false);
		} else {
			const allIds = locationList.map((item) => item.id);
			setSelectedItems(allIds);
			setMultiSelectMode(true);
			hapticVibrate();
		}
	};
	const handlePress = (item) => {
		toggleItemSelection(item);
	};
	const ListItem = ({ item, index }) => {
		const isLastItem = index === locationList.length - 1;

		const stateKey = getStateKey(item?.state);
		const stateImage = StateOutline[stateKey] || IMAGES.ImgPlaceholder;
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
					<View style={[MapStyle.svgTextContain, { width: "70%" }]}>
						<View
							style={[MapStyle.cityBG, { backgroundColor: Colors.lightGrayBG }]}
						>
							{StateOutline[stateKey] ? (
								<Image source={stateImage} style={MapStyle.mapLayoutImg} />
							) : (
								<Text style={MapStyle.locStateCode}>
									{item?.stateCode.toUpperCase().slice(0, 3)}
								</Text>
							)}
						</View>
						<View>
							<Text style={[MapStyle.destinationLabel]}>
								{truncateText(
									item?.destinationLocation?.destinationLocationName,
									50
								)}
							</Text>
							<Text style={[MapStyle.destinationValue]}>
								{`${item?.date?.createdAtDate} • ${item?.time?.createdAtTime}`}
							</Text>
						</View>
					</View>
					{selectedItems.length > 0 ? (
						<TouchableOpacity onPress={() => handlePress(item)}>
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
						<TouchableOpacity onPress={() => onRequestModalOpen(item, index)}>
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
	const renderDestination = (item, index) => {
		const key = item?.id || index;
		return (
			<>
				{multiSelectMode ? (
					<ListItem item={item} index={index} />
				) : (
					<Swipeable
						ref={(ref) => {
							if (ref) swipeableRefs.current[key] = ref;
						}}
						renderLeftActions={() => LeftSwipeActions(item, index)}
						renderRightActions={() => rightSwipeActions(item, index)}
						friction={1}
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
	const gotoSaveScreen = () => {
		props.navigation.navigate("SavedMap", { isReloadList: true });
		onRequestClose();
	};
	const saveDestination = async (item, index) => {
		if (item) {
			try {
				setLoading(true);
				const data = {
					destination_latitude: item?.destinationLocation?.latitude,
					destination_longitude: item?.destinationLocation?.longitude,
					destination_location_name:
						item?.destinationLocation?.destinationLocationName,

					waypoint:
						item?.waypointLocation?.length > 0 ? item?.waypointLocation : [],
					waypoint_name:
						item?.waypointLocationNames?.length > 0
							? item?.waypointLocationNames
							: [],

					flag: 0,
					note: "",
					place_id: item?.place_id,
					city: item?.city,
					state: item?.state,
					state_code: item?.stateCode,
				};
				if (item.label) {
					data["name"] = item.label;
				}
				const response = await Api.post("user/save-destination", data);

				setLoading(false);
				if (response.success) {
					showMessage({
						message: response.message,
						type: "success",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
					gotoSaveScreen();
				} else {
					const extractMessages = (messagesArray) => {
						return messagesArray
							.flatMap((item) => Object.values(item))
							.flat()
							.join(", ");
					};
					const messagesString = extractMessages(response.data.data);
					showMessage({
						message: messagesString,
						type: "danger",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				}
			} catch (error) {
				setLoading(false);
				console.warn(error);
			}
		}
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
	const closeAllSwipeables = () => {
		Object.values(swipeableRefs.current).forEach((ref) => {
			ref?.close?.();
		});
	};

	return (
		<View style={[MapStyle.mainContainer, { backgroundColor: Colors.white }]}>
			<Loader show={loading} />
			<DeleteLocation
				show={showDeletePopUp}
				onHide={() => {
					setShowDeletePopUp(false);
					closeAllSwipeables();
				}}
				setIsLoading={setLoading}
				type={"again"}
				data={selectedItem}
				setLocationList={setLocationList}
				selectedIndex={selectedIndex}
				onSuccess={(message) => {
					setLoading(false);
					setShowDeletePopUp(false);
					showMessage({
						message: message,
						type: "success",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
					getLocationNames();
				}}
				onFailed={(message) => {
					setLoading(false);
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
			<MultipleDelete
				show={showConfirmDelete}
				onHide={() => setShowConfirmDelete(false)}
				title={`${
					selectedItems.length > 1
						? `${selectedItems.length} Destinations`
						: `${selectedItems.length} Destination`
				}`}
				data={selectedItems}
				setIsLoading={setLoading}
				setSelectedItems={setSelectedItems}
				setMultiSelectMode={setMultiSelectMode}
				onSuccess={(message) => {
					setLoading(false);
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
				}}
				onFailed={(message) => {
					setLoading(false);
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
				<View style={[MapStyle.againTitleRow, { paddingVertical: 10 }]}>
					<Text style={[MapStyle.headerTextPadding, { paddingBottom: 0 }]}>
						{"Recent Trips"}
					</Text>

					{locationList.length !== 0 && (
						<View style={{ marginTop: 15 }}>
							<SelectAllButton
								toggleSelectAll={toggleSelectAll}
								selectedItems={selectedItems}
								mainList={locationList}
							/>
						</View>
					)}
				</View>
				{!loading && (
					<>
						<ScrollView
							style={{ flex: 1 }}
							showsVerticalScrollIndicator={false}
							overScrollMode={"never"}
						>
							<View
								style={{
									width: "100%",
								}}
							>
								{isListLoading ? (
									<FlatList
										style={{ ...CommonStyles.emptyList }}
										data={Array(7).fill(0)}
										keyExtractor={(item, index) =>
											`skeleton-${index.toString()}`
										}
										renderItem={({ item, index }) => <ListSkeleton />}
										scrollEnabled={false}
									/>
								) : (
									<FlatList
										contentContainerStyle={{}}
										data={locationList}
										renderItem={({ item: destinationItem, index }) =>
											renderDestination(destinationItem, index)
										}
										scrollEnabled={false}
										keyExtractor={(item, index) => `again-${index.toString()}`}
										ListEmptyComponent={() => <RenderEmptyList />}
									/>
								)}
							</View>
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
								{selectedItem?.destinationLocation?.destinationLocationName}
							</Text>
						</View>
						<View style={[MapStyle.actionIconContainer]}>
							<Pressable
								onPress={() => gotoTripDetailScreen()}
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
									{ backgroundColor: pressed ? "#DAECF780" : "#DAECF7" },
									MapStyle.actionIconsView,
								]}
								onPress={() => saveDestination(selectedItem, selectedIndex)}
							>
								<Icons
									iconColor={Colors.iconBlack}
									iconName={"map-marker-outline"}
									iconSetName={"MaterialCommunityIcons"}
									iconSize={18}
								/>
								<Text style={[MapStyle.iconText]}>{"Save"}</Text>
							</Pressable>
							<Pressable
								style={({ pressed }) => [
									{ backgroundColor: pressed ? "#FFCBCB80" : "#FFCBCB" },
									MapStyle.actionIconsView,
								]}
								onPress={() => {
									setIsModal(false);
									setShowDeletePopUp(true);
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
						</View>
					</View>
				</View>
			</Overlay>
		</View>
	);
};

export default AgainMapScreen;
