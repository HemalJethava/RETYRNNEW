import {
	View,
	KeyboardAvoidingView,
	ImageBackground,
	ScrollView,
	Text,
	TouchableOpacity,
	Platform,
	TouchableWithoutFeedback,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ImagePicker from "react-native-image-crop-picker";
import {
	BottomSheet,
	Button,
	DarkHeader,
	Icons,
	Input,
	Loader,
	ValidationText,
} from "../../components";
import {
	formatMobileNumber,
	formatedMobileNumb,
	isEmpty,
	isMobileValidate,
	isValidteSpacialCharNumb,
} from "../../utils/Validation";
import CommonStyles from "../../styles/CommonStyles";
import LayoutStyle from "../../styles/LayoutStyle";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";
import { heightPercentageToDP as hp } from "../../styles/ResponsiveScreens";
import {
	updateProfileRequest,
	sendOTPWithTokenRequest,
	removeProfileRequest,
} from "./redux/Action";
import MESSAGE from "../../utils/Messages";
import { showMessage } from "react-native-flash-message";
import CountryPicker from "react-native-country-picker-modal";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
	countryCodes,
	MAX_FILE_SIZE_BYTES,
} from "../../config/CommonFunctions";
import ImageResizer from "react-native-image-resizer";
import { stat } from "react-native-fs";

