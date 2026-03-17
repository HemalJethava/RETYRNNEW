import React, { useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	LayoutAnimation,
	TouchableOpacity,
	BackHandler,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addIncidentRequest } from "./redux/Action";
import moment from "moment";
import FastImage from "react-native-fast-image";
import { DarkHeader, Button, KeyValue, Icons, Loader } from "../../components";
import IncidentStyle from "../../styles/IncidentStyles";
import Colors from "../../styles/Colors";
import { deviceHeight, deviceWidth } from "../../utils/DeviceInfo";
import CommonStyles from "../../styles/CommonStyles";
import {
	compressImage,
	formatKeyToWord,
	hiddenFields,
} from "../../config/CommonFunctions";
import ComponentStyles from "../../styles/ComponentStyles";
import Swiper from "react-native-swiper";

const ManualIncidentReviewScreen = (props) => {
	const reviewData = props.route.params?.reviewScreen;
	const isLoading = useSelector((state) => state.Incident.isLoading);
	const dispatch = useDispatch();
	const swiperRef = useRef(null);

	const [isExpanded, setIsExpanded] = useState(false);
	// const [isLoading, setIsLoading] = useState(false);
	const [imagesUri, setImagesUri] = useState([]);

	useEffect(() => {
		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			gotoBack
		);
		return () => backHandler.remove();
	}, [props.navigation]);

	useEffect(() => {
		if (reviewData && reviewData?.photo?.length > 0) {
			const imageUris = reviewData.photo?.map((photo) => photo.uri);
			setImagesUri(imageUris);
		}
	}, []);

	const gotoBack = () => {
		// props.navigation.navigate("IncidentScreen");
		props.navigation.goBack();
		return true;
	};
	const toggleExpandCollapse = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setIsExpanded(!isExpanded);
	};
	const DisplayFields = ({ data }) => {
		return (
			<>
				{Object.entries(data)
					.filter(([key, value]) => {
						return !hiddenFields.includes(key) && key !== "other_info";
					})
					.map(([key, value]) => (
						<View
							key={key}
							style={[
								ComponentStyles.flexKeyContainer,
								{
									borderBottomWidth: 0.5,
									borderColor: "#C1DEF1",
								},
							]}
						>
							<Text
								style={[ComponentStyles.keyStyle, { color: Colors.secondary }]}
							>
								{formatKeyToWord(key)}
							</Text>
							<Text
								style={[
									ComponentStyles.valueStyle,
									{ color: Colors.labelBlack, textAlign: "left" },
								]}
							>
								{value}
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
	const gotoSubmitScreen = async () => {
		const excludedKeys = ["state", "vehicle"];
		const data = Object.fromEntries(
			Object.entries(reviewData).filter(([key]) => !excludedKeys.includes(key))
		);

		const formData = new FormData();
		formData.append("type", "completed");
		for (const [key, value] of Object.entries(data)) {
			if (key === "incident_date") {
				formData.append(
					"incident_date",
					moment(value, "MM-DD-YYYY").format("YYYY-MM-DD")
				);
			} else if (key === "state_id" || key === "vehicle_id") {
				formData.append(key, parseInt(value));
			} else if (key === "photo") {
				await Promise.all(
					value.map(async (image, index) => {
						let uri = image.uri;

						if (!uri.startsWith("https")) {
							const compressed = await compressImage(image);
							uri = compressed.uri;
						}

						const fileExt = image.name?.split(".").pop() || "jpg";

						formData.append(`photo[${index}]`, {
							uri,
							type: image.type || `image/${fileExt}`,
							name: `${Date.now()}_${index}.${fileExt}`,
						});
					})
				);
			} else {
				formData.append(key, value);
			}
		}
		dispatch(addIncidentRequest(formData, props.navigation));
	};

	return (
		<View
			style={[
				IncidentStyle.mainContainer,
				{ backgroundColor: Colors.lightBlue },
			]}
		>
			<Loader show={isLoading} />
			<DarkHeader
				isLogo={true}
				iconName={"angle-left"}
				iconSetName={"FontAwesome6"}
				iconColor={Colors.backArrowWhite}
				iconSize={24}
				onPress={() => gotoBack()}
			/>
			{!isLoading && (
				<ScrollView overScrollMode={"never"}>
					<View
						style={[
							IncidentStyle.backgroundColorBlue,
							IncidentStyle.paddingFormContainer,
							{ paddingBottom: 0 },
						]}
					>
						<Text style={[IncidentStyle.darkQusText]}>{"Review"}</Text>
						<View style={[IncidentStyle.imgBGContainer]}>
							{reviewData?.photo?.length === 1 ? (
								<FastImage
									style={{
										height: deviceHeight / 4.5,
										width: deviceWidth - 38,
										borderRadius: 12,
										marginBottom: 20,
									}}
									source={{ uri: reviewData.photo[0].uri }}
									borderRadius={12}
								/>
							) : (
								<View style={{ ...CommonStyles.mainContainer }}>
									<Swiper
										ref={swiperRef}
										horizontal={true}
										loop={false}
										showsButtons={false}
										scrollEnabled={true}
										index={0}
										containerStyle={IncidentStyle.swiperContainer}
										dotColor={Colors.secondary60}
										activeDotColor={Colors.secondary}
										activeDotStyle={IncidentStyle.swiperActiveDot}
										dotStyle={IncidentStyle.swiperDot}
										paginationStyle={IncidentStyle.swiperPagination}
									>
										{imagesUri.map((image, index) => (
											<FastImage
												key={index}
												source={{ uri: image }}
												style={IncidentStyle.swiperImage}
												resizeMode={FastImage.resizeMode.contain}
											/>
										))}
									</Swiper>
								</View>
							)}
						</View>
					</View>
					<View style={[IncidentStyle.incidentReviewForm]}>
						<View style={[IncidentStyle.descContainer]}>
							<Text style={[IncidentStyle.reviewDesc]}>
								{
									"**Any person who knowingly, and with intent to defraud any insurance company or other person, files a statement of claim containing any materially false information, or conceals, for the purpose of misleading, information concerning any fact material thereto, commits a fraudulent insurance act, which is a crime, and may also be subject to a civil penalty. "
								}
							</Text>
						</View>
						{reviewData?.vehicle && (
							<KeyValue
								keyLabel={"Vehicle"}
								valueLabel={reviewData?.vehicle}
								keyColor={Colors.secondary}
								borderColor={"#C1DEF1"}
							/>
						)}
						{reviewData?.driver_name && (
							<KeyValue
								keyLabel={"driver Name"}
								valueLabel={reviewData.driver_name}
								keyColor={Colors.secondary}
								borderColor={"#C1DEF1"}
							/>
						)}
						<KeyValue
							keyLabel={"Incident"}
							valueLabel={reviewData?.incident_name}
							keyColor={Colors.secondary}
							borderColor={"#C1DEF1"}
						/>
						<KeyValue
							keyLabel={"Date"}
							valueLabel={reviewData?.incident_date}
							keyColor={Colors.secondary}
							borderColor={"#C1DEF1"}
						/>
						{reviewData?.incident_time && (
							<KeyValue
								keyLabel={"Time"}
								valueLabel={reviewData?.incident_time}
								keyColor={Colors.secondary}
								borderColor={"#C1DEF1"}
							/>
						)}
						<KeyValue
							keyLabel={"State"}
							valueLabel={reviewData?.state}
							keyColor={Colors.secondary}
							borderColor={"#C1DEF1"}
						/>
						{reviewData?.damage_area && (
							<View
								style={[
									ComponentStyles.keyContainer,
									{
										borderBottomWidth: 0.5,
										borderColor: "#C1DEF1",
										alignItems: "flex-start",
									},
								]}
							>
								<Text
									style={[
										ComponentStyles.keyStyle,
										{ color: Colors.secondary },
									]}
								>
									{"Damage Location"}
								</Text>
								<View>{renderDamageArea(reviewData?.damage_area)}</View>
							</View>
						)}
						<View style={[IncidentStyle.keyLabelContainer]}>
							<Text style={[IncidentStyle.labelKey]}>
								{"Critical Information"}
							</Text>
							<Text style={[IncidentStyle.labelValue]}>
								{reviewData?.other_info}
							</Text>
						</View>

						<View style={{ marginBottom: 20 }}>
							<View style={{ ...CommonStyles.directionRowSB }}>
								<Text style={[IncidentStyle.detailsLabel]}>
									{"Sub Details"}
								</Text>
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
									<DisplayFields data={reviewData} />
								</>
							)}
						</View>
						<Button
							onPress={() => gotoSubmitScreen()}
							btnColor={Colors.secondary}
							isBtnActive={true}
							btnLabelColor={Colors.white}
							btnName={"Submit"}
						/>
					</View>
				</ScrollView>
			)}
		</View>
	);
};

export default ManualIncidentReviewScreen;
