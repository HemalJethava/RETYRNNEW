import React, { useState } from "react";
import {
	View,
	Text,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	ImageBackground,
	TouchableOpacity,
} from "react-native";
import {
	AddImagePicker,
	Button,
	Icons,
	Input,
	LightHeader,
	Loader,
	ValidationText,
} from "../../components";
import CommonStyles from "../../styles/CommonStyles";
import Colors from "../../styles/Colors";
import {
	formatMobileNumber,
	isEmailValidate,
	isEmpty,
	isValidteSpacialCharNumb,
} from "../../utils/Validation";
import CountryPicker from "react-native-country-picker-modal";
import LayoutStyle from "../../styles/LayoutStyle";
import AccountStyle from "../../styles/AccountStyle";
import ContactStyle from "../../styles/ContactStyle";
import MESSAGE from "../../utils/Messages";
import { pick } from "@react-native-documents/picker";
import { launchImageLibrary } from "react-native-image-picker";
import { showMessage } from "react-native-flash-message";
import { BASE_URL } from "../../config/BaseUrl";
import {
	countryCodes,
	MAX_FILE_SIZE_BYTES,
	removeEmojis,
} from "../../config/CommonFunctions";
import ImageResizer from "react-native-image-resizer";
import { stat } from "react-native-fs";

