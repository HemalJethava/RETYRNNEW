import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	FlatList,
	Image,
	Switch,
	Keyboard,
	Linking,
	ImageBackground,
	Pressable,
	ActivityIndicator,
	BackHandler,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from "react-native";
import { pick } from "@react-native-documents/picker";
import { launchImageLibrary } from "react-native-image-picker";
import { showMessage } from "react-native-flash-message";
import { Icons, KeyValue, Loader, Overlay } from "../../components";
import ChatStyle from "../../styles/ChatStyle";
import LayoutStyle from "../../styles/LayoutStyle";
import Colors from "../../styles/Colors";
import PassListScreen from "./PassListScreen";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useSelector } from "react-redux";
import Api from "../../utils/Api";
import RNFS, { stat } from "react-native-fs";
import ImageResizer from "react-native-image-resizer";
import { ImagesPopup } from "./components/ImagesPopup";
import { ImageMessage } from "./components/ImageMessage";
import { FileMessage } from "./components/FileMessage";
import FastImage from "react-native-fast-image";
import ChatMessageSkeleton from "../../components/LoaderComponents/ChatMessageSkeleton";
import CommonStyles from "../../styles/CommonStyles";
import {
	calculateDistance,
	checkCameraPermission,
	copyToClipboard,
	fileTypesAndroid,
	fileTypesIOS,
	formatMessageDate,
	generateUniqueId,
	getFileType,
	getFriendlyDate,
	getShortAddress,
	hapticVibrate,
	MAX_FILE_SIZE_BYTES,
	openFileByThirdPartyApp,
	setCurrentChatUser,
} from "../../config/CommonFunctions";
import { DeleteMessagePopup } from "./components/DeleteMessagePopup";
import Share from "react-native-share";
import RNFetchBlob from "rn-fetch-blob";
import axios from "axios";
import { GOOGLE_MAPS_APIKEY } from "../../config/BaseUrl";
import IncidentStyle from "../../styles/IncidentStyles";
import IMAGES from "../../assets/images/Images";
import { getCurrentLocation, locationPermission } from "../../utils/Location";
import { formatCodeWithMobileNumber } from "../../utils/Validation";
import notifee from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MESSAGE from "../../utils/Messages";
import ImagePicker from "react-native-image-crop-picker";
import { formatLastSeen } from "./components/formatLastSeen";
import useEcho from "../../utils/chatUtils/useEcho";
import { ProfilePictureModal } from "./components/ProfilePictureModal";
import useMarkAsReadMsg from "../../utils/chatUtils/useMarkAsReadMsg";
import FontFamily from "../../assets/fonts/FontFamily";

const generateroomID = (userId1, userId2) => {
	return `${Math.min(userId1, userId2)}_${Math.max(userId1, userId2)}`;
};

