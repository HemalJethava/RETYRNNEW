import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	StatusBar,
	Platform,
	ScrollView,
	TouchableOpacity,
	ToastAndroid,
	Alert,
	Modal,
	TouchableWithoutFeedback,
	Image,
} from "react-native";
import Colors from "../../styles/Colors";
import LayoutStyle from "../../styles/LayoutStyle";
import ComponentStyles from "../../styles/ComponentStyles";
import FastImage from "react-native-fast-image";
import {
	formatJoiningDuration,
	noProfilePic,
} from "../../config/CommonFunctions";
import { useDispatch, useSelector } from "react-redux";
import CommonStyles from "../../styles/CommonStyles";
import FontFamily from "../../assets/fonts/FontFamily";
import { Button, Icons } from "../../components";
import { formatCodeWithMobileNumber } from "../../utils/Validation";
import Clipboard from "@react-native-clipboard/clipboard";
import { getStateListRequest } from "../auth/redux/Action";
import { BlurView } from "@react-native-community/blur";
import { ImageZoom } from "@likashefqet/react-native-image-zoom";

const ProfileDetailScreen = (props) => {
	const dispatch = useDispatch();
	const userData = useSelector((state) => state.Auth.userData);
	const stateList = useSelector((state) => state.Auth.stateList);

	const [userType, setUserType] = useState("-");
	const [companyDetail, setCompanyDetail] = useState(null);
	const [companyState, setCompanyState] = useState("");
	const [showProfilePicModal, setShowProfilePicModal] = useState(false);

	const [isZoomed, setIsZoomed] = useState(false);
	const [imageError, setImageError] = useState(false);

	useEffect(() => {
		dispatch(getStateListRequest());
	}, [dispatch]);

	useEffect(() => {
		if (userData) {
			console.log("userData: ", userData);

			const type =
				userData?.user_type === 1
					? "Admin"
					: userData?.user_type === 2
					? "Employee"
					: "Owner";
			setUserType(type);

			const details = !Array.isArray(userData?.company_detail)
				? userData?.company_detail
				: null;
			setCompanyDetail(details);

			if (stateList?.data?.length > 0 && details?.state) {
				const selectedState = stateList.data.find(
					(item) => item.code === details.state
				);
				setCompanyState(selectedState?.name);
			}
		}
	}, [stateList]);

	const goBack = () => {
		props.navigation.goBack();
	};
	const Title = ({ title }) => (
		<View style={styles.titleContainer}>
			<Text style={styles.title}>{title}</Text>
		</View>
	);
	const handleCopy = async (detail) => {
		try {
			if (detail) {
				await Clipboard.setString(detail);

				if (Platform.OS === "ios") {
					Alert.alert(
						"Copied",
						"The text has been copied to your clipboard.",
						[
							{
								text: "OK",
								style: "default",
							},
						],
						{ cancelable: true }
					);
				} else {
					ToastAndroid.show("Copied to clipboard", ToastAndroid.SHORT);
				}
			}
		} catch (error) {
			console.error("Clipboard copy failed:", error);
			if (Platform.OS === "ios") {
				Alert.alert("Error", "Unable to copy text.");
			} else {
				ToastAndroid.show("Failed to copy", ToastAndroid.SHORT);
			}
		}
	};
	const DetailInput = ({
		title,
		detail,
		numberOfLines,
		libraryName,
		iconName,
		iconSize = 18,
	}) => {
		return (
			<>
				<Text style={styles.inputTitle}>{title}</Text>
				<View style={[styles.inputView]}>
					<View style={styles.icon}>
						<Icons
							iconSetName={libraryName}
							iconName={iconName}
							iconColor={"#434343"}
							iconSize={iconSize}
						/>
					</View>
					<TouchableOpacity
						activeOpacity={0.8}
						onLongPress={() => handleCopy(detail)}
						delayLongPress={300}
					>
						<Text
							style={[styles.inputTxt]}
							numberOfLines={!numberOfLines ? 1 : 5}
						>
							{detail}
						</Text>
					</TouchableOpacity>
				</View>
			</>
		);
	};

	return (
		<View style={styles.container}>
			<SafeAreaView style={[ComponentStyles.darkContainer]}>
				<StatusBar
					translucent
					barStyle={"light-content"}
					animated={true}
					backgroundColor={Colors.primary}
					networkActivityIndicatorVisible={true}
				/>
			</SafeAreaView>
			<View style={styles.header}>
				<View style={styles.headerRow}>
					<TouchableOpacity onPress={goBack}>
						<Icons
							iconSetName={"FontAwesome6"}
							iconName={"angle-left"}
							iconColor={Colors.white}
							iconSize={24}
						/>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.imgContainer}
						onPress={() => setShowProfilePicModal(true)}
					>
						<FastImage
							source={{
								uri:
									userData?.photo_path ||
									"https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
							}}
							style={styles.profileImg}
							resizeMode={FastImage.resizeMode.cover}
							onError={() => setImageError(true)}
						/>
						{/* <Image
							source={{
								uri: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
							}}
							style={{
								height: "100%",
								width: "100%",
								borderRadius: "50%",
								resizeMode: "cover",
							}}
						/> */}
					</TouchableOpacity>
					<View style={styles.headerTxtContainer}>
						<Text style={styles.userName}>{userData?.name}</Text>
						<Text style={styles.designation}>
							{companyDetail?.company_name}
						</Text>
					</View>
				</View>
			</View>
			<ScrollView
				style={[styles.flex, { marginTop: 50 }]}
				contentContainerStyle={[styles.scrollView]}
				showsVerticalScrollIndicator={false}
			>
				<View style={[styles.flex, { ...LayoutStyle.paddingBottom20 }]}>
					<Title title={"Personal Detail"} />
					<View style={[styles.detailContainer]}>
						<DetailInput
							title={"Name"}
							detail={userData?.name}
							libraryName={"Ionicons"}
							iconName={"person"}
						/>
						<DetailInput
							title={"Email"}
							detail={userData?.email}
							libraryName={"MaterialIcons"}
							iconName={"email"}
						/>
						<DetailInput
							title={"Phone Number"}
							detail={formatCodeWithMobileNumber(userData?.mobile)}
							libraryName={"MaterialIcons"}
							iconName={"phone"}
						/>
						<DetailInput
							title={"Designation"}
							detail={userType}
							libraryName={"MaterialDesignIcons"}
							iconName={"account-tie"}
							iconSize={22}
						/>
					</View>

					<Title title={"Company Detail"} />
					<View style={[styles.detailContainer]}>
						<DetailInput
							title={"Company Name"}
							detail={companyDetail?.company_name || "-"}
							libraryName={"MaterialIcons"}
							iconName={"work"}
						/>
						<DetailInput
							title={"Address"}
							detail={companyDetail?.company_address || "-"}
							libraryName={"Ionicons"}
							iconName={"location-sharp"}
						/>
						<DetailInput
							title={"Address 2"}
							detail={companyDetail?.company_address_2 || "-"}
							libraryName={"Entypo"}
							iconName={"address"}
						/>
						<DetailInput
							title={"City"}
							detail={companyDetail?.city || "-"}
							libraryName={"MaterialIcons"}
							iconName={"location-city"}
						/>
						<DetailInput
							title={"State"}
							detail={companyState || "-"}
							libraryName={"MaterialDesignIcons"}
							iconName={"map-marker-radius"}
						/>
						<DetailInput
							title={"Zip Code"}
							detail={companyDetail?.zip_code || "-"}
							libraryName={"MaterialDesignIcons"}
							iconName={"numeric"}
						/>
						<DetailInput
							title={"Joining Date"}
							detail={formatJoiningDuration(userData?.created_at)}
							libraryName={"Ionicons"}
							iconName={"calendar"}
						/>
						<DetailInput
							title={"Status"}
							detail={
								userData?.status.charAt(0).toUpperCase() +
								userData?.status.slice(1)
							}
							libraryName={"MaterialDesignIcons"}
							iconName={"circle-slice-8"}
						/>
					</View>

					<Title title={"Contact Detail"} />
					<View style={[styles.detailContainer]}>
						<DetailInput
							title={"Name"}
							detail={companyDetail?.user?.name || "-"}
							libraryName={"Ionicons"}
							iconName={"person"}
						/>
						<DetailInput
							title={"Email"}
							detail={companyDetail?.user?.email || "-"}
							libraryName={"MaterialIcons"}
							iconName={"email"}
						/>
						<DetailInput
							title={"Phone Number"}
							detail={
								formatCodeWithMobileNumber(companyDetail?.user?.mobile) || "-"
							}
							libraryName={"MaterialIcons"}
							iconName={"phone"}
						/>
					</View>

					<Title title={"Support"} />
					<View style={[styles.detailContainer]}>
						<DetailInput
							title={"Email"}
							detail={userData?.support_email || "-"}
							libraryName={"MaterialIcons"}
							iconName={"email"}
						/>
					</View>
				</View>

				<View style={styles.editProfile}>
					<Button
						onPress={() => props.navigation.goBack()}
						isBtnActive={true}
						btnName={"Edit Profile"}
						btnColor={Colors.primary}
						btnLabelColor={Colors.white}
					/>
				</View>
			</ScrollView>

			{showProfilePicModal && (
				<View style={styles.modal}>
					<TouchableWithoutFeedback
						onPress={() => setShowProfilePicModal(false)}
					>
						<View style={styles.modalContainer}>
							<BlurView
								style={StyleSheet.absoluteFill}
								blurType="light"
								blurAmount={5}
							/>
							<View style={[styles.mainContainer]}>
								<ImageZoom
									uri={userData?.photo_path || noProfilePic}
									minScale={1}
									maxScale={5}
									doubleTapScale={3}
									isSingleTapEnabled
									isDoubleTapEnabled
									resizeMode="cover"
									style={styles.modalProfileImg}
									onInteractionStart={() => {
										setIsZoomed(true);
									}}
									onInteractionEnd={() => {
										setIsZoomed(false);
									}}
								/>
							</View>
						</View>
					</TouchableWithoutFeedback>
				</View>
			)}
		</View>
	);
};

