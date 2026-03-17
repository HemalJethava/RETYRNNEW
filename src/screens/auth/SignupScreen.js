import React, { useEffect, useRef, useState } from "react";
import {
	View,
	KeyboardAvoidingView,
	SafeAreaView,
	BackHandler,
	Keyboard,
	Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
	Button,
	DarkHeader,
	Input,
	DropDown,
	Icons,
	Loader,
} from "../../components";
import {
	formatMobileNumber,
	isEmailValidate,
	isEmpty,
	isValidteAddress,
	isVerifyNumb,
	isValidteSpacialChar,
	isValidteSpacialCharNumb,
} from "../../utils/Validation";
import { storeData } from "../../utils/LocalData";
import LayoutStyle from "../../styles/LayoutStyle";
import AuthStyle from "../../styles/AuthStyle";
import Colors from "../../styles/Colors";
import MESSAGE from "../../utils/Messages";
import { sendOTPRequested } from "./redux/Action";
import { deviceHeight } from "../../utils/DeviceInfo";
import { getStateListRequest } from "./redux/Action";
import Api from "../../utils/Api";
import { showMessage } from "react-native-flash-message";
import CountryPicker from "react-native-country-picker-modal";
import AccountStyle from "../../styles/AccountStyle";
import {
	countryCodes,
	getCityStateCountryByAddress,
} from "../../config/CommonFunctions";
import { requestHint } from "react-native-otp-verify";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import DarkLocationInput from "../../components/DarkLocationInput";
import NearByAddressPanel from "./component/NearByAddressPanel";

