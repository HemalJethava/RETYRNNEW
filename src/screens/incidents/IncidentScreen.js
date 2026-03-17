import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	FlatList,
	ScrollView,
	TouchableOpacity,
	ImageBackground,
	ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
	getIncidentListRequest,
	getClaimTalkListRequest,
	getVehicleListRequest,
	getStateListRequest,
	getDriverListRequest,
	getSaveDraftListRequest,
} from "./redux/Action";
import { Button, DarkHeader, Icons } from "../../components";
import CommonStyles from "../../styles/CommonStyles";
import LayoutStyle from "../../styles/LayoutStyle";
import IncidentStyle from "../../styles/IncidentStyles";
import Colors from "../../styles/Colors";
import IncidentSkeleton from "../../components/LoaderComponents/IncidentSkeleton";
import { deviceWidth } from "../../utils/DeviceInfo";
import moment from "moment";
import { showMessage } from "react-native-flash-message";
import { checkAddressValidity, isValidJSON } from "../../utils/Validation";
import { dummyArchiveList } from "../../json/DummyData";
import { noImgUrl } from "../../config/CommonFunctions";

const IncidentScreen = (props) => {
	const dispatch = useDispatch();

	const isLoading = useSelector((state) => state.Incident.isLoading);
	const incidentList = useSelector(
		(state) => state.Incident.incidentList?.data
	);
	const claimTalkList = useSelector(
		(state) => state.Incident.claimTalkList?.data
	);
	const vehicleList = useSelector((state) => state.Incident.vehicleList);
	const [archiveScreen, setArchiveScreen] = useState(false);
	const [loadingItemId, setLoadingItemId] = useState(null);

	useEffect(() => {
		if (props.route.params?.fromNavigation) {
			fetchData();
		}
	}, [props.route.params]);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			const param = { status: "pending" };

			dispatch(getVehicleListRequest());
			dispatch(getStateListRequest());
			dispatch(getDriverListRequest({}, props.navigation));
			dispatch(getIncidentListRequest(param, props.navigation));
			dispatch(getClaimTalkListRequest(param, props.navigation));
			// dispatch(getSaveDraftListRequest(param, props.navigation));
		} catch (error) {
			console.error("Error fetching data: ", error);
		}
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
			<View style={[IncidentStyle.incidentListContainer]}>
				<TouchableOpacity onPress={() => gotoIncidentDetailsScreen(item.id)}>
					<ImageBackground
						style={IncidentStyle.incidentImg}
						source={{ uri: item?.incident_images[0]?.photo_path || noImgUrl }}
						borderTopLeftRadius={8}
						borderTopRightRadius={8}
					>
						<View style={[IncidentStyle.incidentViewImg]}>
							{item?.process_status === "draft" && (
								<View
									style={[
										IncidentStyle.draftLabel,
										{ position: "absolute", top: 5, right: 5 },
									]}
								>
									<Text style={[IncidentStyle.draftTxt]}>{"Draft"}</Text>
								</View>
							)}
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
					<View style={[IncidentStyle.incidentTextContainer]}>
						<Text style={[IncidentStyle.incidentTitle]}>{vehicle || "-"}</Text>
						<Text style={[IncidentStyle.incidentDesc]}>
							{"NR# - " + item.display_id}
						</Text>
					</View>
				</TouchableOpacity>
			</View>
		);
	};
	const onPressClaimTalk = (incident) => {
		props.navigation.navigate("ClaimTalkIncidentDetails", {
			incident: incident,
		});
	};
	const renderClaimTalkIncidents = (item) => {
		return (
			<View style={[IncidentStyle.incidentListContainer]}>
				<TouchableOpacity onPress={() => onPressClaimTalk(item)}>
					<ImageBackground
						style={IncidentStyle.incidentImg}
						source={{
							uri: item.incident_image[0]?.photo_path
								? item.incident_image[0]?.photo_path
								: "https://cdn.pixabay.com/photo/2016/11/21/16/37/loader-1846346_1280.jpg",
						}}
						borderTopLeftRadius={8}
						borderTopRightRadius={8}
					>
						<View style={[IncidentStyle.incidentViewImg]}>
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
					<View style={[IncidentStyle.incidentTextContainer]}>
						<View style={[CommonStyles.directionRowSB]}>
							<Text style={[IncidentStyle.incidentTitle]}>
								{moment(item?.incident_date, "YYYY-MM-DD").format("MM/DD/YYYY")}
							</Text>
							<TouchableOpacity
								disabled={loadingItemId ? true : false}
								onPress={() => onPressLocation(item)}
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
							</TouchableOpacity>
						</View>
					</View>
				</TouchableOpacity>
			</View>
		);
	};
	const renderArchiveIncidents = (item) => {
		return (
			<View style={[IncidentStyle.incidentListContainer]}>
				<ImageBackground
					style={IncidentStyle.incidentImg}
					source={{
						uri: item.image,
					}}
					borderTopLeftRadius={8}
					borderTopRightRadius={8}
				>
					<View style={[IncidentStyle.incidentViewImg]}>
						<Icons
							iconName={"circle"}
							iconSetName={"MaterialCommunityIcons"}
							iconColor={item.color}
							iconSize={10}
						/>
						<TouchableOpacity>
							<View style={[IncidentStyle.incidentEnd]}>
								<Icons
									iconName={item.iconName}
									iconSetName={item.iconType}
									iconColor={Colors.backArrowWhite}
									iconSize={18}
								/>
							</View>
						</TouchableOpacity>
					</View>
				</ImageBackground>
				<View style={[IncidentStyle.incidentATextContainer]}>
					<Text style={[IncidentStyle.incidentTitle]}>{item.name}</Text>
					<Text style={[IncidentStyle.incidentDesc]}>{item.nr}</Text>
				</View>
			</View>
		);
	};
	const archiveToggleScreen = () => {
		setArchiveScreen(!archiveScreen);
	};
	const gotoAllIncidentScreen = (text) => {
		props.navigation.navigate("AllIncident");
	};
	const gotoAllClaimTalkScreen = () => {
		props.navigation.navigate("AllClaimTalkIncident");
	};
	const gotoAddIncidentScreen = () => {
		props.navigation.navigate("IncidentInfo");
	};
	const gotoChatScreen = () => {
		props.navigation.navigate("Chats");
	};
	const RenderEmptyList = ({}) => (
		<View style={[CommonStyles.emptyListContainer, {}]}>
			<Text style={[CommonStyles.emptyTitle, { color: Colors.white }]}>
				{"No Incident Found!"}
			</Text>
			<Text
				style={[
					CommonStyles.emptyDescription,
					{ color: Colors.lightGrayBG, marginBottom: 0, fontSize: 10 },
				]}
			>
				{`No Incident found, Please add new incident.`}
			</Text>
		</View>
	);
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
	const LoadingList = () => (
		<FlatList
			style={{ ...CommonStyles.emptyList }}
			scrollEnabled={false}
			data={Array(2).fill(0)}
			keyExtractor={(item, index) => `skeleton-${index}`}
			renderItem={({ item, index }) => (
				<IncidentSkeleton
					backgroundColor={Colors.inputfillBG}
					width={deviceWidth / 2.39}
					height={120}
				/>
			)}
			maxToRenderPerBatch={2}
			horizontal={false}
			columnWrapperStyle={{ justifyContent: "space-between" }}
			numColumns={2}
		/>
	);

	return (
		<>
			<View style={[IncidentStyle.mainContainer]}>
				<DarkHeader
					whiteLabel={"Incident"}
					DarkHeaderMainStyle={[LayoutStyle.paddingTop30]}
					isMsgIcon={true}
					onPressMsgIcon={() => gotoChatScreen()}
				/>
				<ScrollView
					nestedScrollEnabled
					style={[IncidentStyle.mainBG]}
					showsVerticalScrollIndicator={false}
				>
					<View style={[IncidentStyle.container, { height: "auto" }]}>
						<View style={[IncidentStyle.headerDescContainer]}>
							<Text style={[IncidentStyle.headerDescWhite]}>{"Active"}</Text>
							<Text style={[IncidentStyle.headerDesc]}>{"Incidents"}</Text>
						</View>
						{isLoading ? (
							<LoadingList />
						) : (
							<FlatList
								scrollEnabled={false}
								data={incidentList?.slice(0, 2)}
								renderItem={({ item: contactItem, index }) =>
									renderIncidents(contactItem, index)
								}
								maxToRenderPerBatch={2}
								ListEmptyComponent={() => <RenderEmptyList />}
								horizontal={false}
								columnWrapperStyle={{ justifyContent: "space-between" }}
								numColumns={2}
								keyExtractor={(item) => item.id}
							/>
						)}
						{incidentList?.length > 2 && (
							<TouchableOpacity onPress={() => gotoAllIncidentScreen("active")}>
								<View style={[IncidentStyle.flexEndcontainer]}>
									<View style={[IncidentStyle.textIconContainer]}>
										<Text style={[IncidentStyle.viewMoreText]}>
											{"View More"}
										</Text>
										<Icons
											iconName={"arrow-right-thin"}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={Colors.secondary}
											iconSize={26}
										/>
									</View>
								</View>
							</TouchableOpacity>
						)}
					</View>
					<View style={[IncidentStyle.container, { height: "auto" }]}>
						<View style={[IncidentStyle.headerDescContainer]}>
							<Text style={[IncidentStyle.headerDescWhite]}>
								{"Claim Talk"}
							</Text>
							<Text style={[IncidentStyle.headerDesc]}>{"Incidents"}</Text>
						</View>
						{isLoading ? (
							<LoadingList />
						) : (
							<FlatList
								scrollEnabled={false}
								data={claimTalkList?.slice(0, 2)}
								renderItem={({ item: contactItem, index }) =>
									renderClaimTalkIncidents(contactItem, index)
								}
								maxToRenderPerBatch={2}
								ListEmptyComponent={() => <RenderEmptyList />}
								horizontal={false}
								columnWrapperStyle={{ justifyContent: "space-between" }}
								numColumns={2}
								keyExtractor={(item) => item.id}
							/>
						)}
						{claimTalkList?.length > 2 && (
							<TouchableOpacity onPress={() => gotoAllClaimTalkScreen()}>
								<View style={[IncidentStyle.flexEndcontainer]}>
									<View style={[IncidentStyle.textIconContainer]}>
										<Text style={[IncidentStyle.viewMoreText]}>
											{"View More"}
										</Text>
										<Icons
											iconName={"arrow-right-thin"}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={Colors.secondary}
											iconSize={26}
										/>
									</View>
								</View>
							</TouchableOpacity>
						)}
					</View>
					{archiveScreen && (
						<View style={{ ...LayoutStyle.paddingHorizontal20 }}>
							<Text
								style={[
									IncidentStyle.headerDescWhite,
									{ ...LayoutStyle.paddingTop20 },
								]}
							>
								{"Archives"}
							</Text>
							<FlatList
								scrollEnabled={false}
								data={dummyArchiveList}
								renderItem={({ item: incidentItem, index }) =>
									renderArchiveIncidents(incidentItem, index)
								}
								horizontal={false}
								columnWrapperStyle={{ justifyContent: "space-between" }}
								numColumns={2}
								keyExtractor={(item) => item.id}
							/>
							<TouchableOpacity
							// onPress={() => gotoAllIncidentScreen("archives")}
							>
								<View style={[IncidentStyle.flexEndcontainer]}>
									<View style={[IncidentStyle.textIconContainer]}>
										<Text style={[IncidentStyle.viewMoreText]}>
											{"View More"}
										</Text>
										<Icons
											iconName={"arrow-right-thin"}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={Colors.secondary}
											iconSize={26}
										/>
									</View>
								</View>
							</TouchableOpacity>
						</View>
					)}
					<View style={[IncidentStyle.btnContainer]}>
						{/* Don't remove this comment code:- code use for Archives funactionality with realm DB */}
						{/* <Button
							onPress={() => archiveToggleScreen()}
							isBtnActive={true}
							btnName={archiveScreen ? "Hide Archives" : " View Archives"}
							btnLabelColor={Colors.white}
							btnColor={Colors.transparent}
							btnBorderColor={Colors.secondary}
							btnWidth={1}
						/> */}
						<View style={{}}>
							<Button
								onPress={() => gotoAddIncidentScreen()}
								isBtnActive={true}
								btnName={"Report Incident"}
								btnColor={Colors.secondary}
								btnLabelColor={Colors.white}
							/>
						</View>
					</View>
				</ScrollView>
			</View>
		</>
	);
};

export default IncidentScreen;
