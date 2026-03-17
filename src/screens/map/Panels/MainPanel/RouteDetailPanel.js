import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Modal,
	Linking,
	Image,
	ActivityIndicator,
	TouchableWithoutFeedback,
} from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { styles } from "./styles";
import LayoutStyle from "../../../../styles/LayoutStyle";
import CommonStyles from "../../../../styles/CommonStyles";
import { Icons, Loader } from "../../../../components";
import Colors from "../../../../styles/Colors";
import { useDispatch, useSelector } from "react-redux";
import ComponentStyles from "../../../../styles/ComponentStyles";
import {
	formatTime,
	getFormattedAddress,
	shareLocationURL,
} from "../../../../config/CommonFunctions";
import axios from "axios";
import { GOOGLE_MAPS_APIKEY } from "../../../../config/BaseUrl";
import Icon from "react-native-vector-icons/Ionicons";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { ScrollView } from "react-native-gesture-handler";
import FastImage from "react-native-fast-image";
import { removeLibraryPlace, storeLibraryPlace } from "../../redux/Action";
import { RemovePinModal } from "../SubComponent/RemovePinModal";
import Api from "../../../../utils/Api";
import { showMessage } from "react-native-flash-message";
import MapStyle from "../../../../styles/MapStyle";
import { useFocusEffect } from "@react-navigation/native";
import { ReviewDetailModal } from "../SubComponent/ReviewDetailModal";
import { PlaceImagesModal } from "../SubComponent/PlaceImagesModal";

