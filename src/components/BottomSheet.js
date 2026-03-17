import { View, Text, Modal, Pressable } from "react-native";
import React from "react";
import LinearGradient from "react-native-linear-gradient";
import { Icons } from ".";
import ComponentStyles from "../styles/ComponentStyles";
import LayoutStyle from "../styles/LayoutStyle";
import CommonStyles from "../styles/CommonStyles";

const BottomSheet = ({
	visible,
	onBackButtonPress,
	onBackdropPress,
	onRequestClose,
	onModalClose,
	isCameraOption,
	isGalleryOption,
	isFileOption,
	isRemoveImgOption,
	onCameraPress,
	onGalleryPress,
	onFilePress,
	onRemoveImgPress,
	...props
}) => {
	return (
		<View style={[ComponentStyles.mainSheetAlign]}>
			<Modal
				animationType="slide"
				transparent={true}
				visible={visible}
				onRequestClose={onRequestClose}
			>
				<View style={{ flex: 1 }}>
					<Pressable onPress={onModalClose} style={{ flex: 1 }}></Pressable>
					<View style={[ComponentStyles.bottomSheet]}>
						<Text style={[ComponentStyles.selctTextLabel]}>
							{"Select Source"}
						</Text>
						<View
							style={{
								...CommonStyles.directionRowSB,
								...LayoutStyle.padding20,
								flexWrap: "wrap",
							}}
						>
							{isCameraOption ? (
								<Pressable
									onPress={onCameraPress}
									style={[ComponentStyles.iconBox]}
								>
									<LinearGradient
										colors={["#e7e7e7", "#e7e7e7"]}
										start={{ x: 0, y: 0 }}
										end={{ x: 1, y: 1 }}
										style={[
											ComponentStyles.gradientBtn,
											{ borderColor: "#050200" },
										]}
									>
										<Icons
											iconName={"camera-plus"}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={"#050200"}
											iconSize={28}
										/>
										<Text style={[ComponentStyles.textIconLabel]}>
											{"Camera"}
										</Text>
									</LinearGradient>
								</Pressable>
							) : null}
							{isGalleryOption ? (
								<Pressable
									onPress={onGalleryPress}
									style={[ComponentStyles.iconBox]}
								>
									<LinearGradient
										colors={["#fcd5e6", "#f9aed0"]}
										start={{ x: 0, y: 0 }}
										end={{ x: 1, y: 1 }}
										style={[
											ComponentStyles.gradientBtn,
											{ borderColor: "#ee1175" },
										]}
									>
										<Icons
											solid
											iconName={"image-multiple"}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={"#ee1175"}
											iconSize={28}
										/>
										<Text style={[ComponentStyles.textIconLabel]}>
											{"Photos"}
										</Text>
									</LinearGradient>
								</Pressable>
							) : null}

							{isFileOption ? (
								<Pressable
									onPress={onFilePress}
									style={[ComponentStyles.iconBox]}
								>
									<LinearGradient
										colors={["#c7defc", "#92bff9"]}
										start={{ x: 0, y: 0 }}
										end={{ x: 1, y: 1 }}
										style={[
											ComponentStyles.gradientBtn,
											{ borderColor: "#0B5FCC" },
										]}
									>
										<Icons
											iconName={"folder-multiple-plus"}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={"#0B5FCC"}
											iconSize={28}
										/>
										<Text style={[ComponentStyles.textIconLabel]}>
											{"Files"}
										</Text>
									</LinearGradient>
								</Pressable>
							) : null}

							{isRemoveImgOption ? (
								<Pressable
									onPress={onRemoveImgPress}
									style={[ComponentStyles.iconBox]}
								>
									<LinearGradient
										colors={["#c7defc", "#92bff9"]}
										start={{ x: 0, y: 0 }}
										end={{ x: 1, y: 1 }}
										style={[
											ComponentStyles.gradientBtn,
											{ borderColor: "#0B5FCC" },
										]}
									>
										<Icons
											iconName={"image-remove"}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={"#0B5FCC"}
											iconSize={28}
										/>
										<Text style={[ComponentStyles.textIconLabel]}>
											{"Remove Profile"}
										</Text>
									</LinearGradient>
								</Pressable>
							) : null}
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
};

export default BottomSheet;
