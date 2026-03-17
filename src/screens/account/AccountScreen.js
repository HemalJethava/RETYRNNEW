import React, { useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	Platform,
	ImageBackground,
	TouchableOpacity,
	NativeModules,
	ActivityIndicator,
} from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";
import FastImage from "react-native-fast-image";
import { Button, DarkHeader, Icons, Loader, TextIcon } from "../../components";
import CommonStyles from "../../styles/CommonStyles";
import LayoutStyle from "../../styles/LayoutStyle";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";
import IMAGES from "../../assets/images/Images";
import { CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showMessage } from "react-native-flash-message";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import Api from "../../utils/Api";
import DeviceInfo from "react-native-device-info";
import { ReportCrashDetection } from "../../components/ReportCrashDetection";
import messaging, { getMessaging } from "@react-native-firebase/messaging";
import { truncateText } from "../../config/CommonFunctions";
import { checkLatestVersionURL } from "../../utils/Validation";
import { crashDetectionSuccess } from "../auth/redux/Action";
import { LogoutPopUp } from "./Components/LogoutPopUp";

const AccountScreen = (props) => {
	const dispatch = useDispatch();
	const userData = useSelector((state) => state.Auth.userData);
	const isEnableCrashDetection = useSelector(
		(state) => state.Auth.isEnableCrashDetection
	);

	const companyData = userData?.company || "";
	const refShowLogout = useRef(false);

	const [isLoading, setIsLoading] = useState(false);
	const [adminDetails, setAdminDetails] = useState(null);
	const [showLogoutPopup, setShowLogoutPopup] = useState(false);
	const [showCrashPopup, setShowCrashPopup] = useState(false);

	const [isSafetyLoading, setIsSafetyLoading] = useState(false);
	const [overallDrivingScore, setOverallDrivingScore] = useState(0);

	const [isLatestVersionURL, setIsLatestVersion] = useState(true);

	const appVersion = DeviceInfo.getVersion();
	const { CrashDetectionModule } = NativeModules;
	const messagingInstance = getMessaging();

	const scrollViewRef = useRef();

	useEffect(() => {
		getAdminDetails();
		getSafetyDetails();

		const isLatest = checkLatestVersionURL();
		setIsLatestVersion(isLatest);
	}, []);

	const getAdminDetails = async () => {
		try {
			const adminRes = await Api.get(`user/get-admin-details`).then((res) => {
				return res;
			});

			if (adminRes.success) {
				setAdminDetails(adminRes.data);
			}
		} catch (error) {
			console.warn(error);
		}
	};
	const getSafetyDetails = async () => {
		try {
			setIsSafetyLoading(true);
			const detailsRes = await Api.get(`user/get-trip-list`);
			setIsSafetyLoading(false);
			if (detailsRes.success) {
				setOverallDrivingScore(detailsRes.data?.over_all_score);
				manualScrollUp();
			}
		} catch (error) {
			setIsSafetyLoading(false);
			console.warn("Error: ", error);
		}
	};
	const manualScrollUp = () => {
		scrollViewRef.current?.scrollTo({
			y: 0,
			animated: true,
		});
	};
	const gotoSettingScreen = () => {
		props.navigation.navigate("Setting");
	};
	const gotoSafetyCheckup = () => {
		props.navigation.navigate("Checkup");
	};
	const gotoLegalScreen = () => {
		props.navigation.navigate("Legal");
	};
	const gotoHelpScreen = () => {
		if (adminDetails?.id) {
			props.navigation.navigate("Message", {
				item: adminDetails,
				chatID: adminDetails?.id,
			});
		}
	};
	const gotoCompanyDetails = () => {
		props.navigation.navigate("AccountCompanyDetail");
	};
	const gotoEditProfileScreen = () => {
		props.navigation.navigate("EditProfile");
	};
	const gotoChatScreen = () => {
		props.navigation.navigate("Chats");
	};

	return (
		<View style={{ flex: 1 }}>
			<Loader show={isLoading} />
			{showCrashPopup && (
				<ReportCrashDetection
					show={showCrashPopup}
					onHide={() => setShowCrashPopup(false)}
					force={30.0}
				/>
			)}
			{showLogoutPopup && (
				<LogoutPopUp
					show={showLogoutPopup}
					onHide={() => setShowLogoutPopup(false)}
					setIsLoading={setIsLoading}
					onSuccess={async (message) => {
						try {
							showMessage({
								message: message,
								type: "success",
								floating: true,
								statusBarHeight: 40,
								icon: "auto",
								duration: 3000,
								autoHide: true,
							});

							await AsyncStorage.clear();
							global.userToken = "";

							if (Platform.OS === "android" && isEnableCrashDetection) {
								await CrashDetectionModule.stopCrashDetectionService();
							}
							dispatch(crashDetectionSuccess({ isEnabled: false }));
							await messagingInstance.deleteToken();

							dispatch({ type: "RESET_APP" });

							setShowLogoutPopup(false);
							props.navigation.dispatch(
								CommonActions.reset({
									index: 0,
									routes: [{ name: "Login" }],
								})
							);
						} catch (error) {
							console.error("Logout Error:", error);
						}
					}}
					onFailed={(message) => {
						showMessage({
							message: message,
							type: "danger",
							floating: true,
							statusBarHeight: 40,
							icon: "auto",
							duration: 3000,
							autoHide: true,
						});
					}}
				/>
			)}
			<>
				<DarkHeader
					whiteLabel={"Account"}
					DarkHeaderMainStyle={[LayoutStyle.paddingTop30]}
					isMsgIcon={true}
					onPressMsgIcon={() => gotoChatScreen()}
				/>

				<View style={[AccountStyle.acHeaderConatiner]}>
					<View style={[AccountStyle.acProfileContainer]}>
						<TouchableOpacity
							style={[AccountStyle.profile]}
							onPress={() => gotoEditProfileScreen()}
						>
							<FastImage
								style={[AccountStyle.headeProfileIcon]}
								source={{
									uri: userData?.photo_path
										? userData?.photo_path
										: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
								}}
								resizeMode={FastImage.resizeMode.cover}
							/>
						</TouchableOpacity>
						<View style={[AccountStyle.acDesc]}>
							<Text style={[AccountStyle.userNameDark]}>
								{truncateText(userData?.name, 25)}
							</Text>
							<Text style={[AccountStyle.memberShipDate]}>
								{"Member Since: "}
								{moment(userData?.created_at).format("YYYY")}
							</Text>
						</View>
					</View>
				</View>

				<ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
					<View style={{ ...CommonStyles.mainPadding }}>
						<View style={[AccountStyle.buttonContainer]}>
							<TouchableOpacity onPress={() => gotoHelpScreen()}>
								<View style={[AccountStyle.btnViews]}>
									<Icons
										iconName={"support-agent"}
										iconSetName={"MaterialIcons"}
										iconColor={Colors.iconBlack}
										iconSize={24}
										iconMainstyle={{ marginVertical: "2%" }}
									/>
									<Text style={[AccountStyle.btnLabel]}>{"Help"}</Text>
									{adminDetails?.chat_receive_history_count > 0 && (
										<View style={AccountStyle.badgeCount}>
											<Text style={AccountStyle.countTxt}>
												{adminDetails?.chat_receive_history_count}
											</Text>
										</View>
									)}
								</View>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => gotoSettingScreen()}>
								<View style={[AccountStyle.btnViews]}>
									<Icons
										iconName={"cog-outline"}
										iconSetName={"MaterialCommunityIcons"}
										iconColor={Colors.iconBlack}
										iconSize={24}
										iconMainstyle={{ marginVertical: "2%" }}
									/>
									<Text style={[AccountStyle.btnLabel]}>{"Settings"}</Text>
								</View>
							</TouchableOpacity>
						</View>
						{/* {isLatestVersionURL && ( */}
						<TouchableOpacity
							onPress={() => gotoSafetyCheckup()}
							style={[AccountStyle.mainProgressBar]}
						>
							<View>
								<Text style={[AccountStyle.labelBlack]}>
									{"Safety Checkup"}
								</Text>
								<Text style={[AccountStyle.labelGray]}>
									{"Driving Scorecard"}
								</Text>
							</View>
							{isSafetyLoading ? (
								<ActivityIndicator
									color={Colors.secondary}
									size={Platform.OS === "ios" ? "small" : "large"}
								/>
							) : (
								<CircularProgress
									value={overallDrivingScore}
									radius={Platform.OS === "android" ? 22 : 24}
									duration={800}
									activeStrokeColor={"#4CA7DA"}
									activeStrokeSecondaryColor={"#4CA7DA"}
									progressValueColor={Colors.labelBlack}
									maxValue={100}
									inActiveStrokeColor={Colors.primary}
									strokeLinecap={"round"}
									inActiveStrokeOpacity={1}
									valueSuffix="%"
								/>
							)}
						</TouchableOpacity>
						{/* )} */}

						{isEnableCrashDetection && (
							<TouchableOpacity
								onPress={() => {
									setShowCrashPopup(true);
								}}
								style={[AccountStyle.mainProgressBar]}
							>
								<View>
									<Text style={[AccountStyle.labelBlack]}>
										{"Emergency Alert"}
									</Text>
									<Text style={[AccountStyle.labelGray]}>
										{
											"Send emergency alerts to your emergency contacts with your location."
										}
									</Text>
								</View>
							</TouchableOpacity>
						)}
						{companyData.length > 0 && (
							<TouchableOpacity onPress={() => gotoCompanyDetails()}>
								<ImageBackground
									style={[AccountStyle.cardImage, { height: 75 }]}
									source={IMAGES.companyBG}
									resizeMode="cover"
									borderRadius={12}
								>
									<View style={[AccountStyle.cardContainer]}>
										<Text style={[AccountStyle.cardCompnayName]}>
											{companyData[0]?.company_name}
										</Text>
									</View>
								</ImageBackground>
							</TouchableOpacity>
						)}
						<View style={[AccountStyle.borderBottom]}></View>
						<TouchableOpacity onPress={() => gotoHelpScreen()}>
							<TextIcon
								textIconMainStyle={[AccountStyle.optionContainer]}
								textName={"Report An Issue"}
								textColor={Colors.labelBlack}
								iconColor={Colors.iconBlack}
								iconName={"alert-outline"}
								iconSetName={"MaterialCommunityIcons"}
								iconSize={24}
								textStyle={[AccountStyle.optionsLabel]}
							/>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => gotoChatScreen()}>
							<TextIcon
								textIconMainStyle={[AccountStyle.optionContainer]}
								textName={"Messages"}
								textColor={Colors.labelBlack}
								iconColor={Colors.iconBlack}
								iconName={"email-outline"}
								iconSetName={"MaterialCommunityIcons"}
								iconSize={24}
								textStyle={[AccountStyle.optionsLabel]}
							/>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => gotoLegalScreen()}>
							<TextIcon
								textIconMainStyle={[AccountStyle.optionContainer]}
								textName={"Legal"}
								textColor={Colors.labelBlack}
								iconColor={Colors.iconBlack}
								iconName={"information-outline"}
								iconSetName={"MaterialCommunityIcons"}
								iconSize={24}
								textStyle={[AccountStyle.optionsLabel]}
							/>
						</TouchableOpacity>
						<View style={[AccountStyle.borderBottom]}></View>
						<View style={[AccountStyle.accountInfo]}>
							<Text style={[AccountStyle.version]}>
								{`Version: ${appVersion}`}
							</Text>
							{/* <Text style={[AccountStyle.resetApp]}>{"Reset App"}</Text> */}
							<TouchableOpacity
								onPress={() => {
									setShowLogoutPopup(true);
								}}
							>
								<Text style={[AccountStyle.resetApp]}>{"Logout"}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</>
		</View>
	);
};

export default AccountScreen;