export const RouteDetailPanel = ({
	routePanelRef,
	snapPoints,
	renderBackdrop,
	handleRouteDetailclosePanel,
	selectedLocation,
	openDirectionPanel,
	openReportPanel,
	openNotePanel,
	currentLocation,
	libraryList,
	getPinnedPlaces,
	pinnedPlacesList,
	reloadNoteTime,
}) => {
	const customSnapPoints = useMemo(() => ["45%", "90%"]);
	const userData = useSelector((state) => state.Auth.userData);
	const dispatch = useDispatch();

	const [isPageLoader, setIsPageLoader] = useState(false);

	const [isLoading, setIsLoading] = useState(false);
	const [location, setLocation] = useState(null);
	const [shortName, setShortName] = useState("");
	const [isMoreOption, setIsMoreOption] = useState(false);
	const [isOpenCall, setIsOpenCall] = useState(false);

	const [fullDetails, setFullDetails] = useState(null);
	const [fullAddress, setFullAddress] = useState(null);
	const [placePhoneNumber, setPlacePhoneNumber] = useState("");
	const [placeWebsite, setPlaceWebsite] = useState("");
	const [placeType, setPlaceType] = useState("");
	const [placeRating, setPlaceRating] = useState("");
	const [placeRatingCount, setPlaceRatingCount] = useState(0);
	const [placeImages, setPlaceImages] = useState([]);
	const [reviews, setReviews] = useState([]);
	const [isSharing, setIsSharing] = useState(false);

	const [isAddedLibrary, setIsAddedLibrary] = useState(false);
	const [isAddingLibrary, setIsAddingLibrary] = useState(false);
	const [isShowPinModal, setIsShowPinModal] = useState(false);
	const [pinnedPlace, setPinnedPlace] = useState(null);

	const [isLoadingNote, setIsLoadingNote] = useState(false);
	const [note, setNote] = useState("");

	const [selectedReview, setSelectedReview] = useState(null);
	const [showPhotosModal, setShowPhotosModal] = useState(false);

	useFocusEffect(
		useCallback(() => {
			getInitialDetail();
		}, [selectedLocation])
	);

	useEffect(() => {
		if (reloadNoteTime) {
			getInitialDetail();
		}
	}, [reloadNoteTime]);

	useEffect(() => {
		if (selectedLocation) {
			const cleanedItem = formatLocationItem(selectedLocation);
			const isAlreadyAdded = libraryList.some(
				(place) => place.place_id === cleanedItem.place_id
			);

			setIsAddedLibrary(isAlreadyAdded);

			if (selectedLocation?.place_id && pinnedPlacesList?.length) {
				const match = pinnedPlacesList.find(
					(item) => item.place_id === selectedLocation.place_id
				);

				if (match) {
					setPinnedPlace(match);
				} else {
					setPinnedPlace(null);
				}
			}
		}
	}, [selectedLocation, pinnedPlacesList]);

	const getInitialDetail = async () => {
		if (selectedLocation) {
			if (selectedLocation?.structured_formatting) {
				setLocation(selectedLocation?.structured_formatting);
			}
			if (selectedLocation?.main_text) {
				const addressDetail = {
					main_text: selectedLocation?.main_text,
					secondary_text: selectedLocation?.secondary_text,
				};
				setLocation(addressDetail);
			}
			const name = userData?.name
				?.split(" ")
				.map((word) => word[0])
				.join("")
				.toUpperCase();

			setShortName(name);
			getPlaceFullDetail(selectedLocation?.place_id);
		}
	};
	const getPlaceFullDetail = async (placeId) => {
		if (!placeId) return;
		try {
			setIsLoading(true);

			const fields = [
				"formatted_address",
				"formatted_phone_number",
				"name",
				"geometry",
				"types",
				"website",
				"photos",
				"rating",
				"reviews",
				"address_components",
				"user_ratings_total",
			].join(",");

			const { data } = await axios.get(
				"https://maps.googleapis.com/maps/api/place/details/json",
				{ params: { place_id: placeId, fields, key: GOOGLE_MAPS_APIKEY } }
			);

			if (data.status !== "OK") return;

			const r = data.result;
			setFullDetails(r);

			const imgs =
				r.photos?.map(
					(p) =>
						`https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${GOOGLE_MAPS_APIKEY}`
				) || [];
			setPlaceImages(imgs);

			const addr = await getFormattedAddress(
				r.address_components,
				r.formatted_address
			);
			setFullAddress(addr);

			setPlacePhoneNumber(r.formatted_phone_number || "");
			setPlaceWebsite(r.website || "");
			setPlaceRatingCount(r.user_ratings_total || 0);

			setPlaceType(
				r.types
					?.filter((t) => !["point_of_interest", "establishment"].includes(t))
					.map((t) =>
						t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
					)
					.join(", ") || ""
			);

			setPlaceRating(r.rating);
			setReviews(r?.reviews || []);
			getNotes(placeId);
		} catch (err) {
			console.warn("Error:", err);
		} finally {
			setIsLoading(false);
		}
	};
	const getNotes = async (placeId) => {
		try {
			if (!selectedLocation) return;
			setIsLoadingNote(true);
			const response = await Api.get(`user/get-notes`);
			setIsLoadingNote(false);
			if (response.success && placeId) {
				const found = response.data.find((item) => item.place_id === placeId);
				if (found) {
					setNote(found.notes || "");
				} else {
					setNote("");
				}
			}
		} catch (error) {
			setIsLoadingNote(false);
			console.warn("Error: ", error);
		}
	};
	const gotoWebOpen = () => {
		const url = placeWebsite;
		Linking.canOpenURL(url).then((supported) => {
			if (supported) {
				Linking.openURL(url);
			} else {
				// Don't know how to open URI
			}
		});
	};
	const MoreOptionRow = ({ title, iconLibrary, iconName, onPress }) => (
		<TouchableOpacity style={styles.moreOptionRow} onPress={onPress}>
			<Text style={styles.moreOption}>{title}</Text>
			<Icons
				iconSetName={iconLibrary}
				iconName={iconName}
				iconColor={Colors.labelBlack}
				iconSize={18}
			/>
		</TouchableOpacity>
	);
	const onPressWithoutFeedback = () => {
		if (isMoreOption) setIsMoreOption(false);
	};
	const StarRating = ({ rating, size = 20, color = "#fe7002" }) => {
		const maxStars = 5;
		const fullStars = Math.floor(rating);
		const halfStar = rating - fullStars >= 0.5;
		const emptyStars = maxStars - fullStars - (halfStar ? 1 : 0);

		const stars = [];

		for (let i = 0; i < fullStars; i++) {
			stars.push(
				<Icon key={`full-${i}`} name="star" size={size} color={color} />
			);
		}

		if (halfStar) {
			stars.push(
				<Icon key="half" name="star-half" size={size} color={color} />
			);
		}

		for (let i = 0; i < emptyStars; i++) {
			stars.push(
				<Icon
					key={`empty-${i}`}
					name="star-outline"
					size={size}
					color={color}
				/>
			);
		}

		return <View style={{ flexDirection: "row" }}>{stars}</View>;
	};
	const RenderReviewItem = ({ item, index }) => (
		<TouchableOpacity
			key={index}
			style={[styles.reviewBox]}
			onPress={() =>
				setSelectedReview({
					...item,
					main_text: fullDetails?.name,
					secondary_text: fullDetails?.formatted_address,
					types: placeType,
					distance: selectedLocation?.distanceMiles
						? `${selectedLocation?.distanceMiles.toFixed(2)} miles`
						: "-",
				})
			}
		>
			<View style={styles.columnSB}>
				<Text numberOfLines={4} style={styles.reviewTxt}>
					{item?.text}
				</Text>

				<View style={{ ...CommonStyles.directionRowCenter, flex: 1 }}>
					<View style={styles.reviewProfileImg}>
						<Image
							source={{ uri: item?.profile_photo_url }}
							style={styles.reviewImg}
						/>
					</View>
					<View style={{ ...LayoutStyle.marginLeft10, flex: 1 }}>
						<StarRating rating={item?.rating} size={14} color="#faab0c" />
						<Text numberOfLines={1} style={styles.reviewAuthor}>
							{item?.author_name?.length > 6
								? `${item?.author_name.slice(0, 6)}...`
								: item?.author_name}
							<Text style={{ color: Colors.labelDarkGray }}>
								{` • ${item?.relative_time_description}`}
							</Text>
						</Text>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
	const ListLoader = () => {
		const array = Array(2).fill(0);
		return (
			<View style={{ flex: 1 }}>
				<View style={{ ...LayoutStyle.marginBottom10 }}>
					<SkeletonPlaceholder speed={800} backgroundColor={"#E1E9EE"}>
						<SkeletonPlaceholder.Item
							width={"100%"}
							height={80}
							borderRadius={8}
						/>
					</SkeletonPlaceholder>
				</View>
				<SkeletonPlaceholder speed={800} backgroundColor={"#E1E9EE"}>
					<SkeletonPlaceholder.Item
						width={"100%"}
						height={140}
						borderRadius={8}
					/>
				</SkeletonPlaceholder>
				{array.map((i, index) => (
					<View key={index} style={{ ...LayoutStyle.marginVertical10 }}>
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
	const onPressShare = () => {
		if (isSharing) return;

		const originLatitude = currentLocation?.latitude;
		const originLongitude = currentLocation?.longitude;
		const destinationLatitude = selectedLocation?.coords?.latitude;
		const destinationLongitude = selectedLocation?.coords?.longitude;

		const waypoints = [];

		setTimeout(() => {
			shareLocationURL(
				originLatitude,
				originLongitude,
				destinationLatitude,
				destinationLongitude,
				waypoints,
				setIsSharing
			);
		}, 300);
	};
	const formatLocationItem = (item) => {
		return {
			description: item.description || item?.secondary_text,
			place_id: item.place_id,
			structured_formatting: {
				main_text: item.main_text || item.structured_formatting?.main_text,
				secondary_text:
					item.secondary_text || item.structured_formatting?.secondary_text,
			},
			types: item.types,
			coords: item.coords,
			address_components: item.address_components,
			city: item.city,
			distanceMiles: item.distanceMiles,
			durationETA: item.durationETA,
			id: item.id || "",
			type: item.type || "",
			photos: item?.photos || [],
		};
	};
	const handleLibrary = async () => {
		if (isAddedLibrary) {
			setIsShowPinModal(true);
		} else {
			setIsAddingLibrary(true);
			const cleanedItem = formatLocationItem(selectedLocation);

			const isAlreadyAdded = libraryList.some(
				(place) => place.place_id === cleanedItem.place_id
			);

			if (!isAlreadyAdded) {
				const updatedList = [cleanedItem, ...libraryList];
				dispatch(storeLibraryPlace(updatedList));
				setIsAddedLibrary(true);
			}
			setTimeout(() => {
				setIsAddingLibrary(false);
			}, 2000);
		}
	};
	const handleRemoveLibraryPlace = () => {
		dispatch(removeLibraryPlace([selectedLocation.place_id]));
		setIsAddedLibrary(false);
		setIsShowPinModal(false);
	};
	const handleAddPin = async () => {
		try {
			setIsPageLoader(true);
			const payload = {
				type: "address",
				label:
					selectedLocation?.structured_formatting?.main_text ||
					selectedLocation?.main_text,
				place_id: selectedLocation?.place_id,
			};

			const response = await Api.post(`user/save-library-data`, payload);
			setIsPageLoader(false);

			if (response.success) {
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
	const handleRemovePin = async () => {
		try {
			if (!pinnedPlace) return;

			setIsPageLoader(true);
			const data = {
				id: [pinnedPlace?.id],
			};

			const response = await Api.post(`user/delete-saved-library`, data);
			setIsPageLoader(false);

			if (response.success) {
				setPinnedPlace(null);
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
	const NoteLoader = () => {
		const array = Array(1).fill(0);
		return (
			<View style={{ flex: 1 }}>
				{array.map((i, index) => (
					<View key={index} style={{ ...LayoutStyle.marginVertical10 }}>
						<SkeletonPlaceholder speed={800} backgroundColor={"#E1E9EE"}>
							<SkeletonPlaceholder.Item
								width={"100%"}
								height={60}
								borderRadius={8}
							/>
						</SkeletonPlaceholder>
					</View>
				))}
			</View>
		);
	};
	const onClose = () => {
		handleRouteDetailclosePanel();
		setPinnedPlace(null);
	};

	return (
		<BottomSheetModal
			ref={routePanelRef}
			snapPoints={customSnapPoints}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={false}
			enableDynamicSizing={false}
			backgroundStyle={styles.backgroundStyle}
		>
			<Loader show={isPageLoader} />
			<BottomSheetScrollView
				style={{ ...LayoutStyle.paddingHorizontal20 }}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ ...LayoutStyle.paddingBottom20 }}
			>
				<TouchableWithoutFeedback onPress={onPressWithoutFeedback}>
					<View style={styles.flex}>
						<View style={{ ...LayoutStyle.marginBottom20 }}>
							<View style={[styles.onlyRowSB]}>
								<Text
									style={[styles.recentTitle, { width: "65%", fontSize: 28 }]}
								>
									{location?.main_text}
								</Text>
								<View style={[]}>
									{!isAddingLibrary ? (
										<View style={{ ...CommonStyles.directionRowSB }}>
											<TouchableOpacity
												style={[styles.directionHeaderBtn]}
												onPress={handleLibrary}
											>
												{isAddedLibrary ? (
													<Icons
														iconSetName={"MaterialIcons"}
														iconName={"check"}
														iconSize={18}
														iconColor={"#888"}
													/>
												) : (
													<Icons
														iconSetName={"Feather"}
														iconName={"plus"}
														iconSize={18}
														iconColor={"#888"}
													/>
												)}
											</TouchableOpacity>
											<TouchableOpacity
												style={[
													styles.directionHeaderBtn,
													{ marginHorizontal: 7 },
												]}
												onPress={onPressShare}
											>
												{isSharing ? (
													<View style={{ height: 20, width: 20 }}>
														<ActivityIndicator size={"small"} color={"#888"} />
													</View>
												) : (
													<Icons
														iconSetName={"MaterialIcons"}
														iconName={"ios-share"}
														iconSize={18}
														iconColor={"#888"}
													/>
												)}
											</TouchableOpacity>
											<TouchableOpacity
												style={[styles.directionHeaderBtn]}
												onPress={onClose}
											>
												<Icons
													iconSetName={"MaterialCommunityIcons"}
													iconName={"window-close"}
													iconSize={18}
													iconColor={"#888"}
												/>
											</TouchableOpacity>
										</View>
									) : (
										<View
											style={[styles.headerSmallBtn, { flexDirection: "row" }]}
										>
											<Icons
												iconSetName={"MaterialIcons"}
												iconName={"check"}
												iconSize={16}
												iconColor={"#888"}
											/>
											<Text style={styles.addingLibraryTxt}>
												{"Add Library"}
											</Text>
										</View>
									)}
								</View>
							</View>
							{placeType && placeType !== "Route" ? (
								<Text numberOfLines={1} style={styles.headerDesTxt}>
									{placeType}
								</Text>
							) : (
								<Text numberOfLines={1} style={styles.headerDesTxt}>
									{`${location?.secondary_text}`}
								</Text>
							)}
						</View>
						<View style={{ ...CommonStyles.directionRowSB }}>
							<TouchableOpacity
								style={[
									styles.navOptionBox,
									{ backgroundColor: Colors.blueActiveBtn, marginLeft: 0 },
								]}
								onPress={() => openDirectionPanel(selectedLocation)}
							>
								<Icons
									iconSetName={"FontAwesome6"}
									iconName={"car-rear"}
									iconColor={Colors.white}
									iconSize={20}
								/>
								<Text style={[styles.navOptionTxt, { color: Colors.white }]}>
									{formatTime(selectedLocation?.durationETA)}
								</Text>
							</TouchableOpacity>
							{placePhoneNumber && (
								<TouchableOpacity
									style={[styles.navOptionBox]}
									onPress={() => setIsOpenCall(true)}
								>
									<Icons
										iconSetName={"Ionicons"}
										iconName={"call"}
										iconColor={Colors.blueActiveBtn}
										iconSize={20}
									/>
									<Text style={styles.navOptionTxt}>{"Call"}</Text>
								</TouchableOpacity>
							)}
							{placeWebsite && (
								<TouchableOpacity
									style={[styles.navOptionBox]}
									onPress={() => gotoWebOpen()}
								>
									<Icons
										iconSetName={"Ionicons"}
										iconName={"compass"}
										iconColor={Colors.blueActiveBtn}
										iconSize={22}
									/>
									<Text style={styles.navOptionTxt}>{"Website"}</Text>
								</TouchableOpacity>
							)}
							<TouchableOpacity
								style={[styles.navOptionBox, { marginRight: 0 }]}
								onPress={() => setIsMoreOption(!isMoreOption)}
							>
								<Icons
									iconSetName={"MaterialDesignIcons"}
									iconName={"dots-horizontal"}
									iconColor={Colors.blueActiveBtn}
									iconSize={20}
								/>
								<Text style={styles.navOptionTxt}>{"More"}</Text>
							</TouchableOpacity>
							{isMoreOption && (
								<View
									style={{
										position: "absolute",
										top: 40,
										right: 0,
										width: "65%",
									}}
								>
									<View style={styles.moreOptionContainer}>
										{!isAddedLibrary ? (
											<MoreOptionRow
												title={"Add to Library"}
												iconLibrary={"MaterialDesignIcons"}
												iconName={"plus"}
												onPress={handleLibrary}
											/>
										) : (
											<MoreOptionRow
												title={"Remove from Library"}
												iconLibrary={"MaterialIcons"}
												iconName={"check"}
												onPress={() => {
													setIsMoreOption(false);
													setIsShowPinModal(true);
												}}
											/>
										)}
										<View style={styles.divPopup} />
										<MoreOptionRow
											title={!note ? "Add a Note" : "Edit Note"}
											iconLibrary={"MaterialDesignIcons"}
											iconName={"newspaper-plus"}
											onPress={() => openNotePanel(selectedLocation?.place_id)}
										/>
										<View style={styles.divPopup} />
										{!pinnedPlace ? (
											<MoreOptionRow
												title={"Pin"}
												iconLibrary={"MaterialDesignIcons"}
												iconName={"pin-outline"}
												onPress={handleAddPin}
											/>
										) : (
											<MoreOptionRow
												title={"Unpin"}
												iconLibrary={"MaterialDesignIcons"}
												iconName={"pin"}
												onPress={handleRemovePin}
											/>
										)}
									</View>
								</View>
							)}
						</View>
						{isLoadingNote ? (
							<View style={{ ...LayoutStyle.marginTop10 }}>
								<NoteLoader />
							</View>
						) : (
							<View>
								<View
									style={{
										...CommonStyles.directionRowSB,
										...LayoutStyle.marginTop20,
									}}
								>
									<Text style={styles.destiSubTitle}>{"Note"}</Text>
									{note && (
										<TouchableOpacity
											onPress={() => openNotePanel(selectedLocation.place_id)}
										>
											<View style={{ ...CommonStyles.directionRowCenter }}>
												<Icons
													iconSetName={"MaterialIcons"}
													iconName={"edit"}
													iconColor={Colors.secondary}
													iconSize={14}
												/>
												<Text style={MapStyle.editNoteTxt}>{"Edit"}</Text>
											</View>
										</TouchableOpacity>
									)}
								</View>
								<View style={[styles.library, { marginBottom: 20 }]}>
									{!note ? (
										<TouchableOpacity
											style={{ ...CommonStyles.directionRowCenter }}
											onPress={() => openNotePanel(selectedLocation?.place_id)}
										>
											<View style={[styles.contactImg]}>
												<Text style={styles.shortName}>{shortName}</Text>
											</View>
											<View style={{ ...LayoutStyle.marginLeft10 }}>
												<Text style={styles.addNoteTxt}>{"Add a Note"}</Text>
												<Text style={styles.noteDes}>
													{"Only you'll see waht you write here."}
												</Text>
											</View>
										</TouchableOpacity>
									) : (
										<Text style={styles.libraryCountTxt}>{note}</Text>
									)}
								</View>
							</View>
						)}
						{isLoading ? (
							<ListLoader />
						) : (
							<>
								{placeRating && (
									<View style={[styles.ratingDistanceRow, { marginTop: 0 }]}>
										<View style={styles.ratingBox}>
											<Text numberOfLines={1} style={styles.placeRatingTxt}>
												{`Rating (${placeRatingCount})`}
											</Text>
											<View style={{ ...CommonStyles.directionRowCenter }}>
												<Icons
													iconSetName={"Ionicons"}
													iconName={"star"}
													iconColor={"#fe7002"}
													iconSize={16}
												/>
												<Text style={styles.orangeRating}>{placeRating}</Text>
											</View>
										</View>
										<View style={{ ...LayoutStyle.marginLeft20 }}>
											<Text style={styles.placeRatingTxt}>{"Distance"}</Text>
											<View style={{ ...CommonStyles.directionRowCenter }}>
												<Icons
													iconSetName={"FontAwesome6"}
													iconName={"route"}
													iconColor={Colors.labelDarkGray}
													iconSize={16}
												/>
												<Text style={[styles.distanceRouteTxt]}>
													{selectedLocation?.distanceMiles
														? `${selectedLocation?.distanceMiles.toFixed(
																2
														  )} miles`
														: "-"}
												</Text>
											</View>
										</View>
									</View>
								)}
								{placeImages.length > 0 && (
									<ScrollView
										style={{ flex: 1, ...LayoutStyle.marginVertical10 }}
										horizontal
										showsHorizontalScrollIndicator={false}
										nestedScrollEnabled={true}
										contentContainerStyle={{}}
									>
										{placeImages.map((item, index) => {
											return (
												<TouchableOpacity
													key={index}
													style={[
														styles.reviewPlaceImgBox,
														index !== 0 && { marginLeft: 10 },
													]}
													onPress={() => setShowPhotosModal(true)}
												>
													<FastImage
														source={{ uri: item }}
														style={[styles.reviewPlaceImg]}
													/>
												</TouchableOpacity>
											);
										})}
									</ScrollView>
								)}
								{reviews && reviews.length > 0 && (
									<>
										<View
											style={{
												...CommonStyles.directionRowSB,
												...LayoutStyle.marginTop10,
											}}
										>
											<Text style={styles.destiSubTitle}>
												{"Ratings & Reviews"}
											</Text>
										</View>
										<ScrollView
											style={{ flex: 1, ...LayoutStyle.marginTop10 }}
											horizontal
											showsHorizontalScrollIndicator={false}
											nestedScrollEnabled={true}
										>
											<View
												style={{
													...CommonStyles.directionRowCenter,
													...LayoutStyle.marginBottom20,
												}}
											>
												<View style={[styles.reviewBox, { marginLeft: 0 }]}>
													<View style={styles.columnSB}>
														<Text style={styles.ratingBlack}>{"Rating"}</Text>
														<View>
															<StarRating rating={placeRating} />
															<Text style={styles.ratingBlackNum}>
																{placeRating}
																<Text
																	style={styles.reviewCount}
																>{` (${placeRatingCount})`}</Text>
															</Text>
														</View>
													</View>
												</View>

												{reviews.map((item, index) => (
													<RenderReviewItem item={item} index={index} />
												))}
											</View>
										</ScrollView>
									</>
								)}
								<View
									style={{
										...LayoutStyle.marginBottom20,
										marginTop: reviews.length === 0 ? 10 : 0,
									}}
								>
									<View style={{ ...CommonStyles.directionRowSB }}>
										<Text style={styles.destiSubTitle}>{"Details"}</Text>
									</View>
									<View style={styles.library}>
										{placePhoneNumber && (
											<>
												<TouchableOpacity onPress={() => setIsOpenCall(true)}>
													<Text style={styles.noteDes}>{"Phone"}</Text>
													<Text style={styles.blueDetailTxt}>
														{placePhoneNumber}
													</Text>
												</TouchableOpacity>
												<View style={styles.div} />
											</>
										)}
										{placeWebsite && (
											<>
												<TouchableOpacity onPress={() => gotoWebOpen()}>
													<Text style={styles.noteDes}>{"Website"}</Text>
													<Text style={styles.blueDetailTxt}>
														{placeWebsite}
													</Text>
												</TouchableOpacity>
												<View style={styles.div} />
											</>
										)}
										<View style={styles.onlyRowSB}>
											<View style={{ width: "85%" }}>
												<Text style={styles.noteDes}>{"Address"}</Text>
												<Text style={styles.selectedAddressText}>
													{`${fullAddress?.localAddress || ""}\n${
														fullAddress?.city || ""
													}\n${`${fullAddress?.state} ${fullAddress?.zipCode}`}\n${
														fullAddress?.country
													}`}
												</Text>
											</View>
											<View style={styles.directionDarkCircle}>
												<View style={styles.directionBlueCircle}>
													<Icons
														iconSetName={"Feather"}
														iconName={"corner-up-right"}
														iconColor={Colors.white}
														iconSize={10}
													/>
												</View>
											</View>
										</View>
									</View>
								</View>
								<View style={styles.library}>
									<TouchableOpacity
										onPress={!pinnedPlace ? handleAddPin : handleRemovePin}
										style={{ ...CommonStyles.directionRowCenter }}
									>
										<View style={styles.directionDarkCircle}>
											{!pinnedPlace ? (
												<Icons
													iconSetName={"MaterialIcons"}
													iconName={"push-pin"}
													iconColor={Colors.blueActiveBtn}
													iconSize={16}
												/>
											) : (
												<Icons
													iconSetName={"MaterialIcons"}
													iconName={"push-pin"}
													iconColor={Colors.errorBoxRed}
													iconSize={16}
												/>
											)}
										</View>
										<Text
											style={[
												styles.reportBtnTxt,
												{
													color: !pinnedPlace
														? Colors.blueActiveBtn
														: Colors.errorBoxRed,
												},
											]}
										>
											{!pinnedPlace ? "Pin" : "Unpin"}
										</Text>
									</TouchableOpacity>
								</View>
							</>
						)}
					</View>
				</TouchableWithoutFeedback>
			</BottomSheetScrollView>
			<Modal
				animationType={"slide"}
				transparent={true}
				visible={isOpenCall}
				presentationStyle={"overFullScreen"}
				onRequestClose={() => setIsOpenCall(false)}
			>
				<View
					style={[
						ComponentStyles.loaderHorizontal,
						{ backgroundColor: "rgba(0,0,0,0.4)" },
					]}
				>
					<View style={styles.callModal}>
						<TouchableOpacity
							style={styles.callBtn}
							onPress={() => {
								Linking.openURL(`tel:${placePhoneNumber}`);
							}}
						>
							<Icons
								iconSetName={"Ionicons"}
								iconName={"call"}
								iconColor={"#888"}
								iconSize={20}
							/>
							<Text style={styles.phoneTxt}>{`Call ${placePhoneNumber}`}</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.callBtn, { justifyContent: "center" }]}
							onPress={() => setIsOpenCall(false)}
						>
							<Text
								style={[styles.phoneTxt, { marginLeft: 0, top: 0 }]}
							>{`Cancel`}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
			{isShowPinModal && (
				<RemovePinModal
					show={isShowPinModal}
					onHide={() => setIsShowPinModal(false)}
					onPress={handleRemoveLibraryPlace}
				/>
			)}
			{selectedReview && (
				<ReviewDetailModal
					show={!!selectedReview}
					onHide={() => setSelectedReview(null)}
					detail={selectedReview}
				/>
			)}
			{showPhotosModal && (
				<PlaceImagesModal
					show={showPhotosModal}
					onHide={() => setShowPhotosModal(false)}
					photos={placeImages}
					placeName={location?.main_text}
				/>
			)}
		</BottomSheetModal>
	);
};
