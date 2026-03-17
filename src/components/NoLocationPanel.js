import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Colors from "../styles/Colors";
import Icons from "./Icons";
import {
	BottomSheetModal,
	BottomSheetModalProvider,
	BottomSheetBackdrop,
	BottomSheetFlatList,
} from "@gorhom/bottom-sheet";

export const NoLocationPanel = ({ show, onHide, snapHeight }) => {
	const snapPoints = useMemo(() => [snapHeight], []);
	const panelRef = useRef(null);

	useEffect(() => {
		if (show) {
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
					<View style={styles.panelContainer}>
						<View style={styles.panelTitleBox}>
							<Text style={styles.panelTitle}>{"Location"}</Text>
							<TouchableOpacity onPress={handleclosePanel}>
								<View style={styles.closeButton}>
									<Icons
										iconSetName={"MaterialCommunityIcons"}
										iconName={"close"}
										iconSize={22}
										iconColor={"#656565"}
									/>
								</View>
							</TouchableOpacity>
						</View>
						<View style={styles.textContainer}>
							<View style={styles.textsBox}>
								<Icons
									iconSetName={"MaterialIcons"}
									iconName={"not-listed-location"}
									iconSize={34}
									iconColor={Colors.black}
								/>
								<Text style={styles.mainText}>
									{"Can't seem to find a way there"}
								</Text>
								<Text style={styles.detailTxt}>{"Try a Google search"}</Text>
							</View>
						</View>
					</View>
				</View>
			</BottomSheetModal>
		</BottomSheetModalProvider>
	);
};

const styles = StyleSheet.create({
	container: {
		// flex: 1,
	},
	panelContainer: {
		marginHorizontal: 20,
		paddingBottom: 20,
	},
	panelTitleBox: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		borderBottomWidth: 1.5,
		borderBottomColor: "#c6c6c6",
		paddingBottom: 12,
	},
	panelTitle: {
		color: Colors.black,
		fontSize: 18,
		fontWeight: "500",
	},
	closeButton: {
		backgroundColor: "#f2f2f2",
		height: 30,
		width: 30,
		borderRadius: 15,
		justifyContent: "center",
		alignItems: "center",
	},
	textContainer: {
		paddingVertical: 20,
	},
	textsBox: {
		justifyContent: "center",
		alignItems: "center",
	},
	mainText: {
		color: Colors.black,
		fontSize: 16,
		fontWeight: "500",
		marginVertical: 10,
	},
	detailTxt: {
		fontSize: 16,
		color: "#ccc",
	},
});
