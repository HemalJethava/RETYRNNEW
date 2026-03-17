import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Platform,
	StyleSheet,
	Pressable,
} from "react-native";
import { Icons } from "../../../components";
import Colors from "../../../styles/Colors";
import { Image } from "react-native";
import {
	BottomSheetModal,
	BottomSheetModalProvider,
	BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import LayoutStyle from "../../../styles/LayoutStyle";
import CommonStyles from "../../../styles/CommonStyles";
import FontFamily from "../../../assets/fonts/FontFamily";

const MapAppPanel = ({ show, onHide, availableApps, onPressApp }) => {
	const snapPoints = useMemo(() => ["23%"], []);

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
				<View style={[styles.mainContainer]}>
					<View style={[styles.header]}>
						<View style={[styles.rowBetween, { width: "100%" }]}>
							<Text style={styles.text}>{"Choose Maps App"}</Text>
							<TouchableOpacity
								onPress={handleclosePanel}
								style={styles.closePanelBtn}
							>
								<Icons
									iconSetName={"MaterialCommunityIcons"}
									iconName={"window-close"}
									iconSize={14}
									iconColor={Colors.iconBlack}
								/>
							</TouchableOpacity>
						</View>
					</View>
					<View style={[styles.div, { marginBottom: 0 }]} />
					<View style={[styles.appsList]}>
						{/* <Text style={[styles.detailTxt]}>
							{"Select a navigation app to continue"}
						</Text> */}
						<View style={[{ ...CommonStyles.directionRowCenter }]}>
							{availableApps.map((app) => (
								<Pressable
									style={[styles.appBox]}
									key={app.id}
									onPress={() => onPressApp(app.id)}
								>
									<View style={[styles.appImgBox]}>
										<Image source={app.icon} style={[styles.appImg]} />
									</View>
									<Text style={[styles.appName]}>{app.name}</Text>
								</Pressable>
							))}
						</View>
					</View>
				</View>
			</BottomSheetModal>
		</BottomSheetModalProvider>
	);
};

export default MapAppPanel;

const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
	},
	header: {
		paddingTop: Platform.OS === "ios" ? 20 : 0,
		marginHorizontal: 20,
	},
	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	text: {
		fontSize: 14,
		color: "#252525",
		fontWeight: "700",
	},
	closePanelBtn: {
		backgroundColor: "#F5F5F5",
		height: 30,
		width: 30,
		borderRadius: 15,
		justifyContent: "center",
		alignItems: "center",
	},
	div: {
		height: 2,
		backgroundColor: "#EFEFEF",
		borderRadius: 5,
		marginVertical: 10,
	},
	detailTxt: {
		color: Colors.inputBlackText,
		fontSize: 12,
		...LayoutStyle.marginVertical10,
		...LayoutStyle.marginLeft20,
	},
	appsList: {
		flex: 1,
		justifyContent: "center",
		...LayoutStyle.paddingHorizontal20,
		...LayoutStyle.paddingVertical20,
	},
	appBox: {
		justifyContent: "center",
		alignItems: "center",
		...LayoutStyle.marginRight20,
	},
	appImgBox: {
		backgroundColor: Colors.white,
		justifyContent: "center",
		alignItems: "center",
		height: 40,
		width: 40,
		padding: 5,
		borderRadius: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -3 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 2,
		borderTopWidth: 1,
		borderTopColor: "#ddd",
	},
	appImg: {
		height: 25,
		width: 25,
	},
	appName: {
		fontSize: 10,
		marginTop: 5,
		fontFamily: FontFamily.PoppinsRegular,
	},
});
