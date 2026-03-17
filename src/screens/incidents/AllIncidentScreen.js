import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	ImageBackground,
} from "react-native";
import React from "react";
import { useSelector } from "react-redux";
import { DarkHeader, Icons } from "../../components";
import CommonStyles from "../../styles/CommonStyles";
import LayoutStyle from "../../styles/LayoutStyle";
import IncidentStyle from "../../styles/IncidentStyles";
import Colors from "../../styles/Colors";
import ListSkeleton from "../../components/LoaderComponents/ListSkeleton";
import { noImgUrl } from "../../config/CommonFunctions";

const AllIncidentScreen = (props) => {
	const isLoading = useSelector((state) => state.Incident.isLoading);
	const incidentList = useSelector(
		(state) => state.Incident.incidentList?.data
	);
	const vehicleList = useSelector((state) => state.Incident.vehicleList);

	const gotoBack = () => {
		props.navigation.goBack();
	};
	const gotoIncidentDetailsScreen = (incidentID) => {
		props.navigation.navigate("IncidentDetails", { incidentID: incidentID });
	};
	const renderIncidents = (item) => {
		let vehicle = "";
		if (item?.vehicle_id && vehicleList?.data?.length > 0) {
			const vehicleId = parseInt(item?.vehicle_id, 10);

			const incidentVehicle = vehicleList?.data?.find(
				(vehicleItem) => vehicleItem.id === vehicleId
			);

			vehicle = incidentVehicle?.name || "Unknown Vehicle";
		}

		return (
			<TouchableOpacity onPress={() => gotoIncidentDetailsScreen(item.id)}>
				<View style={[IncidentStyle.allIncidentListContainer]}>
					<ImageBackground
						style={IncidentStyle.incidentImgAll}
						source={{
							uri: item.incident_images[0]?.photo_path || noImgUrl,
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
									iconSetName={
										item?.incident_type?.iconType
											? item?.incident_type?.iconType
											: "FontAwesome6"
									}
									iconName={
										item?.incident_type?.iconName
											? item?.incident_type?.iconName
											: "car-burst"
									}
									iconColor={Colors.backArrowWhite}
									iconSize={18}
								/>
							</View>
						</View>
					</ImageBackground>
					{item?.process_status === "draft" && (
						<View
							style={[
								IncidentStyle.draftLabel,
								{ position: "absolute", top: 10, right: 10 },
							]}
						>
							<Text style={[IncidentStyle.draftTxt]}>{"Draft"}</Text>
						</View>
					)}
					<View style={[IncidentStyle.allIncidentTextContainer]}>
						<Text style={[IncidentStyle.allIncidentTitle]}>{vehicle}</Text>
						<Text style={[IncidentStyle.allIncidentDesc]}>
							{"NR# - " + item.display_id}
						</Text>
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
				<View style={[IncidentStyle.allContainer, { paddingBottom: 0 }]}>
					<View
						style={[IncidentStyle.headerDescContainer, { marginBottom: 10 }]}
					>
						<Text style={[IncidentStyle.headerDescWhite]}>{"Active"}</Text>
						<Text style={[IncidentStyle.headerDesc]}>{"Incidents"}</Text>
					</View>
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
							contentContainerStyle={{ paddingBottom: 20 }}
							showsVerticalScrollIndicator={false}
							data={incidentList}
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
				</View>
			</View>
		</>
	);
};

export default AllIncidentScreen;
