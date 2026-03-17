import {
	View,
	Text,
	TouchableOpacity,
	ImageBackground,
	Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Button, Icons, LightHeader, Loader } from "../../components";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";
import { useDispatch, useSelector } from "react-redux";
import { FlatList } from "react-native";
import CommonStyles from "../../styles/CommonStyles";
import { getPassRequest } from "../passes/redux/Action";
import Api from "../../utils/Api";
import { hapticVibrate } from "../../config/CommonFunctions";

const SelectPassScreen = (props) => {
	// declare useDispatch hook
	const dispatch = useDispatch();

	const { shareUser } = props.route.params;
	const passList = useSelector((state) => state.Pass?.passList?.data);
	const employeePass = passList?.personal_passes;

	const emplyeePassCount = employeePass?.length;

	const [selectedItem, setSelectedItem] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		dispatch(getPassRequest(props.navigation));
	}, []);

	const gotoBack = () => {
		props.navigation.goBack();
	};
	const onPressSelect = (passItem) => {
		if (selectedItem && selectedItem.id === passItem.id) {
			setSelectedItem(null);
		} else {
			setSelectedItem(passItem);
			hapticVibrate();
		}
	};
	const renderPassList = (passItem, index) => {
		return (
			<View
				style={[
					AccountStyle.checkboxPassContainer,
					selectedItem?.id === passItem?.id && {
						paddingVertical: 10,
						backgroundColor: Colors.highlightSelected,
					},
				]}
			>
				<ImageBackground
					style={[AccountStyle.selectCardImage]}
					source={{ uri: passItem.background_image.photo_path }}
					resizeMode="cover"
					borderRadius={12}
				>
					<View
						style={[
							AccountStyle.selectPassContainer,
							{
								width: "90%",
								backgroundColor: passItem.code + "E6",
							},
						]}
					>
						<Text numberOfLines={1} style={[AccountStyle.selectCardTitle]}>
							{passItem.name}
						</Text>
					</View>
				</ImageBackground>
				<TouchableOpacity onPress={() => onPressSelect(passItem)}>
					<Icons
						iconName={
							selectedItem?.id === passItem?.id
								? "checkbox-marked-circle-outline"
								: "checkbox-blank-circle-outline"
						}
						iconSetName={"MaterialCommunityIcons"}
						iconColor={Colors.secondary}
						iconSize={20}
					/>
				</TouchableOpacity>
			</View>
		);
	};
	const onPressShare = async () => {
		if (selectedItem) {
			try {
				setIsLoading(true);
				const response = await Api.get(`user/share-pass/${selectedItem?.id}`);
				setIsLoading(false);

				if (response.success) {
					const phoneNumber = shareUser.mobile;
					const message = `Company Name: ${selectedItem?.company_name}\nPass URL: ${response?.data}`;

					setTimeout(() => {
						Linking.openURL(`sms:${phoneNumber}?body=${message}`);
					}, 300);
				}
			} catch (error) {
				setIsLoading(false);
				console.warn(error);
			}
		}
	};
	const RenderEmptyList = () => (
		<View style={[CommonStyles.emptyListContainer]}>
			<Text style={[CommonStyles.emptyTitle, { marginTop: "40%" }]}>
				{"No Passes Found!"}
			</Text>
			<Text style={[CommonStyles.emptyDescription, { marginBottom: 0 }]}>
				{"No Passes found, Please try again later."}
			</Text>
		</View>
	);

	return (
		<>
			<View style={[AccountStyle.mainContainer, AccountStyle.backgroundWhite]}>
				<Loader show={isLoading} />
				<LightHeader
					isLogo={false}
					isBackIcon={true}
					iconName={"angle-left"}
					iconSize={24}
					iconSetName={"FontAwesome6"}
					iconColor={Colors.backArrowBlack}
					headerText={"Select Passes"}
					headerBG={Colors.lightGrayBG}
					statusBG={Colors.lightGrayBG}
					onPress={() => gotoBack()}
				/>
				{!isLoading && (
					<>
						<FlatList
							contentContainerStyle={{ paddingBottom: 15 }}
							data={employeePass}
							renderItem={({ item: passItem, index }) =>
								renderPassList(passItem, index)
							}
							ListEmptyComponent={() => <RenderEmptyList />}
							scrollEnabled={true}
							keyExtractor={(item) => item.id}
						/>
						{selectedItem && (
							<View style={AccountStyle.deleteContainer}>
								<Button
									onPress={() => onPressShare()}
									btnName={`Share Pass`}
									isBtnActive={true}
									btnColor={Colors.secondary}
									btnLabelColor={Colors.white}
								/>
							</View>
						)}
					</>
				)}
			</View>
		</>
	);
};

export default SelectPassScreen;
