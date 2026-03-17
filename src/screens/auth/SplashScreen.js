import {
	View,
	StatusBar,
	ImageBackground,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	Platform,
	StyleSheet,
	ScrollView,
	BackHandler,
	Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import LinearGradient from "react-native-linear-gradient";
import { initAppRequest } from "./redux/Action";
import { Icons } from "../../components";
import { getData } from "../../utils/LocalData";
import AuthStyle from "../../styles/AuthStyle";
import Colors from "../../styles/Colors";
import IMAGES from "../../assets/images/Images";
import { getBuildNumber, getVersion } from "react-native-device-info";
import CommonStyles from "../../styles/CommonStyles";
import FontFamily from "../../assets/fonts/FontFamily";
import { Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Api from "../../utils/Api";

const SplashScreen = (props) => {
	const dispatch = useDispatch();

	const [firstLoad, setFirstLoad] = useState(true);
	const [updateRequired, setUpdateRequired] = useState(false);
	const [isMandatory, setIsMandatory] = useState(false);
	const [updateUrl, setUpdateUrl] = useState("");
	const [latestFeatures, setLatestFeatures] = useState([]);
	const [versionDetail, setVersionDetail] = useState(null);

	useEffect(() => {
		let backHandler;

		const handleBackPress = () => {
			BackHandler.exitApp();
			return true;
		};

		const setupBackHandler = () => {
			backHandler = BackHandler.addEventListener(
				"hardwareBackPress",
				handleBackPress
			);
		};

		const timeout = setTimeout(() => {
			setupBackHandler();
		}, 300);

		return () => {
			clearTimeout(timeout);
			backHandler?.remove();
		};
	}, []);

	useEffect(() => {
		const fetchVersion = async () => {
			try {
				const response = await Api.get(`user/get-app-version`);
				if (response.success) {
					setVersionDetail(response);
				} else {
					await initializeApp();
				}
			} catch (error) {
				await initializeApp();
				setTimeout(() => setFirstLoad(false), 1000);
			}
		};
		fetchVersion();
	}, [firstLoad]);

	useEffect(() => {
		const fetchVersionAndCheckUpdate = async () => {
			try {
				const currentVersion = getVersion();
				const currentBuild = parseInt(getBuildNumber(), 10);
				const skipUpdate = await AsyncStorage.getItem("skipUpdate");

				const latestVersion = versionDetail?.data;
				if (!latestVersion) return;

				const isMandatory = latestVersion?.is_mandatory === "true";
				const platformData =
					Platform.OS === "ios"
						? latestVersion?.ios_data
						: latestVersion?.android_data;

				const latestAppVersion = platformData?.version;
				const latestBuild = parseInt(platformData?.build, 10);
				const updateUrl = platformData?.updateUrl;

				const requiresUpdate =
					latestAppVersion !== currentVersion || latestBuild > currentBuild;

				if (requiresUpdate && !(skipUpdate === "true" && !isMandatory)) {
					setUpdateRequired(true);
					setIsMandatory(isMandatory);
					setUpdateUrl(updateUrl);
					setLatestFeatures(latestVersion?.latest_features);
					return;
				}

				await initializeApp();
			} catch (error) {
				console.warn("Error checking for updates:", error);
				await initializeApp();
			}
		};

		if (versionDetail?.data) {
			fetchVersionAndCheckUpdate();
		}
	}, [versionDetail]);

	const initializeApp = async () => {
		try {
			const token = await getData("token");
			const name = await getData("userName");

			if (token) {
				global.userToken = token;
				global.userName = name;
				dispatch(initAppRequest(props.navigation));
			} else {
				setTimeout(() => setFirstLoad(false), 1000);
			}
		} catch (error) {
			console.warn("Error initializing app:", error);
		}
	};
	const gotoEulaScreen = () => {
		props.navigation.navigate("Eula");
	};
	const handleSkipUpdate = async () => {
		try {
			await AsyncStorage.setItem("skipUpdate", "true");
			setUpdateRequired(false);
			await initializeApp();
		} catch (error) {
			console.warn("Error skipping update:", error);
		}
	};
	if (updateRequired) {
		return (
			<View style={[styles.container]}>
				<StatusBar translucent backgroundColor="transparent" />
				<View style={[styles.imageContainer]}>
					<Image source={IMAGES.updateRocket} style={styles.rocketImage} />
				</View>
				<View style={[styles.detailContainer]}>
					<View style={[]}>
						<Text
							style={[
								styles.updateTxt,
								{ textAlign: "center", marginBottom: 10 },
							]}
						>
							{"Update Available"}
						</Text>
						<Text style={[styles.timeUpdateTitle]}>
							{"Get the Latest Features!"}
						</Text>
					</View>
					{Array.isArray(latestFeatures) && latestFeatures.length > 0 && (
						<ScrollView
							style={[styles.detailBox]}
							showsVerticalScrollIndicator={false}
						>
							{latestFeatures.map((feature, index) => (
								<Text key={index} style={[styles.desTxt]}>{`${
									index + 1
								}. ${feature}`}</Text>
							))}
						</ScrollView>
					)}
				</View>
				<View style={[styles.btnContainer]}>
					<TouchableOpacity
						style={[styles.updateBtn]}
						onPress={() => Linking.openURL(updateUrl)}
					>
						<Text style={[styles.updateBtnTxt]}>{"Update"}</Text>
					</TouchableOpacity>
					{!isMandatory && (
						<TouchableOpacity
							style={[styles.skipBtn]}
							onPress={() => handleSkipUpdate()}
						>
							<Text style={[styles.skipTxt]}>{"No Thanks! Skip for Now"}</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>
		);
	}

	return (
		<>
			<View style={[AuthStyle.mainContainer]}>
				<StatusBar translucent backgroundColor="transparent" />
				<ImageBackground source={IMAGES.primaryBG} style={[AuthStyle.bgImage]}>
					<LinearGradient
						start={{ x: 0, y: 1 }}
						end={{ x: 1, y: 0 }}
						locations={[0, 0.7]}
						colors={[Colors.linearGradient1, Colors.linearGradient2]}
						style={AuthStyle.gradientImgBG}
					>
						<View style={[AuthStyle.splashContainer]}>
							{/* <FastImage
								style={[AuthStyle.textLogoWhite]}
								source={IMAGES.primaryTextLogo}
								resizeMode={FastImage.resizeMode.contain}
							/> */}
							<View style={[AuthStyle.welcomeContainer]}>
								<Text style={[AuthStyle.welcomeTxt]}>
									{"Welcome to Retyrn!"}
								</Text>
							</View>
							<Text style={[AuthStyle.appMsg, { marginTop: "30%" }]}>
								{
									"We’re excited to have you on board. Get ready to simplify your returns and track everything in one place. Let’s get started — your first return is just a tap away."
								}
							</Text>
							<View style={[AuthStyle.arrowBorder]}>
								{!firstLoad ? (
									<TouchableOpacity onPress={() => gotoEulaScreen()}>
										<View style={[AuthStyle.arrowIconContainer]}>
											<Icons
												iconSetName={"MaterialCommunityIcons"}
												iconName="arrow-right"
												iconSize={30}
												iconColor={Colors.iconWhite}
											/>
										</View>
									</TouchableOpacity>
								) : (
									<ActivityIndicator size="small" color={Colors.secondary} />
								)}
							</View>
						</View>
					</LinearGradient>
				</ImageBackground>
			</View>
		</>
	);
};

export default SplashScreen;

const styles = StyleSheet.create({
	container: {
		...CommonStyles.mainContainer,
		backgroundColor: Colors.white,
	},
	imageContainer: {
		flex: 2,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.primary,
	},
	rocketImage: {
		height: "100%",
		width: "100%",
		resizeMode: "cover",
	},
	detailContainer: {
		flex: 2,
		paddingHorizontal: 20,
	},
	detailBox: {
		marginTop: 10,
	},
	alignCenter: {
		justifyContent: "center",
		alignItems: "center",
	},
	updateTxt: {
		color: Colors.labelBlack,
		fontSize: 20,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
	timeUpdateTitle: {
		color: Colors.labelBlack,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
	desTxt: {
		color: Colors.labelDarkGray,
		fontSize: 14,
		marginBottom: 7,
	},
	btnContainer: {
		padding: 20,
		// ...CommonStyles.directionRowSB,
		// backgroundColor: Colors.white,
		// shadowColor: "#000",
		// shadowOffset: { width: 0, height: -3 },
		// shadowOpacity: 0.2,
		// shadowRadius: 3,
		// elevation: 5,
	},
	updateBtn: {
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.secondary,
		borderRadius: 24,
		padding: 10,
		width: "100%",
	},
	updateBtnTxt: {
		color: Colors.white,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
	skipBtn: {
		justifyContent: "center",
		alignItems: "center",
		padding: 10,
	},
	skipTxt: {
		color: Colors.secondary,
		fontSize: 12,
		fontFamily: FontFamily.PoppinsRegular,
	},
});
