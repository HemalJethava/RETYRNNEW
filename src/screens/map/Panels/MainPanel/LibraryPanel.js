import React, { useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	TextInput,
	Image,
	TouchableWithoutFeedback,
} from "react-native";
import Colors from "../../../../styles/Colors";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { styles } from "./styles";
import LayoutStyle from "../../../../styles/LayoutStyle";
import FontFamily from "../../../../assets/fonts/FontFamily";
import CommonStyles from "../../../../styles/CommonStyles";
import { Icons, Loader } from "../../../../components";
import {
	fetchPlaceDetail,
	fetchSuggestions,
	getFormattedAddress,
	getPlaceDetail,
	noImgUrl,
} from "../../../../config/CommonFunctions";
import { useDispatch } from "react-redux";
import { removeLibraryPlace, storeLibraryPlace } from "../../redux/Action";
import Share from "react-native-share";
import Api from "../../../../utils/Api";
import { showMessage } from "react-native-flash-message";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { NoRouteFound } from "../SubComponent/NoRouteFound";

export const LibraryPanel = ({
	libraryPanelRef,
	snapPoints,
	renderBackdrop,
	handleLibraryClosePanel,
	currentLocation,
	recentHistory,
	libraryList,
	openNotePanel,
	pinnedPlacesList,
	getPinnedPlaces,
	openRouteDetailPanel,
	changeDestiByPanel,
	openPinPanel,
}) => {
	const dispatch = useDispatch();
	const swipeableRefs = useRef({});

	const [customSnapPoints, setCustomSnapPoints] = useState([]);

	const [isPageLoader, setIsPageLoader] = useState(false);

	const [mergeList, setMergeList] = useState([]);
	const [filteredLibraryList, setFilteredLibraryList] = useState([]);
	const [searchLibraryText, setSearchLibraryText] = useState("");
	const [filteredPinnedList, setFilteredPinnedList] =
		useState(pinnedPlacesList);

	const [homePinned, setHomePinned] = useState(null);
	const [workPinned, setWorkPinned] = useState(null);
	const [schoolPinned, setSchoolPinned] = useState(null);

	const [selectedLibrary, setSelectedLibrary] = useState("");
	const [processedHistory, setProcessedHistory] = useState([]);
	const [listViewType, setListViewType] = useState("list");
	const [sortBy, setSortBy] = useState("date");
	const [isShowActionId, setIsShowActionId] = useState("");

	const [isAddToLibrary, setIsAddToLibrary] = useState(false);
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [isFocusSearch, setIsFocusSearch] = useState(false);
	const [suggestions, setSuggestions] = useState([]);
	const [selectedSuggestions, setSelectedSuggestions] = useState([]);
	const [isShowDeleteOption, setIsShowDeleteOption] = useState(false);
	const [deletionSelected, setDeletionSelected] = useState([]);

	const [isShowDotAction, setIsShowDotAction] = useState(false);
	const [isShowMultiDelete, setIsShowMultiDelete] = useState(false);
	const [isShowPinDelete, setIsShowPinDelete] = useState(false);
	const [showNoDirection, setShowNoDirection] = useState(false);

	const [storePinned, setStorePinned] = useState(null);
	const [storeTitle, setStoreTitle] = useState("");

	useEffect(() => {
		const processSuggestionsAndHistory = async () => {
			let rawList = [];

			if (recentHistory?.length > 0) {
				const detailedHistory = await Promise.all(
					recentHistory.map((item) =>
						fetchPlaceDetail(item?.place_id, currentLocation)
					)
				);
				rawList = detailedHistory;
			}

			const formattedList = await Promise.all(
				rawList.map(async (item) => {
					const addressF =
						item?.secondary_text || item?.structured_formatting?.secondary_text;

					const formatted = await getFormattedAddress(
						item?.address_components || [],
						addressF || ""
					);

					return {
						...item,
						secondary_text: addressF,
						formatted_address: formatted,
					};
				})
			);

			const checkPinnedList = formattedList?.map((item) => {
				const pinnedMatch = pinnedPlacesList?.find(
					(p) => p?.place_id === item?.place_id
				);
				return {
					...item,
					isPinned: !!pinnedMatch,
					pinnedId: pinnedMatch ? pinnedMatch?.id : null,
					pinnedType: pinnedMatch ? pinnedMatch?.pinnedType : null,
				};
			});

			setProcessedHistory(checkPinnedList);
		};

		processSuggestionsAndHistory();
	}, [recentHistory, currentLocation, pinnedPlacesList]);

	useEffect(() => {
		const mergedList =
			libraryList?.map((libItem) => {
				const pinnedMatch = pinnedPlacesList?.find(
					(p) => p.place_id === libItem?.place_id
				);

				return {
					...libItem,
					isPinned: !!pinnedMatch,
					pinnedId: pinnedMatch ? pinnedMatch?.id : null,
					pinnedType: pinnedMatch ? pinnedMatch?.pinnedType : null,
					isOnlyPinned: false,
				};
			}) || [];

		pinnedPlacesList?.forEach((pinned) => {
			const exists = mergedList?.some(
				(item) => item?.place_id === pinned?.place_id
			);

			if (!exists) {
				mergedList?.push({
					...pinned,
					place_id: pinned?.place_id,
					structured_formatting: {
						main_text: pinned?.label || pinned?.main_text,
						secondary_text: pinned?.secondary_text || "",
					},
					isPinned: true,
					pinnedId: pinned?.id,
					pinnedType: pinned?.pinnedType,
					isOnlyPinned: true,
				});
			}
		});

		setMergeList(mergedList);
		setFilteredLibraryList(sortLibraryList(mergedList, sortBy));
	}, [libraryList, pinnedPlacesList, sortBy]);

	useEffect(() => {
		if (pinnedPlacesList?.length > 0) {
			const home = pinnedPlacesList.find((item) => item.pinnedType === "home");
			const work = pinnedPlacesList.find((item) => item.pinnedType === "work");
			const school = pinnedPlacesList.find(
				(item) => item.pinnedType === "school"
			);

			const others = pinnedPlacesList.filter(
				(item) =>
					item.pinnedType !== "home" &&
					item.pinnedType !== "work" &&
					item.pinnedType !== "school"
			);

			setHomePinned(home || null);
			setWorkPinned(work || null);
			setSchoolPinned(school || null);
			setFilteredPinnedList(others);
		}
	}, [pinnedPlacesList]);

	useEffect(() => {
		if (pinnedPlacesList && storePinned) {
			const stillExists = pinnedPlacesList.find(
				(item) => item.id === storePinned?.id
			);

			if (stillExists && storePinned) {
				const addressF =
					stillExists?.secondary_text ||
					stillExists?.structured_formatting?.secondary_text;

				const pinnedPlace = {
					id: stillExists?.id,
					display_id: stillExists?.display_id,
					place_id: stillExists?.place_id,
					main_text:
						stillExists?.main_text ||
						stillExists?.structured_formatting?.main_text,
					secondary_text: addressF,
					formatted_address: storePinned?.formatted_address,
					user_contacts: stillExists?.user_contacts,
					coords: stillExists?.coords,
					distanceMiles: stillExists?.distanceMiles,
					durationETA: stillExists?.durationETA,
					photos: stillExists?.photos || [],
				};

				openPinPanel(storeTitle, pinnedPlace);
			}
		}
	}, [pinnedPlacesList]);

	const sortLibraryList = (list, sortType) => {
		switch (sortType) {
			case "name":
				return [...list].sort((a, b) => {
					const aName =
						a?.structured_formatting?.main_text?.toLowerCase() || "";
					const bName =
						b?.structured_formatting?.main_text?.toLowerCase() || "";
					return aName.localeCompare(bName);
				});
			case "distance":
				return [...list].sort((a, b) => {
					const aDistance = a?.distanceMiles ?? Infinity;
					const bDistance = b?.distanceMiles ?? Infinity;
					return aDistance - bDistance;
				});
			case "date":
			default:
				return list;
		}
	};
	const handleListViewType = (type) => {
		setListViewType(type);
		setIsShowDotAction(false);
	};
	const handleSortBy = (type) => {
		setSortBy(type);
		setIsShowDotAction(false);
	};
	const ActionButton = ({
		iconLibrary,
		iconName,
		iconSize = 18,
		title,
		onPress,
		isChecked = false,
	}) => (
		<TouchableOpacity
			style={{ ...CommonStyles.directionRowSB }}
			onPress={onPress}
		>
			<View style={{ ...CommonStyles.directionRowCenter }}>
				<View style={styles.selectableIconBox}>
					{isChecked && (
						<Icons
							iconSetName={"MaterialDesignIcons"}
							iconName={"check"}
							iconColor={Colors.labelBlack}
							iconSize={18}
						/>
					)}
				</View>
				<Text style={styles.gridActionTxt}>{title}</Text>
			</View>
			<View>
				<Icons
					iconSetName={iconLibrary}
					iconName={iconName}
					iconColor={Colors.labelBlack}
					iconSize={iconSize}
				/>
			</View>
		</TouchableOpacity>
	);
	const onHeaderClose = () => {
		setSelectedLibrary("");
		setIsShowActionId("");
		setIsShowDotAction(false);
		setListViewType("list");
	};
	const HeaderComponent = ({ type }) => (
		<View
			style={{
				...CommonStyles.directionRowSB,
				...LayoutStyle.marginBottom20,
			}}
		>
			{isShowDeleteOption ? (
				<>
					<TouchableOpacity
						onPress={() => {
							setIsShowDeleteOption(false);
							setDeletionSelected([]);
						}}
					>
						<Text style={styles.headerBlueBtnTxt}>{"Done"}</Text>
					</TouchableOpacity>
					<Text style={styles.smallHeaderTitle}>{"Select Places"}</Text>
					<TouchableOpacity
						style={[
							styles.closeBtn,
							{ opacity: deletionSelected.length > 0 ? 1 : 0.5 },
						]}
						onPress={() => setIsShowMultiDelete(!isShowMultiDelete)}
						disabled={deletionSelected.length === 0}
					>
						<Icons
							iconSetName={"MaterialDesignIcons"}
							iconName={"dots-horizontal"}
							iconSize={16}
							iconColor={Colors.blueActiveBtn}
						/>
					</TouchableOpacity>
					{isShowMultiDelete && (
						<View style={styles.multipleDltBox}>
							<TouchableOpacity
								style={{ ...CommonStyles.directionRowSB }}
								onPress={deleteMultiplePlace}
							>
								<Text style={styles.dltTxt}>{"Delete from Library"}</Text>
								<Icons
									iconSetName={"MaterialDesignIcons"}
									iconName={"delete-outline"}
									iconColor={Colors.errorBoxRed}
									iconSize={20}
								/>
							</TouchableOpacity>
						</View>
					)}
				</>
			) : isShowPinDelete ? (
				<>
					<TouchableOpacity
						onPress={() => {
							setIsShowPinDelete(false);
						}}
					>
						<Text style={styles.headerBlueBtnTxt}>{"Done"}</Text>
					</TouchableOpacity>
					<Text style={[styles.smallHeaderTitle, { left: -20 }]}>
						{"Pinned"}
					</Text>
					<View />
				</>
			) : (
				<>
					<Text style={styles.recentTitle}>{selectedLibrary}</Text>
					<View style={{ ...CommonStyles.directionRowCenter }}>
						<TouchableOpacity
							style={styles.headerAddBtn}
							onPress={() => {
								if (selectedLibrary === "Pinned") {
									openPinPanel(`Add Pin`, null);
								} else {
									setIsAddToLibrary(true);
									setIsShowActionId("");
								}
							}}
						>
							<Icons
								iconSetName={"Feather"}
								iconName={"plus"}
								iconSize={16}
								iconColor={Colors.blueActiveBtn}
							/>
							<Text style={styles.headerAddbtnTxt}>{"Add"}</Text>
						</TouchableOpacity>
						{type === "Pinned" ? (
							<TouchableOpacity
								style={[styles.closeBtn, { marginHorizontal: 10 }]}
								onPress={() => setIsShowPinDelete(!isShowPinDelete)}
							>
								<Icons
									iconSetName={"Ionicons"}
									iconName={"pencil-sharp"}
									iconSize={16}
									iconColor={Colors.blueActiveBtn}
								/>
							</TouchableOpacity>
						) : (
							<>
								<TouchableOpacity
									style={[styles.closeBtn, { marginHorizontal: 10 }]}
									onPress={() => {
										setIsShowDotAction(!isShowDotAction);
										setIsShowActionId("");
									}}
								>
									<Icons
										iconSetName={"MaterialDesignIcons"}
										iconName={"dots-horizontal"}
										iconSize={16}
										iconColor={Colors.blueActiveBtn}
									/>
								</TouchableOpacity>
								{isShowDotAction && (
									<View style={styles.tripleDotActionBox}>
										<View style={styles.tripleDotWhiteBox}>
											<ActionButton
												title={"Select"}
												iconLibrary={"Ionicons"}
												iconName={"checkmark-circle-outline"}
												onPress={() => {
													setIsShowDeleteOption(!isShowDeleteOption);
													setIsShowDotAction(!isShowDotAction);
												}}
											/>
										</View>
										<View style={styles.tripleDotOptionBox}>
											<View style={{ paddingHorizontal: 26 }}>
												<Text style={styles.actionTitle}>{"View"}</Text>
											</View>
											<View style={[styles.div, { marginVertical: 7 }]} />
											<ActionButton
												title={"List"}
												iconLibrary={"Feather"}
												iconName={"list"}
												isChecked={listViewType === "list"}
												onPress={() => handleListViewType("list")}
											/>
											<View style={[styles.div, { marginVertical: 7 }]} />
											<ActionButton
												title={"Grid"}
												iconLibrary={"Feather"}
												iconName={"grid"}
												isChecked={listViewType === "grid"}
												onPress={() => handleListViewType("grid")}
											/>
										</View>
										<View
											style={[
												styles.tripleDotOptionBox,
												{
													borderBottomLeftRadius: 10,
													borderBottomRightRadius: 10,
												},
											]}
										>
											<View style={{ paddingHorizontal: 26 }}>
												<Text style={styles.actionTitle}>{"Sort by"}</Text>
											</View>
											<View style={[styles.div, { marginVertical: 7 }]} />
											<ActionButton
												title={"Date"}
												iconLibrary={"Ionicons"}
												iconName={"calendar-outline"}
												isChecked={sortBy === "date"}
												onPress={() => handleSortBy("date")}
											/>
											<View style={[styles.div, { marginVertical: 7 }]} />
											<ActionButton
												title={"Name"}
												iconLibrary={"MaterialDesignIcons"}
												iconName={"alphabet-latin"}
												iconSize={21}
												isChecked={sortBy === "name"}
												onPress={() => handleSortBy("name")}
											/>
											<View style={[styles.div, { marginVertical: 7 }]} />
											<ActionButton
												title={"Distance"}
												iconLibrary={"Feather"}
												iconName={"navigation"}
												isChecked={sortBy === "distance"}
												onPress={() => handleSortBy("distance")}
											/>
										</View>
									</View>
								)}
							</>
						)}
						<TouchableOpacity style={[styles.closeBtn]} onPress={onHeaderClose}>
							<Icons
								iconSetName={"MaterialCommunityIcons"}
								iconName={"window-close"}
								iconSize={16}
								iconColor={"#888"}
							/>
						</TouchableOpacity>
					</View>
				</>
			)}
		</View>
	);
	const onChangeLibraryText = (text) => {
		setSearchLibraryText(text);

		let baseList = [...mergeList];

		if (text.trim() !== "") {
			baseList = baseList.filter((item) => {
				const main =
					item?.structured_formatting?.main_text?.toLowerCase() || "";
				const secondary =
					item?.structured_formatting?.secondary_text?.toLowerCase() || "";
				return (
					main.includes(text.toLowerCase()) ||
					secondary.includes(text.toLowerCase())
				);
			});
		}

		setFilteredLibraryList(sortLibraryList(baseList, sortBy));
	};
	const onPressClose = () => {
		setSearchLibraryText("");
		setFilteredLibraryList(sortLibraryList(mergeList, sortBy));
	};
	const formatLocationItem = (item) => {
		return {
			description: item.description,
			place_id: item.place_id,
			structured_formatting: {
				main_text: item.structured_formatting?.main_text || item?.main_text,
				secondary_text:
					item.structured_formatting?.secondary_text || item?.secondary_text,
			},
			types: item.types,
			coords: item.coords,
			address_components: item.address_components,
			city: item.city,
			distanceMiles: item.distanceMiles,
			durationETA: item.durationETA,
			id: item.id || "",
			type: item.type || "",
		};
	};
	const handleSuggestion = (item) => {
		const cleanedItem = formatLocationItem(item);
		const isAlreadySelected = selectedSuggestions.some(
			(suggestion) => suggestion.place_id === cleanedItem.place_id
		);

		if (isAlreadySelected) {
			const updated = selectedSuggestions.filter(
				(suggestion) => suggestion.place_id !== cleanedItem.place_id
			);
			setSelectedSuggestions(updated);
		} else {
			setSelectedSuggestions([...selectedSuggestions, cleanedItem]);
		}
	};
	const clearSuggestion = () => {
		setIsAddToLibrary(false);
		setLoading(false);
		setSearchText("");
		setIsFocusSearch(false);
		setSuggestions([]);
		setSelectedSuggestions([]);
	};
	const handleDoneAddToLibrary = () => {
		const newItems = selectedSuggestions.filter(
			(item) => !libraryList.some((place) => place.place_id === item.place_id)
		);

		if (newItems.length > 0) {
			const updatedList = [...newItems, ...libraryList];
			dispatch(storeLibraryPlace(updatedList));
		}
		clearSuggestion();
	};
	const deleteLibraryPlace = (item) => {
		dispatch(removeLibraryPlace([item.place_id]));
	};
	const deleteMultiplePlace = () => {
		const filterIds = deletionSelected.map((item) => item.place_id);
		if (filterIds.length > 0) {
			dispatch(removeLibraryPlace(filterIds));
		}
		setDeletionSelected([]);
		setIsShowDeleteOption(false);
		setIsShowMultiDelete(false);
	};
	const shareLibraryPlace = (item) => {
		if (!item) return;

		const placeId = item?.place_id || item;
		const url = `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${placeId}`;

		Share.open({
			title: "Location",
			message: "Check out this place",
			url: url,
		});
	};
	const handleSelectDeletion = (item) => {
		const alreadySelected = deletionSelected.some(
			(selectedItem) => selectedItem.place_id === item.place_id
		);

		if (alreadySelected) {
			setDeletionSelected((prev) =>
				prev.filter((selectedItem) => selectedItem.place_id !== item.place_id)
			);
		} else {
			setDeletionSelected((prev) => [...prev, item]);
		}
	};
	const handleAddPin = async (item) => {
		try {
			setIsPageLoader(true);
			const payload = {
				type: "other",
				label: item?.structured_formatting?.main_text || item?.main_text,
				place_id: item?.place_id,
			};

			const response = await Api.post(`user/save-library-data`, payload);
			setIsPageLoader(false);

			if (response.success) {
				setIsShowActionId("");
				getPinnedPlaces();
				showMessage({
					message: response.message,
					type: "success",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			} else {
				showMessage({
					message: response.message,
					type: "danger",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			}
		} catch (error) {
			console.warn("Error: ", error);
			setIsPageLoader(false);
		}
	};
	const handleSearchPlace = (item) => {
		if (!item?.coords) {
			setCustomSnapPoints(["45%"]);
			setShowNoDirection(true);
		} else {
			openRouteDetailPanel(item);
			changeDestiByPanel(item);
		}
	};
	const SearchedPlace = ({ item, type, index, isLastIndex }) => {
		const isSelected = selectedSuggestions.some(
			(suggestion) => suggestion.place_id === item.place_id
		);
		const isDeleteSelected = deletionSelected.some(
			(place) => place?.place_id === item?.place_id
		);
		const iconConfig = {
			home: { name: "home", color: "#33d0eb", set: "Ionicons" },
			work: { name: "briefcase", color: "#94694f", set: "Ionicons" },
			school: { name: "school", color: "#94694f", set: "Ionicons" },
		};

		const pin = iconConfig[item?.pinnedType];

		return (
			<TouchableOpacity
				style={{
					borderTopLeftRadius: isDeleteSelected && index === 0 ? 5 : 0,
					borderTopRightRadius: isDeleteSelected && index === 0 ? 5 : 0,
					borderBottomLeftRadius: isDeleteSelected && isLastIndex ? 5 : 0,
					borderBottomRightRadius: isDeleteSelected && isLastIndex ? 5 : 0,
					backgroundColor: isDeleteSelected ? "#ccc" : "transparent",
				}}
				onPress={() => handleSearchPlace(item)}
			>
				<View style={styles.searchPlaceRow}>
					<View style={{ ...CommonStyles.directionRowCenter }}>
						{isShowDeleteOption && (
							<TouchableOpacity
								style={{ ...LayoutStyle.marginHorizontal10 }}
								onPress={() => handleSelectDeletion(item)}
							>
								<Icons
									iconSetName={isDeleteSelected ? "Ionicons" : "Feather"}
									iconName={
										isDeleteSelected ? "checkmark-circle-sharp" : "circle"
									}
									iconSize={20}
									iconColor={
										isDeleteSelected
											? Colors.blueActiveBtn
											: Colors.labelDarkGray
									}
								/>
							</TouchableOpacity>
						)}
						<View
							style={[
								styles.nearByIcon,
								{
									backgroundColor: pin ? pin.color : Colors.white,
									marginRight: 0,
								},
							]}
						>
							<Icons
								iconSetName={pin ? pin.set : "MaterialDesignIcons"}
								iconName={pin ? pin.name : "record-circle"}
								iconColor={pin ? Colors.white : "#667cf1"}
								iconSize={pin ? 18 : 38}
							/>
						</View>
						<View style={{ flex: 0.9, marginLeft: 10 }}>
							<Text
								numberOfLines={1}
								style={[
									styles.searchedDestination,
									{ fontFamily: FontFamily.PoppinsSemiBold },
								]}
							>
								{item?.structured_formatting?.main_text || item?.main_text}
							</Text>
							<Text numberOfLines={1} style={styles.suggestionDesTxt}>
								{item?.structured_formatting?.secondary_text ||
									item?.secondary_text}
							</Text>
							{item?.isPinned && (
								<View style={{ ...CommonStyles.directionRowCenter }}>
									<Icons
										iconSetName={"MaterialDesignIcons"}
										iconName={"pin"}
										iconColor={Colors.labelDarkGray}
										iconSize={16}
									/>
									<Text style={styles.suggestionDesTxt}>{"Pinned"}</Text>
								</View>
							)}
						</View>
					</View>
					{!isShowDeleteOption && (
						<>
							{type === "library" ? (
								<TouchableOpacity
									onPress={() => {
										if (isShowActionId === item?.place_id) {
											setIsShowActionId("");
										} else {
											setIsShowActionId(item?.place_id);
										}
									}}
								>
									<Icons
										iconSetName={"MaterialDesignIcons"}
										iconName={"dots-horizontal"}
										iconColor={Colors.blueActiveBtn}
										iconSize={22}
									/>
								</TouchableOpacity>
							) : (
								<>
									<TouchableOpacity onPress={() => handleSuggestion(item)}>
										<Icons
											iconSetName={
												isSelected ? "MaterialDesignIcons" : "Ionicons"
											}
											iconName={isSelected ? "check" : "add-sharp"}
											iconColor={isSelected ? "#888" : Colors.blueActiveBtn}
											iconSize={22}
										/>
									</TouchableOpacity>
								</>
							)}
						</>
					)}
				</View>
				{!isLastIndex && (
					<View style={[styles.divDark, { marginVertical: 0 }]} />
				)}
				{item.place_id === isShowActionId && (
					<View style={styles.libraryPlaceAction}>
						<View style={styles.pinShareContainer}>
							<View style={{ ...CommonStyles.directionRowSB }}>
								<TouchableOpacity
									onPress={() => {
										if (!item?.isPinned) {
											handleAddPin(item);
										} else {
											removePinnedPlace(item?.pinnedId);
										}
									}}
									style={styles.justifyCenter}
								>
									<Icons
										iconSetName={"MaterialDesignIcons"}
										iconName={item?.isPinned ? "pin" : "pin-outline"}
										iconColor={Colors.iconBlack}
										iconSize={18}
									/>
									<Text style={styles.actionBlackTxt}>
										{item?.isPinned ? "Unpin" : "Pin"}
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.justifyCenter}
									onPress={() => shareLibraryPlace(item)}
								>
									<Icons
										iconSetName={"MaterialIcons"}
										iconName={"ios-share"}
										iconColor={Colors.iconBlack}
										iconSize={18}
									/>
									<Text style={styles.actionBlackTxt}>{"Share"}</Text>
								</TouchableOpacity>
							</View>
						</View>
						<View style={styles.noteNDeleteContainer}>
							<TouchableOpacity
								style={{ ...CommonStyles.directionRowSB, paddingVertical: 10 }}
								onPress={() => openNotePanel(item.place_id)}
							>
								<Text style={styles.moreActionTxt}>{"Add a Note"}</Text>
								<Icons
									iconSetName={"MaterialDesignIcons"}
									iconName={"newspaper-plus"}
									iconColor={Colors.iconBlack}
									iconSize={22}
								/>
							</TouchableOpacity>
							{!item?.isOnlyPinned && <View style={styles.divDark} />}
							{!item?.isOnlyPinned && (
								<TouchableOpacity
									style={{
										...CommonStyles.directionRowSB,
										paddingVertical: 10,
									}}
									onPress={() => deleteLibraryPlace(item)}
								>
									<Text
										style={[
											styles.moreActionTxt,
											{ color: Colors.errorBoxRed },
										]}
									>
										{"Delete from Library"}
									</Text>
									<Icons
										iconSetName={"MaterialDesignIcons"}
										iconName={"delete-outline"}
										iconColor={Colors.errorBoxRed}
										iconSize={22}
									/>
								</TouchableOpacity>
							)}
						</View>
					</View>
				)}
			</TouchableOpacity>
		);
	};
	const GridPlace = ({ row, rowIndex }) => {
		return (
			<View key={rowIndex} style={styles.gridRow}>
				{row.map((item, index) => {
					const isDeleteSelected = deletionSelected.some(
						(place) => place?.place_id === item?.place_id
					);
					return (
						<View key={index} style={styles.gridWhiteBox}>
							<View style={styles.flex}>
								<Image
									source={{
										uri: item?.photos?.length > 0 ? item?.photos[0] : noImgUrl,
									}}
									style={styles.gridPlaceImg}
									resizeMode={"cover"}
								/>
								{isShowDeleteOption && (
									<TouchableOpacity
										style={styles.gridCheckIcon}
										onPress={() => handleSelectDeletion(item)}
									>
										<Icons
											iconSetName={isDeleteSelected ? "Ionicons" : "Feather"}
											iconName={
												isDeleteSelected ? "checkmark-circle-sharp" : "circle"
											}
											iconSize={20}
											iconColor={
												isDeleteSelected ? Colors.blueActiveBtn : Colors.white
											}
										/>
									</TouchableOpacity>
								)}
								<View style={{ padding: 12 }}>
									<Text numberOfLines={2} style={styles.gridPlaceTitle}>
										{item?.structured_formatting?.main_text}
									</Text>
									<Text numberOfLines={2} style={styles.gridPlaceAddrs}>
										{item?.structured_formatting?.secondary_text}
									</Text>
								</View>
							</View>
						</View>
					);
				})}
				{row.length < 2 && <View style={styles.gridWhiteBox} />}
			</View>
		);
	};
	const PinSuggestion = ({ item }) => {
		const addressF =
			item?.secondary_text || item?.structured_formatting?.secondary_text;

		const location = {
			main_text: item?.main_text || item?.structured_formatting?.main_text,
			secondary_text: addressF,
			formatted_address: item?.formatted_address,
			coords: item?.coords,
			distanceMiles: item?.distanceMiles,
			durationETA: item?.durationETA,
		};

		return (
			<TouchableOpacity onPress={() => handleSearchPlace(location)}>
				<View style={styles.suggestionRow}>
					<View style={{ ...CommonStyles.directionRowCenter }}>
						<View
							style={[
								styles.nearByIcon,
								{ backgroundColor: Colors.errorBoxRed },
							]}
						>
							<Icons
								iconSetName={"FontAwesome6"}
								iconName={"map-pin"}
								iconColor={Colors.white}
								iconSize={18}
							/>
						</View>
						<View style={{ flex: 0.9 }}>
							<Text
								numberOfLines={2}
								style={[
									styles.searchedDestination,
									{ fontFamily: FontFamily.PoppinsSemiBold },
								]}
							>
								{location?.main_text}
							</Text>
							<Text numberOfLines={2} style={styles.suggestionDesTxt}>
								{location?.secondary_text}
							</Text>
						</View>
					</View>
					<TouchableOpacity
						onPress={() => {
							if (!item?.isPinned) {
								handleAddPin(item);
							} else {
								removePinnedPlace(item?.pinnedId);
							}
						}}
					>
						{/* <Icons
							iconSetName={"MaterialDesignIcons"}
							iconName={"pin-outline"}
							iconColor={Colors.blueActiveBtn}
							iconSize={22}
						/> */}
						<Icons
							iconSetName={"MaterialDesignIcons"}
							iconName={item?.isPinned ? "pin" : "pin-outline"}
							iconColor={Colors.blueActiveBtn}
							iconSize={22}
						/>
					</TouchableOpacity>
				</View>
			</TouchableOpacity>
		);
	};
	const LibraryCount = ({
		iconLibrary,
		iconName,
		title,
		count,
		isDiv = true,
	}) => (
		<>
			<TouchableOpacity
				onPress={() => setSelectedLibrary(title)}
				style={{ ...CommonStyles.directionRowSB }}
			>
				<View style={{ ...CommonStyles.directionRowCenter }}>
					<View style={{ ...LayoutStyle.marginRight10 }}>
						<Icons
							iconSetName={iconLibrary}
							iconName={iconName}
							iconColor={Colors.blueActiveBtn}
							iconSize={22}
						/>
					</View>
					<Text style={styles.libraryTypeTxt}>{title}</Text>
				</View>
				<View style={{ ...CommonStyles.directionRowCenter }}>
					<Text style={styles.libraryTypeCountTxt}>{count}</Text>
					<View style={{ bottom: 2 }}>
						<Icons
							iconSetName={"Entypo"}
							iconName={"chevron-small-right"}
							iconColor={Colors.labelDarkGray}
							iconSize={16}
						/>
					</View>
				</View>
			</TouchableOpacity>
			{isDiv && <View style={styles.div} />}
		</>
	);
	const openRightSwipe = (key) => {
		const ref = swipeableRefs.current[key];
		if (ref) {
			ref.openRight();
		}
	};
	const handlePinnedSuggestion = (item, type) => {
		if (!item) {
			openPinPanel(`Set Up ${type}`, null);
		} else if (item?.coords) {
			openRouteDetailPanel(item);
			changeDestiByPanel(item);
		} else {
			setCustomSnapPoints(["45%"]);
			setShowNoDirection(true);
		}
	};
	const handlePinnedInfo = async (item, type) => {
		const addressF =
			item?.secondary_text || item?.structured_formatting?.secondary_text;

		const formatted = await getFormattedAddress(
			item?.address_components || [],
			addressF || ""
		);

		let title = "Add Pin";
		if (type === "Home") {
			title = "Set Up Home";
		} else if (type === "Work") {
			title = "Set Up Work";
		} else {
			title = "Add Pin";
		}

		const pinnedPlace = {
			id: item?.id,
			display_id: item?.display_id,
			place_id: item?.place_id,
			main_text: item?.main_text || item?.structured_formatting?.main_text,
			secondary_text: addressF,
			formatted_address: formatted,
			user_contacts: item?.user_contacts,
			coords: item?.coords,
			distanceMiles: item?.distanceMiles,
			durationETA: item?.durationETA,
			photos: item?.photos || [],
		};
		setStorePinned(pinnedPlace);
		setStoreTitle(title);
		openPinPanel(title, pinnedPlace);
	};
	const ListItem = ({
		iconLibrary,
		iconName,
		iconColor = Colors.blueActiveBtn,
		iconBackground,
		title,
		isAddBtn = false,
		description = "",
		itemKey,
		onPress,
		handlePinnedInfo,
	}) => (
		<TouchableOpacity onPress={onPress} style={styles.searchPlaceRow}>
			<View style={{ ...CommonStyles.directionRowCenter }}>
				{isShowPinDelete && (
					<TouchableOpacity
						style={{ marginRight: 10, opacity: isAddBtn ? 0.5 : 1 }}
						onPress={() => openRightSwipe(itemKey)}
						disabled={isAddBtn}
					>
						<Icons
							iconSetName={"Ionicons"}
							iconName={"remove-circle"}
							iconSize={26}
							iconColor={Colors.errorBoxRed}
						/>
					</TouchableOpacity>
				)}
				<View
					style={[
						styles.directionCircle,
						{
							backgroundColor: iconBackground ? iconBackground : "transparent",
						},
					]}
				>
					<Icons
						iconSetName={iconLibrary}
						iconName={iconName}
						iconColor={iconColor}
						iconSize={iconBackground ? 18 : 28}
					/>
				</View>
				<View style={[styles.flex, { ...CommonStyles.directionRowSB }]}>
					<View style={{ flex: 1 }}>
						<Text numberOfLines={1} style={styles.recentDestination}>
							{title}
						</Text>
						{isAddBtn ? (
							<Text style={[styles.addPinTxt]}>{"Add"}</Text>
						) : (
							<Text numberOfLines={1} style={styles.locationDesTxt}>
								{description}
							</Text>
						)}
					</View>
					{!isShowDeleteOption && !isAddBtn && (
						<TouchableOpacity style={{}} onPress={handlePinnedInfo}>
							<Icons
								iconSetName={"Ionicons"}
								iconName={"information-circle-outline"}
								iconColor={Colors.blueActiveBtn}
								iconSize={22}
							/>
						</TouchableOpacity>
					)}
				</View>
			</View>
		</TouchableOpacity>
	);
	const PinnedSuggestion = ({
		itemKey,
		iconLibrary,
		iconName,
		iconColor = Colors.blueActiveBtn,
		iconBackground,
		title,
		isAddBtn = false,
		description = "",
		id = "",
		placeId,
		onPress,
		handlePinnedInfo,
	}) => {
		return (
			<>
				{!isShowPinDelete ? (
					<ListItem
						itemKey={itemKey}
						iconLibrary={iconLibrary}
						iconName={iconName}
						iconBackground={iconBackground}
						iconColor={iconColor}
						title={title}
						isAddBtn={isAddBtn}
						description={description}
						onPress={onPress}
						handlePinnedInfo={handlePinnedInfo}
					/>
				) : (
					<Swipeable
						ref={(ref) => {
							if (ref) swipeableRefs.current[itemKey] = ref;
						}}
						renderLeftActions={() => LeftSwipeActions()}
						renderRightActions={() =>
							!isAddBtn ? rightSwipeActions(id, placeId) : <></>
						}
						friction={1}
						containerStyle={{
							overflow: "hidden",
						}}
					>
						<ListItem
							itemKey={itemKey}
							iconLibrary={iconLibrary}
							iconName={iconName}
							iconColor={iconColor}
							iconBackground={iconBackground}
							title={title}
							isAddBtn={isAddBtn}
							description={description}
							onPress={onPress}
							handlePinnedInfo={handlePinnedInfo}
						/>
					</Swipeable>
				)}
			</>
		);
	};
	const LeftSwipeActions = () => {
		return <></>;
	};
	const rightSwipeActions = (id, placeId) => {
		return (
			<View style={{ ...CommonStyles.directionRowCenter, flex: 0.4 }}>
				<TouchableOpacity
					style={[styles.recentSwipeBtn]}
					onPress={() => shareLibraryPlace(placeId)}
				>
					<Text style={styles.recentSwipeBtnTxt}>{"Share"}</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.recentSwipeBtn, { backgroundColor: Colors.red }]}
					onPress={() => removePinnedPlace(id)}
				>
					<Text style={styles.recentSwipeBtnTxt}>{"Delete"}</Text>
				</TouchableOpacity>
			</View>
		);
	};
	const removePinnedPlace = async (id) => {
		try {
			setIsPageLoader(true);
			const data = {
				id: [id],
			};

			const response = await Api.post(`user/delete-saved-library`, data);
			setIsPageLoader(false);

			if (response.success) {
				setIsShowPinDelete(false);
				setIsShowActionId("");
				getPinnedPlaces();
				showMessage({
					message: response.message,
					type: "success",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			} else {
				showMessage({
					message: response.message,
					type: "danger",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			}
		} catch (error) {
			setIsPageLoader(false);
			console.warn("Error: ", error);
		}
	};
	const onPressCloseLocation = () => {
		setLoading(false);
		setSearchText("");
		setSuggestions([]);
	};
	const handleWithoutFeedback = () => {
		setIsShowActionId("");
		setIsShowDotAction(false);
		setIsShowMultiDelete(false);
	};
	const closeNoRoute = () => {
		setCustomSnapPoints([]);
		setShowNoDirection(false);
	};
	const chunkArray = (array, size) => {
		const chunked = [];
		for (let i = 0; i < array?.length; i += size) {
			chunked.push(array?.slice(i, i + size));
		}
		return chunked;
	};
	const rows = chunkArray(filteredLibraryList, 2);

	return (
		<BottomSheetModal
			ref={libraryPanelRef}
			snapPoints={customSnapPoints.length > 0 ? customSnapPoints : snapPoints}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={true}
			enableDynamicSizing={false}
			backgroundStyle={styles.backgroundStyle}
		>
			<Loader show={isPageLoader} />
			<TouchableWithoutFeedback
				onPress={handleWithoutFeedback}
				accessible={false}
			>
				<View onStartShouldSetResponder={() => true} style={{ flex: 1 }}>
					<BottomSheetScrollView
						style={styles.flex}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{
							...LayoutStyle.paddingHorizontal20,
							paddingBottom: isShowActionId ? 160 : 20,
						}}
					>
						{!showNoDirection ? (
							<View style={styles.flex}>
								{!isAddToLibrary ? (
									<>
										{!selectedLibrary ? (
											<>
												<View
													style={[
														{
															...CommonStyles.directionRowSB,
															...LayoutStyle.marginBottom20,
														},
													]}
												>
													<Text style={styles.recentTitle}>{"Library"}</Text>
													<TouchableOpacity
														style={[styles.closeBtn]}
														onPress={handleLibraryClosePanel}
													>
														<Icons
															iconSetName={"MaterialCommunityIcons"}
															iconName={"window-close"}
															iconSize={16}
															iconColor={"#888"}
														/>
													</TouchableOpacity>
												</View>

												<View style={styles.library}>
													<LibraryCount
														iconLibrary={"MaterialDesignIcons"}
														iconName={"pin-outline"}
														title={"Pinned"}
														count={pinnedPlacesList?.length}
													/>
													<LibraryCount
														iconLibrary={"Octicons"}
														iconName={"location"}
														title={"Places"}
														count={libraryList?.length}
														isDiv={false}
													/>
												</View>
												<View style={[styles.titleHeaderRow, {}]}>
													<Text style={styles.headerTxt}>
														{"Recently Added"}
													</Text>
												</View>
												<View style={styles.searchPlace}>
													{mergeList?.length > 0 && (
														<View style={[styles.searchPlace]}>
															{mergeList?.map((item, index) => {
																const isLastIndex =
																	index === mergeList?.length - 1;
																return (
																	<View
																		key={item.place_id}
																		style={{
																			position: "relative",
																			zIndex:
																				isShowActionId === item.place_id
																					? 2
																					: 1,
																		}}
																	>
																		<SearchedPlace
																			item={item}
																			type={"library"}
																			index={index}
																			isLastIndex={isLastIndex}
																		/>
																	</View>
																);
															})}
														</View>
													)}
												</View>
											</>
										) : selectedLibrary === "Pinned" ? (
											<>
												<HeaderComponent type={"Pinned"} />
												<View style={styles.searchPlace}>
													{!homePinned ? (
														<PinnedSuggestion
															itemKey={"a1"}
															iconBackground={"#E5E5E5"}
															iconLibrary={"FontAwesome"}
															iconName={"home"}
															title={"Home"}
															isAddBtn={true}
															onPress={() =>
																handlePinnedSuggestion(null, "Home")
															}
														/>
													) : (
														<PinnedSuggestion
															itemKey={homePinned?.display_id}
															id={homePinned?.id}
															iconBackground={"#33d0eb"}
															iconLibrary={"FontAwesome"}
															iconName={"home"}
															iconColor={Colors.white}
															title={"Home"}
															description={`${homePinned?.label} • ${homePinned?.city}`}
															city={homePinned?.city}
															placeId={homePinned?.place_id}
															onPress={() =>
																handlePinnedSuggestion(homePinned, "Home")
															}
															handlePinnedInfo={() =>
																handlePinnedInfo(homePinned, "Home")
															}
														/>
													)}
													<View style={[styles.div, { marginVertical: 0 }]} />
													{!workPinned ? (
														<PinnedSuggestion
															itemKey={"a2"}
															iconBackground={"#E5E5E5"}
															iconLibrary={"Ionicons"}
															iconName={"briefcase"}
															title={"Work"}
															isAddBtn={true}
															onPress={() =>
																handlePinnedSuggestion(null, "Work")
															}
														/>
													) : (
														<PinnedSuggestion
															itemKey={workPinned?.display_id}
															id={workPinned?.id}
															iconBackground={"#94694f"}
															iconLibrary={"Ionicons"}
															iconName={"briefcase"}
															iconColor={Colors.white}
															title={"Work"}
															description={`${workPinned?.label} • ${workPinned?.city}`}
															city={workPinned?.city}
															placeId={workPinned?.place_id}
															onPress={() =>
																handlePinnedSuggestion(workPinned, "Work")
															}
															handlePinnedInfo={() =>
																handlePinnedInfo(workPinned, "Work")
															}
														/>
													)}
													{schoolPinned && (
														<PinnedSuggestion
															itemKey={schoolPinned?.display_id}
															id={schoolPinned?.id}
															iconBackground={"#94694f"}
															iconLibrary={"Ionicons"}
															iconName={"school"}
															iconColor={Colors.white}
															title={"School"}
															description={`${schoolPinned?.label} • ${schoolPinned?.city}`}
															city={schoolPinned?.city}
															placeId={schoolPinned?.place_id}
															onPress={() =>
																handlePinnedSuggestion(schoolPinned, "School")
															}
															handlePinnedInfo={() =>
																handlePinnedInfo(schoolPinned, "School")
															}
														/>
													)}
													{filteredPinnedList.length > 0 && (
														<View>
															<View
																style={[styles.div, { marginVertical: 0 }]}
															/>
															{filteredPinnedList.map((item, index) => (
																<>
																	<PinnedSuggestion
																		itemKey={item?.display_id || index}
																		id={item?.id}
																		iconLibrary={"MaterialDesignIcons"}
																		iconName={"record-circle"}
																		iconColor={"#667cf1"}
																		title={item.label}
																		description={item?.secondary_text}
																		city={item?.city}
																		placeId={item?.place_id}
																		onPress={() =>
																			handlePinnedSuggestion(item, "Other")
																		}
																		handlePinnedInfo={() =>
																			handlePinnedInfo(item, "Other")
																		}
																	/>
																	{index !== filteredPinnedList.length - 1 && (
																		<View
																			style={[
																				styles.div,
																				{ marginVertical: 0 },
																			]}
																		/>
																	)}
																</>
															))}
														</View>
													)}
												</View>
												<View style={[styles.titleHeaderRow]}>
													<Text style={styles.headerTxt}>{"Suggestions"}</Text>
												</View>
												{processedHistory.length > 0 && (
													<View style={styles.library}>
														{processedHistory.map((location, index) => (
															<View key={location?.id || index}>
																<PinSuggestion item={location} />
																{index !== processedHistory.length - 1 && (
																	<View style={styles.divDark} />
																)}
															</View>
														))}
													</View>
												)}
											</>
										) : selectedLibrary === "Places" ? (
											<>
												<HeaderComponent type={"Places"} />
												<View
													style={[
														styles.searchContainer,
														{ flex: 1, height: 40 },
													]}
												>
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
														value={searchLibraryText}
														onChangeText={(text) => onChangeLibraryText(text)}
														placeholder={"Search Your Library"}
														placeholderTextColor={Colors.labelDarkGray}
													/>
													{searchLibraryText && (
														<TouchableOpacity onPress={onPressClose}>
															<Icons
																iconSetName={"Ionicons"}
																iconName={"close-circle"}
																iconColor={"#888"}
																iconSize={20}
															/>
														</TouchableOpacity>
													)}
												</View>
												{filteredLibraryList.length > 0 && (
													<View>
														{listViewType === "list" ? (
															<View
																style={[
																	styles.searchPlace,
																	{ ...LayoutStyle.marginTop20 },
																]}
															>
																{filteredLibraryList.map((item, index) => {
																	const isLastIndex =
																		index === filteredLibraryList.length - 1;
																	return (
																		<View
																			key={item.place_id}
																			style={{
																				position: "relative",
																				zIndex:
																					isShowActionId === item.place_id
																						? 2
																						: 1,
																			}}
																		>
																			<SearchedPlace
																				item={item}
																				type={"library"}
																				index={index}
																				isLastIndex={isLastIndex}
																			/>
																		</View>
																	);
																})}
															</View>
														) : (
															<View style={styles.gridContainer}>
																{rows.map((row, rowIndex) => (
																	<GridPlace row={row} rowIndex={rowIndex} />
																))}
															</View>
														)}
													</View>
												)}
											</>
										) : null}
									</>
								) : (
									<>
										<View style={{ ...CommonStyles.directionRowSB }}>
											<Text style={styles.smallHeaderTitle}>
												{"Add to Library"}
											</Text>
											<TouchableOpacity onPress={handleDoneAddToLibrary}>
												<Text style={styles.headerBlueBtnTxt}>{"Done"}</Text>
											</TouchableOpacity>
										</View>

										<View style={styles.searchRow}>
											<View
												style={[
													styles.searchContainer,
													{ flex: isFocusSearch ? 0.95 : 1 },
												]}
											>
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
															currentLocation
														)
													}
													placeholder={"Search Maps"}
													placeholderTextColor={Colors.labelDarkGray}
													onFocus={() => {
														setIsFocusSearch(true);
													}}
													onBlur={() => {
														setIsFocusSearch(false);
													}}
												/>
												{searchText && (
													<TouchableOpacity
														onPress={() => onPressCloseLocation()}
													>
														<Icons
															iconSetName={"Ionicons"}
															iconName={"close-circle"}
															iconColor={"#888"}
															iconSize={18}
														/>
													</TouchableOpacity>
												)}
											</View>
											{/* {isFocusSearch && (
										<TouchableOpacity
											style={styles.cancelSearchBtn}
											onPress={() => setIsAddToLibrary(false)}
										>
											<Text style={styles.cancelSearchTxt}>{"Cancel"}</Text>
										</TouchableOpacity>
									)} */}
										</View>
										<View>
											<Text style={styles.recentlyViewTxt}>
												{"Recently Viewed"}
											</Text>
											<View style={styles.divDark} />
										</View>
										{suggestions.length > 0 &&
											suggestions.map((item, index) => {
												const isLastIndex = index === suggestions.length - 1;
												return (
													<View key={index}>
														<SearchedPlace
															item={item}
															type={"search"}
															index={index}
															isLastIndex={isLastIndex}
														/>
													</View>
												);
											})}

										{!searchText &&
											processedHistory.length > 0 &&
											processedHistory.map((item, index) => {
												const isLastIndex =
													index === processedHistory.length - 1;
												return (
													<View key={index}>
														<SearchedPlace
															item={item}
															type={"search"}
															index={index}
															isLastIndex={isLastIndex}
														/>
													</View>
												);
											})}
									</>
								)}
							</View>
						) : (
							<NoRouteFound onPressClose={closeNoRoute} />
						)}
					</BottomSheetScrollView>
				</View>
			</TouchableWithoutFeedback>
		</BottomSheetModal>
	);
};
