import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	ImageBackground,
	ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { DarkHeader, Icons } from "../../components";
import CommonStyles from "../../styles/CommonStyles";
import LayoutStyle from "../../styles/LayoutStyle";
import IncidentStyle from "../../styles/IncidentStyles";
import Colors from "../../styles/Colors";
import ListSkeleton from "../../components/LoaderComponents/ListSkeleton";
import moment from "moment";
import { showMessage } from "react-native-flash-message";
import { checkAddressValidity, isValidJSON } from "../../utils/Validation";

const AllClaimTalkIncidentScreen = (props) => {
	const isLoading = useSelector((state) => state.Incident.isLoading);
	const claimTalkList = useSelector(
		(state) => state.Incident.claimTalkList?.data
	);

	const [loadingItemId, setLoadingItemId] = useState(null);

	const gotoBack = () => {
		props.navigation.goBack();
	};
	const onPressClaimTalk = (incident) => {
		props.navigation.navigate("ClaimTalkIncidentDetails", {
			incident: incident,
		});
	};
	const onPressLocation = async (item) => {
		setLoadingItemId(item.id);
		const locationCoords =
			typeof item?.location_coords === "string" &&
			isValidJSON(item.location_coords)
				? JSON.parse(item.location_coords)
				: item.location_coords;

		const isValidAddress = await checkAddressValidity(
			locationCoords?.latitude,
			locationCoords?.longitude
		);

		setLoadingItemId(null);
		if (isValidAddress) {
			props.navigation.navigate("ClaimTalkIncidentMap", {
				claimTalkIncident: item,
			});
		} else {
			showMessage({
				message: "Location not found!",
				type: "danger",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				autoHide: true,
			});
		}
	};
	const renderIncidents = (item) => {
		return (
			<TouchableOpacity onPress={() => onPressClaimTalk(item)}>
				<View style={[IncidentStyle.allIncidentListContainer]}>
					<ImageBackground
						style={IncidentStyle.incidentImgAll}
						source={{
							uri: item.incident_image[0]?.photo_path
								? item.incident_image[0]?.photo_path
								: "https://cdn.pixabay.com/photo/2016/11/21/16/37/loader-1846346_1280.jpg",
						}}
						borderTopLeftRadius={8}
						borderBottomLeftRadius={8}
					>
						<View style={[IncidentStyle.incidentViewImgAll]}>
							<Icons
								iconName={"circle"}
								iconSetName={"MaterialCommunityIcons"}
								iconColor={
									item.status === "approved" ? Colors.warning : Colors.warning
								}
								iconSize={10}
							/>
							<View style={[IncidentStyle.incidentEnd]}>
								<Icons
									iconName={"video"}
									iconSetName={"MaterialCommunityIcons"}
									iconColor={Colors.backArrowWhite}
									iconSize={18}
								/>
							</View>
						</View>
					</ImageBackground>
					<View
						style={[IncidentStyle.allIncidentTextContainer, { padding: 5 }]}
					>
						<View style={[CommonStyles.directionRowCenter]}>
							<Icons
								iconSetName={"MaterialCommunityIcons"}
								iconName={"calendar-range-outline"}
								iconColor={Colors.white}
								iconSize={18}
							/>
							<Text
								style={[
									IncidentStyle.allIncidentTitle1,
									{ marginLeft: 5, width: 150 },
								]}
							>
								{moment(item?.incident_date, "YYYY-MM-DD").format("MM/DD/YYYY")}
							</Text>
						</View>
						<View
							style={[CommonStyles.directionRowCenter, { marginVertical: 2 }]}
						>
							<Icons
								iconSetName={"MaterialCommunityIcons"}
								iconName={"clock-outline"}
								iconColor={Colors.white}
								iconSize={18}
							/>
							<Text
								style={[
									IncidentStyle.allIncidentTitle1,
									{ marginLeft: 5, width: 150 },
								]}
							>
								{item?.incident_time}
							</Text>
						</View>
						<TouchableOpacity
							disabled={loadingItemId ? true : false}
							onPress={() => onPressLocation(item)}
							style={[CommonStyles.directionRowCenter]}
						>
							{loadingItemId === item.id ? (
								<View style={[IncidentStyle.locationPinLoader]}>
									<ActivityIndicator size="small" color={Colors.secondary} />
								</View>
							) : (
								<Icons
									iconSetName={"MaterialIcons"}
									iconName={"location-pin"}
									iconColor={Colors.secondary}
									iconSize={18}
								/>
							)}
							<Text
								numberOfLines={2}
								style={[
									IncidentStyle.allIncidentTitle1,
									{ marginLeft: 5, width: 146, color: Colors.secondary },
								]}
							>
								{item?.location}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<>
			<View
				style={[IncidentStyle.mainContainer, IncidentStyle.backgroundColorBlue]}
			>
				<DarkHeader
					iconName={"angle-left"}
					iconSize={24}
					iconSetName={"FontAwesome6"}
					iconColor={Colors.backArrowWhite}
					whiteLabel={"Incident"}
					DarkHeaderMainStyle={[LayoutStyle.paddingTop30]}
					onPress={() => gotoBack()}
				/>
				<View style={[{ ...LayoutStyle.paddingHorizontal20 }]}>
					<View
						style={[IncidentStyle.headerDescContainer, { marginBottom: 10 }]}
					>
						<Text style={[IncidentStyle.headerDescWhite]}>{"Claim Talk"}</Text>
						<Text style={[IncidentStyle.headerDesc]}>{"Incidents"}</Text>
					</View>
				</View>
				<>
					{isLoading ? (
						<FlatList
							style={{ ...CommonStyles.emptyList, marginVertical: 0 }}
							data={Array(8).fill(0)}
							keyExtractor={(item, index) => `skeleton-${index}`}
							renderItem={({ item, index }) => (
								<ListSkeleton backgroundColor={Colors.inputfillBG} />
							)}
						/>
					) : (
						<FlatList
							style={{ flex: 1, marginHorizontal: 10 }}
							contentContainerStyle={{ paddingBottom: 20 }}
							showsVerticalScrollIndicator={false}
							data={claimTalkList}
							renderItem={({ item: incidentItem, index }) =>
								renderIncidents(incidentItem, index)
							}
							ListEmptyComponent={
								<View style={[CommonStyles.emptyDataAlign]}>
									<Text style={[CommonStyles.emptyDataBlack]}>{"No data"}</Text>
								</View>
							}
							keyExtractor={(item) => item.id}
						/>
					)}
				</>
			</View>
		</>
	);
};

export default AllClaimTalkIncidentScreen;
