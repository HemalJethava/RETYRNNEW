// chat screen
import React, { useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	FlatList,
	Image,
	Linking,
	StatusBar,
	ScrollView,
} from "react-native";
import Colors from "../../styles/Colors";
import ChatStyle from "../../styles/ChatStyle";
import { Button, Icons, Input, LightHeader, Loader } from "../../components";
import IMAGES from "../../assets/images/Images";
import { useDispatch, useSelector } from "react-redux";
import { PassesColors } from "../../json/PassesColors";
import FastImage from "react-native-fast-image";
import LayoutStyle from "../../styles/LayoutStyle";
import {
	formatMessageTime,
	getCurrentChatUser,
	hapticVibrate,
	truncateText,
} from "../../config/CommonFunctions";
import Api from "../../utils/Api";
import { showMessage } from "react-native-flash-message";
import { InvitePopup } from "./components/InvitePopup";
import CommonStyles from "../../styles/CommonStyles";
import ListSkeleton from "../../components/LoaderComponents/ListSkeleton";
import AccountStyle from "../../styles/AccountStyle";
import { RemovePinContactPopup } from "./components/RemovePinContactPopup";
import { ProfilePopup } from "./components/ProfilePopup";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import {
	listOfContactRequest,
	companyEmployeeRequest,
	getPinnedContactList,
	getAdminDetail,
} from "./redux/Action";

