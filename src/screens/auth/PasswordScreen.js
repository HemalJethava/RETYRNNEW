import {
	View,
	KeyboardAvoidingView,
	Platform,
	StatusBar,
	PermissionsAndroid,
	Text,
	TouchableWithoutFeedback,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signUpRequest, createClientPasswordRequest } from "./redux/Action";
import { Button, DarkHeader, Icons, Input, Loader } from "../../components";
import { isEmpty } from "../../utils/Validation";
import { getData } from "../../utils/LocalData";
import LayoutStyle from "../../styles/LayoutStyle";
import AuthStyle from "../../styles/AuthStyle";
import Colors from "../../styles/Colors";
import MESSAGE from "../../utils/Messages";
import messaging, { getMessaging } from "@react-native-firebase/messaging";
import CommonStyles from "../../styles/CommonStyles";

const PasswordScreen = (props) => {
	const dispatch = useDispatch();

	const isLoading = useSelector((state) => state.Auth.isLoading);

	const [passwd, setPasswd] = useState("");
	const [passwdMsg, setPasswdMsg] = useState("");
	const [ispasswd, setIsPasswd] = useState(false);
	const [passwdPress, setPasswdPress] = useState(true);
	const [isDisplayPassword, setIsDisplayPassword] = useState(false);

	const [confirmPasswd, setConfirmPasswd] = useState("");
	const [confirmPasswdMsg, setConfirmPasswdMsg] = useState("");
	const [isconfirmPasswd, setIsConfirmPasswd] = useState(false);
	const [confirmPasswdPress, setConfirmPasswdPress] = useState(true);
	const [fcmToken, setFcmToken] = useState("");
	const [isDisplayPassword2, setIsDisplayPassword2] = useState(false);

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
		requestNotificationPermission();

		const blur = props.navigation.addListener("blur", () => {
			if (Platform.OS === "ios") {
				StatusBar.setBarStyle("dark-content");
			}
		});

		const focus = props.navigation.addListener("focus", () => {
			if (Platform.OS === "ios") {
				StatusBar.setBarStyle("light-content");
			}
		});

		return blur, focus;
	}, []);

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
	const gotoLoginScreen = () => {
		props.navigation.navigate("Login");
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
	const gotoTandCScreen = async () => {
		const isValid = isFormPassValidation();

		if (isValid) {
			if (props?.route?.params?.isLoginWithCode) {
				const payload = {
					email: props?.route?.params?.user?.email,
					password: passwd,
					password_confirmation: passwd,
				};

				const data = {
					payload: payload,
					fcmToken: fcmToken,
					name: props?.route?.params?.user?.name,
				};

				dispatch(createClientPasswordRequest(data, props.navigation));
			} else {
				const dataTemp = await getData("registerUser");
				dataTemp.password = passwd.trim();
				dataTemp.fcmToken = fcmToken;
				dispatch(signUpRequest(dataTemp, props.navigation));
			}
		}
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
		<>
			<Loader show={isLoading} />
			<TouchableWithoutFeedback
				onPress={() => {
					setShowPasswordCriteria(false);
				}}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					style={[AuthStyle.mainContainer, AuthStyle.backgroundWhite]}
				>
					<DarkHeader
						iconName={"angle-left"}
						iconSetName={"FontAwesome6"}
						iconColor={Colors.backArrowWhite}
						iconSize={24}
						whiteLabel={"Enter"}
						grayLabel={"Password"}
						onPress={() => gotoLoginScreen()}
					/>
					<View style={[AuthStyle.passwdContainer]}>
						{showPasswordCriteria && (
							<View
								style={[
									AuthStyle.criteriaContainer,
									{
										top: ispasswd ? bottomOffset : 60,
										zIndex: 99,
									},
								]}
							>
								<View
									style={{
										width: "100%",
										alignItems: "flex-start",
										top: 10,
										right: passwdPress ? -12 : -28,
									}}
								>
									<View
										style={{
											transform: [{ rotateZ: "-90deg" }],
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
								<View style={[CommonStyles.criteriaBox, {}]}>
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
							</View>
						)}
						<Input
							isDarkBG={true}
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
							onPressRightIcon={() => setIsDisplayPassword(!isDisplayPassword)}
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
							inputMainStyle={{ ...LayoutStyle.marginTop20, zIndex: 9 }}
						/>

						<Input
							isDarkBG={true}
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
							onPressRightIcon={
								() => setIsDisplayPassword2(!isDisplayPassword2)
								// setShowPasswordCriteria(!showPasswordCriteria)
							}
							inputMainStyle={{ ...LayoutStyle.marginVertical20, zIndex: 9 }}
						/>
					</View>
					<View style={[AuthStyle.verifyBtn]}>
						<Button
							onPress={() => gotoTandCScreen()}
							isBtnActive={true}
							btnName={"Next"}
							btnColor={Colors.secondary}
							btnLabelColor={Colors.white}
						/>
					</View>
				</KeyboardAvoidingView>
			</TouchableWithoutFeedback>
		</>
	);
};

export default PasswordScreen;
