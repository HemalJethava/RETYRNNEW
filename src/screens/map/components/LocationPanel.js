import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Platform,
	ScrollView,
	FlatList,
	Image,
	Dimensions,
} from "react-native";
import LocationArrow from "../../../assets/images/svg/locationArrow.svg";
import { styles } from "../../../styles/DirectionMapStyle";
import { Icons } from "../../../components";
import IMAGES from "../../../assets/images/Images";
import ListSkeleton from "../../../components/LoaderComponents/ListSkeleton";
import Colors from "../../../styles/Colors";
import {
	BottomSheetModal,
	BottomSheetModalProvider,
	BottomSheetBackdrop,
	BottomSheetFlatList,
	BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

const LocationPanel = ({
	show,
	panelProps,
	isLoading,
	data,
	destination,
	onPressStart,
	isFullScreen,
	closePanel,
}) => {
	const snapPoints = useMemo(
		() => [Platform.OS === "android" ? "10%" : "12%", "80%"],
		[]
	);

	const panelRef = useRef(null);

	useEffect(() => {
		if (show) {
			handlePresentModalPress();
		} else {
			handleclosePanel();
		}
	}, [show]);

	const handlePresentModalPress = useCallback(() => {
		panelRef.current?.present();
	}, []);

	const handleclosePanel = useCallback(() => {
		panelRef.current?.close();
	}, []);

	const handleSheetChanges = useCallback((index) => {
		if (index === -1) closePanel();
	}, []);

	const renderBackdrop = useCallback(
		(props) => <BottomSheetBackdrop {...props} pressBehavior="close" />,
		[]
	);

	const renderLocation = ({ item, index }) => {
		return (
			<>
				<View
					style={[
						styles.rowBetween,
						{
							flexDirection: "row",
							justifyContent: "space-between",
						},
					]}
				>
					<View>
						<Text style={styles.timeTxt}>
							{item?.duration ? item?.duration : "0 mins"}
						</Text>
						<Text style={[styles.addressTxt, { width: 240 }]}>
							{item?.locationName ? item?.locationName : "-"}
						</Text>
					</View>
					<TouchableOpacity
						style={[
							styles.startBtn,
							{
								opacity:
									item.latitude?.toString() === destination?.lat?.toString() &&
									item.longitude?.toString() === destination?.lng?.toString()
										? 0.5
										: item?.duration === "No duration found"
										? 0.5
										: 1,
							},
						]}
						disabled={
							item?.latitude?.toString() === destination?.lat?.toString() &&
							item?.longitude?.toString() === destination?.lng?.toString()
								? true
								: item?.duration === "No duration found"
								? true
								: false
						}
						onPress={() => onPressStart(item)}
					>
						<View style={styles.row}>
							<LocationArrow width={20} height={30} />
							<Text style={styles.startTxt}>Start</Text>
						</View>
					</TouchableOpacity>
				</View>
				<View style={styles.div} />
			</>
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
				// backgroundStyle={styles.backgroundStyle}
			>
				<View style={{ flex: 1 }}>
					<View
						style={{
							marginHorizontal: 20,
							paddingTop: Platform.OS === "ios" ? 20 : 0,
						}}
					>
						<View style={[styles.rowBetween, { width: "100%" }]}>
							<Text style={styles.text}>Routes</Text>
							<TouchableOpacity
								onPress={handleclosePanel}
								style={styles.closePanelBtn}
							>
								<Icons
									iconSetName={"MaterialCommunityIcons"}
									iconName={"window-close"}
									iconSize={20}
									iconColor={Colors.iconBlack}
								/>
							</TouchableOpacity>
						</View>
					</View>
					<View style={[styles.div, { marginHorizontal: 20 }]} />
					<View style={{ flex: 1, marginHorizontal: 20 }}>
						{isLoading ? (
							<BottomSheetFlatList
								data={Array(8).fill(0)}
								renderItem={({ item, index }) => <ListSkeleton />}
								keyExtractor={(item, index) => index.toString()}
								initialNumToRender={10}
								maxToRenderPerBatch={10}
								windowSize={5}
							/>
						) : (
							<BottomSheetFlatList
								data={data}
								renderItem={renderLocation}
								keyExtractor={(i, index) => index.toString()}
								showsVerticalScrollIndicator={false}
							/>
						)}
					</View>
				</View>
			</BottomSheetModal>
		</BottomSheetModalProvider>
	);
};

export default LocationPanel;
