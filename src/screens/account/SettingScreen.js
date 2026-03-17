import React, { useCallback, useEffect, useState } from "react";
import {
	View,
	Text,
	StatusBar,
	FlatList,
	ScrollView,
	Pressable,
	Platform,
	TouchableOpacity,
	LayoutAnimation,
	UIManager,
	Image,
	Linking,
} from "react-native";
import Share from "react-native-share";
import { SafeAreaView } from "react-native-safe-area-context";
import FastImage from "react-native-fast-image";
import { Button, Icons, TextIcon, Overlay, Loader } from "../../components";
import AccountStyle from "../../styles/AccountStyle";
import LayoutStyle from "../../styles/LayoutStyle";
import Colors from "../../styles/Colors";
import WashingtonFilled from "../../assets/images/svg/washingtonfilled.svg";
import { useSelector } from "react-redux";
import Api from "../../utils/Api";
import { showMessage } from "react-native-flash-message";
import { ConfirmDeletePopup } from "../../components/ConfirmDeletePopup";
import ListSkeleton from "../../components/LoaderComponents/ListSkeleton";
import { deviceWidth } from "../../utils/DeviceInfo";
import CommonStyles from "../../styles/CommonStyles";
import IMAGES from "../../assets/images/Images";
import { SelectAllButton } from "../../components/SelectAllButton";
import {
	getStateKey,
	hapticVibrate,
	InviteMessage,
	truncateText,
} from "../../config/CommonFunctions";
import { getBuildNumber, getVersion } from "react-native-device-info";
import { useFocusEffect } from "@react-navigation/native";
import { appUrl } from "../../config/BaseUrl";
import { StateFilled } from "../../assets/images/States";
import FontFamily from "../../assets/fonts/FontFamily";
import MapStyle from "../../styles/MapStyle";

const icon = "data:<data_type>/<file_extension>;base64,<base64_data>";
const message = InviteMessage(" ", appUrl);
const title = "Retyrn";

