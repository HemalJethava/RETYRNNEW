import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	KeyboardAvoidingView,
	TouchableOpacity,
	ScrollView,
	BackHandler,
	Platform,
	PermissionsAndroid,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { resendOTPRequest, verifyOTPRequested } from "./redux/Action";
import { Button, DarkHeader, Input, Loader } from "../../components";
import { isEmpty, isOTP, isVerifyNumb } from "../../utils/Validation";
import LayoutStyle from "../../styles/LayoutStyle";
import AuthStyle from "../../styles/AuthStyle";
import Colors from "../../styles/Colors";
import MESSAGE from "../../utils/Messages";
import { CommonActions } from "@react-navigation/native";
import { hideMessage } from "react-native-flash-message";
import messaging, { getMessaging } from "@react-native-firebase/messaging";
import { OTPTimer } from "../../components/OTPTimer";
import RNOtpVerify from "react-native-otp-verify";

const VerifyAccountScreen = (props) => {
	const dispatch = useDispatch();
	const type = props.route.params?.type;
	const isLoading = useSelector((state) => state.Auth.isLoading);

	const [otp, setOtp] = useState("");
	const [otpMsg, setOtpMsg] = useState("");
	const [isOtp, setIsOtp] = useState(false);
	const [otpPress, setOtpPress] = useState(true);
	const [fcmToken, setFcmToken] = useState("");
	const [isTimerActive, setIsTimerActive] = useState(true);
	const [timeLeft, setTimeLeft] = useState(120);
	const [isAutoFetched, setIsAutoFetched] = useState(false);

	const requestNotificationPermission = async () => {
		const messagingInstance = getMessaging();
		const authStatus = await messagingInstance.requestPermission();
		const enabled =
			authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
			authStatus === messaging.AuthorizationStatus.PROVISIONAL;

		if (enabled) {
			messagingInstance
				.getToken()
				.then((token) => {
					setFcmToken(token);
				})
				.catch((err) => console.warn(err));
		}
		if (Platform.OS === "android") {
			await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
			);
		}
	};

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
		requestNotificationPermission();
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
			verifyOtp();
			setIsAutoFetched(false);
		}
	}, [otp, isAutoFetched]);

	const gotoLoginScreen = () => {
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
		setIsTimerActive(true);
		setTimeLeft(120);
		const params = {
			mobile: props.route.params.mobile,
			email: props.route.params.email,
			type: "2FA",
		};
		dispatch(resendOTPRequest(params, props.navigation));
	};
	const verifyOtp = () => {
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
			mobile: props.route.params.mobile,
			email: props.route.params.email,
			otp: otp,
			fcmToken: fcmToken,
			login_with_code: type === "CODE" ? true : false,
		};
		const data = {
			params: params,
			type: type === "SIGNUP" ? "SIGNUP" : type === "2FA" ? "2FA" : "CODE",
		};
		dispatch(verifyOTPRequested(data, props.navigation));
		hideMessage();
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
					grayLabel={"Account"}
					onPress={() => gotoLoginScreen()}
					isSubIcon={type === "SIGNUP" ? true : false}
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
						props.navigation.dispatch(
							CommonActions.reset({
								index: 1,
								routes: [{ name: "Login" }],
							})
						);
					}}
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
							textContentType="oneTimeCode"
							autoComplete="sms-otp"
							blurOnSubmit={true}
							onFocus={() => setOtpPress(true)}
							onBlur={() => setOtpPress(false)}
							isPressOut={otpPress}
							onPressFocus={() => setOtpPress(true)}
							inputMainStyle={{ ...LayoutStyle.marginTop20 }}
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
						onPress={() => verifyOtp()}
						isBtnActive={true}
						btnName={"Next"}
						btnColor={Colors.secondary}
						btnLabelColor={Colors.white}
					/>
				</View>
			</KeyboardAvoidingView>
		</>
	);
};

export default VerifyAccountScreen;
