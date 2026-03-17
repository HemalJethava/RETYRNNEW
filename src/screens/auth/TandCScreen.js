import { View, Text, ScrollView } from "react-native";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import LinearGradient from "react-native-linear-gradient";
import ContentLoader from "react-native-easy-content-loader";
import { loginRequest, policyRequest } from "./redux/Action";
import { Button, DarkHeader } from "../../components";
import { lineLoop } from "../../utils/Validation";
import { clearAll, storeData } from "../../utils/LocalData";
import AuthStyle from "../../styles/AuthStyle";
import Colors from "../../styles/Colors";
import { deviceWidth } from "../../utils/DeviceInfo";
import moment from "moment";
import { CommonActions } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";
import RenderHtml, { defaultSystemFonts } from "react-native-render-html";
import { BaseStyle, HTMLTagStyle } from "../../styles/HTMLTagStyle";

const TandCScreen = (props) => {
	const dispatch = useDispatch();

	const policyData = useSelector((state) => state.Auth);
	const isLoading = policyData.isLoading;
	const systemFonts = [...defaultSystemFonts, "Poppins"];

	useEffect(() => {
		(async () => {
			await clearAll();
			const params = {
				slug: "terms_conditions",
			};
			dispatch(policyRequest(params, props.navigation));
		})();
	}, []);

	const tagsStyles = {
		p: {
			color: "#FFFFFF",
			fontSize: 12,
		},
	};
	const gotoLoginScreen = () => {
		props.navigation.navigate("Login");
	};
	const gotoHomeScreen = async () => {
		if (props.route.params?.authToken) {
			storeData("token", props.route.params?.authToken);
			storeData("userName", props.route.params?.name);
			storeData("modal", true);

			global.userToken = props.route.params?.authToken;
			global.userName = props.route.params?.name;
			global.modal = true;

			showMessage({
				message: "Login Successfully!",
				type: "success",
				floating: true,
				statusBarHeight: 40,
				duration: 3000,
				icon: "auto",
				autoHide: true,
			});

			props.navigation.dispatch(
				CommonActions.reset({
					index: 1,
					routes: [{ name: "Tab" }],
				})
			);
		} else {
			dispatch(loginRequest(props.route.params, props.navigation));
		}
	};

	return (
		<>
			<View style={[AuthStyle.mainContainer, AuthStyle.backgroundWhite]}>
				<DarkHeader
					iconName={"angle-left"}
					iconSetName={"FontAwesome6"}
					iconColor={Colors.backArrowWhite}
					iconSize={24}
					whiteLabel={"Terms &"}
					grayLabel={"Conditions"}
					onPress={() => gotoLoginScreen()}
				/>
				<View style={[AuthStyle.formContainer, { height: "60%" }]}>
					<Text style={[AuthStyle.updateDate]}>
						{"Last Updated "}
						{moment(policyData.updated_at).format("LL")}{" "}
					</Text>
					<ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
						{isLoading ? (
							<ContentLoader
								animationDuration={300}
								active={isLoading}
								pRows={20}
								title={false}
								containerStyles={{
									padding: 0,
								}}
								pWidth={lineLoop(260, 20)}
							/>
						) : (
							<RenderHtml
								contentWidth={deviceWidth}
								systemFonts={systemFonts}
								source={{ html: `${policyData?.policyDesc?.page_content}` }}
								baseStyle={BaseStyle}
								tagsStyles={HTMLTagStyle}
							/>
						)}
					</ScrollView>
					<LinearGradient
						style={[
							AuthStyle.overrideGradient,
							{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
						]}
						start={{ x: 1, y: 1 }}
						end={{ x: 1, y: 0 }}
						angle={180}
						useAngle={true}
						angleCenter={{ x: 0.9, y: 1.1 }}
						locations={[0, 0.5]}
						colors={["#0D223D00", "#0D223D"]}
						pointerEvents="none"
					/>
				</View>
				<View style={[AuthStyle.btnContain]}>
					<Button
						// onPress method call for Home screen
						onPress={() => gotoHomeScreen()}
						btnName={"I Agree"}
						isBtnActive={!isLoading}
						btnColor={Colors.secondary}
						btnLabelColor={Colors.white}
					/>
				</View>
			</View>
		</>
	);
};

export default TandCScreen;
