import {
	View,
	Text,
	ImageBackground,
	Pressable,
	TouchableOpacity,
	NativeModules,
	Platform,
	StyleSheet,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LinearGradient from "react-native-linear-gradient";
import { DarkHeader, Overlay, Icons, Loader } from "../../components";
import { getData, storeData } from "../../utils/LocalData";
import LayoutStyle from "../../styles/LayoutStyle";
import HomeStyle from "../../styles/HomeStyle";
import IMAGES from "../../assets/images/Images";
import Colors from "../../styles/Colors";
import { crashDetectionRequest } from "../auth/redux/Action";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { getCurrentLocation, locationPermission } from "../../utils/Location";
import { deviceHeight, deviceWidth } from "../../utils/DeviceInfo";
import ComponentStyles from "../../styles/ComponentStyles";
import FastImage from "react-native-fast-image";

const HomeScreen = (props) => {
	const dispatch = useDispatch();
	const mapView = useRef(null);

	const userData = useSelector((state) => state.Auth.userData);
	const isLoading = useSelector((state) => state.Auth.isLoading);
	const isEnableCrashDetection = useSelector(
		(state) => state.Auth.isEnableCrashDetection
	);

	const [isModal, setIsModal] = useState(false);
	const [isWelcomeScreen, setIsWelcomeScreen] = useState(true);
	const [isPassScreen, setIsPassScreen] = useState(false);
	const [isIncidentScreen, setIsIncidentScreen] = useState(false);
	const [isChatScreen, setIsChatScreen] = useState(false);
	const [isAccountScreen, setIsAccountScreen] = useState(false);

	const [firstName, setFirstName] = useState("");

	const [isPassCarousel, setIsPassCarousel] = useState(false);
	const [isIncidentCarousel, setIsIncidentCarousel] = useState(false);
	const [isChatCarousel, setIsChatCarousel] = useState(false);
	const [isAccountCarousel, setIsAccountCarousel] = useState(false);

	const [mapReady, setMapReady] = useState(false);
	const [currentLatitude, setCurrentLatitude] = useState("");
	const [currentLongitude, setCurrentLongitude] = useState("");

	const { CrashDetectionModule } = NativeModules;
	const LATITUDE = 37.78825;
	const LONGITUDE = -122.4324;

	useEffect(() => {
		const getData = async () => {
			if (!global.hasDetectionTracked) {
				dispatch(crashDetectionRequest(props.navigation));
				global.hasDetectionTracked = true;
			}
		};
		if (userData?.name) {
			let splitName = userData?.name?.split?.(" ")?.[0] || "";
			setFirstName(splitName);
		}
		getData();
		getLiveLocation();
	}, [dispatch, props.navigation, mapReady]);

	useEffect(() => {
		(async () => {
			const modalValue = await getData("modal");
			setIsModal(modalValue);
		})();
	}, []);

	useEffect(() => {
		if (Platform.OS === "android") {
			enableCrashDetection();
		}
	}, [isEnableCrashDetection]);

	const getLiveLocation = async () => {
		const locPermissionDenied = await locationPermission();
		if (locPermissionDenied) {
			const { latitude, longitude } = await getCurrentLocation();
			setCurrentLatitude(latitude);
			setCurrentLongitude(longitude);

			if (mapView.current && mapReady) {
				mapView.current.animateCamera({
					center: {
						latitude: latitude || LATITUDE,
						longitude: longitude || LONGITUDE,
					},
					pitch: 65,
					zoom: 18,
				});
			}
		}
	};
	const enableCrashDetection = async () => {
		if (isEnableCrashDetection) {
			console.log("start crash detection");
			CrashDetectionModule.startCrashDetectionService();
		} else if (CrashDetectionModule.stopCrashDetectionService()) {
			console.log("stop crash detection");
			CrashDetectionModule.stopCrashDetectionService();
		}
	};
	const saveModalVisible = async () => {
		await storeData("modal", false);
		global.modal = false;
		onRequestClose();
	};
	const onRequestClose = () => {
		setIsModal(false);
	};
	const gotoPassModal = () => {
		setIsWelcomeScreen(false);
		setIsPassScreen(true);
		setIsPassCarousel(true);
	};
	const gotoIncidentModal = () => {
		setIsWelcomeScreen(false);
		setIsPassScreen(false);
		setIsIncidentScreen(true);
		setIsIncidentCarousel(true);
	};
	const gotoChatModal = () => {
		setIsWelcomeScreen(false);
		setIsPassScreen(false);
		setIsIncidentScreen(false);
		setIsChatScreen(true);
		setIsChatCarousel(true);
	};
	const gotoAccountModal = () => {
		setIsWelcomeScreen(false);
		setIsPassScreen(false);
		setIsIncidentScreen(false);
		setIsChatScreen(false);
		setIsAccountScreen(true);
		setIsAccountCarousel(true);
	};
	const gotoChatScreen = () => {
		props.navigation.navigate("Chats");
	};
	const LetsGoSomewhere = ({ type }) => (
		<LinearGradient
			start={{ x: 1, y: 0 }}
			end={{ x: 1, y: 1 }}
			locations={[0.1, 0.35, 0.6]}
			colors={["#0d223db3", "#0d223d75", "#ffffff00"]}
			style={HomeStyle.gradientImgBG}
		>
			<View
				style={[
					HomeStyle.homeContainer,
					{ paddingTop: type === "preview" ? 100 : 50 },
				]}
			>
				<Text style={[HomeStyle.HomeTextGO]}>{"Let’s Go"}</Text>
				<Text style={[HomeStyle.HomeText]}>{"Somewhere"}</Text>

				<View style={[HomeStyle.naviIconContainer]}>
					<TouchableOpacity onPress={() => props.navigation.navigate("Map")}>
						<View style={[HomeStyle.navigationIcon]}>
							<Icons
								iconColor={Colors.iconWhite}
								iconName={"navigation-outline"}
								iconSetName={"MaterialCommunityIcons"}
								iconSize={40}
							/>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</LinearGradient>
	);
	return (
		<View style={{ flex: 1 }}>
			<Loader show={isLoading} />
			<DarkHeader
				whiteLabel={"Home"}
				DarkHeaderMainStyle={[LayoutStyle.paddingTop20]}
				isMsgIcon={true}
				onPressMsgIcon={() => gotoChatScreen()}
			/>
			<View style={[HomeStyle.headerDescContainer]}>
				<Text style={[HomeStyle.headerDescWhite]}>{"Welcome"}</Text>
				<Text style={[HomeStyle.headerDesc]}>
					{firstName ? `${firstName}!` : ""}
				</Text>
			</View>

			{!isLoading && (
				<View>
					{currentLatitude && currentLongitude ? (
						<View style={HomeStyle?.gradientImgBG}>
							<MapView
								ref={mapView}
								provider={PROVIDER_GOOGLE}
								style={StyleSheet.absoluteFillObject}
								initialRegion={{
									latitude: currentLatitude || LATITUDE,
									longitude: currentLongitude || LONGITUDE,
									latitudeDelta: 0.005,
									longitudeDelta: 0.005,
								}}
								showsBuildings
								showsIndoors
								showsScale
								scrollEnabled={false}
								zoomEnabled={false}
								rotateEnabled={false}
								showsCompass={false}
								onMapLoaded={() => {
									setMapReady(true);
								}}
								userInterfaceStyle={"light"}
							/>
							<LetsGoSomewhere type={"map"} />
						</View>
					) : (
						<ImageBackground
							source={IMAGES.dummyMap}
							style={{
								width: deviceWidth,
								height: deviceHeight - 190,
							}}
							resizeMode="cover"
						>
							<LetsGoSomewhere type={"preview"} />
						</ImageBackground>
					)}
				</View>
			)}

			{isModal && (
				<Overlay visible={isModal}>
					{isWelcomeScreen ? (
						<View>
							<View style={[HomeStyle.welcomeModal]}>
								<View style={[HomeStyle.centerModal]}>
									<Text style={[HomeStyle.welcomeLabel]}>{"Welcome "}</Text>
									<Text style={[HomeStyle.welcomeName]}>
										{firstName ? `${firstName}!` : ""}
									</Text>
								</View>
								<Text
									style={[
										HomeStyle.messageStyle,
										{ ...LayoutStyle.marginTop10 },
									]}
								>
									{
										"We are happy to see you here. Check out our features & tips to get started."
									}
								</Text>
							</View>
							<Pressable
								onPress={() => gotoPassModal()}
								style={[HomeStyle.btnGoContainer]}
							>
								<Text style={[HomeStyle.btnTextGo]}>{"Let's Go"}</Text>
							</Pressable>
							<Pressable
								style={[HomeStyle.btnSkipContainer]}
								onPress={() => saveModalVisible(true)}
							>
								<Text style={[HomeStyle.btnTextSkip]}>{"Skip"}</Text>
							</Pressable>
						</View>
					) : isPassScreen ||
					  isIncidentScreen ||
					  isChatScreen ||
					  isAccountScreen ? (
						<View>
							<View style={[HomeStyle.welcomeModal]}>
								<View style={[HomeStyle.centerModal]} />
							</View>
							<View style={[HomeStyle.containModal]}>
								<View style={[HomeStyle.iconContainer]}>
									<Icons
										iconName={
											isPassScreen
												? "view-grid-outline"
												: isIncidentScreen
												? "alert-outline"
												: isChatScreen
												? "comment-multiple-outline"
												: isAccountScreen
												? "account-circle-outline"
												: null
										}
										iconSetName={"MaterialCommunityIcons"}
										iconColor={Colors.iconBlack}
										iconSize={24}
									/>
								</View>

								<Text style={[HomeStyle.moduleName]}>
									{isPassScreen
										? "Passes"
										: isIncidentScreen
										? "Incidents"
										: isChatScreen
										? "Chat"
										: isAccountScreen
										? "Account"
										: null}
								</Text>
								<Text style={[HomeStyle.messageStyle]}>
									{isPassScreen
										? "Organize different types of information such as Company Details, Personal, and Documents in one place."
										: isIncidentScreen
										? "Utilize the power and ease of processing and managing auto claims."
										: isChatScreen
										? "Chat with 24/7 Support, Road Assistance and more."
										: isAccountScreen
										? "Add Trusted Contacts, Payment Methods, & more from the Account Tab."
										: null}
								</Text>
								{isAccountScreen ? (
									<Pressable
										onPress={() => saveModalVisible(true)}
										style={[HomeStyle.btnFinishContainer]}
									>
										<Text style={[HomeStyle.btnTextFinish]}>{"Finished"}</Text>
									</Pressable>
								) : (
									<Pressable
										onPress={() =>
											isPassScreen
												? gotoIncidentModal()
												: isIncidentScreen
												? gotoChatModal()
												: isChatScreen
												? gotoAccountModal()
												: isAccountScreen
										}
										style={[HomeStyle.iconBtnContainer]}
									>
										<Icons
											iconName={"arrow-right"}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={Colors.iconWhite}
											iconSize={32}
										/>
									</Pressable>
								)}
								<View style={[HomeStyle.carouselContainer]}>
									<View
										style={[
											HomeStyle.carousel,
											{
												backgroundColor: isPassCarousel
													? Colors.secondary
													: Colors.disableBtn,
											},
										]}
									></View>
									<View
										style={[
											HomeStyle.carousel,
											{
												backgroundColor: isIncidentCarousel
													? Colors.secondary
													: Colors.disableBtn,
											},
										]}
									></View>
									<View
										style={[
											HomeStyle.carousel,
											{
												backgroundColor: isChatCarousel
													? Colors.secondary
													: Colors.disableBtn,
											},
										]}
									></View>
									<View
										style={[
											HomeStyle.carousel,
											{
												backgroundColor: isAccountCarousel
													? Colors.secondary
													: Colors.disableBtn,
											},
										]}
									></View>
								</View>
							</View>
						</View>
					) : null}
				</Overlay>
			)}
		</View>
	);
};

export default HomeScreen;
