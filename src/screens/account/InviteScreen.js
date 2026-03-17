import { View, Text, ScrollView, Linking } from "react-native";
import React, { useState } from "react";
import { Button, Input, LightHeader, Loader } from "../../components";
import { formatMobileNumber } from "../../utils/Validation";
import LayoutStyle from "../../styles/LayoutStyle";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";
import { showMessage } from "react-native-flash-message";
import { DeleteTrustedContact } from "./Components/DeleteTrustedContact";
import { appUrl } from "../../config/BaseUrl";
import { InviteMessage } from "../../config/CommonFunctions";

const InviteScreen = (props) => {
	const contactData = props.route.params.data;

	const [isLoading, setIsLoading] = useState(false);
	const [showDeletePopUp, setShowDeletePopUp] = useState(false);
	const [fullName, setFullName] = useState(contactData?.name);
	const [fullNameMsg, setFullNameMsg] = useState("");
	const [isFullName, setIsFullName] = useState(false);
	const [fullNamePress, setFullNamePress] = useState(
		contactData.name ? false : true
	);

	const [phone, setPhone] = useState(
		contactData.phoneNumber ? formatMobileNumber(contactData?.phoneNumber) : ""
	);
	const [phoneNumb, setPhoneNumb] = useState(
		contactData.phoneNumber ? contactData?.phoneNumber : ""
	);
	const [phoneMsg, setPhoneMsg] = useState("");
	const [isphone, setIsPhone] = useState(false);
	const [phonePress, setPhonePress] = useState(
		contactData?.phoneNumber ? false : true
	);
	const [backPhone, setBackPhone] = useState("");

	const gotoBack = () => {
		props.navigation.goBack();
	};
	const onChangeFullName = (text) => {
		setFullName(text);
		setIsFullName(false);
	};
	const onChangePhone = (text) => {
		let formatedNo = formatMobileNumber(text, backPhone);
		setPhone(formatedNo);
		setIsPhone(false);
	};
	const sendInvitation = async () => {
		const body = InviteMessage(fullName, appUrl);
		try {
			Linking.openURL(`sms:${phoneNumb}?body=${body}`);
		} catch (error) {}
	};

	return (
		<>
			<DeleteTrustedContact
				show={showDeletePopUp}
				onHide={() => setShowDeletePopUp(false)}
				data={contactData}
				setIsLoading={setIsLoading}
				onSuccess={(message) => {
					showMessage({
						message: message,
						type: "success",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						duration: 3000,
						autoHide: true,
					});
					gotoBack();
				}}
				onFailed={(message) => {
					showMessage({
						message: message,
						type: "danger",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						duration: 3000,
						autoHide: true,
					});
				}}
			/>
			<Loader show={isLoading} />
			<View style={[AccountStyle.mainContainer, AccountStyle.backgroundWhite]}>
				<LightHeader
					isLogo={false}
					isBackIcon={true}
					iconName={"angle-left"}
					iconSize={24}
					iconSetName={"FontAwesome6"}
					iconColor={Colors.backArrowBlack}
					headerText={"Invite Contact"}
					headerBG={Colors.white}
					statusBG={Colors.white}
					onPress={() => gotoBack()}
				/>
				{!isLoading && (
					<View style={[AccountStyle.backgroundWhite]}>
						<ScrollView
							nestedScrollEnabled
							showsVerticalScrollIndicator={false}
						>
							<View style={[AccountStyle.mainInviteContainer]}>
								<Text style={[AccountStyle.inviteText]}>
									{
										"Changes only apply to Retyrn and does not affect your device’s address book."
									}
								</Text>
								<Input
									isDarkBG={false}
									value={fullName}
									placeholder={"Full Name"}
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
									inputMainStyle={{ ...LayoutStyle.marginVertical20 }}
								/>
								<Input
									isDarkBG={false}
									value={phoneNumb}
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
									disabledBtn={true}
									inputMainStyle={{ ...LayoutStyle.paddingBottom30 }}
								/>
								<Button
									onPress={() => sendInvitation()}
									btnName={"Share Invite"}
									isBtnActive={true}
									btnColor={Colors.secondary}
									btnLabelColor={Colors.white}
								/>
								<View style={{ marginTop: 15 }}>
									<Button
										onPress={() => setShowDeletePopUp(true)}
										btnName={"Remove Trusted Contact"}
										isBtnActive={true}
										btnColor={Colors.red}
										btnLabelColor={Colors.white}
									/>
								</View>
							</View>
						</ScrollView>
					</View>
				)}
			</View>
		</>
	);
};

export default InviteScreen;
