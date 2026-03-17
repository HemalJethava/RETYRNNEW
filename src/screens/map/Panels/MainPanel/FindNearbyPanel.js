import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	TextInput,
	ActivityIndicator,
} from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { styles } from "./styles";
import LayoutStyle from "../../../../styles/LayoutStyle";
import CommonStyles from "../../../../styles/CommonStyles";
import { Icons } from "../../../../components";
import Colors from "../../../../styles/Colors";
import {
	fetchPlaceDetail,
	getNearbyPlaces,
	placeTypeMap,
} from "../../../../config/CommonFunctions";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

export const FindNearbyPanel = ({
	nearbyPanelRef,
	snapPoints,
	renderBackdrop,
	handleNearbyClosePanel,
	selectedNearBy,
	currentLocation,
	openRouteDetailPanel,
	changeDestiByPanel,
	onCloseNearbyPlace,
}) => {
	const [nearByPlaces, setNearByPlaces] = useState([]);
	const [isLoadingNearBy, setIsLoadingNearBy] = useState(true);
	const [loadingPlaceId, setLoadingPlaceId] = useState(null);

	useEffect(() => {
		if (selectedNearBy) {
			getNearByPlaces(selectedNearBy);
		}
	}, [selectedNearBy]);

	const getNearByPlaces = async (item) => {
		try {
			const type = placeTypeMap[item?.placeName];
			if (!type) {
				console.warn("Unknown place type:", item?.placeName);
				return;
			}

			const keyword = item?.placeName === "CNG Stations" ? "CNG" : undefined;

			const nearByPlaces = await getNearbyPlaces(
				type,
				currentLocation,
				setIsLoadingNearBy,
				keyword
			);
			setNearByPlaces(nearByPlaces);
		} catch (error) {
			console.warn("Error: ", error);
		}
	};
	const onPressCloseLocation = () => {
		handleNearbyClosePanel();
		onCloseNearbyPlace();
	};
	const onPressNearBy = async (item) => {
		setLoadingPlaceId(item?.place_id);
		const detail = await fetchPlaceDetail(item?.place_id, currentLocation);
		setLoadingPlaceId(null);

		if (detail) {
			openRouteDetailPanel(detail);
			changeDestiByPanel(detail);
		}
	};
	const NearByPlace = ({ item }) => (
		<View style={{ ...CommonStyles.directionRowSB }}>
			<View style={{ width: "80%" }}>
				<Text numberOfLines={1} style={styles.nearByAddressName}>
					{item?.name}
				</Text>
				<Text numberOfLines={1} style={styles.nearByDesTxt}>
					{item?.distance}
					<Text>{" • "}</Text>
					<Text>{item?.address}</Text>
				</Text>
			</View>
			<TouchableOpacity
				onPress={() => onPressNearBy(item)}
				style={styles.distanceBox}
			>
				{loadingPlaceId === item?.place_id ? (
					<ActivityIndicator color={Colors.secondary} size={20} />
				) : (
					<>
						<View style={styles.distanceDirectionIcon}>
							<Icons
								iconSetName={"MaterialDesignIcons"}
								iconName={"arrow-right-top"}
								iconColor={Colors.white}
								iconSize={12}
							/>
						</View>
						<Text style={styles.nearByDistance}>{item?.duration}</Text>
					</>
				)}
			</TouchableOpacity>
		</View>
	);
	const ListLoader = () => {
		const array = Array(5).fill(0);
		return (
			<View style={{ flex: 1 }}>
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

	return (
		<BottomSheetModal
			ref={nearbyPanelRef}
			snapPoints={["45%", "90%"]}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={true}
			enableDynamicSizing={false}
			backgroundStyle={styles.backgroundStyle}
		>
			<BottomSheetScrollView
				style={styles.flex}
				contentContainerStyle={{
					...LayoutStyle.paddingHorizontal20,
					...LayoutStyle.paddingBottom20,
				}}
				showsVerticalScrollIndicator={false}
			>
				<View style={[styles.nearByHearRow]}>
					<View style={{ ...CommonStyles.directionRowCenter }}>
						<View
							style={[
								styles.nearByIcon,
								selectedNearBy?.backgroundColor && {
									backgroundColor: selectedNearBy?.backgroundColor,
									bottom: 0,
								},
							]}
						>
							<Icons
								iconSetName={selectedNearBy?.iconLibrary}
								iconName={selectedNearBy?.iconName}
								iconColor={Colors.white}
								iconSize={selectedNearBy?.iconSize || 18}
							/>
						</View>
						<View>
							<Text style={styles.nearByTitle}>
								{selectedNearBy?.placeName || ""}
							</Text>
							<Text
								style={styles.placeLengthTxt}
							>{`${nearByPlaces.length} found`}</Text>
						</View>
					</View>
					<TouchableOpacity
						style={styles.dArrowBtn}
						onPress={() => onPressCloseLocation()}
					>
						<Icons
							iconSetName={"MaterialCommunityIcons"}
							iconName={"window-close"}
							iconColor={"#888"}
							iconSize={20}
						/>
					</TouchableOpacity>
				</View>
				{isLoadingNearBy ? (
					<View style={{ ...LayoutStyle.marginTop20 }}>
						<ListLoader />
					</View>
				) : (
					<>
						{nearByPlaces.length > 0 && (
							<View style={[styles.library, { ...LayoutStyle.marginTop20 }]}>
								{nearByPlaces.map((item, index) => (
									<View key={item?.id}>
										<NearByPlace item={item} />
										{index !== nearByPlaces.length - 1 && (
											<View style={styles.div} />
										)}
									</View>
								))}
							</View>
						)}
					</>
				)}
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
};
