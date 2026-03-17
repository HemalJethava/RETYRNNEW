import React, { useCallback, useEffect, useState, useRef } from "react";
import {
	View,
	Text,
	Platform,
	TouchableOpacity,
	Linking,
	AppState,
} from "react-native";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";
import { LightHeader } from "../../components";
import ChatStyle from "../../styles/ChatStyle";

const LocationPermissionScreen = (props) => {
	const appState = useRef(AppState.currentState);
	const [permissionType, setPermissionType] = useState(1);
	const [appStateVisible, setAppStateVisible] = useState(appState.current);

	useEffect(() => {
		const subscription = AppState.addEventListener("change", (nextAppState) => {
			if (
				appState.current.match(/inactive|background/) &&
				nextAppState === "active"
			) {
				checkLocationPermission();
			}
			appState.current = nextAppState;
			setAppStateVisible(appState.current);
		});

		return () => {
			subscription.remove();
		};
	}, []);

	useEffect(() => {
		checkLocationPermission();
	}, []);

	const checkLocationPermission = async () => {
		try {
			let permission;
			if (Platform.OS === "ios") {
				permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
			} else {
				permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
			}

			const permissionResult = await check(permission);

			if (
				permissionResult === RESULTS.BLOCKED ||
				permissionResult === RESULTS.DENIED
			) {
				setPermissionType(1);
			} else if (permissionResult === RESULTS.GRANTED) {
				const alwaysPermission =
					Platform.OS === "ios" ? PERMISSIONS.IOS.LOCATION_ALWAYS : null;
				const alwaysResult = alwaysPermission
					? await check(alwaysPermission)
					: null;

				if (alwaysResult === RESULTS.GRANTED) {
					setPermissionType(4);
				} else {
					setPermissionType(3);
				}
			} else if (permissionResult === RESULTS.LIMITED) {
				setPermissionType(2);
			}
		} catch (error) {
			console.warn("Error checking permission:", error);
		}
	};
	const requestLocationPermission = async (type) => {
		let whenInUsePermission, alwaysPermission;

		if (Platform.OS === "ios") {
			whenInUsePermission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
			alwaysPermission = PERMISSIONS.IOS.LOCATION_ALWAYS;
		} else {
			whenInUsePermission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
			alwaysPermission = null;
		}

		try {
			if (type === 1) {
				Linking.openSettings();
			} else if (type === 2 && Platform.OS === "ios") {
				await request(whenInUsePermission);
				Linking.openSettings();
			} else if (type === 3) {
				Linking.openSettings();
			} else if (type === 4 && Platform.OS === "ios") {
				Linking.openSettings();
			}
		} catch (error) {
			console.warn("Error requesting permission:", error);
		}
	};
	const getPermissionLabel = () => {
		switch (permissionType) {
			case 1:
				return "Never";
			case 2:
				return "Ask next time or when I share";
			case 3:
				return "While using app";
			case 4:
				return "Always";
			default:
				return "Unknown";
		}
	};
	const gotoBack = () => {
		props.navigation.goBack();
	};
	const PermissionRow = ({
		title,
		isTrue,
		isLastRow,
		isNextRowTrue,
		onPress,
		disabled,
	}) => {
		return (
			<TouchableOpacity
				onPress={onPress}
				disabled={disabled}
				style={[
					AccountStyle.permissionRow,
					{
						paddingHorizontal: isTrue ? 20 : 0,
						marginHorizontal: isTrue ? 0 : 20,
						backgroundColor: isTrue ? "rgba(76,167,218,0.2)" : "transparent",
						borderBottomWidth: isLastRow || isNextRowTrue ? 0 : 1,
						borderBottomColor: isTrue ? "#4CA7DA" : "#B1B1B1",
						borderTopWidth: isTrue ? 1 : 0,
						borderTopColor: isTrue ? "#4CA7DA" : "#B1B1B1",
						opacity: disabled ? 0.5 : 1,
					},
				]}
			>
				<Text style={{ fontSize: 14, color: "#252525", fontWeight: "600" }}>
					{title}
				</Text>

				<View>
					{isTrue ? (
						<View style={[ChatStyle.selectedPin]} />
					) : (
						<View style={[ChatStyle.selectPin]} />
					)}
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<View style={[AccountStyle.mainContainer, AccountStyle.backgroundWhite]}>
			<LightHeader
				isLogo={false}
				isBackIcon={true}
				iconName={"angle-left"}
				iconSize={24}
				iconSetName={"FontAwesome6"}
				iconColor={Colors.backArrowBlack}
				headerText={"Location"}
				headerBG={Colors.lightGrayBG}
				statusBG={Colors.lightGrayBG}
				onPress={() => gotoBack()}
			/>
			<View
				style={[AccountStyle.securityMainContainer, { paddingHorizontal: 0 }]}
			>
				<Text style={{ fontSize: 14, color: "#252525", paddingHorizontal: 20 }}>
					{"Let Retyrn access device location: "}
				</Text>

				<View style={{ marginTop: 25, marginBottom: 12 }}>
					{Platform.OS === "ios" ? (
						<>
							<PermissionRow
								title={"Never"}
								isTrue={getPermissionLabel() === "Never" ? true : false}
								onPress={() => requestLocationPermission(1)}
								isNextRowTrue={
									getPermissionLabel() === "Ask next time or when I share"
										? true
										: false
								}
								disabled={true}
							/>
							<PermissionRow
								title={"Ask next time or when I share"}
								isTrue={
									getPermissionLabel() === "Ask next time or when I share"
										? true
										: false
								}
								onPress={() => requestLocationPermission(2)}
								isNextRowTrue={
									getPermissionLabel() === "While using app" ? true : false
								}
							/>
							<PermissionRow
								title={"While using app"}
								isTrue={
									getPermissionLabel() === "While using app" ? true : false
								}
								onPress={() => requestLocationPermission(3)}
								isNextRowTrue={getPermissionLabel() === "Always" ? true : false}
							/>
							<PermissionRow
								title={"Always"}
								isTrue={getPermissionLabel() === "Always" ? true : false}
								onPress={() => requestLocationPermission(4)}
								isLastRow={true}
							/>
						</>
					) : (
						<>
							<PermissionRow
								title={"Never"}
								isTrue={getPermissionLabel() === "Never" ? true : false}
								onPress={() => requestLocationPermission(1)}
								isNextRowTrue={
									getPermissionLabel() === "While using app" ? true : false
								}
								disabled={false}
							/>
							<PermissionRow
								title={"While using app"}
								isTrue={
									getPermissionLabel() === "While using app" ? true : false
								}
								onPress={() => requestLocationPermission(3)}
								isNextRowTrue={false}
							/>
						</>
					)}
				</View>
			</View>
		</View>
	);
};

export default LocationPermissionScreen;
