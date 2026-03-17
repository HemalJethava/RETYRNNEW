import React, { useState, useEffect, useRef } from "react";
import {
	View,
	StatusBar,
	ImageBackground,
	Text,
	TouchableOpacity,
	Linking,
	Platform,
	Alert,
	KeyboardAvoidingView,
} from "react-native";
import Share from "react-native-share";
import Svg, { Defs, Rect, RadialGradient, Stop } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import FastImage from "react-native-fast-image";
import {
	BottomSheet,
	Button,
	DateTimePicker,
	DropDown,
	Icons,
	Input,
	KeyValue,
	Loader,
} from "../../components";
import PassesStyle from "../../styles/PassesStyle";
import IMAGES from "../../assets/images/Images";
import Colors from "../../styles/Colors";
import LayoutStyle from "../../styles/LayoutStyle";
import { ScrollView } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { ViewCardPopup } from "./components/ViewCardPopup";
import {
	convertToISODate,
	downloadImage,
	getFileNameFromPath,
	getFileType,
	MAX_FILE_SIZE_BYTES,
	moveAndRenameFile,
	openFileByThirdPartyApp,
	removeEmojis,
	truncateText,
} from "../../config/CommonFunctions";
import {
	formatMobileNumber,
	isEmailValidate,
	isEmpty,
	isMobileValidate,
	isURLValidate,
	isValidteSpacialChar,
	isValidteSpacialCharNumb,
	startsWithHash,
} from "../../utils/Validation";
import Api from "../../utils/Api";
import { showMessage } from "react-native-flash-message";
import CircularProgress from "react-native-circular-progress-indicator";
import CommonStyles from "../../styles/CommonStyles";
import RNFetchBlob from "rn-fetch-blob";
import { deviceHeight } from "../../utils/DeviceInfo";
import moment from "moment";
import { PassesColors, PassesImages } from "../../json/PassesColors";
import ImagePicker from "react-native-image-crop-picker";
import MESSAGE from "../../utils/Messages";
import { pick } from "@react-native-documents/picker";
import { editPassRequest, getStateListRequest } from "./redux/Action";
import RNFS, { stat } from "react-native-fs";
import ImageResizer from "react-native-image-resizer";

