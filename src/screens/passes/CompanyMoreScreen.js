import {
	View,
	StatusBar,
	ImageBackground,
	Text,
	TouchableOpacity,
	Linking,
	Platform,
} from "react-native";
import Share from "react-native-share";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Svg, { Defs, Rect, RadialGradient, Stop } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import FastImage from "react-native-fast-image";
import { Icons, KeyValue, Loader } from "../../components";
import PassesStyle from "../../styles/PassesStyle";
import IMAGES from "../../assets/images/Images";
import Colors from "../../styles/Colors";
import LayoutStyle from "../../styles/LayoutStyle";
import CommonStyles from "../../styles/CommonStyles";
import { ScrollView } from "react-native-gesture-handler";
import moment from "moment";
import { formatedMobileNumb } from "../../utils/Validation";
import { listOfContactRequest } from "../account/redux/Action";
import { PassesColors } from "../../json/PassesColors";
import { getStateListRequest } from "./redux/Action";

const colorList = [
	{ offset: "0%", color: "#281F77", opacity: "0.7" },
	{ offset: "29%", color: "#281F77", opacity: "0.7" },
	{ offset: "67%", color: "#281F77", opacity: "0.9" },
	{ offset: "100%", color: "#281F77", opacity: "0.9" },
];
const companyChat = [
	{
		id: 1,
		name: "Olivia Webster",
		chat: "I had an accident today…",
		time: "5 min ago",
		profileLink:
			"https://cdn.pixabay.com/photo/2017/11/11/21/55/freedom-2940655_1280.jpg",
	},
	{
		id: 2,
		name: "Olivia Webster",
		chat: "I had an accident today…",
		time: "5 min ago",
		profileLink:
			"https://cdn.pixabay.com/photo/2017/11/11/21/55/freedom-2940655_1280.jpg",
	},
	{
		id: 3,
		name: "Olivia Webster",
		chat: "I had an accident today…",
		time: "5 min ago",
		profileLink:
			"https://cdn.pixabay.com/photo/2017/11/11/21/55/freedom-2940655_1280.jpg",
	},
];

const url = "https://awesome.contents.com/";
const title = "Pass";
const message = "Please check this out.";
const icon = "data:<data_type>/<file_extension>;base64,<base64_data>";