const EditProfileScreen = (props) => {
	const dispatch = useDispatch();

	const userData = useSelector((state) => state.Auth.userData);
	const isOtpVerify = useSelector((state) => state.Account || null);
	const isLoading = useSelector((state) => state.Account.isLoading);
	const sendOTPerror = useSelector((state) => state.Account.sendOTPerror);

	const [name, setName] = useState(userData?.name);
	const [nameMsg, setNameMsg] = useState("");
	const [isName, setIsName] = useState(false);
	const [namePress, setNamePress] = useState(userData?.name ? false : true);

	const [email, setEmail] = useState(userData?.email);
	const [emailMsg, setEmailMsg] = useState("");
	const [isEmail, setIsEmail] = useState(false);
	const [emailPress, setEmailPress] = useState(userData?.email ? false : true);

	const [callingCode, setCallingCode] = useState("");
	const [countryCode, setCountryCode] = useState("");

	const [phone, setPhone] = useState(
		formatedMobileNumb(userData?.mobile ? userData?.mobile.split(" ")[1] : "")
	);
	const [phoneNumb, setPhoneNumb] = useState(
		userData?.mobile ? userData?.mobile.split(" ")[1] : ""
	);
	const [phoneMsg, setPhoneMsg] = useState("");
	const [isPhone, setIsPhone] = useState(false);
	const [phonePress, setPhonePress] = useState(userData?.mobile ? false : true);
	const [backPhone, setBackPhone] = useState("");
	const [isValidatedPhone, setIsValidatePhone] = useState(true);

	const [passwd, setPasswd] = useState("");
	const [passwdMsg, setPasswdMsg] = useState("");
	const [ispasswd, setIsPasswd] = useState(false);
	const [passwdPress, setPasswdPress] = useState(true);
	const [isValidatPasswd, setIsValidatePasswd] = useState(false);
	const [isDisplayPassword, setIsDisplayPassword] = useState(false);

	const [isModal, setIsModal] = useState(false);

	const [imgAPI, setImgApi] = useState("");
	const [isImg, setIsImg] = useState(false);
	const [imgMsg, setImgMsg] = useState("");
	const [profileImg, setProfileImg] = useState("");

	const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);
	const [failedCriteria, setFailedCriteria] = useState([]);
	const [bottomOffset, setBottomOffset] = useState(45);
	const [criteriaMet, setCriteriaMet] = useState({
		length: false,
		uppercase: false,
		lowercase: false,
		number: false,
		specialChar: false,
	});

	useEffect(() => {
		if (userData) {
			getCodes();
		}
	}, [userData]);

	useEffect(() => {
		if (failedCriteria.length === 5) {
			setBottomOffset(95);
		} else if (failedCriteria.length === 4) {
			setBottomOffset(83);
		} else if (failedCriteria.length === 3) {
			setBottomOffset(83);
		} else if (failedCriteria.length === 2) {
			setBottomOffset(83);
		} else if (failedCriteria.length === 1) {
			setBottomOffset(68);
		} else {
			setBottomOffset(ispasswd ? 68 : 45);
		}
	}, [failedCriteria]);

	useEffect(() => {
		if (isOtpVerify.verify2FA) {
			setIsValidatePhone(true);
			setIsValidatePasswd(true);
		}
	}, [isOtpVerify]);

	useEffect(() => {
		(async () => {
			if (sendOTPerror?.mobile != undefined) {
				setIsPhone(true);
				setPhoneMsg(sendOTPerror.mobile);
			} else {
			}
		})();
	}, [sendOTPerror]);

	const getCodes = async () => {
		try {
			const mobileNumber = userData?.mobile || "";
			const codePart = mobileNumber.split(" ")[0];
			const phoneNumber = parsePhoneNumberFromString(mobileNumber);

			if (phoneNumber) {
				setCallingCode(codePart);
				setCountryCode(phoneNumber.country ? phoneNumber.country : "US");
			}
		} catch (e) {
			console.warn("Error parsing phone number:", e);
		} finally {
		}
	};
	const gotoBack = () => {
		props.navigation.goBack();
	};
	const onChangeName = (text) => {
		let validateInput = isValidteSpacialCharNumb(text);
		setName(validateInput);
		setIsName(false);
	};
	const onChangeEmail = (text) => {
		let cleanedText = text.replace(/[^a-zA-Z0-9@._-]/g, "");
		const atCount = (cleanedText.match(/@/g) || []).length;
		if (atCount > 1) {
			const [localPart, domainPart] = cleanedText.split("@");
			cleanedText = `${localPart}@${domainPart}`;
		}
		setEmail(cleanedText);
		setIsEmail(false);
	};
	const onSelectCountry = (country) => {
		setCountryCode(country.cca2);
		setCallingCode(`+${country.callingCode[0]}`);
	};
	const onChangePhone = (text) => {
		setPhoneNumb(text);
		let formatedNo = formatMobileNumber(text, backPhone);
		setPhone(formatedNo);
		setIsPhone(false);
		setIsValidatePhone(false);
	};
	const onChangePasswd = (text) => {
		// setIsValidatePasswd(false);
		setPasswd(text);
		setIsPasswd(false);

		const newCriteria = {
			length: text.length >= 8,
			uppercase: /[A-Z]/.test(text),
			lowercase: /[a-z]/.test(text),
			number: /[0-9]/.test(text),
			specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(text),
		};

		setCriteriaMet(newCriteria);
	};
	const validateProfileFields = () => {
		const cleaned = phoneNumb.replace(/\D/g, "");
		let errors = {
			name: "",
			phone: "",
			password: "",
		};
		if (isEmpty(name)) {
			errors.name = MESSAGE.fullName;
		}

		if (cleaned !== userData?.mobile && !isOtpVerify.verify2FA) {
			errors.phone = MESSAGE.verify2FA;
		}
		let passwordErrors = [];
		if (!criteriaMet.length) {
			passwordErrors.push("at least 8 characters");
		} else {
			if (!criteriaMet.uppercase)
				passwordErrors.push("at least 1 uppercase letter");
			if (!criteriaMet.lowercase)
				passwordErrors.push("at least 1 lowercase letter");
			if (!criteriaMet.number) passwordErrors.push("at least 1 number");
			if (!criteriaMet.specialChar)
				passwordErrors.push("at least 1 special character");
		}
		if (passwordErrors.length > 0) {
			errors.password = `Password should be ${passwordErrors.join(", ")}`;
		}
		return {
			isValid: !errors.name && !errors.phone && !errors.password,
			errors,
			cleaned,
		};
	};
	const onRequestSaveDeatils = () => {
		const { isValid, errors, cleaned } = validateProfileFields();

		// Show validation messages
		setIsName(!!errors.name);
		setNameMsg(errors.name);

		setIsPhone(!!errors.phone);
		setPhoneMsg(errors.phone);

		setIsPasswd(!!errors.password);
		setPasswdMsg(errors.password);

		if (!isValid) return;

		// Prepare form data
		const formData = new FormData();
		formData.append("full_name", name);
		formData.append("mobile", `${callingCode} ${cleaned}`);
		formData.append("password", passwd || "");
		if (imgAPI) {
			formData.append("photo", imgAPI);
		}

		dispatch(updateProfileRequest(formData, props.navigation));
	};
	const gotoVerifyAccount = () => {
		setIsPasswd(false);
		setIsPhone(false);
		let cleaned = phoneNumb.replace(/\D/g, "");
		if (cleaned != userData?.mobile || passwd != "") {
			if (cleaned != userData?.mobile) {
				if (isEmpty(cleaned)) {
					setIsValidatePhone(false);
					setIsPhone(true);
					setPhoneMsg(MESSAGE.phone);
					return false;
				}
				if (isMobileValidate(cleaned)) {
					setIsValidatePhone(false);
					setIsPhone(true);
					setPhoneMsg(MESSAGE.validatePhone);
					return false;
				}
			}
			const params = {
				mobile: `${callingCode} ${cleaned}`,
				email: userData?.email,
			};
			dispatch(sendOTPWithTokenRequest(params, props.navigation));
		}
	};
	const onRequestClose = () => {
		setIsModal(false);
	};
	const openGalleryManager = () => {
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
					setIsImg(true);
					setImgMsg("Please select a jpg, jpeg, png, or svg image.");
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
					showMessage({
						message: MESSAGE.maxImageSize,
						type: "danger",
						icon: "auto",
						duration: 3000,
						floating: true,
						statusBarHeight: 40,
					});
					return false;
				}

				const fileExt = resizedImage.uri.split(".").pop();
				const currentTimestamp = Date.now();
				const imgAPI = {
					size: fileInfo.size,
					type: "image/jpeg",
					uri: resizedImage.uri,
					name: `${currentTimestamp}.${fileExt}`,
				};

				setImgApi(imgAPI);
				setProfileImg(resizedImage.uri);
				onRequestClose();
				setImgMsg("");
			})
			.catch((error) => {
				console.warn(error);
			});
	};
	const openCameraPicker = () => {
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
					showMessage({
						message: MESSAGE.maxImageSize,
						type: "danger",
						icon: "auto",
						duration: 3000,
						floating: true,
						statusBarHeight: 40,
					});
					return false;
				}

				const fileExt = resizedImage.uri.split(".").pop();
				const currentTimestamp = Date.now();
				const imgAPI = {
					size: resizedImage.size,
					type: resizedImage.mime || "image/jpeg",
					uri: resizedImage.uri,
					name: currentTimestamp + "." + fileExt,
				};
				setImgApi(imgAPI);
				setProfileImg(resizedImage.uri);
				onRequestClose();
			})
			.catch((error) => {
				setIsModal(false);
				console.warn("error: ", error);
			});
	};
	const removeProfileImg = () => {
		if (userData?.photo_path != "") {
			dispatch(removeProfileRequest(null, props.navigation));
		} else {
			// showMessage({
			// 	message: MESSAGE.profileNotSet,
			// 	type: "danger",
			// 	floating: true,
			// 	statusBarHeight: 40,
			// 	icon: "auto",
			// 	autoHide: true,
			// })

			setImgApi("");
			setIsImg(false);
			setImgMsg("");
			setProfileImg("");
		}
		onRequestClose();
	};
	const CriteriaRow = ({ text, isValid }) => {
		return (
			<View style={[CommonStyles.directionRowCenter]}>
				<Icons
					iconSetName={"Ionicons"}
					iconName={
						isValid ? "checkmark-circle-outline" : "close-circle-outline"
					}
					iconColor={isValid ? "green" : Colors.red}
					iconSize={12}
				/>
				<Text
					style={[
						CommonStyles.criteriaTxt,
						{ color: isValid ? "green" : Colors.red },
					]}
				>
					{text}
				</Text>
			</View>
		);
	};

	return (
		<View style={{ flex: 1 }}>
			<Loader show={isLoading} />
			<TouchableWithoutFeedback
				onPress={() => {
					setShowPasswordCriteria(false);
				}}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					style={[AccountStyle.mainContainer]}
				>
					<DarkHeader
						iconName={"angle-left"}
						iconSetName={"FontAwesome6"}
						iconColor={Colors.backArrowWhite}
						iconSize={24}
						whiteLabel={"Edit"}
						grayLabel={"Profile"}
						onPress={() => gotoBack()}
					/>
					<ScrollView showsVerticalScrollIndicator={false}>
						<View style={[AccountStyle.mainContainer]}>
							<View
								style={[
									AccountStyle.backgroundDarkBlue,
									AccountStyle.editProfileMainForm,
								]}
							>
								<View style={[AccountStyle.editProfileCenter]}>
									<View style={[AccountStyle.editProfileBorder]}>
										<ImageBackground
											source={{
												uri: profileImg
													? profileImg
													: userData?.photo_path
													? userData?.photo_path
													: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
											}}
											style={{
												height: 80,
												width: 80,
											}}
											borderRadius={45}
										>
											<TouchableOpacity
												onPress={() => {
													setIsModal(true);
												}}
												style={[AccountStyle.editProfileContainer]}
											>
												<Icons
													iconColor={Colors.iconWhite}
													iconName={"minus-circle-outline"}
													iconSetName={"MaterialCommunityIcons"}
													iconSize={20}
												/>
											</TouchableOpacity>
										</ImageBackground>
									</View>
									<ValidationText
										isValidationShow={isImg}
										validationMessage={imgMsg}
									/>
								</View>
								<View style={[CommonStyles.mainPaddingH]}>
									<Input
										isDarkBG={true}
										value={name}
										placeholder={"Full Name"}
										maxLength={20}
										onChangeText={(text) => onChangeName(text)}
										iconName={"account-outline"}
										iconSetName={"MaterialCommunityIcons"}
										isValidationShow={isName}
										validationMessage={nameMsg}
										keyboardType={"default"}
										returnKeyType={"done"}
										blurOnSubmit={true}
										onFocus={() => setNamePress(true)}
										onBlur={() => setNamePress(false)}
										isPressOut={namePress}
										onPressFocus={() => setNamePress(true)}
										inputMainStyle={{ ...LayoutStyle.marginTop20 }}
									/>
									<Input
										isDarkBG={true}
										value={email}
										placeholder={"Email"}
										onChangeText={(text) => onChangeEmail(text)}
										iconName={"email-outline"}
										iconSetName={"MaterialCommunityIcons"}
										isValidationShow={isEmail}
										validationMessage={emailMsg}
										keyboardType={"default"}
										returnKeyType={"done"}
										blurOnSubmit={true}
										onFocus={() => setEmailPress(true)}
										onBlur={() => setEmailPress(false)}
										isPressOut={emailPress}
										onPressFocus={() => setEmailPress(true)}
										inputMainStyle={{ ...LayoutStyle.marginVertical20 }}
										disabledBtn={true}
									/>
									<View
										style={{
											flexDirection: "row",
											alignItems: "center",
											width: "100%",
										}}
									>
										<CountryPicker
											countryCode={countryCode}
											withCallingCode
											withFilter
											withFlag
											onSelect={onSelectCountry}
											containerButtonStyle={{
												flex: 1,
												marginVertical: 20,
												justifyContent: "center",
												alignItems: "center",
												bottom: isPhone ? 10 : 0,
											}}
											preferredCountries={["US"]}
											countryCodes={countryCodes}
											withAlphaFilter={false}
											closeButtonImageStyle={AccountStyle.countryClose}
										/>
										<View style={{ flex: 1 }}>
											<Input
												isDarkBG={true}
												value={phone}
												placeholder={"Cell Phone"}
												maxLength={14}
												onKeyPress={(e) => {
													e.nativeEvent.key === "Backspace"
														? setBackPhone("backspace")
														: setBackPhone("write");
												}}
												onChangeText={(text) => onChangePhone(text)}
												iconName={"cellphone-dock"}
												iconSetName={"MaterialCommunityIcons"}
												isRightIcon={true} //Active de-active icon
												rightIconSetName={"MaterialCommunityIcons"}
												rightIconColor={
													isValidatedPhone ? Colors.success : Colors.danger
												}
												rightIconName={
													isValidatedPhone
														? "check-circle-outline"
														: "close-circle-outline"
												}
												isValidationShow={isPhone}
												validationMessage={phoneMsg}
												keyboardType={"numeric"}
												returnKeyType={"done"}
												blurOnSubmit={true}
												onFocus={() => setPhonePress(true)}
												onBlur={() => setPhonePress(false)}
												isPressOut={phonePress}
												onPressFocus={() => setPhonePress(true)}
												inputMainStyle={{ ...LayoutStyle.marginBottom20 }}
											/>
										</View>
									</View>
									<TouchableOpacity
										style={{
											marginBottom: passwdPress ? 0 : hp(2.5),
										}}
										onPress={() => gotoVerifyAccount()}
									>
										<Text style={[AccountStyle.verificationText]}>
											{"Send OTP Verification"}
										</Text>
									</TouchableOpacity>
									{showPasswordCriteria && (
										<View
											style={[
												CommonStyles.criteriaContainer,
												{
													bottom: ispasswd ? bottomOffset : 45,
												},
											]}
										>
											<View style={[CommonStyles.criteriaBox]}>
												<Text style={[CommonStyles.criteriaTitle]}>
													{"Password Requirements"}
												</Text>
												<CriteriaRow
													text={"8 to 12 characters"}
													isValid={criteriaMet.length}
												/>
												<CriteriaRow
													text={"Atleast 1 uppercase letter"}
													isValid={criteriaMet.uppercase}
												/>
												<CriteriaRow
													text={"Atleast 1 lowercase letter"}
													isValid={criteriaMet.lowercase}
												/>
												<CriteriaRow
													text={"Atleast 1 number"}
													isValid={criteriaMet.number}
												/>
												<CriteriaRow
													text={"Atleast 1 special character"}
													isValid={criteriaMet.specialChar}
												/>
											</View>
											<View
												style={{
													width: "100%",
													alignItems: "flex-start",
													bottom: 10,
													right: passwdPress ? -8 : -24,
												}}
											>
												<View
													style={{
														transform: [{ rotateZ: "90deg" }],
													}}
												>
													<Icons
														iconSetName={"AntDesign"}
														iconName={"caretright"}
														iconColor={Colors.white}
														iconSize={20}
													/>
												</View>
											</View>
										</View>
									)}
									<Input
										isDarkBG={true}
										value={passwd}
										placeholder={"Password"}
										maxLength={12}
										secureTextEntry={!isDisplayPassword}
										onChangeText={(text) => {
											setShowPasswordCriteria(true);
											onChangePasswd(text);
										}}
										iconName={"lock-outline"}
										iconSetName={"MaterialCommunityIcons"}
										isRightIcon={true}
										rightIconSetName={"MaterialCommunityIcons"}
										rightIconColor={Colors.secondary}
										rightIconName={isDisplayPassword ? "eye-off" : "eye"}
										onPressRightIcon={() =>
											setIsDisplayPassword(!isDisplayPassword)
										}
										isValidationShow={ispasswd}
										validationMessage={passwdMsg}
										keyboardType={"default"}
										returnKeyType={"done"}
										blurOnSubmit={true}
										onFocus={() => {
											setShowPasswordCriteria(true);
											setPasswdPress(true);
										}}
										onBlur={() => {
											setShowPasswordCriteria(false);
											setPasswdPress(false);
										}}
										isPressOut={passwdPress}
										onPressFocus={() => {
											setShowPasswordCriteria(true);
											setPasswdPress(true);
										}}
										inputMainStyle={{
											...LayoutStyle.marginBottom20,
											zIndex: 9,
										}}
									/>
								</View>
							</View>
							<View
								style={[
									CommonStyles.directionRowSB,
									LayoutStyle.paddingTop30,
									LayoutStyle.paddingHorizontal20,
								]}
							>
								<View style={{ width: "49%" }}>
									<Button
										onPress={() => props.navigation.navigate("ProfileDetail")}
										isBtnActive={true}
										btnName={"Profile Details"}
										btnColor={Colors.primary}
										btnLabelColor={Colors.white}
									/>
								</View>
								<View style={{ width: "49%" }}>
									<Button
										onPress={() => onRequestSaveDeatils()}
										isBtnActive={true}
										btnName={"Save"}
										btnColor={Colors.secondary}
										btnLabelColor={Colors.white}
									/>
								</View>
							</View>
						</View>
					</ScrollView>
					<BottomSheet
						visible={isModal}
						isCameraOption={true}
						isGalleryOption={true}
						isFileOption={false}
						isRemoveImgOption={
							profileImg || userData?.photo_path ? true : false
						}
						onRemoveImgPress={() => removeProfileImg()}
						onCameraPress={() => openCameraPicker()}
						onGalleryPress={() => openGalleryManager()}
						onModalClose={() => onRequestClose()}
						onRequestClose={() => onRequestClose()}
					/>
				</KeyboardAvoidingView>
			</TouchableWithoutFeedback>
		</View>
	);
};

export default EditProfileScreen;
