import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	TextInput,
	FlatList,
	Keyboard,
	TouchableWithoutFeedback,
} from "react-native";
import LexicalSectionList from "../../lib/react-native-contact-list/index";
import { Button, Icons, LightHeader, Loader } from "../../components";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";
import { listOfContactRequest } from "./redux/Action";
import { useDispatch, useSelector } from "react-redux";
import { showMessage } from "react-native-flash-message";
import { ConfirmDeletePopup } from "../../components/ConfirmDeletePopup";
import CommonStyles from "../../styles/CommonStyles";
import ListSkeleton from "../../components/LoaderComponents/ListSkeleton";
import { SelectAllButton } from "../../components/SelectAllButton";
import LayoutStyle from "../../styles/LayoutStyle";
import { hapticVibrate } from "../../config/CommonFunctions";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Api from "../../utils/Api";
import { ConfirmAddContactPopup } from "./Components/ConfirmAddContactPopup";
import { useIsFocused } from "@react-navigation/native";

const ContactListScreen = (props) => {
	const dispatch = useDispatch();
	const destinationId = props.route.params?.destination_id;
	const accountData = useSelector((state) => state.Account);
	const swipeableRefs = useRef({});
	const isFocused = useIsFocused();

	const [isListLoading, setIsListLoading] = useState(false);
	const [loading, setLoading] = useState(false);
	const [contactList, setContactList] = useState([]);
	const [selectedItems, setSelectedItems] = useState([]);
	const [selectedContacts, setSelectedContacts] = useState([]);
	const [multiSelectMode, setMultiSelectMode] = useState(false);
	const [showConfirmDelete, setShowConfirmDelete] = useState(false);
	const [isSearchBox, setIsSearchBox] = useState(false);
	const [searchText, setSearchText] = useState("");
	const searchInputRef = useRef(null);
	const [showAddConfirmPopup, setShowAddConfirmPopup] = useState(false);

	useEffect(() => {
		if (isFocused) {
			getTrustedContactList();
		}
	}, [isFocused]);

	useEffect(() => {
		setIsListLoading(true);
		setContactList(accountData?.contactList || []);
		setIsListLoading(false);
	}, [accountData?.contactList]);

	const getTrustedContactList = () => {
		dispatch(listOfContactRequest(props.navigation));
	};

	const filteredContactList = React.useMemo(() => {
		return contactList.filter((contact) =>
			contact.name.toLowerCase().includes(searchText.toLowerCase())
		);
	}, [contactList, searchText]);

	const gotoInviteScreen = (data) => {
		props.navigation.navigate("Invite", { data: data });
	};
	const gotoBack = () => {
		props.navigation.goBack();
	};

	const sectionsList = React.useMemo(() => {
		if (!filteredContactList) {
			return [];
		}
		const sectionsMap = filteredContactList.reduce((acc, contact) => {
			const { name } = contact;
			const firstLetter = name.charAt(0).toUpperCase();
			const contactInfo = {
				id: contact.id,
				name: contact.name,
				phoneNumber: contact.mobile,
				isEmergency:
					contact?.emergency_contacts_rel ||
					contact?.user?.emergency_contacts_rel
						? true
						: contact?.user_contacts
						? true
						: false,
			};
			return {
				...acc,
				[firstLetter]: [...(acc[firstLetter] || []), contactInfo],
			};
		}, {});

		return Object.entries(sectionsMap)
			.map(([title, data]) => ({
				title,
				data: data.sort((a, b) => a.name.localeCompare(b.name)),
			}))
			.sort((a, b) => a.title.localeCompare(b.title));
	}, [filteredContactList]);

	const handleSearch = (text) => {
		setSearchText(text);
		if (text === "") {
			setIsSearchBox(false);
			Keyboard.dismiss();
		}
	};
	const handlePressSearchBox = () => {
		setIsSearchBox(true);
		setTimeout(() => {
			if (searchInputRef.current) {
				searchInputRef.current.focus();
			}
		}, 0);
	};
	const handleBlur = () => {
		if (!searchText) {
			setIsSearchBox(false);
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
			setSelectedContacts(
				selectedContacts.filter((contact) => contact.id !== item.id)
			);
		} else {
			setSelectedItems([...selectedItems, item.id]);
			setSelectedContacts([...selectedContacts, item]);
			hapticVibrate();
		}
	};
	const toggleSelectAll = () => {
		if (selectedItems.length === contactList.length) {
			setSelectedItems([]);
			setSelectedContacts([]);
			setMultiSelectMode(false);
		} else {
			const allIds = contactList.map((item) => item.id);
			setSelectedItems(allIds);

			const allContacts = contactList.map((contact) => ({
				id: contact.id,
				name: contact.name,
				phoneNumber: contact.mobile,
				isEmergency:
					contact?.emergency_contacts_rel ||
					contact?.user?.emergency_contacts_rel
						? true
						: contact?.user_contacts
						? true
						: false,
			}));

			setSelectedContacts(allContacts);
			setMultiSelectMode(true);
			hapticVibrate();
		}
	};
	const handlePress = (item) => {
		toggleItemSelection(item);
	};
	const ListItem = ({ item, index }) => {
		return (
			<TouchableOpacity
				style={[
					AccountStyle.inviteContact,
					{
						backgroundColor: selectedItems?.includes(item.id)
							? Colors.highlightSelected
							: Colors.white,
					},
				]}
				onPress={() => gotoInviteScreen(item)}
				onLongPress={() => handleLongPress(item)}
			>
				<View style={{ flex: 1 }}>
					<Text
						numberOfLines={1}
						style={[AccountStyle.contactName, { width: "90%" }]}
					>
						{item.name}
					</Text>
					<Text style={[AccountStyle.phoneNumber]}>{item?.phoneNumber}</Text>
				</View>
				<TouchableOpacity style={{}} onPress={() => handlePress(item)}>
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
		);
	};
	const LeftSwipeActions = (item, index) => {
		return (
			<TouchableOpacity
				style={[
					AccountStyle.swipeDeleteBtn,
					{
						backgroundColor: "#4CA7DA",
						opacity: !destinationId && item?.isEmergency ? 0.5 : 1,
					},
				]}
				onPress={() =>
					!destinationId
						? addEmergencyContact(item)
						: onPressSwipeAddContact(item)
				}
				disabled={item?.isEmergency}
			>
				<Text style={[AccountStyle.swipeDltTxt, { textAlign: "center" }]}>
					{!destinationId ? "Save as\nEmergency" : "Add\nContact"}
				</Text>
			</TouchableOpacity>
		);
	};
	const rightSwipeActions = (item, index) => {
		return (
			<>
				{!destinationId && (
					<TouchableOpacity
						style={[AccountStyle.swipeDeleteBtn, { right: -20 }]}
						onPress={() => onPressRemoveContact(item)}
					>
						<Text style={AccountStyle.swipeDltTxt}>Remove</Text>
					</TouchableOpacity>
				)}
			</>
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
						renderLeftActions={() => LeftSwipeActions(item, index)}
						renderRightActions={() => rightSwipeActions(item, index)}
						friction={1}
						containerStyle={{ overflow: "hidden" }}
					>
						<ListItem item={item} index={index} />
					</Swipeable>
				)}
			</>
		);
	};
	const renderAZLetter = (item, index) => {
		return (
			<View style={[AccountStyle.AZContianer, { backgroundColor: "#F5F5F5" }]}>
				<Text style={[AccountStyle.letterHeader]}>{item}</Text>
			</View>
		);
	};
	const addEmergencyContact = async (contact) => {
		try {
			setLoading(true);
			const payload = {
				user_contact_id: contact?.id,
				action: "add",
			};
			const resEmergency = await Api.post(
				`user/add-emergency-contact`,
				payload
			);
			setLoading(false);

			if (resEmergency.success) {
				getTrustedContactList();
				showMessage({
					message: resEmergency.message,
					type: "success",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					duration: 3000,
					autoHide: true,
				});
			} else {
				showMessage({
					message: resEmergency?.message
						? resEmergency?.message
						: resEmergency?.data?.message,
					type: "danger",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					duration: 3000,
					autoHide: true,
				});
			}
		} catch (error) {
			setLoading(false);
			console.warn(error);
		}
	};
	const onPressRemoveContact = (contact) => {
		setSelectedItems([contact?.id]);
		setShowConfirmDelete(true);
	};
	const onPressSwipeAddContact = (contact) => {
		setSelectedItems([contact.id]);
		setShowAddConfirmPopup(true);
	};
	const onPressConfirm = async () => {
		try {
			setLoading(true);
			const data = {
				destination_id: destinationId,
				contact_id: selectedItems,
			};
			const response = await Api.post(`user/add-destination-contact`, data);
			setLoading(false);
			if (response.success) {
				showMessage({
					message: response.message,
					type: "success",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
				gotoBack();
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
			console.warn("Error: ", error);
		}
	};
	const closeAllSwipeables = () => {
		Object.values(swipeableRefs.current).forEach((ref) => {
			ref?.close?.();
		});
	};

	return (
		<View style={{ flex: 1 }}>
			<Loader show={loading} />
			<ConfirmDeletePopup
				show={showConfirmDelete}
				onHide={() => {
					setShowConfirmDelete(false);
					setSelectedItems([]);
					setSelectedContacts([]);
					setMultiSelectMode(false);
					closeAllSwipeables();
				}}
				title={`${selectedItems.length} Trusted Contact`}
				setSelectedItems={setSelectedItems}
				setMultiSelectMode={setMultiSelectMode}
				api={`user/delete-multiple-trusted-contact`}
				data={selectedItems}
				isTrustedContact={true}
				trustedContactList={selectedContacts}
				setIsLoading={setLoading}
				onSuccess={(message) => {
					setLoading(false);
					setShowConfirmDelete(false);
					setSelectedItems([]);
					setSelectedContacts([]);
					setMultiSelectMode(false);
					showMessage({
						message: message,
						type: "success",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
					getTrustedContactList();
				}}
				onFailed={(message) => {
					setLoading(false);
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
			<ConfirmAddContactPopup
				show={showAddConfirmPopup}
				onHide={() => setShowAddConfirmPopup(false)}
				onConfirm={() => onPressConfirm()}
				onCancel={() => {
					setSelectedItems([]);
					setShowAddConfirmPopup(false);
				}}
			/>
			<>
				<LightHeader
					isLogo={false}
					isBackIcon={true}
					iconName={"angle-left"}
					iconSize={24}
					iconSetName={"FontAwesome6"}
					iconColor={Colors.backArrowBlack}
					headerText={"Trusted Contact"}
					headerBG={Colors.white}
					statusBG={Colors.white}
					onPress={() => gotoBack()}
				/>
				{!loading && (
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<View
							style={[
								AccountStyle.contactContainer,
								{ flex: 1, justifyContent: "space-between" },
							]}
						>
							{contactList.length !== 0 && (
								<View
									style={{
										...LayoutStyle.marginRight20,
										alignSelf: "flex-end",
									}}
								>
									<SelectAllButton
										toggleSelectAll={toggleSelectAll}
										selectedItems={selectedItems}
										mainList={contactList}
									/>
								</View>
							)}
							<View style={[AccountStyle.SearchContainer]}>
								{!isSearchBox ? (
									<TouchableOpacity
										style={AccountStyle.searchBox}
										onPress={handlePressSearchBox}
									>
										<Icons
											iconSetName={"MaterialIcons"}
											iconName={"search"}
											iconColor={Colors.labelDarkGray}
											iconSize={22}
										/>
										<Text style={AccountStyle.searchTxt}>{"Search"}</Text>
									</TouchableOpacity>
								) : (
									<TextInput
										ref={searchInputRef}
										maxLength={50}
										style={[
											AccountStyle.searchContactInput,
											{ height: 36, paddingHorizontal: 10 },
										]}
										placeholder="Search"
										placeholderTextColor={Colors.labelDarkGray}
										value={searchText}
										onChangeText={handleSearch}
										autoFocus={true}
										onBlur={handleBlur}
									/>
								)}
							</View>
							{isListLoading ? (
								<FlatList
									style={{ ...CommonStyles.emptyList }}
									data={Array(2).fill(0)}
									keyExtractor={(item, index) => `skeleton-${index}`}
									renderItem={({ item, index }) => <ListSkeleton />}
								/>
							) : (
								<View style={{ flex: 1 }}>
									<LexicalSectionList
										sections={sectionsList}
										itemHeight={55}
										alphabetListOptions={{ itemHeight: 18 }}
										renderItem={({ item, index }) =>
											renderContactList(item, index)
										}
										renderSectionHeader={({ section: { title }, index }) =>
											renderAZLetter(title, index)
										}
										style={{ flex: 1 }}
									/>
								</View>
							)}
							{selectedItems.length > 0 && !destinationId ? (
								<View style={AccountStyle.deleteContainer}>
									<Button
										onPress={() => setShowConfirmDelete(true)}
										btnName={`${
											selectedItems?.length > 1
												? `${selectedItems?.length} Delete Contacts`
												: `${selectedItems?.length} Delete Contact`
										}`}
										isBtnActive={true}
										btnColor={Colors.red}
										btnLabelColor={Colors.white}
									/>
								</View>
							) : selectedItems.length > 0 && destinationId ? (
								<View style={AccountStyle.deleteContainer}>
									<Button
										onPress={() => setShowAddConfirmPopup(true)}
										btnName={`${
											selectedItems?.length > 1
												? `${selectedItems?.length} Add Contacts`
												: `${selectedItems?.length} Add Contact`
										}`}
										isBtnActive={true}
										btnColor={Colors.secondary}
										btnLabelColor={Colors.white}
									/>
								</View>
							) : null}
						</View>
					</TouchableWithoutFeedback>
				)}
			</>
		</View>
	);
};

export default ContactListScreen;
