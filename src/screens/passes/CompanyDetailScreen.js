import {
	View,
	StatusBar,
	ImageBackground,
	Text,
	Platform,
	Linking,
	TouchableOpacity,
} from "react-native";
import React from "react";
import { Icons, Button } from "../../components";
import CommonStyles from "../../styles/CommonStyles";
import PassesStyle from "../../styles/PassesStyle";
import Colors from "../../styles/Colors";
import IMAGES from "../../assets/images/Images";
import { deviceHeight } from "../../utils/DeviceInfo";
import LinearGradient from "react-native-linear-gradient";
import Svg, { Defs, Rect, RadialGradient, Stop } from "react-native-svg";
import { useSelector } from "react-redux";

const colorList = [
	{ offset: "0%", color: "#281F77", opacity: "0.7" },
	{ offset: "29%", color: "#281F77", opacity: "0.7" },
	{ offset: "67%", color: "#281F77", opacity: "0.9" },
	{ offset: "100%", color: "#281F77", opacity: "0.9" },
];

const CompanyDetailScreen = (props) => {
	const userData = useSelector((state) => state.Auth.userData);
	const companyData = userData?.company[0];

	const gotoBack = () => {
		props.navigation.goBack();
	};
	const gotoMoreDetailScreen = () => {
		props.navigation.navigate("CompanyMore");
	};
	const gotoEmailOpen = () => {
		Linking.openURL(`mailto:${userData?.email}`);
	};
	const gotoDialOpen = () => {
		Linking.openURL(`tel:${userData?.mobile}`);
	};

	return (
		<>
			<View style={[PassesStyle.mainContainer, PassesStyle.backgroundDarkBlue]}>
				{Platform.OS === "android" ? (
					<StatusBar translucent backgroundColor={Colors.transparent} />
				) : null}
				<View
					style={[
						PassesStyle.imgBorderGradient,
						{
							borderStartColor: "#564DA5",
							borderEndColor: "#564DA5",
							borderBottomColor: "#564DA5",
						},
					]}
				>
					<ImageBackground
						source={IMAGES.companyBG}
						style={[PassesStyle.gradientImg]}
						resizeMode="cover"
						borderBottomLeftRadius={20}
						borderBottomRightRadius={20}
					>
						<View style={[PassesStyle.gradientImgBorder]}>
							<Svg height="100%" width="100%">
								<Defs>
									<RadialGradient
										id="grad"
										x="50%"
										y="50%"
										rx="50%"
										ry="50%"
										gradientUnits="userSpaceOnUse"
									>
										{colorList.map((value, index) => (
											<Stop
												key={`RadialGradientItem_${index}`}
												offset={value.offset}
												stopColor={value.color}
												stopOpacity={value.opacity}
											/>
										))}
									</RadialGradient>
								</Defs>
								<Rect
									x="0"
									y="0"
									width="100%"
									height="100%"
									fill="url(#grad)"
								/>
							</Svg>
						</View>
					</ImageBackground>
				</View>

				<View style={[PassesStyle.bottomNotch]}></View>
				<View
					style={{
						marginTop: -deviceHeight / 2,
					}}
				>
					<View style={[PassesStyle.companyHeader]}>
						<TouchableOpacity onPress={() => gotoBack()}>
							<View style={[PassesStyle.backArrow]}>
								<Icons
									iconName={"angle-left"}
									iconSetName={"FontAwesome6"}
									iconColor={Colors.backArrowWhite}
									iconSize={24}
								/>
							</View>
						</TouchableOpacity>
						<Text style={[PassesStyle.headerTextWhite]}>
							{companyData?.company_name}
						</Text>
					</View>
					<View
						style={{
							paddingVertical: 20,
						}}
					>
						<LinearGradient
							start={{ x: 0, y: 1 }}
							end={{ x: 1, y: 0.5 }}
							locations={[0.1, 0.1, 0.3, 0.4, 0.8, 0.9, 0.9]}
							colors={[
								"#564dA500",
								"#564dA500",
								"#564DA5",
								"#564DA5",
								"#564DA5",
								"#564dA500",
								"#564dA500",
							]}
							style={{
								// height: deviceHeight / 16, //In Testing
								justifyContent: "center",
							}}
						>
							<View style={[PassesStyle.gradientIconContainer]}>
								{/* <TouchableOpacity style={[PassesStyle.gradientIcon]}>
									<Icons
										iconColor={Colors.iconWhite}
										iconName={"web"}
										iconSetName={"MaterialCommunityIcons"}
										iconSize={22}
									/>
								</TouchableOpacity> */}
								<TouchableOpacity
									onPress={() => gotoEmailOpen()}
									style={[PassesStyle.gradientIcon]}
								>
									<Icons
										iconColor={Colors.iconWhite}
										iconName={"email-outline"}
										iconSetName={"MaterialCommunityIcons"}
										iconSize={22}
									/>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => gotoDialOpen()}
									style={[PassesStyle.gradientIcon]}
								>
									<Icons
										iconColor={Colors.iconWhite}
										iconName={"phone-outline"}
										iconSetName={"MaterialCommunityIcons"}
										iconSize={22}
									/>
								</TouchableOpacity>
							</View>
						</LinearGradient>
					</View>
					<View style={{ ...CommonStyles.mainPaddingH }}>
						<Text style={[PassesStyle.companyAddr]}>
							{companyData?.company_address} {",\n"}
							{companyData?.city}
							{" ,\n"}
							{companyData?.state}
							{". "}
							{companyData?.zip_code}
							{"\n"}
							{/* {"1234 N. Awesome St.\nSuite 2\nWalla Walla, WA, 99362"} */}
						</Text>
						<View>
							<Button
								onPress={() => gotoMoreDetailScreen()}
								btnName={"See More"}
								isBtnActive={true}
								btnLabelColor={Colors.white}
								btnColor={Colors.cardPurple}
								btnBorderColor={Colors.white}
								btnWidth={1}
							/>
						</View>
					</View>
				</View>
			</View>
		</>
	);
};

export default CompanyDetailScreen;
