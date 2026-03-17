import {
	View,
	StatusBar,
	ImageBackground,
	Text,
	Platform,
	Linking,
	TouchableOpacity,
	FlatList,
} from "react-native";
import React, { useEffect } from "react";
import { Icons, Button } from "../../components";
import CommonStyles from "../../styles/CommonStyles";
import LayoutStyle from "../../styles/LayoutStyle";
import PassesStyle from "../../styles/PassesStyle";
import Colors from "../../styles/Colors";
import { deviceHeight, deviceWidth } from "../../utils/DeviceInfo";
import LinearGradient from "react-native-linear-gradient";
import Svg, { Defs, Rect, RadialGradient, Stop } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";
import { getPassDeatilsRequest } from "./redux/Action";
import { startsWithHash } from "../../utils/Validation";
import ListSkeleton from "../../components/LoaderComponents/ListSkeleton";

const PassDetailScreen = (props) => {
	const isLoading = useSelector((state) => state.Pass.isLoading);
	const passDetails = useSelector((state) => state.Pass.passDetails?.data);

	const dispatch = useDispatch();

	const colorList = [
		{
			offset: "0%",
			color:
				passDetails?.code && startsWithHash(passDetails?.code)
					? passDetails.code
					: Colors.transparent,
			opacity: "0.7",
		},
		{
			offset: "29%",
			color:
				passDetails?.code && startsWithHash(passDetails?.code)
					? passDetails.code
					: Colors.transparent,
			opacity: "0.8",
		},
		{
			offset: "67%",
			color:
				passDetails?.code && startsWithHash(passDetails?.code)
					? passDetails.code
					: Colors.transparent,
			opacity: "0.9",
		},
		{
			offset: "100%",
			color:
				passDetails?.code && startsWithHash(passDetails?.code)
					? passDetails.code
					: Colors.transparent,
			opacity: "0.9",
		},
	];

	useEffect(() => {
		const param = {
			pass_id: props.route.params?.ID,
		};
		dispatch(getPassDeatilsRequest(param, props.navigation));
	}, []);

	const gotoBack = () => {
		props.navigation.goBack();
	};
	const gotoMoreDetailScreen = () => {
		props.navigation.navigate("PassMore");
	};
	const gotoWebOpen = () => {
		Linking.canOpenURL(passDetails.web_url).then((supported) => {
			if (supported) {
				Linking.openURL(passDetails.web_url);
			} else {
				// Don't know how to open URI
			}
		});
	};
	const gotoEmailOpen = () => {
		Linking.openURL(`mailto:${passDetails.email}`);
	};
	const gotoDialOpen = () => {
		Linking.openURL(`tel:${passDetails.mobile}`);
	};

	return (
		<View style={{ flex: 1 }}>
			{!isLoading ? (
				<View
					style={[PassesStyle.mainContainer, PassesStyle.backgroundDarkBlue]}
				>
					{Platform.OS === "android" ? (
						<StatusBar translucent backgroundColor={Colors.transparent} />
					) : null}
					<View
						style={[
							PassesStyle.imgBorderGradient,
							{
								borderStartColor:
									passDetails?.code && startsWithHash(passDetails?.code)
										? passDetails.code
										: Colors.inputBlackText,
								borderEndColor:
									passDetails?.code && startsWithHash(passDetails?.code)
										? passDetails.code
										: Colors.inputBlackText,
								borderBottomColor:
									passDetails?.code && startsWithHash(passDetails?.code)
										? passDetails.code
										: Colors.inputBlackText,
							},
						]}
					>
						<ImageBackground
							source={{ uri: passDetails?.pass_bg_image }}
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
								{passDetails?.company_name}
							</Text>
						</View>
						{(passDetails?.web_url ||
							passDetails?.email ||
							passDetails?.mobile) && (
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
										passDetails?.code && startsWithHash(passDetails?.code)
											? passDetails.code + "4D"
											: Colors.inputBlackText,
										passDetails?.code && startsWithHash(passDetails?.code)
											? passDetails.code + "66"
											: Colors.inputBlackText,

										passDetails?.code && startsWithHash(passDetails?.code)
											? passDetails.code
											: Colors.inputBlackText,
										passDetails?.code && startsWithHash(passDetails?.code)
											? passDetails.code
											: Colors.inputBlackText,
										passDetails?.code && startsWithHash(passDetails?.code)
											? passDetails.code
											: Colors.inputBlackText,

										passDetails?.code && startsWithHash(passDetails?.code)
											? passDetails.code + "66"
											: Colors.inputBlackText,
										passDetails?.code && startsWithHash(passDetails?.code)
											? passDetails.code + "4D"
											: Colors.inputBlackText,
									]}
									style={{
										// height: deviceHeight / 16, //In Testing
										justifyContent: "center",
									}}
								>
									<View style={[PassesStyle.gradientIconContainer]}>
										{passDetails.web_url && (
											<TouchableOpacity
												style={[PassesStyle.gradientIcon]}
												onPress={() => gotoWebOpen()}
											>
												<Icons
													iconColor={Colors.iconWhite}
													iconName={"web"}
													iconSetName={"MaterialCommunityIcons"}
													iconSize={22}
												/>
											</TouchableOpacity>
										)}
										{passDetails.email && (
											<TouchableOpacity
												style={[PassesStyle.gradientIcon]}
												onPress={() => gotoEmailOpen()}
											>
												<Icons
													iconColor={Colors.iconWhite}
													iconName={"email-outline"}
													iconSetName={"MaterialCommunityIcons"}
													iconSize={22}
												/>
											</TouchableOpacity>
										)}
										{passDetails.mobile && (
											<TouchableOpacity
												style={[PassesStyle.gradientIcon]}
												onPress={() => gotoDialOpen()}
											>
												<Icons
													iconColor={Colors.iconWhite}
													iconName={"phone-outline"}
													iconSetName={"MaterialCommunityIcons"}
													iconSize={22}
												/>
											</TouchableOpacity>
										)}
									</View>
								</LinearGradient>
							</View>
						)}
						<View style={{ ...CommonStyles.mainPaddingH }}>
							{passDetails?.name && (
								<View style={{ ...CommonStyles.directionRowCenter }}>
									<Text style={[PassesStyle.passDetails]}>
										{"Pass Name - "}
									</Text>
									<Text style={[PassesStyle.passDetails]}>
										{passDetails?.name}
									</Text>
								</View>
							)}
							{passDetails?.name_of_insured && (
								<View style={{ ...CommonStyles.directionRowCenter }}>
									<Text style={[PassesStyle.passDetails]}>{"Insured - "}</Text>
									<Text style={[PassesStyle.passDetails]}>
										{passDetails?.name_of_insured}
									</Text>
								</View>
							)}
							{passDetails?.policy_id && (
								<View style={{ ...CommonStyles.directionRowCenter }}>
									<Text style={[PassesStyle.passDetails]}>{"Policy - "}</Text>
									<Text style={[PassesStyle.passDetails]}>
										{"#"}
										{passDetails?.policy_id}
									</Text>
								</View>
							)}
							{passDetails?.effective_date && (
								<View style={{ ...CommonStyles.directionRowCenter }}>
									<Text style={[PassesStyle.passDetails]}>{"Expires - "}</Text>
									<Text style={[PassesStyle.passDetails]}>
										{passDetails?.expiration_date.replace(/-/g, "/")}
									</Text>
								</View>
							)}
							<View style={{ ...LayoutStyle.paddingTop30 }}>
								<Button
									onPress={() => gotoMoreDetailScreen()}
									btnName={"See More"}
									isBtnActive={true}
									btnLabelColor={Colors.white}
									btnColor={
										passDetails?.code && startsWithHash(passDetails?.code)
											? passDetails?.code
											: Colors.inputBlackText
									}
									btnBorderColor={Colors.white}
									// btnColor={Colors.white}
									// btnBorderColor={Colors.white}
									btnWidth={1}
								/>
							</View>
						</View>
					</View>
				</View>
			) : (
				<>
					<View
						style={[
							PassesStyle.imgBorderGradient,
							{
								borderBottomWidth: 0,
								borderBottomColor: "transparent",
							},
						]}
					>
						<View style={[PassesStyle.gradientImg]}>
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
						</View>
					</View>
					<View style={[PassesStyle.bottomNotch]} />
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
									"#3161AA4D",
									"#3161AA66",
									"#3161AA",
									"#3161AA",
									"#3161AA",
									"#3161AA66",
									"#3161AA4D",
								]}
								style={{ justifyContent: "center" }}
							>
								<View style={[PassesStyle.gradientIconContainer]}>
									<TouchableOpacity
										style={[PassesStyle.gradientIcon, { opacity: 0.7 }]}
										disabled
									>
										<Icons
											iconColor={Colors.iconWhite}
											iconName={"web"}
											iconSetName={"MaterialCommunityIcons"}
											iconSize={22}
										/>
									</TouchableOpacity>
									<TouchableOpacity
										style={[PassesStyle.gradientIcon, { opacity: 0.7 }]}
										disabled
									>
										<Icons
											iconColor={Colors.iconWhite}
											iconName={"email-outline"}
											iconSetName={"MaterialCommunityIcons"}
											iconSize={22}
										/>
									</TouchableOpacity>
									<TouchableOpacity
										style={[PassesStyle.gradientIcon, { opacity: 0.7 }]}
										disabled
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
							<FlatList
								style={{}}
								data={Array(4).fill(0)}
								keyExtractor={(item, index) => `skeleton-${index}`}
								renderItem={({ item, index }) => (
									<ListSkeleton
										height={10}
										width={160}
										backgroundColor={"#3161AA"}
									/>
								)}
							/>
							<View style={{ ...LayoutStyle.paddingTop30 }}>
								<ListSkeleton
									height={50}
									width={deviceWidth / 1.2}
									borderRadius={30}
									backgroundColor={"#3161AA"}
								/>
							</View>
						</View>
					</View>
				</>
			)}
		</View>
	);
};

export default PassDetailScreen;
