import React, { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import AuthStyle from "../../styles/AuthStyle";
import Colors from "../../styles/Colors";
import FontFamily from "../../assets/fonts/FontFamily";
import { Button, Icons, Input } from "../../components";
import LayoutStyle from "../../styles/LayoutStyle";
import CommonStyles from "../../styles/CommonStyles";
import { isEmailValidate, isEmpty } from "../../utils/Validation";
import MESSAGE from "../../utils/Messages";
import { styles } from "../../styles/ForgotPasswordStyle";
import { showMessage } from "react-native-flash-message";
import { CaptchaVerification } from "./component/CaptchaVerification";
import Api from "../../utils/Api";
import ComponentStyles from "../../styles/ComponentStyles";
import moment from "moment";

const ForgotPasswordScreen = (props) => {
	const inputsRef = useRef([]);

	const [screenType, setScreenType] = useState("email");
	const [showCaptcha, setShowCaptcha] = useState(false);

	const [timeZone, setTimeZone] = useState("");

	const [email, setEmail] = useState("");
	const [isEmail, setIsEmail] = useState(false);
	const [emailMsg, setEmailMsg] = useState("");
	const [emailPress, setEmailPress] = useState(true);
	const [isEmailLoading, setIsEmailLoading] = useState(false);

	const [captchaDetail, setCapctchaDetail] = useState(null);

	const [isOtpLoading, setIsOtpLoading] = useState(false);
	const [otp, setOtp] = useState(["", "", "", "", ""]);
	const [otpError, setOtpError] = useState(false);
	const [otpErrorMsg, setOtpErrorMsg] = useState("");
	const [timer, setTimer] = useState(120);
	const [isResendEnabled, setIsResendEnabled] = useState(false);

	const [isResendLoading, setIsResendLoading] = useState(false);

	const [isPasswdLoading, setIsPasswdLoading] = useState(false);
	const [passwd, setPasswd] = useState("");
	const [passwdMsg, setPasswdMsg] = useState("");
	const [ispasswd, setIsPasswd] = useState(false);
	const [passwdPress, setPasswdPress] = useState(true);
	const [isDisplayPassword, setIsDisplayPassword] = useState(false);

	const [confirmPasswd, setConfirmPasswd] = useState("");
	const [confirmPasswdMsg, setConfirmPasswdMsg] = useState("");
	const [isconfirmPasswd, setIsConfirmPasswd] = useState(false);
	const [confirmPasswdPress, setConfirmPasswdPress] = useState(true);
	const [isDisplayPassword2, setIsDisplayPassword2] = useState(false);

	const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);
	const [failedCriteria, setFailedCriteria] = useState([]);
	const [criteriaMet, setCriteriaMet] = useState({
		length: false,
		uppercase: false,
		lowercase: false,
		number: false,
		specialChar: false,
	});

	useEffect(() => {
		if (screenType !== "otp") return;
		let interval;
		if (timer > 0) {
			interval = setInterval(() => {
				setTimer((prev) => prev - 1);
			}, 1000);
		} else {
			setIsResendEnabled(true);
		}
		return () => clearInterval(interval);
	}, [timer, screenType]);

	useEffect(() => {
		const tZone = moment.tz.guess();
		setTimeZone(tZone);
	}, []);

	const goBack = () => {
		if (screenType === "password" && screenType === "otp") {
			setScreenType("email");
			clearInPutFields();
		} else {
			props.navigation.goBack();
		}
	};
	const clearInPutFields = () => {
		if (confirmPasswd) {
			setConfirmPasswd("");
			setConfirmPasswdMsg("");
			setIsConfirmPasswd(false);
			setConfirmPasswdPress(true);
			setIsDisplayPassword2(false);
		}

		if (passwd) {
			setIsPasswdLoading(false);
			setPasswd("");
			setPasswdMsg("");
			setIsPasswd(false);
			setPasswdPress(true);
			setIsDisplayPassword(false);
		}

		if (otp) {
			setIsOtpLoading(false);
			setOtp(["", "", "", "", ""]);
			setOtpError(false);
			setOtpErrorMsg("");
			setTimer(120);
			setIsResendEnabled(false);
		}

		if (email) {
			setEmail("");
			setIsEmail(false);
			setEmailMsg("");
			setEmailPress(true);
			setIsEmailLoading(false);
		}
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
	const DescriptionComponent = ({
		iconLibrary,
		iconName,
		mainText,
		subText,
	}) => (
		<>
			<View style={styles.iconBox}>
				<Icons
					iconSetName={iconLibrary}
					iconName={iconName}
					iconColor={Colors.secondary}
					iconSize={30}
				/>
			</View>
			<Text style={styles.pageDesTxt}>{mainText}</Text>
			{subText && (
				<Text
					style={{
						color: Colors.labelDarkGray,
						fontSize: 13,
						fontFamily: FontFamily.PoppinsMedium,
					}}
				>
					{subText}
				</Text>
			)}
		</>
	);
	const isEmailValid = () => {
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
		return isValid;
	};
	const getCaptcha = async () => {
		try {
			let isValid = isEmailValid();
			if (isValid) {
				setIsEmailLoading(true);
				const data = { email };
				const details = await Api.post(`user/generate-captcha`, data);
				setIsEmailLoading(false);
				if (details?.success) {
					setCapctchaDetail(details?.data);
					setShowCaptcha(true);
				} else {
					setIsEmail(true);
					setEmailMsg(details?.message);
				}
			}
		} catch (error) {
			console.warn("Error: ", error);
			setIsEmailLoading(false);
		}
	};
	const onCaptchaSuccess = (message) => {
		showMessage({
			message: message,
			type: "success",
			floating: true,
			statusBarHeight: 40,
			icon: "auto",
			autoHide: true,
		});
		setShowCaptcha(false);
		setScreenType("otp");
	};
	const handleChangeOTP = (text, index) => {
		if (/^[0-9]$/.test(text)) {
			const newOtp = [...otp];
			newOtp[index] = text;
			setOtp(newOtp);
			setOtpError(false);
			if (index < otp.length - 1) {
				inputsRef.current[index + 1].focus();
			}
		} else if (text === "") {
			const newOtp = [...otp];
			newOtp[index] = "";
			setOtp(newOtp);
		}
	};
	const handleKeyPress = ({ nativeEvent }, index) => {
		if (nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
			inputsRef.current[index - 1].focus();
		}
	};
	const handleOTPVerify = async () => {
		try {
			const finalOtp = otp.join("");
			if (otp.includes("")) {
				setOtpError(true);
				return;
			}
			setOtpError(false);
			setIsOtpLoading(true);
			const payload = {
				email,
				otp: finalOtp,
			};
			console.log("payload: ", payload);

			const response = await Api.post(`user/verify-password-otp`, payload);
			setIsOtpLoading(false);
			if (response.success) {
				setScreenType("password");
				setTimer(0);
			} else {
				setOtpErrorMsg(response?.message);
			}
		} catch (error) {
			setIsOtpLoading(false);
			console.warn("Error: ", error);
		}
	};
	const handleResendOtp = async () => {
		try {
			if (isResendEnabled) {
				setIsResendLoading(true);
				const payload = {
					email,
					is_captcha_verified: 1,
					timezone: timeZone,
				};

				console.log("payload: ", payload);
				const response = await Api.post(`user/resend-password-otp`, payload);
				console.log("response: ", response);
				setIsResendLoading(false);

				if (response.success) {
					setTimer(120);
					setIsResendEnabled(false);
				} else {
					showMessage({
						message: response.message,
						type: "danger",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				}
			}
		} catch (error) {
			console.warn("Error: ", error);
		}
	};
	const formatTime = () => {
		const minutes = Math.floor(timer / 60);
		const seconds = timer % 60;
		return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
	};
	const onChangePasswd = (text) => {
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
	const onChangeConfirmPasswd = (text) => {
		setConfirmPasswd(text);
		setIsConfirmPasswd(false);
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
	const isFormPassValidation = () => {
		let isValid = true;

		if (isEmpty(passwd.trim())) {
			setIsPasswd(true);
			setPasswdMsg(MESSAGE.passwd);
			isValid = false;
		} else if (passwd) {
			let passwordValidStr = "Password should be ";
			let failed = [];

			if (!criteriaMet.length) {
				failed.push("at least 8 characters");
			} else {
				if (!criteriaMet.uppercase) {
					failed.push("at least 1 uppercase letter");
				}
				if (!criteriaMet.lowercase) {
					failed.push("at least 1 lowercase letter");
				}
				if (!criteriaMet.number) {
					failed.push("at least 1 number");
				}
				if (!criteriaMet.specialChar) {
					failed.push("at least 1 special character");
				}
			}
			setFailedCriteria(failed);
			if (failed.length > 0) {
				setIsPasswd(true);
				passwordValidStr += failed.join(", ");
				setPasswdMsg(passwordValidStr);
				isValid = false;
			}
		}
		if (isEmpty(confirmPasswd.trim())) {
			setIsConfirmPasswd(true);
			setConfirmPasswdMsg(MESSAGE.confirmPasswd);
			isValid = false;
		} else if (passwd.trim() !== confirmPasswd.trim()) {
			setIsConfirmPasswd(true);
			setConfirmPasswdMsg(MESSAGE.comparePasswd);
			isValid = false;
		}
		return isValid;
	};
	const handleResetPassword = async () => {
		try {
			const isValid = isFormPassValidation();
			if (isValid) {
				setIsPasswdLoading(true);
				const payload = {
					email: email,
					password: passwd,
					password_confirmation: confirmPasswd,
				};
				const response = await Api.post(`user/reset-password`, payload);
				if (response.success) {
					showMessage({
						message: response.message,
						type: "success",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
					props.navigation.goBack();
				} else {
					setIsConfirmPasswd(true);
					setConfirmPasswdMsg(response.message);
				}
			}
		} catch (error) {
			console.warn("Error: ", error);
			setIsPasswdLoading(false);
		}
	};
	const CommonButton = ({ loading, title, onPress }) => (
		<TouchableOpacity
			style={[
				styles.commonBtn,
				{ backgroundColor: loading ? Colors.disableBtn : Colors.secondary },
			]}
			disabled={loading}
			onPress={onPress}
		>
			{loading && <ActivityIndicator color={Colors.white} size={"small"} />}
			<Text style={[styles.btnTitle, { marginLeft: loading ? 5 : 0 }]}>
				{loading ? "Loading" : title}
			</Text>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView style={AuthStyle.flexContainer}>
			<KeyboardAvoidingView
				style={styles.flex}
				behavior={"padding"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -40}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<ScrollView
						contentContainerStyle={{ flexGrow: 1 }}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						<View style={styles.container}>
							<View
								style={[
									AuthStyle.loginHeaderRow,
									{ ...LayoutStyle.marginBottom10 },
								]}
							>
								<TouchableOpacity onPress={goBack} style={{ padding: 5 }}>
									<Icons
										iconSetName={"FontAwesome6"}
										iconName={"angle-left"}
										iconColor={Colors.labelBlack}
										iconSize={24}
									/>
								</TouchableOpacity>
								<Text style={styles.headerTxt}>{"Forgot Password"}</Text>
								<View />
							</View>
							{screenType === "email" ? (
								<View style={[styles.flexCenter]}>
									<View style={styles.middleContainer}>
										<DescriptionComponent
											iconLibrary={"Ionicons"}
											iconName={"finger-print"}
											mainText={"Forgot Your Password and Continue"}
										/>
										<Input
											isDarkBG={false}
											value={email}
											placeholder={"Enter email"}
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
											inputMainStyle={{ ...LayoutStyle.marginVertical20 }}
										/>
										<View style={styles.continueBtn}>
											<CommonButton
												loading={isEmailLoading}
												title={"Continue"}
												onPress={getCaptcha}
											/>
										</View>
										<TouchableOpacity
											style={styles.backLoginBtn}
											onPress={goBack}
										>
											<Icons
												iconSetName={"FontAwesome6"}
												iconName={"arrow-left"}
												iconColor={Colors.labelBlack}
												iconSize={18}
											/>
											<Text style={styles.backLoginTxt}>{"Back to Login"}</Text>
										</TouchableOpacity>
									</View>
								</View>
							) : screenType === "otp" ? (
								<View style={[styles.flexCenter]}>
									<View style={styles.middleContainer}>
										<DescriptionComponent
											iconLibrary={"Ionicons"}
											iconName={"mail-outline"}
											mainText={"Verify Your Email to Forgot Password"}
											subText={"Enter the 5-digit verification code"}
										/>
										<View style={styles.otpContainer}>
											{otp.map((digit, index) => (
												<TextInput
													key={index}
													ref={(ref) => (inputsRef.current[index] = ref)}
													style={[
														styles.input,
														{
															borderColor: digit
																? Colors.secondary
																: otpError
																? "red"
																: "#d4d4d4",
														},
													]}
													keyboardType="number-pad"
													maxLength={1}
													value={digit}
													onChangeText={(text) => handleChangeOTP(text, index)}
													onKeyPress={(e) => handleKeyPress(e, index)}
												/>
											))}
										</View>
										{otpErrorMsg && (
											<Text
												style={[
													ComponentStyles.validationMsg,
													{ marginTop: 0, marginBottom: 10 },
												]}
											>
												{otpErrorMsg}
											</Text>
										)}
										<View style={styles.continueBtn}>
											<CommonButton
												loading={isOtpLoading}
												title={"Continue"}
												onPress={handleOTPVerify}
											/>
										</View>
										<View style={styles.backLoginBtn}>
											{!isResendEnabled ? (
												<Text style={styles.receiveTxt}>
													Didn’t receive code? Resend in{" "}
													<Text style={{ color: Colors.secondary }}>
														{formatTime()}
													</Text>
												</Text>
											) : (
												<View style={{ ...CommonStyles.directionRowCenter }}>
													<Text style={[styles.receiveTxt]}>
														{"Didn't you receive any code? "}
													</Text>
													<TouchableOpacity
														style={{ opacity: isResendLoading ? 0.5 : 1 }}
														disabled={isResendLoading}
														onPress={handleResendOtp}
													>
														<Text
															style={[
																styles.resendTxt,
																{ color: Colors.secondary },
															]}
														>
															{"Resend Code"}
														</Text>
													</TouchableOpacity>
												</View>
											)}
										</View>
									</View>
								</View>
							) : (
								<View style={[styles.flexCenter]}>
									<View style={styles.middleContainer}>
										<DescriptionComponent
											iconLibrary={"MaterialIcons"}
											iconName={"lock-reset"}
											mainText={"Reset Password to Access Your Account"}
										/>
										<View>
											{showPasswordCriteria && (
												<View style={[styles.criteriaContainer]}>
													<View style={[styles.criteriaBox, {}]}>
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
														style={[
															styles.pinBox,
															{ right: passwdPress ? -12 : -28 },
														]}
													>
														<View style={[styles.pinIcon]}>
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
												isDarkBG={false}
												value={passwd}
												placeholder={"Password"}
												maxLength={16}
												secureTextEntry={!isDisplayPassword}
												onChangeText={(text) => onChangePasswd(text)}
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
													setPasswdPress(true);
													setShowPasswordCriteria(true);
												}}
												onBlur={() => {
													setPasswdPress(false);
													setShowPasswordCriteria(false);
												}}
												isPressOut={passwdPress}
												onPressFocus={() => {
													setPasswdPress(true);
													setShowPasswordCriteria(true);
												}}
												inputMainStyle={{
													...LayoutStyle.marginTop20,
													zIndex: 9,
												}}
											/>
										</View>
										<Input
											isDarkBG={false}
											value={confirmPasswd}
											placeholder={"Confirm Password"}
											maxLength={16}
											secureTextEntry={!isDisplayPassword2}
											onChangeText={(text) => onChangeConfirmPasswd(text)}
											iconName={"lock-outline"}
											iconSetName={"MaterialCommunityIcons"}
											isValidationShow={isconfirmPasswd}
											validationMessage={confirmPasswdMsg}
											keyboardType={"default"}
											returnKeyType={"done"}
											blurOnSubmit={true}
											onFocus={() => setConfirmPasswdPress(true)}
											onBlur={() => setConfirmPasswdPress(false)}
											isPressOut={confirmPasswdPress}
											onPressFocus={() => setConfirmPasswdPress(true)}
											isRightIcon={true}
											rightIconSetName={"MaterialCommunityIcons"}
											rightIconColor={Colors.secondary}
											rightIconName={isDisplayPassword2 ? "eye-off" : "eye"}
											onPressRightIcon={() =>
												setIsDisplayPassword2(!isDisplayPassword2)
											}
											inputMainStyle={{
												...LayoutStyle.marginVertical20,
												zIndex: 9,
											}}
										/>
										<View style={styles.continueBtn}>
											<CommonButton
												loading={isPasswdLoading}
												title={"Confirm"}
												onPress={handleResetPassword}
											/>
											<View style={{ ...LayoutStyle.marginTop20 }}>
												<Button
													btnName={"Cancel"}
													onPress={() => props.navigation.goBack()}
													isBtnActive={true}
													btnColor={Colors.lightGrayBG}
													btnLabelColor={Colors.labelDarkGray}
												/>
											</View>
										</View>
									</View>
								</View>
							)}
						</View>
					</ScrollView>
				</TouchableWithoutFeedback>

				{showCaptcha && (
					<CaptchaVerification
						show={showCaptcha}
						onHide={() => setShowCaptcha(false)}
						timeZone={timeZone}
						email={email}
						captchaDetail={captchaDetail}
						getCaptcha={getCaptcha}
						onSuccess={(message) => onCaptchaSuccess(message)}
					/>
				)}
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default ForgotPasswordScreen;
