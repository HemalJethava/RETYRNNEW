import {
	View,
	Text,
	KeyboardAvoidingView,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginDetailsRequest } from "./redux/Action";
import { Button, LightHeader, Input } from "../../components";
import { formatMobileNumber, isEmpty } from "../../utils/Validation";
import LayoutStyle from "../../styles/LayoutStyle";
import AuthStyle from "../../styles/AuthStyle";
import Colors from "../../styles/Colors";
import MESSAGE from "../../utils/Messages";

const LoginDetailScreen = (props) => {
	const dispatch = useDispatch();

	const loginInfo = useSelector((state) => state.Auth.loginInfo?.user);
	const loginInfoError = useSelector((state) => state.Auth.loginInfoError.data);

	const [fullName, setFullName] = useState(loginInfo?.name || "");
	const [fullNameMsg, setFullNameMsg] = useState("");
	const [isFullName, setIsFullName] = useState(false);
	const [fullNamePress, setFullNamePress] = useState(
		loginInfo?.name ? false : true
	);

	const [phone, setPhone] = useState(loginInfo?.mobile || "");
	const [phoneNumb, setPhoneNumb] = useState(loginInfo?.mobile || "");
	const [phoneMsg, setPhoneMsg] = useState("");
	const [isphone, setIsPhone] = useState(false);
	const [phonePress, setPhonePress] = useState(
		loginInfo?.mobile ? false : true
	);
	const [backPhone, setBackPhone] = useState("");

	useEffect(() => {
		(async () => {
			if (loginInfoError?.mobile) {
				setIsPhone(true);
				setPhoneMsg(loginInfoError?.mobile);
			} else {
				showMessage({
					message: JSON.stringify(loginInfoError),
					type: "danger",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			}
		})();
	}, [loginInfoError]);

	const gotoSplashScreen = () => {
		props.navigation.navigate("Splash");
	};
	const onChangeFullName = (text) => {
		setFullName(text);
		setIsFullName(false);
	};
	const onChangePhone = (text) => {
		let formatedNo = formatMobileNumber(text, backPhone);
		setPhone(formatedNo);
		setPhoneNumb(text);
		setIsPhone(false);
	};
	const isFormValidation = () => {
		if (fullName.trim() == "" || phoneNumb.trim() == "") {
			if (isEmpty(fullName)) {
				setIsFullName(true);
				setFullNameMsg(MESSAGE.fullName);
			}
			if (isEmpty(phoneNumb)) {
				setIsPhone(true);
				setPhoneMsg(MESSAGE.phone);
			}
			return false;
		} else {
			return true;
		}
	};
	const gotoVerifyAccount = () => {
		const isValid = isFormValidation();
		if (isValid) {
			let cleaned = phoneNumb.replace(/\D/g, "");
			setPhoneNumb(cleaned);
			const params = {
				email: loginInfo?.email,
				name: fullName || loginInfo?.name,
				mobile: loginInfo?.mobile,
			};
			dispatch(loginDetailsRequest(params, props.navigation));
		}
	};

	return (
		<>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={[AuthStyle.mainContainer]}
			>
				<LightHeader
					isLogo={true}
					headerBG={Colors.white}
					statusBG={Colors.white}
					onPress={() => gotoSplashScreen()}
				/>
				<View style={[AuthStyle.loginContainer]}>
					<Text style={[AuthStyle.headerLabel]}>{"Login"}</Text>
				</View>

				<ScrollView
					showsVerticalScrollIndicator={false}
					style={[AuthStyle.loginContainer]}
					contentContainerStyle={[AuthStyle.loginScrollViewStyle]}
				>
					<View>
						<Input
							isDarkBG={false}
							value={fullName}
							placeholder={"Full Name"}
							maxLength={20}
							onChangeText={(text) => onChangeFullName(text)}
							iconName={"account-circle-outline"}
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
							disabledBtn={true}
						/>
						<Input
							isDarkBG={false}
							forwardRef={(input) => {
								phoneRef = input;
							}}
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
							isValidationShow={isphone}
							validationMessage={phoneMsg}
							keyboardType={"numeric"}
							returnKeyType={"done"}
							blurOnSubmit={true}
							onFocus={() => setPhonePress(true)}
							onBlur={() => setPhonePress(false)}
							isPressOut={phonePress}
							onPressFocus={() => setPhonePress(true)}
							inputMainStyle={{ ...LayoutStyle.marginTop20 }}
							disabledBtn={true}
						/>
					</View>

					<View style={{ ...LayoutStyle.paddingVertical30 }}>
						<Button
							btnName={"Continue"}
							onPress={() => gotoVerifyAccount()}
							isBtnActive={true}
							btnColor={Colors.secondary}
							btnLabelColor={Colors.white}
						/>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
			<View style={[AuthStyle.bottomTextContain]}>
				<Text style={[AuthStyle.bottomText]}>{"Need Help?"}</Text>
				<TouchableOpacity
					onPress={() => props.navigation.navigate("ContactAdmin")}
				>
					<Text style={[AuthStyle.bottomActiveText]}>{"Contact Admin"}</Text>
				</TouchableOpacity>
			</View>
		</>
	);
};

export default LoginDetailScreen;
