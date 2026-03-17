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
	Image,
} from "react-native";
import { Button, Icons, Input } from "../../../components";
import Colors from "../../../styles/Colors";
import LayoutStyle from "../../../styles/LayoutStyle";
import FontFamily from "../../../assets/fonts/FontFamily";
import {
	BottomSheetModal,
	BottomSheetModalProvider,
	BottomSheetBackdrop,
	BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import {
	formatMobileNumber,
	isValidteSpacialChar,
} from "../../../utils/Validation";
import CommonStyles from "../../../styles/CommonStyles";
import CountryPicker from "react-native-country-picker-modal";
import {
	countryCodes,
	MAX_FILE_SIZE_BYTES,
} from "../../../config/CommonFunctions";
import AccountStyle from "../../../styles/AccountStyle";
import { useDispatch, useSelector } from "react-redux";
import ImagePicker from "react-native-image-crop-picker";
import MESSAGE from "../../../utils/Messages";
import ImageResizer from "react-native-image-resizer";
import { stat } from "react-native-fs";

const generateUniqueId = () => {
	return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const AddNewContactPanel = ({
	show,
	onHide,
	getContacts,
	setIsConfirmByManual,
	setShowConfirmPopup,
}) => {
	const snapPoints = useMemo(() => ["60%"], []);
	const panelRef = useRef(null);

	const addContactError = useSelector((state) => state.Account.addContactError);

	const [contacts, setContacts] = useState([
		{
			id: generateUniqueId(),

			imgAPI: "",
			isImg: false,
			imgMsg: "",
			profileImg: "",
			showPictureOption: false,

			contactName: "",
			contactNameMsg: "",
			isContactName: false,
			contactNamePress: true,

			phone: "",
			phoneNumb: "",
			callingCode: "+1",
			countryCode: "US",
			backPhone: "",
			phoneMsg: "",
			isPhone: false,
			phonePress: true,
		},
	]);

	useEffect(() => {
		if (show) {
			handlePresentModalPress();
		}
	}, [show]);

	useEffect(() => {
		if (addContactError && Array.isArray(addContactError)) {
			addContactError.forEach((errObj) => {
				Object.keys(errObj).forEach((key) => {
					if (key.startsWith("mobile.")) {
						const indexStr = key.split(".")[1];
						const index = parseInt(indexStr, 10);
						const message = errObj[key][0];

						updateContactField(contacts[index].id, "isPhone", true);
						updateContactField(contacts[index].id, "phoneMsg", message);
					}
				});
			});
		}
	}, [addContactError]);

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
	function isMobileValid(text) {
		if (text.length === 10) {
			return false;
		} else {
			return true;
		}
	}
	const isValidFields = (item) => {
		let cleaned = item.phone ? item.phone.replace(/\D/g, "") : "";
		if (!item.contactName) {
			updateContactField(item.id, "isContactName", true);
			updateContactField(item.id, "contactNameMsg", "Please Enter Name");
			return false;
		}
		if (!cleaned) {
			updateContactField(item.id, "isPhone", true);
			updateContactField(item.id, "phoneMsg", MESSAGE.phone);
			return false;
		}
		if (isMobileValid(cleaned)) {
			updateContactField(item.id, "isPhone", true);
			updateContactField(item.id, "phoneMsg", MESSAGE.validatePhone);
			return false;
		}

		return true;
	};
	const addContactRow = (item) => {
		const isValid = isValidFields(item);
		if (!isValid) return;

		setContacts((prev) => [
			...prev,
			{
				id: generateUniqueId(),

				imgAPI: "",
				isImg: false,
				imgMsg: "",
				profileImg: "",
				showPictureOption: false,

				contactName: "",
				contactNameMsg: "",
				isContactName: false,
				contactNamePress: true,

				phone: "",
				phoneNumb: "",
				callingCode: "+1",
				countryCode: "US",
				backPhone: "",
				phoneMsg: "",
				isPhone: false,
				phonePress: true,
			},
		]);
	};
	const updateContactField = (id, field, value) => {
		setContacts((prev) =>
			prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
		);
	};
	const removeContactRow = (id) => {
		setContacts((prev) => prev.filter((item) => item.id !== id));
	};
	const handlePhoneChange = (id, text, backPhone) => {
		let formattedNo = formatMobileNumber(
			text,
			text.length === 1 ? "write" : backPhone
		);
		setContacts((prev) =>
			prev.map((item) =>
				item.id === id
					? {
							...item,
							phone: formattedNo,
							phoneNumb: text,
							isPhone: false,
					  }
					: item
			)
		);
	};
	const openGalleryManager = (id) => {
		updateContactField(id, "showPictureOption", false);

		ImagePicker.openPicker({
			width: 400,
			height: 400,
			cropping: false,
			mediaType: "photo",
		})
			.then(async (image) => {
				const allowedMimeTypes = [
					"image/jpeg",
					"image/jpg",
					"image/png",
					"image/svg+xml",
				];

				if (!allowedMimeTypes.includes(image.mime)) {
					updateContactField(id, "isImg", true);
					updateContactField(
						id,
						"imgMsg",
						"Please select a jpg, jpeg, png, or svg image."
					);
					return;
				}

				const resizedImage = await ImageResizer.createResizedImage(
					image.path,
					800,
					800,
					"JPEG",
					80,
					0
				);

				const fileInfo = await stat(resizedImage.path);
				if (fileInfo.size > MAX_FILE_SIZE_BYTES) {
					updateContactField(id, "isImg", true);
					updateContactField(id, "imgMsg", MESSAGE.maxImageSize);
					return;
				}

				const fileExt = resizedImage.uri.split(".").pop();
				const currentTimestamp = Date.now();
				const imgAPI = {
					size: fileInfo.size,
					type: "image/jpeg",
					uri: resizedImage.uri,
					name: `${currentTimestamp}.${fileExt}`,
				};

				updateContactField(id, "imgAPI", imgAPI);
				updateContactField(id, "profileImg", resizedImage.uri);
				updateContactField(id, "isImg", false);
			})
			.catch((error) => {
				console.warn("Gallery picker error:", error);
			});
	};
	const openCameraPicker = (id) => {
		updateContactField(id, "showPictureOption", false);

		ImagePicker.openCamera({
			width: 400,
			height: 400,
			cropping: false,
		})
			.then(async (image) => {
				const resizedImage = await ImageResizer.createResizedImage(
					image.path,
					800,
					800,
					"JPEG",
					80,
					0
				);
				const fileInfo = await stat(resizedImage.path);

				if (fileInfo.size > MAX_FILE_SIZE_BYTES) {
					updateContactField(id, "isImg", true);
					updateContactField(id, "imgMsg", MESSAGE.maxImageSize);
					return;
				}

				const fileExt = resizedImage.uri.split(".").pop();
				const currentTimestamp = Date.now();
				const imgAPI = {
					size: resizedImage.size,
					type: resizedImage.mime || "image/jpeg",
					uri: resizedImage.uri,
					name: `${currentTimestamp}.${fileExt}`,
				};

				updateContactField(id, "imgAPI", imgAPI);
				updateContactField(id, "profileImg", resizedImage.uri);
				updateContactField(id, "isImg", false);
			})
			.catch((error) => {
				console.warn("Image picker error:", error);
			});
	};
	const removeProfileImg = (id) => {
		updateContactField(id, "imgAPI", "");
		updateContactField(id, "profileImg", "");
		updateContactField(id, "isImg", false);
		updateContactField(id, "imgMsg", "");
	};
	const PictureOptions = ({ onCamera, onGallery }) => (
		<View style={styles.pictureOption}>
			<View style={styles.tiangle}>
				<Icons
					iconSetName={"MaterialDesignIcons"}
					iconName={"triangle"}
					iconColor={Colors.primary}
					iconSize={10}
				/>
			</View>
			<View style={styles.optionBox}>
				<TouchableOpacity onPress={onCamera}>
					<Icons
						iconSetName={"Ionicons"}
						iconName={"camera"}
						iconColor={Colors.white}
						iconSize={20}
					/>
				</TouchableOpacity>
				<TouchableOpacity onPress={onGallery}>
					<Icons
						iconSetName={"MaterialIcons"}
						iconName={"photo"}
						iconColor={Colors.white}
						iconSize={20}
					/>
				</TouchableOpacity>
			</View>
		</View>
	);
	const onChangeName = (text, id) => {
		updateContactField(id, "contactName", isValidteSpacialChar(text));
		updateContactField(id, "isContactName", false);
		updateContactField(id, "contactNameMsg", "");
	};
	const clearAllFields = () => {
		setContacts([
			{
				id: generateUniqueId(),
				imgAPI: "",
				isImg: false,
				imgMsg: "",
				profileImg: "",
				showPictureOption: false,
				contactName: "",
				contactNameMsg: "",
				isContactName: false,
				contactNamePress: true,
				phone: "",
				phoneNumb: "",
				callingCode: "+1",
				countryCode: "US",
				backPhone: "",
				phoneMsg: "",
				isPhone: false,
				phonePress: true,
			},
		]);
	};
	const onPressAddContact = () => {
		let isAllValid = true;
		contacts.forEach((contact) => {
			const isValid = isValidFields(contact);
			if (!isValid) isAllValid = false;
		});
		if (!isAllValid) return;

		setIsConfirmByManual(true);
		setShowConfirmPopup(true);
		getContacts(contacts);
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
				backgroundStyle={styles.backgroundStyle}
			>
				<View style={styles.mainFlex}>
					<View style={styles.header}>
						<View style={[styles.rowBetween, { width: "100%" }]}>
							<Text style={styles.text}>{"Add New Contact"}</Text>
							<TouchableOpacity
								onPress={() => {
									clearAllFields();
									handleclosePanel();
								}}
								style={styles.closePanelBtn}
							>
								<Icons
									iconSetName={"MaterialCommunityIcons"}
									iconName={"close"}
									iconColor={Colors.iconBlack}
									iconSize={20}
								/>
							</TouchableOpacity>
						</View>
					</View>
					<View style={[styles.div, { marginHorizontal: 20 }]} />
					<BottomSheetScrollView
						style={styles.mainFlex}
						contentContainerStyle={styles.scrollContainer}
						showsVerticalScrollIndicator={false}
					>
						{contacts.map((item, index) => {
							const isLastItem = index === contacts.length - 1;
							return (
								<View
									key={item.id}
									style={[styles.contactBox, { ...LayoutStyle.marginBottom20 }]}
								>
									<View
										style={[
											styles.actionBtnRow,
											{ right: !isLastItem ? -5 : 10 },
										]}
									>
										{contacts.length !== 1 && (
											<TouchableOpacity
												style={styles.cancelBtn}
												onPress={() => removeContactRow(item.id)}
											>
												<Icons
													iconSetName={"Ionicons"}
													iconName={"close"}
													iconColor={Colors.white}
													iconSize={12}
												/>
											</TouchableOpacity>
										)}
										{isLastItem && (
											<TouchableOpacity
												style={[styles.addBtn]}
												onPress={() => addContactRow(item)}
											>
												<Icons
													iconSetName={"MaterialDesignIcons"}
													iconName={"plus"}
													iconColor={Colors.white}
													iconSize={12}
												/>
											</TouchableOpacity>
										)}
									</View>
									<View style={{ ...CommonStyles.directionRowCenter }}>
										{item?.profileImg ? (
											<TouchableOpacity
												onPress={() => removeProfileImg(item.id)}
											>
												<Image
													source={{ uri: item.profileImg }}
													style={[
														styles.profileImg,
														{
															marginBottom:
																item.isImg || item.isContactName ? 37 : 15,
														},
													]}
												/>
												<TouchableOpacity
													onPress={() => removeProfileImg(item.id)}
													style={styles.profileCancel}
												>
													<Icons
														iconColor={Colors.iconWhite}
														iconName={"close"}
														iconSetName={"Ionicons"}
														iconSize={10}
													/>
												</TouchableOpacity>
											</TouchableOpacity>
										) : (
											<View>
												<TouchableOpacity
													style={[
														styles.addProfileImg,
														{
															marginBottom:
																item.isImg || item.isContactName ? 37 : 15,
														},
													]}
													onPress={() =>
														updateContactField(
															item.id,
															"showPictureOption",
															!item.showPictureOption
														)
													}
												>
													<Icons
														iconSetName={"Ionicons"}
														iconName={"person-add-sharp"}
														iconColor={Colors.white}
														iconSize={18}
													/>
												</TouchableOpacity>
												{item.showPictureOption && (
													<PictureOptions
														onCamera={() => openCameraPicker(item.id)}
														onGallery={() => openGalleryManager(item.id)}
													/>
												)}
											</View>
										)}
										<View style={styles.mainFlex}>
											<Input
												isDarkBG={false}
												value={item.contactName}
												placeholder={"Full Name"}
												maxLength={30}
												onChangeText={(text) => onChangeName(text, item.id)}
												iconName={"person-sharp"}
												iconSetName={"Ionicons"}
												isValidationShow={item.isContactName || item.isImg}
												validationMessage={item.contactNameMsg || item.imgMsg}
												keyboardType={"default"}
												returnKeyType={"done"}
												blurOnSubmit={true}
												onFocus={() =>
													updateContactField(item.id, "contactNamePress", true)
												}
												onBlur={() =>
													updateContactField(item.id, "contactNamePress", false)
												}
												isPressOut={item.contactNamePress}
												onPressFocus={() =>
													updateContactField(item.id, "contactNamePress", true)
												}
												inputMainStyle={{ ...LayoutStyle.marginBottom20 }}
											/>
										</View>
									</View>
									<View style={{ ...CommonStyles.directionRowCenter }}>
										<CountryPicker
											countryCode={item.countryCode}
											withCallingCode
											withFilter
											withFlag
											onSelect={(country) => {
												updateContactField(
													item.id,
													"countryCode",
													country.cca2
												);
												updateContactField(
													item.id,
													"callingCode",
													`+${country.callingCode[0]}`
												);
											}}
											containerButtonStyle={{
												justifyContent: "center",
												alignItems: "center",
												marginVertical: item.isPhone ? 40 : 0,
											}}
											preferredCountries={["US"]}
											countryCodes={countryCodes}
											withAlphaFilter={false}
											closeButtonImageStyle={AccountStyle.countryClose}
										/>
										<View style={styles.mainFlex}>
											<Input
												isDarkBG={false}
												value={item.phone ? item.phone : ""}
												placeholder={"Cell Phone"}
												maxLength={14}
												onKeyPress={(e) =>
													updateContactField(
														item.id,
														"backPhone",
														e.nativeEvent.key === "Backspace"
															? "backspace"
															: "write"
													)
												}
												onChangeText={(text) =>
													handlePhoneChange(item.id, text, item.backPhone)
												}
												iconName={"cellphone-dock"}
												iconSetName={"MaterialCommunityIcons"}
												isValidationShow={item.isPhone}
												validationMessage={item.phoneMsg}
												keyboardType={"phone-pad"}
												returnKeyType={"done"}
												blurOnSubmit={true}
												onFocus={() =>
													updateContactField(item.id, "phonePress", true)
												}
												onBlur={() =>
													updateContactField(item.id, "phonePress", false)
												}
												isPressOut={item.phonePress}
												onPressFocus={() =>
													updateContactField(item.id, "phonePress", true)
												}
												inputMainStyle={{}}
											/>
										</View>
									</View>
								</View>
							);
						})}
						<Button
							onPress={() => onPressAddContact()}
							isBtnActive={true}
							btnName={"Add Trusted Contact"}
							btnColor={Colors.secondary}
							btnLabelColor={Colors.white}
						/>
					</BottomSheetScrollView>
				</View>
			</BottomSheetModal>
		</BottomSheetModalProvider>
	);
};

const styles = StyleSheet.create({
	mainFlex: {
		flex: 1,
	},
	header: {
		marginHorizontal: 20,
		paddingTop: Platform.OS === "ios" ? 20 : 0,
	},
	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	text: {
		fontSize: 14,
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsSemiBold,
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
		height: 1,
		borderColor: "#EFEFEF",
		borderWidth: 0.7,
		borderRadius: 5,
		marginVertical: 15,
	},
	titleTxt: {
		fontSize: 14,
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsSemiBold,
		lineHeight: 20,
	},
	desTxt: {
		color: Colors.labelDarkGray,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.fontSize12,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
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
	scrollContainer: {
		flexGrow: 1,
		flexDirection: "column",
		justifyContent: "space-between",
		...LayoutStyle.padding20,
	},
	contactBox: {
		borderWidth: 1,
		borderColor: Colors.inputBorderDark,
		paddingHorizontal: 10,
		paddingTop: 20,
		paddingBottom: 12,
		borderRadius: 7,
	},
	actionBtnRow: {
		flexDirection: "row",
		alignItems: "center",
		position: "absolute",
		top: -10,
		right: 10,
	},
	cancelBtn: {
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.errorBoxRed,
		height: 25,
		width: 25,
		borderRadius: 12.5,
	},
	addBtn: {
		justifyContent: "center",
		alignItems: "center",
		height: 25,
		width: 25,
		borderRadius: 12.5,
		marginLeft: 5,
		backgroundColor: Colors.secondary,
	},
	profileImg: {
		height: 30,
		width: 30,
		borderRadius: 15,
		marginRight: 10,
		marginBottom: 12,
	},
	addProfileImg: {
		height: 30,
		width: 30,
		borderRadius: 15,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.primary,
		...LayoutStyle.marginRight10,
		marginBottom: 15,
	},
	pictureOption: {
		backgroundColor: Colors.primary,
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: 5,
		position: "absolute",
		top: 35,
		left: -5,
		zIndex: 999,
	},
	tiangle: {
		position: "absolute",
		bottom: 25,
		left: 14,
	},
	optionBox: {
		...CommonStyles.directionRowCenter,
		justifyContent: "space-between",
		width: 55,
	},
	editProfileContainer: {
		height: 30,
		width: 30,
		backgroundColor: "#00000022",
		borderRadius: 15,
		justifyContent: "center",
		alignItems: "center",
	},
	profileCancel: {
		backgroundColor: Colors.errorBoxRed,
		justifyContent: "center",
		alignItems: "center",
		height: 10,
		width: 10,
		borderRadius: 5,
		position: "absolute",
		right: 10,
	},
});
