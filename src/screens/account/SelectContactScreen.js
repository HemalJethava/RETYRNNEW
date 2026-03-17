import { View, Text, TouchableOpacity, Linking, Image } from "react-native";
import React, { useMemo, useState } from "react";
import { Button, Icons, LightHeader } from "../../components";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";
import { useSelector } from "react-redux";
import { FlatList } from "react-native";
import FastImage from "react-native-fast-image";
import { PassesColors } from "../../json/PassesColors";
import CommonStyles from "../../styles/CommonStyles";
import IMAGES from "../../assets/images/Images";
import { hapticVibrate } from "../../config/CommonFunctions";

const SelectContactScreen = (props) => {
	const { shareUser } = props.route.params;
	const contactList = useSelector((state) => state.Account.contactList);

	const [contactData, setContactData] = useState([]);
	const [selectedItem, setSelectedItem] = useState(null);

	const gotoBack = () => {
		props.navigation.goBack();
	};

	useMemo(() => {
		if (!contactData) {
			return null;
		}
		contactList.forEach((element) => {
			element.isSelected = false;
		});
		setContactData(contactList);
	}, [contactData]);

	const onPressSelect = (item) => {
		if (selectedItem && selectedItem.id === item.id) {
			setSelectedItem(null);
		} else {
			setSelectedItem(item);
			hapticVibrate();
		}
	};
	const renderContactList = (item, index) => {
		var string = item.name;
		const randomColor = Math.floor(Math.random() * 6);
		const colorName = PassesColors[randomColor].color;

		return (
			<View key={index}>
				<View
					style={[
						AccountStyle.contactList,
						{
							backgroundColor:
								item.id === selectedItem?.id
									? Colors.highlightSelected
									: Colors.white,
						},
					]}
				>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							flex: 1,
						}}
					>
						{item.photo ? (
							<FastImage
								style={[AccountStyle.contactImg]}
								source={{
									uri: item.photo,
								}}
								resizeMode={FastImage.resizeMode.cover}
							/>
						) : (
							<View
								style={[
									AccountStyle.contactImg,
									{
										backgroundColor: colorName,
									},
								]}
							>
								<Text style={[AccountStyle.textColor]}>{string.charAt(0)}</Text>
							</View>
						)}
						<View style={[AccountStyle.contactListContainer, { flex: 1 }]}>
							<Text numberOfLines={1} style={[AccountStyle.addContactName]}>
								{item.name}
							</Text>
						</View>
					</View>
					<TouchableOpacity onPress={() => onPressSelect(item)}>
						<Icons
							iconName={
								item.id === selectedItem?.id
									? "checkbox-marked-circle-outline"
									: "checkbox-blank-circle-outline"
							}
							iconSetName={"MaterialCommunityIcons"}
							iconColor={Colors.secondary}
							iconSize={20}
						/>
					</TouchableOpacity>
				</View>
				<View style={[AccountStyle.borderBottomGrayLoop]}></View>
			</View>
		);
	};
	const onPressShare = () => {
		if (selectedItem) {
			const phoneNumber = shareUser.mobile;
			const message = `Name: ${selectedItem?.name}\nMobile Number: ${selectedItem?.mobile}`;

			Linking.openURL(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`);
		}
	};
	const RenderEmptyList = () => (
		<View style={[CommonStyles.emptyListContainer]}>
			<Image
				style={[CommonStyles.emptyImg, { marginTop: "40%" }]}
				source={IMAGES.NoContactList}
				resizeMode={"contain"}
			/>

			<Text style={CommonStyles.emptyTitle}>{"No Trusted Contact Found!"}</Text>
			<Text style={[CommonStyles.emptyDescription, { marginBottom: 0 }]}>
				{"No trusted contact found, Please try again later."}
			</Text>
		</View>
	);

	return (
		<>
			<View style={[AccountStyle.mainContainer, AccountStyle.backgroundWhite]}>
				<LightHeader
					isLogo={false}
					isBackIcon={true}
					iconName={"angle-left"}
					iconSize={24}
					iconSetName={"FontAwesome6"}
					iconColor={Colors.backArrowBlack}
					headerText={"Select Contacts"}
					headerBG={Colors.lightGrayBG}
					statusBG={Colors.lightGrayBG}
					onPress={() => gotoBack()}
				/>
				<FlatList
					data={contactData}
					renderItem={({ item: contactItem, index }) =>
						renderContactList(contactItem, index)
					}
					ListEmptyComponent={() => <RenderEmptyList />}
					scrollEnabled={true}
					keyExtractor={(item) => item.id}
				/>

				{selectedItem && (
					<View style={AccountStyle.deleteContainer}>
						<Button
							onPress={() => onPressShare()}
							btnName={`Share contact`}
							isBtnActive={true}
							btnColor={Colors.secondary}
							btnLabelColor={Colors.white}
						/>
					</View>
				)}
			</View>
		</>
	);
};

export default SelectContactScreen;