const CompanyMoreScreen = (props) => {
	const dispatch = useDispatch();
	const userData = useSelector((state) => state.Auth.userData);
	const companyData = userData?.company[0];
	const stateList = useSelector((state) => state.Incident.stateList);
	const contactList = useSelector((state) => state.Account.contactList);
	const isLoading = useSelector((state) => state.Account.isLoading);

	const [isSharing, setIsSharing] = useState(false);
	const [state, setState] = useState("");

	const gotoBack = () => {
		props.navigation.goBack();
	};

	useEffect(() => {
		dispatch(getStateListRequest());
		dispatch(listOfContactRequest(props.navigation));

		if (companyData) {
			const incidentState = stateList?.data?.find(
				(item) => item?.code === companyData?.state
			);
			setState(incidentState?.name || "Unknown State");
		}
	}, []);

	const gotoDialOpen = () => {
		Linking.openURL(`tel:${userData.mobile}`);
	};
	const gotoEmailOpen = () => {
		Linking.openURL(`mailto:${userData?.email}`);
	};
	const renderContactList = (item) => {
		var string = item.name;
		const randomColor = Math.floor(Math.random() * 6);
		const colorName = PassesColors[randomColor].color;

		return (
			<View style={[PassesStyle.borders]}>
				<View style={{ ...CommonStyles.directionRowSB }}>
					<View style={{ ...CommonStyles.directionRowCenter }}>
						{item.photo ? (
							<FastImage
								style={[PassesStyle.profileImg]}
								source={{ uri: item.photo }}
								resizeMode={FastImage.resizeMode.cover}
							/>
						) : (
							<View
								style={[
									PassesStyle.profileImg,
									{
										backgroundColor: colorName,
									},
								]}
							>
								<Text style={[PassesStyle.textColor]}>{string.charAt(0)}</Text>
							</View>
						)}

						<View style={{ paddingLeft: 15 }}>
							<Text style={[PassesStyle.darkName]}>{item.name}</Text>
						</View>
					</View>
					<View>
						<View style={{ ...CommonStyles.directionRowCenter }}>
							<TouchableOpacity style={{ paddingVertical: 10 }}>
								<Icons
									iconColor={"#281F77"}
									iconName={"message-text-outline"}
									iconSetName={"MaterialCommunityIcons"}
									iconSize={24}
								/>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => gotoDialOpen(item.mobile)}
								style={{ paddingVertical: 20, paddingLeft: 20 }}
							>
								<Icons
									iconColor={"#281F77"}
									iconName={"phone-outline"}
									iconSetName={"MaterialCommunityIcons"}
									iconSize={24}
								/>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</View>
		);
	};
	const renderCompanyChatList = (item) => {
		return (
			<View style={[PassesStyle.borders]}>
				<View
					style={{
						...CommonStyles.directionRowSB,
						...LayoutStyle.paddingVertical10,
					}}
				>
					<View style={{ ...CommonStyles.directionRowCenter }}>
						<FastImage
							style={[PassesStyle.companyImg]}
							source={{ uri: item.profileLink }}
							resizeMode={FastImage.resizeMode.cover}
						/>
						<View style={{ paddingLeft: 15 }}>
							<Text style={[PassesStyle.darkName]}>{item.name}</Text>
							<Text style={[PassesStyle.lightPosition]}>{item.chat}</Text>
						</View>
					</View>
					<View>
						<Text style={[PassesStyle.smallText]}>{item.time}</Text>
					</View>
				</View>
			</View>
		);
	};
	const isCloseToBottom = ({
		layoutMeasurement,
		contentOffset,
		contentSize,
	}) => {
		const paddingToBottom = 20;
		return (
			layoutMeasurement.height + contentOffset.y >=
			contentSize.height - paddingToBottom
		);
	};
	const gotoSharePass = async () => {
		if (isSharing) return;
		setIsSharing(true);

		try {
			const options = Platform.select({
				ios: {
					activityItemSources: [
						{
							placeholderItem: {
								type: "text",
								content: message,
							},
							item: {
								default: {
									type: "text",
									content: url,
								},
								message: null,
							},
							linkMetadata: {
								title: title,
								icon: icon,
							},
						},
					],
				},
				default: {
					title,
					subject: title,
					message: `${url}`,
				},
			});

			Share.open(options);
		} catch (err) {
			console.warn("Share Error: ", err);
		} finally {
			setIsSharing(false);
		}
	};
	return (
		<>
			<Loader show={isLoading} />
			<View style={[PassesStyle.mainContainer, PassesStyle.backgroundWhite]}>
				<SafeAreaView style={[PassesStyle.StatusBarHight]}>
					<StatusBar
						translucent
						barStyle={"dark-content"}
						animated={true}
						backgroundColor={Colors.white}
						networkActivityIndicatorVisible={true}
					/>
				</SafeAreaView>
				<View style={[PassesStyle.topContainer]}>
					<TouchableOpacity onPress={() => gotoBack()}>
						<View style={[PassesStyle.leftIcon]}>
							<Icons
								iconName={"angle-left"}
								iconSetName={"FontAwesome6"}
								iconColor={Colors.backArrowBlack}
								iconSize={24}
							/>
						</View>
					</TouchableOpacity>
					<Text style={[PassesStyle.centerTitle]}>{"Company"}</Text>
					<TouchableOpacity
						// style={{ opacity: isSharing ? 0.5 : 1 }}
						// disabled={isSharing ? true : false}
						disabled
						style={{ opacity: 0.5 }}
						onPress={() => gotoSharePass()}
					>
						{/* <View style={[PassesStyle.rightIcon]}>
							<Icons
								iconName={"arrow-up-from-bracket"}
								iconSetName={"FontAwesome6"}
								iconColor={Colors.iconBlack}
								iconSize={20}
							/>
						</View> */}
					</TouchableOpacity>
				</View>
				<ScrollView
					showsVerticalScrollIndicator={false}
					nestedScrollEnabled={true}
					scrollEventThrottle={10}
				>
					<View style={[PassesStyle.imgContainer]}>
						<View style={[PassesStyle.logoPosition]}>
							<View
								style={[PassesStyle.imgMainBorder, { borderColor: "#281F77" }]}
							>
								<FastImage
									style={[PassesStyle.logoSet]}
									source={IMAGES.appLogo}
									resizeMode={FastImage.resizeMode.contain}
								/>
							</View>
							<View style={{ ...LayoutStyle.paddingBottom20 }}>
								<Text style={[PassesStyle.TextWhiteIcon]}>
									{companyData?.company_name}
								</Text>

								<View style={[PassesStyle.gradientIconContainer]}>
									{/* <TouchableOpacity style={[PassesStyle.gradientIcon]}>
										<Icons
											iconColor={Colors.iconWhite}
											iconName={"web"}
											iconSetName={"MaterialCommunityIcons"}
											iconSize={24}
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
											iconSize={24}
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
											iconSize={24}
										/>
									</TouchableOpacity>
								</View>
							</View>
						</View>
						<ImageBackground
							source={IMAGES.companyBG}
							style={[PassesStyle.gradientImgDetail]}
							resizeMode="cover"
						>
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
						</ImageBackground>
						<View
							style={[
								PassesStyle.detailsCard,
								{ backgroundColor: "#392e9626" },
							]}
						>
							{/* <KeyValue
								keyLabel={"Driven"}
								valueLabel={"348 Trips"}
								keyColor={"#392E96"}
							/>
							<KeyValue
								keyLabel={"Account #"}
								valueLabel={"1234567890"}
								keyColor={"#392E96"}
							/> */}
							<KeyValue
								keyLabel={"User ID"}
								valueLabel={companyData?.display_id}
								keyColor={"#392E96"}
							/>

							<KeyValue
								keyLabel={"Address"}
								valueLabel={companyData?.company_address}
								keyColor={"#392E96"}
							/>

							<KeyValue
								keyLabel={"State"}
								valueLabel={state}
								keyColor={"#392E96"}
							/>

							<KeyValue
								keyLabel={"Phone #"}
								valueLabel={userData?.mobile}
								keyColor={"#392E96"}
							/>
							<Text style={[PassesStyle.lastUpdateDate]}>
								{"Last Updated " +
									moment(companyData.updated_at).format("MM-DD-YYYY")}
							</Text>
						</View>
					</View>
				</ScrollView>
			</View>
		</>
	);
};

export default CompanyMoreScreen;
