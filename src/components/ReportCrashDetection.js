import React, { useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	NativeModules,
	Platform,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Api from "../utils/Api";
import { getCurrentLocation, locationPermission } from "../utils/Location";
import { useSelector } from "react-redux";
import { Overlay } from "../components";
import MapStyle from "../styles/MapStyle";
import Colors from "../styles/Colors";
import { GOOGLE_MAPS_APIKEY } from "../config/BaseUrl";
import LayoutStyle from "../styles/LayoutStyle";
import FontFamily from "../assets/fonts/FontFamily";
import CommonStyles from "../styles/CommonStyles";
import CrashDetetionLoader from "../components/LoaderComponents/CrashDetetionLoader";
import * as Progress from "react-native-progress";
import axios from "axios";
import { getFormattedAddress } from "../config/CommonFunctions";

const { CrashDetectionModule } = NativeModules;

export const ReportCrashDetection = ({ show, onHide, force }) => {
	const userData = useSelector((state) => state.Auth.userData);
	const mapRef = useRef(null);

	const [isLoading, setIsLoading] = useState(false);
	const [location, setLocation] = useState(null);
	const [address, setAddress] = useState("");
	const [timer, setTimer] = useState(30);
	const [isAlertSent, setIsAlertSent] = useState(false);

	const getLocation = async () => {
		const locPermissionDenied = await locationPermission();
		if (!locPermissionDenied) return;

		const { latitude, longitude } = await getCurrentLocation();
		const userLocation = latitude && longitude ? { latitude, longitude } : null;
		setLocation(userLocation);
	};

	useEffect(() => {
		getLocation();
	}, []);

	useEffect(() => {
		if (location) {
			getPlaceName();
		}
	}, [location]);

	useEffect(() => {
		let interval;

		if (location && !isAlertSent && timer > 0) {
			interval = setInterval(() => {
				setTimer((prevTimer) => {
					if (prevTimer <= 1) {
						clearInterval(interval);
						sendCrashDetection();
						return 0;
					}
					return prevTimer - 1;
				});
			}, 1000);
		}

		return () => clearInterval(interval);
	}, [timer, location, isAlertSent]);

	const progress = timer / 30;

	const handleDragEnd = (event) => {
		const { coordinate } = event.nativeEvent;
		setLocation({
			latitude: coordinate.latitude,
			longitude: coordinate.longitude,
		});
	};
	const getPlaceName = async () => {
		try {
			const response = await axios.get(
				"https://maps.googleapis.com/maps/api/geocode/json",
				{
					params: {
						latlng: `${location?.latitude},${location?.longitude}`,
						key: GOOGLE_MAPS_APIKEY,
					},
				}
			);

			if (response.data.results && response.data.results.length > 0) {
				const firstResult = response.data.results[0];

				const addressComponents = firstResult.address_components;
				const formattedAddress = firstResult.formatted_address;

				const addr = await getFormattedAddress(
					addressComponents,
					formattedAddress
				);

				const localAddrrs = `${addr?.localAddress}, ${addr?.city}, ${addr?.state}, ${addr?.country} - ${addr?.zipCode}`;
				setAddress(localAddrrs);
			} else {
				setAddress("No address found");
			}
		} catch (error) {
			console.error("Error fetching address:", error);
			setAddress("");
		}
	};
	const onRequestClose = () => {
		clearCrashNotification();
		onHide();
	};
	const sendCrashDetection = async () => {
		if (isAlertSent && !show) return;

		setIsAlertSent(true);
		setTimer(0);

		try {
			const locPermissionDenied = await locationPermission();
			if (locPermissionDenied) {
				const data = {
					latitude: location?.latitude,
					longitude: location?.longitude,
					locationName: address,
				};

				setIsLoading(true);
				const reportRes = await Api.post(`user/send-emergency-data`, data);
				setIsLoading(false);

				if (reportRes.success) {
					clearCrashNotification();
					setTimer(10);
					setIsAlertSent(false);
					onHide();
					showMessage({
						message: reportRes.message,
						type: "success",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				} else {
					clearCrashNotification();
					setTimer(10);
					setIsAlertSent(false);
					showMessage({
						message: reportRes?.data?.message,
						type: "danger",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				}
			}
		} catch (error) {
			setIsLoading(false);
			setIsAlertSent(false);
			console.warn(error);
		}
	};
	const onPressSubmit = () => {
		if (!isAlertSent) {
			sendCrashDetection();
		}
	};
	const clearCrashNotification = () => {
		if (CrashDetectionModule && Platform.OS === "android") {
			CrashDetectionModule.clearCrashNotification();
		}
	};

	return (
		<Overlay visible={show}>
			<View style={{}}>
				<View style={[MapStyle.actionModal, {}]}>
					<View style={[MapStyle.centerModal, { marginBottom: 10 }]}>
						<Text style={[MapStyle.modalHeader]}>{"Crash Detection"}</Text>
					</View>
					{!location || isLoading ? (
						<CrashDetetionLoader />
					) : (
						<>
							<View style={{ height: 180, width: "100%", borderRadius: 10 }}>
								<MapView
									ref={mapRef}
									provider={PROVIDER_GOOGLE}
									style={styles.map}
									initialRegion={{
										latitude: location?.latitude,
										longitude: location?.longitude,
										latitudeDelta: 0.005,
										longitudeDelta: 0.005,
									}}
									userInterfaceStyle={"light"}
									onMapReady={() => {
										if (location && mapRef.current) {
											mapRef.current.animateToRegion({
												...location,
												latitudeDelta: 0.005,
												longitudeDelta: 0.005,
											});
										}
									}}
								>
									<Marker
										coordinate={{
											latitude: location?.latitude,
											longitude: location?.longitude,
										}}
										title="You are here"
										draggable={true}
										onDragEnd={handleDragEnd}
									/>
								</MapView>
							</View>
							<View style={[styles.inputLocation]}>
								<Text style={[styles.locationValue]}>{address}</Text>
							</View>
							<View style={styles.timerRow}>
								<Progress.Circle
									progress={progress}
									size={40}
									thickness={5}
									color={Colors.secondary}
									unfilledColor="#E0E0E0"
									borderWidth={0}
									showsText={true}
									formatText={() => `${timer}`}
									textStyle={{
										fontSize: 14,
										fontWeight: "700",
									}}
								/>
								<Text style={styles.alertTxt}>
									{"Crash detected! Cancel within "}
									<Text style={styles.timeTxt}>{timer}</Text>
									{" seconds to stop notification to emergency contacts."}
								</Text>
							</View>
						</>
					)}
					<View style={[CommonStyles.directionRowSB]}>
						<TouchableOpacity
							onPress={() => onRequestClose()}
							style={[
								CommonStyles.logoutBtn,
								{
									backgroundColor: Colors.lightGrayBG,
								},
							]}
						>
							<Text style={[CommonStyles.cancelText, { color: Colors.black }]}>
								{"Cancel"}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								CommonStyles.logoutBtn,
								{
									backgroundColor: Colors.secondary,
									opacity: !location || isAlertSent ? 0.5 : 1,
								},
							]}
							onPress={() => onPressSubmit()}
							disabled={!location || isAlertSent}
						>
							<Text style={[CommonStyles.logoutText]}>{"Submit"}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Overlay>
	);
};

const styles = StyleSheet.create({
	loadingContainer: {
		height: 180,
		width: "100%",
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
	inputLocation: {
		backgroundColor: Colors.primary,
		borderRadius: 10,
		paddingVertical: 5,
		paddingHorizontal: 5,
		marginTop: 10,
	},
	locationValue: {
		color: Colors.labelWhite,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize10,
		width: "100%",
	},
	crashDetectedTxt: {
		fontSize: 14,
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsSemiBold,
		textAlign: "center",
	},
	progressValueStyle: {
		fontSize: 16,
		fontWeight: "bold",
		color: Colors.secondary,
	},
	timerRow: {
		...CommonStyles.directionRowSB,
		marginVertical: 15,
		width: "100%",
	},
	alertTxt: {
		marginLeft: 10,
		width: "85%",
		fontSize: 12,
		color: Colors.inputBlackText,
		fontFamily: FontFamily.PoppinsRegular,
	},
	timeTxt: {
		color: Colors.secondary,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
});
