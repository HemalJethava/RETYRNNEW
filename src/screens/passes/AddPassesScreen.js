import {
	View,
	KeyboardAvoidingView,
	ScrollView,
	ImageBackground,
	Text,
	Platform,
	Alert,
	Linking,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import ImagePicker from "react-native-image-crop-picker";
import { pick } from "@react-native-documents/picker";
import {
	Button,
	DarkHeader,
	DateTimePicker,
	Input,
	TextIcon,
	BottomSheet,
	Icons,
	Loader,
	ValidationText,
	DropDown,
} from "../../components";
import { PassesColors, PassesImages } from "../../json/PassesColors";
import PassesStyle from "../../styles/PassesStyle";
import LayoutStyle from "../../styles/LayoutStyle";
import {
	formatMobileNumber,
	isEmailValidate,
	isURLValidate,
	isEmpty,
	isMobileValidate,
	isValidteSpacialChar,
	isValidteSpacialCharNumb,
} from "../../utils/Validation";
import CommonStyles from "../../styles/CommonStyles";
import Colors from "../../styles/Colors";
import IMAGES from "../../assets/images/Images";
import MESSAGE from "../../utils/Messages";
import FastImage from "react-native-fast-image";
import FormData from "form-data";
import { createPassRequest, getStateListRequest } from "./redux/Action";
import { useDispatch, useSelector } from "react-redux";
import { showMessage } from "react-native-flash-message";
import { deviceHeight, deviceWidth } from "../../utils/DeviceInfo";
import {
	convertToISODate,
	MAX_FILE_SIZE_BYTES,
	moveAndRenameFile,
	removeEmojis,
} from "../../config/CommonFunctions";
import _ from "lodash";

var colorCount = 0;

const AddPassesScreen = (props) => {
	const displayType = props.route.params.type;
	const dispatch = useDispatch();

	const isLoading = useSelector((state) => state.Pass.isLoading);
	const error = useSelector((state) => state.Pass.error);
	const stateList = useSelector((state) => state.Pass.stateList);
	const today = new Date();
	const scrollRef = useRef(null);

	const [passColor, setPassColor] = useState(Colors.cardBlue);
	const [passImg, setPassImg] = useState(IMAGES.passImg1);
	const [bgImg, setBgImg] = useState(1);
	const [documentImg, setDocumentImg] = useState("");
	const [isDocumentImg, setIsDocumentImg] = useState(false);
	const [isDocumentPDF, setIsDocumentPDF] = useState(false);
	const [documentName, setDocumentName] = useState(false);
	const [imgAPI, setImgApi] = useState("");
	const [isImg, setIsImg] = useState(false);
	const [imgMsg, setImgMsg] = useState("");

	const [isModal, setIsModal] = useState(false);

	const [passName, setPassName] = useState("");
	const [passNameMsg, setPassNameMsg] = useState("");
	const [isPassName, setIsPassName] = useState(false);
	const [passNamePress, setPassNamePress] = useState(true);

	const [companyName, setCompanyName] = useState("");
	const [companyNameMsg, setCompanyNameMsg] = useState("");
	const [isCompanyName, setIsCompanyName] = useState(false);
	const [companyNamePress, setCompanyNamePress] = useState(true);

	const [policyID, setPolicyID] = useState("");
	const [policyIDMsg, setPolicyIDMsg] = useState("");
	const [isPolicyID, setIsPolicyID] = useState(false);
	const [policyIDPress, setPolicyIDPress] = useState(true);

	const [insured, setInsured] = useState("");
	const [insuredMsg, setInsuredMsg] = useState("");
	const [isInsured, setIsInsured] = useState(false);
	const [insuredPress, setInsuredPress] = useState(true);

	const [type, setType] = useState("");
	const [typeMsg, setTypeMsg] = useState("");
	const [isType, setIsType] = useState(false);
	const [typePress, setTypePress] = useState(true);

	const [state, setState] = useState("");
	const [stateMsg, setStateMsg] = useState("");
	const [isState, setIsState] = useState(false);
	const [statePress, setStatePress] = useState(true);

	const [disclaimer, setDisclaimer] = useState("");
	const [disclaimerMsg, setDisclaimerMsg] = useState("");
	const [isDisclaimer, setIsDisclaimer] = useState(false);
	const [disclaimerPress, setDisclaimerPress] = useState(true);

	const [effectiveDate, setEffectiveDate] = useState("");
	const [effectiveMsg, setEffectiveMsg] = useState("");
	const [effectiveDOpen, setEffectiveDOpen] = useState(false);
	const [isEffectiveDate, setIsEffectiveDate] = useState(false);
	const [effectiveDatePress, setEffectiveDatePress] = useState(true);

	const [expirationDate, setExpirationDate] = useState("");
	const [expirationMsg, setExpirationMsg] = useState("");
	const [expirationDOpen, setExpirationDOpen] = useState(false);
	const [isExpirationDate, setIsExpirationDate] = useState(false);
	const [expirationDatePress, setExpirationDatePress] = useState(true);

	const [website, setWebsite] = useState("");
	const [websiteMsg, setWebsiteMsg] = useState("");
	const [isWebsite, setIsWebsite] = useState(false);
	const [websitePress, setwebsitePress] = useState(true);

	const [email, setEmail] = useState("");
	const [emailMsg, setEmailMsg] = useState("");
	const [isEmail, setIsEmail] = useState(false);
	const [emailPress, setEmailPress] = useState(true);

	const [phone, setPhone] = useState("");
	const [phoneNumb, setPhoneNumb] = useState("");
	const [phoneMsg, setPhoneMsg] = useState("");
	const [isphone, setIsPhone] = useState(false);
	const [phonePress, setPhonePress] = useState(true);
	const [backPhone, setBackPhone] = useState("");

	useEffect(() => {
		dispatch(getStateListRequest());
	}, [dispatch]);

	useEffect(() => {
		if (error) {
			if (error.pass_name) {
				setIsPassName(true);
				setPassNameMsg(error.pass_name);
				scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
			}
			if (error.image) {
				setIsImg(true);
				setImgMsg(error.image);
				scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
			}
			if (error.company_name) {
				setIsCompanyName(true);
				setCompanyNameMsg(error.company_name);
				scrollRef.current?.scrollTo({ x: 0, y: 200, animated: true });
			}
			if (error.policy_id) {
				scrollRef.current?.scrollTo({ x: 0, y: 250, animated: true });
				setIsPolicyID(true);
				setPolicyIDMsg(error.policy_id);
			}
			if (error.name_of_insured) {
				scrollRef.current?.scrollTo({ x: 0, y: 300, animated: true });
				setIsInsured(true);
				setInsuredMsg(error.name_of_insured);
			}
			if (error.type) {
				scrollRef.current?.scrollTo({ x: 0, y: 300, animated: true });
				setIsType(true);
				setTypeMsg(error.type);
			}
			if (error.state) {
				scrollRef.current?.scrollTo({ x: 0, y: 350, animated: true });
				setIsState(true);
				setStateMsg(error.state);
			}
			if (error.effective_date) {
				scrollRef.current?.scrollTo({ x: 0, y: 550, animated: true });
				setIsEffectiveDate(true);
				setEffectiveMsg(error.effective_date);
			}
			if (error.expiration_date) {
				scrollRef.current?.scrollTo({ x: 0, y: 550, animated: true });
				setIsExpirationDate(true);
				setExpirationMsg(error.expiration_date);
			}
			if (error.disclaimer) {
				scrollRef.current?.scrollTo({ x: 0, y: 550, animated: true });
				setIsDisclaimer(true);
				setDisclaimerMsg(error.disclaimer);
			}
			if (error.web_url) {
				setIsWebsite(true);
				setWebsiteMsg(error.web_url);
				scrollRef.current?.scrollTo({ x: 0, y: 770, animated: true });
			}
			if (error.email) {
				setIsEmail(true);
				setEmailMsg(error.email);
				scrollRef.current?.scrollTo({ x: 0, y: 800, animated: true });
			}
			if (error.mobile) {
				setIsPhone(true);
				setPhoneMsg(error.mobile);
				scrollRef.current?.scrollTo({ x: 0, y: 800, animated: true });
			}
			if (error.bg_image_id) {
				scrollRef.current?.scrollTo({ x: 0, y: 800, animated: true });
				showMessage({
					message: error.bg_image_id,
					type: "danger",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
					duration: 5000,
				});
			}
		}
	}, [error]);

	const gotoBack = () => {
		props.navigation.goBack();
	};
	const openCameraPicker = () => {
		ImagePicker.openCamera({
			width: 400,
			height: 400,
			cropping: false,
			mediaType: "photo",
		})
			.then((image) => {
				if (image.size > MAX_FILE_SIZE_BYTES) {
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
				onRequestClose();
				setIsDocumentImg(true);

				setDocumentImg(Platform.OS === "ios" ? image.path : image.path);

				var fileExt = image.path.split(".").pop();
				const currentTimestamp = Date.now();
				const imgAPI = {
					size: image.size,
					type: image.mime,
					uri: image.path,
					name: `${currentTimestamp}.${fileExt}`,
				};

				setImgApi(imgAPI);
			})
			.catch((error) => {
				setIsModal(false);
				Alert.alert(
					"Camera Permission",
					"Allow to camera permission for capture photo",
					[
						{
							text: "Cancel",
							onPress: () => console.log("Cancel Pressed"),
							style: "cancel",
						},
						{ text: "OK", onPress: () => openSettings() },
					]
				);
			});
	};
	const openSettings = async () => {
		await Linking.openSettings();
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

			if (res) {
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
				const fileExt = res.name.split(".").pop();
				const fileName = `${Date.now()}.${fileExt}`;

				let newUri = res.uri;

				if (Platform.OS === "ios") {
					newUri = await moveAndRenameFile(res.uri, fileName);
					if (!newUri) {
						showMessage({
							message: "Unable to access selected file.",
							type: "danger",
						});
						return;
					}
				}

				const documentAPI = {
					size: res.size,
					type: res.type,
					uri: newUri,
					name: fileName,
				};
				setImgApi(documentAPI);
				setDocumentName(fileName);
				onRequestClose();
				setIsDocumentImg(false);
				setIsDocumentPDF(true);
			}
		} catch (err) {
			if (err.code !== "DOCUMENT_PICKER_CANCELED") {
				console.error("Document Picker Error:", err);
			}
		}
	};
	const openGalleryManager = () => {
		ImagePicker.openPicker({
			width: 400,
			height: 400,
			cropping: false,
			mediaType: "photo",
		})
			.then((image) => {
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

				if (image.size > MAX_FILE_SIZE_BYTES) {
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

				// Only for Android
				var fileExt = image.path.split(".").pop();
				const currentTimestamp = Date.now();
				const imgAPI = {
					size: image.size,
					type: image.mime,
					uri: "file://" + image.path,
					name: `${currentTimestamp}.${fileExt}`,
				};

				setImgApi(imgAPI);
				onRequestClose();
				setIsDocumentImg(true);
				setDocumentImg(Platform.OS === "ios" ? image.sourceURL : image.path);
				setImgMsg("");
			})
			.catch((error) => {
				console.warn(error);
			});
	};
	const removeImage = () => {
		setDocumentImg("");
		setDocumentName("");
		setImgApi("");
		setIsDocumentImg(false);
		setIsDocumentPDF(false);
	};
	const onRequestClose = () => {
		setIsModal(false);
	};
	const openBottomSheet = () => {
		setIsImg(false);
		setIsModal(true);
	};
	const onChangePassName = (text) => {
		let validateInput = isValidteSpacialChar(text);
		setPassName(validateInput);
		setIsPassName(false);
	};
	const onChangeCompanyName = (text) => {
		let validateInput = isValidteSpacialChar(text);
		setCompanyName(validateInput);
		setIsCompanyName(false);
	};
	const onChangePolicyID = (text) => {
		let validateInput = isValidteSpacialChar(text);
		setPolicyID(validateInput);
		setIsPolicyID(false);
	};
	const onChangeInsuredName = (text) => {
		let validateInput = isValidteSpacialCharNumb(text);
		setInsured(validateInput);
		setIsInsured(false);
	};
	const onChangetype = (text) => {
		let validateInput = isValidteSpacialChar(text);
		setType(validateInput);
		setIsType(false);
	};
	const onChangeDisclaimer = (text) => {
		setDisclaimer(text);
		setIsDisclaimer(false);
	};
	const openEffectiveDate = () => {
		if (expirationDate) {
			if (effectiveDate) setEffectiveDate("");
			setExpirationDate("");
			setExpirationDatePress(true);
		}

		setTimeout(() => {
			setEffectiveDOpen(true);
			setEffectiveDatePress(true);
			setIsEffectiveDate(false);
		}, 300);
	};
	const hideEffectiveDate = () => {
		setEffectiveDOpen(false);
	};
	const confirmEffectiveDate = (date) => {
		const usDate = moment(date).format("MM/DD/YYYY");
		setEffectiveDate(usDate);
		setEffectiveDatePress(false);
		hideEffectiveDate();

		if (expirationDate && convertToISODate(expirationDate) < date) {
			setExpirationDate("");
		}
	};
	const confirmExpirationDate = (date) => {
		const usDate = moment(date).format("MM/DD/YYYY");
		setExpirationDate(usDate);
		setExpirationDatePress(false);
		hideExpirationDate();
	};
	const openExpirationDate = () => {
		setExpirationDOpen(true);
		setExpirationDatePress(true);
		setIsExpirationDate(false);
	};
	const hideExpirationDate = () => {
		setExpirationDOpen(false);
	};
	const onChangeWebsite = (text) => {
		const filteredText = removeEmojis(text);
		setWebsite(filteredText);
		setIsWebsite(false);
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
	const onChangePhone = (text) => {
		let formatedNo = formatMobileNumber(text, backPhone);
		setPhone(formatedNo);
		setPhoneNumb(text);
		setIsPhone(false);
	};
	const randomChangeColor = () => {
		const randomImg =
			PassesImages[Math.floor(Math.random() * PassesImages.length)];
		setBgImg(randomImg.id);
		let img = PassesImages.find((e) => e.id === randomImg.id);
		setPassImg(img.image);
		if (colorCount < PassesColors.length) {
			setPassColor(PassesColors[colorCount].color);
			colorCount = colorCount + 1;
			if (colorCount === PassesColors.length) {
				colorCount = 0;
			}
		}
	};
	const isPassFormValidation = () => {
		let isValid = true;
		if (isEmpty(passName)) {
			scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
			setIsPassName(true);
			setPassNameMsg(MESSAGE.passName);
			isValid = false;
		}
		if (typeof imgAPI !== "object") {
			scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
			setIsImg(true);
			setImgMsg("Add pass file/image");
			isValid = false;
		}
		if (isEmpty(companyName)) {
			scrollRef.current?.scrollTo({ x: 0, y: 200, animated: true });
			setIsCompanyName(true);
			setCompanyNameMsg(MESSAGE.companyName);
			isValid = false;
		}
		if (isEmpty(policyID)) {
			scrollRef.current?.scrollTo({ x: 0, y: 250, animated: true });
			setIsPolicyID(true);
			setPolicyIDMsg(MESSAGE.policyID);
			isValid = false;
		}
		if (isEmpty(type)) {
			scrollRef.current?.scrollTo({ x: 0, y: 300, animated: true });
			setIsType(true);
			setTypeMsg(MESSAGE.type);
			isValid = false;
		}
		if (isEmpty(state)) {
			scrollRef.current?.scrollTo({ x: 0, y: 350, animated: true });
			setIsState(true);
			setStateMsg(MESSAGE.state);
			isValid = false;
		}
		if (isEmpty(disclaimer)) {
			scrollRef.current?.scrollTo({ x: 0, y: 550, animated: true });
			setIsDisclaimer(true);
			setDisclaimerMsg(MESSAGE.disclaimer);
			isValid = false;
		}
		if (isEmpty(effectiveDate)) {
			scrollRef.current?.scrollTo({ x: 0, y: 550, animated: true });
			setIsEffectiveDate(true);
			setEffectiveMsg("Please select effective date");
			isValid = false;
		}
		if (isEmpty(expirationDate)) {
			scrollRef.current?.scrollTo({ x: 0, y: 550, animated: true });
			setIsExpirationDate(true);
			setExpirationMsg("Please select expiration date");
			isValid = false;
		}
		if (isEmpty(website)) {
			scrollRef.current?.scrollTo({ x: 0, y: 770, animated: true });
			setIsWebsite(true);
			setWebsiteMsg("Please enter website url");
			isValid = false;
		}
		// Return validation result
		return isValid;
	};
	const isPassOptionalValidation = () => {
		let isValid = true;
		if (expirationDate != "" && effectiveDate != "") {
			const diffInDays = moment(expirationDate, "MM/DD/YYYY").diff(
				moment(effectiveDate, "MM/DD/YYYY"),
				"days"
			);
			if (diffInDays === 0 || diffInDays < 0) {
				scrollRef.current?.scrollTo({ x: 0, y: 640, animated: true });
				setIsExpirationDate(true);
				setExpirationMsg(MESSAGE.expirationDate);
				isValid = false;
			}
		}
		if (!isEmpty(website)) {
			if (!isURLValidate(website)) {
				scrollRef.current?.scrollTo({ x: 0, y: 750, animated: true });
				setIsWebsite(true);
				setWebsiteMsg(MESSAGE.validateURL);
				isValid = false;
			}
		}
		if (!isEmpty(email)) {
			if (!isEmailValidate(email)) {
				scrollRef.current?.scrollTo({ x: 0, y: 750, animated: true });
				setIsEmail(true);
				setEmailMsg(MESSAGE.validateEmail);
				isValid = false;
			}
		}
		if (!isEmpty(phone)) {
			let cleaned = phone.replace(/\D/g, "");
			setPhoneNumb(cleaned);
			if (isMobileValidate(cleaned)) {
				setIsPhone(true);
				setPhoneMsg(MESSAGE.validatePhone);
				isValid = false;
			}
		}
		return isValid;
	};
	const gotoPassesScreen = () => {
		let cleaned = phone.replace(/\D/g, "");
		const isPassValid = isPassFormValidation();
		const isOptionalValid = isPassOptionalValidation();
		const formattedWebsite = website.trim();

		if (isPassValid && isOptionalValid) {
			const formData = new FormData();
			formData.append("pass_name", passName.trim());
			formData.append("image", imgAPI);
			formData.append("company_name", companyName.trim());
			formData.append("policy_id", policyID.trim());
			formData.append("name_of_insured", insured.trim());
			formData.append("type", type.trim());
			formData.append("pass_type", displayType);
			formData.append("state", state.trim());
			formData.append(
				"effective_date",
				effectiveDate
					? moment(effectiveDate, "MM/DD/YYYY").format("YYYY-MM-DD")
					: ""
			);
			formData.append(
				"expiration_date",
				expirationDate
					? moment(expirationDate, "MM/DD/YYYY").format("YYYY-MM-DD")
					: ""
			);
			formData.append("disclaimer", disclaimer.trim());
			formData.append(
				"web_url",
				formattedWebsite
					? /^https?:\/\//i.test(formattedWebsite)
						? formattedWebsite
						: "https://" + formattedWebsite
					: ""
			);
			formData.append("email", email.trim());
			formData.append("mobile", cleaned);
			formData.append("color_code", passColor);
			formData.append("bg_image_id", bgImg);

			dispatch(createPassRequest(formData, props.navigation));
		}
	};

	return (
		<>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "padding"}
				style={[PassesStyle.mainContainer, PassesStyle.backgroundDarkBlue]}
				keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
			>
				{/* <View style={[PassesStyle.mainContainer, PassesStyle.backgroundDarkBlue]}> */}
				<Loader show={isLoading} />
				<DarkHeader
					iconName={"angle-left"}
					iconSetName={"FontAwesome6"}
					iconColor={Colors.backArrowWhite}
					iconSize={24}
					whiteLabel={"New Pass"}
					onPress={() => gotoBack()}
				/>
				<ScrollView showsVerticalScrollIndicator={false} ref={scrollRef}>
					<View style={{ ...CommonStyles.mainPaddingH }}>
						<Input
							isDarkBG={true}
							value={passName}
							placeholder={"Pass Name"}
							maxLength={20}
							onChangeText={(text) => onChangePassName(text)}
							iconName={"card-account-details-outline"}
							iconSetName={"MaterialCommunityIcons"}
							isValidationShow={isPassName}
							validationMessage={passNameMsg}
							keyboardType={"default"}
							returnKeyType={"done"}
							blurOnSubmit={true}
							onFocus={() => setPassNamePress(true)}
							onBlur={() => setPassNamePress(false)}
							isPressOut={passNamePress}
							onPressFocus={() => setPassNamePress(true)}
						/>
						<View
							style={{
								...LayoutStyle.paddingTop30,
								...LayoutStyle.paddingBottom30,
							}}
						>
							{isDocumentImg ? (
								<FastImage
									style={[PassesStyle.imgDisplay]}
									source={{ uri: documentImg }}
									resizeMode={FastImage.resizeMode.contain}
								/>
							) : isDocumentPDF ? (
								<View style={[PassesStyle.document]}>
									<FastImage
										style={[
											PassesStyle.imgDisplay,
											{ height: deviceHeight / 10, width: deviceWidth / 1.5 },
										]}
										source={IMAGES.pdfImg}
										resizeMode={FastImage.resizeMode.contain}
									/>
									<Text style={[PassesStyle.documentText]}>{documentName}</Text>
								</View>
							) : null}
							<Button
								onPress={() =>
									isDocumentImg || isDocumentPDF
										? removeImage()
										: openBottomSheet()
								}
								btnBorderColor={
									isDocumentImg || isDocumentPDF
										? Colors.danger
										: Colors.secondary
								}
								btnLabelColor={Colors.white}
								isBtnActive={true}
								btnColor={Colors.transparent}
								btnName={
									isDocumentImg || isDocumentPDF ? "Remove" : "Add File/Img"
								}
								btnWidth={1}
							/>
							<ValidationText
								isValidationShow={isImg}
								validationMessage={imgMsg}
							/>
						</View>

						<TextIcon textName={"Pass Info"} textColor={Colors.labelWhite} />
						<Input
							isDarkBG={true}
							value={companyName}
							placeholder={"Company Name"}
							maxLength={20}
							onChangeText={(text) => onChangeCompanyName(text)}
							iconName={"business"}
							iconSetName={"MaterialIcons"}
							isValidationShow={isCompanyName}
							validationMessage={companyNameMsg}
							keyboardType={"default"}
							returnKeyType={"done"}
							blurOnSubmit={true}
							onFocus={() => setCompanyNamePress(true)}
							onBlur={() => setCompanyNamePress(false)}
							isPressOut={companyNamePress}
							onPressFocus={() => setCompanyNamePress(true)}
						/>
						<Input
							isDarkBG={true}
							value={policyID}
							placeholder={"Policy ID"}
							maxLength={20}
							onChangeText={(text) => onChangePolicyID(text)}
							iconName={"file-account-outline"}
							iconSetName={"MaterialCommunityIcons"}
							isValidationShow={isPolicyID}
							validationMessage={policyIDMsg}
							// keyboardType={"numeric"}
							returnKeyType={"done"}
							blurOnSubmit={true}
							onFocus={() => setPolicyIDPress(true)}
							onBlur={() => setPolicyIDPress(false)}
							isPressOut={policyIDPress}
							onPressFocus={() => setPolicyIDPress(true)}
							inputMainStyle={{ ...LayoutStyle.marginTop20 }}
						/>
						<Input
							isDarkBG={true}
							value={insured}
							placeholder={"Name Insured"}
							maxLength={30}
							onChangeText={(text) => onChangeInsuredName(text)}
							iconName={"account"}
							iconSetName={"MaterialCommunityIcons"}
							isValidationShow={isInsured}
							validationMessage={insuredMsg}
							keyboardType={"default"}
							returnKeyType={"done"}
							blurOnSubmit={true}
							onFocus={() => setInsuredPress(true)}
							onBlur={() => setInsuredPress(false)}
							isPressOut={insuredPress}
							onPressFocus={() => setInsuredPress(true)}
							inputMainStyle={{ ...LayoutStyle.marginTop20 }}
						/>
						<Input
							isDarkBG={true}
							value={type}
							placeholder={"Type"}
							maxLength={20}
							onChangeText={(text) => onChangetype(text)}
							iconName={"format-list-bulleted"}
							iconSetName={"MaterialCommunityIcons"}
							isValidationShow={isType}
							validationMessage={typeMsg}
							keyboardType={"default"}
							returnKeyType={"done"}
							blurOnSubmit={true}
							onFocus={() => setTypePress(true)}
							onBlur={() => setTypePress(false)}
							isPressOut={typePress}
							onPressFocus={() => setTypePress(true)}
							inputMainStyle={{ ...LayoutStyle.marginTop20 }}
						/>
						<DropDown
							dropdownData={stateList?.length !== 0 ? stateList?.data : []}
							search
							placeholder="Select State"
							labelText="State"
							maxHeight={deviceHeight / 3}
							labelField="name"
							valueField="name"
							searchPlaceholder="Search..."
							value={state}
							isPressOut={statePress}
							isValidationShow={isState}
							validationMessage={stateMsg}
							onFocus={() => {
								scrollRef.current?.scrollTo({ y: 400, animated: true });
								setIsState(false);
							}}
							onPressFocus={() => {
								setStatePress(true);
								setIsState(false);
							}}
							onBlur={() => setIsState(false)}
							onChange={(item) => {
								setIsState(false);
								setState(item.name);
								// setIncidentStateID(item.id.toString());
								setStatePress(false);
							}}
							renderLeftIcon={() => (
								<Icons
									iconName={"map-marker"}
									iconSetName={"MaterialCommunityIcons"}
									iconColor={Colors.inputIconDark}
									iconSize={18}
								/>
							)}
							renderRightIcon={() => (
								<Icons
									iconName={"caret-down"}
									iconSetName={"FontAwesome6"}
									iconColor={Colors.inputIconDark}
									iconSize={18}
								/>
							)}
							mainDropdownStyle={{ ...LayoutStyle.marginTop20 }}
						/>

						<DateTimePicker
							isVisible={effectiveDOpen}
							value={effectiveDate}
							placeholder={"Effective Date"}
							iconName={"calendar-blank-outline"}
							iconSetName={"MaterialCommunityIcons"}
							mode="date"
							onPickerOpen={() => openEffectiveDate()}
							onConfirm={confirmEffectiveDate}
							onCancel={() => hideEffectiveDate()}
							onPressFocus={() => openEffectiveDate()}
							isValidationShow={isEffectiveDate}
							validationMessage={effectiveMsg}
							isPressOut={effectiveDatePress}
							maximumDate={today}
						/>

						<DateTimePicker
							isVisible={expirationDOpen}
							value={expirationDate}
							placeholder={"Expiration Date"}
							iconName={"calendar-remove-outline"}
							iconSetName={"MaterialCommunityIcons"}
							mode="date"
							onPickerOpen={() => openExpirationDate()}
							onConfirm={confirmExpirationDate}
							onCancel={() => hideExpirationDate()}
							onPressFocus={() => openExpirationDate()}
							isValidationShow={isExpirationDate}
							validationMessage={expirationMsg}
							isPressOut={expirationDatePress}
							minimumDate={today}
							datePickerMainStyle={{ ...LayoutStyle.marginTop10 }}
						/>

						<Input
							isDarkBG={true}
							value={disclaimer}
							placeholder={"Disclaimer"}
							maxLength={100}
							onChangeText={(text) => onChangeDisclaimer(text)}
							multiline={true}
							// numberOfLines={3}
							iconName={"alert-outline"}
							iconSetName={"MaterialCommunityIcons"}
							isValidationShow={isDisclaimer}
							validationMessage={disclaimerMsg}
							keyboardType={"default"}
							blurOnSubmit={true}
							onFocus={() => setDisclaimerPress(true)}
							onBlur={() => setDisclaimerPress(false)}
							isPressOut={disclaimerPress}
							onPressFocus={() => setDisclaimerPress(true)}
							inputMainStyle={{
								...LayoutStyle.paddingVertical20,
								marginTop: 8,
							}}
							iconMainstyle={{
								alignSelf: "flex-start",
								marginTop: Platform.OS === "ios" ? "2%" : "3%",
							}}
							inputStyle={{
								textAlignVertical: "top",
								height: 130,
							}}
							focusLabelMainStyle={{
								height: 170,
								flexDirection: "column",
								alignItems: "flex-start",
								paddingTop: 12,
							}}
							inputLabelStyle={{
								flexDirection: "column",
								alignItems: "flex-start",
							}}
						/>
						<TextIcon
							textName={"Additional Pass Info"}
							textColor={Colors.labelWhite}
						/>

						<Input
							isDarkBG={true}
							value={website}
							maxLength={30}
							placeholder={"Website URL"}
							onChangeText={(text) => onChangeWebsite(text)}
							iconName={"web"}
							iconSetName={"MaterialCommunityIcons"}
							isValidationShow={isWebsite}
							validationMessage={websiteMsg}
							keyboardType={"url"}
							returnKeyType={"done"}
							blurOnSubmit={true}
							onFocus={() => setwebsitePress(true)}
							onBlur={() => setwebsitePress(false)}
							isPressOut={websitePress}
							onPressFocus={() => setwebsitePress(true)}
							inputMainStyle={{ ...LayoutStyle.marginTop10 }}
						/>

						<Input
							isDarkBG={true}
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
							inputMainStyle={{ ...LayoutStyle.marginTop20 }}
						/>
						<Input
							isDarkBG={true}
							value={phone}
							placeholder={"Phone"}
							maxLength={14}
							onKeyPress={(e) => {
								e.nativeEvent.key === "Backspace"
									? setBackPhone("backspace")
									: setBackPhone("write");
							}}
							onChangeText={(text) => onChangePhone(text)}
							iconName={"cellphone-dock"}
							iconSetName={"MaterialCommunityIcons"}
							isValidationShow={isphone}
							validationMessage={phoneMsg}
							keyboardType={"numeric"}
							returnKeyType={"done"}
							blurOnSubmit={true}
							onFocus={() => setPhonePress(true)}
							onBlur={() => {
								setPhonePress(false);
								setPhoneMsg(false);
							}}
							isPressOut={phonePress}
							onPressFocus={() => setPhonePress(true)}
							inputMainStyle={{ ...LayoutStyle.marginVertical20 }}
						/>
						<TextIcon textName={"Pass Example"} textColor={Colors.labelWhite} />
						<View
							style={{
								...LayoutStyle.paddingBottom30,
							}}
						>
							<ImageBackground
								style={[PassesStyle.randormCard, { marginBottom: "10%" }]}
								source={passImg}
								resizeMode="cover"
								borderRadius={12}
							>
								<View
									style={[
										PassesStyle.randormCard,
										{
											backgroundColor: passColor + "BD",
										},
									]}
								></View>
							</ImageBackground>

							<Button
								btnBorderColor={Colors.secondary}
								isBtnActive={true}
								btnColor={Colors.transparent}
								btnLabelColor={Colors.white}
								btnName={"Randomize Pass"}
								btnWidth={1}
								onPress={() => randomChangeColor()}
							/>
							<View style={[PassesStyle.borderBottom]}></View>
							<Button
								onPress={() => gotoPassesScreen()}
								isBtnActive={true}
								btnColor={Colors.secondary}
								btnLabelColor={Colors.white}
								btnName={"Save"}
							/>
						</View>
					</View>
				</ScrollView>
				<BottomSheet
					visible={isModal}
					isCameraOption={true}
					isGalleryOption={true}
					isFileOption={true}
					onCameraPress={() => openCameraPicker()}
					onGalleryPress={() => openGalleryManager()}
					onFilePress={() => openFileManager()}
					onModalClose={() => onRequestClose()}
					onRequestClose={() => onRequestClose()}
				/>
				{/* </View> */}
			</KeyboardAvoidingView>
		</>
	);
};

export default AddPassesScreen;