const ContactAdminScreen = (props) => {
	const [isLoading, setIsLoading] = useState(false);

	const [fullName, setFullName] = useState("");
	const [fullNameMsg, setFullNameMsg] = useState("");
	const [isFullName, setIsFullName] = useState(false);
	const [fullNamePress, setFullNamePress] = useState(true);

	const [email, setEmail] = useState("");
	const [emailMsg, setEmailMsg] = useState("");
	const [isEmail, setIsEmail] = useState(false);
	const [emailPress, setEmailPress] = useState(true);

	const [countryCode, setCountryCode] = useState("US");
	const [callingCode, setCallingCode] = useState("+1");
	const [phone, setPhone] = useState("");
	const [phoneNumb, setPhoneNumb] = useState("");
	const [phoneMsg, setPhoneMsg] = useState("");
	const [isPhone, setIsPhone] = useState(false);
	const [phonePress, setPhonePress] = useState(true);
	const [backPhone, setBackPhone] = useState("");

	const [title, setTitle] = useState("");
	const [titleMsg, setTitleMsg] = useState("");
	const [isTitle, setIsTitle] = useState(false);
	const [titlePress, setTitlePress] = useState(true);

	const [description, setDescription] = useState("");
	const [descriptionMsg, setDescriptionMsg] = useState("");
	const [isDescription, setIsDescription] = useState(false);
	const [descriptionPress, setDescriptionPress] = useState(true);

	const [isDocumentPDF, setIsDocumentPDF] = useState(false);
	const [documentName, setDocumentName] = useState("");
	const [documentAPI, setDocumentAPI] = useState("");
	const [isDocValid, setIsDocValid] = useState("");
	const [isSelectedLayout, setIsSelectedLayout] = useState(false);

	const [images, setImages] = useState([]);
	const [incidentImgAPI, setIncidentImgAPI] = useState("");
	const [isImages, setIsImages] = useState(false);
	const [imagesMsg, setImagesMsg] = useState(false);

	const onChangeFullName = (text) => {
		let validateInput = isValidteSpacialCharNumb(text);
		setFullName(validateInput);
		setIsFullName(false);
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
		let formatedNo = formatMobileNumber(text, backPhone);
		setPhone(formatedNo);
		setPhoneNumb(text);
		setIsPhone(false);
	};
	const onChangeTitle = (text) => {
		let validateInput = isValidteSpacialCharNumb(text);
		setTitle(validateInput);
		setIsTitle(false);
	};
	const onChangeDescription = (text) => {
		const filteredText = removeEmojis(text);
		setDescription(filteredText);
		setIsDescription(false);
	};
	const removeImage = () => {
		setDocumentName("");
		setIsDocumentPDF(false);
	};
	const openFileManager = async () => {
		try {
			const [res] = await pick({
				type:
					Platform.OS === "android"
						? ["application/pdf"]
						: ["public.content", "public.data", "com.adobe.pdf"],
				allowMultiSelection: false,
			});
			if (res.size > MAX_FILE_SIZE_BYTES) {
				showMessage({
					message: `${
						res.name.length > 30 ? res.name.slice(0, 30) + "..." : res.name
					}\n${MESSAGE.maxFileSize}`,
					type: "danger",
					icon: "auto",
					duration: 3000,
					floating: true,
					statusBarHeight: 40,
				});
				return false;
			}

			const documentAPI = {
				size: res.size,
				type: res.type,
				uri: res.uri,
				name: res.name,
			};
			setIsDocValid(false);
			setIsDocumentPDF(true);
			setDocumentName(res.name);
			setDocumentAPI(documentAPI);
		} catch (err) {
			if (err.code === "DOCUMENT_PICKER_CANCELED") {
			} else {
				console.error("Document Picker Error:", err);
			}
		}
	};
	const renderSelectedImg = (imgItems, index) => {
		return (
			<View key={index} style={{}}>
				{imgItems.isImage ? (
					<View>
						<ImageBackground
							style={[ContactStyle.selectImgs, { marginTop: 10 }]}
							source={{ uri: imgItems.uri }}
							borderRadius={12}
						>
							<TouchableOpacity
								onPress={() => deleteIncidentImgs(imgItems, index)}
							>
								<Icons
									iconName={"delete"}
									iconSetName={"MaterialCommunityIcons"}
									iconColor={Colors.red}
									iconSize={12}
									iconMainstyle={[ContactStyle.minusIcon]}
								/>
							</TouchableOpacity>
						</ImageBackground>
					</View>
				) : (
					<View style={[ContactStyle.selectImgs, ContactStyle.uploadImgSmall]}>
						<TouchableOpacity onPress={() => openImagePicker()}>
							<View style={{ alignItems: "center" }}>
								<Icons
									iconName={"plus"}
									iconSetName={"FontAwesome6"}
									iconColor={Colors.secondary}
									iconSize={18}
								/>
								<Text style={[ContactStyle.textGallery]}>
									{"Image Gallery"}
								</Text>
							</View>
						</TouchableOpacity>
					</View>
				)}
			</View>
		);
	};
	const openImagePicker = async () => {
		const allowedMimeTypes = [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/svg+xml",
		];

		await launchImageLibrary({
			mediaType: "photo",
			selectionLimit: 4 - incidentImgAPI.length,
		})
			.then(async (image) => {
				const currentTimestamp = Date.now();
				setIsImages(false);

				if (image && image.assets) {
					const filteredImages = image.assets.filter((img) =>
						allowedMimeTypes.includes(img.type)
					);

					if (filteredImages.length !== image.assets.length) {
						setIsImages(true);
						setImagesMsg("Please select a jpg, jpeg, png, or svg image.");
						return;
					}

					const compressedImages = [];

					for (let i = 0; i < filteredImages.length; i++) {
						try {
							const img = filteredImages[i];
							const resizedImage = await ImageResizer.createResizedImage(
								img.uri,
								800,
								800,
								"JPEG",
								80,
								0
							);

							const fileInfo = await stat(resizedImage.uri);

							if (fileInfo.size <= 10 * 1024 * 1024) {
								compressedImages.push({
									...img,
									uri: resizedImage.uri,
									size: fileInfo.size,
								});
							} else {
								setIsImages(true);
								setImagesMsg(MESSAGE.maxImageSize);
							}
						} catch (error) {
							console.warn("Image resize error:", error);
						}
					}

					if (images.length === 0) {
						const tempImgs = compressedImages;
						if (image) {
							var imgAPI = [];
							var tempImgAPI;
							for (var i = 0; i < tempImgs.length; i++) {
								var fileExt = tempImgs[i].uri.split(".").pop();
								tempImgAPI = {
									size: tempImgs[i].fileSize,
									type: tempImgs[i].type,
									uri: tempImgs[i].uri,
									name: currentTimestamp + [i] + "." + fileExt,
								};
								tempImgs[i]["isImage"] = true;
								imgAPI.push(tempImgAPI);
							}
							setIncidentImgAPI(imgAPI);
							if (tempImgs.length === 4) {
								setImages(tempImgs);
								setIsSelectedLayout(true);
							} else {
								const blankJson = {
									isImage: false,
								};
								tempImgs.push(blankJson);
								setImages(tempImgs);
								setIsSelectedLayout(true);
							}
						}
					} else {
						var newTempImgAPI;
						var newTempImg;
						var newImgAPI = [];
						var newImg = [];
						const newTempImgs = compressedImages;
						const tempMergeImg = [...incidentImgAPI, ...newTempImgs];

						for (var j = 0; j < tempMergeImg.length; j++) {
							var fileExt = tempMergeImg[j].uri.split(".").pop();
							newTempImgAPI = {
								size: tempMergeImg[j].fileSize
									? tempMergeImg[j].fileSize
									: tempMergeImg[j].size,
								type: tempMergeImg[j].type,
								uri: tempMergeImg[j].uri,
								name: currentTimestamp + [j] + "." + fileExt,
							};
							newImgAPI.push(newTempImgAPI);

							newTempImg = {
								size: tempMergeImg[j].fileSize
									? tempMergeImg[j].fileSize
									: tempMergeImg[j].size,
								type: tempMergeImg[j].type,
								uri: tempMergeImg[j].uri,
								name: currentTimestamp + [j] + "." + fileExt,
								isImage: true,
							};
							newImg.push(newTempImg);
						}
						setIncidentImgAPI(newImgAPI);
						if (tempMergeImg.length === 4) {
							setImages(newImg);
						} else {
							const blankJson = {
								isImage: false,
							};
							newImg.push(blankJson);
							setImages(newImg);
						}
					}
				}
			})
			.catch((error) => {
				console.warn("Error selecting images:", error);
			});
	};
	const deleteIncidentImgs = (imgItems, index) => {
		const imgResultAPI = incidentImgAPI.filter((item, i) => {
			return i != index;
		});
		setIncidentImgAPI(imgResultAPI);
		const imgResult = images.filter((item, i) => {
			return i != index;
		});

		if (imgResult.length === 1) {
			setIsSelectedLayout(false);
			setImages([]);
			setIncidentImgAPI("");
		} else {
			if (imgResult[imgResult.length - 1].isImage) {
				const blankJson = {
					isImage: false,
				};
				imgResult.push(blankJson);
			}
			setImages(imgResult);
		}
	};
	function isMobileValid(text) {
		if (text.length === 10) {
			return false;
		} else {
			return true;
		}
	}
	const isValidFields = () => {
		let cleaned = phone.replace(/\D/g, "");

		let isValid = true;
		if (isEmpty(fullName)) {
			setIsFullName(true);
			setFullNameMsg("Please enter full name");
			isValid = false;
		}
		if (isEmpty(email)) {
			setIsEmail(true);
			setEmailMsg(MESSAGE.email);
			isValid = false;
		} else if (!isEmailValidate(email)) {
			setIsEmail(true);
			setEmailMsg(MESSAGE.validateEmail);
			isValid = false;
		}

		if (cleaned && isMobileValid(cleaned)) {
			setIsPhone(true);
			setPhoneMsg(MESSAGE.validatePhone);
			return false;
		}

		if (isEmpty(title)) {
			setIsTitle(true);
			setTitleMsg("Please enter title");
			isValid = false;
		}
		if (isEmpty(description)) {
			setIsDescription(true);
			setDescriptionMsg("Please enter description");
			isValid = false;
		}

		return isValid;
	};
	const cleanPhoneNumb = (input) => {
		const cleaned = input.replace(/\D/g, "");
		return `${callingCode} ${cleaned}`;
	};
	const onPressSubmit = async () => {
		const isValid = isValidFields();
		if (isValid) {
			try {
				setIsLoading(true);

				const phoneWithCode = cleanPhoneNumb(phone);

				const payload = new FormData();

				payload.append("user_name", fullName);
				payload.append("user_email", email);
				payload.append("subject", title);
				payload.append("content", description);

				if (phoneNumb && callingCode) {
					payload.append("user_mobile", phoneWithCode);
				}

				if (documentAPI) {
					payload.append("attachment[]", {
						uri: documentAPI.uri,
						name: documentAPI.name || "document",
						type: documentAPI.type || "application/octet-stream",
						size: documentAPI.size,
					});
				}

				if (incidentImgAPI) {
					incidentImgAPI.forEach((image, index) => {
						const currentTimestamp = Date.now();
						const fileExt = image.uri.split(".").pop();
						payload.append("attachment[]", {
							size: image.size,
							uri: image.uri,
							type: image.type || "image/jpeg",
							name: `${currentTimestamp}_${index}.${fileExt}`,
						});
					});
				}

				const response = await fetch(`${BASE_URL}user/contact-admin`, {
					method: "POST",
					headers: {},
					body: payload,
				});

				const result = await response.json();

				if (result.success) {
					setIsLoading(false);
					showMessage({
						message: result.message,
						type: "success",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
					props.navigation.goBack();
				} else {
					setIsLoading(false);
					showMessage({
						message: result.message ? result.message : "Something went wrong!",
						type: "danger",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				}
			} catch (error) {
				setIsLoading(false);
				console.warn(error);
			}
		}
	};

	return (
		<>
			<Loader show={isLoading} />
			{!isLoading && (
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" && "padding"}
					style={[ContactStyle.mainContainer, ContactStyle.backgroundDarkBlue]}
				>
					<LightHeader
						iconName={"angle-left"}
						iconSetName={"FontAwesome6"}
						iconColor={Colors.iconBlack}
						iconSize={24}
						headerText={"Contact Admin"}
						isBackIcon={true}
						onPress={() => props.navigation.goBack()}
					/>

					<ScrollView showsVerticalScrollIndicator={false}>
						<View style={{ ...CommonStyles.mainPaddingH }}>
							<View style={[ContactStyle.centerModal]}>
								<Text style={[ContactStyle.welcomeLabel]}>{"Contact "}</Text>
								<Text style={[ContactStyle.welcomeName]}>{"Admin!"}</Text>
							</View>
							<Text
								style={[
									ContactStyle.messageStyle,
									{ ...LayoutStyle.marginTop10 },
								]}
							>
								{
									"If you're having trouble logging! Please reach out to our admin team, and we'll get you back on track in no time."
								}
							</Text>
							<View>
								<Input
									isDarkBG={false}
									value={fullName}
									placeholder={"Full Name"}
									maxLength={20}
									onChangeText={(text) => onChangeFullName(text)}
									iconName={"account-outline"}
									iconSetName={"MaterialCommunityIcons"}
									isValidationShow={isFullName}
									validationMessage={fullNameMsg}
									keyboardType={"default"}
									returnKeyType={"done"}
									blurOnSubmit={true}
									onFocus={() => setFullNamePress(true)}
									onBlur={() => setFullNamePress(false)}
									isPressOut={fullNamePress}
									onPressFocus={() => setFullNamePress(true)}
									inputMainStyle={{ ...LayoutStyle.marginBottom20 }}
								/>
								<Input
									isDarkBG={false}
									value={email}
									placeholder={"Email"}
									maxLength={60}
									onChangeText={(text) => onChangeEmail(text)}
									iconName={"email-outline"}
									iconSetName={"MaterialCommunityIcons"}
									isValidationShow={isEmail}
									validationMessage={emailMsg}
									keyboardType={"email-address"}
									returnKeyType={"done"}
									blurOnSubmit={true}
									onFocus={() => setEmailPress(true)}
									onBlur={() => setEmailPress(false)}
									isPressOut={emailPress}
									onPressFocus={() => setEmailPress(true)}
									inputMainStyle={{ ...LayoutStyle.marginBottom20 }}
								/>
								<View style={{ flexDirection: "row", alignItems: "center" }}>
									<View style={{}}>
										<CountryPicker
											countryCode={countryCode}
											withCallingCode
											withFilter
											withFlag
											onSelect={onSelectCountry}
											containerButtonStyle={{
												justifyContent: "center",
												alignItems: "center",
												marginVertical: isPhone ? 40 : 20,
											}}
											preferredCountries={["US"]}
											countryCodes={countryCodes}
											withAlphaFilter={false}
											closeButtonImageStyle={AccountStyle.countryClose}
										/>
									</View>
									<View style={{ flex: 1 }}>
										<Input
											isDarkBG={false}
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
								<Input
									isDarkBG={false}
									value={title}
									placeholder={"Title"}
									// maxLength={20}
									onChangeText={(text) => onChangeTitle(text)}
									iconName={"format-title"}
									iconSetName={"MaterialCommunityIcons"}
									isValidationShow={isTitle}
									validationMessage={titleMsg}
									keyboardType={"default"}
									returnKeyType={"done"}
									blurOnSubmit={true}
									onFocus={() => setTitlePress(true)}
									onBlur={() => setTitlePress(false)}
									isPressOut={titlePress}
									onPressFocus={() => setTitlePress(true)}
									inputMainStyle={{ ...LayoutStyle.marginBottom20 }}
								/>
								<Input
									isDarkBG={false}
									value={description}
									placeholder={"Description"}
									maxLength={100}
									onChangeText={(text) => onChangeDescription(text)}
									multiline={true}
									iconName={"description"}
									iconSetName={"MaterialIcons"}
									isValidationShow={isDescription}
									validationMessage={descriptionMsg}
									keyboardType={"default"}
									blurOnSubmit={true}
									onFocus={() => setDescriptionPress(true)}
									onBlur={() => setDescriptionPress(false)}
									isPressOut={descriptionPress}
									onPressFocus={() => setDescriptionPress(true)}
									inputMainStyle={{
										...LayoutStyle.marginBottom20,
									}}
									iconMainstyle={{
										alignSelf: "flex-start",
										marginTop: Platform.OS === "ios" ? "2%" : "3%",
									}}
									inputStyle={{
										textAlignVertical: "top",
									}}
									focusLabelMainStyle={{ height: 170 }}
									inputLabelStyle={{
										flexDirection: "column",
										alignItems: "flex-start",
									}}
								/>
							</View>
							<View style={{}}>
								<View
									style={[
										{ ...CommonStyles.directionRowCenter, paddingBottom: 10 },
									]}
								>
									<Icons
										iconSetName={"MaterialCommunityIcons"}
										iconName={"file-document-outline"}
										iconColor={Colors.inputIcon}
										iconSize={24}
									/>
									<Text style={[ContactStyle.input]}>
										{"File"}
										<Text style={[ContactStyle.optionalTxt]}>
											{" (optional)"}
										</Text>
									</Text>
								</View>
								{isDocumentPDF && (
									<View
										style={[
											ContactStyle.document,
											{
												backgroundColor: Colors.inputfillBG,
												padding: 20,
												borderRadius: 12,
											},
										]}
									>
										<Icons
											iconName={"file-pdf-o"}
											iconSetName={"FontAwesome"}
											iconColor={Colors.secondary}
											iconSize={50}
										/>
										<Text style={[ContactStyle.documentText]}>
											{documentName}
										</Text>
									</View>
								)}
								<Button
									onPress={() =>
										isDocumentPDF ? removeImage() : openFileManager()
									}
									btnBorderColor={
										isDocumentPDF ? Colors.danger : Colors.secondary
									}
									btnLabelColor={Colors.secondary}
									isBtnActive={true}
									btnColor={Colors.inputfillBG}
									btnName={isDocumentPDF ? "Remove File" : "Add File"}
								/>
								<ValidationText
									isValidationShow={isDocValid}
									validationMessage={MESSAGE.uploadDoc}
								/>
							</View>
							<View style={{}}>
								<View
									style={[
										{
											...CommonStyles.directionRowCenter,
											paddingBottom: 10,
											paddingTop: 20,
										},
									]}
								>
									<Icons
										iconSetName={"MaterialCommunityIcons"}
										iconName={"image-multiple-outline"}
										iconColor={Colors.inputIcon}
										iconSize={20}
									/>
									<Text style={[ContactStyle.input]}>
										{"Pictures"}
										<Text style={[ContactStyle.optionalTxt]}>
											{" (optional)"}
										</Text>
									</Text>
								</View>
								<View>
									{isSelectedLayout ? (
										<AddImagePicker
											data={images}
											renderItem={({ item: imgItems, index }) =>
												renderSelectedImg(imgItems, index)
											}
											keyExtractor={(item) => item.id}
										/>
									) : (
										<TouchableOpacity onPress={() => openImagePicker()}>
											<View
												style={[
													ContactStyle.uploadImg,
													ContactStyle.selectImgsBig,
												]}
											>
												<View style={{ alignItems: "center" }}>
													<Icons
														iconName={"plus"}
														iconSetName={"FontAwesome6"}
														iconColor={Colors.secondary}
														iconSize={18}
													/>
													<Text style={[ContactStyle.textGallery]}>
														{"Image Gallery"}
													</Text>
												</View>
											</View>
										</TouchableOpacity>
									)}
									<ValidationText
										isValidationShow={isImages}
										validationMessage={imagesMsg}
									/>
									<View
										style={{
											...LayoutStyle.marginVertical20,
										}}
									>
										<Button
											onPress={() => onPressSubmit()}
											btnLabelColor={Colors.white}
											btnColor={Colors.secondary}
											btnName={"Submit"}
											isBtnActive={true}
										/>
									</View>
								</View>
							</View>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			)}
		</>
	);
};

export default ContactAdminScreen;