const MessageScreen = (props) => {
	const chatID = props.route.params?.chatID;
	const chatDetails = props.route.params?.item;
	const isShowInfo = props.route.params?.info;
	const sharedFile = props.route.params?.sharedFile;

	const userData = useSelector((state) => state.Auth.userData);

	const { chatUserStatus, chatUserMarkReadStatus } = useSelector(
		(state) => state.Chat
	);

	const roomID = generateroomID(chatID, userData.id);
	const flatListRef = useRef(null);
	const mapRef = useRef(null);
	const isAtBottomRef = useRef(false);

	const [isChatLoading, setIsChatLoading] = useState(false);
	const [messages, setMessages] = useState([]);
	const [page, setPage] = useState(1);
	const [lastPage, setLastPage] = useState(1);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [isAtBottom, setIsAtBottom] = useState(true);

	const [expandedMessages, setExpandedMessages] = useState({});

	const [inputMessage, setInputMessage] = useState("");
	const [isToogle, setIsToogle] = useState(false);
	const [isToggleLoading, setIsToggleLoading] = useState(false);
	const [isProfileModal, setIsProfileModal] = useState(true);
	const [isShareModal, setIsShareModal] = useState(false);
	const [isSelectImgOptions, setIsSelectImgOptions] = useState(false);
	const [isOptionImg, setIsOptionImg] = useState(false);
	const [isOptionPass, setIsOptionPass] = useState(false);
	const [isSelectPassOption, setIsSelectPassOption] = useState(false);
	const [isSelectFileOption, setIsSelectFileOption] = useState(false);

	const [chatImages, setChatImages] = useState([]);
	const [base64Array, setBase64Array] = useState([]);

	const [selectedFiles, setSelectedFiles] = useState([]);
	const [fileBase64Array, setFileBase64Array] = useState([]);
	const [isSelectLoctionOption, setIsSelectLocationOption] = useState(false);
	const [location, setLocation] = useState(null);
	const [placeId, setPlaceId] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [loactionStatus, setLocationStatus] = useState("Loading!");

	const [selectPassList, setSelectPassList] = useState([]);
	const [isMsgImg, setIsMsgImg] = useState(false);
	const [isSendBtn, setIsSendBtn] = useState(false);

	const [showImagesPopup, setShowImagesPopup] = useState(false);
	const [imagePopupTitle, setImagePopupTitle] = useState("Chat Images");
	const [selectedMessage, setSelectedMessage] = useState(null);

	const [isRecenterVisible, setIsRecenterVisible] = useState(false);

	const [isDeleteBtnVisible, setIsDeleteaBtnVisible] = useState(false);
	const [selectedItems, setSelectedItems] = useState([]);
	const [multiSelectMode, setMultiSelectMode] = useState(false);
	const [showConfirmDelete, setShowConfirmDelete] = useState(false);

	const [marker, setMarker] = useState(null);
	const [address, setAddress] = useState("");
	const [isSharing, setIsSharing] = useState(false);

	const [unreadMsgCount, setUnreadMsgCount] = useState(0);
	const [isKeyboardVisible, setKeyboardVisible] = useState(false);

	const [receiverStatus, setReceiverStatus] = useState("");
	const [statusColor, setStatusColor] = useState(Colors.offline);
	const [isShowProfileModal, setShowProfileModal] = useState(false);

	const echo = useEcho((msg) => {
		handleMessageReceived(msg);
	});

	const markReadEcho = useMarkAsReadMsg(chatID, (newStatus) => {});

	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			"keyboardDidShow",
			() => setKeyboardVisible(true)
		);
		const keyboardDidHideListener = Keyboard.addListener(
			"keyboardDidHide",
			() => setKeyboardVisible(false)
		);

		return () => {
			keyboardDidShowListener.remove();
			keyboardDidHideListener.remove();
		};
	}, []);

	useEffect(() => {
		console.log("chatDetails: ", chatDetails);
		console.log("RoomID: ", roomID);

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			gotoBack
		);
		return () => backHandler.remove();
	}, [props.navigation]);

	useEffect(() => {
		if (!sharedFile) return;

		let fileEntries = [];

		if (Platform.OS === "ios" && Array.isArray(sharedFile.data)) {
			fileEntries = sharedFile.data.map((item) => ({
				uri: item?.data,
				mimeType: item?.mimeType,
				name: item?.name || "",
			}));
		} else if (Array.isArray(sharedFile.data)) {
			fileEntries = sharedFile.data.map((uri) => ({
				uri,
				mimeType: sharedFile.mimeType,
				name: sharedFile?.name || "",
			}));
		} else if (sharedFile.data) {
			fileEntries = [
				{
					uri: sharedFile.data,
					mimeType: sharedFile.mimeType,
					name: sharedFile?.name || "",
				},
			];
		}

		if (!fileEntries.length) return;

		setIsMsgImg(true);
		setIsSendBtn(true);

		const images = fileEntries.filter(
			(f) => f.mimeType && f.mimeType.startsWith("image/")
		);
		const files = fileEntries.filter(
			(f) => !f.mimeType || !f.mimeType.startsWith("image/")
		);

		if (images.length) {
			const newImages = images.map((file, index) => ({
				uri: file?.uri,
				type: file?.mimeType || "image/jpeg",
				name: `shared_${Date.now()}_${index}.jpg`,
			}));
			setChatImages((prev) => [...prev, ...newImages]);
			convertFilesToBase64(newImages, "image");
		}

		if (files.length) {
			const newFiles = files.map((file, index) => ({
				uri: file?.uri,
				type: file?.mimeType,
				name: file?.name || getFileNameFromUri(file?.uri, file?.mimeType),
			}));
			setIsSelectFileOption(true);
			setSelectedFiles((prev) => [...prev, ...newFiles]);
			convertFilesToBase64(newFiles, "file");
		}
	}, [sharedFile]);

	const getFileNameFromUri = (uri, mimeType) => {
		if (!uri) return "unknown";

		let lastPart = uri.split("/").pop();
		lastPart = decodeURIComponent(lastPart);

		if (lastPart && lastPart.includes(".")) {
			return lastPart;
		}

		const ext = mimeType?.split("/")[1] || "dat";
		return `shared_${Date.now()}.${ext}`;
	};
	const gotoBack = async () => {
		if (isOptionPass) {
			setIsOptionPass(false);
		} else {
			await AsyncStorage.removeItem("currentChatUserId");
			props.navigation.goBack();
		}
		return true;
	};
	const getUserToken = () => {
		return (token = global.userToken);
	};
	const getMessages = async (pageNum) => {
		try {
			setIsChatLoading(pageNum > 1 ? false : true);
			const response = await Api.get(
				`user/chat/paginate/${chatID}?page=${pageNum}`
			);
			if (response?.success) {
				setLastPage(response?.data?.last_page);
				const newMessages = response?.data?.data || [];
				setMessages((prev) => {
					const updatedMessages =
						pageNum === 1 ? newMessages : [...prev, ...newMessages];
					return updatedMessages;
				});
			}
		} catch (error) {
			console.warn("Error fetching messages:", error);
		} finally {
			setIsChatLoading(false);
			setIsLoadingMore(false);
		}
	};
	const onScroll = (event) => {
		const contentOffsetY = event.nativeEvent.contentOffset.y;

		const isAtBottom = contentOffsetY <= 10;
		setIsAtBottom(isAtBottom);
		isAtBottomRef.current = isAtBottom;

		setUnreadMsgCount(isAtBottom ? 0 : unreadMsgCount);
	};
	const scrollToEnd = () => {
		if (flatListRef.current) {
			flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
		}
	};
	const removeNotificationForUser = async (senderId) => {
		try {
			const storedData = await AsyncStorage.getItem("notificationStore");

			const notificationStore = storedData ? JSON.parse(storedData) : {};

			const notificationId = notificationStore[senderId];

			if (notificationId) {
				await notifee.cancelNotification(notificationId);
				await notifee.cancelDisplayedNotifications();

				delete notificationStore[senderId];
				await AsyncStorage.setItem(
					"notificationStore",
					JSON.stringify(notificationStore)
				);
			}
		} catch (error) {
			console.error("Error removing notification:", error);
		}
	};

	useEffect(() => {
		if (chatID) {
			getMessages(page);
			removeNotificationForUser(chatID);
			setCurrentChatUser(chatID);
		}

		if (
			chatDetails?.emergency_contacts_rel ||
			chatDetails?.user?.emergency_contacts_rel
		) {
			setIsToogle(true);
		}

		if (isShowInfo) setIsProfileModal(false);
	}, [chatID, roomID, page]);

	useEffect(() => {
		const data = chatUserStatus?.id === chatID ? chatUserStatus : chatDetails;
		if (!data) return;

		const status = data?.user_status || data?.user?.user_status;
		const lastSeen = data?.last_seen_at || data?.user?.last_seen_at;

		if (!status && !lastSeen) return;

		let displayStatus = status;
		if (status === "offline" && lastSeen) {
			displayStatus = formatLastSeen(lastSeen);
		}

		setReceiverStatus(displayStatus || "");

		const colorMap = {
			online: Colors.online,
			away: Colors.away,
			offline: Colors.offline,
		};
		setStatusColor(colorMap[status] || Colors.offline);
	}, [chatUserStatus, chatDetails]);

	useEffect(() => {
		const receiverId = chatUserMarkReadStatus?.mark_read?.receiver_id;

		if (chatID === receiverId) {
			handleMarkReadMessages();
		}
	}, [chatUserMarkReadStatus]);

	useEffect(() => {
		return () => echo?.leaveChannel("messages");
	}, []);

	useEffect(() => {
		return () => {
			markReadEcho?.leaveChannel(`markRead.${chatID}.${userData?.id}`);
		};
	}, [chatID]);

	const sendMessageAPI = async (payload) => {
		try {
			setMessages((prevMessages) => [payload, ...prevMessages]);
			setInputMessage("");
			emptyValueState();

			console.log("payload: ", payload);
			const response = await Api.post(`user/send-message`, payload);

			if (response.success) {
				if (response?.message?.roomID === roomID) {
					setMessages((prevMessages) => {
						const messageIndex = prevMessages.findIndex(
							(item) => item.message_id === response?.message?.message_id
						);

						if (messageIndex > -1) {
							const updatedMessages = [...prevMessages];
							updatedMessages[messageIndex] = {
								...updatedMessages[messageIndex],
								...response?.message,
								loading: false,
							};
							return updatedMessages;
						} else {
							return [response?.message, ...prevMessages];
						}
					});
				}
			}
		} catch (e) {
			console.error("Error: ", e);
		}
	};
	const handleSendMessage = async () => {
		const token = getUserToken();
		const messageId = generateUniqueId();
		let newMessage = {
			chatID,
			roomID,
			message_id: messageId,
			message_text: inputMessage,
			sender_id: userData.id,
			created_at: Date.now(),
			token,
			loading: true,
			is_read: 0,
			message_type: "",
		};

		if (selectPassList.length > 0) {
			Object.assign(newMessage, {
				pass_id: selectPassList[0].id,
				passName: selectPassList[0].name,
				passImg: selectPassList[0].image_url,
				message_type: "pass",
			});
		} else if (location) {
			Object.assign(newMessage, {
				location,
				place_id: placeId,
				message_type: "location",
			});
		} else if (selectedFiles.length > 0 || chatImages.length > 0) {
			Object.assign(newMessage, {
				chat_files: selectedFiles.length > 0 ? fileBase64Array : base64Array,
				message_type: selectedFiles.length > 0 ? "file" : "image",
			});
		} else {
			if (inputMessage.trim() === "") return;
			newMessage.message_type = "text";
		}

		await sendMessageAPI(newMessage);
	};
	const onRefresh = () => {
		if (messages.length === 0) return;
		if (lastPage !== 1 && page >= lastPage) {
			return;
		}

		if (!isLoadingMore && page < lastPage) {
			setIsLoadingMore(true);
			setPage((prevPage) => prevPage + 1);
		}
	};
	const handleMarkReadMessages = () => {
		setMessages((prevMessages) =>
			prevMessages.map((msg) => ({
				...msg,
				is_read: 1,
			}))
		);
	};
	const handleMessageReceived = (msg) => {
		const message = msg[0];
		if (message.roomID === roomID) {
			if (!isAtBottomRef.current && message?.sender_id !== userData?.id) {
				setUnreadMsgCount((prevCount) => prevCount + 1);
			}
			setMessages((prevMessages) => {
				const messageIndex = prevMessages.findIndex(
					(item) => item.message_id === message.message_id
				);

				if (messageIndex > -1) {
					const updatedMessages = [...prevMessages];
					updatedMessages[messageIndex] = {
						...updatedMessages[messageIndex],
						...message,
						loading: false,
					};
					return updatedMessages;
				} else {
					return [message, ...prevMessages];
				}
			});
		}
	};
	const renderStatusIcon = (loading, isRead) => (
		<Icons
			iconSetName={"MaterialCommunityIcons"}
			iconName={
				loading
					? "clock-time-eight-outline"
					: isRead !== 1
					? "check-circle-outline"
					: "check-all"
			}
			iconColor={isRead !== 1 ? Colors.labelDarkGray : Colors.secondary}
			iconSize={14}
		/>
	);
	const toggleItemSelection = (item) => {
		let updatedSelectedItems;

		if (selectedItems.some((selected) => selected.id === item.id)) {
			updatedSelectedItems = selectedItems.filter(
				(selected) => selected.id !== item.id
			);
			if (updatedSelectedItems.length === 0) {
				setMultiSelectMode(false);
			}
		} else {
			updatedSelectedItems = [...selectedItems, item];
			hapticVibrate();
		}

		setSelectedItems(updatedSelectedItems);

		const hasDifferentSender = updatedSelectedItems.some(
			(selected) =>
				(selected.senderId ? selected.senderId : selected.sender_id) !==
				userData.id
		);
		setIsDeleteaBtnVisible(!hasDifferentSender);
	};
	const handlePress = (item) => {
		toggleItemSelection(item);
	};
	const handleLongPress = (item) => {
		setMultiSelectMode(true);
		toggleItemSelection(item);
	};
	const gotoMapNavigation = async (item) => {
		setIsToggleLoading(true);
		const locPermissionDenied = await locationPermission();
		if (!locPermissionDenied) return;

		const { latitude, longitude } = await getCurrentLocation();
		const userLocation = latitude && longitude ? { latitude, longitude } : null;

		const currentLocationName = await getShortAddress(
			userLocation.latitude,
			userLocation.longitude
		);

		if (userLocation) {
			const selectedLocation = item?.location;
			const destinationName = await getShortAddress(
				selectedLocation.latitude,
				selectedLocation.longitude
			);

			if (selectedLocation) {
				let coordinates = [];

				coordinates.push({
					latitude: parseFloat(userLocation?.latitude),
					longitude: parseFloat(userLocation?.longitude),
					locationName: currentLocationName?.main_text,
				});

				coordinates.push({
					latitude: parseFloat(selectedLocation?.latitude),
					longitude: parseFloat(selectedLocation?.longitude),
					locationName: destinationName?.main_text,
					placeId: item?.place_id,
				});

				setIsToggleLoading(false);

				props.navigation.navigate("MainMap", {
					coordinates: coordinates,
				});
			}
		}
	};
	const onPressPass = async (chatItem) => {
		const isImagePass =
			getFileType(chatItem.passImg || chatItem?.user_pass?.image_url) !== "pdf";

		if (isImagePass) {
			const expectedResult = {
				chat_files: chatItem.user_pass?.image_url
					? [{ file_url: chatItem.user_pass.image_url }]
					: [{ file_url: chatItem.passImg }],
			};

			if (expectedResult) {
				setShowImagesPopup(true);
				setImagePopupTitle("Pass Image");
				setSelectedMessage(expectedResult);
			}
		} else {
			const file = {
				file_url: chatItem.passImg
					? chatItem.passImg
					: chatItem?.user_pass?.image_url,
				file_name: chatItem.passName
					? chatItem.passName
					: chatItem?.user_pass?.name,
			};

			openFileByThirdPartyApp(file);
		}
	};
	const renderChatItem = (chatItem, i) => {
		const nextItem = messages[i + 1];
		const isSender = chatItem.senderId
			? chatItem.senderId === userData.id
			: chatItem.sender_id === userData.id;

		const messageDate = formatMessageDate(chatItem.created_at);
		const showDateSeparator =
			!nextItem || formatMessageDate(nextItem.created_at) !== messageDate;
		const isSelected = selectedItems.some(
			(selected) => selected.id === chatItem.id
		);
		const isLongMessage = chatItem?.message_text?.length > 320;
		const isExpanded = !!expandedMessages[chatItem.id];
		const displayedText = isExpanded
			? chatItem.message_text
			: chatItem.message_text?.slice(0, 320) + (isLongMessage ? "..." : "");

		const latitude = parseFloat(chatItem?.location?.latitude || 0);
		const longitude = parseFloat(chatItem?.location?.longitude || 0);

		const renderMessageContent = () => {
			switch (chatItem.message_type) {
				case "text":
					return (
						<>
							<Text
								style={[
									ChatStyle.messageText,
									isSender
										? { color: Colors.labelWhite }
										: { color: Colors.labelBlack },
								]}
							>
								{displayedText}
							</Text>
							{isLongMessage && (
								<TouchableOpacity
									onPress={() =>
										setExpandedMessages((prev) => ({
											...prev,
											[chatItem.id]: !prev[chatItem.id],
										}))
									}
									style={ChatStyle.readMoreBtn}
								>
									<Text style={ChatStyle.readMoreTxt}>
										{isExpanded ? "Read less..." : "Read more..."}
									</Text>
								</TouchableOpacity>
							)}
						</>
					);
				case "pass":
					return (
						<TouchableOpacity onPress={() => onPressPass(chatItem)}>
							<ImageBackground
								source={{
									uri: chatItem?.user_pass?.background_image?.photo_path,
								}}
								style={ChatStyle.chatPassImgBackground}
							>
								<View style={ChatStyle.chatPassFill} />
								<View style={ChatStyle.chatPassImgBox}>
									<Image
										source={
											getFileType(
												chatItem.passImg || chatItem?.user_pass?.image_url
											) !== "pdf"
												? {
														uri:
															chatItem.passImg ||
															chatItem?.user_pass?.image_url,
												  }
												: IMAGES.pdfImg
										}
										resizeMode="center"
										style={ChatStyle.chatPassImg}
									/>
								</View>
							</ImageBackground>
							<Text
								style={[ChatStyle.passChatName, { color: Colors.labelBlue }]}
							>
								{chatItem.passName || chatItem?.user_pass?.name}
							</Text>
							{chatItem.message_text && (
								<View style={{ paddingTop: 5 }}>
									<Text
										style={[
											ChatStyle.messageText,
											isSender
												? { color: Colors.labelWhite }
												: { color: Colors.labelBlack },
										]}
									>
										{chatItem.message_text}
									</Text>
								</View>
							)}
						</TouchableOpacity>
					);
				case "location":
					return (
						<TouchableOpacity onPress={() => gotoMapNavigation(chatItem)}>
							<View style={ChatStyle.locationContainer}>
								{latitude &&
								longitude &&
								isFinite(latitude) &&
								isFinite(longitude) ? (
									<MapView
										provider={PROVIDER_GOOGLE}
										style={ChatStyle.chatMap}
										initialRegion={{
											latitude,
											longitude,
											latitudeDelta: 0.0922,
											longitudeDelta: 0.0421,
										}}
										scrollEnabled={false}
										userInterfaceStyle="light"
									>
										<Marker coordinate={{ latitude, longitude }} />
									</MapView>
								) : null}
							</View>
							{chatItem.message_text && (
								<View style={{ paddingTop: 5 }}>
									<Text
										style={[
											ChatStyle.messageText,
											isSender
												? { color: Colors.labelWhite }
												: { color: Colors.labelBlack },
										]}
									>
										{chatItem.message_text}
									</Text>
								</View>
							)}
						</TouchableOpacity>
					);
				case "image":
					return chatItem.chat_files?.length > 0 ? (
						<ImageMessage
							chatItem={chatItem}
							userData={userData}
							setShowImagesPopup={setShowImagesPopup}
							setSelectedMessage={setSelectedMessage}
						/>
					) : null;
				case "file":
					return <FileMessage chatItem={chatItem} userData={userData} />;
				default:
					return null;
			}
		};

		return (
			<TouchableOpacity
				key={chatItem.id || `chat-${i}`}
				activeOpacity={1}
				onPress={() =>
					!isProfileModal
						? setIsProfileModal(true)
						: multiSelectMode
						? handlePress(chatItem)
						: Keyboard.dismiss()
				}
				onLongPress={() => handleLongPress(chatItem)}
			>
				{showDateSeparator && (
					<View style={[ChatStyle.rowSaperator, { marginVertical: 16 }]}>
						<View style={ChatStyle.saperatorContainer}>
							<Text style={ChatStyle.dateSeparatorText}>
								{getFriendlyDate(chatItem.created_at)}
							</Text>
						</View>
					</View>
				)}

				<View
					style={[
						ChatStyle.messageContainer,
						isSender
							? ChatStyle.senderMessageContainer
							: ChatStyle.receiverMessageContainer,
						{
							backgroundColor: isSelected
								? Colors.highlightSelected
								: Colors.white,
							paddingHorizontal: 12,
							paddingVertical: 0,
						},
					]}
				>
					{!isSender && (
						<View style={[ChatStyle.senderProfileBox]}>
							{chatDetails?.photo_path ? (
								<FastImage
									source={{
										uri:
											chatDetails.photo_path || chatDetails?.user?.photo_path,
									}}
									style={[ChatStyle.senderProfile]}
								/>
							) : (
								<Text style={[ChatStyle.textColor, { fontSize: 9 }]}>
									{chatDetails?.name.charAt(0).toUpperCase()}
								</Text>
							)}
						</View>
					)}
					<View style={ChatStyle.messageBox}>
						<View
							style={[
								ChatStyle.messageBubble,
								isSender
									? ChatStyle.senderMessageBubble
									: ChatStyle.receiverMessageBubble,
								{ maxHeight: isExpanded ? undefined : 370 },
							]}
						>
							{renderMessageContent()}
						</View>
						<View
							style={[
								ChatStyle.timeMsgRow,
								{ justifyContent: !isSender ? "flex-start" : "flex-end" },
							]}
						>
							<Text style={[ChatStyle.msgTime]}>
								{formatMessageTime(chatItem.created_at)}
							</Text>
							{isSender && (
								<View>
									{renderStatusIcon(chatItem?.loading, chatItem?.is_read)}
								</View>
							)}
						</View>
					</View>
				</View>
			</TouchableOpacity>
		);
	};
	const convertFilesToBase64 = async (files, type) => {
		try {
			const base64Results = await Promise.all(
				files.map(async (file) => {
					const filePath =
						Platform.OS === "ios" ? decodeURIComponent(file.uri) : file.uri;
					const base64String = await RNFS.readFile(filePath, "base64");

					return {
						uri: file.uri,
						base64: base64String,
						name: file.fileName ? file.fileName : file.name,
						fileType: file.type ? file.type : "application/pdf",
					};
				})
			);

			if (type === "image") {
				setBase64Array((prev) => [...prev, ...base64Results]);
			} else {
				setFileBase64Array((prev) => {
					let updatedArray = [...prev, ...base64Results];
					if (updatedArray.length > 4) updatedArray = updatedArray.slice(-4);
					return updatedArray;
				});
			}
		} catch (err) {
			console.error("Error converting files to base64:", err);
		}
	};
	const gotoDialOpen = () => {
		Linking.openURL(`tel:${chatDetails?.mobile}`);
	};
	const emptyValueState = () => {
		setInputMessage("");
		setChatImages([]);
		setSelectedFiles([]);
		setSelectPassList([]);
		setLocation(null);
		setPlaceId("");
		setIsSelectFileOption(false);
		setIsMsgImg(false);
		setIsSendBtn(false);
		setIsShareModal(false);
		setIsSelectPassOption(false);
		setBase64Array([]);
		setFileBase64Array([]);
	};
	const formatMessageTime = (created_at) => {
		const date = new Date(created_at);
		return `${date.getHours()}:${("0" + date.getMinutes()).slice(-2)}`;
	};
	const handleProfileModal = () => {
		setIsProfileModal(!isProfileModal);
	};
	const handleLocationModal = async () => {
		onRequestClose();
		setIsMsgImg(true);
		setIsSendBtn(true);
	};
	const toggleSwitch = async () => {
		try {
			const contactId = chatDetails?.app_user_id
				? chatDetails?.app_user_id
				: chatDetails?.id;

			if (!contactId) return;

			setIsToogle((previousState) => !previousState);
			setIsToggleLoading(true);

			const data = {
				contact_id: contactId,
				action: isToogle ? "remove" : "add",
			};

			const resEmergency = await Api.post(`user/add-emergency-contact`, data);
			setIsToggleLoading(false);

			if (resEmergency.success) {
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
				setIsToogle((previousState) => !previousState);
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
			setIsToggleLoading(false);
			console.warn(error);
		} finally {
			setIsToggleLoading(false);
		}
	};
	const gotoOpenShareIcons = () => {
		setIsShareModal(!isShareModal);
		setIsSelectImgOptions(false);
		setIsOptionImg(false);
		Keyboard.dismiss();
	};
	const handleOpenLibrary = async () => {
		if (chatImages.length === 4) {
			showMessage({
				message: "You can only select up to 4 images",
				type: "danger",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				autoHide: true,
			});
		} else {
			await launchImageLibrary({
				mediaType: "photo",
				selectionLimit: 4 - chatImages.length,
				quality: 1,
			}).then(async (res) => {
				if (!res.didCancel && res.assets) {
					setChatImages([]);
					setSelectedFiles([]);

					const compressedImages = [];

					for (let img of res.assets) {
						try {
							const resizedImage = await ImageResizer.createResizedImage(
								img.uri,
								800,
								800,
								"JPEG",
								80,
								0
							);
							const fileInfo = await stat(resizedImage.uri);

							if (fileInfo.size <= 10 * 1024 * 1024) {
								compressedImages.push({
									...img,
									uri: resizedImage.uri,
								});
							} else {
								showMessage({
									message: MESSAGE.maxImageSize,
									type: "danger",
									floating: true,
									statusBarHeight: 40,
									icon: "auto",
									autoHide: true,
								});
							}
						} catch (err) {
							console.error("Error compressing image:", err);
						}
					}
					if (compressedImages.length > 0) {
						const tempArr = chatImages.concat(compressedImages).slice(0, 4);
						setChatImages(tempArr);
						setIsMsgImg(true);
						setIsSendBtn(true);
						convertFilesToBase64(compressedImages, "image");
					}
				}
			});
		}
	};
	const handleOpenCamera = async () => {
		if (chatImages.length == 4) {
			showMessage({
				message: "You can only select up to 4 images",
				type: "danger",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				autoHide: true,
			});
			return;
		}
		const isCameraPermission = checkCameraPermission();

		if (isCameraPermission) {
			ImagePicker.openCamera({
				width: 400,
				height: 400,
				cropping: false,
				mediaType: "photo",
			})
				.then(async (image) => {
					const resizedImage = await ImageResizer.createResizedImage(
						image.path,
						800,
						800,
						"JPEG",
						80,
						0
					);
					const fileInfo = await stat(resizedImage.path);
					if (fileInfo.size > MAX_FILE_SIZE_BYTES) {
						showMessage({
							message: MESSAGE.maxImageSize,
							type: "danger",
							icon: "auto",
							duration: 3000,
							floating: true,
							statusBarHeight: 40,
						});
						return false;
					}

					setIsMsgImg(true);
					setChatImages((prevImg) => [...prevImg, resizedImage]);
					setIsSendBtn(true);
					convertFilesToBase64([resizedImage], "image");
				})
				.catch((error) => {
					setIsModal(false);
				});
		}
	};
	const gotoOpenImgOptions = async () => {
		setIsSelectImgOptions(true);
		setIsOptionImg(true);
		setIsSelectFileOption(false);
		setIsOptionPass(false);
		setIsSelectPassOption(false);
		setIsSelectLocationOption(false);
		setLocation(null);
		setPlaceId("");
		setSelectPassList([]);
		setSelectedFiles([]);
	};
	const gotoOpenLocation = async () => {
		setIsSelectLocationOption(true);
		setModalVisible(true);
		setIsOptionPass(false);
		setIsSelectPassOption(false);
		setIsSelectImgOptions(false);
		setIsOptionImg(false);
		setIsSelectFileOption(false);
		setChatImages([]);
		setSelectPassList([]);
		setSelectedFiles([]);

		const locPermissionDenied = await locationPermission();
		if (!locPermissionDenied) return;

		const { latitude, longitude } = await getCurrentLocation();
		const userLocation = latitude && longitude ? { latitude, longitude } : null;

		setLocation(userLocation);
		setLocationStatus("received!");
		const locationName = await getShortAddress(latitude, longitude);
		setPlaceId(locationName?.place_id);
		setAddress(locationName?.main_text);
	};
	const gotoOpenPass = () => {
		setIsOptionPass(true);
		setIsSelectPassOption(true);
		setIsSelectImgOptions(false);
		setIsOptionImg(false);
		setIsSelectFileOption(false);
		setIsSelectLocationOption(false);
		setLocation(null);
		setPlaceId("");
		setChatImages([]);
		setSelectPassList([]);
		setSelectedFiles([]);
	};
	const gotoOpenfilePicker = async () => {
		setIsSelectFileOption(true);
		setIsSelectImgOptions(false);
		setIsOptionImg(false);
		setIsOptionPass(false);
		setIsSelectPassOption(false);
		setIsMsgImg(false);
		setIsSelectLocationOption(false);
		setLocation(null);
		setPlaceId("");
		setChatImages([]);
		setSelectPassList([]);

		try {
			const res = await pick({
				type: Platform.OS === "android" ? fileTypesAndroid : fileTypesIOS,
				allowMultiSelection: true,
				copyTo: "cachesDirectory",
			});

			const validFiles = res.filter((file) => {
				if (file.size > MAX_FILE_SIZE_BYTES) {
					showMessage({
						message: `${
							file.name.length > 30 ? file.name.slice(0, 30) + "..." : file.name
						}\n${MESSAGE.maxFileSize}`,
						type: "danger",
						icon: "auto",
						duration: 3000,
						floating: true,
						statusBarHeight: 40,
					});
					return false;
				}
				return true;
			});

			let newSelection = [...selectedFiles, ...validFiles];

			if (newSelection.length > 4) {
				showMessage({
					message: "You can only send up to 4 documents",
					type: "danger",
					floating: true,
					icon: "auto",
					duration: 3000,
					statusBarHeight: 40,
					autoHide: true,
				});
				newSelection = newSelection.slice(0, 4);
			}

			const newlyAddedFiles = validFiles.filter((file) => {
				return !fileBase64Array.some(
					(convertedFile) =>
						convertedFile.name === file.name && convertedFile.size === file.size
				);
			});
			if (newlyAddedFiles.length === 0) {
				setIsMsgImg(false);
				setIsSendBtn(false);
				setIsSelectFileOption(false);

				return false;
			}
			setSelectedFiles(newSelection);
			if (newlyAddedFiles.length > 0) {
				convertFilesToBase64(newlyAddedFiles.slice(0, 4), "file");
			}
			setChatImages([]);
			setIsMsgImg(true);
			setIsSendBtn(true);
		} catch (err) {
			if (err.code !== "DOCUMENT_PICKER_CANCELED") {
				console.error("Document Picker Error:", err);
			}
		}
	};
	const onChnageInputMsg = (text) => {
		setInputMessage(text);
		if (text.trim() != "") {
			setIsSendBtn(true);
		} else {
			setIsSendBtn(false);
		}
	};
	const handleDeleteImg = (index) => {
		const deletImg = chatImages;
		const deletedImage = deletImg[index];
		const updatedImages = deletImg.filter((_, i) => i !== index);

		const updatedBase64Array = base64Array.filter(
			(img) => img.uri !== deletedImage.uri
		);

		if (chatImages.length > 0) setChatImages(updatedImages);
		setBase64Array(updatedBase64Array);

		if (updatedImages.length === 0) setIsMsgImg(false);
	};
	const handleDeleteLocation = () => {
		setIsMsgImg(false);
		setLocation(null);
		setPlaceId("");
	};
	const handleDeleteFile = (index) => {
		const deletefile = selectedFiles;
		const deletedFile = deletefile[index];
		const updatedFiles = deletefile.filter((_, i) => i !== index);

		const updatedFileBase64Array = fileBase64Array.filter(
			(file) => file.uri !== deletedFile.uri
		);

		if (selectedFiles.length > 0) setSelectedFiles(updatedFiles);
		setFileBase64Array(updatedFileBase64Array);

		if (updatedFiles.length === 0) setIsMsgImg(false);
	};
	const handleDeletePass = (index) => {
		setSelectPassList([]);
		setIsMsgImg(false);
	};
	const renderSelectedImg = (item, index) => {
		return (
			<View>
				<View
					style={[
						ChatStyle.inputBoxselectImgs,
						{ marginRight: 14, marginLeft: index == 0 ? 12 : 0 },
					]}
				>
					<Image
						source={{
							uri: item?.uri,
						}}
						style={ChatStyle.selectImgs}
					/>
					<>
						<TouchableOpacity
							style={[ChatStyle.setDeleteIcon]}
							onPress={() => handleDeleteImg(index)}
						>
							<Icons
								iconName={"minus-circle-outline"}
								iconSetName={"MaterialCommunityIcons"}
								iconColor={Colors.iconWhite}
								iconSize={20}
							/>
						</TouchableOpacity>
						<View style={[ChatStyle.overlayDetele]} />
					</>
				</View>
			</View>
		);
	};
	const renderSelectedFile = (item, index) => {
		return (
			<View
				style={[
					ChatStyle.fileMainContainer,
					{ marginLeft: index != 0 ? 10 : 0 },
				]}
			>
				<View style={[ChatStyle.fileContainer]}>
					<View style={[ChatStyle.iconPDF]}>
						<Icons
							iconColor={Colors.secondary}
							iconName={"insert-drive-file"}
							iconSetName={"MaterialIcons"}
							iconSize={14}
						/>
					</View>

					<TouchableOpacity
						onPress={() => handleDeleteFile(index)}
						style={{ padding: 2 }}
					>
						<Icons
							iconColor={Colors.iconBlack}
							iconName={"minus-circle-outline"}
							iconSetName={"MaterialCommunityIcons"}
							iconSize={20}
						/>
					</TouchableOpacity>
				</View>
				<Text style={[ChatStyle.fileNameText]}>{`${item?.name.slice(
					0,
					10
				)}...${item?.name.split(".").pop()}`}</Text>
			</View>
		);
	};
	const renderSelectedPass = (item, index) => {
		return (
			<ImageBackground
				source={{ uri: item.background_image.photo_path }}
				style={[ChatStyle.passImgBG]}
				borderRadius={3}
				resizeMode="cover"
			>
				<View
					style={[
						ChatStyle.passMainContainer,
						{
							marginLeft: index != 0 ? 10 : 0,
							backgroundColor: item.code + "E6",
						},
					]}
				>
					<View style={[ChatStyle.selectPassContainer]}>
						<TouchableOpacity
							onPress={() => handleDeletePass(index)}
							style={{ padding: 2 }}
						>
							<Icons
								iconColor={Colors.iconWhite}
								iconName={"minus-circle-outline"}
								iconSetName={"MaterialCommunityIcons"}
								iconSize={20}
							/>
						</TouchableOpacity>
					</View>
				</View>
			</ImageBackground>
		);
	};
	const handleOpationLayout = () => {
		setIsShareModal(false);
		setIsOptionImg(false);
	};
	const handleClosePass = () => {
		setIsOptionPass(false);
	};
	const fetchDatafromChild = (childData) => {
		handleClosePass();
		const selectedPass = childData.filter((item) => item.checked === true);
		setSelectPassList(selectedPass);
		setIsMsgImg(true);
		setIsSendBtn(true);
	};
	const onRequestClose = () => {
		setModalVisible(false);
	};
	const RenderEmptyList = ({}) => {
		return (
			<View style={[CommonStyles.emptyListContainer, {}]}>
				<Icons
					iconSetName={"MaterialCommunityIcons"}
					iconName={"android-messages"}
					iconColor={Colors.iconLightGray}
					iconSize={90}
				/>

				<Text style={CommonStyles.emptyTitle}>{`No chat messages`}</Text>
				<Text style={CommonStyles.emptyDescription}>
					{"Start conversing to see your messages here."}
				</Text>
			</View>
		);
	};
	const recenterMap = () => {
		if (location && mapRef.current) {
			mapRef.current.animateToRegion({
				...location,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01,
			});
		}
	};
	const handleRegionChangeComplete = (region) => {
		if (location) {
			const distance = calculateDistance(
				location.latitude,
				location.longitude,
				region.latitude,
				region.longitude
			);

			setIsRecenterVisible(distance > 30);
		}
	};
	const handleMapPress = (event) => {
		const { coordinate } = event.nativeEvent;

		setMarker({
			id: "1",
			coordinate,
			title: "Marker",
			description: "Newly added marker",
		});
	};
	const handleDragEnd = async (event) => {
		const { coordinate } = event.nativeEvent;
		const newLocation = {
			latitude: coordinate.latitude,
			longitude: coordinate.longitude,
		};
		setLocation(newLocation);
		const locationName = await getShortAddress(
			coordinate.latitude,
			coordinate.longitude
		);
		setAddress(locationName?.main_text);
		setPlaceId(locationName?.place_id);
	};
	const handlePoiClick = async (event) => {
		const placeId = event.nativeEvent.placeId;

		if (placeId) {
			try {
				const response = await axios.get(
					`https://maps.googleapis.com/maps/api/place/details/json`,
					{
						params: {
							place_id: placeId,
							key: GOOGLE_MAPS_APIKEY,
							fields: "geometry,name",
						},
					}
				);

				const result = response.data.result;
				const userLocation = result.geometry.location;
				const newLocation = {
					latitude: userLocation.lat,
					longitude: userLocation.lng,
				};
				setLocation(newLocation);
				const mainText = result.name;
				setAddress(mainText);
				setPlaceId(event.nativeEvent.placeId);
			} catch (error) {
				console.error("Error fetching place details:", error);
			}
		}
	};
	const onPressCopy = () => {
		if (
			selectedItems.length === 1 &&
			selectedItems[0].message_type === "text"
		) {
			copyToClipboard(selectedItems[0].message_text);
		}
	};
	const onPressShare = async () => {
		if (
			selectedItems.length === 1 &&
			selectedItems[0]?.message_type !== "text"
		) {
			if (isSharing) return;
			setIsSharing(true);

			const chatItem = selectedItems[0];
			let shareData = [];
			let shareMsg = "";

			if (chatItem?.message_type === "image") {
				const imgsURL = chatItem?.chat_files.map((img) =>
					img.file_url
						? img.file_url
						: `data:${chatItem?.chat_files[0]?.fileType};base64,${chatItem?.chat_files[0]?.base64}`
				);
				shareData = imgsURL;
				shareMsg = "Share Image";
			} else if (chatItem?.message_type === "pass") {
				const passURL = chatItem.passImg
					? chatItem.passImg
					: chatItem?.user_pass?.image_url;
				shareData = [passURL];
				shareMsg = "Share Pass";
			} else if (chatItem?.message_type === "file") {
				const filesURL = chatItem?.chat_files.map((file) =>
					file.uri ? file.uri : file.file_url
				);
				shareData = filesURL;
				shareMsg = "Share Files";
			} else if (chatItem?.message_type === "location") {
				const googleMapsUrl = `https://www.google.com/maps?q=${chatItem?.location?.latitude},${chatItem?.location?.longitude}`;
				shareData = [googleMapsUrl];
				shareMsg = "Share Location";
			} else {
				return;
			}

			if (
				chatItem?.message_type !== "location" &&
				chatItem?.message_type !== "text"
			) {
				try {
					const downloadedFiles = await Promise.all(
						shareData.map(async (fileUrl, index) => {
							if (fileUrl.startsWith("http")) {
								const { config, fs } = RNFetchBlob;

								let fileName = chatItem?.chat_files[index]?.file_name
									? chatItem?.chat_files[index]?.file_name
									: chatItem?.user_pass?.name
									? chatItem?.user_pass?.name
									: `shared_file_${index}`;

								const ext = fileUrl.split(".").pop().split("?")[0];
								fileName = fileName.replace(/\s+/g, "_");
								if (!fileName.includes(".")) {
									fileName += `.${ext}`;
								}

								const filePath = `${fs.dirs.CacheDir}/${fileName}`;

								const res = await config({
									fileCache: true,
									appendExt: ext,
									path: filePath,
								}).fetch("GET", fileUrl);

								return `file://${res.path()}`;
							} else {
								return fileUrl;
							}
						})
					);

					shareData = downloadedFiles;
				} catch (error) {
					console.error("File download error:", error);
				}
			}

			const options = {
				title: shareMsg,
				subject: shareMsg,
				urls: shareData.length > 1 ? shareData : [shareData[0]],
			};

			Share.open(options)
				.then((res) => {})
				.catch((err) => console.error("Share Error: ", err));

			setIsSharing(false);
		}
	};

	return (
		<KeyboardAvoidingView
			style={[ChatStyle.mainContainer, { backgroundColor: Colors.white }]}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={
				Platform.OS === "ios" ? 0 : isKeyboardVisible ? 0 : -40
			}
		>
			<Loader show={isToggleLoading} />
			{showImagesPopup && (
				<ImagesPopup
					show={showImagesPopup}
					onHide={() => {
						setShowImagesPopup(false);
						setImagePopupTitle("Chat Images");
					}}
					data={selectedMessage}
					title={imagePopupTitle}
				/>
			)}
			{showConfirmDelete && (
				<DeleteMessagePopup
					show={showConfirmDelete}
					onHide={() => setShowConfirmDelete(false)}
					data={selectedItems}
					setIsToggleLoading={setIsToggleLoading}
					onSuccess={(message) => {
						setShowConfirmDelete(false);
						setMultiSelectMode(false);
						setIsToggleLoading(false);
						setSelectedItems([]);
						getMessages(page);
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
						setIsToggleLoading(false);
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
			{!isOptionPass ? (
				<View
					style={[ChatStyle.mainContainer, { backgroundColor: Colors.white }]}
				>
					<View style={[ChatStyle.screenHeader]}>
						{selectedItems?.length > 0 ? (
							<>
								<View style={[ChatStyle.megHeaderContainer, {}]}>
									<View>
										<TouchableOpacity onPress={() => gotoBack()}>
											<View style={[ChatStyle.actionIcon]}>
												<Icons
													iconName={"angle-left"}
													iconSetName={"FontAwesome6"}
													iconColor={Colors.backArrowBlack}
													iconSize={24}
												/>
											</View>
										</TouchableOpacity>
									</View>
									<View style={[ChatStyle.msgProfileHeader]}>
										{isDeleteBtnVisible && (
											<TouchableOpacity
												onPress={() => setShowConfirmDelete(true)}
											>
												<View>
													<Icons
														iconName={"delete-outline"}
														iconSetName={"MaterialCommunityIcons"}
														iconColor={Colors.backArrowBlack}
														iconSize={24}
													/>
												</View>
											</TouchableOpacity>
										)}
										{selectedItems?.length === 1 &&
											selectedItems[0].message_type !== "text" && (
												<TouchableOpacity
													disabled={isSharing}
													style={{ opacity: isSharing ? 0.5 : 1 }}
													onPress={() => onPressShare()}
												>
													<View style={{ marginLeft: 10 }}>
														<Icons
															iconName={"ios-share"}
															iconSetName={"MaterialIcons"}
															iconColor={Colors.backArrowBlack}
															iconSize={22}
														/>
													</View>
												</TouchableOpacity>
											)}
										{selectedItems?.length === 1 &&
											selectedItems[0].message_type === "text" && (
												<TouchableOpacity onPress={() => onPressCopy()}>
													<View style={{ marginLeft: 10 }}>
														<Icons
															iconName={"content-copy"}
															iconSetName={"MaterialCommunityIcons"}
															iconColor={Colors.backArrowBlack}
															iconSize={24}
														/>
													</View>
												</TouchableOpacity>
											)}
									</View>
								</View>
								<View style={[ChatStyle.borderBottomBlack]} />
							</>
						) : (
							<>
								<View style={[ChatStyle.megHeaderContainer]}>
									<View style={[ChatStyle.msgProfileHeader]}>
										<TouchableOpacity onPress={() => gotoBack()}>
											<View style={[ChatStyle.backArrow]}>
												<Icons
													iconName={"angle-left"}
													iconSetName={"FontAwesome6"}
													iconColor={Colors.backArrowBlack}
													iconSize={24}
												/>
											</View>
										</TouchableOpacity>
										<TouchableOpacity
											style={{ ...CommonStyles.directionRowCenter }}
											onPress={() => handleProfileModal()}
											disabled={chatDetails?.user_type == 1}
										>
											<TouchableOpacity
												style={[ChatStyle.profileImg]}
												onPress={() => setShowProfileModal(true)}
											>
												{!chatDetails?.photo_path ? (
													<Text style={[ChatStyle.textColor]}>
														{chatDetails.name.charAt(0).toUpperCase()}
													</Text>
												) : (
													<FastImage
														source={
															chatDetails?.user_type !== 1
																? {
																		uri: chatDetails?.photo_path
																			? chatDetails?.photo_path
																			: chatDetails?.user?.photo_path,
																  }
																: IMAGES.appWhiteLogo
														}
														style={[
															chatDetails?.user_type !== 1
																? ChatStyle.headerProfileImg
																: [{ padding: 10 }],
														]}
														resizeMode={"contain"}
													/>
												)}
												{chatDetails?.user_type !== 1 && (
													<View
														style={[
															ChatStyle.statusCircle,
															{ backgroundColor: statusColor },
														]}
													/>
												)}
											</TouchableOpacity>

											<View style={[ChatStyle.nameDate]}>
												<Text
													numberOfLines={1}
													style={[ChatStyle.nameHeader, { width: 190 }]}
												>
													{chatDetails.name.charAt(0).toUpperCase() +
														chatDetails.name.slice(1)}
												</Text>
												{chatDetails?.user_type !== 1 && (
													<Text style={[ChatStyle.statusText]}>
														{receiverStatus || "Last seen..."}
													</Text>
												)}
											</View>
										</TouchableOpacity>
									</View>
									{chatDetails?.user_type !== 1 && (
										<TouchableOpacity onPress={() => gotoDialOpen()}>
											<Icons
												iconName={"phone-outline"}
												iconSetName={"MaterialCommunityIcons"}
												iconColor={Colors.backArrowBlack}
												iconSize={24}
											/>
										</TouchableOpacity>
									)}
								</View>
								{isProfileModal ? (
									<View style={[ChatStyle.borderBottomBlack]} />
								) : (
									<View style={[ChatStyle.profileBG]}>
										{(chatDetails?.user?.company_detail?.company_name ||
											chatDetails?.company_detail?.company_name) && (
											<KeyValue
												borderColor={Colors.lightBlueBorder}
												keyTextStyle={[ChatStyle.profileDetailsLabel]}
												valueTextStyle={[ChatStyle.profileDetailsValue]}
												keyLabel={"Company"}
												valueLabel={
													(
														chatDetails?.user?.company_detail?.company_name ||
														chatDetails?.company_detail?.company_name
													)?.length > 18
														? `${(
																chatDetails?.user?.company_detail
																	?.company_name ||
																chatDetails?.company_detail?.company_name
														  ).slice(0, 18)}...`
														: chatDetails?.user?.company_detail?.company_name ||
														  chatDetails?.company_detail?.company_name
												}
												keyColor={Colors.labelBlack}
												valueColor={Colors.labelBlack}
											/>
										)}
										<KeyValue
											borderColor={Colors.lightBlueBorder}
											keyTextStyle={[ChatStyle.profileDetailsLabel]}
											valueTextStyle={[ChatStyle.profileDetailsValue]}
											keyLabel={"Phone"}
											valueLabel={formatCodeWithMobileNumber(
												chatDetails?.mobile
											)}
											keyColor={Colors.labelBlack}
											valueColor={Colors.labelBlack}
										/>
										{(chatDetails?.user?.email || chatDetails?.email) && (
											<View style={[ChatStyle.scrollKeyValue]}>
												<Text style={[ChatStyle.scrollKeyTxt]}>{"Email"}</Text>
												<ScrollView
													horizontal
													showsHorizontalScrollIndicator={false}
													contentContainerStyle={{ flexGrow: 1 }}
													style={{ width: "60%" }}
												>
													<Text style={[ChatStyle.scrollValueTxt]}>
														{chatDetails?.user?.email || chatDetails?.email}
													</Text>
												</ScrollView>
											</View>
										)}
										<View style={[ChatStyle.detailsContainer]}>
											<Text style={[ChatStyle.profileDetailsLabel]}>
												{"Add as Emergency Contact?"}
											</Text>
											<Switch
												trackColor={{
													false: Colors.disableBtn,
													true: Colors.secondary,
												}}
												thumbColor={isToogle ? Colors.white : Colors.white}
												ios_backgroundColor={Colors.disableBtn}
												onValueChange={toggleSwitch}
												value={isToogle}
												disabled={isToggleLoading ? true : false}
											/>
										</View>
									</View>
								)}
							</>
						)}
					</View>

					{isChatLoading ? (
						<FlatList
							data={Array(7).fill(0)}
							keyExtractor={(item, index) => `skeleton-${index}`}
							renderItem={({ item, index }) => (
								<ChatMessageSkeleton isSender={index % 2 === 0} />
							)}
							contentContainerStyle={ChatStyle.messagesContainer}
						/>
					) : (
						<FlatList
							ref={flatListRef}
							data={messages}
							renderItem={({ item, index }) => renderChatItem(item, index)}
							keyExtractor={(item, index) => index.toString()}
							contentContainerStyle={[
								ChatStyle.messageList,
								{ paddingBottom: page < lastPage ? 30 : 0 },
							]}
							showsVerticalScrollIndicator={false}
							onEndReachedThreshold={0.5}
							initialNumToRender={20}
							removeClippedSubviews={true}
							maxToRenderPerBatch={10}
							updateCellsBatchingPeriod={100}
							keyboardShouldPersistTaps="handled"
							onScroll={onScroll}
							onEndReached={onRefresh}
							ListFooterComponent={() => (
								<>
									{page < lastPage ? (
										<ActivityIndicator color={Colors.primary} size={"small"} />
									) : null}
								</>
							)}
							ListFooterComponentStyle={{ paddingBottom: 20 }}
							ListEmptyComponent={() => (
								<View style={[ChatStyle.emptyMsgList]}>
									<RenderEmptyList />
								</View>
							)}
							inverted={messages.length > 0}
						/>
					)}
					{!isAtBottom && messages.length > 1 && (
						<TouchableOpacity
							style={[ChatStyle.downArrowBtn]}
							onPress={scrollToEnd}
						>
							{unreadMsgCount > 0 && (
								<View style={[ChatStyle.dropArrowCount]}>
									<Text style={[ChatStyle.dropArrowTxt]}>{unreadMsgCount}</Text>
								</View>
							)}
							<View style={[ChatStyle.downArrow]}>
								<Icons
									iconSetName={"MaterialIcons"}
									iconName={"keyboard-double-arrow-down"}
									iconColor={"#556477"}
									iconSize={24}
								/>
							</View>
						</TouchableOpacity>
					)}
					<View style={[ChatStyle.mainImgInputContainer]}>
						<TouchableOpacity
							onPress={() => gotoOpenShareIcons()}
							style={{ marginLeft: 10 }}
						>
							<Icons
								iconName={isShareModal ? "close" : "plus"}
								iconSize={24}
								iconSetName={"MaterialCommunityIcons"}
								iconColor={Colors.iconBlack}
							/>
						</TouchableOpacity>
						{isMsgImg && (
							<View style={[ChatStyle.imgWithMesg]}>
								{chatImages.length != 0 && (
									<FlatList
										style={{ marginHorizontal: 10 }}
										data={chatImages}
										horizontal={true}
										renderItem={({ item: selectImg, index }) =>
											renderSelectedImg(selectImg, index)
										}
										keyExtractor={(item, index) => index.toString()}
										contentContainerStyle={[ChatStyle.attachmentList]}
									/>
								)}
								{isSelectFileOption && (
									<FlatList
										style={{ marginHorizontal: 10 }}
										data={selectedFiles}
										horizontal={true}
										renderItem={({ item: selectFile, index }) =>
											renderSelectedFile(selectFile, index)
										}
										keyExtractor={(item, index) => index.toString()}
										contentContainerStyle={[ChatStyle.attachmentList]}
									/>
								)}
								{selectPassList.length != 0 && (
									<FlatList
										style={{ marginHorizontal: 10 }}
										data={selectPassList}
										horizontal={true}
										renderItem={({ item: selectPass, index }) =>
											renderSelectedPass(selectPass, index)
										}
										keyExtractor={(item, index) => index.toString()}
										contentContainerStyle={[ChatStyle.attachmentList]}
									/>
								)}
								{location != null && location.length != 0 && (
									<View style={ChatStyle.smallLocationContainer}>
										<MapView
											provider={PROVIDER_GOOGLE}
											style={ChatStyle.smallChatMap}
											initialRegion={{
												latitude: location?.latitude,
												longitude: location?.longitude,
												latitudeDelta: 0.0922,
												longitudeDelta: 0.0421,
											}}
											scrollEnabled={false}
											zoomEnabled={false}
											zoomTapEnabled={false}
											zoomControlEnabled={false}
											userInterfaceStyle={"light"}
										/>
										<>
											<TouchableOpacity
												style={[
													{
														top: -35,
														left: 55,
														marginTop: -30,
														zIndex: 999999,
													},
												]}
												// handleDeleteImg(index)
												onPress={() => handleDeleteLocation()}
											>
												<Icons
													iconName={"minus-circle-outline"}
													iconSetName={"MaterialCommunityIcons"}
													iconColor={Colors.iconWhite}
													iconSize={20}
												/>
											</TouchableOpacity>
											<View
												style={[
													ChatStyle.overlayDetele,
													{ height: 70, width: 80 },
												]}
											/>
										</>
									</View>
								)}
								<View style={[ChatStyle.inputImgBorder]}>
									<TextInput
										value={inputMessage}
										onChangeText={(text) => onChnageInputMsg(text)}
										placeholder="Message…"
										style={ChatStyle.inputIMG}
										multiline
										onFocus={() => handleOpationLayout()}
										placeholderTextColor={Colors.placeholder}
										cursorColor={Colors.inputBlackText}
									/>
								</View>
							</View>
						)}
						{!isMsgImg && (
							<TextInput
								value={inputMessage}
								onChangeText={(text) => onChnageInputMsg(text)}
								placeholder="Message…"
								style={ChatStyle.input}
								multiline
								placeholderTextColor={Colors.placeholder}
								cursorColor={Colors.inputBlackText}
							/>
						)}
						<View>
							<TouchableOpacity
								style={[ChatStyle.sendButton, { opacity: isSendBtn ? 1 : 0.5 }]}
								onPress={() => handleSendMessage()}
								disabled={!isSendBtn}
							>
								<Icons
									iconName={"send-outline"}
									iconSize={24}
									iconSetName={"MaterialCommunityIcons"}
									iconColor={Colors.secondary}
								/>
							</TouchableOpacity>
						</View>
					</View>
					{isShareModal && (
						<View>
							<View style={[ChatStyle.shareIconOption]}>
								<View style={[ChatStyle.shareIconContainer]}>
									<View style={[ChatStyle.iconWidth]}>
										<TouchableOpacity
											onPress={() => gotoOpenImgOptions()}
											style={[
												ChatStyle.iconShare,
												{
													borderColor: isSelectImgOptions
														? Colors.secondary
														: Colors.black,
												},
											]}
										>
											<Icons
												iconName={"image-outline"}
												iconSize={24}
												iconSetName={"MaterialCommunityIcons"}
												iconColor={
													isSelectImgOptions
														? Colors.secondary
														: Colors.iconBlack
												}
											/>
										</TouchableOpacity>
										<Text
											style={[
												ChatStyle.shareIconText,
												{
													color: isSelectImgOptions
														? Colors.secondary
														: Colors.labelBlack,
												},
											]}
										>
											{"Photo Library"}
										</Text>
									</View>
									<View style={[ChatStyle.iconWidth]}>
										<TouchableOpacity
											onPress={() => gotoOpenLocation()}
											style={[
												ChatStyle.iconShare,
												{
													borderColor: isSelectLoctionOption
														? Colors.secondary
														: Colors.black,
												},
											]}
										>
											<Icons
												iconName={"map-marker-outline"}
												iconSize={24}
												iconSetName={"MaterialCommunityIcons"}
												iconColor={
													isSelectLoctionOption
														? Colors.secondary
														: Colors.iconBlack
												}
											/>
										</TouchableOpacity>
										<Text
											style={[
												ChatStyle.shareIconText,
												{
													color: isSelectLoctionOption
														? Colors.secondary
														: Colors.labelBlack,
												},
											]}
										>
											{"Location"}
										</Text>
									</View>
									<View style={[ChatStyle.iconWidth]}>
										<TouchableOpacity
											onPress={() => gotoOpenPass()}
											style={[
												ChatStyle.iconShare,
												{
													borderColor: isSelectPassOption
														? Colors.secondary
														: Colors.black,
												},
											]}
										>
											<Icons
												iconName={"view-grid-outline"}
												iconSize={24}
												iconSetName={"MaterialCommunityIcons"}
												iconColor={
													isSelectPassOption
														? Colors.secondary
														: Colors.iconBlack
												}
											/>
										</TouchableOpacity>
										<Text
											style={[
												ChatStyle.shareIconText,
												{
													color: isSelectPassOption
														? Colors.secondary
														: Colors.labelBlack,
												},
											]}
										>
											{"Passes"}
										</Text>
									</View>
									<View style={[ChatStyle.iconWidth]}>
										<TouchableOpacity
											onPress={() => gotoOpenfilePicker()}
											style={[
												ChatStyle.iconShare,
												{
													borderColor: isSelectFileOption
														? Colors.secondary
														: Colors.black,
												},
											]}
										>
											<Icons
												iconName={"file-multiple-outline"}
												iconSize={24}
												iconSetName={"MaterialCommunityIcons"}
												iconColor={
													isSelectFileOption
														? Colors.secondary
														: Colors.iconBlack
												}
											/>
										</TouchableOpacity>
										<Text
											style={[
												ChatStyle.shareIconText,
												{
													color: isSelectFileOption
														? Colors.secondary
														: Colors.labelBlack,
												},
											]}
										>
											{"Attach File"}
										</Text>
									</View>
								</View>
							</View>
							{isOptionImg && (
								<View style={[ChatStyle.optionImgContainer]}>
									<View style={[ChatStyle.optionImg]}>
										<TouchableOpacity
											onPress={() => handleOpenCamera()}
											style={[ChatStyle.optionIconContainer]}
										>
											<Icons
												iconName={"camera-outline"}
												iconSize={18}
												iconSetName={"MaterialCommunityIcons"}
												iconColor={Colors.white}
											/>
										</TouchableOpacity>

										<TouchableOpacity
											onPress={() => handleOpenLibrary()}
											style={[
												ChatStyle.optionIconContainer,
												{ ...LayoutStyle.marginLeft10 },
											]}
										>
											<Icons
												iconName={"image-multiple-outline"}
												iconSize={18}
												iconSetName={"MaterialCommunityIcons"}
												iconColor={Colors.white}
											/>
										</TouchableOpacity>
									</View>
								</View>
							)}
						</View>
					)}
				</View>
			) : (
				<>
					<PassListScreen
						onModalClose={() => handleClosePass()}
						onData={fetchDatafromChild}
					/>
				</>
			)}
			<Overlay visible={modalVisible}>
				<View style={[ChatStyle.locationPopup]}>
					<View style={[ChatStyle.actionModal]}>
						<View style={[ChatStyle.centerModal]}>
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
							<Text style={[ChatStyle.modalHeader]}>
								{"Location "}
								{loactionStatus}
							</Text>
						</View>

						{location ? (
							<View style={[ChatStyle.mapContainer]}>
								<MapView
									ref={mapRef}
									provider={PROVIDER_GOOGLE}
									style={ChatStyle.mapModal}
									initialRegion={{
										latitude: location.latitude,
										longitude: location.longitude,
										latitudeDelta: 0.005,
										longitudeDelta: 0.005,
									}}
									onRegionChangeComplete={handleRegionChangeComplete}
									onPress={handleMapPress}
									onPoiClick={handlePoiClick}
									userInterfaceStyle={"light"}
								>
									<Marker
										coordinate={location}
										draggable={true}
										onDragEnd={handleDragEnd}
									/>
								</MapView>
								{isRecenterVisible && (
									<TouchableOpacity
										style={ChatStyle.recenterButton}
										onPress={recenterMap}
									>
										<Icons
											iconSetName={"MaterialCommunityIcons"}
											iconName={"navigation-outline"}
											iconColor={Colors.cardBlue}
											iconSize={16}
										/>
										<Text style={ChatStyle.recenterTxt}>{"Re-center"}</Text>
									</TouchableOpacity>
								)}
							</View>
						) : (
							<View style={[ChatStyle.loaderHeight]}>
								<ActivityIndicator size="small" color={Colors.primary} />
							</View>
						)}
						<View style={[IncidentStyle.inputLocation, { marginTop: 20 }]}>
							<Text style={[IncidentStyle.locationText]}>{"Location: "}</Text>
							<Text style={[IncidentStyle.locationValue, { marginLeft: 3 }]}>
								{address ? address : "Loading..."}
							</Text>
						</View>
						<Pressable
							style={({ pressed }) => [
								ChatStyle.mapSetBtn,
								{
									backgroundColor: pressed ? "#EFEFEF" : Colors.primary,
									opacity: !location ? 0.5 : 1,
								},
							]}
							disabled={!location}
							onPress={() => handleLocationModal()}
						>
							<Text style={[ChatStyle.mapTextBtn]}>{"Send Location"}</Text>
						</Pressable>
					</View>
				</View>
			</Overlay>

			<ProfilePictureModal
				show={isShowProfileModal}
				onHide={() => setShowProfileModal(false)}
				imageUri={
					chatDetails?.photo_path || chatDetails?.user?.photo_path || ""
				}
				profileTxt={chatDetails.name.charAt(0).toUpperCase()}
				type={chatDetails?.photo_path ? "image" : "text"}
				userType={chatDetails?.user_type}
			/>
		</KeyboardAvoidingView>
	);
};
export default MessageScreen;
