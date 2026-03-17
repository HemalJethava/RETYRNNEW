import React, { useRef, useEffect } from "react";
import { View } from "react-native";
import { Polyline, Marker } from "react-native-maps";

export const RoutePolyline = ({
	type,
	options,
	selectedIndex,
	setSelectedIndex,
	currentLocation,
	isNavigating,
	mapReady,
}) => {
	if (!options || options.length === 0) return null;

	const fullRoute = options[selectedIndex];
	if (!fullRoute || fullRoute.length === 0) return null;

	// Keep the origin fixed once navigation starts
	const grayOriginRef = useRef(null);

	if (isNavigating && currentLocation && !grayOriginRef.current) {
		grayOriginRef.current = fullRoute[0]; // fixed origin
	}

	if (!isNavigating && grayOriginRef.current) {
		grayOriginRef.current = null;
	}

	let closestIndex = 0;
	if (isNavigating && currentLocation) {
		let minDist = Infinity;
		fullRoute.forEach((pt, idx) => {
			const d = Math.hypot(
				pt.latitude - currentLocation.latitude,
				pt.longitude - currentLocation.longitude
			);
			if (d < minDist) {
				minDist = d;
				closestIndex = idx;
			}
		});
	}

	// Gray line: origin -> currentLocation
	const grayLine =
		isNavigating && currentLocation && grayOriginRef.current
			? [grayOriginRef.current, { ...currentLocation }]
			: [];

	// Blue line: currentLocation -> remaining
	const blueLine =
		isNavigating && currentLocation
			? [{ ...currentLocation }, ...fullRoute.slice(closestIndex + 1)]
			: fullRoute;

	const filterDuplicates = (arr) =>
		arr.filter((p, i) => {
			if (i === 0) return true;
			const prev = arr[i - 1];
			return p.latitude !== prev.latitude || p.longitude !== prev.longitude;
		});

	const finalGray = filterDuplicates(grayLine);
	const finalBlue = filterDuplicates(blueLine);

	return (
		<>
			{/* Show alternate (non-selected) routes */}
			{!isNavigating &&
				options.map((coords, idx) => {
					if (idx === selectedIndex) return null;
					return (
						<Polyline
							key={`${type}-alt-${idx}`}
							coordinates={coords}
							strokeColor="#a5cbfe"
							strokeWidth={5}
							tappable
							onPress={() => setSelectedIndex(idx)}
						/>
					);
				})}

			{/* Origin marker */}
			{/* {mapReady &&
				fullRoute?.[0]?.latitude != null &&
				fullRoute?.[0]?.longitude != null && (
					<Marker
						coordinate={{
							latitude: fullRoute[0].latitude,
							longitude: fullRoute[0].longitude,
						}}
						// anchor={{ x: 0.5, y: 0.5 }}
					>
						<View style={MapStyle.originCircle} />
					</Marker>
				)} */}

			{/* Gray path (origin → current location) */}
			{isNavigating && finalGray.length > 1 && (
				<>
					<Polyline
						key={`${type}-gray-border`}
						coordinates={finalGray}
						strokeColor="#a3a3a3"
						strokeWidth={9}
					/>
					<Polyline
						key={`${type}-gray-main`}
						coordinates={finalGray}
						strokeColor="#dbdbdb"
						strokeWidth={6}
					/>
				</>
			)}

			{/* Blue path (current → destination) */}
			{finalBlue.length > 1 && (
				<>
					<Polyline
						key={`${type}-blue-border`}
						coordinates={finalBlue}
						strokeColor="#0b22de"
						strokeWidth={10}
						zIndex={7}
					/>
					<Polyline
						key={`${type}-blue-main`}
						coordinates={finalBlue}
						strokeColor="#0f53fe"
						strokeWidth={6}
						zIndex={8}
					/>
				</>
			)}
		</>
	);
};
