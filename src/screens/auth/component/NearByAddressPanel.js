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
} from "react-native";
import {
	BottomSheetModal,
	BottomSheetModalProvider,
	BottomSheetBackdrop,
	BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Button, Icons } from "../../../components";
import Colors from "../../../styles/Colors";
import LayoutStyle from "../../../styles/LayoutStyle";
import CommonStyles from "../../../styles/CommonStyles";
import FontFamily from "../../../assets/fonts/FontFamily";

const NearByAddressPanel = ({
	show,
	onHide,
	enteredAddress,
	suggestedAddress,
	onContinue,
}) => {
	const snapPoints = useMemo(() => ["55%"], []);
	const panelRef = useRef(null);

	const [selectedItem, setSelectedItem] = useState(1);

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
		(props) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={-1}
				appearsOnIndex={0}
				pressBehavior="none"
			/>
		),
		[]
	);

	const onPressContinue = () => {
		const selectedAddress =
			selectedItem === 0 ? "enteredAddress" : "suggestedAddress";
		onContinue(selectedAddress);
		handleclosePanel();
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
				<View style={[styles.mainContainer]}>
					<View style={[styles.header]}>
						<View style={[styles.rowBetween, { width: "100%" }]}>
							<Text style={styles.text}>{"Addresses"}</Text>
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
					<View style={[styles.div, { marginBottom: 0 }]} />
					<BottomSheetScrollView showsVerticalScrollIndicator={false}>
						<View style={{ ...LayoutStyle.padding20 }}>
							<View style={[styles.warningBox]}>
								<Icons
									iconName={"info-with-circle"}
									iconSetName={"Entypo"}
									iconColor={Colors.primary}
									iconSize={22}
								/>
								<Text style={styles.infoTxt}>
									{
										"We have slightly modified the address entered. If correct please use the suggested address."
									}
								</Text>
							</View>
							<>
								<TouchableOpacity
									style={[
										styles.addressBox,
										{
											borderColor:
												selectedItem === 0 ? Colors.secondary : "#ccc",
										},
									]}
									onPress={() => setSelectedItem(0)}
								>
									<View style={{ ...CommonStyles.directionRowCenter }}>
										<Icons
											iconName={"circle-dot"}
											iconSetName={"FontAwesome6"}
											iconColor={selectedItem === 0 ? Colors.secondary : "#ccc"}
											iconSize={18}
										/>
										<Text style={[styles.toggleTitle]}>
											{"Address entered"}
										</Text>
									</View>
									<View style={[styles.streetAddressBox, { marginTop: 10 }]}>
										<Text style={[styles.title]}>{"Address"}</Text>
										<Text style={[styles.description]}>
											{enteredAddress?.address}
										</Text>
									</View>
									<View style={[styles.addressRow]}>
										<View style={[styles.streetAddressBox, { width: "32%" }]}>
											<Text style={[styles.title]}>{"City"}</Text>
											<Text style={[styles.description]}>
												{enteredAddress?.city}
											</Text>
										</View>
										<View style={[styles.streetAddressBox, { width: "32%" }]}>
											<Text style={[styles.title]}>{"State"}</Text>
											<Text style={[styles.description]}>
												{enteredAddress?.state}
											</Text>
										</View>
										<View style={[styles.streetAddressBox, { width: "32%" }]}>
											<Text style={[styles.title]}>{"Zip"}</Text>
											<Text style={[styles.description]}>
												{enteredAddress?.zip_code}
											</Text>
										</View>
									</View>
								</TouchableOpacity>

								<TouchableOpacity
									style={[
										styles.addressBox,
										{
											borderColor:
												selectedItem === 1 ? Colors.secondary : "#ccc",
										},
									]}
									onPress={() => setSelectedItem(1)}
								>
									<View style={{ ...CommonStyles.directionRowCenter }}>
										<Icons
											iconName={"circle-dot"}
											iconSetName={"FontAwesome6"}
											iconColor={selectedItem === 1 ? Colors.secondary : "#ccc"}
											iconSize={18}
										/>
										<Text style={[styles.toggleTitle]}>
											{"Suggested entered"}
										</Text>
									</View>
									<View style={[styles.streetAddressBox, { marginTop: 10 }]}>
										<Text style={[styles.title]}>{"Address"}</Text>
										<Text style={[styles.description]}>
											{suggestedAddress?.address}
										</Text>
									</View>
									<View style={[styles.addressRow]}>
										<View style={[styles.streetAddressBox, { width: "32%" }]}>
											<Text style={[styles.title]}>{"City"}</Text>
											<Text style={[styles.description]}>
												{suggestedAddress?.city}
											</Text>
										</View>
										<View style={[styles.streetAddressBox, { width: "32%" }]}>
											<Text style={[styles.title]}>{"State"}</Text>
											<Text style={[styles.description]}>
												{suggestedAddress?.state}
											</Text>
										</View>
										<View style={[styles.streetAddressBox, { width: "32%" }]}>
											<Text style={[styles.title]}>{"Zip"}</Text>
											<Text style={[styles.description]}>
												{suggestedAddress?.zip_code}
											</Text>
										</View>
									</View>
								</TouchableOpacity>

								<View style={{ ...LayoutStyle.marginTop20 }}>
									<Button
										isBtnActive={true}
										btnLabelColor={Colors.white}
										btnName={"Continue"}
										btnColor={Colors.secondary}
										onPress={() => onPressContinue()}
									/>
								</View>
							</>
						</View>
					</BottomSheetScrollView>
				</View>
			</BottomSheetModal>
		</BottomSheetModalProvider>
	);
};

export default NearByAddressPanel;

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
		height: 40,
		width: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	div: {
		height: 2,
		borderColor: "#EFEFEF",
		borderWidth: 1,
		borderRadius: 5,
		marginVertical: 15,
	},
	warningBox: {
		...CommonStyles.directionRowCenter,
		borderWidth: 1,
		borderColor: "#f5f5f5",
		padding: 10,
		borderRadius: 7,
	},
	infoTxt: {
		color: Colors.labelBlack,
		fontSize: 12,
		fontFamily: FontFamily.PoppinsRegular,
		marginLeft: 10,
		width: "90%",
	},
	addressBox: {
		borderWidth: 1,
		borderColor: Colors.secondary,
		padding: 10,
		borderRadius: 7,
		marginTop: 20,
	},
	toggleTitle: {
		marginLeft: 10,
		fontSize: 14,
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsMedium,
		top: 1.5,
	},
	title: {
		fontSize: 12,
		fontFamily: FontFamily.PoppinsSemiBold,
		color: Colors.black,
	},
	description: {
		color: "#888",
		fontSize: 12,
		fontFamily: FontFamily.PoppinsRegular,
	},
	streetAddressBox: {
		borderWidth: 1,
		borderColor: "#f5f5f5",
		padding: 5,
		borderRadius: 5,
	},
	addressRow: {
		marginTop: 10,
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
	},
});
