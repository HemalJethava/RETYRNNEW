import { View, Text, ScrollView } from "react-native";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import LinearGradient from "react-native-linear-gradient";
import ContentLoader from "react-native-easy-content-loader";
import RenderHtml, { defaultSystemFonts } from "react-native-render-html";
import { policyRequest } from "./redux/Action";
import { Button, DarkHeader } from "../../components";
import { lineLoop } from "../../utils/Validation";
import AuthStyle from "../../styles/AuthStyle";
import Colors from "../../styles/Colors";
import { deviceWidth } from "../../utils/DeviceInfo";
import moment from "moment";
import { BaseStyle, HTMLTagStyle } from "../../styles/HTMLTagStyle";

const EulaScreen = (props) => {
	const dispatch = useDispatch();

	const policyData = useSelector((state) => state.Auth);
	const isLoading = policyData.isLoading;
	const systemFonts = [...defaultSystemFonts, "Poppins"];

	useEffect(() => {
		(async () => {
			const params = {
				slug: "end_user_license_agreement",
			};
			dispatch(policyRequest(params, props.navigation));
		})();
	}, []);

	const gotoBack = () => {
		props.navigation.goBack();
	};
	const gotoLoginScreen = () => {
		props.navigation.navigate("Login");
	};

	return (
		<>
			<View style={[AuthStyle.mainContainer, AuthStyle.backgroundWhite]}>
				<DarkHeader
					iconName={"angle-left"}
					iconSetName={"FontAwesome6"}
					iconColor={Colors.backArrowWhite}
					iconSize={24}
					whiteLabel={"End User"}
					grayLabel={"License Agreement"}
					onPress={() => gotoBack()}
				/>
				<View style={[AuthStyle.formContainer, { height: "60%" }]}>
					<Text style={[AuthStyle.updateDate]}>
						{"Last Updated "}
						{moment(policyData.updated_at).format("LL")}
					</Text>
					<ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
						{isLoading ? (
							<ContentLoader
								animationDuration={300}
								active={isLoading}
								pRows={10}
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
								source={{
									html: policyData?.policyDesc?.page_content
										? `${policyData?.policyDesc?.page_content}`
										: "",
								}}
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
						onPress={() => (!isLoading ? gotoLoginScreen() : null)}
						btnName={"I Agree"}
						isBtnActive={true}
						btnColor={isLoading ? Colors.disableBtn : Colors.secondary}
						btnLabelColor={Colors.white}
					/>
				</View>
			</View>
		</>
	);
};

export default EulaScreen;
