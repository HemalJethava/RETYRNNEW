import React, { useCallback, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	Switch,
	Pressable,
	TextInput,
	TouchableOpacity,
} from "react-native";
import {
	Icons,
	LightHeader,
	Loader,
	Overlay,
	ValidationText,
} from "../../components";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";
import { isEmpty } from "../../utils/Validation";
import { verifyPasswdRequest } from "./redux/Action";
import { useDispatch, useSelector } from "react-redux";
import MESSAGE from "../../utils/Messages";
import { useFocusEffect } from "@react-navigation/native";

const SecurityScreen = (props) => {
	// Fetch updated data from the redux store
	const userData = useSelector((state) => state.Auth.userData);
	const is2FA = userData?.is_2fa_verification;
	const isLoading = useSelector((state) => state.Account.isLoading);

	// Init state variables
	const [isToogle, setIsToogle] = useState(is2FA === "on" ? true : false);
	const [isModal, setIsModal] = useState(false);
	const [passwd, setPasswd] = useState("");
	const [passwdMsg, setPasswdMsg] = useState("");
	const [ispasswd, setIsPasswd] = useState(false);
	const [isDisplayPassword, setIsDisplayPassword] = useState(false);
	const [isDisableToggle, setIsDisableToggle] = useState(false);

	const dispatch = useDispatch();

	useFocusEffect(
		useCallback(() => {
			setIsToogle(is2FA === "on" ? true : false);
		}, [is2FA])
	);

	const gotoBack = () => {
		props.navigation.goBack();
	};
	const toggleSwitch = () => {
		setIsDisableToggle(true);
		setIsToogle((previousState) => !previousState);
		setIsModal(true);
		setIsDisableToggle(false);
	};
	const onChangePasswd = (text) => {
		setPasswd(text);
		setIsPasswd(false);
	};
	const onRequestClose = () => {
		setPasswd("");
		setIsPasswd(false);
		setIsModal(false);
		setIsToogle(!isToogle);
	};
	const gotoVerify2faScreen = () => {
		if (isEmpty(passwd)) {
			setIsPasswd(true);
			setPasswdMsg(MESSAGE.passwd);
			return false;
		}
		const params = {
			passwdParams: {
				password: passwd,
			},
			otpParams: {
				mobile: userData?.mobile,
				email: userData?.email,
				type: "2FA",
			},
		};
		global.isToogle = isToogle;
		onRequestClose();
		dispatch(verifyPasswdRequest(params, props.navigation));
	};

	return (
		<>
			<Loader show={isLoading} />
			<View style={[AccountStyle.mainContainer, AccountStyle.backgroundWhite]}>
				<LightHeader
					isLogo={false}
					isBackIcon={true}
					iconName={"angle-left"}
					iconSize={24}
					iconSetName={"FontAwesome6"}
					iconColor={Colors.backArrowBlack}
					headerText={"Security"}
					headerBG={Colors.lightGrayBG}
					statusBG={Colors.lightGrayBG}
					onPress={() => gotoBack()}
				/>
				<View style={[AccountStyle.securityMainContainer]}>
					<ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
						<View>
							<Text style={[AccountStyle.question]}>
								{"What’s 2-step verification?"}
							</Text>
							<Text style={[AccountStyle.qusDescription]}>
								{
									"When this is on, we’ll ask for your password and a verification code at sign in for added security."
								}
							</Text>
							<View
								style={[
									AccountStyle.toggleTextContainer,
									{
										borderColor: isToogle
											? Colors.lightBlueBorder
											: Colors.darkBorder,
									},
								]}
							>
								<Text style={[AccountStyle.verifiactionText]}>
									{"2-step verification"}
								</Text>
								<Switch
									trackColor={{
										false: Colors.disableBtn,
										true: Colors.secondary,
									}}
									thumbColor={isToogle ? Colors.white : Colors.white}
									ios_backgroundColor={Colors.disableBtn}
									onValueChange={toggleSwitch}
									value={isToogle}
									disabled={isDisableToggle}
								/>
							</View>
						</View>
					</ScrollView>
					<Overlay onRequestClose={() => onRequestClose()} visible={isModal}>
						<View>
							<View style={[AccountStyle.actionModal]}>
								<View style={[AccountStyle.centerModal]}>
									<Pressable
										style={({ pressed }) => [
											{ backgroundColor: pressed ? "#EFEFEF" : "#ffffff" },
										]}
										onPress={() => onRequestClose()}
									>
										<Icons
											iconColor={Colors.iconBlack}
											iconName={"close"}
											iconSetName={"MaterialCommunityIcons"}
											iconSize={22}
										/>
									</Pressable>
									<Text style={[AccountStyle.modalHeader]}>
										{"Turn "}
										{isToogle ? "On" : "Off"}
										{" (2FA)"}
									</Text>
									<Pressable>
										<Icons
											iconColor={Colors.white}
											iconName={"close"}
											iconSetName={"MaterialCommunityIcons"}
										/>
									</Pressable>
								</View>
								<Text style={[AccountStyle.smallLabel]}>
									{"Enter Password to Confirm"}
								</Text>
								<View
									style={[
										AccountStyle.textInputContainer,
										{
											borderBottomColor: ispasswd
												? Colors.danger
												: Colors.inputBorder,
										},
									]}
								>
									<Icons
										iconName={"lock-outline"}
										iconSetName={"MaterialCommunityIcons"}
										iconColor={Colors.inputIcon}
										iconSize={22}
									/>
									<TextInput
										style={[AccountStyle.textInput, { width: "80%" }]}
										cursorColor={Colors.inputBlackText}
										value={passwd}
										placeholder={"Password"}
										placeholderTextColor={Colors.placeholder}
										secureTextEntry={!isDisplayPassword}
										onChangeText={(text) => onChangePasswd(text)}
										keyboardType={"default"}
										returnKeyType={"done"}
										blurOnSubmit={true}
									/>
									<TouchableOpacity
										onPress={() => setIsDisplayPassword(!isDisplayPassword)}
									>
										<Icons
											iconSetName={"MaterialCommunityIcons"}
											iconName={isDisplayPassword ? "eye-off" : "eye"}
											iconColor={Colors.inputIcon}
											iconSize={20}
										/>
									</TouchableOpacity>
								</View>
								<ValidationText
									validationMessage={passwdMsg}
									isValidationShow={ispasswd}
								/>

								<Pressable
									onPress={() => gotoVerify2faScreen()}
									style={({ pressed }) => [
										{ backgroundColor: pressed ? "#4CA7DA33" : "#4CA7DA" },
										AccountStyle.modalBtnContainer,
									]}
								>
									<Text style={[AccountStyle.modalBtnLabel]}>{"Confirm"}</Text>
								</Pressable>
							</View>
						</View>
					</Overlay>
				</View>
			</View>
		</>
	);
};

export default SecurityScreen;
