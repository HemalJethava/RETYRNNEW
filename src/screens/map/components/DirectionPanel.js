import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { styles } from "../../../styles/DirectionMapStyle";
import { Icons } from "../../../components";
import Colors from "../../../styles/Colors";
import {
	formatDistanceToMiles,
	getIconLibrary,
	getTurnIcon,
	getTurnName,
	stripHtmlTags,
} from "../../../config/CommonFunctions";
import { Image } from "react-native";
import IMAGES from "../../../assets/images/Images";
import ListSkeleton from "../../../components/LoaderComponents/ListSkeleton";
import {
	BottomSheetModal,
	BottomSheetModalProvider,
	BottomSheetBackdrop,
	BottomSheetFlatList,
	BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

const DirectionPanel = ({
	show,
	onHide,
	data,
	onPressDirection,
	onPressDestination,
}) => {
	const snapPoints = useMemo(() => ["70%"], []);

	const panelRef = useRef(null);

	useEffect(() => {
		if (show && data?.steps?.length > 0) {
			handlePresentModalPress();
		}
	}, [show]);

	const handlePresentModalPress = useCallback(() => {
		panelRef.current?.present();
	}, []);

	const handleclosePanel = useCallback(() => {
		panelRef.current?.close();
	}, []);

	const handleSheetChanges = useCallback((index) => {
		if (index === -1) onHide();
	}, []);

	const renderBackdrop = useCallback(
		(props) => <BottomSheetBackdrop {...props} pressBehavior="close" />,
		[]
	);

	const renderStepItem = ({ item, index }) => {
		const stepLocation = {
			latitude: item?.end_location?.lat,
			longitude: item?.end_location?.lng,
			latitudeDelta: 0.01,
			longitudeDelta: 0.01,
		};
		return (
			<TouchableOpacity
				key={index}
				style={{}}
				onPress={() => {
					handleclosePanel();
					onPressDirection(stepLocation, 1000);
				}}
			>
				<View>
					<View style={[styles.rowBetween, { flex: 1 }]}>
						<View style={[styles.rowOnly, { flex: 0.85 }]}>
							<Icons
								iconSetName={getIconLibrary(item?.maneuver)}
								iconName={getTurnIcon(item?.maneuver)}
								iconSize={25}
								iconColor={Colors.black}
							/>
							<View style={{ marginLeft: 7 }}>
								<Text style={styles.directionDurationTxt}>
									{formatDistanceToMiles(item?.distance?.value)}
								</Text>
								<Text style={{ fontSize: 12 }}>
									{stripHtmlTags(item.html_instructions)}
								</Text>
							</View>
						</View>
						<Text
							style={{
								color: Colors.black,
								fontSize: 14,
								fontWeight: "600",
								textAlign: "right",
								width: 80,
							}}
						>
							{getTurnName(item?.maneuver)}
						</Text>
					</View>
					<View style={[styles.div]} />
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<BottomSheetModalProvider>
			<BottomSheetModal
				ref={panelRef}
				snapPoints={snapPoints}
				onChange={handleSheetChanges}
				backdropComponent={renderBackdrop}
				enablePanDownToClose={true}
				enableDynamicSizing={false}
			>
				<View style={{ flex: 1 }}>
					<View
						style={{
							paddingTop: Platform.OS === "ios" ? 20 : 0,
							marginHorizontal: 20,
						}}
					>
						<View style={[styles.rowBetween, { width: "100%" }]}>
							<Text style={styles.text}>Directions</Text>
							<TouchableOpacity
								onPress={() => {
									handleclosePanel();
									onHide();
								}}
								style={styles.closePanelBtn}
							>
								<Image
									source={IMAGES.altRouteBlack}
									style={{ height: 25, width: 25 }}
								/>
							</TouchableOpacity>
						</View>
					</View>
					<View style={[styles.div, { marginBottom: 0 }]} />
					{data && data?.steps?.length > 0 ? (
						<BottomSheetFlatList
							contentContainerStyle={{
								flexGrow: 1,
								padding: 20,
							}}
							data={data?.steps}
							renderItem={renderStepItem}
							keyExtractor={(_, index) => index.toString()}
							initialNumToRender={10}
							maxToRenderPerBatch={10}
							windowSize={5}
							showsVerticalScrollIndicator={false}
							ListFooterComponent={() => (
								<TouchableOpacity
									style={[styles.rowBetween, {}]}
									onPress={() => onPressDestination()}
								>
									<View style={[styles.rowOnly, { flex: 0.85 }]}>
										<Icons
											iconSetName={"MaterialIcons"}
											iconName={"location-pin"}
											iconSize={25}
											iconColor={Colors.black}
										/>
										<View style={{ marginLeft: 7 }}>
											<Text
												style={[styles.directionDurationTxt, { fontSize: 13 }]}
											>
												{data?.destinationName ? data?.destinationName : "-"}
											</Text>
										</View>
									</View>
								</TouchableOpacity>
							)}
						/>
					) : (
						<BottomSheetFlatList
							data={Array(8).fill(0)}
							renderItem={({ item, index }) => <ListSkeleton />}
							keyExtractor={(item, index) => index.toString()}
						/>
					)}
				</View>
			</BottomSheetModal>
		</BottomSheetModalProvider>
	);
};

export default DirectionPanel;
