import "react-native-gesture-handler";
import { Image, Platform, View, Text, BackHandler } from "react-native";
import React, { useEffect } from "react";
import {
	getFocusedRouteNameFromRoute,
	NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icons } from "../components";
import IMAGES from "../assets/images/Images";
import ComponentStyles from "../styles/ComponentStyles";
import { useNavigation } from "@react-navigation/native";

//Auth Screens list
import SplashScreen from "../screens/auth/SplashScreen";
import EulaScreen from "../screens/auth/EulaScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import LoginDetailScreen from "../screens/auth/LoginDetailScreen";
import BusinessInfoScreen from "../screens/auth/BusinessInfoScreen";
import VerifyAccountScreen from "../screens/auth/VerifyAccountScreen";
import PasswordScreen from "../screens/auth/PasswordScreen";
import TandCScreen from "../screens/auth/TandCScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import ContactAdminScreen from "../screens/auth/ContactAdminScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";

// Tab screens list
import HomeScreen from "../screens/home/HomeScreen";
import PassesScreen from "../screens/passes/PassesScreen";
import IncidentScreen from "../screens/incidents/IncidentScreen";
import AccountScreen from "../screens/account/AccountScreen";
import MapScreen from "../screens/map/MapScreen";

// Passes module screens
import AddPassesScreen from "../screens/passes/AddPassesScreen";
import PassDetailScreen from "../screens/passes/PassDetailScreen";
import PassMoreScreen from "../screens/passes/PassMoreScreen";
import CompanyDetailScreen from "../screens/passes/CompanyDetailScreen";
import CompanyMoreScreen from "../screens/passes/CompanyMoreScreen";

// Account module screen
import SettingScreen from "../screens/account/SettingScreen";
import CheckupScreen from "../screens/account/CheckupScreen";
import EditProfileScreen from "../screens/account/EditProfileScreen";
import Verify2FAScreen from "../screens/account/Verify2FAScreen";
import NewDestinationScreen from "../screens/account/NewDestinationScreen";
import EditDestinationScreen from "../screens/account/EditDestinationScreen";
import LegalScreen from "../screens/account/LegalScreen";
import LegalDescriptionScreen from "../screens/account/LegalDescriptionScreen";
import SecurityScreen from "../screens/account/SecurityScreen";
import LegalPolicyScreen from "../screens/account/LegalPolicyScreen";
import NotifPermissionScreen from "../screens/account/NotifPermissionScreen";
import DataShareScreen from "../screens/account/DataShareScreen";
import CrashDetectionScreen from "../screens/account/CrashDetectionScreen";
import InviteScreen from "../screens/account/InviteScreen";
import ContactListScreen from "../screens/account/ContactListScreen";
import AddContactScreen from "../screens/account/AddContactScreen";
import SharedDetailsScreen from "../screens/account/SharedDetailsScreen";
import SelectContactScreen from "../screens/account/SelectContactScreen";
import SelectDestinationScreen from "../screens/account/SelectDestinationScreen";
import SelectPassScreen from "../screens/account/SelectPassScreen";
import EmergencyContactScreen from "../screens/account/EmergencyContactScreen";
import LocationPermissionScreen from "../screens/account/LocationPermissionScreen";
import CheckupDetailsScreen from "../screens/account/CheckupDetailsScreen";
import ProfileDetailScreen from "../screens/account/ProfileDetailScreen";

// Incident module screens
import AllIncidentScreen from "../screens/incidents/AllIncidentScreen";
import AllClaimTalkIncidentScreen from "../screens/incidents/AllClaimTalkIncidentScreen";
import IncidentInfoScreen from "../screens/incidents/IncidentInfoScreen";
import IncidentListScreen from "../screens/incidents/IncidentListScreen";
import IncidentDetailsScreen from "../screens/incidents/IncidentDetailsScreen";
import ClaimTalkIncidentDetails from "../screens/incidents/ClaimTalkIncidentDetails";
import ReimbursementScreen from "../screens/incidents/ReimbursementScreen";
import SubmittedScreen from "../screens/incidents/SubmittedScreen";
import DraftSubmittedScreen from "../screens/incidents/DraftSubmittedScreen";
import ClaimTalkIncidentMapScreen from "../screens/incidents/ClaimTalkIncidentMapScreen";

