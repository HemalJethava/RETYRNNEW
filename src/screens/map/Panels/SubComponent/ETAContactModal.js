import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Modal,
	Platform,
	Image,
	StyleSheet,
	PermissionsAndroid,
	FlatList,
	ActivityIndicator,
	TextInput,
	Keyboard,
	Animated,
} from "react-native";
import MapStyle from "../../../../styles/MapStyle";
import { Icons } from "../../../../components";
import Colors from "../../../../styles/Colors";
import FontFamily from "../../../../assets/fonts/FontFamily";
import CommonStyles from "../../../../styles/CommonStyles";
import LayoutStyle from "../../../../styles/LayoutStyle";
import { PassesColors } from "../../../../json/PassesColors";
import Contacts from "react-native-contacts/src/NativeContacts";
import debounce from "lodash.debounce";
import ComponentStyles from "../../../../styles/ComponentStyles";
import { deviceHeight } from "../../../../utils/DeviceInfo";

const BATCH_SIZE = 100;
const MODAL_INITIAL_HEIGHT = deviceHeight / 1.5;
const MODAL_KEYBOARD_HEIGHT = 300;

export const ETAContactModal = ({ show, onHide, onPressContact }) => {
	const animatedHeight = useRef(
		new Animated.Value(MODAL_INITIAL_HEIGHT)
	).current;

	const [loading, setLoading] = useState(false);
	const [contacts, setContacts] = useState([]);
	const [filteredContacts, setFilteredContacts] = useState([]);
	const [contactSearch, setContactSearch] = useState("");
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const listRef = useRef(null);
	const isFetchingMore = useRef(false);

	useEffect(() => {
		if (show) {
			handleAddPerson();
		}
	}, []);

	useEffect(() => {
		const keyboardShow = Keyboard.addListener(
			"keyboardWillShow",
			handleKeyboardShow
		);
		const keyboardHide = Keyboard.addListener(
			"keyboardWillHide",
			handleKeyboardHide
		);

		const androidShow = Keyboard.addListener(
			"keyboardDidShow",
			handleKeyboardShow
		);
		const androidHide = Keyboard.addListener(
			"keyboardDidHide",
			handleKeyboardHide
		);

		return () => {
			keyboardShow.remove();
			keyboardHide.remove();
			androidShow.remove();
			androidHide.remove();
		};
	}, []);

	const handleKeyboardShow = () => {
		Animated.timing(animatedHeight, {
			toValue: MODAL_KEYBOARD_HEIGHT,
			duration: 250,
			useNativeDriver: false,
		}).start();
	};

	const handleKeyboardHide = () => {
		Animated.timing(animatedHeight, {
			toValue: MODAL_INITIAL_HEIGHT,
			duration: 250,
			useNativeDriver: false,
		}).start();
	};

	const handleAddPerson = useCallback(async () => {
		try {
			if (Platform.OS === "android") {
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.READ_CONTACTS
				);
				if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
					console.warn("Contacts permission denied");
					return;
				}
			}

			setLoading(true);
			const allContacts = await Contacts.getAll();

			const valid = allContacts.filter(
				(c) => Array.isArray(c.phoneNumbers) && c.phoneNumbers.length > 0
			);

			setTimeout(() => {
				const sorted = valid.sort((a, b) =>
					getName(a).localeCompare(getName(b))
				);
				setContacts(sorted);
				setFilteredContacts(sorted.slice(0, BATCH_SIZE));
				setPage(1);
				setHasMore(sorted.length > BATCH_SIZE);
			}, 300);
		} catch (e) {
			console.error("Failed to load contacts:", e);
		} finally {
			setLoading(false);
		}
	}, [getName]);

	useEffect(() => {
		handleSearch(contactSearch);
	}, [contactSearch]);

	const getName = useCallback((c) => {
		return Platform.OS === "ios"
			? `${c.givenName || ""} ${c.middleName ? `${c.middleName} ` : ""}${
					c.familyName || ""
			  }`.trim()
			: c.displayName || "";
	}, []);

	const handleSearch = useMemo(
		() =>
			debounce((text) => {
				if (text.trim() === "") {
					setFilteredContacts(contacts.slice(0, BATCH_SIZE));
					setPage(1);
					setHasMore(contacts.length > BATCH_SIZE);
					return;
				}

				const filtered = contacts.filter((contact) =>
					getName(contact).toLowerCase().includes(text.toLowerCase())
				);
				setFilteredContacts(filtered.slice(0, BATCH_SIZE));
				setPage(1);
				setHasMore(filtered.length > BATCH_SIZE);
			}, 300),
		[contacts, getName]
	);

	const handleEndReached = () => {
		if (isFetchingMore.current || loading || !hasMore) return;

		isFetchingMore.current = true;
		setLoading(true);

		setTimeout(() => {
			const start = page * BATCH_SIZE;
			const next = start + BATCH_SIZE;
			const newBatch = contacts.slice(0, next);

			setFilteredContacts(newBatch);
			setPage((prev) => prev + 1);
			setHasMore(contacts.length > next);
			setLoading(false);
			isFetchingMore.current = false;
		}, 200);
	};
	const renderContact = ({ item, index }) => {
		const { givenName, familyName } = item;
		const firstLetter = givenName?.[0] || "";
		const colorName = PassesColors[Math.floor(Math.random() * 6)]?.color;

		return (
			<View key={item?.recordID}>
				<TouchableOpacity
					style={{
						...CommonStyles.directionRowCenter,
						...LayoutStyle.paddingHorizontal20,
						paddingVertical: 7,
					}}
					onPress={() => onPressContact(item)}
				>
					<View style={{ ...LayoutStyle.marginRight10 }}>
						{item.hasThumbnail && item.thumbnailPath ? (
							<Image
								source={{ uri: item.thumbnailPath }}
								style={styles.contactProfile}
							/>
						) : (
							<View
								style={[
									styles.fLatterCircle,
									{
										backgroundColor: `${colorName}99`,
									},
								]}
							>
								<Text style={styles.fLatter}>{firstLetter}</Text>
							</View>
						)}
					</View>
					<View>
						<Text style={styles.contactName}> {getName(item)} </Text>
						{item.phoneNumbers[0]?.number && (
							<Text style={styles.contactNum}>
								{item.phoneNumbers[0].number}
							</Text>
						)}
					</View>
				</TouchableOpacity>
				{index !== filteredContacts.length - 1 && (
					<View style={styles.divDark} />
				)}
			</View>
		);
	};
	const onPressClose = () => {
		setContactSearch("");
		onHide();
	};

	return (
		<Modal
			animationType={"slide"}
			transparent={true}
			visible={show}
			presentationStyle={"overFullScreen"}
			onRequestClose={onHide}
		>
			<View style={styles.darkContainer}>
				<Animated.View
					style={[
						styles.mainModal,
						{
							height: animatedHeight,
							overflow: "hidden",
						},
					]}
				>
					<View style={styles.headerContainer}>
						<View style={MapStyle.contactMHeader}>
							<Text style={styles.modalTitle}>{"Contacts"}</Text>
							<TouchableOpacity onPress={onPressClose}>
								<Text style={styles.blueDetailTxt}> {"Cancel"} </Text>
							</TouchableOpacity>
						</View>
						<View style={{ ...LayoutStyle.marginVertical10 }}>
							<View style={[styles.searchContactBox]}>
								{!contactSearch && (
									<View style={{ bottom: 1 }}>
										<Icons
											iconSetName={"Ionicons"}
											iconName={"search"}
											iconColor={"#888"}
											iconSize={14}
										/>
									</View>
								)}
								<TextInput
									style={[styles.searchInput, {}]}
									value={contactSearch}
									onChangeText={(t) => {
										setContactSearch(t);
										handleSearch(t);
									}}
									placeholder={"Search"}
									placeholderTextColor={Colors.labelDarkGray}
								/>
								{contactSearch && (
									<TouchableOpacity
										onPress={() => {
											setContactSearch("");
											handleSearch("");
										}}
									>
										<Icons
											iconSetName={"Ionicons"}
											iconName={"close-circle"}
											iconColor={"#888"}
											iconSize={18}
										/>
									</TouchableOpacity>
								)}
							</View>
						</View>
					</View>
					<FlatList
						ref={listRef}
						data={filteredContacts}
						keyExtractor={(item) => item.recordID}
						renderItem={renderContact}
						onEndReached={handleEndReached}
						showsVerticalScrollIndicator={false}
						scrollEventThrottle={16}
						initialNumToRender={30}
						maxToRenderPerBatch={50}
						windowSize={15}
						removeClippedSubviews
						ListFooterComponent={
							loading ? (
								<ActivityIndicator
									color={Colors.secondary}
									size="small"
									style={{ marginVertical: 10 }}
								/>
							) : null
						}
					/>
				</Animated.View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	darkContainer: {
		...ComponentStyles.loaderHorizontal,
		backgroundColor: "rgba(0,0,0,0.4)",
	},
	mainModal: {
		flex: 1,
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: Colors.white,
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		// height: deviceHeight / 1.5,
	},
	headerContainer: {
		...LayoutStyle.paddingTop10,
		borderBottomWidth: 0.5,
		borderBottomColor: "#e7e7e7",
	},
	modalTitle: {
		color: Colors.labelBlack,
		fontSize: 18,
		fontFamily: FontFamily.PoppinsMedium,
	},
	contactProfile: {
		width: 40,
		height: 40,
		borderRadius: 20,
		zIndex: -9,
	},
	fLatterCircle: {
		height: 40,
		width: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.primary,
	},
	fLatter: {
		fontFamily: FontFamily.PoppinsMedium,
		color: Colors.labelWhite,
		...LayoutStyle.fontSize20,
	},
	contactName: {
		color: Colors.labelBlack,
		fontSize: 16,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
	contactNum: {
		color: Colors.labelDarkGray,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsMedium,
	},
	divDark: {
		backgroundColor: "#e5e5e5",
		height: 1,
	},
	searchContainer: {
		...CommonStyles.directionRowCenter,
		...LayoutStyle.marginHorizontal20,
		...LayoutStyle.marginTop20,
		paddingVertical: Platform.OS === "ios" ? 10 : 0,
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
	},
	searchInput: {
		flex: 1,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsRegular,
		marginLeft: 5,
	},
	library: {
		backgroundColor: Colors.white,
		padding: 10,
		borderRadius: 5,
		shadowColor: "#888",
		shadowOffset: { width: 0, height: Platform.OS === "ios" ? 0 : -3 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
		borderTopWidth: 0,
		borderTopColor: "#ddd",
	},
	contactRow: {
		...CommonStyles.directionRowSB,
		...LayoutStyle.paddingHorizontal20,
		paddingVertical: 7,
	},
	bottomContainer: {
		paddingHorizontal: 20,
		paddingVertical: 15,
		backgroundColor: "#fff",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -3 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 5,
		borderTopWidth: 1,
		borderTopColor: "#ddd",
		justifyContent: "center",
		alignItems: "center",
	},
	selectedTxt: {
		color: Colors.labelBlack,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
	addBtn: {
		width: "100%",
		marginTop: 10,
	},
	searchContactBox: {
		backgroundColor: "#e7e7e7",
		paddingHorizontal: 10,
		borderRadius: 5,
		...CommonStyles.directionRowCenter,
		...LayoutStyle.marginHorizontal20,
		...LayoutStyle.marginBottom10,
		paddingVertical: Platform.OS === "ios" ? 10 : 0,
	},
	blueDetailTxt: {
		color: Colors.blueActiveBtn,
		fontSize: 16,
		fontFamily: FontFamily.PoppinsMedium,
	},
});