const ChatScreen = (props) => {
	const dispatch = useDispatch();
	const sharedFile = props.route.params?.sharedFile;

	const userData = useSelector((state) => state.Auth.userData);

	const trustedContact = useSelector((state) => state.Chat?.contactList);
	const companyEmployeeList = useSelector(
		(state) => state.Chat?.companyEmployeeList
	);
	const pinnedContacts = useSelector((state) => state.Chat?.pinnedContactList);
	const {
		isLoading,
		isEmployeeLoading,
		isPinnedLoading,
		adminDetail,
		chatUpdateEvent,
		chatUserStatus,
		chatUserMarkReadStatus,
	} = useSelector((state) => state.Chat);

	const employeeProfileRefs = useRef({});

	const [isShowTrustedList, setIsShowTrustedList] = useState(true);

	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(false);
	const [pinnedContactList, setPinnedContactList] = useState([]);
	const [trustedContactList, setTrustedContactList] = useState([]);
	const [companyContactList, setCompanyContactList] = useState([]);

	const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);

	const [isAddPin, setIsAddPin] = useState(false);

	const [showInvitePopup, setShowInvitePopup] = useState(false);
	const [selectedItem, setSelectedItem] = useState(null);
	const [selectedItems, setSelectedItems] = useState([]);
	const [multiSelectMode, setMultiSelectMode] = useState(false);

	const [selectedRemoveItems, setSelectedRemoveItems] = useState([]);
	const [multiSelectRemoveMode, setMultiSelectRemoveMode] = useState(false);
	const [showConfirmDelete, setShowConfirmDelete] = useState(false);

	const [selectedProfile, setSelectedProfile] = useState(null);
	const [profileModalVisible, setProfileModalVisible] = useState(false);
	const [profileModalPosition, setProfileModalPosition] = useState({
		x: 0,
		y: 0,
	});
	const [activeProfileType, setActiveProfileType] = useState(null);

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		if (trustedContact.length) {
			setTrustedContactList(trustedContact);
		} else {
			setTrustedContactList([]);
		}
	}, [trustedContact]);

	useEffect(() => {
		if (companyEmployeeList.length) {
			setCompanyContactList(companyEmployeeList);
		} else {
			setCompanyContactList([]);
		}
	}, [companyEmployeeList]);

	useEffect(() => {
		if (pinnedContacts.length) {
			const filtered = pinnedContacts.map((i) => i?.pinned_user);
			setPinnedContactList(filtered);
		} else {
			setPinnedContactList([]);
		}
	}, [pinnedContacts]);

	useEffect(() => {
		const updateListEvent = async () => {
			if (chatUpdateEvent) {
				const currentChatUserId = await getCurrentChatUser();

				setCompanyContactList((prev) =>
					updateList(
						prev,
						chatUpdateEvent,
						"employee",
						false,
						currentChatUserId
					)
				);

				setTrustedContactList((prev) =>
					updateList(prev, chatUpdateEvent, "employee", true, currentChatUserId)
				);

				setPinnedContactList((prev) =>
					updateList(
						prev,
						chatUpdateEvent,
						"employee",
						false,
						currentChatUserId
					)
				);
			}
		};
		updateListEvent();
	}, [chatUpdateEvent]);

	useEffect(() => {
		if (chatUserStatus) {
			setCompanyContactList((prev) => updateStatus(prev, chatUserStatus));

			setTrustedContactList((prev) => updateStatus(prev, chatUserStatus));

			setPinnedContactList((prev) => updateStatus(prev, chatUserStatus));
		}
	}, [chatUserStatus]);

	useEffect(() => {
		if (chatUserMarkReadStatus) {
			setCompanyContactList((prev) =>
				updateMarkRead(prev, chatUserMarkReadStatus)
			);

			setTrustedContactList((prev) =>
				updateMarkRead(prev, chatUserMarkReadStatus)
			);

			setPinnedContactList((prev) =>
				updateMarkRead(prev, chatUserMarkReadStatus)
			);
		}
	}, [chatUserMarkReadStatus]);

	const updateList = (
		list,
		event,
		key,
		isTrusted = false,
		currentChatUserId
	) => {
		if (!list?.length) return list;

		const isSelf = userData?.id === event?.employee?.id;
		const senderId = isSelf
			? event?.employee?.last_message?.receiver_id
			: event?.employee?.id;

		const senderIndex = list.findIndex((i) =>
			isTrusted
				? i.app_user_id?.toString() === senderId?.toString()
				: i.id?.toString() === senderId?.toString()
		);
		if (senderIndex === -1) return list;

		const sender = list[senderIndex];

		const prevCount =
			(sender.user?.chat_receive_history_count ??
				sender.chat_receive_history_count) ||
			0;

		const shouldResetCount =
			isSelf || currentChatUserId?.toString() === senderId?.toString();

		const newCount = shouldResetCount ? 0 : prevCount + 1;

		const updatedSender = {
			...sender,
			last_message: {
				created_at: new Date(
					event?.employee?.last_message?.created_at || Date.now()
				).toISOString(),
				message_text: event?.employee?.last_message?.message_text,
				message_type: event?.employee?.last_message?.message_type,
				...(isSelf && {
					is_read: event?.employee?.last_message?.is_read,
					sender_id: userData?.id,
				}),
			},
			chat_receive_history_count: sender?.user ? undefined : newCount,
			user: sender?.user
				? {
						...sender.user,
						chat_receive_history_count: newCount,
				  }
				: sender.user,
		};

		return [updatedSender, ...list.filter((_, idx) => idx !== senderIndex)];
	};
	const updateStatus = (list, event) => {
		if (!list?.length) return list;

		const senderIndex = list.findIndex(
			(i) =>
				i?.app_user_id?.toString() || i.id.toString() === event?.id?.toString()
		);
		if (senderIndex === -1) return list;

		const sender = list[senderIndex];
		let updatedSender = "";
		if (!sender?.user) {
			updatedSender = { ...sender, user_status: event?.user_status };
		} else {
			updatedSender = {
				...sender,
				user: {
					...sender.user,
					user_status: event?.user_status,
				},
			};
		}

		return [updatedSender, ...list.filter((_, idx) => idx !== senderIndex)];
	};
	const updateMarkRead = (list, event) => {
		if (!list?.length) return list;

		const receiverId = event?.mark_read?.receiver_id?.toString();
		if (!receiverId) return list;

		const senderIndex = list.findIndex(
			(i) =>
				i?.app_user_id?.toString() === receiverId ||
				i?.id?.toString() === receiverId ||
				i?.user?.id?.toString() === receiverId
		);

		if (senderIndex === -1) return list;

		const sender = list[senderIndex];

		const updatedSender = {
			...sender,
			last_message: {
				...sender.last_message,
				is_read: 1,
			},
		};

		if (sender.user) {
			updatedSender.user = { ...sender.user };
		}

		return [updatedSender, ...list.filter((_, idx) => idx !== senderIndex)];
	};
	const fetchData = () => {
		dispatch(listOfContactRequest());
		dispatch(companyEmployeeRequest(userData?.company_id));
		dispatch(getPinnedContactList());
		dispatch(getAdminDetail());
	};
	const handlePressEmpProfile = (item, index) => {
		const employeeProfileRef = employeeProfileRefs.current[index];

		if (!employeeProfileRef) return;

		requestAnimationFrame(() => {
			employeeProfileRef.measure((fx, fy, width, height, px, py) => {
				if (!width || isNaN(px) || isNaN(py)) {
					return;
				}

				setProfileModalPosition({ x: px + width / 2, y: py });
				setSelectedProfile(item);
				setActiveProfileType("employee");
				setProfileModalVisible(true);
			});
		});
	};
	const onChangeSearch = (text) => {
		setSearch(text);
		getSearchContact(text);
	};
	const getSearchContact = (searchName) => {
		if (isShowTrustedList) {
			if (searchName) {
				const filteredContacts = trustedContact.filter((item) =>
					item.name.toLowerCase().includes(searchName.toLowerCase())
				);
				setTrustedContactList(filteredContacts);
			} else {
				setTrustedContactList(trustedContact);
			}
		} else {
			if (searchName) {
				const filteredEmployee = companyEmployeeList.filter((item) =>
					item.name.toLowerCase().includes(searchName.toLowerCase())
				);
				setCompanyContactList(filteredEmployee);
			} else {
				setCompanyContactList(companyEmployeeList);
			}
		}
	};
	const addPinContact = () => {
		setIsAddPin(true);
	};
	const cancelPinContact = () => {
		setIsAddPin(false);
		setSelectedItems([]);
		setMultiSelectMode(false);
	};
	const handleLongPressContact = (item, isCompanyContact) => {
		setMultiSelectMode(true);
		setIsAddPin(true);
		toggleItemSelection(item, isCompanyContact);
	};
	const toggleItemSelection = (item, isCompanyContact) => {
		if (!isCompanyContact && !item.app_user_id) {
			return;
		}
		const itemId = isCompanyContact ? item.id : item.app_user_id;
		if (selectedItems.includes(itemId)) {
			if (selectedItems.length === 1) {
				cancelPinContact();
			}
			setSelectedItems(selectedItems.filter((id) => id !== itemId));
		} else {
			setSelectedItems([...selectedItems, itemId]);
			hapticVibrate();
		}
	};
	const toggleItemRemoveSelection = (item) => {
		if (selectedRemoveItems.includes(item?.id)) {
			if (selectedRemoveItems.length == 1) {
				setMultiSelectRemoveMode(false);
			}
			setSelectedRemoveItems(
				selectedRemoveItems.filter((id) => id !== item?.id)
			);
		} else {
			setSelectedRemoveItems([...selectedRemoveItems, item?.id]);
			hapticVibrate();
		}
	};
	const handlePress = (item) => {
		toggleItemRemoveSelection(item);
	};
	const handleLongPress = (item) => {
		setMultiSelectRemoveMode(true);
		toggleItemRemoveSelection(item);
	};
	const gotoBack = () => {
		props.navigation.goBack();
	};
	const gotoTrustedContact = () => {
		props.navigation.navigate("AddContact");

		// props.navigation.navigate("AddContact", {
		// 	screen: "AddContact",
		// 	params: { screenName: "chats" },
		// });
	};
	const updateUnreadCount = (list, chatId) => {
		if (!list?.length) return list;

		return list.map((item) => {
			const matchById =
				item.id?.toString() === chatId?.toString() ||
				item.app_user_id?.toString() === chatId?.toString();

			if (!matchById) return item;

			if (item.user) {
				return {
					...item,
					user: {
						...item.user,
						chat_receive_history_count: 0,
					},
				};
			} else {
				return {
					...item,
					chat_receive_history_count: 0,
				};
			}
		});
	};
	const gotoChatScreeen = (item, info) => {
		const chatId = item?.app_user_id || item?.id;

		const isValidSharedFile =
			(sharedFile &&
				typeof sharedFile === "object" &&
				!Array.isArray(sharedFile) &&
				Object.keys(sharedFile).length > 0) ||
			(Array.isArray(sharedFile) && sharedFile.length > 0);

		const userDetail = {
			item,
			chatID: chatId,
			...(info && { info }),
			...(isValidSharedFile && { sharedFile }),
		};

		props.navigation.navigate("Message", userDetail);

		setCompanyContactList((prev) => updateUnreadCount(prev, chatId));
		setTrustedContactList((prev) => updateUnreadCount(prev, chatId));
		setPinnedContactList((prev) => updateUnreadCount(prev, chatId));

		props.navigation.setParams({ sharedFile: null });
	};
	const onPressInvite = (item) => {
		setSelectedItem(item);
		setShowInvitePopup(true);
	};
	const renderTrustContact = (item, index) => {
		var string = item.name;
		const randomColor = Math.floor(Math.random() * 6);
		const colorName = PassesColors[randomColor].color;

		const lastMessage = item?.last_message;

		const messageType = lastMessage ? lastMessage.message_type : "";

		let message = "";

		if (messageType === "text") {
			message = lastMessage?.message_text;
		} else if (messageType === "pass") {
			message = "Sent a pass";
		} else if (messageType === "location") {
			message = "Sent a location";
		} else if (messageType === "image") {
			message = "Sent a image";
		} else if (messageType === "file") {
			message = "Sent a file";
		}

		let statusColor = "";
		if (item?.user?.user_status === "online") {
			statusColor = Colors.online;
		} else if (item?.user?.user_status === "away") {
			statusColor = Colors.away;
		} else {
			statusColor = Colors.offline;
		}

		const onPressUser = async () => {
			if (isAddPin && item.app_user_id) {
				toggleItemSelection(item, false);
			} else if (item.app_user_id) {
				gotoChatScreeen(item);
			} else {
				onPressInvite(item);
			}
		};

		return (
			<TouchableOpacity
				key={index}
				style={{ justifyContent: "center" }}
				disabled={isAddPin && !item.app_user_id}
				onPress={() => onPressUser()}
				onLongPress={() => handleLongPressContact(item, false)}
			>
				{!item.app_user_id && (
					<TouchableOpacity
						style={[ChatStyle.actionMoreBtn]}
						onPress={() => onPressInvite(item)}
					>
						<View style={[CommonStyles.directionRowCenter]}>
							<Icons
								iconSetName={"MaterialIcons"}
								iconName={"add"}
								iconColor={Colors.linkBtn}
								iconSize={20}
							/>
							<Text style={[ChatStyle.actionMoreTxt]}>{"Actions"}</Text>
						</View>
					</TouchableOpacity>
				)}
				<View
					style={[
						ChatStyle.trustedContainer,
						{
							backgroundColor: selectedItems.includes(item.app_user_id)
								? "rgba(76,167,218,0.2)"
								: "#fff",
							opacity: !item.app_user_id ? 0.4 : 1,
						},
					]}
				>
					<View
						style={[ChatStyle.listContainer, { justifyContent: "flex-start" }]}
					>
						<View style={[ChatStyle.svgTextContain, { flex: 1 }]}>
							<TouchableOpacity
								ref={(el) => (employeeProfileRefs.current[index] = el)}
								disabled={!item.app_user_id}
								onPress={() => handlePressEmpProfile(item, index)}
							>
								{item?.user?.chat_receive_history_count > 0 && (
									<View style={ChatStyle.badgeCount}>
										<Text style={ChatStyle.countText}>
											{item?.user?.chat_receive_history_count}
										</Text>
									</View>
								)}
								{item.app_user_id && (
									<View
										style={[
											ChatStyle.statusCircle,
											{ backgroundColor: statusColor },
										]}
									/>
								)}
								{item.photo ? (
									<FastImage
										style={[ChatStyle.contactImg]}
										source={{
											uri: item.photo,
										}}
										resizeMode={FastImage.resizeMode.cover}
									/>
								) : (
									<View
										style={[
											ChatStyle.contactImg,
											{
												backgroundColor: colorName,
												justifyContent: "center",
												alignItems: "center",
											},
										]}
									>
										<Text style={[ChatStyle.textColor]}>
											{string.charAt(0).toUpperCase()}
										</Text>
									</View>
								)}
							</TouchableOpacity>
							<View style={[ChatStyle.contactContainer]}>
								<Text style={[ChatStyle.contactName]}>
									{item.name.charAt(0).toUpperCase() +
										truncateText(item.name.slice(1), 20)}
								</Text>
								{message && (
									<View style={{ ...CommonStyles.directionRowCenter }}>
										{userData?.id === lastMessage?.sender_id && (
											<Icons
												iconSetName={"MaterialDesignIcons"}
												iconName={
													lastMessage?.is_read !== 1 ? "check" : "check-all"
												}
												iconColor={
													lastMessage?.is_read !== 1
														? Colors.labelDarkGray
														: Colors.secondary
												}
												iconSize={14}
											/>
										)}
										<Text style={[ChatStyle.youTxt]}>
											{userData?.id === lastMessage?.sender_id ? `You: ` : ""}
											<Text style={[ChatStyle.trunculateTxt]}>
												{truncateText(message, 30)}
											</Text>
										</Text>
									</View>
								)}
							</View>
						</View>
						<View>
							{isAddPin && item.app_user_id ? (
								<TouchableOpacity
									onPress={async () => toggleItemSelection(item, false)}
									style={{ alignItems: "flex-end" }}
								>
									<>
										{selectedItems.includes(item.app_user_id) ? (
											<View style={[ChatStyle.selectedPin]} />
										) : (
											<View style={[ChatStyle.selectPin]} />
										)}
									</>
								</TouchableOpacity>
							) : item.app_user_id ? (
								<Text style={ChatStyle.lastMsgCreated}>
									{formatMessageTime(lastMessage?.created_at)}
								</Text>
							) : null}
						</View>
					</View>
				</View>
			</TouchableOpacity>
		);
	};
	const renderCompanyContact = (item, index) => {
		var string = item.name;
		const randomColor = Math.floor(Math.random() * 6);
		const colorName = PassesColors[randomColor].color;
		const lastMessage = item?.last_message;

		const messageType = lastMessage ? lastMessage?.message_type : "";

		let message = "";

		if (messageType === "text") {
			message = lastMessage?.message_text;
		} else if (messageType === "pass") {
			message = "Sent a pass";
		} else if (messageType === "location") {
			message = "Sent a location";
		} else if (messageType === "image") {
			message = "Sent a image";
		} else if (messageType === "file") {
			message = "Sent a file";
		}

		let statusColor = "";
		if (item?.user_status === "online") {
			statusColor = Colors.online;
		} else if (item?.user_status === "away") {
			statusColor = Colors.away;
		} else {
			statusColor = Colors.offline;
		}

		return (
			<TouchableOpacity
				key={index}
				style={{ justifyContent: "center" }}
				onPress={() =>
					isAddPin ? toggleItemSelection(item, true) : gotoChatScreeen(item)
				}
				onLongPress={() => handleLongPressContact(item, true)}
				disabled={item.id ? false : true}
			>
				<View
					style={[
						ChatStyle.trustedContainer,
						{
							backgroundColor: selectedItems.includes(item.id)
								? "rgba(76,167,218,0.2)"
								: "#fff",
						},
					]}
				>
					<View style={[ChatStyle.listContainer]}>
						<View style={[ChatStyle.svgTextContain]}>
							<TouchableOpacity
								ref={(el) => (employeeProfileRefs.current[index] = el)}
								onPress={() => handlePressEmpProfile(item, index)}
							>
								{item?.chat_receive_history_count > 0 && (
									<View style={ChatStyle.badgeCount}>
										<Text style={ChatStyle.countText}>
											{item?.chat_receive_history_count}
										</Text>
									</View>
								)}
								<View
									style={[
										ChatStyle.statusCircle,
										{ backgroundColor: statusColor },
									]}
								/>
								{item.photo_path ? (
									<FastImage
										style={[ChatStyle.contactImg]}
										source={{
											uri: item.photo_path,
										}}
										resizeMode={FastImage.resizeMode.cover}
									/>
								) : (
									<View
										style={[
											ChatStyle.contactImg,
											{
												backgroundColor: colorName,
												justifyContent: "center",
												alignItems: "center",
											},
										]}
									>
										<Text style={[ChatStyle.textColor]}>
											{string.charAt(0).toUpperCase()}
										</Text>
									</View>
								)}
							</TouchableOpacity>
							<View style={[ChatStyle.contactContainer]}>
								<Text style={[ChatStyle.contactName]}>
									{item.name.charAt(0).toUpperCase() +
										truncateText(item.name.slice(1), 20)}
								</Text>
								{message && (
									<View style={{ ...CommonStyles.directionRowCenter }}>
										{userData?.id === lastMessage?.sender_id && (
											<Icons
												iconSetName={"MaterialDesignIcons"}
												iconName={
													lastMessage?.is_read !== 1 ? "check" : "check-all"
												}
												iconColor={
													lastMessage?.is_read !== 1
														? Colors.labelDarkGray
														: Colors.secondary
												}
												iconSize={14}
											/>
										)}
										<Text numberOfLines={1} style={[ChatStyle.youCompanyTxt]}>
											{userData?.id === lastMessage?.sender_id ? `You: ` : ""}
											<Text style={[ChatStyle.trunculateTxt]}>
												{truncateText(message, 40)}
											</Text>
										</Text>
									</View>
								)}
							</View>
						</View>
						{isAddPin ? (
							<TouchableOpacity
								onPress={async () => toggleItemSelection(item, true)}
								disabled={!isAddPin}
							>
								<>
									{selectedItems.includes(item.id) ? (
										<View style={[ChatStyle.selectedPin]} />
									) : (
										<View style={[ChatStyle.selectPin]} />
									)}
								</>
							</TouchableOpacity>
						) : lastMessage ? (
							<Text>{formatMessageTime(lastMessage?.created_at)}</Text>
						) : null}
					</View>
				</View>
			</TouchableOpacity>
		);
	};
	const TrustedContactsRoute = () => (
		<View style={ChatStyle.scene}>
			{isLoading ? (
				<FlatList
					style={{ ...CommonStyles.emptyList }}
					data={Array(5).fill(0)}
					keyExtractor={(item, index) => `skeleton-${index}`}
					renderItem={({ item, index }) => <ListSkeleton />}
				/>
			) : (
				<FlatList
					style={{ marginTop: 10, paddingBottom: 40 }}
					showsHorizontalScrollIndicator={false}
					data={trustedContactList?.length !== 0 ? trustedContactList : []}
					renderItem={({ item, index }) => renderTrustContact(item, index)}
					keyExtractor={(item, index) => index.toString()}
					ListEmptyComponent={() => (
						<RenderEmptyList type={"trusted contact"} />
					)}
				/>
			)}
			{selectedItems.length > 0 && (
				<View style={AccountStyle.deleteContainer}>
					<Button
						onPress={() => onPressAddContact()}
						btnName={`${
							selectedItems.length > 1
								? `${selectedItems.length} Add Pin Contacts`
								: `${selectedItems.length} Add Pin Contact`
						}`}
						isBtnActive={true}
						btnColor={Colors.secondary}
						btnLabelColor={Colors.white}
					/>
				</View>
			)}
		</View>
	);
	const RenderEmptyList = ({ type }) => {
		return (
			<View style={[CommonStyles.emptyListContainer]}>
				<Image
					style={CommonStyles.emptyImg}
					source={IMAGES.NoChatList}
					resizeMode={"contain"}
				/>

				<Text style={CommonStyles.emptyTitle}>{`No ${
					type === "company" ? "Company employee" : "Trusted contact"
				} Found!`}</Text>
				<Text style={CommonStyles.emptyDescription}>
					{type === "company"
						? "No company employee found, Please try agin later."
						: "No trusted contact found, please add trusted contact."}
				</Text>
				{type !== "company" && (
					<Button
						btnColor={Colors.primary}
						btnName={"Add Trusted Contact"}
						btnLabelColor={Colors.white}
						isBtnActive={true}
						onPress={() => gotoTrustedContact()}
					/>
				)}
			</View>
		);
	};
	const CompanyEmployeeRoute = () => (
		<View style={ChatStyle.scene}>
			{isEmployeeLoading ? (
				<FlatList
					style={{ ...CommonStyles.emptyList }}
					data={Array(5).fill(0)}
					keyExtractor={(item, index) => `skeleton-${index}`}
					renderItem={({ item, index }) => <ListSkeleton />}
				/>
			) : (
				<FlatList
					style={{ marginTop: 10, paddingBottom: 40 }}
					showsHorizontalScrollIndicator={false}
					data={companyContactList?.length !== 0 ? companyContactList : []}
					renderItem={({ item, index }) => renderCompanyContact(item, index)}
					keyExtractor={(item, index) => index.toString()}
					ListEmptyComponent={() => <RenderEmptyList type={"company"} />}
				/>
			)}
			{selectedItems.length > 0 && (
				<View style={AccountStyle.deleteContainer}>
					<Button
						onPress={() => onPressAddContact()}
						btnName={`${
							selectedItems.length > 1
								? `${selectedItems.length} Add Pin Contacts`
								: `${selectedItems.length} Add Pin Contact`
						}`}
						isBtnActive={true}
						btnColor={Colors.secondary}
						btnLabelColor={Colors.white}
					/>
				</View>
			)}
		</View>
	);
	const onPressAddContact = async () => {
		if (selectedItems.length > 0) {
			try {
				setLoading(true);
				const data = {
					id: selectedItems,
				};

				const response = await Api.post(`user/add-pinned-contact`, data).then(
					(res) => {
						return res;
					}
				);
				setLoading(false);
				if (response.success) {
					fetchData();
					setIsAddPin(false);
					setSelectedItems([]);
					setMultiSelectMode(false);

					const messageString = response.message;
					showMessage({
						message: messageString,
						type: "success",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				} else {
					const messageString = response.message
						? response.message
						: "An Error Occurred";
					showMessage({
						message: messageString,
						type: "success",
						floating: true,
						statusBarHeight: 40,
						icon: "auto",
						autoHide: true,
					});
				}
			} catch (e) {
				setLoading(false);
				console.warn("Error: ", e);
			}
		}
	};
	const hideProfileModal = () => {
		setProfileModalVisible(false);
		setSelectedProfile(null);
		setActiveProfileType(null);
	};
	const CircleLoader = () => (
		<View style={{ paddingHorizontal: 5 }}>
			<SkeletonPlaceholder speed={800} backgroundColor={Colors.labelDarkGray}>
				<SkeletonPlaceholder.Item width={50} height={50} borderRadius={25} />
			</SkeletonPlaceholder>
		</View>
	);
	const RenderPinnedContact = ({ item, index }) => {
		const randomColor = Math.floor(Math.random() * 6);
		const colorName = PassesColors[randomColor].color;

		let statusColor = "";
		if (item?.user_status === "online") {
			statusColor = Colors.online;
		} else if (item?.user_status === "away") {
			statusColor = Colors.away;
		} else {
			statusColor = Colors.offline;
		}

		return (
			<TouchableOpacity
				style={[ChatStyle.pinImgContainer]}
				onPress={() =>
					multiSelectRemoveMode ? handlePress(item) : gotoChatScreeen(item)
				}
				onLongPress={() => (!isAddPin ? handleLongPress(item) : {})}
			>
				{multiSelectRemoveMode && selectedRemoveItems?.includes(item.id) ? (
					<View style={[ChatStyle.removePinnedPosition]}>
						<Icons
							iconSetName={"MaterialIcons"}
							iconName={"remove-circle"}
							iconColor={Colors.red}
							iconSize={16}
						/>
					</View>
				) : item?.chat_receive_history_count > 0 ? (
					<View style={ChatStyle.pinnedBadgeCount}>
						<Text style={ChatStyle.countText}>
							{item?.chat_receive_history_count}
						</Text>
					</View>
				) : null}
				{item?.photo_path ? (
					<View>
						<FastImage
							style={[ChatStyle.pinContactImg]}
							source={{
								uri: item?.photo_path,
							}}
							resizeMode={FastImage.resizeMode.cover}
						/>
						<View
							style={[ChatStyle.statusCircle, { backgroundColor: statusColor }]}
						/>
					</View>
				) : (
					<View
						style={[
							ChatStyle.pinContactImg,
							{
								backgroundColor: colorName,
								justifyContent: "center",
								alignItems: "center",
							},
						]}
					>
						<Text style={[ChatStyle.textColor]}>
							{item?.name.charAt(0).toUpperCase()}
						</Text>
						<View
							style={[ChatStyle.statusCircle, { backgroundColor: statusColor }]}
						/>
					</View>
				)}
				<Text style={[ChatStyle.pinContactName]}>
					{truncateText(item?.name, 15)}
				</Text>
			</TouchableOpacity>
		);
	};

	return (
		<View style={{ flex: 1, backgroundColor: Colors.white }}>
			<StatusBar translucent backgroundColor="transparent" />
			<Loader show={loading} />
			{profileModalVisible && (
				<ProfilePopup
					show={profileModalVisible}
					onHide={hideProfileModal}
					position={profileModalPosition}
					data={selectedProfile}
					type={activeProfileType}
					onPressMsg={(item) => {
						hideProfileModal();
						gotoChatScreeen(item);
					}}
					onPressCall={(item) => {
						hideProfileModal();
						Linking.openURL(`tel:${item?.mobile}`);
					}}
					onPressInfo={(item) => {
						hideProfileModal();
						gotoChatScreeen(item, "info");
					}}
				/>
			)}
			{showConfirmDelete && (
				<RemovePinContactPopup
					show={showConfirmDelete}
					onHide={() => setShowConfirmDelete(false)}
					title={`${selectedRemoveItems.length} Remove Pin Contact`}
					api={`user/remove-pinned-contact`}
					data={selectedRemoveItems}
					setIsLoading={setLoading}
					onSuccess={(message) => {
						setLoading(false);
						setShowConfirmDelete(false);
						setSelectedRemoveItems([]);
						setMultiSelectRemoveMode(false);
						fetchData();

						showMessage({
							message: message,
							type: "success",
							floating: true,
							statusBarHeight: 40,
							icon: "auto",
							autoHide: true,
						});
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
			)}
			{showInvitePopup && (
				<InvitePopup
					show={showInvitePopup}
					onHide={() => setShowInvitePopup(false)}
					data={selectedItem}
					setLoading={setLoading}
					onSuccess={(message) => {
						setLoading(false);
						setShowInvitePopup(false);
						setSelectedItem(null);
						dispatch(listOfContactRequest(props.navigation));
						showMessage({
							message: message,
							type: "success",
							floating: true,
							statusBarHeight: 40,
							icon: "auto",
							duration: 3000,
							autoHide: true,
						});
					}}
					onFailed={(message) => {
						setLoading(false);
						showMessage({
							message: message,
							type: "danger",
							floating: true,
							statusBarHeight: 40,
							icon: "auto",
							duration: 3000,
							autoHide: true,
						});
					}}
				/>
			)}
			<LightHeader
				iconName={"angle-left"}
				iconSetName={"FontAwesome6"}
				iconColor={Colors.iconBlack}
				iconSize={24}
				headerText={"Conversations"}
				DarkHeaderMainStyle={[LayoutStyle.paddingTop30]}
				isBackIcon={true}
				onPress={() => gotoBack()}
			/>
			{!loading && (
				<>
					<View
						style={[
							ChatStyle.fullHeaderContainer,
							ChatStyle.backgroundLightGray,
						]}
					>
						<View style={[ChatStyle.container]}>
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
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={{
									paddingHorizontal: 10,
									...LayoutStyle.marginTop10,
								}}
							>
								{!isAddPin ? (
									<TouchableOpacity
										style={{
											opacity: multiSelectRemoveMode
												? 0.5
												: trustedContactList?.length == 0 &&
												  companyContactList?.length == 0
												? 0.5
												: 1,
										}}
										disabled={
											selectedRemoveItems?.length > 0
												? true
												: trustedContactList.length == 0 &&
												  companyContactList.length == 0
												? true
												: false
										}
										onPress={() => addPinContact()}
									>
										<View style={[ChatStyle.pinDisplay]}>
											<Icons
												iconName={"plus"}
												iconSetName={"MaterialCommunityIcons"}
												iconColor={Colors.secondary}
												iconSize={35}
											/>
										</View>
										<Text style={[ChatStyle.addPinText]}>{"Add Pin"}</Text>
									</TouchableOpacity>
								) : (
									<TouchableOpacity onPress={() => cancelPinContact()}>
										<View style={[ChatStyle.pinDisplay]}>
											<Icons
												iconName={"remove-circle-outline"}
												iconSetName={"MaterialIcons"}
												iconColor={Colors.secondary}
												iconSize={25}
											/>
										</View>
										<Text style={[ChatStyle.addPinText]}>{"Cancel Pin"}</Text>
									</TouchableOpacity>
								)}
								{isLoadingAdmin ? (
									<CircleLoader />
								) : (
									<TouchableOpacity
										onPress={() => gotoChatScreeen(adminDetail)}
									>
										<View style={[ChatStyle.retyrnPinContainer]}>
											<Image
												source={IMAGES.appWhiteLogo}
												style={[ChatStyle.retyrnPin]}
												resizeMode="contain"
											/>
											{adminDetail?.chat_receive_history_count > 0 && (
												<View style={ChatStyle.adminBadgeCount}>
													<Text style={ChatStyle.countText}>
														{adminDetail?.chat_receive_history_count}
													</Text>
												</View>
											)}
										</View>
										<Text style={[ChatStyle.retyrnPinTex]}>
											{"Message \nRetyrn"}
										</Text>
									</TouchableOpacity>
								)}
								{isLoading ? (
									<CircleLoader />
								) : (
									<TouchableOpacity onPress={() => setIsShowTrustedList(true)}>
										<View
											style={[
												ChatStyle.retyrnPinContainer,
												isShowTrustedList && {
													borderWidth: 3,
													borderColor: Colors.secondary,
												},
											]}
										>
											<Icons
												iconSetName={"Ionicons"}
												iconName={"person-sharp"}
												iconColor={Colors.white}
												iconSize={28}
											/>
										</View>
										<Text style={[ChatStyle.retyrnPinTex]}>
											{"Trusted \nContact"}
										</Text>
									</TouchableOpacity>
								)}
								{isEmployeeLoading ? (
									<CircleLoader />
								) : (
									<TouchableOpacity onPress={() => setIsShowTrustedList(false)}>
										<View
											style={[
												ChatStyle.retyrnPinContainer,
												!isShowTrustedList && {
													borderWidth: 3,
													borderColor: Colors.secondary,
												},
											]}
										>
											<Icons
												iconSetName={"MaterialDesignIcons"}
												iconName={"account-tie"}
												iconColor={Colors.white}
												iconSize={32}
											/>
										</View>
										<Text style={[ChatStyle.retyrnPinTex]}>
											{"Company \nEmployee"}
										</Text>
									</TouchableOpacity>
								)}
								{isPinnedLoading ? (
									<CircleLoader />
								) : (
									<>
										{pinnedContactList?.map((item, index) => (
											<RenderPinnedContact item={item} index={index} />
										))}
									</>
								)}
							</ScrollView>
						</View>
					</View>
					{isShowTrustedList ? (
						<TrustedContactsRoute />
					) : (
						<CompanyEmployeeRoute />
					)}
					{selectedRemoveItems.length > 0 && (
						<View
							style={[AccountStyle.deleteContainer, { paddingVertical: 20 }]}
						>
							<Button
								onPress={() => setShowConfirmDelete(true)}
								btnName={`${
									selectedRemoveItems.length > 1
										? `${selectedRemoveItems.length} Remove Pin Contacts`
										: `${selectedRemoveItems.length} Remove Pin Contact`
								}`}
								isBtnActive={true}
								btnColor={Colors.red}
								btnLabelColor={Colors.white}
							/>
						</View>
					)}
				</>
			)}
		</View>
	);
};

export default ChatScreen;
