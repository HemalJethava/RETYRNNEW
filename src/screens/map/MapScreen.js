import React from "react";
import { View, Platform, Text } from "react-native";
import { DarkHeader } from "../../components";
import Colors from "../../styles/Colors";
import LayoutStyle from "../../styles/LayoutStyle";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import AgainMapScreen from "./AgainMapScreen";

import AddDestinationScreen from "./AddDestinationScreen";

import SavedMapScreen from "./SavedMapScreen";
import MapStyle from "../../styles/MapStyle";
import FontFamily from "../../assets/fonts/FontFamily";

const Tab = createMaterialTopTabNavigator();

const MapScreen = (props) => {
	const gotoHomeScreen = () => {
		props.navigation.navigate("Home");
	};

	const jsCode = `
	let selector = document.querySelector("header");
	selector.style.display = "none"
	true;
`;

	return (
		<>
			<DarkHeader
				iconName={"angle-left"}
				iconSetName={"FontAwesome6"}
				iconColor={Colors.backArrowWhite}
				iconSize={24}
				whiteLabel={"Maps"}
				DarkHeaderMainStyle={[LayoutStyle.paddingTop30]}
				onPress={() => gotoHomeScreen()}
			/>
			<View style={{ backgroundColor: Colors.primary, flex: 1 }}>
				<Tab.Navigator
					screenOptions={{
						tabBarGap: 5,
						tabBarAndroidRipple: { borderless: false },
						tabBarStyle: {
							backgroundColor: Colors.primary,
							height: Platform.OS === "android" ? 50 : 55,
							width: 220,
							alignSelf: "flex-end",
						},
						tabBarLabelStyle: {
							fontFamily: FontFamily.PoppinsRegular,
							...LayoutStyle.fontSize8,
							color: Colors.white,
							textTransform: "none",
							textAlign: "left",
						},
					}}
				>
					<Tab.Screen
						options={{
							tabBarLabel: ({ focused }) => (
								<Text
									style={[
										MapStyle.tabLabelStyle,
										{
											color: focused ? Colors.labelWhite : Colors.labelGray,
										},
									]}
								>
									{"New"}
								</Text>
							),
						}}
						name="AddDestination"
						component={AddDestinationScreen}
					/>
					<Tab.Screen
						options={{
							tabBarLabel: ({ focused }) => (
								<Text
									style={[
										MapStyle.tabLabelStyle,
										{
											color: focused ? Colors.labelWhite : Colors.labelGray,
										},
									]}
								>
									{"Again"}
								</Text>
							),
						}}
						name="AgainMap"
						component={AgainMapScreen}
					/>
					<Tab.Screen
						options={{
							tabBarLabel: ({ focused }) => (
								<Text
									style={[
										MapStyle.tabLabelStyle,
										{
											color: focused ? Colors.labelWhite : Colors.labelGray,
										},
									]}
								>
									{"Saved"}
								</Text>
							),
						}}
						name="SavedMap"
						component={SavedMapScreen}
					/>
				</Tab.Navigator>

				{/* <WebView
					source={{ uri: "https://truckmap.com/map" }}
					style={{ flex: 1 }}
					onMessage={(event) => {}}
					startInLoadingState={true}
					// injectedJavaScript={jsCode}
					injectedJavaScript={`
						removeHeader = (event) => { 
							const header = document.getElementById('header');
							if (header) {
								header.style.display='none';
							} else {
											setTimeout(func, 5)
										}
									};
									removeHeader();
								`}
				/> */}
			</View>
		</>
	);
};

export default MapScreen;
