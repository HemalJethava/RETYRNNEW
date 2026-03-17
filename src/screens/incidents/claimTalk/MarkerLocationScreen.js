import React, { useEffect, useState } from "react";
import {
	View,
	StyleSheet,
	Text,
	ActivityIndicator,
	Platform,
	TouchableOpacity,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import axios from "axios";
import { Button, Icons } from "../../../components";
import Colors from "../../../styles/Colors";
import IncidentStyle from "../../../styles/IncidentStyles";
import { GOOGLE_MAPS_APIKEY } from "../../../config/BaseUrl";
import {
	getCurrentLocation,
	locationPermission,
} from "../../../utils/Location";

const MarkerLocationScreen = ({
	onData,
	setMarkerScreen,
	closeMarkerScreen,
	...props
}) => {
	const [location, setLocation] = useState(null);
	const [error, setError] = useState(null);
	const [marker, setMarker] = useState(null);

	const [address, setAddress] = useState("");

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

	if (error) {
		return (
			<View style={styles.container}>
				<Text>{error}</Text>
			</View>
		);
	}

	if (!location) {
		return (
			<View style={styles.container}>
				<Text style={[IncidentStyle.loadingText]}>Fetching location...</Text>
				<ActivityIndicator color={Colors.primary} size={"small"} />
			</View>
		);
	}
	const handlePoiClick = async (event) => {
		const placeId = event.nativeEvent.placeId;

		if (placeId) {
			try {
				const response = await axios.get(
					`https://maps.googleapis.com/maps/api/place/details/json`,
					{
						params: {
							place_id: placeId,
							key: GOOGLE_MAPS_APIKEY,
						},
					}
				);
				const userLocation = response.data.result.geometry.location;
				setLocation({
					latitude: userLocation.lat,
					longitude: userLocation.lng,
				});
			} catch (error) {
				console.error("Error fetching place details:", error);
			}
		}
	};
	const handleMapPress = (event) => {
		const { coordinate } = event.nativeEvent;

		setMarker({
			id: "1",
			coordinate,
			title: "Marker",
			description: "Newly added marker",
		});
	};
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
				const formattedAddress = firstResult.formatted_address;

				const parts = formattedAddress.split(",");
				const main_text = parts[0]?.trim() || "";
				setAddress(main_text);
			} else {
				setAddress("");
			}
		} catch (error) {
			console.error("Error in reverse geocoding:", error);
			setAddress("");
		}
	};
	const onGetAddress = () => {
		if (typeof onData === "function") {
			onData(address, location);
		} else {
			console.error("onData is not a function");
		}
	};

	return (
		<View style={{ flex: 1 }}>
			<MapView
				provider={PROVIDER_GOOGLE}
				style={styles.map}
				initialRegion={{
					latitude: location.latitude,
					longitude: location.longitude,
					latitudeDelta: 0.005,
					longitudeDelta: 0.005,
				}}
				onPress={handleMapPress}
				onPoiClick={handlePoiClick}
				userInterfaceStyle={"light"}
			>
				<Marker
					coordinate={{
						latitude: location.latitude,
						longitude: location.longitude,
					}}
					title="You are here"
					draggable={true}
					onDragEnd={handleDragEnd}
				/>
			</MapView>
			<View style={{ flex: 1 }}>
				<TouchableOpacity
					onPress={closeMarkerScreen}
					style={[
						Platform.OS === "android" ? styles.closeBtn : styles.closeBtnIOS,
					]}
				>
					<Icons
						iconSetName={"MaterialCommunityIcons"}
						iconName={"close"}
						iconColor={Colors.white}
						iconSize={18}
					/>
				</TouchableOpacity>
				<View
					style={{
						flex: 1,
						justifyContent: "flex-end",
						padding: 20,
					}}
				>
					<View style={[IncidentStyle.inputLocation]}>
						<Text style={[IncidentStyle.locationText]}>{"Location: "}</Text>
						<Text style={[IncidentStyle.locationValue]}>{address}</Text>
					</View>
					<View style={{ paddingTop: 20 }}>
						<Button
							onPress={onGetAddress}
							btnLabelColor={Colors.white}
							btnName={"Confirm Location"}
							isBtnActive={true}
							btnColor={Colors.secondary}
						/>
					</View>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
	closeBtn: {
		position: "absolute",
		top: 43,
		right: 14,
		backgroundColor: Colors.labelDarkGray,
		padding: 5,
		borderRadius: 30,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	closeBtnIOS: {
		position: "absolute",
		top: 65,
		left: 14,
		backgroundColor: Colors.labelDarkGray,
		padding: 7,
		borderRadius: 30,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
});

export default MarkerLocationScreen;
