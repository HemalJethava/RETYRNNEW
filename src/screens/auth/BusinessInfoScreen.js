import React, { useEffect } from "react";
import {
	View,
	Text,
	KeyboardAvoidingView,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Button, LightHeader } from "../../components";
import AuthStyle from "../../styles/AuthStyle";
import Colors from "../../styles/Colors";
import { sendOTPRequested } from "./redux/Action";

const BusinessInfoScreen = (props) => {
	const dispatch = useDispatch();

	const loginInfo = useSelector((state) => state.Auth.loginInfo?.user);
	const companyDetails = loginInfo?.company_detail;

	console.log("companyDetails: ", loginInfo);

	const gotoVerifyAccount = () => {
		const params = {
			mobile: loginInfo.mobile,
			email: loginInfo.email,
			type: "2FA",
		};
		const data = {
			params: params,
			type: "CODE",
		};
		dispatch(sendOTPRequested(data, props.navigation));
	};

	return (
		<>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={[AuthStyle.mainContainer]}
			>
				<LightHeader
					isLogo={true}
					isBackIcon={true}
					iconName={"angle-left"}
					iconSize={24}
					iconSetName={"FontAwesome6"}
					iconColor={Colors.backArrowBlack}
					headerBG={Colors.white}
					statusBG={Colors.white}
					onPress={() => props.navigation.goBack()}
				/>
				<View style={[AuthStyle.loginContainer]}>
					<Text style={[AuthStyle.headerLabel]}>{"Confirm Business Info"}</Text>
				</View>

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={[
						AuthStyle.loginScrollViewStyle,
						AuthStyle.backgroundWhite,
					]}
				>
					{companyDetails && (
						<View style={[AuthStyle.businessInfo]}>
							<Text style={[AuthStyle.companyName]}>
								{companyDetails?.company_name}
							</Text>
							<Text style={[AuthStyle.companyAddr]}>
								{companyDetails?.company_address + "."}
								{"\n" + companyDetails?.city + ","}
								{"\n" +
									companyDetails?.state +
									", " +
									companyDetails?.zip_code +
									"."}
							</Text>
						</View>
					)}
					<View style={[AuthStyle.busiBtnContainer]}>
						<Button
							btnName={"Confirm"}
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

export default BusinessInfoScreen;
