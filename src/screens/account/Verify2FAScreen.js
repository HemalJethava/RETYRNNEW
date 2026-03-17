import {
	View,
	Text,
	KeyboardAvoidingView,
	ScrollView,
	TouchableOpacity,
	BackHandler,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Button, DarkHeader, Input, Loader } from "../../components";
import LayoutStyle from "../../styles/LayoutStyle";
import AuthStyle from "../../styles/AuthStyle";
import Colors from "../../styles/Colors";
import MESSAGE from "../../utils/Messages";
import {
	sendOTPWithTokenRequest,
	verify2FAWithTokenRequest,
} from "./redux/Action";
import { isEmpty, isOTP, isVerifyNumb } from "../../utils/Validation";
import { useDispatch, useSelector } from "react-redux";
import { hideMessage } from "react-native-flash-message";
import { OTPTimer } from "../../components/OTPTimer";
import RNOtpVerify from "react-native-otp-verify";

const Verify2FAScreen = (props) => {
	// declare useDispatch hook
	const dispatch = useDispatch();

	const type = props.route.params?.type;
	const isLoading = useSelector((state) => state.Account.isLoading);

	const [otp, setOtp] = useState("");
	const [otpMsg, setOtpMsg] = useState("");
	const [isOtp, setIsOtp] = useState(false);
	const [otpPress, setOtpPress] = useState(true);
	const [isTimerActive, setIsTimerActive] = useState(true);
	const [timeLeft, setTimeLeft] = useState(120);
	const [isResendOtp, setIsResendOtp] = useState(false);
	const [isAutoFetched, setIsAutoFetched] = useState(false);

	useEffect(() => {
		const backAction = () => {
			props.navigation.goBack();
			hideMessage();
			return true;
		};

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			backAction
		);
		return () => backHandler.remove();
	}, []);

	useEffect(() => {
		RNOtpVerify.getHash().then(console.log).catch(console.error);

		RNOtpVerify.getOtp()
			.then((p) =>
				RNOtpVerify.addListener((message) => {
					console.log("message: ", message);
					const otpMatch = /(\d{5})/g.exec(message);
					if (otpMatch) {
						setOtp(otpMatch[1]);
						setIsAutoFetched(true);
					}
				})
			)
			.catch(console.error);

		return () => RNOtpVerify.removeListener();
	}, []);

	useEffect(() => {
		if (isAutoFetched && otp) {
			onPressOTPVerify();
			setIsAutoFetched(false);
		}
	}, [otp, isAutoFetched]);

	const gotoBack = () => {
		props.navigation.goBack();
		hideMessage();
	};
	const onChangeOTP = (text) => {
		const validateInput = isVerifyNumb(text);
		setOtp(validateInput);
		setIsOtp(false);
		setIsAutoFetched(false);
	};
	const gotoResendOTP = () => {
		setIsResendOtp(true);
		setIsTimerActive(true);
		setTimeLeft(120);
		const params = {
			mobile: props.route.params?.params.mobile,
			email: props.route.params?.params.email,
			type: type === "2FA" ? "2FA" : "edit_profile",
		};
		dispatch(sendOTPWithTokenRequest(params, props.navigation));
	};
	const onPressOTPVerify = async () => {
		if (isEmpty(otp)) {
			setIsOtp(true);
			setOtpMsg(MESSAGE.otp);
			return false;
		} else if (isOTP(otp)) {
			setIsOtp(true);
			setOtpMsg(MESSAGE.validateOTP);
			return false;
		}

		const params = {
			mobile: props.route.params?.params.mobile,
			email: props.route.params?.params.email,
			otp: otp,
			type: type === "2FA" ? "2FA" : "edit_profile",
		};
		dispatch(verify2FAWithTokenRequest(params, props.navigation));
	};

	return (
		<>
			<Loader show={isLoading} />
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={[AuthStyle.mainContainer, AuthStyle.backgroundWhite]}
			>
				<DarkHeader
					iconName={"angle-left"}
					iconSetName={"FontAwesome6"}
					iconColor={Colors.backArrowWhite}
					iconSize={24}
					whiteLabel={"Verify"}
					grayLabel={type}
					onPress={() => gotoBack()}
				/>
				<View style={[AuthStyle.verifyContainer]}>
					<Text style={[AuthStyle.headerTitle]}>
						{
							"We have sent you a SMS on your mobile number with a 5 digit OTP number."
						}
					</Text>

					<ScrollView showsVerticalScrollIndicator={false}>
						<Input
							isDarkBG={true}
							value={otp}
							placeholder={"OTP Code"}
							maxLength={5}
							onChangeText={(text) => onChangeOTP(text)}
							iconName={"hash"}
							iconSetName={"Feather"}
							isValidationShow={isOtp}
							validationMessage={otpMsg}
							keyboardType={"numeric"}
							returnKeyType={"done"}
							blurOnSubmit={true}
							onFocus={() => setOtpPress(true)}
							onBlur={() => setOtpPress(false)}
							isPressOut={otpPress}
							onPressFocus={() => setOtpPress(true)}
							inputMainStyle={{ ...LayoutStyle.marginTop20 }}
							textContentType="oneTimeCode"
							autoComplete="sms-otp"
						/>
						<OTPTimer
							isTimerActive={isTimerActive}
							setIsTimerActive={setIsTimerActive}
							timeLeft={timeLeft}
							setTimeLeft={setTimeLeft}
						/>
						<TouchableOpacity
							style={{ opacity: isTimerActive ? 0.4 : 1 }}
							disabled={isTimerActive}
							onPress={() => gotoResendOTP()}
						>
							<View
								style={[AuthStyle.resendBtnContainer, { paddingVertical: 0 }]}
							>
								<Text style={[AuthStyle.resendBtn]}>{"Resend OTP"}</Text>
							</View>
						</TouchableOpacity>
					</ScrollView>
				</View>
				<View style={[AuthStyle.verifyBtn]}>
					<Button
						onPress={() => onPressOTPVerify()}
						isBtnActive={true}
						btnName={type === "Account" ? "Continue" : "Update"}
						btnColor={Colors.secondary}
						btnLabelColor={Colors.white}
					/>
				</View>
			</KeyboardAvoidingView>
		</>
	);
};

export default Verify2FAScreen;
