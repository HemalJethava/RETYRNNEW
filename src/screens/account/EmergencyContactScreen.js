import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import FastImage from "react-native-fast-image";
import { Button, Icons, Input, LightHeader, Loader } from "../../components";
import { PassesColors } from "../../json/PassesColors";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";
import CommonStyles from "../../styles/CommonStyles";
import Api from "../../utils/Api";
import { showMessage } from "react-native-flash-message";
import { ConfirmDeletePopup } from "../../components/ConfirmDeletePopup";
import ListSkeleton from "../../components/LoaderComponents/ListSkeleton";
import LayoutStyle from "../../styles/LayoutStyle";
import { SelectAllButton } from "../../components/SelectAllButton";
import { hapticVibrate } from "../../config/CommonFunctions";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { useIsFocused } from "@react-navigation/native";

const EmergencyContactScreen = (props) => {
	const dispatch = useDispatch();
	const screenName = props.route.params?.screenName || "contact";
	const swipeableRefs = useRef({});
	const isFocused = useIsFocused();

	const [isListLoading, setIsListLoading] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [contactList, setContactList] = useState([]);
	const [search, setSearch] = useState("");
	const [displayContact, setDisplayContact] = useState([]);
	const [selectedItems, setSelectedItems] = useState([]);
	const [multiSelectMode, setMultiSelectMode] = useState(false);
	const [showConfirmDelete, setShowConfirmDelete] = useState(false);

	useEffect(() => {
		if (isFocused) {
			getEmergencyContact();
		}
	}, [isFocused]);

	const getEmergencyContact = async () => {
		try {
			setIsListLoading(true);
			const contactRes = await Api.get(`user/get-emergency-contact`).then(
				(res) => {
					return res;
				}
			);
			if (contactRes.success) {
				setIsListLoading(false);
				const contactArray = contactRes.data.map((item) => ({
					id: item?.id,
					contactId: item?.contact_id
						? item?.contact_id
						: item?.user_contact_id,
					displayName: item?.contact_id
						? item?.emergency_contacts_rel[0]?.name
						: item?.user_contacts[0]?.name,
					givenName: item?.contact_id
						? item?.emergency_contacts_rel[0]?.name
						: item?.user_contacts[0]?.name,
					familyName: "",
					thumbnailPath: item?.contact_id
						? item?.emergency_contacts_rel[0]?.photo_path
						: item?.user_contacts[0]?.photo_path,
					phoneNumbers: [
						{
							number: item?.contact_id
								? item?.emergency_contacts_rel[0]?.mobile
								: item?.user_contacts[0]?.mobile,
						},
					],
				}));
				setContactList(contactArray);
			} else {
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

	useMemo(() => {
		if (!contactList) {
			return null;
		}
		let tempArry = [];

		contactList.forEach((contact) => {
			const {
				givenName,
				familyName,
				displayName,
				id,
				phoneNumbers,
				thumbnailPath,
				contactId,
			} = contact;
			let firstLetter = (givenName ?? "").charAt(0);
			let secondLetter = (familyName ?? "").charAt(0);

			const randomColor = Math.floor(Math.random() * 6);
			const colorName = PassesColors[randomColor]?.color ?? "#000000";

			const contactDetails = {
				id: id,
				contactId: contactId,
				name: displayName ?? "Unknown Name",
				phoneNumber: phoneNumbers?.[0]?.number ?? "No Phone Number",
				fLetter: firstLetter,
				lLetter: secondLetter,
				photo: thumbnailPath ?? "",
				isSelected: false,
				bgColor: colorName + "99",
			};

			tempArry.push(contactDetails);
		});

		setDisplayContact(tempArry);
	}, [contactList]);

	const formatContactNumb = () => {
		var contactDetails;
		var tempArry = [];

		contactList.forEach((contact, index) => {
			const { givenName } = contact;
			const { familyName } = contact;
			let [firstLetter] = givenName;
			let [secondLetter] = familyName;
			const randomColor = Math.floor(Math.random() * 6);
			const colorName = PassesColors[randomColor].color;
			contactDetails = {
				id: contact.id,
				name: contact.displayName,
				phoneNumber: contact.phoneNumbers[0].number,
				fLetter: firstLetter,
				lLetter: secondLetter || "",
				photo: contact.thumbnailPath || "",
				isSelected: false,
				bgColor: colorName + "99",
			};
			tempArry.push(contactDetails);
		}, {});
		setDisplayContact(tempArry);
	};
	const onChangeSearch = (text) => {
		setSearch(text);
		getSearchContact(text);
	};
	const getSearchContact = (stringName) => {
		const searchName = stringName;
		const serchContact = [...displayContact];
		if (searchName != "") {
			const searchNumb = serchContact.filter(
				(item) =>
					item.name.toUpperCase().includes(searchName) ||
					item.name.toLowerCase().includes(searchName) ||
					item.name.includes(searchName)
			);
			setDisplayContact(searchNumb);
		} else {
			formatContactNumb();
		}
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
		if (selectedItems.length === displayContact.length) {
			setSelectedItems([]);
			setMultiSelectMode(false);
		} else {
			const allIds = displayContact.map((item) => item.id);
			setSelectedItems(allIds);
			setMultiSelectMode(true);
			hapticVibrate();
		}
	};
	const handlePress = (item) => {
		toggleItemSelection(item);
	};
	const ListItem = ({ item, index }) => {
		return (
			<View key={index}>
				<TouchableOpacity
					style={[
						AccountStyle.contactList,
						{
							backgroundColor:
								item.isSelected || selectedItems.includes(item.id)
									? Colors.highlightSelected
									: Colors.white,
						},
					]}
					onPress={async () => handlePress(item)}
					onLongPress={() => handleLongPress(item)}
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
									AccountStyle.textImage,
									{ backgroundColor: item.bgColor },
								]}
							>
								<Text style={[AccountStyle.textColor]}>
									{item.fLetter + item.lLetter}
								</Text>
							</View>
						)}
						<View style={[AccountStyle.contactListContainer, { flex: 1 }]}>
							<Text numberOfLines={1} style={[AccountStyle.addContactName]}>
								{item.name}
							</Text>
							<Text style={[AccountStyle.phoneNumber]}>
								{item?.phoneNumber}
							</Text>
						</View>
					</View>
					<TouchableOpacity
						style={{ padding: 10 }}
						onPress={() => handlePress(item)}
					>
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
					</TouchableOpacity>
				</TouchableOpacity>
				<View style={[AccountStyle.borderBottomGrayLoop]}></View>
			</View>
		);
	};
	const renderContactList = (item, index) => {
		const key = item?.id || index;
		return (
			<>
				{multiSelectMode ? (
					<ListItem item={item} index={index} />
				) : (
					<Swipeable
						ref={(ref) => {
							if (ref) swipeableRefs.current[key] = ref;
						}}
						renderRightActions={() => rightSwipeActions(item)}
						friction={2}
						containerStyle={{
							overflow: "hidden",
						}}
					>
						<ListItem item={item} index={index} />
					</Swipeable>
				)}
			</>
		);
	};
	const rightSwipeActions = (item) => {
		return (
			<TouchableOpacity
				style={[AccountStyle.swipeDeleteBtn]}
				onPress={async () => {
					setSelectedItems([item.id]);
					setShowConfirmDelete(true);
					hapticVibrate();
				}}
			>
				<Text style={[AccountStyle.swipeDltTxt]}>Remove</Text>
			</TouchableOpacity>
		);
	};
	const gotoChatScreen = () => {
		props.navigation.navigate("Chats");
	};
	const closeAllSwipeables = () => {
		Object.values(swipeableRefs.current).forEach((ref) => {
			ref?.close?.();
		});
	};

	return (
		<>
			<Loader show={isLoading} />
			<ConfirmDeletePopup
				show={showConfirmDelete}
				onHide={() => {
					setShowConfirmDelete(false);
					setSelectedItems([]);
					setMultiSelectMode(false);
					closeAllSwipeables();
				}}
				title={`${selectedItems.length} Emergency Contact`}
				setSelectedItems={setSelectedItems}
				setMultiSelectMode={setMultiSelectMode}
				api={`user/delete-multiple-emergency-contact`}
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
					getEmergencyContact();
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
			{!isLoading && (
				<View
					style={[AccountStyle.mainContainer, AccountStyle.backgroundWhite]}
				>
					<LightHeader
						isLogo={false}
						isBackIcon={true}
						iconName={"angle-left"}
						iconSize={24}
						iconSetName={"FontAwesome6"}
						iconColor={Colors.backArrowBlack}
						headerText={"Emergency Contacts"}
						headerBG={Colors.lightGrayBG}
						statusBG={Colors.lightGrayBG}
						onPress={() => gotoBack()}
					/>
					{contactList?.length != 0 && (
						<View style={[AccountStyle.addContactContainer]}>
							<Input
								isDarkBG={false}
								value={search}
								placeholder={"Search"}
								maxLength={50}
								onChangeText={(text) => onChangeSearch(text)}
								iconName={"search"}
								iconSetName={"MaterialIcons"}
								keyboardType={"default"}
								returnKeyType={"search"}
								blurOnSubmit={true}
								isPressOut={true}
								// onSubmitEditing={() => getSearchContact("")}
							/>
						</View>
					)}
					{displayContact.length !== 0 && (
						<View style={{ ...LayoutStyle.marginRight20 }}>
							<SelectAllButton
								toggleSelectAll={toggleSelectAll}
								selectedItems={selectedItems}
								mainList={displayContact}
							/>
						</View>
					)}
					{isListLoading ? (
						<FlatList
							style={{ ...CommonStyles.emptyList }}
							data={Array(5).fill(0)}
							keyExtractor={(item, index) => `skeleton-${index}`}
							renderItem={({ item, index }) => <ListSkeleton />}
						/>
					) : (
						<FlatList
							data={displayContact}
							renderItem={({ item: contactItem, index }) =>
								renderContactList(contactItem, index)
							}
							ListEmptyComponent={
								<View
									style={[
										CommonStyles.emptyDataAlign,
										{ flex: 1, marginTop: "60%" },
									]}
								>
									<Text
										style={[CommonStyles.notFountText, { marginBottom: 20 }]}
									>
										{
											"Not found any emergency contacts into chat \n Please, add a emergency contact"
										}
									</Text>
									<Button
										btnColor={Colors.primary}
										btnName={"Add Emergency Contact"}
										btnLabelColor={Colors.white}
										isBtnActive={true}
										onPress={() => gotoChatScreen()}
									/>
								</View>
							}
							scrollEnabled={true}
							keyExtractor={(item) => item.id}
						/>
					)}
					{selectedItems.length > 0 && (
						<View style={[AccountStyle.deleteContainer]}>
							<Button
								onPress={() => setShowConfirmDelete(true)}
								btnName={`${
									selectedItems.length > 1
										? `${selectedItems.length} Delete Contacts`
										: `${selectedItems.length} Delete Contact`
								}`}
								isBtnActive={true}
								btnColor={Colors.red}
								btnLabelColor={Colors.white}
							/>
						</View>
					)}
				</View>
			)}
		</>
	);
};

export default EmergencyContactScreen;
