import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
	BottomSheetModal,
	BottomSheetModalProvider,
	BottomSheetBackdrop,
	BottomSheetFlatList,
	BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Icons } from "../../../components";
import Colors from "../../../styles/Colors";
import FontFamily from "../../../assets/fonts/FontFamily";

export const SaveDraftPanel = ({ show, onHide, snapHeight, onPressSave }) => {
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
				backgroundStyle={styles.backgroundStyle}
			>
				<BottomSheetScrollView style={{ flex: 1 }}>
					<View style={styles.panelContainer}>
						<View style={[styles.panelTitleBox, { borderBottomWidth: 0.57 }]}>
							<Text style={styles.panelTitle}>{"Save as Draft"}</Text>
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
							<Text style={[styles.detailTxt]}>
								{
									"You have an incomplete manual incident application. You can save it as a draft and continue later."
								}
							</Text>
							<View style={{}}>
								<TouchableOpacity
									style={[styles.buttonSave]}
									onPress={() => {
										handleclosePanel();
										onPressSave();
									}}
								>
									<Text style={styles.saveTxt}>{"Save"}</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[styles.buttonSave, { backgroundColor: "#f2f2f2" }]}
									onPress={handleclosePanel}
								>
									<Text style={[styles.saveTxt, { color: "#656565" }]}>
										{"Cancel"}
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</BottomSheetScrollView>
			</BottomSheetModal>
		</BottomSheetModalProvider>
	);
};

const styles = StyleSheet.create({
	panelContainer: {
		marginHorizontal: 20,
		paddingBottom: 20,
	},
	backgroundStyle: {
		backgroundColor: "#fff",
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: -2 },
				shadowOpacity: 0.1,
				shadowRadius: 8,
			},
			android: {
				elevation: 10,
			},
		}),
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
		paddingVertical: 10,
	},
	detailTxt: {
		color: Colors.inputBlackText,
		fontSize: 12,
		fontFamily: FontFamily.PoppinsMedium,
	},
	buttonSave: {
		backgroundColor: Colors.primary,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 20,
		paddingVertical: 10,
		marginVertical: 10,
	},
	saveTxt: {
		color: Colors.white,
		fontSize: 16,
		FontFamily: FontFamily.PoppinsMedium,
	},
});