const PassMoreScreen = (props) => {
	const passDetails = useSelector((state) => state.Pass.passDetails?.data);
	const userData = useSelector((state) => state.Auth.userData);
	const stateList = useSelector((state) => state.Pass.stateList);
	const isEditLoading = useSelector((state) => state.Pass.isLoading);
	const error = useSelector((state) => state.Pass.errorEditPass);
	const dispatch = useDispatch();
	const scrollRef = useRef(null);
	const today = new Date();
	var colorCount = 0;

	const [isLoading, setIsLoading] = useState(false);
	const [showCardPopup, setShowCardPopup] = useState(false);
	const [downloadProgress, setDownloadProgress] = useState(0);
	const [isDownloading, setIsDownloading] = useState(false);

	const [isEditPass, setIsEditPass] = useState(false);
	const [isModal, setIsModal] = useState(false);

	const [passColor, setPassColor] = useState(Colors.cardBlue);
	const [passImg, setPassImg] = useState(IMAGES.passImg1);
	const [bgImg, setBgImg] = useState(1);
	const [isPressRandomize, setIsPressRandomize] = useState(false);

	const [documentImg, setDocumentImg] = useState("");
	const [isDocumentImg, setIsDocumentImg] = useState(false);
	const [isDocumentPDF, setIsDocumentPDF] = useState(false);
	const [documentName, setDocumentName] = useState(false);
	const [imgAPI, setImgApi] = useState("");
	const [isImg, setIsImg] = useState(false);
	const [imgMsg, setImgMsg] = useState("");

	const [companyName, setCompanyName] = useState("");
	const [companyNameMsg, setCompanyNameMsg] = useState("");
	const [isCompanyName, setIsCompanyName] = useState(false);
	const [companyNamePress, setCompanyNamePress] = useState(true);

	const [passName, setPassName] = useState("");
	const [passNameMsg, setPassNameMsg] = useState("");
	const [isPassName, setIsPassName] = useState(false);
	const [passNamePress, setPassNamePress] = useState(true);

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

	const [disclaimer, setDisclaimer] = useState("");
	const [disclaimerMsg, setDisclaimerMsg] = useState("");
	const [isDisclaimer, setIsDisclaimer] = useState(false);
	const [disclaimerPress, setDisclaimerPress] = useState(true);

	const colorList = [
		{
			offset: "0%",
			color: passColor || Colors.transparent,
			opacity: "0.7",
		},
		{
			offset: "29%",
			color: passColor || Colors.transparent,
			opacity: "0.8",
		},
		{
			offset: "67%",
			color: passColor || Colors.transparent,
			opacity: "0.9",
		},
		{
			offset: "100%",
			color: passColor || Colors.transparent,
			opacity: "0.9",
		},
	];

	useEffect(() => {
		dispatch(getStateListRequest());
	}, [dispatch]);

	useEffect(() => {
		if (passDetails) {
			if (passDetails?.name) {
				setPassName(passDetails?.name);
				setPassNamePress(false);
			}

			if (passDetails?.company_name) {
				setCompanyName(passDetails?.company_name);
				setCompanyNamePress(false);
			}

			if (passDetails?.policy_id) {
				setPolicyID(passDetails?.policy_id);
				setPolicyIDPress(false);
			}

			if (passDetails?.name_of_insured) {
				setInsured(passDetails?.name_of_insured);
				setInsuredPress(false);
			}

			if (passDetails?.type) {
				setType(passDetails?.type);
				setTypePress(false);
			}

			if (passDetails?.state) {
				setState(passDetails?.state);
				setStatePress(false);
			}

			if (passDetails?.effective_date) {
				const formatteEffective = moment(
					passDetails?.effective_date,
					"MM-DD-YYYY"
				).format("MM/DD/YYYY");
				setEffectiveDate(formatteEffective);
				setEffectiveDatePress(false);
			}

			if (passDetails?.expiration_date) {
				const formattedExpiration = moment(
					passDetails?.expiration_date,
					"MM-DD-YYYY"
				).format("MM/DD/YYYY");
				setExpirationDate(formattedExpiration);
				setExpirationDatePress(false);
			}

			if (passDetails?.web_url) {
				setWebsite(passDetails?.web_url);
				setwebsitePress(false);
			}

			if (passDetails?.email) {
				setEmail(passDetails?.email);
				setEmailPress(false);
			}

			if (passDetails?.mobile) {
				let formatedNo = formatMobileNumber(passDetails?.mobile, "write");
				setPhone(formatedNo);
				setPhoneNumb(passDetails?.mobile);
				setPhonePress(false);
			}

			if (passDetails?.disclaimer) {
				setDisclaimer(passDetails?.disclaimer);
				setDisclaimerPress(false);
			}

			if (passDetails?.pass_bg_image && passDetails?.pass_bg_id) {
				setPassImg(passDetails?.pass_bg_image);
				setBgImg(passDetails?.pass_bg_id);
			}
		}
	}, []);

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
	const isCloseToBottom = ({
		layoutMeasurement,
		contentOffset,
		contentSize,
	}) => {
		const paddingToBottom = 20;
		return (
			layoutMeasurement.height + contentOffset.y >=
			contentSize.height - paddingToBottom
		);
	};
	const gotoWebOpen = () => {
		Linking.canOpenURL(passDetails.web_url).then((supported) => {
			if (supported) {
				Linking.openURL(passDetails.web_url);
			} else {
				// Don't know how to open URI
			}
		});
	};
	const gotoEmailOpen = () => {
		Linking.openURL(`mailto:${passDetails.email}`);
	};
	const gotoDialOpen = () => {
		Linking.openURL(`tel:${passDetails.mobile}`);
	};
	const gotoSharePass = async () => {
		if (passDetails) {
			try {
				setIsLoading(true);
				const response = await Api.get(`user/share-pass/${passDetails?.id}`);
				setIsLoading(false);

				if (response.success) {
					const shareTitle = "Pass";
					const shareMsg = "Share pass";
					const shareUrl = response.data;

					const options = Platform.select({
						ios: {
							activityItemSources: [
								{
									placeholderItem: { type: "url", content: shareUrl },
									item: {
										default: { type: "url", content: shareUrl },
									},
									linkMetadata: {
										title: shareTitle,
										originalUrl: shareUrl,
										url: shareUrl,
									},
								},
							],
						},
						default: {
							title: shareTitle,
							subject: shareTitle,
							message: `${shareMsg}\n${shareUrl}`,
						},
					});

					setTimeout(() => {
						Share.open(options)
							.then((res) => {})
							.catch((err) => {
								if (err && err.message !== "User did not share") {
									console.warn("Share Error:", err);
								}
							});
					}, 1000);
				} else {
					setIsLoading(false);
					showMessage({
						message: response.message || "Something went wrong!",
						type: "danger",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				}
			} catch (error) {
				setIsLoading(false);
				console.warn("Share Error: ", error);
			}
		}
	};
	const gotoShareImg = async (item, type) => {
		const shareTitle = "Share Image";
		const shareMsg = "Share";

		let shareData = [item?.image];

		try {
			const downloadedFiles = await Promise.all(
				shareData.map(async (fileUrl, index) => {
					if (fileUrl.startsWith("http")) {
						const { config, fs } = RNFetchBlob;

						let fileName = item?.name ? item?.name : `shared_file_${index}`;

						const ext = fileUrl.split(".").pop().split("?")[0];
						fileName = fileName.replace(/\s+/g, "_");
						if (!fileName.includes(".")) {
							fileName += `.${ext}`;
						}

						const filePath = `${fs.dirs.CacheDir}/${fileName}`;

						const res = await config({
							fileCache: true,
							appendExt: ext,
							path: filePath,
						}).fetch("GET", fileUrl);

						return `file://${res.path()}`;
					} else {
						return fileUrl;
					}
				})
			);

			shareData = downloadedFiles;
		} catch (error) {
			console.error("File download error:", error);
		}

		const options = {
			title: shareMsg,
			subject: shareMsg,
			urls: shareData.length > 1 ? shareData : [shareData[0]],
		};

		Share.open(options)
			.then((res) => {})
			.catch((err) => console.warn("Share Error: ", err));
	};
	const onPressPDF = (url) => {
		try {
			const file_name = getFileNameFromPath(url);
			const file = {
				file_url: url,
				file_name: file_name,
			};
			openFileByThirdPartyApp(file);
		} catch (error) {
			console.warn("Error: ", error);
		}
	};
	const onPressEditPass = () => {
		setIsEditPass(!isEditPass);
	};
	const onChangeCompanyName = (text) => {
		let validateInput = isValidteSpacialChar(text);
		setCompanyName(validateInput);
		setIsCompanyName(false);
	};
	const onChangePassName = (text) => {
		let validateInput = isValidteSpacialChar(text);
		setPassName(validateInput);
		setIsPassName(false);
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
		if (!text) {
			setPhone("");
			setPhoneNumb("");
			setIsPhone(false);
			return;
		}
		let formatedNo = formatMobileNumber(text, backPhone);
		setPhone(formatedNo);
		setPhoneNumb(text);
		setIsPhone(false);
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
	const openEffectiveDate = () => {
		setEffectiveDOpen(true);
		setEffectiveDatePress(true);
		setIsEffectiveDate(false);
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
	const onChangeDisclaimer = (text) => {
		setDisclaimer(text);
		setIsDisclaimer(false);
	};
	const randomChangeColor = () => {
		setIsPressRandomize(true);
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
	const onRequestClose = () => {
		setIsModal(false);
	};
	const openBottomSheet = () => {
		setIsImg(false);
		setIsModal(true);
	};
	const openSettings = async () => {
		await Linking.openSettings();
	};
	const openCameraPicker = () => {
		ImagePicker.openCamera({
			width: 400,
			height: 400,
			cropping: false,
			mediaType: "photo",
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

				onRequestClose();
				setIsDocumentImg(true);
				setDocumentImg(resizedImage.uri);
				const currentTimestamp = Date.now();
				const imgAPI = {
					size: resizedImage.size,
					type: resizedImage.mime || "image/jpeg",
					uri: resizedImage.uri,
					name: `${currentTimestamp}.${fileExt}`,
				};

				setImgApi(imgAPI);
			})
			.catch((error) => {
				setIsModal(false);
			});
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
				onRequestClose();
				setIsDocumentImg(true);
				setDocumentImg(resizedImage.uri);
				setImgMsg("");
			})
			.catch((error) => {
				console.warn(error);
			});
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
	const clearImageSelection = () => {
		setDocumentImg("");
		setIsDocumentImg(false);
		setIsDocumentPDF(false);
		setDocumentName(false);
		setImgApi("");
		setIsImg(false);
		setImgMsg("");
	};
	const isPassFormValidation = () => {
		let isValid = true;
		if (isEmpty(passName)) {
			scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
			setIsPassName(true);
			setPassNameMsg(MESSAGE.passName);
			isValid = false;
		}
		// if ( typeof imgAPI !== "object") {
		// 	scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
		// 	setIsImg(true);
		// 	setImgMsg("Add pass file/image");
		// 	isValid = false;
		// }
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
			scrollRef.current?.scrollTo({ x: 0, y: 700, animated: true });
			setIsDisclaimer(true);
			setDisclaimerMsg(MESSAGE.disclaimer);
			isValid = false;
		}
		if (isEmpty(effectiveDate)) {
			scrollRef.current?.scrollTo({ x: 0, y: 720, animated: true });
			setIsEffectiveDate(true);
			setEffectiveMsg("Please select effective date");
			isValid = false;
		}
		if (isEmpty(expirationDate)) {
			scrollRef.current?.scrollTo({ x: 0, y: 750, animated: true });
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
			let cleaned = phone ? phone.replace(/\D/g, "") : "";
			setPhoneNumb(cleaned);
			if (isMobileValidate(cleaned)) {
				setIsPhone(true);
				setPhoneMsg(MESSAGE.validatePhone);
				isValid = false;
			}
		}
		return isValid;
	};
	const convertFileToBase64 = async (file) => {
		try {
			if (!file || !file.uri) return null;

			let filePath = file.uri;

			if (filePath.startsWith("file://file://")) {
				filePath = filePath.replace("file://file://", "file://");
			}
			if (filePath.startsWith("file://")) {
				filePath = filePath.replace("file://", "");
			}

			const base64 = await RNFS.readFile(filePath, "base64");

			return {
				uri: file.uri,
				base64: base64,
				name: file.fileName || file.name || `file_${Date.now()}`,
				fileType: file.type || "application/octet-stream",
			};
		} catch (error) {
			console.error("Error converting file to base64:", error);
			return null;
		}
	};
	const onPressSavePass = async () => {
		if (!isPassFormValidation() || !isPassOptionalValidation()) return;

		const cleaned = phone?.replace(/\D/g, "") || "";
		const img = imgAPI ? await convertFileToBase64(imgAPI) : passDetails?.image;
		const formattedWebsite = website.trim();
		const webUrl = formattedWebsite
			? /^https?:\/\//i.test(formattedWebsite)
				? formattedWebsite
				: "https://" + formattedWebsite
			: "";

		const formatDate = (date) =>
			date ? moment(date, "MM/DD/YYYY").format("YYYY-MM-DD") : "";

		const payload = {
			id: passDetails?.id,
			pass_name: passName.trim(),
			image: img,
			// image: imgAPI ? imgAPI : passDetails?.image,
			is_image_updated: imgAPI ? 1 : 0,
			company_name: companyName.trim(),
			policy_id: policyID.trim(),
			name_of_insured: insured.trim(),
			type: type.trim(),
			pass_type: passDetails?.pass_type,
			state: state.trim(),
			effective_date: formatDate(effectiveDate),
			expiration_date: formatDate(expirationDate),
			disclaimer: disclaimer.trim(),
			web_url: webUrl,
			email: email.trim(),
			mobile: cleaned,
			color_code: passColor,
			bg_image_id: bgImg,
		};

		dispatch(editPassRequest(payload, props.navigation));
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "padding"}
			style={{ ...PassesStyle.mainContainer }}
		>
			{isLoading && <Loader show={isLoading} />}
			{isEditLoading && <Loader show={isEditLoading} />}
			<ViewCardPopup
				show={showCardPopup}
				onHide={() => setShowCardPopup(false)}
				passDetails={passDetails}
			/>
			{!isLoading && !isEditLoading && (
				<View style={[PassesStyle.mainContainer, PassesStyle.backgroundWhite]}>
					<SafeAreaView style={[PassesStyle.StatusBarHight]}>
						<StatusBar
							translucent
							barStyle={"dark-content"}
							animated={true}
							backgroundColor={Colors.white}
							networkActivityIndicatorVisible={true}
						/>
					</SafeAreaView>
					<View style={[PassesStyle.topContainer, { marginHorizontal: 20 }]}>
						<View style={{ ...CommonStyles.directionRowCenter }}>
							<TouchableOpacity onPress={() => gotoBack()}>
								<View style={[PassesStyle.leftIcon, { paddingLeft: 0 }]}>
									<Icons
										iconName={"angle-left"}
										iconSetName={"FontAwesome6"}
										iconColor={Colors.backArrowBlack}
										iconSize={24}
									/>
								</View>
							</TouchableOpacity>
							<Text style={[PassesStyle.centerTitle]}>{"Pass"}</Text>
						</View>
						<View style={{ ...CommonStyles.directionRowCenter }}>
							{((userData?.user_type === 3 &&
								passDetails?.pass_type === "company") ||
								passDetails?.pass_type === "personal") &&
								passDetails?.status !== "archieve" && (
									<>
										{!isEditPass ? (
											<TouchableOpacity onPress={onPressEditPass}>
												<View style={[PassesStyle.passDetailHeaderIcon]}>
													<Icons
														iconName={"edit"}
														iconSetName={"Feather"}
														iconColor={Colors.backArrowBlack}
														iconSize={24}
													/>
												</View>
											</TouchableOpacity>
										) : (
											<TouchableOpacity onPress={onPressEditPass}>
												<View style={[PassesStyle.passDetailHeaderIcon]}>
													<Icons
														iconName={"card-bulleted-off-outline"}
														iconSetName={"MaterialDesignIcons"}
														iconColor={Colors.backArrowBlack}
														iconSize={24}
													/>
												</View>
											</TouchableOpacity>
										)}
									</>
								)}
							{!isEditPass && (
								<TouchableOpacity onPress={() => gotoSharePass()}>
									<View
										style={[
											PassesStyle.passDetailHeaderIcon,
											{ paddingLeft: 10 },
										]}
									>
										<Icons
											iconName={"ios-share"}
											iconSetName={"MaterialIcons"}
											iconColor={Colors.backArrowBlack}
											iconSize={24}
										/>
									</View>
								</TouchableOpacity>
							)}
						</View>
					</View>
					<ScrollView
						ref={scrollRef}
						showsVerticalScrollIndicator={false}
						nestedScrollEnabled={true}
						scrollEventThrottle={10}
					>
						{!isEditPass ? (
							<View style={[PassesStyle.imgContainer]}>
								<View style={[PassesStyle.logoPosition]}>
									<View
										style={[
											PassesStyle.imgMainBorder,
											{
												borderWidth: 0,
											},
										]}
									>
										<TouchableOpacity
											style={PassesStyle.pdfButton}
											disabled={getFileType(passDetails?.image) !== "pdf"}
											onPress={() => onPressPDF(passDetails?.image)}
										>
											{getFileType(passDetails?.image) !== "pdf" ? (
												<FastImage
													style={[
														PassesStyle.passImg,
														{
															borderColor:
																passDetails?.code &&
																startsWithHash(passDetails?.code)
																	? passDetails?.code
																	: Colors.inputBlackText,
														},
													]}
													source={{ uri: passDetails?.image }}
													resizeMode={FastImage.resizeMode.contain}
												/>
											) : (
												<View
													style={[
														PassesStyle.passImg,
														{ justifyContent: "center", alignItems: "center" },
													]}
												>
													<FastImage
														style={[
															{
																borderColor:
																	passDetails?.code &&
																	startsWithHash(passDetails?.code)
																		? passDetails?.code
																		: Colors.inputBlackText,
																height: "75%",
																width: "75%",
															},
														]}
														source={IMAGES.pdfImg}
														resizeMode={FastImage.resizeMode.contain}
													/>
												</View>
											)}
											<View
												style={[
													PassesStyle.passShareBtn,
													{ ...CommonStyles.directionRowCenter },
												]}
											>
												{(userData?.user_type === 3 ||
													(userData?.user_type === 2 &&
														passDetails?.pass_type !== "company")) && (
													<>
														{getFileType(passDetails?.image) !== "pdf" && (
															<>
																{!isDownloading ? (
																	<TouchableOpacity
																		style={[PassesStyle.shareBox]}
																		onPress={() =>
																			downloadImage(
																				passDetails?.image,
																				setIsDownloading,
																				setDownloadProgress
																			)
																		}
																		disabled={isDownloading}
																	>
																		<Icons
																			iconSetName={"Ionicons"}
																			iconName={"download-outline"}
																			iconSize={22}
																			iconColor={Colors.white}
																		/>
																	</TouchableOpacity>
																) : (
																	<View style={[PassesStyle.shareBox]}>
																		<CircularProgress
																			value={parseFloat(downloadProgress)}
																			maxValue={100}
																			radius={14}
																			textColor="#000"
																			activeStrokeColor={Colors.white}
																			inActiveStrokeColor="#ccc"
																			inActiveStrokeOpacity={0.5}
																			// duration={1000}
																			progressValueStyle={{
																				fontSize: 6.5,
																				fontWeight: "bold",
																				color: Colors.white,
																			}}
																			activeStrokeWidth={4}
																			inActiveStrokeWidth={4}
																			valueSuffix="%"
																			valueSuffixStyle={{ left: 0.5 }}
																		/>
																	</View>
																)}
															</>
														)}
													</>
												)}
												<TouchableOpacity
													style={[PassesStyle.shareBox]}
													onPress={() =>
														gotoShareImg(
															passDetails,
															getFileType(passDetails?.image)
														)
													}
												>
													<Icons
														iconName={"share-outline"}
														iconSetName={"Ionicons"}
														iconColor={Colors.backArrowWhite}
														iconSize={20}
													/>
												</TouchableOpacity>
											</View>
										</TouchableOpacity>
									</View>
									<View style={{ ...LayoutStyle.paddingBottom20 }}>
										<Text
											style={[
												PassesStyle.TextWhiteIcon,
												{ textAlign: "center" },
											]}
										>
											{passDetails?.company_name}
										</Text>

										<View style={[PassesStyle.gradientIconContainer]}>
											{passDetails?.web_url && (
												<TouchableOpacity
													style={[PassesStyle.gradientIcon]}
													onPress={() => gotoWebOpen()}
												>
													<Icons
														iconColor={Colors.iconWhite}
														iconName={"web"}
														iconSetName={"MaterialCommunityIcons"}
														iconSize={24}
													/>
												</TouchableOpacity>
											)}
											{passDetails?.email && (
												<TouchableOpacity
													style={[PassesStyle.gradientIcon]}
													onPress={() => gotoEmailOpen()}
												>
													<Icons
														iconColor={Colors.iconWhite}
														iconName={"email-outline"}
														iconSetName={"MaterialCommunityIcons"}
														iconSize={24}
													/>
												</TouchableOpacity>
											)}
											{passDetails?.mobile && (
												<TouchableOpacity
													style={[PassesStyle.gradientIcon]}
													onPress={() => gotoDialOpen()}
												>
													<Icons
														iconColor={Colors.iconWhite}
														iconName={"phone-outline"}
														iconSetName={"MaterialCommunityIcons"}
														iconSize={24}
													/>
												</TouchableOpacity>
											)}
										</View>
									</View>
								</View>
								<ImageBackground
									source={{ uri: passDetails?.pass_bg_image }}
									style={[PassesStyle.gradientImgDetail]}
									resizeMode="cover"
								>
									<Svg height="100%" width="100%">
										<Defs>
											<RadialGradient
												id="grad"
												x="50%"
												y="50%"
												rx="50%"
												ry="50%"
												gradientUnits="userSpaceOnUse"
											>
												{colorList.map((value, index) => (
													<Stop
														key={`RadialGradientItem_${index}`}
														offset={value.offset}
														stopColor={value.color}
														stopOpacity={value.opacity}
													/>
												))}
											</RadialGradient>
										</Defs>
										<Rect
											x="0"
											y="0"
											width="100%"
											height="100%"
											fill="url(#grad)"
										/>
									</Svg>
								</ImageBackground>
								<View
									style={[
										PassesStyle.detailsCard,
										{ backgroundColor: passDetails?.code + "1A" },
									]}
								>
									{passDetails?.policy_id && (
										<KeyValue
											keyLabel={"Policy ID"}
											valueLabel={truncateText("#" + passDetails.policy_id, 25)}
											keyColor={passDetails?.code}
										/>
									)}
									{passDetails?.name_of_insured && (
										<KeyValue
											keyLabel={"Name Insured"}
											valueLabel={truncateText(passDetails.name_of_insured, 25)}
											keyColor={passDetails?.code}
										/>
									)}
									{passDetails?.type && (
										<KeyValue
											keyLabel={"Type"}
											valueLabel={truncateText(passDetails.type, 25)}
											keyColor={passDetails?.code}
										/>
									)}
									{passDetails?.state && (
										<KeyValue
											keyLabel={"State"}
											valueLabel={truncateText(passDetails.state, 25)}
											keyColor={passDetails?.code}
										/>
									)}
									{passDetails?.effective_date && (
										<KeyValue
											keyLabel={"Effective Date"}
											valueLabel={passDetails?.effective_date.replace(
												/-/g,
												"/"
											)}
											keyColor={passDetails?.code}
										/>
									)}
									{passDetails?.expiration_date && (
										<KeyValue
											keyLabel={"Expiration Date"}
											valueLabel={passDetails?.expiration_date.replace(
												/-/g,
												"/"
											)}
											keyColor={passDetails?.code}
										/>
									)}

									<Text style={[PassesStyle.lastUpdateDate]}>
										{"Last Updated "}
										{passDetails?.last_updated_date}
									</Text>
								</View>
								<View style={[PassesStyle.detailsCard]}>
									<Text style={[PassesStyle.passText]}>{"Disclaimer"}</Text>
									<Text style={[PassesStyle.passValue]}>
										{passDetails?.disclaimer +
											" For official proof of insurance, use your electronic ID card from the carriers app or your paper ID card."}
									</Text>
									<View style={{ ...LayoutStyle.marginTop20 }}>
										<Button
											isBtnActive={true}
											btnLabelColor={Colors.white}
											btnName={"View ID Card"}
											btnColor={
												passDetails?.code && startsWithHash(passDetails?.code)
													? passDetails?.code
													: Colors.inputBlackText
											}
											onPress={() => setShowCardPopup(true)}
										/>
									</View>
								</View>
							</View>
						) : (
							<View style={[PassesStyle.imgContainer]}>
								<View style={[PassesStyle.logoPosition]}>
									<View
										style={[
											PassesStyle.imgMainBorder,
											{
												borderWidth: 0,
											},
										]}
									>
										<TouchableOpacity
											style={PassesStyle.pdfButton}
											disabled={
												documentImg
													? isDocumentImg
													: getFileType(passDetails?.image) !== "pdf"
											}
											onPress={
												!documentImg &&
												getFileType(passDetails?.image) === "pdf"
													? () => onPressPDF(passDetails?.image)
													: undefined
											}
										>
											{documentImg || imgAPI ? (
												isDocumentImg ? (
													<FastImage
														style={[
															PassesStyle.passImg,
															{
																borderColor:
																	passColor && startsWithHash(passColor)
																		? passColor
																		: Colors.inputBlackText,
															},
														]}
														source={{ uri: documentImg }}
														resizeMode={FastImage.resizeMode.contain}
													/>
												) : (
													<View
														style={[
															PassesStyle.passImg,
															{
																justifyContent: "center",
																alignItems: "center",
															},
														]}
													>
														<FastImage
															style={{
																height: "75%",
																width: "75%",
																borderColor:
																	passColor && startsWithHash(passColor)
																		? passColor
																		: Colors.inputBlackText,
															}}
															source={IMAGES.pdfImg}
															resizeMode={FastImage.resizeMode.contain}
														/>
														<Text
															style={[
																PassesStyle.documentText,
																{ color: Colors.black, fontSize: 12 },
															]}
														>
															{documentName.length > 20
																? `${documentName.slice(0, 20)}...`
																: documentName}
														</Text>
													</View>
												)
											) : getFileType(passDetails?.image) !== "pdf" ? (
												<FastImage
													style={[
														PassesStyle.passImg,
														{
															borderColor:
																passColor && startsWithHash(passColor)
																	? passColor
																	: Colors.inputBlackText,
														},
													]}
													source={{ uri: passDetails?.image }}
													resizeMode={FastImage.resizeMode.contain}
												/>
											) : (
												<View
													style={[
														PassesStyle.passImg,
														{ justifyContent: "center", alignItems: "center" },
													]}
												>
													<FastImage
														style={{
															height: "75%",
															width: "75%",
															borderColor:
																passColor && startsWithHash(passColor)
																	? passColor
																	: Colors.inputBlackText,
														}}
														source={IMAGES.pdfImg}
														resizeMode={FastImage.resizeMode.contain}
													/>
												</View>
											)}

											<View
												style={[
													PassesStyle.passShareBtn,
													CommonStyles.directionRowCenter,
												]}
											>
												<TouchableOpacity
													style={PassesStyle.editPassImageBtn}
													onPress={openBottomSheet}
												>
													<Icons
														iconName="image-edit-outline"
														iconSetName="MaterialDesignIcons"
														iconColor={Colors.backArrowWhite}
														iconSize={18}
													/>
												</TouchableOpacity>
												{documentImg && (
													<TouchableOpacity
														style={[
															PassesStyle.editPassImageBtn,
															{ marginLeft: 7 },
														]}
														onPress={clearImageSelection}
													>
														<Icons
															iconName="close-circle-outline"
															iconSetName="MaterialDesignIcons"
															iconColor={Colors.backArrowWhite}
															iconSize={18}
														/>
													</TouchableOpacity>
												)}
											</View>
										</TouchableOpacity>
									</View>
									<View style={{ ...LayoutStyle.paddingBottom20 }}>
										<Text
											style={[
												PassesStyle.TextWhiteIcon,
												{ textAlign: "center" },
											]}
										>
											{passDetails?.company_name}
										</Text>

										<View style={[PassesStyle.gradientIconContainer]}>
											{passDetails?.web_url && (
												<TouchableOpacity
													style={[PassesStyle.gradientIcon]}
													onPress={() => gotoWebOpen()}
												>
													<Icons
														iconColor={Colors.iconWhite}
														iconName={"web"}
														iconSetName={"MaterialCommunityIcons"}
														iconSize={24}
													/>
												</TouchableOpacity>
											)}
											{passDetails?.email && (
												<TouchableOpacity
													style={[PassesStyle.gradientIcon]}
													onPress={() => gotoEmailOpen()}
												>
													<Icons
														iconColor={Colors.iconWhite}
														iconName={"email-outline"}
														iconSetName={"MaterialCommunityIcons"}
														iconSize={24}
													/>
												</TouchableOpacity>
											)}
											{passDetails?.mobile && (
												<TouchableOpacity
													style={[PassesStyle.gradientIcon]}
													onPress={() => gotoDialOpen()}
												>
													<Icons
														iconColor={Colors.iconWhite}
														iconName={"phone-outline"}
														iconSetName={"MaterialCommunityIcons"}
														iconSize={24}
													/>
												</TouchableOpacity>
											)}
											<TouchableOpacity
												style={[
													PassesStyle.gradientIcon,
													{ paddingHorizontal: 8 },
												]}
												onPress={() => randomChangeColor()}
											>
												<Icons
													iconSetName={"MaterialDesignIcons"}
													iconName={"refresh"}
													iconColor={Colors.white}
													iconSize={28}
												/>
											</TouchableOpacity>
										</View>
									</View>
								</View>
								<ImageBackground
									source={!isPressRandomize ? { uri: passImg } : passImg}
									style={[
										PassesStyle.gradientImgDetail,
										{
											height:
												Platform.OS === "ios"
													? deviceHeight / 3.8
													: deviceHeight / 3.5,
										},
									]}
									resizeMode="cover"
								>
									<Svg height="100%" width="100%">
										<Defs>
											<RadialGradient
												id="grad"
												x="50%"
												y="50%"
												rx="50%"
												ry="50%"
												gradientUnits="userSpaceOnUse"
											>
												{colorList.map((value, index) => (
													<Stop
														key={`RadialGradientItem_${index}`}
														offset={value.offset}
														stopColor={value.color}
														stopOpacity={value.opacity}
													/>
												))}
											</RadialGradient>
										</Defs>
										<Rect
											x="0"
											y="0"
											width="100%"
											height="100%"
											fill="url(#grad)"
										/>
									</Svg>
								</ImageBackground>
								<View
									style={[PassesStyle.detailsCard, { backgroundColor: "#FFF" }]}
								>
									<Input
										isDarkBG={false}
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
									<Input
										isDarkBG={false}
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
										inputMainStyle={{ ...LayoutStyle.marginTop20 }}
									/>
									<Input
										isDarkBG={false}
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
										isDarkBG={false}
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
										isDarkBG={false}
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
										isDarkBG={false}
										dropdownData={
											stateList?.length !== 0 ? stateList?.data : []
										}
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
											scrollRef.current?.scrollTo({ y: 600, animated: true });
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
											setStatePress(false);
										}}
										renderLeftIcon={() => (
											<Icons
												iconName={"map-marker"}
												iconSetName={"MaterialCommunityIcons"}
												iconColor={Colors.inputIcon}
												iconSize={18}
											/>
										)}
										renderRightIcon={() => (
											<Icons
												iconName={"caret-down"}
												iconSetName={"FontAwesome6"}
												iconColor={Colors.inputIcon}
												iconSize={18}
											/>
										)}
										mainDropdownStyle={{ ...LayoutStyle.marginTop20 }}
									/>
									<DateTimePicker
										isDarkBG={false}
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
										isDarkBG={false}
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
										minimumDate={
											effectiveDate ? convertToISODate(effectiveDate) : today
										}
										datePickerMainStyle={{}}
									/>
									<Input
										isDarkBG={false}
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
										inputMainStyle={{ ...LayoutStyle.marginTop20 }}
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
										inputMainStyle={{ ...LayoutStyle.marginTop20 }}
									/>
									<Input
										isDarkBG={false}
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
										inputMainStyle={{ ...LayoutStyle.marginTop20 }}
									/>
									<Input
										isDarkBG={false}
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

									<Text style={[PassesStyle.lastUpdateDate]}>
										{"Last Updated "}
										{passDetails?.last_updated_date}
									</Text>
								</View>
								<View style={[PassesStyle.detailsCard, { paddingTop: 0 }]}>
									<View style={{}}>
										<Button
											isBtnActive={true}
											btnLabelColor={Colors.white}
											btnName={"Save Pass"}
											btnColor={
												passDetails?.code && startsWithHash(passDetails?.code)
													? passDetails?.code
													: Colors.inputBlackText
											}
											onPress={() => onPressSavePass()}
										/>
									</View>
								</View>
							</View>
						)}
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
				</View>
			)}
		</KeyboardAvoidingView>
	);
};

export default PassMoreScreen;