import ManualQuestionScreen from "../screens/incidents/manualEntry/ManualQuestionScreen";
import ManualIncidentReviewScreen from "../screens/incidents/ManualIncidentReviewScreen";

// Incident claim talk screens
import ClaimTalkInfoScreen from "../screens/incidents/claimTalk/ClaimTalkInfoScreen";
import FirstVideoScreen from "../screens/incidents/claimTalk/FirstVideoScreen";
import SecondVideoScreen from "../screens/incidents/claimTalk/SecondVideoScreen";
import ThirdVideoScreen from "../screens/incidents/claimTalk/ThirdVideoScreen";
import UploadFileScreen from "../screens/incidents/claimTalk/UploadFileScreen";
import MarkerLocationScreen from "../screens/incidents/claimTalk/MarkerLocationScreen";

// Map Screens
import TripDetailsScreen from "../screens/map/TripDetailsScreen";
import SaveDestiScreen from "../screens/map/SaveDestiScreen";
import ChatScreen from "../screens/chat/ChatScreen";
import MessageScreen from "../screens/chat/MessageScreen";
import PassListScreen from "../screens/chat/PassListScreen";

import MainMapScreen from "../screens/map/MainMapScreen";

import Colors from "../styles/Colors";
import { deviceHeight, deviceWidth } from "../utils/DeviceInfo";
import NotificationHandler from "../utils/NotificationHadler";
import { navigationRef, setNavigator } from "./NavigationService";
import { SafeAreaView } from "react-native-safe-area-context";
import SharedFileListener from "../utils/sharedFileMessage";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const hideTabBarComponents = ["FirstVideo"];

