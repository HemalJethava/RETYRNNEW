import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import LinearGradient from "react-native-linear-gradient";
import { DarkHeader } from "../../components";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";
import { useDispatch, useSelector } from "react-redux";
import { policyRequest } from "../auth/redux/Action";
import ContentLoader from "react-native-easy-content-loader";
import { deviceWidth } from "../../utils/DeviceInfo";
import { lineLoop } from "../../utils/Validation";
import moment from "moment";

import RenderHtml, { defaultSystemFonts } from "react-native-render-html";
import { BaseStyle, HTMLTagStyle } from "../../styles/HTMLTagStyle";

const LegalDescriptionScreen = (props) => {
	const legalData = props.route.params.legalData;
	const policyData = useSelector((state) => state.Auth.policyDesc);
	const systemFonts = [...defaultSystemFonts, "Poppins"];

	const dispatch = useDispatch();

	const gotoBack = () => {
		props.navigation.goBack();
	};

	useEffect(() => {
		(async () => {
			const params = {
				slug: legalData,
			};
			dispatch(policyRequest(params, props.navigation));
		})();
	}, []);

	return (
		<>
			<View style={[AccountStyle.mainContainer, AccountStyle.backgroundWhite]}>
				<DarkHeader
					iconName={"close"}
					iconSetName={"MaterialCommunityIcons"}
					iconColor={Colors.backArrowWhite}
					iconSize={24}
					whiteLabel={policyData?.page_title}
					// grayLabel={legalData.grayLabel}
					onPress={() => gotoBack()}
				/>
				<View style={[AccountStyle.legalDataContainer, { height: "65%" }]}>
					<Text style={[AccountStyle.updateDate]}>
						{"Last Updated "}
						{moment(policyData?.updated_at).format("LL")}
					</Text>
					<ScrollView
						style={{ flex: 1 }}
						nestedScrollEnabled
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingBottom: 60 }}
					>
						{policyData?.isLoading ? (
							<ContentLoader
								animationDuration={300}
								active={policyData?.isLoading}
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
								source={{ html: policyData?.page_content }}
								baseStyle={BaseStyle}
								tagsStyles={HTMLTagStyle}
							/>
						)}
					</ScrollView>
					<LinearGradient
						style={[
							AccountStyle.overrideGradient,
							{
								// height: 60,
								bottom: 0,
								borderBottomLeftRadius: 30,
								borderBottomRightRadius: 30,
							},
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
			</View>
		</>
	);
};

export default LegalDescriptionScreen;
