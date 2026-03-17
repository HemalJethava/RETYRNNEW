import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	KeyboardAvoidingView,
	Platform,
	TouchableOpacity,
	StatusBar,
	PermissionsAndroid,
	Linking,
	TouchableWithoutFeedback,
	Keyboard,
	SafeAreaView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { loginRequest, loginWithCodeRequest } from "./redux/Action";
import { Button, Input, Loader, Icons } from "../../components";
import { isEmpty, isEmailValidate, isVerifyNumb } from "../../utils/Validation";
import LayoutStyle from "../../styles/LayoutStyle";
import AuthStyle from "../../styles/AuthStyle";
import Colors from "../../styles/Colors";
import MESSAGE from "../../utils/Messages";
import messaging, { getMessaging } from "@react-native-firebase/messaging";
import notifee, { AuthorizationStatus } from "@notifee/react-native";
import FastImage from "react-native-fast-image";
import IMAGES from "../../assets/images/Images";

const LoginScreen = (props) => {
	const dispatch = useDispatch();

	const isLoading = useSelector((state) => state.Auth.isLoading);
	const loginError = useSelector((state) => state.Auth.loginError);
	const loginCodeError = useSelector((state) => state.Auth.loginCodeError);

	const [codeScreen, setCodeScreen] = useState(false);

	const [officeCode, setOfficeCode] = useState("");
	const [officeCodeMsg, setOfficeCodeMsg] = useState("");
	const [isOfficeCode, setIsOfficeCode] = useState(false);
	const [officeCodePress, setOfficeCodePress] = useState(true);

	const [email, setEmail] = useState("");
	const [emailMsg, setEmailMsg] = useState("");
	const [isEmail, setIsEmail] = useState(false);
	const [emailPress, setEmailPress] = useState(true);

	const [passwd, setPasswd] = useState("");
	const [passwdMsg, setPasswdMsg] = useState("");
	const [ispasswd, setIsPasswd] = useState(false);
	const [passwdPress, setPasswdPress] = useState(true);
	const [isDisplayPassword, setIsDisplayPassword] = useState(false);

	const [fcmToken, setFcmToken] = useState("");

	const requestNotificationPermission = async () => {
		try {
			const messagingInstance = getMessaging();

			if (Platform.OS === "ios") {
				const authStatus = await messagingInstance.requestPermission();
				const enabled =
					authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
					authStatus === messaging.AuthorizationStatus.PROVISIONAL;

				if (enabled) {
					await messagingInstance.registerDeviceForRemoteMessages();

					setTimeout(async () => {
						const token = await messagingInstance.getToken();
						setFcmToken(token);
					}, 1000);
				}
			} else {
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
				);

				if (granted === PermissionsAndroid.RESULTS.GRANTED) {
					await messagingInstance.registerDeviceForRemoteMessages();
					const token = await messagingInstance.getToken();
					setFcmToken(token);
				}
			}
		} catch (error) {
			console.error("Notification Permission Error:", error);
		}
	};

	const onAppBootstrap = async () => {
		await notifee.requestPermission();
		const settings = await notifee.getNotificationSettings();

		if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
			// Notification permissions has been authorized
		} else {
			console.warn("Notification permissions not granted");
		}
	};

	useEffect(() => {
		const requestPermissions = async () => {
			await requestNotificationPermission();
			await onAppBootstrap();
		};

		requestPermissions();

		const blurListener = props.navigation.addListener("blur", () => {
			if (Platform.OS === "ios") {
				StatusBar.setBarStyle("dark-content");
			}
		});

		const focusListener = props.navigation.addListener("focus", () => {
			if (Platform.OS === "ios") {
				StatusBar.setBarStyle("light-content");
			}
		});

		return () => {
			blurListener();
			focusListener();
		};
	}, []);

	useEffect(() => {
		if (loginError) {
			if (loginError?.data?.email) {
				setEmailMsg(loginError?.data?.email);
				setIsEmail(true);
			}
			if (loginError?.data?.password) {
				setPasswdMsg(loginError?.data?.password);
				setIsPasswd(true);
			}
		}

		if (loginCodeError) {
			if (loginCodeError?.data?.email) {
				setEmailMsg(loginCodeError?.data?.email);
				setIsEmail(true);
			}
			if (loginCodeError?.data?.officeCode) {
				setOfficeCodeMsg(loginError?.data?.officeCode);
				setIsOfficeCode(true);
			}
		}
	}, [loginError, loginCodeError]);

	const gotoSignupScreen = () => {
		props.navigation.navigate("Signup");

		setEmail("");
		setEmailPress(true);
		setEmailMsg("");
		setTimeout(() => {
			setPasswd("");
			setPasswdPress(true);
			setPasswdMsg("");
			setOfficeCode("");
			setOfficeCodePress(true);
			setOfficeCodeMsg("");
		}, 300);
	};
	const onChangePasswd = (text) => {
		setPasswd(text);
		setIsPasswd(false);
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
	const onChangeOfficeCode = (text) => {
		const inputText = isVerifyNumb(text);
		setOfficeCode(inputText);
		setIsOfficeCode(false);
	};
	const gotoSwapScreen = () => {
		setCodeScreen(!codeScreen);
		setIsEmail(false);
		setIsPasswd(false);
		setIsOfficeCode(false);
		setEmailPress(true);
		setOfficeCodePress(true);
		setPasswdPress(true);
		setEmail("");
		setOfficeCode("");
		setPasswd("");
	};
	const isFormPassValidation = () => {
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
		if (isEmpty(passwd)) {
			setIsPasswd(true);
			setPasswdMsg(MESSAGE.passwd);
			isValid = false;
		}
		return isValid;
	};
	const isFormCodeValidation = () => {
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
		if (isEmpty(officeCode)) {
			setIsOfficeCode(true);
			setOfficeCodeMsg(MESSAGE.officeCode);
			isValid = false;
		} else if (!/^\d+$/.test(officeCode)) {
			setIsOfficeCode(true);
			setOfficeCodeMsg("Office code must contain only digits.");
			isValid = false;
		} else if (officeCode.length !== 5) {
			setIsOfficeCode(true);
			setOfficeCodeMsg(MESSAGE.officeCodeLength);
			isValid = false;
		}
		// Return validation result
		return isValid;
	};
	const gotoConfirmInfo = () => {
		if (codeScreen) {
			let isValid = isFormCodeValidation();
			if (isValid) {
				const params = {
					email: email,
					code: officeCode,
					fcmToken: fcmToken,
				};
				dispatch(loginWithCodeRequest(params, props.navigation));
			}
		} else {
			let isValid = isFormPassValidation();
			if (isValid) {
				const params = {
					email: email,
					password: passwd,
					device_token: "",
					fcmToken: fcmToken,
				};
				dispatch(loginRequest(params, props.navigation));
			}
		}
	};
	const handleForgotPassword = () => {
		props.navigation.navigate("ForgotPassword");
	};

	return (
		<SafeAreaView style={[AuthStyle.flexContainer]}>
			<Loader show={isLoading} />
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={"padding"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -40}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View
						style={[
							AuthStyle.loginFlex,
							{
								paddingTop:
									Platform.OS === "android" ? StatusBar.currentHeight : 0,
							},
						]}
					>
						<View>
							<View style={[AuthStyle.loginHeaderRow]}>
								<Icons
									iconSetName={"FontAwesome6"}
									iconName={"angle-left"}
									iconColor={Colors.white}
									iconSize={24}
								/>
								<FastImage
									style={[AuthStyle.retyrnLogo]}
									source={IMAGES.appLogo}
									resizeMode={FastImage.resizeMode.contain}
								/>
							</View>
							<View style={{ ...LayoutStyle.paddingVertical30 }}>
								<Text style={[AuthStyle.headerLabel]}>{"Login"}</Text>
							</View>
							<View>
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
									inputMainStyle={{ ...LayoutStyle.marginVertical20 }}
								/>
								{codeScreen ? (
									<Input
										isDarkBG={false}
										value={officeCode}
										placeholder={"Code"}
										maxLength={5}
										onChangeText={(text) => onChangeOfficeCode(text)}
										iconName={"business"}
										iconSetName={"MaterialIcons"}
										isValidationShow={isOfficeCode}
										validationMessage={officeCodeMsg}
										keyboardType={"numeric"}
										returnKeyType={"done"}
										blurOnSubmit={true}
										onFocus={() => setOfficeCodePress(true)}
										onBlur={() => setOfficeCodePress(false)}
										isPressOut={officeCodePress}
										onPressFocus={() => setOfficeCodePress(true)}
									/>
								) : (
									<Input
										isDarkBG={false}
										value={passwd}
										placeholder={"Password"}
										maxLength={16}
										secureTextEntry={!isDisplayPassword}
										onChangeText={(text) => onChangePasswd(text)}
										iconName={"lock-outline"}
										iconSetName={"MaterialCommunityIcons"}
										isValidationShow={ispasswd}
										validationMessage={passwdMsg}
										keyboardType={"default"}
										returnKeyType={"done"}
										blurOnSubmit={true}
										onFocus={() => setPasswdPress(true)}
										onBlur={() => setPasswdPress(false)}
										isPressOut={passwdPress}
										onPressFocus={() => setPasswdPress(true)}
										isRightIcon={true}
										rightIconSetName={"MaterialCommunityIcons"}
										rightIconColor={
											passwdPress ? Colors.inputIcon : Colors.secondary
										}
										rightIconName={isDisplayPassword ? "eye-off" : "eye"}
										onPressRightIcon={() =>
											setIsDisplayPassword(!isDisplayPassword)
										}
									/>
								)}
								<TouchableOpacity
									onPress={() => gotoSwapScreen()}
									style={{ alignSelf: "flex-end" }}
								>
									<Text style={[AuthStyle.testSmallText]}>
										{codeScreen ? "Login with email" : "Login with code"}
									</Text>
								</TouchableOpacity>
							</View>
						</View>
						<View style={{ ...LayoutStyle.paddingVertical20 }}>
							<View style={{}}>
								<Button
									btnName={"Login"}
									onPress={() => gotoConfirmInfo()}
									isBtnActive={true}
									btnColor={Colors.secondary}
									btnLabelColor={Colors.white}
								/>
							</View>
							<View style={AuthStyle.policyRow}>
								<TouchableOpacity
									onPress={() => {
										Linking.openURL(`https://retyrn.nxtech.ai/privacy-policy`);
									}}
								>
									<Text style={[AuthStyle.bottomActiveText, { marginLeft: 0 }]}>
										{"Privacy Policy"}
									</Text>
								</TouchableOpacity>
								<Text style={[AuthStyle.bottomText]}>{" & "}</Text>
								<TouchableOpacity
									onPress={() => {
										Linking.openURL(
											`https://retyrn.nxtech.ai/terms-and-condition`
										);
									}}
								>
									<Text style={[AuthStyle.bottomActiveText, { marginLeft: 0 }]}>
										{"Terms & Conditions"}
									</Text>
								</TouchableOpacity>
							</View>
							<TouchableOpacity
								style={[AuthStyle.forgotRow]}
								onPress={handleForgotPassword}
							>
								<Text style={AuthStyle.forgotTxt}>{"Forgot Password?"}</Text>
							</TouchableOpacity>
							<View style={[AuthStyle.newCompnayRow]}>
								<Text style={[AuthStyle.bottomText]}>{"New Company?"}</Text>
								<TouchableOpacity onPress={() => gotoSignupScreen()}>
									<Text style={[AuthStyle.bottomActiveText]}>{"Sign Up"}</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default LoginScreen;