export default ProfileDetailScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
	},
	flex: {
		flex: 1,
	},
	header: {
		backgroundColor: Colors.primary,
		height: 100,
	},
	headerRow: {
		...CommonStyles.directionRowSB,
		...LayoutStyle.paddingHorizontal20,
	},
	imgContainer: {
		height: 100,
		width: 100,
		borderRadius: 50,
		borderWidth: 1.5,
		...LayoutStyle.marginLeft20,
		borderColor: Colors.secondary,
		position: "absolute",
		left: 0,
		top: 50,
	},
	profileImg: {
		height: "100%",
		width: "100%",
		borderRadius: "50%",
	},
	headerTxtContainer: {
		justifyContent: "center",
		...LayoutStyle.marginTop10,
	},
	userName: {
		color: Colors.white,
		fontSize: 20,
		fontFamily: FontFamily.PoppinsSemiBold,
		textAlign: "right",
	},
	designation: {
		color: Colors.lightGrayBG,
		fontSize: 12,
		fontFamily: FontFamily.PoppinsMedium,
		textAlign: "right",
	},
	scrollView: {
		flexGrow: 1,
		flexDirection: "column",
		justifyContent: "space-between",
	},
	detailContainer: {
		backgroundColor: "#fff",
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: -2 },
				shadowOpacity: 0.1,
				shadowRadius: 8,
			},
			android: {
				elevation: 1.5,
			},
		}),
		...LayoutStyle.marginHorizontal20,
		...LayoutStyle.padding10,
		borderRadius: 14,
	},
	titleContainer: {
		...LayoutStyle.paddingHorizontal20,
		...LayoutStyle.marginTop20,
		...LayoutStyle.marginBottom10,
	},
	title: {
		color: Colors.labelBlack,
		fontSize: 17,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
	icon: {
		marginRight: 5,
		top: 2,
	},
	inputTitle: {
		color: "#707070",
		fontSize: 14,
		fontFamily: FontFamily.PoppinsSemiBold,
		marginTop: 5,
	},
	inputView: {
		flexDirection: "row",
		padding: 7,
		marginVertical: 7,
		borderWidth: 1,
		borderColor: Colors.lightGrayBG,
		borderRadius: 5,
	},
	inputTxt: {
		color: "#434343",
		fontSize: 16,
		fontFamily: FontFamily.PoppinsMedium,
	},
	editProfile: {
		...LayoutStyle.padding20,
		backgroundColor: "#fff",
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: -2 },
				shadowOpacity: 0.1,
				shadowRadius: 8,
			},
			android: {
				elevation: 5,
			},
		}),
	},
	modal: {
		position: "absolute",
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		zIndex: 999,
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		...LayoutStyle.padding20,
	},
	mainContainer: {
		height: 260,
		width: 260,
	},
	modalProfileImg: {
		height: "100%",
		width: "100%",
		borderRadius: 130,
		// borderRadius: "50%",
		resizeMode: "cover",
		borderWidth: 2,
		borderColor: Colors.secondary,
	},
});
