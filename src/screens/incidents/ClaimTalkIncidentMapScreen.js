import React, { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Icons, LightHeader } from "../../components";
import { calculateDistance } from "../../config/CommonFunctions";
import Colors from "../../styles/Colors";
import FontFamily from "../../assets/fonts/FontFamily";
import IncidentStyle from "../../styles/IncidentStyles";
import AccountStyle from "../../styles/AccountStyle";

const ClaimTalkIncidentMapScreen = (props) => {
	const { claimTalkIncident } = props.route.params;
	const mapRef = useRef(null);

	const [isLoading, setIsLoading] = useState(true);
	const [location, setLocation] = useState(null);
	const [isRecenterVisible, setIsRecenterVisible] = useState(false);

	useEffect(() => {
		getPlace();
	}, []);

	const getPlace = () => {
		if (claimTalkIncident?.location_coords) {
			const coords = JSON.parse(claimTalkIncident?.location_coords);
			setIsLoading(false);
			setLocation(coords);
		}
	};
	const recenterMap = () => {
		if (location && mapRef.current) {
			mapRef.current.animateToRegion({
				...location,
				latitudeDelta: 0.005,
				longitudeDelta: 0.005,
			});
		}
	};
	const handleRegionChangeComplete = (region) => {
		if (location) {
			const distance = calculateDistance(
				location?.latitude,
				location?.longitude,
				region.latitude,
				region.longitude
			);

			setIsRecenterVisible(distance > 50);
		}
	};
	const gotoBack = () => {
		props.navigation.goBack();
	};

	return (
		<View style={{ flex: 1 }}>
			<LightHeader
				isLogo={false}
				isBackIcon={true}
				iconName={"angle-left"}
				iconSize={24}
				iconSetName={"FontAwesome6"}
				headerText={"Incident Location"}
				iconColor={Colors.white}
				headerBG={Colors.primary}
				statusBG={Colors.primary}
				headerTextColor={Colors.white}
				onPress={() => gotoBack()}
			/>
			{isLoading && !location ? (
				<View style={styles.container}>
					<Text style={[IncidentStyle.loadingText]}>Fetching location...</Text>
					<ActivityIndicator color={Colors.primary} size={"small"} />
				</View>
			) : (
				<>
					<MapView
						ref={mapRef}
						provider={PROVIDER_GOOGLE}
						style={[styles.map, {}]}
						initialRegion={{
							latitude: location?.latitude,
							longitude: location?.longitude,
							latitudeDelta: 0.005,
							longitudeDelta: 0.005,
						}}
						onRegionChangeComplete={handleRegionChangeComplete}
						userInterfaceStyle={"light"}
					>
						<Marker
							coordinate={{
								latitude: location?.latitude,
								longitude: location?.longitude,
							}}
							title="You are here"
						/>
					</MapView>
					{isRecenterVisible && (
						<TouchableOpacity
							style={styles.recenterButton}
							onPress={recenterMap}
						>
							<Icons
								iconSetName={"MaterialCommunityIcons"}
								iconName={"navigation-outline"}
								iconColor={Colors.cardBlue}
								iconSize={22}
							/>
							<Text style={styles.recenterTxt}>{"Re-center"}</Text>
						</TouchableOpacity>
					)}
				</>
			)}
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
		top: 120,
	},
	recenterButton: {
		position: "absolute",
		bottom: 30,
		left: 5,
		backgroundColor: Colors.white,
		padding: 12,
		borderRadius: 30,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		elevation: 5,
	},
	recenterTxt: {
		color: Colors.cardBlue,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
});

export default ClaimTalkIncidentMapScreen;
