import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	LayoutAnimation,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Button, DarkHeader, Icons, KeyValue, Loader } from "../../components";
import Colors from "../../styles/Colors";
import LayoutStyle from "../../styles/LayoutStyle";
import MapStyle from "../../styles/MapStyle";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_APIKEY } from "../../config/BaseUrl";
import {
	fetchDistanceAndDuration,
	calculateAverageSpeed,
	convertLatLongToString,
	getShortLocationName,
} from "../../config/CommonFunctions";
import Api from "../../utils/Api";
import { showMessage } from "react-native-flash-message";
import { deviceHeight } from "../../utils/DeviceInfo";
import { getCurrentLocation, locationPermission } from "../../utils/Location";

const TripDetailsScreen = (props) => {
	const mapRef = useRef(null);
	const { tripDetail } = props?.route?.params;
	const { itemIndex } = props?.route?.params;

	const [loading, setLoading] = useState(true);
	const [origin, setOrigin] = useState(null);
	const [originName, setOriginName] = useState("");
	const [destination, setDestination] = useState(null);
	const [waypoints, setWaypoints] = useState([]);
	const [distance, setDistance] = useState(0);
	const [duration, setDuration] = useState(0);
	const [avgSpeed, setAvgSpeed] = useState(0);
	const [fuelEfficiency, setFuelEfficiency] = useState(0);
	const [isExpandedMap, setIsExpandedMap] = useState(false);
	const [dottedPaths, setDottedPaths] = useState([]);

	const getLiveLocation = async () => {
		const locPermissionGranted = await locationPermission();

		if (locPermissionGranted) {
			const { latitude, longitude, locationName } = await getCurrentLocation();
			setOrigin({ latitude, longitude });
			if (locationName) {
				const shortName = await getShortLocationName(locationName);
				setOriginName(shortName[0]?.mainText);
			}
		}
	};

	useEffect(() => {
		getLiveLocation();
	}, []);

	useEffect(() => {
		const fetchAndCalculate = async () => {
			if (tripDetail && origin) {
				setDestination(tripDetail?.destinationLocation);
				setWaypoints(tripDetail?.waypointLocation);

				const originString = convertLatLongToString(origin);
				const destinationString = convertLatLongToString(
					tripDetail?.destinationLocation
				);

				const { distance, duration, durationText } =
					await fetchDistanceAndDuration(originString, destinationString);

				const distanceInMiles = distance * 0.000621371;

				const averageSpeed = calculateAverageSpeed(distanceInMiles, duration);

				setDistance(distanceInMiles);
				setDuration(durationText);
				setAvgSpeed(averageSpeed);

				const fuelConsumed = 2.64;
				const fuelEfficiencyInMiles = distanceInMiles / fuelConsumed;
				setFuelEfficiency(fuelEfficiencyInMiles);

				setLoading(false);
			}
		};
		fetchAndCalculate();
	}, [tripDetail, origin]);

	useEffect(() => {
		findDottedPaths();
	}, [waypoints]);

	const findDottedPaths = async () => {
		try {
			if (origin && destination) {
				const response = await fetch(
					`https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_APIKEY}`
				);
				const data = await response.json();

				if (data.routes.length > 0) {
					const routePoints = decodePolyline(
						data.routes[0].overview_polyline.points
					);
					let newDottedPaths = [];

					const closestPointToDestination = findClosestPoint(
						routePoints,
						destination
					);
					const destinationDistance = getDistance(
						destination,
						closestPointToDestination
					);

					if (destinationDistance > 150) {
						newDottedPaths.push({
							start: destination,
							end: closestPointToDestination,
						});
					}

					setDottedPaths(newDottedPaths);
				} else {
					console.warn("No routes found from Google Maps API.");
					setDottedPaths([]);
				}
			}
		} catch (error) {
			console.error("Error fetching route data:", error);
		}
	};
	const decodePolyline = (polyline) => {
		let points = [];
		let index = 0,
			len = polyline.length;
		let lat = 0,
			lng = 0;

		while (index < len) {
			let b,
				shift = 0,
				result = 0;
			do {
				b = polyline.charCodeAt(index++) - 63;
				result |= (b & 0x1f) << shift;
				shift += 5;
			} while (b >= 0x20);
			let dlat = result & 1 ? ~(result >> 1) : result >> 1;
			lat += dlat;

			shift = 0;
			result = 0;
			do {
				b = polyline.charCodeAt(index++) - 63;
				result |= (b & 0x1f) << shift;
				shift += 5;
			} while (b >= 0x20);
			let dlng = result & 1 ? ~(result >> 1) : result >> 1;
			lng += dlng;

			points.push({
				latitude: lat / 1e5,
				longitude: lng / 1e5,
			});
		}
		return points;
	};
	const findClosestPoint = (routePoints, waypoint) => {
		let closestPoint = routePoints[0];
		let minDistance = getDistance(routePoints[0], waypoint);

		routePoints.forEach((point) => {
			const distance = getDistance(point, waypoint);
			if (distance < minDistance) {
				minDistance = distance;
				closestPoint = point;
			}
		});
		return closestPoint;
	};
	//calculate distance between two coordinates
	const getDistance = (coord1, coord2) => {
		const toRad = (value) => (value * Math.PI) / 180;

		const R = 6371e3; // Earth radius in meters
		const lat1 = toRad(coord1.latitude);
		const lat2 = toRad(coord2.latitude);
		const deltaLat = toRad(coord2.latitude - coord1.latitude);
		const deltaLon = toRad(coord2.longitude - coord1.longitude);

		const a =
			Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
			Math.cos(lat1) *
				Math.cos(lat2) *
				Math.sin(deltaLon / 2) *
				Math.sin(deltaLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c; // Distance in meters
	};
	const gotoBack = () => {
		props.navigation.goBack();
	};
	const calculateDeltas = (coords) => {
		const latitudes = coords.map((coord) => coord.latitude);
		const longitudes = coords.map((coord) => coord.longitude);

		const minLat = Math.min(...latitudes);
		const maxLat = Math.max(...latitudes);
		const minLng = Math.min(...longitudes);
		const maxLng = Math.max(...longitudes);

		const latitudeDelta = (maxLat - minLat) * 1.1;
		const longitudeDelta = (maxLng - minLng) * 1.1;

		return { latitudeDelta, longitudeDelta };
	};
	const handleOnReady = (result) => {
		let allCoordinates = [];

		let bounds = {
			minLat: Number.MAX_VALUE,
			maxLat: Number.MIN_VALUE,
			minLng: Number.MAX_VALUE,
			maxLng: Number.MIN_VALUE,
		};

		result.routes?.forEach((route) => {
			const coordinates = route.coordinates;
			allCoordinates = allCoordinates.concat(coordinates);
			coordinates.forEach((coord) => {
				bounds.minLat = Math.min(bounds.minLat, coord.latitude);
				bounds.maxLat = Math.max(bounds.maxLat, coord.latitude);
				bounds.minLng = Math.min(bounds.minLng, coord.longitude);
				bounds.maxLng = Math.max(bounds.maxLng, coord.longitude);
			});
		});

		const { latitudeDelta, longitudeDelta } = calculateDeltas(allCoordinates);
		const midLat = (bounds.minLat + bounds.maxLat) / 2;
		const midLng = (bounds.minLng + bounds.maxLng) / 2;

		mapRef.current?.animateToRegion(
			{
				latitude: midLat,
				longitude: midLng,
				latitudeDelta,
				longitudeDelta,
			},
			1000
		);
		mapRef.current?.fitToCoordinates(allCoordinates, {
			edgePadding: {
				right: 20,
				bottom: 20,
				left: 20,
				top: 100,
			},
		});
	};
	const gotoMapNavigation = () => {
		let coordinates = [];

		if (origin && destination) {
			coordinates.push({
				latitude: origin.latitude,
				longitude: origin.longitude,
				locationName: originName,
			});

			if (waypoints) {
				waypoints.forEach((waypoint) => {
					coordinates.push({
						latitude: waypoint.latitude,
						longitude: waypoint.longitude,
						locationName: waypoint?.address,
						placeId: waypoint?.place_id,
					});
				});
			}

			coordinates.push({
				latitude: destination.latitude,
				longitude: destination.longitude,
				locationName: tripDetail?.destinationLocation?.destinationLocationName,
				placeId: tripDetail?.place_id,
			});
		}

		props.navigation.navigate("MainMap", {
			coordinates: coordinates,
		});
	};
	const onPressSave = async () => {
		if (tripDetail) {
			try {
				setLoading(true);
				const data = {
					destination_latitude: tripDetail?.destinationLocation?.latitude,
					destination_longitude: tripDetail?.destinationLocation?.longitude,
					destination_location_name:
						tripDetail?.destinationLocation?.destinationLocationName,

					waypoint:
						tripDetail?.waypointLocation?.length > 0
							? tripDetail?.waypointLocation
							: [],
					waypoint_name:
						tripDetail?.waypointLocationNames?.length > 0
							? tripDetail?.waypointLocationNames
							: [],

					address: tripDetail?.destinationLocation?.destinationLocationName,
					flag: 0,
					note: "",
					place_id: tripDetail?.place_id,
					city: tripDetail?.city,
					state: tripDetail?.state,
					state_code: tripDetail?.stateCode,
				};

				if (tripDetail.label) {
					data["name"] = tripDetail.label;
				}

				const response = await Api.post("user/save-destination", data);
				setLoading(false);
				if (response.success) {
					showMessage({
						message: response.message,
						type: "success",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				} else {
					const extractMessages = (messagesArray) => {
						return messagesArray
							.flatMap((item) => Object.values(item))
							.flat()
							.join(", ");
					};
					const messagesString = extractMessages(response.data.data);

					showMessage({
						message: messagesString,
						type: "danger",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				}
			} catch (error) {
				setLoading(false);
				console.warn(error);
			}
		}
	};
	const toggleMapExpnadCollapse = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setIsExpandedMap(!isExpandedMap);
	};

	return (
		<View style={[MapStyle.mainContainer, { backgroundColor: Colors.white }]}>
			<Loader show={loading} />
			<DarkHeader
				iconName={"angle-left"}
				iconSetName={"FontAwesome6"}
				iconColor={Colors.backArrowWhite}
				iconSize={24}
				whiteLabel={"Maps"}
				DarkHeaderMainStyle={[LayoutStyle.paddingTop30]}
				onPress={() => gotoBack()}
			/>
			{!loading && (
				<ScrollView
					nestedScrollEnabled={true}
					showsVerticalScrollIndicator={false}
					overScrollMode={"never"}
				>
					<View style={[MapStyle.mapCardContainer]}>
						<Text style={[MapStyle.tripDetailsText]}>{"Trip Details"}</Text>
						<View
							style={[
								MapStyle.mapImgContainer,
								{
									height: isExpandedMap
										? deviceHeight / 1.8
										: deviceHeight / 4.5,
									borderRadius: 7,
									overflow: "hidden",
								},
							]}
						>
							<MapView
								provider={PROVIDER_GOOGLE}
								style={styles.map}
								initialRegion={{
									latitude: origin.latitude,
									longitude: origin.longitude,
									latitudeDelta: 0.5,
									longitudeDelta: 0.1,
								}}
								userInterfaceStyle={"light"}
							>
								<Marker coordinate={origin}>
									<Icons
										iconName={"circle"}
										iconSetName={"MaterialCommunityIcons"}
										iconColor={Colors.primary}
										iconSize={10}
									/>
								</Marker>
								<Marker coordinate={destination}>
									<Icons
										iconName={"square"}
										iconSetName={"MaterialCommunityIcons"}
										iconColor={Colors.secondary}
										iconSize={10}
									/>
								</Marker>
								{waypoints &&
									waypoints.length !== 0 &&
									waypoints.map((waypoint, index) => (
										<Marker key={index} coordinate={waypoint}>
											<Icons
												iconName={"square"}
												iconSetName={"MaterialCommunityIcons"}
												iconColor={Colors.secondary}
												iconSize={10}
											/>
										</Marker>
									))}
								<MapViewDirections
									origin={origin}
									destination={destination}
									waypoints={waypoints}
									apikey={GOOGLE_MAPS_APIKEY}
									strokeColor="#112D4E"
									strokeWidth={2}
									onReady={handleOnReady}
								/>
								{dottedPaths.map((path, index) => (
									<Polyline
										key={index}
										coordinates={[path.start, path.end]}
										strokeColor={Colors.primary}
										strokeWidth={3}
										lineDashPattern={[10, 10]}
									/>
								))}
							</MapView>
							<TouchableOpacity
								onPress={toggleMapExpnadCollapse}
								style={[MapStyle.expandCollapseBtn]}
							>
								<Icons
									iconSetName={
										isExpandedMap ? "MaterialCommunityIcons" : "FontAwesome6"
									}
									iconName={isExpandedMap ? "arrow-collapse" : "expand"}
									iconColor={Colors.primary}
									iconSize={isExpandedMap ? 22 : 18}
								/>
							</TouchableOpacity>
						</View>
					</View>

					<View
						style={[MapStyle.tripDetailsDesti, { height: 250, padding: 0 }]}
					>
						<ScrollView
							nestedScrollEnabled={true}
							style={{ flex: 1, padding: 20 }}
							scrollEnabled={true}
							showsVerticalScrollIndicator={false}
						>
							<Text style={[MapStyle.destinationTitle]}>{"Destination"}</Text>
							<View style={{ marginBottom: 20 }}>
								<View style={{ flexDirection: "row" }}>
									<View style={MapStyle.flexColumn}>
										<View style={MapStyle.originCircle} />
										<View style={MapStyle.pathLine} />
									</View>
									<Text style={[MapStyle.originAddrText]}>
										{originName || ""}
									</Text>
								</View>

								{tripDetail?.waypointLocationNames &&
									tripDetail?.waypointLocationNames?.length !== 0 && (
										<>
											{tripDetail?.waypointLocationNames?.map((item, index) => (
												<View key={index} style={{ flexDirection: "row" }}>
													<View style={MapStyle.flexColumn}>
														<View style={MapStyle.blueSquare} />
														<View style={MapStyle.pathLine} />
													</View>
													<Text
														style={[
															MapStyle.originAddrText,
															{ color: "#4CA7DA" },
														]}
													>
														{item ? item : "-"}
													</Text>
												</View>
											))}
										</>
									)}

								<View style={{ flexDirection: "row" }}>
									<View style={MapStyle.flexColumn}>
										<View style={MapStyle.blueSquare} />
									</View>
									<Text style={[MapStyle.originAddrText]}>
										{tripDetail?.destinationLocation?.destinationLocationName
											? tripDetail?.destinationLocation?.destinationLocationName
											: "-"}
									</Text>
								</View>
							</View>
						</ScrollView>

						<View style={[MapStyle.againDestiBtnBox]}>
							<Button
								btnLabelColor={Colors.labelBlack}
								btnName={"Set Destination"}
								btnColor={Colors.transparent}
								isBtnActive={true}
								btnWidth={1}
								onPress={() => gotoMapNavigation()}
							/>
						</View>
					</View>
					<View style={[MapStyle.scoreCard]}>
						<Text style={[MapStyle.destinationTitle]}>{"Scoreboard"}</Text>
						<View>
							<KeyValue
								keyLabel={"Distance"}
								valueLabel={`${distance.toFixed(2)} Miles`}
								keyColor={Colors.labelBlack}
								borderColor={Colors.lightBlueBorder}
							/>
							<KeyValue
								keyLabel={"Avg Speed"}
								valueLabel={`${avgSpeed} mph`}
								keyColor={Colors.labelBlack}
								borderColor={Colors.lightBlueBorder}
							/>
							<KeyValue
								keyLabel={"Fuel Efficiency"}
								valueLabel={`${fuelEfficiency.toFixed(2)} mpg`}
								keyColor={Colors.labelBlack}
								borderColor={Colors.lightBlueBorder}
							/>
							<KeyValue
								keyLabel={"Total Time"}
								valueLabel={`${duration ? duration : "0 mins"}`}
								keyColor={Colors.labelBlack}
								borderColor={Colors.lightBlueBorder}
							/>
						</View>
						<View style={{ ...LayoutStyle.paddingVertical30 }}>
							<Button
								btnColor={Colors.secondary}
								isBtnActive={true}
								btnName={"Save Destination"}
								btnLabelColor={Colors.white}
								onPress={() => onPressSave()}
							/>
						</View>
					</View>
				</ScrollView>
			)}
		</View>
	);
};

export default TripDetailsScreen;

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "flex-end",
		alignItems: "center",
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
});
