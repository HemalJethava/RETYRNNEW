import React, { useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	LayoutAnimation,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getIncidentDetailsRequest } from "./redux/Action";
import { LightHeader, KeyValue, Loader, Icons, Button } from "../../components";
import IncidentStyle from "../../styles/IncidentStyles";
import Colors from "../../styles/Colors";
import { deviceWidth } from "../../utils/DeviceInfo";
import CommonStyles from "../../styles/CommonStyles";
import moment from "moment";
import { ImagesPopup } from "../../components/ImagesPopup";
import ComponentStyles from "../../styles/ComponentStyles";
import {
	formatKeyToWord,
	hiddenFields,
	noImgUrl,
	truncateText,
} from "../../config/CommonFunctions";
import VideoLoading from "../../components/LoaderComponents/VideoLoading";
import Swiper from "react-native-swiper";
import FastImage from "react-native-fast-image";

const IncidentDetailsScreen = (props) => {
	const dispatch = useDispatch();

	const stateList = useSelector((state) => state.Incident.stateList);
	const vehicleList = useSelector((state) => state.Incident.vehicleList);
	const incidentDetails = useSelector(
		(state) => state.Incident.incidentDetails?.data
	);

	const [isLoading, setIsLoading] = useState(true);
	const [imagesLoading, setImagesLoading] = useState(false);
	const [incidentImages, setIncidentImages] = useState([]);
	const [showImagesPopup, setShowImagesPopup] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);

	const [state, setState] = useState("");
	const [vehicle, setVehicle] = useState("");
	const [isZoomed, setIsZoomed] = useState(false);

	const [errorIndexes, setErrorIndexes] = useState([]);

	useEffect(() => {
		const param = {
			incident_id: props.route.params?.incidentID,
		};

		setImagesLoading(true);
		dispatch(getIncidentDetailsRequest(param, props.navigation));
		setIsLoading(false);
	}, [props.route.params?.incidentID]);

	useEffect(() => {
		if (!incidentDetails) return;
		if (
			incidentDetails?.incident_images &&
			Array.isArray(incidentDetails.incident_images)
		) {
			const images = incidentDetails.incident_images
				.filter((item) => item.photo_path)
				.map((i) => i.photo_path);
			setIncidentImages(images);
			setImagesLoading(false);
		}

		if (
			incidentDetails?.incident_data?.state_id &&
			stateList?.data?.length > 0
		) {
			const incidentState = stateList.data.find(
				(item) => item.id === parseInt(incidentDetails.incident_data.state_id)
			);
			setState(incidentState?.name || "Unknown State");
		}

		if (
			incidentDetails?.incident_data?.vehicle_id &&
			vehicleList?.data?.length > 0
		) {
			const incidentVehicle = vehicleList.data.find(
				(item) => item.id === parseInt(incidentDetails.incident_data.vehicle_id)
			);

			setVehicle(
				`${incidentVehicle?.name} ${
					incidentVehicle?.vehicle_number
						? `(${incidentVehicle?.vehicle_number})`
						: ""
				}` || "Unknown Vehicle"
			);
		}
	}, [incidentDetails, stateList, vehicleList]);

	const gotoBack = () => {
		props.navigation.goBack();
	};
	const toggleExpandCollapse = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setIsExpanded(!isExpanded);
	};
	const DisplayFields = ({ data }) => {
		const entries = Object.entries(data)?.filter(
			([key]) => !hiddenFields?.includes(key)
		);
		return (
			<>
				{Object.entries(data)
					.filter(([key]) => !hiddenFields.includes(key))
					.map(([key, value], index) => (
						<View
							key={index}
							style={[
								ComponentStyles.flexKeyContainer,
								{
									borderBottomWidth: index === entries.length - 1 ? 0 : 0.5,
									borderColor: Colors.labelBlack,
								},
							]}
						>
							<Text style={[ComponentStyles.keyStyle, {}]}>
								{formatKeyToWord(key)}
							</Text>
							<Text
								style={[
									ComponentStyles.valueStyle,
									{ color: Colors.labelBlack, textAlign: "left" },
								]}
							>
								{/^[a-zA-Z]/.test(value)
									? value.charAt(0).toUpperCase() + value.slice(1)
									: value}
							</Text>
						</View>
					))}
			</>
		);
	};
	const renderDamageArea = (damageArea) => {
		if (!damageArea) return;
		return damageArea.split(",").map((item, index) => (
			<Text
				key={index}
				style={[
					ComponentStyles.valueStyle,
					{
						color: Colors.labelBlack,
					},
				]}
			>
				{item.trim() + (index < damageArea.split(",").length - 1 ? "," : "")}
			</Text>
		));
	};
	const onPressContinueDraft = () => {
		props.navigation.navigate("IncidentList", { savedDraft: incidentDetails });
	};
	const handleImageError = (index) => {
		setErrorIndexes((prev) => [...new Set([...prev, index])]);
	};
	/* #CCF2D0 */
	return (
		<View
			style={[IncidentStyle.mainContainer, { backgroundColor: Colors.white }]}
		>
			{showImagesPopup && (
				<ImagesPopup
					show={showImagesPopup}
					onHide={() => setShowImagesPopup(false)}
					data={incidentImages}
				/>
			)}
			<Loader show={isLoading} />
			<LightHeader
				isLogo={false}
				iconName={"angle-left"}
				iconSize={24}
				iconSetName={"FontAwesome6"}
				iconColor={Colors.primary}
				isBackIcon={true}
				headerBG={Colors.white}
				statusBG={Colors.white}
				onPress={() => gotoBack()}
				headerText={incidentDetails?.incident_data?.incident_name}
				isSmallText={true}
				smallLabel={
					incidentDetails?.incident_data?.incident_date
						? moment(
								incidentDetails?.incident_data?.incident_date,
								"YYYY-MM-DD"
						  ).format("MM/DD/YYYY")
						: ""
				}
			/>
			<ScrollView
				overScrollMode={"never"}
				showsVerticalScrollIndicator={false}
				style={[IncidentStyle.mainContainer, { backgroundColor: Colors.white }]}
				contentContainerStyle={IncidentStyle.containerColumn}
			>
				<View style={[IncidentStyle.imgCardContainer, { paddingBottom: 20 }]}>
					<View style={[IncidentStyle.sliderBox, { marginBottom: 20 }]}>
						{incidentImages.length > 0 ? (
							<>
								{imagesLoading ? (
									<View style={{ width: deviceWidth / 1.15 }}>
										<View style={{ borderRadius: 10, overflow: "hidden" }}>
											<VideoLoading />
										</View>
									</View>
								) : (
									<Swiper
										style={[IncidentStyle.detailSwiperContainer]}
										showsButtons={false}
										dotColor={Colors.secondary60}
										activeDotColor={Colors.secondary}
										paginationStyle={{ bottom: -25 }}
									>
										{incidentImages.map((image, index) => {
											const hasError = errorIndexes.includes(index);
											return (
												<View>
													<TouchableOpacity
														key={index}
														style={{}}
														onPress={() => setShowImagesPopup(true)}
													>
														<FastImage
															source={{ uri: image }}
															style={[IncidentStyle.detailSwiperImg]}
															resizeMode={"contain"}
															onError={() => handleImageError(index)}
														/>
													</TouchableOpacity>
													{hasError && (
														<View style={[IncidentStyle.imageErrContainer]}>
															<Icons
																iconSetName={"MaterialIcons"}
																iconName={"error-outline"}
																iconSize={40}
																iconColor={Colors.errorBoxRed}
															/>
															<Text style={[IncidentStyle.imageErrTxt]}>
																{"Failed to load image"}
															</Text>
														</View>
													)}
												</View>
											);
										})}
									</Swiper>
								)}
							</>
						) : (
							<FastImage
								source={{
									uri: noImgUrl,
								}}
								style={[IncidentStyle.detailNoImg]}
								resizeMode={"contain"}
							/>
						)}
					</View>
				</View>
				<View style={[IncidentStyle.detailYelloBox]}>
					<Text style={[IncidentStyle.detailsLabel]}>{"Details"}</Text>

					{incidentDetails?.incident_data?.vehicle_id && (
						<KeyValue
							keyLabel={"Vehicle"}
							valueLabel={truncateText(vehicle, 30)}
							keyColor={Colors.labelBlack}
						/>
					)}
					{incidentDetails?.incident_data?.driver_name && (
						<KeyValue
							keyLabel={"Driver"}
							valueLabel={truncateText(
								incidentDetails?.incident_data?.driver_name,
								30
							)}
							keyColor={Colors.labelBlack}
						/>
					)}
					<KeyValue
						keyLabel={"Retyrn Claim ID"}
						valueLabel={truncateText(incidentDetails?.display_id, 30)}
						keyColor={Colors.labelBlack}
					/>
					<KeyValue
						keyLabel={"Incident"}
						valueLabel={truncateText(
							incidentDetails?.incident_data?.incident_name,
							30
						)}
						keyColor={Colors.labelBlack}
					/>
					<KeyValue
						keyLabel={"Date Submitted"}
						valueLabel={
							incidentDetails?.incident_data?.incident_date
								? moment(
										incidentDetails?.incident_data?.incident_date,
										"YYYY-MM-DD"
								  ).format("MM/DD/YYYY")
								: "-"
						}
						keyColor={Colors.labelBlack}
					/>
					{incidentDetails?.incident_data?.incident_time && (
						<KeyValue
							keyLabel={"Time Submitted"}
							valueLabel={truncateText(
								incidentDetails?.incident_data?.incident_time,
								30
							)}
							keyColor={Colors.labelBlack}
						/>
					)}
					{incidentDetails?.incident_data?.state_id && (
						<KeyValue
							keyLabel={"State"}
							valueLabel={state ? truncateText(state, 30) : "-"}
							keyColor={Colors.labelBlack}
						/>
					)}
					{incidentDetails?.incident_data?.damage_area && (
						<View
							style={[
								ComponentStyles.keyContainer,
								{ borderBottomWidth: 0.5, alignItems: "flex-start" },
							]}
						>
							<Text
								style={[ComponentStyles.keyStyle, { color: Colors.labelBlack }]}
							>
								{"Damage Location"}
							</Text>
							<View>
								{renderDamageArea(incidentDetails?.incident_data?.damage_area)}
							</View>
						</View>
					)}
					<KeyValue
						keyLabel={"Status"}
						valueLabel={
							incidentDetails?.status
								? incidentDetails?.status.charAt(0).toUpperCase() +
								  incidentDetails?.status.slice(1)
								: ""
						}
						valueColor={"#FFBA00"}
						keyColor={Colors.labelBlack}
						borderBottomWidth={"no"}
					/>
					<View>
						<View style={{ ...CommonStyles.directionRowSB }}>
							<Text style={[IncidentStyle.detailsLabel]}>{"Sub Details"}</Text>
							<TouchableOpacity
								style={{ ...CommonStyles.directionRowSB }}
								onPress={toggleExpandCollapse}
							>
								<Text style={IncidentStyle.seeMoreTxt}>{`See ${
									isExpanded ? "less" : "more"
								}`}</Text>
								<Icons
									iconColor={Colors.secondary}
									iconSetName={"MaterialCommunityIcons"}
									iconName={isExpanded ? "chevron-up" : "chevron-down"}
									iconSize={22}
								/>
							</TouchableOpacity>
						</View>

						{isExpanded && (
							<>
								<DisplayFields data={incidentDetails?.incident_data} />
							</>
						)}
					</View>
				</View>
			</ScrollView>
			{incidentDetails?.process_status === "draft" && (
				<View style={IncidentStyle.continueDraft}>
					<Button
						onPress={() => onPressContinueDraft()}
						btnName={"Continue Draft"}
						isBtnActive={true}
						btnColor={Colors.secondary}
						btnLabelColor={Colors.white}
					/>
				</View>
			)}
			{/* <View style={IncidentStyle.continueDraft}>
				<Button
					onPress={() => props.navigation.navigate("Reimbursement")}
					btnName={"Reimbursement"}
					btnColor={Colors.limeGreen}
					btnLabelColor={Colors.white}
				/>
			</View> */}
		</View>
	);
};

export default IncidentDetailsScreen;
