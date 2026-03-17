import { View, Text, TouchableOpacity, Pressable, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { Button, Icons, LightHeader, Loader } from "../../components";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";
import { useDispatch, useSelector } from "react-redux";
import { FlatList } from "react-native";
import FastImage from "react-native-fast-image";
import { PassesColors } from "../../json/PassesColors";
import { Overlay } from "react-native-share";
import { listOfContactRequest } from "./redux/Action";
import CommonStyles from "../../styles/CommonStyles";
import IMAGES from "../../assets/images/Images";

const SharedDetailsScreen = (props) => {
	const dispatch = useDispatch();

	const contactList = useSelector((state) => state.Account.contactList);
	const isLoading = useSelector((state) => state.Account.isLoading);

	const [isModal, setIsModal] = useState(false);
	const [getName, setGetName] = useState(false);
	const [selectedItem, setSelectedItem] = useState(null);

	const gotoBack = () => {
		props.navigation.goBack();
	};

	useEffect(() => {
		dispatch(listOfContactRequest(props.navigation));
	}, []);

	const onRequestModalOpen = (item) => {
		setIsModal(true);
		setGetName(item.name);
	};
	const onRequestClose = () => {
		setIsModal(false);
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
							backgroundColor: item.isSelected
								? Colors.lightBlue
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
					<TouchableOpacity
						style={{ padding: 10 }}
						onPress={() => {
							setSelectedItem(item);
							onRequestModalOpen(item);
						}}
					>
						<Icons
							iconName={"share"}
							iconSetName={"Feather"}
							iconColor={Colors.iconBlack}
							iconSize={20}
						/>
					</TouchableOpacity>
				</View>
				<View style={[AccountStyle.borderBottomGrayLoop]}></View>
			</View>
		);
	};
	const gotoShareContact = () => {
		setIsModal(false);
		props.navigation.navigate("SelectContact", { shareUser: selectedItem });
	};
	const gotoSharePass = () => {
		setIsModal(false);
		props.navigation.navigate("SelectDestination", { shareUser: selectedItem });
	};
	const gotoShareDestination = () => {
		setIsModal(false);
		props.navigation.navigate("SelectPass", { shareUser: selectedItem });
	};

	const RenderEmptyList = () => (
		<View style={[CommonStyles.emptyListContainer, { marginTop: "15%" }]}>
			<Image
				style={CommonStyles.emptyImg}
				source={IMAGES.NoContactList}
				resizeMode={"contain"}
			/>

			<Text style={CommonStyles.emptyTitle}>{"No Trusted Contact Found!"}</Text>
			<Text style={CommonStyles.emptyDescription}>
				{"No trusted contact found. Please add new contact."}
			</Text>
			<Button
				btnColor={Colors.primary}
				btnName={"Add Trusted Contact"}
				btnLabelColor={Colors.white}
				isBtnActive={true}
				onPress={() => props.navigation.navigate("AddContact")}
			/>
		</View>
	);

	return (
		<>
			<Loader show={isLoading} />
			<View style={[AccountStyle.mainContainer, AccountStyle.backgroundWhite]}>
				<LightHeader
					isLogo={false}
					isBackIcon={true}
					iconName={"angle-left"}
					iconSize={24}
					iconSetName={"FontAwesome6"}
					iconColor={Colors.backArrowBlack}
					headerText={"Share Details"}
					headerBG={Colors.lightGrayBG}
					statusBG={Colors.lightGrayBG}
					onPress={() => gotoBack()}
				/>
				<FlatList
					data={contactList}
					renderItem={({ item: contactItem, index }) =>
						renderContactList(contactItem, index)
					}
					ListEmptyComponent={() => <RenderEmptyList />}
					scrollEnabled={true}
					keyExtractor={(item) => item.id}
				/>

				<Overlay onRequestClose={() => onRequestClose()} visible={isModal}>
					<View style={[AccountStyle.shareModalCenter, { marginTop: 0 }]}>
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
									{"What would you like to "}
								</Text>
								<Text style={[AccountStyle.addressDisplay]}>
									{"share to "}
									<Text
										style={[
											AccountStyle.addressDisplay,
											{ color: Colors.secondary },
										]}
									>
										{getName}
									</Text>
									<Text>{"?"}</Text>
								</Text>
							</View>
							<View style={[AccountStyle.actionIconContainer]}>
								<Pressable
									onPress={() => gotoShareContact()}
									style={({ pressed }) => [
										{ backgroundColor: pressed ? "#EFEFEF80" : "#EFEFEF" },
										AccountStyle.actionIconsView,
									]}
								>
									<Icons
										iconColor={Colors.iconBlack}
										iconName={"account-multiple-outline"}
										iconSetName={"MaterialCommunityIcons"}
										iconSize={18}
									/>
									<Text style={[AccountStyle.iconText]}>{"Contacts"}</Text>
								</Pressable>
								<Pressable
									onPress={() => gotoSharePass()}
									style={({ pressed }) => [
										{ backgroundColor: pressed ? "#EFEFEF80" : "#EFEFEF" },
										AccountStyle.actionIconsView,
									]}
								>
									<Icons
										iconColor={Colors.iconBlack}
										iconName={"map-marker-outline"}
										iconSetName={"MaterialCommunityIcons"}
										iconSize={18}
									/>
									<Text style={[AccountStyle.iconText]}>{"Destinations"}</Text>
								</Pressable>
								<Pressable
									onPress={() => gotoShareDestination()}
									style={({ pressed }) => [
										{ backgroundColor: pressed ? "#EFEFEF80" : "#EFEFEF" },
										AccountStyle.actionIconsView,
									]}
								>
									<Icons
										iconColor={Colors.iconBlack}
										iconName={"view-grid-outline"}
										iconSetName={"MaterialCommunityIcons"}
										iconSize={18}
									/>
									<Text style={[AccountStyle.iconText]}>{"Pass"}</Text>
								</Pressable>
							</View>
						</View>
					</View>
				</Overlay>
			</View>
		</>
	);
};

export default SharedDetailsScreen;