function HomeTabs({ route }) {
	const isTablet = deviceWidth >= 768;
	const hiddenRoutes = [
		"DirectionMap",
		"DirectionMapIos",
		"TripDetails",
		"SaveDesti",
		"AddContact",
		"IncidentDetails",
		"ClaimTalkIncidentDetails",
		"IncidentInfo",
		"IncidentList",
		"ManualQuestion",
		"ManualIncidentReview",
		"Submitted",
		"MainMap",
		"ProfileDetail",
	];

	return (
		<Tab.Navigator
			initialRouteName={"Home"}
			screenOptions={({ route }) => {
				return {
					tabBarShowLabel: false,
					headerShown: false,
					gestureEnabled: true,
					animationEnabled: true,
					swipeEnabled: false,
					tabBarHideOnKeyboard: true,
					unmountOnBlur: true,
					tabBarStyle: (() => {
						const routeName = getFocusedRouteNameFromRoute(route) ?? "";
						if (hiddenRoutes.includes(routeName)) {
							return { display: "none" };
						}
						return {
							height: Platform.OS === "android" ? deviceHeight / 12 : 100,
							backgroundColor: Colors.primary,
							paddingTop: 14,
						};
					})(),
					tabBarIcon: ({ focused }) => {
						let iconName;
						if (route.name === "Map") {
							iconName = "map-outline";
						} else if (route.name === "Passes") {
							iconName = "view-grid";
						} else if (route.name === "Incident") {
							iconName = "alert-outline";
						} else if (route.name === "Account") {
							iconName = "account-circle-outline";
						}

						return (
							<View
								style={{
									flex: 1,
									alignItems: "center",
									justifyContent: "center",
									width: 120,
								}}
							>
								{route.name !== "Home" ? (
									<View
										style={{
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<Icons
											iconName={iconName}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={focused ? Colors.iconWhite : Colors.tab}
											iconSize={isTablet ? 28 : 22}
										/>
										<Text
											style={[
												ComponentStyles.tabLabel,
												{
													color: focused ? Colors.labelWhite : Colors.tab,
													fontSize: isTablet ? 14 : 12,
													textAlign: "center",
												},
											]}
										>
											{route.name}
										</Text>
									</View>
								) : (
									<View
										style={[
											ComponentStyles.homeTab,
											{
												borderColor: focused ? Colors.secondary : Colors.tab,
												alignItems: "center",
												justifyContent: "center",
												height: isTablet ? 56 : 44,
												width: isTablet ? 56 : 44,
											},
										]}
									>
										<Image
											tintColor={focused ? Colors.iconWhite : Colors.tab}
											source={IMAGES.appWhiteLogo}
											style={[
												ComponentStyles.tabIcons,
												{
													resizeMode: "contain",
													height: isTablet ? 36 : 24,
													width: isTablet ? 36 : 24,
												},
											]}
										/>
									</View>
								)}
							</View>
						);
					},
				};
			}}
		>
			<Tab.Screen name="Map" component={MapStackScreen} />
			<Tab.Screen name="Passes" component={PassStackScreen} />
			<Tab.Screen name="Home" component={HomeStackScreen} />
			<Tab.Screen name="Incident" component={IncidentStackScreen} />
			<Tab.Screen name="Account" component={AccountStackScreen} />
		</Tab.Navigator>
	);
}

const MapStack = createNativeStackNavigator();

function MapStackScreen() {
	return (
		<MapStack.Navigator
			initialRouteName="Map"
			screenOptions={({ route, navigation }) => ({
				headerShown: false,
				gestureEnabled: true,
				animationEnabled: true,
			})}
		>
			<MapStack.Screen name="Map" component={MapScreen} />
			<MapStack.Screen name="MainMap" component={MainMapScreen} />
			<MapStack.Screen name="TripDetails" component={TripDetailsScreen} />
			<MapStack.Screen name="SaveDesti" component={SaveDestiScreen} />
			<MapStack.Screen name="AddContact" component={AddContactScreen} />
			<MapStack.Screen
				name="LegalDescription"
				component={LegalDescriptionScreen}
			/>
		</MapStack.Navigator>
	);
}

const PassStack = createNativeStackNavigator();

function PassStackScreen() {
	return (
		<PassStack.Navigator
			initialRouteName="PassesScreen"
			screenOptions={({ route, navigation }) => ({
				headerShown: false,
				gestureEnabled: true,
				animationEnabled: true,
			})}
		>
			<PassStack.Screen name="PassesScreen" component={PassesScreen} />
			<PassStack.Screen name="PassDetail" component={PassDetailScreen} />
			<PassStack.Screen name="PassMore" component={PassMoreScreen} />
			<PassStack.Screen name="AddPasses" component={AddPassesScreen} />
			<PassStack.Screen name="CompanyDetail" component={CompanyDetailScreen} />
			<PassStack.Screen name="CompanyMore" component={CompanyMoreScreen} />
		</PassStack.Navigator>
	);
}

const IncidentStack = createNativeStackNavigator();

function IncidentStackScreen() {
	return (
		<IncidentStack.Navigator
			initialRouteName="IncidentScreen"
			screenOptions={({ route, navigation }) => ({
				headerShown: false,
				gestureEnabled: true,
				animationEnabled: true,
			})}
		>
			<IncidentStack.Screen name="IncidentScreen" component={IncidentScreen} />
			<IncidentStack.Screen name="AllIncident" component={AllIncidentScreen} />
			<IncidentStack.Screen
				name="AllClaimTalkIncident"
				component={AllClaimTalkIncidentScreen}
			/>
			<IncidentStack.Screen
				name="IncidentInfo"
				component={IncidentInfoScreen}
			/>
			<IncidentStack.Screen
				name="IncidentList"
				component={IncidentListScreen}
			/>
			<IncidentStack.Screen
				name="ManualQuestion"
				component={ManualQuestionScreen}
			/>
			<IncidentStack.Screen
				name="ManualIncidentReview"
				component={ManualIncidentReviewScreen}
			/>
			<IncidentStack.Screen
				name="ClaimTalkInfo"
				component={ClaimTalkInfoScreen}
			/>
			<IncidentStack.Screen
				name="IncidentDetails"
				component={IncidentDetailsScreen}
			/>
			<IncidentStack.Screen
				name="ClaimTalkIncidentDetails"
				component={ClaimTalkIncidentDetails}
			/>
			<IncidentStack.Screen
				name="Reimbursement"
				component={ReimbursementScreen}
			/>
			<IncidentStack.Screen name="Submitted" component={SubmittedScreen} />
			<IncidentStack.Screen
				name="DraftSubmitted"
				component={DraftSubmittedScreen}
			/>
			<IncidentStack.Screen
				name="ClaimTalkIncidentMap"
				component={ClaimTalkIncidentMapScreen}
			/>
		</IncidentStack.Navigator>
	);
}

const HomeStack = createNativeStackNavigator();

function HomeStackScreen() {
	return (
		<HomeStack.Navigator
			screenOptions={({ route, navigation }) => ({
				headerShown: false,
				gestureEnabled: true,
				animationEnabled: true,
			})}
		>
			<HomeStack.Screen name="HomeScreen" component={HomeScreen} />
		</HomeStack.Navigator>
	);
}

const AccountStack = createNativeStackNavigator();

function AccountStackScreen() {
	return (
		<AccountStack.Navigator
			screenOptions={({ route, navigation }) => ({
				headerShown: false,
				gestureEnabled: true,
				animationEnabled: true,
			})}
			initialRouteName="AccountScreen"
		>
			<AccountStack.Screen name="AccountScreen" component={AccountScreen} />
			<AccountStack.Screen name="Setting" component={SettingScreen} />
			<AccountStack.Screen name="Checkup" component={CheckupScreen} />
			<AccountStack.Screen
				name="CheckupDetails"
				component={CheckupDetailsScreen}
			/>
			<AccountStack.Screen
				name="ProfileDetail"
				component={ProfileDetailScreen}
			/>
			<AccountStack.Screen name="EditProfile" component={EditProfileScreen} />
			<AccountStack.Screen name="Verify2FA" component={Verify2FAScreen} />
			<AccountStack.Screen
				name="NewDestination"
				component={NewDestinationScreen}
			/>
			<AccountStack.Screen
				name="EditDestination"
				component={EditDestinationScreen}
			/>
			<AccountStack.Screen name="Legal" component={LegalScreen} />
			<AccountStack.Screen
				name="LegalDescription"
				component={LegalDescriptionScreen}
			/>
			<AccountStack.Screen name="Security" component={SecurityScreen} />
			<AccountStack.Screen name="LegalPolicy" component={LegalPolicyScreen} />
			<AccountStack.Screen
				name="NotifPermission"
				component={NotifPermissionScreen}
			/>
			<AccountStack.Screen name="DataShare" component={DataShareScreen} />
			<AccountStack.Screen
				name="CrashDetection"
				component={CrashDetectionScreen}
			/>
			<AccountStack.Screen name="Invite" component={InviteScreen} />
			<AccountStack.Screen name="ContactList" component={ContactListScreen} />
			<AccountStack.Screen name="AddContact" component={AddContactScreen} />
			<AccountStack.Screen
				name="AccountCompanyDetail"
				component={CompanyDetailScreen}
			/>
			<AccountStack.Screen
				name="SharedDetails"
				component={SharedDetailsScreen}
			/>
			<AccountStack.Screen name="CompanyMore" component={CompanyMoreScreen} />
			<AccountStack.Screen
				name="SelectContact"
				component={SelectContactScreen}
			/>
			<AccountStack.Screen name="SelectPass" component={SelectPassScreen} />
			<AccountStack.Screen
				name="SelectDestination"
				component={SelectDestinationScreen}
			/>

			<AccountStack.Screen name="MainMap" component={MainMapScreen} />

			<AccountStack.Screen
				name="EmergencyContactScreen"
				component={EmergencyContactScreen}
			/>

			<AccountStack.Screen
				name="LocationPermission"
				component={LocationPermissionScreen}
			/>
		</AccountStack.Navigator>
	);
}

function AppNavigation(props) {
	useEffect(() => {
		const onBackPress = () => {
			if (navigationRef.isReady()) {
				const state = navigationRef.getRootState();
				if (!state) return false;

				const currentRoute = state.routes[state.index]?.name;

				if (currentRoute === "Tab") {
					const tabState = state.routes[state.index]?.state;

					if (tabState) {
						const activeTab = tabState.routes[tabState.index]?.name;
						const activeTabState = tabState.routes[tabState.index]?.state;

						if (activeTab === "Home") {
							BackHandler.exitApp();
						} else {
							if (activeTabState) {
								if (activeTabState.routes.length > 1) {
									navigationRef.goBack();
									return true;
								} else {
									navigationRef.navigate("Home");
								}
							} else {
								if (activeTab === "Home") {
									BackHandler.exitApp();
								} else {
									navigationRef.navigate("Home");
								}
							}
						}
					}
				} else {
					navigationRef.goBack();
				}
			}

			return true;
		};

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			onBackPress
		);

		return () => {
			backHandler.remove();
		};
	}, []);

	return (
		<SafeAreaView
			edges={Platform.OS === "android" ? ["bottom"] : []}
			style={{ flex: 1, backgroundColor: Colors.primary }}
		>
			<NavigationContainer ref={navigationRef}>
				<NotificationHandler />
				<SharedFileListener />
				<Stack.Navigator
					initialRouteName="Splash"
					screenOptions={({ route, navigation }) => ({
						headerShown: false,
						gestureEnabled: true,
						animationEnabled: true,
					})}
				>
					<Stack.Screen name="Splash" component={SplashScreen} />
					<Stack.Screen name="Eula" component={EulaScreen} />
					<Stack.Screen name="Login" component={LoginScreen} />
					<Stack.Screen
						name="ForgotPassword"
						component={ForgotPasswordScreen}
					/>
					<Stack.Screen name="ContactAdmin" component={ContactAdminScreen} />
					<Stack.Screen name="LoginDetail" component={LoginDetailScreen} />
					<Stack.Screen name="BusinessInfo" component={BusinessInfoScreen} />
					<Stack.Screen name="Tab" component={HomeTabs} />
					<Stack.Screen name="VerifyAccount" component={VerifyAccountScreen} />
					<Stack.Screen name="Password" component={PasswordScreen} />
					<Stack.Screen name="TandC" component={TandCScreen} />
					<Stack.Screen name="Signup" component={SignupScreen} />
					<Stack.Screen name="FirstVideo" component={FirstVideoScreen} />
					<Stack.Screen name="SecondVideo" component={SecondVideoScreen} />
					<Stack.Screen name="ThirdVideo" component={ThirdVideoScreen} />
					<Stack.Screen name="UploadFile" component={UploadFileScreen} />
					<Stack.Screen name="Chats" component={ChatScreen} />
					<Stack.Screen name="Message" component={MessageScreen} />
					<Stack.Screen name="MainMap" component={MainMapScreen} />
					<Stack.Screen name="PassList" component={PassListScreen} />
					<Stack.Screen
						name="MarkerLocation"
						component={MarkerLocationScreen}
					/>
					<Stack.Screen name="AddContact" component={AddContactScreen} />
					<Stack.Screen name="ContactList" component={ContactListScreen} />
					<Stack.Screen name="Invite" component={InviteScreen} />
					<Stack.Screen name="Submitted" component={SubmittedScreen} />
					<Stack.Screen
						name="DraftSubmitted"
						component={DraftSubmittedScreen}
					/>
				</Stack.Navigator>
			</NavigationContainer>
		</SafeAreaView>
	);
}

export default AppNavigation;