const SettingScreen = (props) => {
	const userData = useSelector((state) => state.Auth.userData);
	const versionDetail = useSelector((state) => state.Auth.versionDetail?.data);

	const [isListLoading, setIsListLoading] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isModal, setIsModal] = useState(false);
	const [destinationList, setDestinationList] = useState([]);
	const [selectedLocation, setSelectedLocation] = useState(null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [selectedItems, setSelectedItems] = useState([]);
	const [multiSelectMode, setMultiSelectMode] = useState(false);
	const [showConfirmDelete, setShowConfirmDelete] = useState(false);
	const [isSharing, setIsSharing] = useState(false);

	const [latestAppVersion, setLatestAppVersion] = useState("");
	const [latestBuild, setLatestBuild] = useState(0);
	const [updateUrl, setUpdateUrl] = useState("");
	const [updateRequired, setUpdateRequired] = useState(false);

	useFocusEffect(
		useCallback(() => {
			getDestionationList();
			return () => {};
		}, [])
	);

	useEffect(() => {
		if (versionDetail) {
			const currentVersion = getVersion();
			const currentBuild = parseInt(getBuildNumber(), 10);
			let latestVersion = versionDetail;

			let newLatestAppVersion, newLatestBuild, newUpdateUrl;

			if (Platform.OS === "ios") {
				newLatestAppVersion = latestVersion?.ios_data?.version;
				newLatestBuild = parseInt(latestVersion?.ios_data?.build, 10);
				newUpdateUrl = latestVersion?.ios_data?.updateUrl;
			} else {
				newLatestAppVersion = latestVersion?.android_data?.version;
				newLatestBuild = parseInt(latestVersion?.android_data?.build, 10);
				newUpdateUrl = latestVersion?.android_data?.updateUrl;
			}

			setLatestAppVersion(newLatestAppVersion);
			setLatestBuild(newLatestBuild);
			setUpdateUrl(newUpdateUrl);

			if (
				newLatestAppVersion &&
				newLatestBuild &&
				(newLatestAppVersion !== currentVersion ||
					newLatestBuild > currentBuild)
			) {
				setUpdateRequired(true);
			}
		}
	}, [versionDetail]);

	const getDestionationList = async () => {
		try {
			setIsListLoading(true);
			const response = await Api.get(`user/get-saved-destinations`);
			if (response.data.length > 0) {
				setIsListLoading(false);
				const nameLocationArray = response.data.filter(
					(item) => item.name !== null
				);
				setDestinationList(nameLocationArray);
			} else {
				setDestinationList([]);
				setIsListLoading(false);
			}
		} catch (error) {
			setIsListLoading(false);
			console.warn(error);
		}
	};
	const gotoBack = () => {
		props.navigation.goBack();
	};
	const onRequestModalOpen = (location) => {
		setIsModal(true);
		setSelectedLocation(location);
	};
	const onRequestClose = () => {
		setIsModal(false);
		setSelectedLocation(null);
	};
	const gotoEditProfileScreen = () => {
		props.navigation.navigate("EditProfile");
	};
	const gotoEditDestinationScreen = (location) => {
		onRequestClose();
		props.navigation.navigate("EditDestination", { tripId: location?.id });
	};
	const gotoNewDesinationScreen = () => {
		props.navigation.navigate("NewDestination");
	};
	const gotoSecurityScreen = () => {
		props.navigation.navigate("Security");
	};
	const gotoLegalPolicyScreen = () => {
		props.navigation.navigate("LegalPolicy");
	};
	const gotoShareRetyrn = async () => {
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
									content: message,
								},
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
					message: message,
				},
			});

			Share.open(options);
		} catch (error) {
			console.warn("Share Error: ", error);
		} finally {
			setIsSharing(false);
		}
	};
	const gotoCrashDetection = () => {
		props.navigation.navigate("CrashDetection");
	};
	const gotoTrustedContacts = async () => {
		props.navigation.navigate("ContactList");
	};
	const gotoAddTrustedContacts = async () => {
		props.navigation.navigate("AddContact");
	};
	const gotoEmergencyContacts = async () => {
		props.navigation.navigate("EmergencyContactScreen");
	};
	const handleLongPress = (item) => {
		setMultiSelectMode(true);
		toggleItemSelection(item);
	};
	const toggleItemSelection = (item) => {
		if (selectedItems.includes(item.id)) {
			if (selectedItems.length === 1) {
				setMultiSelectMode(false);
			}
			setSelectedItems(selectedItems.filter((id) => id !== item.id));
		} else {
			setSelectedItems([...selectedItems, item.id]);
			hapticVibrate();
		}
	};
	const toggleSelectAll = () => {
		if (selectedItems.length === destinationList.length) {
			setSelectedItems([]);
			setMultiSelectMode(false);
		} else {
			const allIds = destinationList.map((item) => item.id);
			setSelectedItems(allIds);
			setMultiSelectMode(true);
			hapticVibrate();
		}
	};
	const handlePress = (item) => {
		toggleItemSelection(item);
	};
	const renderDestination = (item) => {
		const stateKey = getStateKey(item?.state);
		const stateImage = StateFilled[stateKey] || IMAGES.ImgPlaceholder;
		return (
			<View
				style={{
					backgroundColor: selectedItems.includes(item.id)
						? Colors.highlightSelected
						: Colors.white,
					paddingHorizontal: 20,
				}}
			>
				<TouchableOpacity
					onPress={() => handlePress(item)}
					onLongPress={() => handleLongPress(item)}
					style={[AccountStyle.listContainer]}
				>
					<View style={[AccountStyle.svgTextContain, { width: "85%" }]}>
						<View style={[AccountStyle.cityBG]}>
							{StateFilled[stateKey] ? (
								<Image source={stateImage} style={MapStyle.mapLayoutImg} />
							) : (
								<Text
									style={[
										MapStyle.locStateCode,
										{ color: Colors.secondary },
										item?.state_code?.length >= 3 && { fontSize: 18 },
									]}
								>
									{item?.state_code.toUpperCase().slice(0, 3)}
								</Text>
							)}
						</View>
						<View style={{ width: "83%" }}>
							<Text style={[AccountStyle.destinationLabel]}>
								{item?.name ? truncateText(item?.name, 30) : ""}
							</Text>
							<Text
								style={[
									AccountStyle.destinationValue,
									{ color: Colors.labelDarkGray },
								]}
							>
								{item?.destination_location_name
									? item?.destination_location_name
									: ""}
							</Text>
						</View>
					</View>
					{selectedItems.length > 0 ? (
						<>
							<View>
								<Icons
									iconName={
										selectedItems.includes(item.id)
											? "checkbox-marked-circle-outline"
											: "checkbox-blank-circle-outline"
									}
									iconSetName={"MaterialCommunityIcons"}
									iconColor={Colors.secondary}
									iconSize={20}
								/>
							</View>
						</>
					) : (
						<TouchableOpacity onPress={() => onRequestModalOpen(item)}>
							<View style={[AccountStyle.actionIcon]}>
								<Icons
									iconName={"dots-horizontal"}
									iconSetName={"MaterialCommunityIcons"}
									iconColor={Colors.backArrowBlack}
									iconSize={22}
								/>
							</View>
						</TouchableOpacity>
					)}
				</TouchableOpacity>
				<View style={[AccountStyle.borderBottomGray]}></View>
			</View>
		);
	};
	const gotoShareInfo = () => {
		props.navigation.navigate("SharedDetails");
	};
	const gotoMapNavigation = () => {
		setIsModal(false);
		props.navigation.navigate("MainMap", { tripId: selectedLocation?.id });
	};
	const handleDeleteDestination = async () => {
		if (selectedLocation) {
			try {
				const data = {
					id: [selectedLocation.id],
				};
				const response = await Api.post(
					`user/delete-multiple-saved-destination`,
					data
				);

				if (response.success) {
					showMessage({
						message: response.message,
						type: "success",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
					onRequestClose();
					getDestionationList();
				} else {
					showMessage({
						message: response.message,
						type: "danger",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				}
			} catch (error) {
				console.warn(error);
			}
		}
	};
	const toggleExpandCollapse = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setIsExpanded(!isExpanded);
	};
	const RenderEmptyList = () => (
		<View style={[CommonStyles.emptyListContainer]}>
			<Image
				style={AccountStyle.emptyImg}
				source={IMAGES.NoDestination}
				resizeMode={"contain"}
			/>

			<Text style={AccountStyle.emptyTitle}>{"No Destination Found!"}</Text>
			<Text style={AccountStyle.emptyDescription}>
				{"No destination found. Please add new destination."}
			</Text>
		</View>
	);

	return (
		<>
			<ConfirmDeletePopup
				show={showConfirmDelete}
				onHide={() => setShowConfirmDelete(false)}
				title={`${selectedItems.length} Destination`}
				setSelectedItems={setSelectedItems}
				setMultiSelectMode={setMultiSelectMode}
				api={`user/delete-multiple-saved-destination`}
				data={selectedItems}
				setIsLoading={setIsLoading}
				onSuccess={(message) => {
					setIsLoading(false);
					setShowConfirmDelete(false);
					setSelectedItems([]);
					setMultiSelectMode(false);
					showMessage({
						message: message,
						type: "success",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
					getDestionationList();
				}}
				onFailed={(message) => {
					setIsLoading(false);
					showMessage({
						message: message,
						type: "danger",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				}}
			/>
			<Loader show={isLoading} />
			<View style={[AccountStyle.mainContainer]}>
				<SafeAreaView style={[AccountStyle.darkContainer]}>
					<StatusBar
						translucent
						barStyle={"dark-content"}
						animated={true}
						backgroundColor={Colors.primaryBG20}
						networkActivityIndicatorVisible={true}
					/>
				</SafeAreaView>
				<View style={[AccountStyle.headerContainer]}>
					<TouchableOpacity onPress={() => gotoBack()}>
						<View style={[AccountStyle.backArrow]}>
							<Icons
								iconName={"angle-left"}
								iconSetName={"FontAwesome6"}
								iconColor={Colors.backArrowBlack}
								iconSize={24}
							/>
						</View>
					</TouchableOpacity>
					<Text style={[AccountStyle.headerTextBlack]}>{"Settings"}</Text>
				</View>
				{!isLoading && (
					<ScrollView
						showsVerticalScrollIndicator={false}
						style={{ backgroundColor: Colors.white }}
						scrollToOverflowEnabled={true}
						enableOnAndroid={true}
						overScrollMode={"never"}
					>
						<View style={[AccountStyle.profileCard]}>
							<View style={[AccountStyle.settingProfileView]}>
								<View style={[AccountStyle.profileImgView]}>
									<FastImage
										style={[AccountStyle.profileImg]}
										source={{
											uri: userData?.photo_path
												? userData?.photo_path
												: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
										}}
										resizeMode={FastImage.resizeMode.cover}
									/>
								</View>
								<View style={[AccountStyle.userInfo]}>
									<Text style={[AccountStyle.userName]}>
										{truncateText(userData?.name, 25)}
									</Text>
									<View style={[AccountStyle.verifyContainer]}>
										<Text style={[AccountStyle.mobileNumb]}>
											{userData?.mobile}
										</Text>
										<Icons
											iconName={"check-circle-outline"}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={Colors.success}
											iconSize={16}
											iconMainstyle={{ paddingBottom: "3%" }}
										/>
									</View>
								</View>
							</View>
							<Button
								onPress={() => gotoEditProfileScreen()}
								isBtnActive={true}
								btnBorderColor={Colors.primary}
								btnColor={Colors.transparent}
								btnWidth={1}
								btnName={"Edit Profile"}
								btnLabelColor={Colors.labelBlack}
							/>
						</View>
						<View style={[AccountStyle.detailsView, { paddingHorizontal: 0 }]}>
							<View
								style={[AccountStyle.rowBetween, { paddingHorizontal: 20 }]}
							>
								<View>
									<Text style={[AccountStyle.titleLabel]}>
										{"Destinations"}
									</Text>
									<Text style={[AccountStyle.subTitle]}>
										{"Get to your favorite destinations faster!"}
									</Text>
								</View>
								{destinationList?.length > 2 && (
									<TouchableOpacity onPress={toggleExpandCollapse}>
										<Icons
											iconColor={Colors.inputBlackText}
											iconSetName={"MaterialCommunityIcons"}
											iconName={isExpanded ? "chevron-up" : "chevron-down"}
											iconSize={22}
										/>
									</TouchableOpacity>
								)}
							</View>
							<View style={{ paddingHorizontal: 20 }}>
								{destinationList.length !== 0 && (
									<SelectAllButton
										toggleSelectAll={toggleSelectAll}
										selectedItems={selectedItems}
										mainList={destinationList}
									/>
								)}
							</View>
							{isListLoading ? (
								<FlatList
									style={{
										...CommonStyles.emptyList,
										marginVertical: 0,
										paddingHorizontal: 20,
									}}
									data={Array(2).fill(0)}
									keyExtractor={(item, index) => `skeleton-${index}`}
									renderItem={({ item, index }) => (
										<ListSkeleton width={deviceWidth / 1.2} />
									)}
								/>
							) : (
								<FlatList
									data={
										isExpanded ? destinationList : destinationList.slice(0, 2)
									}
									renderItem={({ item: destinationItem }) =>
										renderDestination(destinationItem)
									}
									scrollEnabled={false}
									keyExtractor={(item) => item.id}
									ListEmptyComponent={() => (
										<View style={{ height: 120 }}>
											<RenderEmptyList />
										</View>
									)}
								/>
							)}
							<View style={{ marginTop: 20, paddingHorizontal: 20 }}>
								{selectedItems.length > 0 ? (
									<Button
										onPress={() => setShowConfirmDelete(true)}
										btnName={`${
											selectedItems?.length > 1
												? `${selectedItems?.length} Remove Destinations`
												: `${selectedItems?.length} Remove Destination`
										}`}
										isBtnActive={true}
										btnColor={Colors.red}
										btnLabelColor={Colors.white}
									/>
								) : (
									<Button
										onPress={() => gotoNewDesinationScreen()}
										isBtnActive={true}
										btnColor={Colors.secondary}
										btnLabelColor={Colors.white}
										btnName={"Add Destination"}
									/>
								)}
							</View>
							<View style={{ paddingHorizontal: 20 }}>
								<TextIcon
									textIconMainStyle={[AccountStyle.optionContainer]}
									textName={"Safty"}
									textColor={Colors.labelBlack}
									textStyle={[AccountStyle.manuTitle]}
								/>
								<TouchableOpacity onPress={() => gotoAddTrustedContacts()}>
									<View style={[AccountStyle.manuContainer]}>
										<Icons
											iconName={"address-book"}
											iconSetName={"FontAwesome6"}
											iconColor={Colors.iconBlack}
											iconSize={22}
										/>
										<View style={{ ...LayoutStyle.paddingHorizontal10 }}>
											<Text style={[AccountStyle.manuLabel]}>
												{"Add Contacts"}
											</Text>
											<Text style={[AccountStyle.manuDesc]}>
												{"Add device contacts"}
											</Text>
										</View>
									</View>
								</TouchableOpacity>
								<View style={[AccountStyle.borderBottomGray]}></View>
								<TouchableOpacity onPress={() => gotoTrustedContacts()}>
									<View style={[AccountStyle.manuContainer]}>
										<Icons
											iconName={"account-multiple-outline"}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={Colors.iconBlack}
											iconSize={24}
										/>
										<View style={{ ...LayoutStyle.paddingHorizontal10 }}>
											<Text style={[AccountStyle.manuLabel]}>
												{"Trusted Contacts"}
											</Text>
											<Text style={[AccountStyle.manuDesc]}>
												{"Invite your trusted contact"}
											</Text>
										</View>
									</View>
								</TouchableOpacity>
								<View style={[AccountStyle.borderBottomGray]}></View>
								<TouchableOpacity onPress={() => gotoEmergencyContacts()}>
									<View style={[AccountStyle.manuContainer]}>
										<Icons
											iconName={"account-multiple-outline"}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={Colors.iconBlack}
											iconSize={24}
										/>
										<View style={{ ...LayoutStyle.paddingHorizontal10 }}>
											<Text style={[AccountStyle.manuLabel]}>
												{"Emergency Contacts"}
											</Text>
											<Text style={[AccountStyle.manuDesc]}>
												{"Add or remove emergency contacts"}
											</Text>
										</View>
									</View>
								</TouchableOpacity>
								<View style={[AccountStyle.borderBottomGray]}></View>
								<TouchableOpacity onPress={() => gotoShareInfo()}>
									<View style={[AccountStyle.manuContainer]}>
										<Icons
											iconName={"account-multiple-outline"}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={Colors.iconBlack}
											iconSize={24}
										/>
										<View style={{ ...LayoutStyle.paddingHorizontal10 }}>
											<Text style={[AccountStyle.manuLabel]}>{"Share"}</Text>
											<Text style={[AccountStyle.manuDesc]}>
												{
													"Share information with trusted contacts in a single tap"
												}
											</Text>
										</View>
									</View>
								</TouchableOpacity>
								<View style={[AccountStyle.borderBottomGray]}></View>
								<TouchableOpacity onPress={() => gotoCrashDetection()}>
									<View style={[AccountStyle.manuContainer]}>
										<Icons
											iconName={"car-crash"}
											iconSetName={"MaterialIcons"}
											iconColor={Colors.iconBlack}
											iconSize={24}
										/>
										<View style={{ ...LayoutStyle.paddingHorizontal10 }}>
											<Text style={[AccountStyle.manuLabel]}>
												{"Crash Detection"}
											</Text>
											<Text style={[AccountStyle.manuDesc]}>
												{"Manage your CrashDetection notifications"}
											</Text>
										</View>
									</View>
								</TouchableOpacity>
								<View style={[AccountStyle.borderBottomGray]}></View>

								<TouchableOpacity
									disabled={isSharing}
									style={{ opacity: isSharing ? 0.5 : 1 }}
									onPress={() => {
										gotoShareRetyrn();
									}}
								>
									<View style={[AccountStyle.manuContainer]}>
										<Icons
											iconName={"tray-arrow-up"}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={Colors.iconBlack}
											iconSize={22}
										/>
										<View style={{ ...LayoutStyle.paddingHorizontal10 }}>
											<Text style={[AccountStyle.manuLabel]}>
												{"Share Retryn"}
											</Text>
											<Text style={[AccountStyle.manuDesc]}>
												{"Invite family,friends and colleagues to join Retryn"}
											</Text>
										</View>
									</View>
								</TouchableOpacity>
								<View style={[AccountStyle.borderBottomGray]}></View>

								<TouchableOpacity onPress={() => gotoLegalPolicyScreen()}>
									<View style={[AccountStyle.manuContainer]}>
										<Icons
											iconName={"privacy-tip"}
											iconSetName={"MaterialIcons"}
											iconColor={Colors.iconBlack}
											iconSize={22}
										/>
										<View style={{ ...LayoutStyle.paddingHorizontal10 }}>
											<Text style={[AccountStyle.manuLabel]}>{"Privacy"}</Text>
											<Text style={[AccountStyle.manuDesc]}>
												{
													"Take control of your privacy and learn how we protect it"
												}
											</Text>
										</View>
									</View>
								</TouchableOpacity>
								<View style={[AccountStyle.borderBottomGray]}></View>

								<TouchableOpacity onPress={() => gotoSecurityScreen()}>
									<View style={[AccountStyle.manuContainer]}>
										<Icons
											iconName={"security"}
											iconSetName={"MaterialCommunityIcons"}
											iconColor={Colors.iconBlack}
											iconSize={22}
										/>
										<View style={{ ...LayoutStyle.paddingHorizontal10 }}>
											<Text style={[AccountStyle.manuLabel]}>{"Security"}</Text>
											<Text style={[AccountStyle.manuDesc]}>
												{"Manage security settings"}
											</Text>
										</View>
									</View>
								</TouchableOpacity>
								<View style={[AccountStyle.borderBottomGray]}></View>

								{updateRequired && (
									<TouchableOpacity
										style={AccountStyle.updateBtn}
										onPress={() => Linking.openURL(updateUrl)}
									>
										<View style={[CommonStyles.directionRowCenter]}>
											<Image
												source={IMAGES.updateAvailable}
												style={[AccountStyle.updateAvailableImg]}
											/>
											<View style={[{ ...LayoutStyle.paddingHorizontal10 }]}>
												<Text
													style={[AccountStyle.manuLabel, { width: "100%" }]}
												>
													{"Update Available"}
												</Text>
												<Text style={[AccountStyle.updateDesTxt]}>
													{`A new version ${latestAppVersion} is available!`}
												</Text>
											</View>
										</View>
									</TouchableOpacity>
								)}
							</View>
						</View>
					</ScrollView>
				)}
				<Overlay onRequestClose={() => onRequestClose()} visible={isModal}>
					{selectedLocation && (
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
									<Text style={[AccountStyle.modalHeader]}>{"Actions"}</Text>
									<Pressable>
										<Icons
											iconColor={Colors.white}
											iconName={"close"}
											iconSetName={"MaterialCommunityIcons"}
										/>
									</Pressable>
								</View>
								<View style={[AccountStyle.addrContainer]}>
									<Text style={[AccountStyle.addressDisplay]}>
										{"Choose what you would like to do with"}
									</Text>
									<Text
										style={[
											AccountStyle.addressDisplay,
											{ color: Colors.secondary },
										]}
									>
										{selectedLocation?.address}
									</Text>
								</View>
								<View style={[AccountStyle.actionIconContainer]}>
									<Pressable
										onPress={() => gotoEditDestinationScreen(selectedLocation)}
										style={({ pressed }) => [
											{ backgroundColor: pressed ? "#EFEFEF80" : "#EFEFEF" },
											AccountStyle.actionIconsView,
										]}
									>
										<Icons
											iconColor={Colors.iconBlack}
											iconName={"mode-edit"}
											iconSetName={"MaterialIcons"}
											iconSize={18}
										/>
										<Text style={[AccountStyle.iconText]}>{"Edit"}</Text>
									</Pressable>
									<Pressable
										style={({ pressed }) => [
											{ backgroundColor: pressed ? "#DAECF780" : "#DAECF7" },
											AccountStyle.actionIconsView,
										]}
										onPress={() => gotoMapNavigation()}
									>
										<Icons
											iconColor={Colors.iconBlack}
											iconName={"location-arrow"}
											iconSetName={"FontAwesome6"}
											iconSize={18}
										/>
										<Text style={[AccountStyle.iconText]}>
											{"Set Destination"}
										</Text>
									</Pressable>
									<Pressable
										style={({ pressed }) => [
											{ backgroundColor: pressed ? "#FFCBCB80" : "#FFCBCB" },
											AccountStyle.actionIconsView,
										]}
										onPress={() => handleDeleteDestination()}
									>
										<Icons
											iconColor={Colors.iconBlack}
											iconName={"trash"}
											iconSetName={"FontAwesome6"}
											iconSize={18}
										/>
										<Text style={[AccountStyle.iconText]}>{"Remove"}</Text>
									</Pressable>
								</View>
							</View>
						</View>
					)}
				</Overlay>
			</View>
		</>
	);
};

export default SettingScreen;