const SignupScreen = (props) => {
	const dispatch = useDispatch();

	const registerData = props.route.params?.registerData || "";
	const sendOTPerror = useSelector((state) => state.Auth.sendOTPerror);
	const stateList = useSelector((state) => state.Auth.stateList);
	const refGoogleAddress = useRef();

	const [isKeyboardVisible, setKeyboardVisible] = useState(false);
	const [screenName, setScreenName] = useState("Company Name");
	const [isLoading, setIsLoading] = useState(false);

	// Screen 1
	const [isNameScreen, setIsNameScreen] = useState(true);
	const [isNewCompany, setIsNewCompany] = useState(true);
	const [companyName, setCompanyName] = useState("");
	const [companyDetail, setCompanyDetail] = useState(null);
	const [companyNameMsg, setCompanyNameMsg] = useState("");
	const [isCompanyName, setIsCompanyName] = useState(false);
	const [companyNamePress, setCompanyNamePress] = useState(true);

	// Screen 2
	const [isAddrScreen, setIsAddrScreen] = useState(false);
	const [showAddressesPanel, setShowAddressesPanel] = useState(false);

	const [googleAddress, setGoogleAddress] = useState("");
	const [prevGoogleAddress, setPrevGoogleAddress] = useState("");
	const [googleAddressCoords, setGoogleAddressCoords] = useState(null);
	const [addressSelection, setAddressSelection] = useState(undefined);
	const [googleAddressMsg, setGoogleAddressMsg] = useState("");
	const [isGoogleAddress, setIsGoogleAddress] = useState(false);
	const [googleAddressPress, setGoogleAddressPress] = useState(true);
	const [addressFromList, setAddressFromList] = useState(false);
	const [isVerifiedAddress, setIsVerifiedAddress] = useState(true);

	const [address2, setAddress2] = useState("");
	const [address2Msg, setAddress2Msg] = useState("");
	const [isAddress2, setIsAddress2] = useState(false);
	const [address2Press, setAddress2Press] = useState(true);
	const [isDisableAddress2, setIsDisableAddress2] = useState(false);

	const [city, setCity] = useState("");
	const [cityMsg, setCityMsg] = useState("");
	const [iscity, setIsCity] = useState(false);
	const [cityPress, setCityPress] = useState(true);

	const [state, setState] = useState("");
	const [stateCode, setStateCode] = useState("");
	const [stateMsg, setStateMsg] = useState("");
	const [isState, setIsState] = useState(false);
	const [statePress, setStatePress] = useState(true);

	const [zip, setZip] = useState("");
	const [zipMsg, setZipMsg] = useState("");
	const [isZip, setIsZip] = useState(false);
	const [zipPress, setZipPress] = useState(true);

	const [enteredAddress, setEnteredAddress] = useState(null);
	const [suggestedAddress, setSuggestedAddress] = useState(null);

	// Screen 3
	const [isFullNameScreen, setIsFullNameScreen] = useState(false);
	const [name, setName] = useState("");
	const [nameMsg, setNameMsg] = useState("");
	const [isName, setIsName] = useState(false);
	const [namePress, setNamePress] = useState(true);

	// Screen 4
	const [isPhoneScreen, setIsPhoneScreen] = useState(false);
	const [countryCode, setCountryCode] = useState("US");
	const [callingCode, setCallingCode] = useState("+1");
	const [phone, setPhone] = useState(""); //For user display as formatter
	const [phoneNumb, setPhoneNumb] = useState(""); //For API call
	const [phoneMsg, setPhoneMsg] = useState("");
	const [isPhone, setIsPhone] = useState(false);
	const [phonePress, setPhonePress] = useState(true);
	const [backPhone, setBackPhone] = useState("");

	// Screen 5
	const [isEmailScreen, setIsEmailScreen] = useState(false);
	const [email, setEmail] = useState("");
	const [emailMsg, setEmailMsg] = useState("");
	const [isEmail, setIsEmail] = useState(false);
	const [emailPress, setEmailPress] = useState(true);

	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			"keyboardDidShow",
			() => setKeyboardVisible(true)
		);
		const keyboardDidHideListener = Keyboard.addListener(
			"keyboardDidHide",
			() => setKeyboardVisible(false)
		);

		return () => {
			keyboardDidShowListener.remove();
			keyboardDidHideListener.remove();
		};
	}, []);

	useEffect(() => {
		dispatch(getStateListRequest());
	}, [dispatch]);

	useEffect(() => {
		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			gotoBackScreen
		);
		return () => backHandler.remove();
	}, [
		isEmailScreen,
		isPhoneScreen,
		isFullNameScreen,
		isAddrScreen,
		isNameScreen,
		props.navigation,
	]);

	useEffect(() => {
		if (companyDetail) {
			setGoogleAddress(companyDetail?.company_address);
			setPrevGoogleAddress(companyDetail?.company_address);
			setGoogleAddressCoords({ latitude: 1.1, longitude: 1.1 });
			setGoogleAddressPress(false);
			if (companyDetail?.company_address) {
				refGoogleAddress?.current?.setAddressText(
					companyDetail?.company_address
				);
			}

			if (companyDetail?.company_address_2) {
				setAddress2(companyDetail?.company_address_2 ?? "");
				setAddress2Press(false);
			} else {
				setIsDisableAddress2(true);
				setAddress2Press(false);
			}

			setCity(companyDetail?.city);
			setCityPress(false);

			setZip(companyDetail?.zip_code.toString());
			setZipPress(false);

			if (companyDetail?.state && stateList?.data.length > 0) {
				const selectedState = stateList.data.find(
					(item) => item.code === companyDetail.state
				);

				setState(selectedState?.name);
				setStateCode(selectedState?.code);
				setStatePress(false);
			}
		}
	}, [companyDetail, stateList]);

	useEffect(() => {
		(async () => {
			if (sendOTPerror.email != undefined && email != "") {
				setScreenName("Email");
				setIsEmailScreen(true);
				setIsNameScreen(false);
				setIsAddrScreen(false);
				setIsFullNameScreen(false);
				setIsPhoneScreen(false);
				setIsEmail(true);
				setEmailMsg(sendOTPerror.email);
			} else if (sendOTPerror.mobile && phoneNumb != "") {
				setIsEmailScreen(false);
				setScreenName("Cell Phone");
				setIsPhoneScreen(true);
				setIsNameScreen(false);
				setIsAddrScreen(false);
				setIsFullNameScreen(false);
				setIsEmail(false);
				setIsPhone(true);
				setPhoneMsg(sendOTPerror.mobile);
			} else {
				if (sendOTPerror.length > 1) {
					showMessage({
						message: JSON.stringify(sendOTPerror),
						type: "danger",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				}
			}
		})();
	}, [sendOTPerror]);

	const gotoBackScreen = () => {
		if (isEmailScreen) {
			setIsPhoneScreen(true);
			setScreenName("Cell Phone");

			setIsEmailScreen(false);
			setIsFullNameScreen(false);
			setIsAddrScreen(false);
			setIsNameScreen(false);
		} else if (isPhoneScreen) {
			setIsFullNameScreen(true);
			setScreenName("Full Name");

			setIsEmailScreen(false);
			setIsPhoneScreen(false);
			setIsAddrScreen(false);
			setIsNameScreen(false);
		} else if (isFullNameScreen) {
			setIsAddrScreen(true);
			setScreenName("Company Address");

			setIsEmailScreen(false);
			setIsPhoneScreen(false);
			setIsFullNameScreen(false);
			setIsNameScreen(false);
		} else if (isAddrScreen) {
			clearAllAddressFields();
			setIsNameScreen(true);
			setScreenName("Company Name");

			setIsEmailScreen(false);
			setIsPhoneScreen(false);
			setIsFullNameScreen(false);
			setIsAddrScreen(false);
		} else {
			props.navigation.goBack();
		}
		return true;
	};
	const onChangeCompanyName = (text) => {
		let validateInput = isValidteSpacialChar(text);
		setCompanyName(validateInput);
		setIsCompanyName(false);
	};
	// const onChangeCompanyAddr = (text) => {
	// 	let validateInput = isValidteAddress(text);
	// 	setCompanyAddr(validateInput);
	// 	setIsCompanyAddr(false);
	// };
	const onChangeAddress2 = (text) => {
		let validateInput = isValidteAddress(text);
		setAddress2(validateInput);
		setIsAddress2(false);
	};
	const onChangeGoogleAddress = (text) => {
		setAddressSelection(undefined);
		if (text?.length === 0 && googleAddress?.length === 1) {
			setGoogleAddress("");
			setPrevGoogleAddress("");
			setGoogleAddressCoords(null);
		} else {
			setGoogleAddress(text);
			if (text !== prevGoogleAddress && googleAddress !== prevGoogleAddress) {
				setGoogleAddressCoords(null);
			}
		}
	};
	const onPressGoogleAddr = async (address, latLng) => {
		if (address && latLng) {
			const { zipCode1, city1, state1, localAddress } =
				await getCityStateCountryByAddress(
					latLng.latitude,
					latLng.longitude,
					address
				);

			setIsGoogleAddress(false);

			if (localAddress) {
				refGoogleAddress?.current?.setAddressText(localAddress);
				setGoogleAddress(localAddress);
				setPrevGoogleAddress(localAddress);
				setGoogleAddressCoords(latLng);
			}

			if (city1) {
				setCity(city1);
				setCityPress(false);
				setIsCity(false);
				setCityMsg("");
			}

			if (state1) {
				if (state1 && stateList?.data.length > 0) {
					const selectedState = stateList.data.find(
						(item) => item.name === state1
					);

					setState(state1);
					setStateCode(selectedState?.code);
					setStatePress(false);
					setIsState(false);
					setStateMsg("");
				}
			}

			if (zipCode1) {
				setZip(zipCode1);
				setZipPress(false);
				setIsZip(false);
				setZipMsg("");
			}

			setTimeout(() => {
				setAddressSelection({ start: 1, end: 1 });
			}, 200);
		}
	};
	const onBlurGoogleAddress = () => {
		if (!isGoogleAddress && googleAddress !== prevGoogleAddress) {
			validateAddress(googleAddress);
		}
		if (!isGoogleAddress && googleAddress === prevGoogleAddress) {
			setIsGoogleAddress(true);
		}
		setGoogleAddressPress(false);
		setIsGoogleAddress(false);
	};
	const onFocusGoogleAddress = () => {
		setGoogleAddressPress(true);
		setIsGoogleAddress(false);
	};
	const onPressClearAddress = () => {
		setAddressSelection(undefined);
		setIsGoogleAddress(false);
		setGoogleAddress("");
		setPrevGoogleAddress("");
		setGoogleAddressCoords(null);
		setGoogleAddressMsg("");
		setGoogleAddressPress(true);
		if (refGoogleAddress?.current) {
			refGoogleAddress?.current?.setAddressText("");
		}
	};
	const validateAddress = (text) => {
		if (!text) {
			setIsGoogleAddress(true);
			setGoogleAddressMsg("Please select a valid address from the list");
		} else {
			setIsGoogleAddress(false);
			setGoogleAddressMsg("");
		}
	};
	const onChangeCity = (text) => {
		let validateInput = isValidteSpacialChar(text);
		setCity(validateInput);
		setIsCity(false);
	};
	const onChangeZip = (text) => {
		let validateInput = isVerifyNumb(text);
		setZip(validateInput);
		setIsZip(false);
	};
	const clearAllAddressFields = () => {
		setGoogleAddress("");
		setPrevGoogleAddress("");
		setGoogleAddressCoords(null);
		setAddressSelection(undefined);
		setGoogleAddressMsg("");
		setIsGoogleAddress(false);
		setGoogleAddressPress(true);
		setAddressFromList(false);
		if (refGoogleAddress?.current) {
			refGoogleAddress?.current?.setAddressText("");
		}

		setAddress2("");
		setAddress2Msg("");
		setIsAddress2(false);
		setAddress2Press(true);
		setIsDisableAddress2(false);

		setCity("");
		setCityMsg("");
		setIsCity(false);
		setCityPress(true);

		setState("");
		setStateCode("");
		setStateMsg("");
		setIsState(false);
		setStatePress(true);

		setZip("");
		setZipMsg("");
		setIsZip(false);
		setZipPress(true);
	};
	const onChangeName = (text) => {
		let validateInput = isValidteSpacialCharNumb(text);
		setName(validateInput);
		setIsName(false);
	};
	const onChangePhone = (text) => {
		const match =
			text.match(/^(\+\d{1,4})[\s]?(\d{5})[\s]?(\d{5})$/) ||
			text.match(/^(\+\d{1,4})(\d{10})$/);
		let callingCode = null;
		let number = null;

		if (match) {
			callingCode = match[1];
			number = match[2] && match[3] ? match[2] + match[3] : match[2];
		}

		if (callingCode && number) {
			let numberCountryCode = getCountryFromCode(callingCode);
			let formattedNo = formatMobileNumber(number, "write");

			setCallingCode(callingCode);
			setCountryCode(numberCountryCode);
			setPhoneNumb(number);
			setPhone(formattedNo);
			setIsPhone(false);
		} else {
			let formatedNo = formatMobileNumber(text, backPhone);
			setPhone(formatedNo);
			setPhoneNumb(text);
			setIsPhone(false);
		}
	};
	const onSelectCountry = (country) => {
		setCountryCode(country.cca2);
		setCallingCode(`+${country.callingCode[0]}`);
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
	const gotoCompanyAddrScreen = async () => {
		if (isEmpty(companyName)) {
			setIsCompanyName(true);
			setCompanyNameMsg(MESSAGE.companyName);
			return false;
		} else if (companyName) {
			try {
				setIsLoading(true);
				const companyRes = await Api.get(
					`user/check-company?company_name=${companyName}`
				).then((res) => {
					return res;
				});
				setIsLoading(false);
				if (companyRes.success) {
					if (!Array.isArray(companyRes.data)) {
						setCompanyDetail(companyRes.data);
						setIsNewCompany(false);

						setIsNameScreen(false);
						setScreenName("Company Address");
						setIsAddrScreen(true);
					} else {
						setCompanyDetail(null);
						setIsNewCompany(true);

						setIsNameScreen(false);
						setScreenName("Company Address");
						setIsAddrScreen(true);
					}
				}
			} catch (error) {
				setIsLoading(false);
				console.warn(error);
			}
		}
	};
	const isCompanyAddressValidation = () => {
		let isValid = true;

		if (isEmpty(googleAddress)) {
			setIsGoogleAddress(true);
			setGoogleAddressMsg(MESSAGE.companyAddr);
			isValid = false;
		}
		if (!googleAddressCoords) {
			setIsGoogleAddress(true);
			setGoogleAddressMsg("Please enter valid company address");
			isValid = false;
		}
		if (isEmpty(city)) {
			setIsCity(true);
			setCityMsg(MESSAGE.city);
			isValid = false;
		}
		if (isEmpty(state)) {
			setIsState(true);
			setStateMsg("Select state");
			isValid = false;
		}
		if (isEmpty(stateCode)) {
			setIsState(true);
			setStateMsg("Select state");
			isValid = false;
		}
		if (isEmpty(zip)) {
			setIsZip(true);
			setZipMsg(MESSAGE.zip);
			isValid = false;
		} else {
			if (zip.length !== 5 && zip.length !== 9) {
				setIsZip(true);
				setZipMsg(MESSAGE.validateZip);
				isValid = false;
			}
			return isValid;
		}
	};
	const uppercaseFirstLatter = (string) => {
		if (!string) return;
		const capitalized = string
			.toLowerCase()
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		return capitalized;
	};
	const companyAddressVerification = async () => {
		const isValid = isCompanyAddressValidation();
		if (isValid) {
			try {
				setIsLoading(true);

				const payload = {
					address: googleAddress || prevGoogleAddress,
					city: city,
					state: stateCode,
					zip_code: zip,
				};

				const response = await Api.post("user/verifyAddress", payload);
				setIsLoading(false);

				if (response.success) {
					const addressRes = response?.data?.address;
					if (response?.data?.is_address_valid) {
						gotoFullNameScreen();
					} else {
						const addressEntered = {
							address: googleAddress || prevGoogleAddress,
							city: city,
							state: state,
							stateCode: stateCode,
							zip_code: zip,
						};

						const selectedState = stateList.data.find(
							(item) => item.code === addressRes?.state
						);

						const suggestion = {
							address: uppercaseFirstLatter(addressRes?.streetAddress),
							city: uppercaseFirstLatter(addressRes?.city),
							state: selectedState?.name,
							stateCode: selectedState?.code,
							zip_code: addressRes?.ZIPCode,
						};

						setEnteredAddress(addressEntered);
						setSuggestedAddress(suggestion);
						setShowAddressesPanel(true);
					}
				} else {
					showMessage({
						message: response?.data?.data?.message
							? response?.data?.data?.message
							: response?.data?.error?.message,
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
	const onChangeSuggestedAddress = async () => {
		setGoogleAddress(suggestedAddress?.address);
		setPrevGoogleAddress(suggestedAddress?.address);
		setGoogleAddressCoords({ latitude: 1.1, longitude: 1.1 });
		setGoogleAddressPress(false);
		if (suggestedAddress?.address) {
			refGoogleAddress?.current?.setAddressText(suggestedAddress?.address);
		}

		setCity(suggestedAddress?.city);
		setCityPress(false);

		setZip(suggestedAddress?.zip_code.toString());
		setZipPress(false);

		setState(suggestedAddress?.state);
		setStateCode(suggestedAddress?.stateCode);
		setStatePress(false);
	};
	const gotoFullNameScreen = () => {
		setIsNameScreen(false);
		setIsAddrScreen(false);
		setScreenName("Full Name");
		setIsFullNameScreen(true);
	};
	const gotoPhoneNumbScreen = () => {
		if (isEmpty(name)) {
			setIsName(true);
			setNameMsg(MESSAGE.fullName);
			return false;
		}
		setIsNameScreen(false);
		setIsAddrScreen(false);
		setIsFullNameScreen(false);
		setScreenName("Cell Phone");
		setIsPhoneScreen(true);

		getPhoneNumber();
	};
	function isMobileValid(text) {
		if (text.length === 10) {
			return false;
		} else {
			return true;
		}
	}
	const gotoEmailScreen = async () => {
		try {
			let cleaned = phone.replace(/\D/g, "");

			setPhoneNumb(cleaned);
			if (isEmpty(cleaned)) {
				setIsPhone(true);
				setPhoneMsg(MESSAGE.phone);
				return false;
			}
			if (isMobileValid(cleaned)) {
				setIsPhone(true);
				setPhoneMsg(MESSAGE.validatePhone);
				return false;
			}

			setIsLoading(true);
			const payload = {
				mobile: `${callingCode} ${cleaned}`,
			};
			const mobileRes = await Api.post(`user/verify-mobile`, payload);
			setIsLoading(false);

			if (mobileRes?.success) {
				setIsNameScreen(false);
				setIsAddrScreen(false);
				setIsFullNameScreen(false);
				setIsPhoneScreen(false);
				setScreenName("Email");
				setIsEmailScreen(true);
			} else {
				setIsPhone(true);
				setPhoneMsg(mobileRes?.data?.mobile);
				return false;
			}
		} catch (error) {
			setIsLoading(false);
			console.warn("Error: ", error);
		}
	};
	const isEmailValidation = () => {
		let isValid = true;
		if (isEmpty(email)) {
			setIsEmail(true);
			setEmailMsg(MESSAGE.email);
			isValid = false;
		} else if (!isEmailValidate(email)) {
			setIsEmail(true);
			setEmailMsg(MESSAGE.validateEmail);
			isValid = false;
		}
		// Return validation result
		return isValid;
	};
	function getCountryFromCode(initCallingCode) {
		if (!initCallingCode) return null;

		const callingCode = initCallingCode.replace("+", "");

		const countries = getCountries();
		for (const country of countries) {
			if (getCountryCallingCode(country) === callingCode) {
				return country;
			}
		}

		return null;
	}
	const getPhoneNumber = async () => {
		try {
			const number = await requestHint();
			if (number && number.startsWith("+")) {
				let countryCallingCode = number.slice(1, number.length - 10);

				let numberCountryCode = getCountryFromCode(countryCallingCode);

				let digits = number.slice(-10).replace(/\D/g, "");

				let formattedNo = formatMobileNumber(digits, "write");

				setCallingCode(`+${countryCallingCode}`);
				setCountryCode(numberCountryCode);
				setPhone(formattedNo);
				setPhoneNumb(digits);
				setIsPhone(false);
			}
		} catch (error) {
			console.warn("Error fetching phone number: ", error);
		}
	};
	const gotoVerifyAccount = async () => {
		const isValid = isEmailValidation();
		if (isValid) {
			const cleanMobile = `${callingCode} ${phoneNumb || registerData.mobile}`;

			const signupData = {
				company_name: companyName.trim() || registerData.company_name,
				company_address: googleAddress.trim() || registerData.company_address,
				company_address_2: address2.trim() || registerData.company_address2,
				is_address_validate: isVerifiedAddress ? 1 : 0,
				city: city.trim() || registerData.city,
				state: stateCode.trim() || registerData.state,
				zip_code: zip || registerData.zip_code,
				full_name: name.trim() || registerData.full_name,
				mobile: cleanMobile,
				email: email.trim() || registerData.email,
				device_token: "www",
				isNewCompany: isNewCompany,
			};
			await storeData("registerUser", signupData);
			const params = {
				mobile: signupData.mobile,
				email: signupData.email,
			};

			const data = {
				params: params,
				type: "SIGNUP",
			};

			dispatch(sendOTPRequested(data, props.navigation));
		}
	};

	return (
		<>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={[AuthStyle.mainContainer, AuthStyle.backgroundWhite]}
				keyboardVerticalOffset={
					Platform.OS === "ios" ? 0 : isKeyboardVisible ? 0 : -40
				}
			>
				<Loader show={isLoading} />
				<DarkHeader
					iconName={"angle-left"}
					iconSetName={"FontAwesome6"}
					iconColor={Colors.backArrowWhite}
					iconSize={24}
					whiteLabel={"Enter"}
					grayLabel={screenName}
					onPress={() => gotoBackScreen()}
					isSubIcon={true}
					subIconSetName={"MaterialCommunityIcons"}
					subIconName={"login"}
					subIconColor={Colors.backArrowWhite}
					subIconSize={24}
					subIconMainStyle={{
						transform: [
							{
								rotateZ: "180deg",
							},
						],
					}}
					onPressSubIcon={() => {
						props.navigation.goBack();
					}}
				/>
				{!isLoading && (
					<SafeAreaView style={{ flex: 1 }}>
						{isNameScreen ? (
							<View>
								<View style={[AuthStyle.signUpContainer]}>
									<Input
										isDarkBG={true}
										value={companyName}
										placeholder={"Company Name"}
										maxLength={30}
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
										inputMainStyle={{ ...LayoutStyle.marginBottom20 }}
									/>
								</View>
								<View style={[AuthStyle.nextBtn]}>
									<Button
										onPress={() => gotoCompanyAddrScreen()}
										isBtnActive={true}
										btnName={"Next"}
										btnColor={Colors.secondary}
										btnLabelColor={Colors.white}
									/>
								</View>
							</View>
						) : isAddrScreen ? (
							<View style={{ flex: 1 }}>
								<View style={[AuthStyle.signUpContainer]}>
									<DarkLocationInput
										forwardRef={refGoogleAddress}
										isDarkBG={true}
										value={googleAddress || prevGoogleAddress}
										location={googleAddressCoords}
										isValidationShow={isGoogleAddress}
										validationMessage={googleAddressMsg}
										placeholder={"Address"}
										iconName={"office-building-marker-outline"}
										iconSetName={"MaterialCommunityIcons"}
										keyboardType={"default"}
										returnKeyType={"done"}
										country={"country:us"}
										blurOnSubmit={true}
										locationSelection={addressSelection}
										onChangeText={(text) => onChangeGoogleAddress(text)}
										onPressLocation={(address, latLng) =>
											onPressGoogleAddr(address, latLng)
										}
										onBlur={() => onBlurGoogleAddress()}
										onFocus={() => onFocusGoogleAddress()}
										isPressOut={googleAddressPress}
										onPressFocus={() => setGoogleAddressPress(true)}
										// onPressClear={() => onPressClearAddress()}
										onPressClear={() => clearAllAddressFields()}
										rowBackgroundColor={Colors.primary}
										disabledBtn={companyDetail?.company_address ? true : false}
										listHeight={130}
										// inputMainStyle={{ ...LayoutStyle.marginBottom20 }}
									/>
									<Input
										isDarkBG={true}
										value={address2}
										maxLength={30}
										placeholder={"Address 2"}
										onChangeText={(text) => onChangeAddress2(text)}
										iconName={"office-building-outline"}
										iconSetName={"MaterialCommunityIcons"}
										textContentType={"fullStreetAddress"}
										autoComplete={"street-address"}
										isValidationShow={isAddress2}
										validationMessage={address2Msg}
										keyboardType={"default"}
										returnKeyType={"done"}
										blurOnSubmit={true}
										onFocus={() => setAddress2Press(true)}
										onBlur={() => setAddress2Press(false)}
										isPressOut={address2Press}
										onPressFocus={() => setAddress2Press(true)}
										inputMainStyle={{ ...LayoutStyle.marginTop20 }}
										editable={
											companyDetail?.company_address_2 || isDisableAddress2
												? false
												: true
										}
										disabledBtn={
											companyDetail?.company_address_2 || isDisableAddress2
												? true
												: false
										}
									/>
									<Input
										isDarkBG={true}
										value={city}
										placeholder={"City"}
										maxLength={20}
										iconName={"city-variant-outline"}
										iconSetName={"MaterialCommunityIcons"}
										onChangeText={(text) => onChangeCity(text)}
										isValidationShow={iscity}
										validationMessage={cityMsg}
										keyboardType={"default"}
										returnKeyType={"done"}
										blurOnSubmit={true}
										onFocus={() => setCityPress(true)}
										onBlur={() => setCityPress(false)}
										isPressOut={cityPress}
										onPressFocus={() => setCityPress(true)}
										inputMainStyle={{ ...LayoutStyle.marginTop20 }}
										editable={companyDetail?.city ? false : true}
										disabledBtn={companyDetail?.city ? true : false}
									/>
									<DropDown
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
											setIsState(true);
										}}
										onPressFocus={() => {
											setStatePress(true);
											setIsState(false);
										}}
										onBlur={() => setIsState(false)}
										onChange={(item) => {
											setIsState(false);
											setState(item.name);
											setStateCode(item.code);
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
										mainDropdownStyle={{
											...LayoutStyle.marginTop20,
										}}
										disable={companyDetail?.state ? true : false}
										disableBtn={companyDetail?.state ? true : false}
									/>
									<Input
										isDarkBG={true}
										value={zip}
										placeholder={"Zip"}
										maxLength={9}
										onChangeText={(text) => onChangeZip(text)}
										iconName={"map-marker-outline"}
										iconSetName={"MaterialCommunityIcons"}
										isValidationShow={isZip}
										validationMessage={zipMsg}
										keyboardType={"numeric"}
										returnKeyType={"done"}
										blurOnSubmit={true}
										onFocus={() => setZipPress(true)}
										onBlur={() => setZipPress(false)}
										isPressOut={zipPress}
										onPressFocus={() => setZipPress(true)}
										inputMainStyle={{ ...LayoutStyle.marginVertical20 }}
										editable={companyDetail?.zip_code ? false : true}
										disabledBtn={companyDetail?.zip_code ? true : false}
									/>
								</View>
								<View style={[AuthStyle.nextBtn]}>
									<Button
										onPress={() => {
											if (!companyDetail) {
												companyAddressVerification();
											} else {
												gotoFullNameScreen();
											}
										}}
										isBtnActive={true}
										btnName={"Next"}
										btnColor={Colors.secondary}
										btnLabelColor={Colors.white}
									/>
								</View>
							</View>
						) : isFullNameScreen ? (
							<View>
								<View style={[AuthStyle.signUpContainer]}>
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
										textContentType={"name"}
										autoComplete={"name"}
										autoCapitalize={"words"}
										autoCorrect={false}
										blurOnSubmit={true}
										onFocus={() => setNamePress(true)}
										onBlur={() => setNamePress(false)}
										isPressOut={namePress}
										onPressFocus={() => setNamePress(true)}
										inputMainStyle={{ ...LayoutStyle.marginBottom20 }}
									/>
								</View>
								<View style={[AuthStyle.nextBtn]}>
									<Button
										onPress={() => gotoPhoneNumbScreen()}
										isBtnActive={true}
										btnName={"Next"}
										btnColor={Colors.secondary}
										btnLabelColor={Colors.white}
									/>
								</View>
							</View>
						) : isPhoneScreen ? (
							<View>
								<View style={[AuthStyle.signUpContainer]}>
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
												isValidationShow={isPhone}
												validationMessage={phoneMsg}
												keyboardType={"phone-pad"}
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
								</View>
								<View style={[AuthStyle.nextBtn]}>
									<Button
										onPress={() => gotoEmailScreen()}
										isBtnActive={true}
										btnName={"Next"}
										btnColor={Colors.secondary}
										btnLabelColor={Colors.white}
									/>
								</View>
							</View>
						) : isEmailScreen ? (
							<View>
								<View style={[AuthStyle.signUpContainer]}>
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
										returnKeyType={"done"}
										textContentType="emailAddress"
										autoComplete="email"
										keyboardType={"email-address"}
										autoCapitalize={"none"}
										blurOnSubmit={true}
										onFocus={() => setEmailPress(true)}
										onBlur={() => setEmailPress(false)}
										isPressOut={emailPress}
										onPressFocus={() => setEmailPress(true)}
										inputMainStyle={{ ...LayoutStyle.marginBottom20 }}
									/>
								</View>
								<View style={[AuthStyle.nextBtn]}>
									<Button
										onPress={() => gotoVerifyAccount()}
										isBtnActive={true}
										btnName={"Next"}
										btnColor={Colors.secondary}
										btnLabelColor={Colors.white}
									/>
								</View>
							</View>
						) : null}
					</SafeAreaView>
				)}
				{showAddressesPanel && (
					<NearByAddressPanel
						show={showAddressesPanel}
						onHide={() => {
							setShowAddressesPanel(false);
						}}
						enteredAddress={enteredAddress}
						suggestedAddress={suggestedAddress}
						onContinue={async (address) => {
							setShowAddressesPanel(false);
							if (address === "suggestedAddress") {
								await onChangeSuggestedAddress();
								gotoFullNameScreen();
							} else {
								setIsVerifiedAddress(false);
								gotoFullNameScreen();
							}
						}}
					/>
				)}
			</KeyboardAvoidingView>
		</>
	);
};

export default SignupScreen;
