import {
	View,
	Text,
	ImageBackground,
	ScrollView,
	TouchableOpacity,
	FlatList,
	BackHandler,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Button, DarkHeader, Icons, Loader } from "../../components";
import PassesStyle from "../../styles/PassesStyle";
import LayoutStyle from "../../styles/LayoutStyle";
import Colors from "../../styles/Colors";
import { useDispatch, useSelector } from "react-redux";
import { getPassRequest } from "./redux/Action";
import CommonStyles from "../../styles/CommonStyles";
import MESSAGE from "../../utils/Messages";
import ChatStyle from "../../styles/ChatStyle";
import { deviceHeight } from "../../utils/DeviceInfo";
import { hapticVibrate } from "../../config/CommonFunctions";

const PassListScreen = ({
	onModalClose,
	selectedPassList,
	onData,
	...props
}) => {
	const dispatch = useDispatch();

	const isLoading = useSelector((state) => state.Pass.isLoading);
	const passList = useSelector((state) => state.Pass.passList.data);
	const employeePass = passList?.personal_passes;
	const ownerPass = passList?.company_passes;
	const emplyeePassCount = employeePass?.length;
	const ownerPassCount = ownerPass?.length;
	const userData = useSelector((state) => state.Auth.userData);

	const [ownerPassList, setOwnerPassList] = useState([]);
	const [empPassList, setEmpPassList] = useState([]);
	const [count, setCount] = useState(0);

	useEffect(() => {
		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			gotoBack
		);
		return () => backHandler.remove();
	}, [props.navigation]);

	const gotoBack = () => {
		onModalClose();
		return true;
	};

	useEffect(() => {
		dispatch(getPassRequest(props.navigation));
	}, []);

	useEffect(() => {
		if (employeePass) {
			const updatedArray = employeePass.map((obj) => ({
				...obj,
				checked: false,
			}));
			setEmpPassList(updatedArray);
		}
		if (ownerPass) {
			const updatedArray = ownerPass.map((obj) => ({
				...obj,
				checked: false,
			}));
			setOwnerPassList(updatedArray);
		}
	}, [employeePass, ownerPass]);

	const renderOwnerPassList = (passItem, index) => {
		return (
			<View style={[ChatStyle.passContainer]}>
				<View style={{ flex: userData.user_type === 3 ? 0.87 : 1 }}>
					{index === 0 ? (
						<View style={{ backgroundColor: Colors.primary }}>
							<ImageBackground
								style={[PassesStyle.cardImage, { height: 75 }]}
								source={{ uri: passItem?.background_image?.photo_path }}
								resizeMode="cover"
								borderTopLeftRadius={12}
								borderTopRightRadius={12}
								borderBottomLeftRadius={ownerPassCount > 1 ? 0 : 12}
								borderBottomRightRadius={ownerPassCount > 1 ? 0 : 12}
							>
								<View
									style={[
										PassesStyle.cardContainer,
										{
											height: 75,
											borderTopLeftRadius: 12,
											borderTopRightRadius: 12,
											borderBottomLeftRadius: ownerPassCount > 1 ? 0 : 12,
											borderBottomRightRadius: ownerPassCount > 1 ? 0 : 12,
											backgroundColor: passItem?.code + "DB",
											borderColor: passItem?.code,
										},
									]}
								>
									<View style={{ ...CommonStyles.directionRowSB }}>
										<Text style={[ChatStyle.cardTitle]}>
											{passItem?.company_name}
										</Text>
										<Text style={[ChatStyle.cardType]}>
											{"#"}
											{passItem?.display_id}
										</Text>
									</View>
									<Text
										style={[
											ChatStyle.cardType,
											{ ...LayoutStyle.marginLeft20 },
										]}
									>
										{passItem?.type}
									</Text>
								</View>
							</ImageBackground>
						</View>
					) : (
						<View
							style={{
								marginTop: -10,
								borderBottomLeftRadius: ownerPassCount - 1 === index ? 12 : 0,
								borderBottomRightRadius: ownerPassCount - 1 === index ? 12 : 0,
								borderTopRightRadius: 12,
								borderTopLeftRadius: 12,
							}}
						>
							<ImageBackground
								style={[
									PassesStyle.cardImage,
									{ height: ownerPassCount - 1 === index ? 70 : 75 },
								]}
								source={{ uri: passItem?.background_image?.photo_path }}
								resizeMode="cover"
								borderBottomLeftRadius={ownerPassCount - 1 === index ? 12 : 0}
								borderBottomRightRadius={ownerPassCount - 1 === index ? 12 : 0}
								borderTopRightRadius={12}
								borderTopLeftRadius={12}
							>
								<View
									style={[
										PassesStyle.cardContainer,
										{
											height: ownerPassCount - 1 === index ? 70 : 75,
											borderColor: passItem?.code,
											backgroundColor: passItem?.code + "E6",
											borderTopLeftRadius: 12,
											borderTopRightRadius: 12,
											borderBottomLeftRadius:
												ownerPassCount - 1 === index ? 12 : 0,
											borderBottomRightRadius:
												ownerPassCount - 1 === index ? 12 : 0,
										},
									]}
								>
									<View style={{ ...CommonStyles.directionRowSB }}>
										<Text style={[ChatStyle.cardTitle]}>
											{passItem?.company_name}
										</Text>
										<Text style={[ChatStyle.cardType]}>
											{"#"}
											{passItem?.display_id}
										</Text>
									</View>
									<Text
										style={[
											ChatStyle.cardType,
											{ ...LayoutStyle.marginLeft20 },
										]}
									>
										{passItem?.type}
									</Text>
								</View>
							</ImageBackground>
						</View>
					)}
				</View>
				{userData.user_type === 3 && (
					<TouchableOpacity
						onPress={() => handleCheckbox(passItem, "owner")}
						style={{ flex: 0.065 }}
					>
						<Icons
							iconName={
								passItem.checked
									? "checkbox-marked-circle-outline"
									: "circle-outline"
							} //"checkbox-marked-circle-outline"
							iconSetName={"MaterialCommunityIcons"}
							iconColor={Colors.iconWhite}
							iconSize={22}
						/>
					</TouchableOpacity>
				)}
			</View>
		);
	};
	const renderEmplyeePassList = (passItem, index) => {
		return (
			<View style={[ChatStyle.passContainer]}>
				<View style={{ flex: 0.87 }}>
					{index === 0 ? (
						<View style={{ backgroundColor: Colors.primary }}>
							<ImageBackground
								style={[PassesStyle.cardImage, { height: deviceHeight / 10 }]}
								source={{ uri: passItem?.background_image?.photo_path }}
								resizeMode="cover"
								borderTopLeftRadius={12}
								borderTopRightRadius={12}
								borderBottomLeftRadius={emplyeePassCount > 1 ? 0 : 12}
								borderBottomRightRadius={emplyeePassCount > 1 ? 0 : 12}
							>
								<View
									style={[
										ChatStyle.cardContainer,
										{
											height: deviceHeight / 10,
											borderTopLeftRadius: 12,
											borderTopRightRadius: 12,
											borderBottomLeftRadius: emplyeePassCount > 1 ? 0 : 12,
											borderBottomRightRadius: emplyeePassCount > 1 ? 0 : 12,
											backgroundColor: passItem?.code + "DB",
											borderColor: passItem?.code,
										},
									]}
								>
									<View style={{ ...CommonStyles.directionRowSB }}>
										<Text style={[ChatStyle.cardTitle]}>
											{passItem?.company_name}
										</Text>
										<Text style={[ChatStyle.cardType]}>
											{"#"}
											{passItem?.display_id}
										</Text>
									</View>

									<Text
										style={[
											ChatStyle.cardType,
											{ ...LayoutStyle.marginLeft20 },
										]}
									>
										{passItem?.type}
									</Text>
								</View>
							</ImageBackground>
						</View>
					) : (
						<View
							style={{
								marginTop: -10,
								borderBottomLeftRadius: emplyeePassCount - 1 === index ? 12 : 0,
								borderBottomRightRadius:
									emplyeePassCount - 1 === index ? 12 : 0,
								borderTopRightRadius: 12,
								borderTopLeftRadius: 12,
							}}
						>
							<ImageBackground
								style={[
									PassesStyle.cardImage,
									{
										height:
											emplyeePassCount - 1 === index
												? deviceHeight / 10.5
												: deviceHeight / 10,
									},
								]}
								source={{ uri: passItem?.background_image?.photo_path }}
								resizeMode="cover"
								borderBottomLeftRadius={emplyeePassCount - 1 === index ? 12 : 0}
								borderBottomRightRadius={
									emplyeePassCount - 1 === index ? 12 : 0
								}
								borderTopRightRadius={12}
								borderTopLeftRadius={12}
							>
								<View
									style={[
										ChatStyle.cardContainer,
										{
											height:
												emplyeePassCount - 1 === index
													? deviceHeight / 10.5
													: deviceHeight / 10,

											borderColor: passItem?.code,
											backgroundColor: passItem?.code + "E6",
											borderTopLeftRadius: 12,
											borderTopRightRadius: 12,
											borderBottomLeftRadius:
												emplyeePassCount - 1 === index ? 12 : 0,
											borderBottomRightRadius:
												emplyeePassCount - 1 === index ? 12 : 0,
										},
									]}
								>
									<View style={{ ...CommonStyles.directionRowSB }}>
										<Text style={[ChatStyle.cardTitle]}>
											{passItem?.company_name}
										</Text>
										<Text style={[ChatStyle.cardType]}>
											{"#"}
											{passItem?.display_id}
										</Text>
									</View>

									<Text
										style={[
											ChatStyle.cardType,
											{ ...LayoutStyle.marginLeft20 },
										]}
									>
										{passItem?.type}
									</Text>
								</View>
							</ImageBackground>
						</View>
					)}
				</View>
				<TouchableOpacity
					onPress={() => handleCheckbox(passItem, "employee")}
					style={{ flex: 0.065 }}
				>
					<Icons
						iconName={
							passItem.checked
								? "checkbox-marked-circle-outline"
								: "circle-outline"
						} //"checkbox-marked-circle-outline"
						iconSetName={"MaterialCommunityIcons"}
						iconColor={Colors.iconWhite}
						iconSize={22}
					/>
				</TouchableOpacity>
			</View>
		);
	};
	const handleCheckbox = (selectedPass, type) => {
		let updatedOwnerPassList = ownerPassList.map((data) => ({
			...data,
			checked: false,
		}));
		let updatedEmpPassList = empPassList.map((data) => ({
			...data,
			checked: false,
		}));

		let isSelected = false;

		if (type === "owner") {
			updatedOwnerPassList = ownerPassList.map((data) => ({
				...data,
				checked: data.id === selectedPass.id ? !data.checked : false,
			}));
			isSelected = updatedOwnerPassList.some((data) => data.checked);
			setOwnerPassList(updatedOwnerPassList);
			setEmpPassList(updatedEmpPassList);
		} else {
			updatedEmpPassList = empPassList.map((data) => ({
				...data,
				checked: data.id === selectedPass.id ? !data.checked : false,
			}));
			isSelected = updatedEmpPassList.some((data) => data.checked);
			setEmpPassList(updatedEmpPassList);
			setOwnerPassList(updatedOwnerPassList);
		}

		setCount(isSelected ? 1 : 0);
		if (isSelected) {
			hapticVibrate();
		}
	};
	const onPressSelectPass = () => {
		if (typeof onData === "function") {
			const isSendOwnerPass = ownerPassList.filter(
				(item) => item.checked === true
			);

			if (isSendOwnerPass.length > 0) {
				onData(ownerPassList);
			} else {
				onData(empPassList);
			}
		}
	};

	return (
		<View style={[PassesStyle.mainContainer, PassesStyle.backgroundDarkBlue]}>
			<Loader show={isLoading} />
			<DarkHeader
				iconName={"close"}
				iconSetName={"MaterialCommunityIcons"}
				iconColor={Colors.backArrowWhite}
				iconSize={24}
				whiteLabel={count ? "(" + count + ") Selected" : "Select Passes"}
				// DarkHeaderMainStyle={[LayoutStyle.paddingTop30]}
				onPress={onModalClose}
			/>
			{!isLoading && (
				<>
					<ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
						<View>
							<View style={[PassesStyle.passMainText]}>
								<View style={[PassesStyle.PassTextContainer]}>
									<Text style={[PassesStyle.passTextCompnay]}>{"Compnay"}</Text>
								</View>
							</View>
							<View style={{ ...LayoutStyle.paddingBottom30 }}>
								<FlatList
									data={ownerPassList}
									renderItem={({ item: passListItem, index }) =>
										renderOwnerPassList(passListItem, index)
									}
									scrollEnabled={false}
									ListEmptyComponent={
										<View style={[CommonStyles.emptyDataAlign]}>
											<Text style={[CommonStyles.emptyDataWhite]}>
												{MESSAGE.noCompanyPass}
											</Text>
										</View>
									}
									keyExtractor={(item) => item.id}
								/>
							</View>
							<View style={{ ...LayoutStyle.paddingBottom30 }}>
								<View style={[PassesStyle.passMainText]}>
									<Text style={[PassesStyle.passTextCompnay]}>
										{"Personal"}
									</Text>
								</View>
								<FlatList
									data={empPassList}
									renderItem={({ item: passListItem, index }) =>
										renderEmplyeePassList(passListItem, index)
									}
									scrollEnabled={false}
									ListEmptyComponent={
										<View style={[CommonStyles.emptyDataAlign]}>
											<Text style={[CommonStyles.emptyDataWhite]}>
												{MESSAGE.noPersonalPass}
											</Text>
										</View>
									}
									keyExtractor={(item) => item.id}
								/>
							</View>
						</View>
					</ScrollView>
					<View style={{ ...CommonStyles.mainPadding }}>
						<Button
							onPress={onPressSelectPass}
							disabled={!count}
							btnColor={Colors.secondary}
							btnName={"Attach"}
							btnLabelColor={Colors.labelWhite}
						/>
					</View>
				</>
			)}
		</View>
	);
};

export default PassListScreen;
