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
	ScrollView,
	PermissionsAndroid,
	FlatList,
	ActivityIndicator,
} from "react-native";
import MapStyle from "../../../styles/MapStyle";
import { Button, Icons } from "../../../components";
import Colors from "../../../styles/Colors";
import FontFamily from "../../../assets/fonts/FontFamily";
import CommonStyles from "../../../styles/CommonStyles";
import LayoutStyle from "../../../styles/LayoutStyle";
import { TextInput } from "react-native-gesture-handler";
import { PassesColors } from "../../../json/PassesColors";
import { showMessage } from "react-native-flash-message";
import Api from "../../../utils/Api";
import Contacts from "react-native-contacts/src/NativeContacts";
import debounce from "lodash.debounce";

const BATCH_SIZE = 100;

export const AddTrustedContact = ({
	show,
	onHide,
	destinationId,
	placeId,
	pinnedPlaceList,
	onSuccess,
}) => {
	const [loading, setLoading] = useState(false);
	const [contacts, setContacts] = useState([]);
	const [filteredContacts, setFilteredContacts] = useState([]);
	const [contactSearch, setContactSearch] = useState("");
	const [selectedContacts, setSelectedContacts] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const listRef = useRef(null);
	const isFetchingMore = useRef(false);

	useEffect(() => {
		if (show && destinationId) {
			handleAddPerson();
		}
	}, []);

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
	const handleContact = (item) => {
		setSelectedContacts((prev) => {
			const exists = prev.some((c) =>
				Platform.OS === "ios"
					? c.recordID === item.recordID
					: c.phoneNumbers[0]?.id === item.phoneNumbers[0]?.id
			);
			return exists
				? prev.filter((c) =>
						Platform.OS === "ios"
							? c.recordID !== item.recordID
							: c.phoneNumbers[0]?.id !== item.phoneNumbers[0]?.id
				  )
				: [...prev, item];
		});
	};
	const renderContact = ({ item, index }) => {
		const { givenName, familyName } = item;
		const firstLetter = givenName?.[0] || "";
		const colorName = PassesColors[Math.floor(Math.random() * 6)]?.color;
		const isSelected = selectedContacts.some((contact) =>
			Platform.OS === "ios"
				? contact?.recordID === item?.recordID
				: contact?.phoneNumbers[0]?.id === item.phoneNumbers[0]?.id
		);

		return (
			<View key={item?.recordID} style={{}}>
				<TouchableOpacity
					style={styles.contactRow}
					onPress={() => handleContact(item)}
				>
					<View style={{ ...CommonStyles.directionRowCenter, flex: 0.95 }}>
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
						<View style={styles.flex}>
							<Text numberOfLines={1} style={styles.contactName}>
								{getName(item)}
							</Text>
							{item.phoneNumbers[0]?.number && (
								<Text style={styles.contactNum}>
									{item.phoneNumbers[0].number}
								</Text>
							)}
						</View>
					</View>
					<Icons
						iconSetName={isSelected ? "Ionicons" : "Feather"}
						iconName={isSelected ? "checkmark-circle" : "circle"}
						iconColor={isSelected ? Colors.blueActiveBtn : Colors.labelDarkGray}
						iconSize={20}
					/>
				</TouchableOpacity>
				{index !== filteredContacts.length - 1 && (
					<View style={styles.divDark} />
				)}
			</View>
		);
	};
	const handleAddContact = async () => {
		try {
			const existingPinnedPlace = pinnedPlaceList?.find(
				(item) => item?.place_id === placeId
			);

			if (existingPinnedPlace) {
				await addContactPinnedPlace(existingPinnedPlace);
				await addTrustedContact();
			} else {
				await addTrustedContact();
			}
		} catch (error) {
			console.warn("Error in handleAddContact:", error);
		}
	};
	const addContactPinnedPlace = async (existingPinnedPlace) => {
		try {
			if (selectedContacts.length > 0) {
				const contactsArray = selectedContacts.map((item) => {
					const rawNumber = item?.phoneNumbers[0]?.number || "";
					return {
						name: getName(item),
						mobile_number: normalizeNumber(rawNumber),
					};
				});

				const data = {
					library_id: existingPinnedPlace?.id,
					contacts: contactsArray,
				};

				console.log("data: ", data);
				const response = await Api.post(`user/add-destination-contact`, data);
				console.log("response: ", response);
			}
		} catch (error) {
			console.warn("Error: ", error);
		}
	};
	const addTrustedContact = async () => {
		try {
			if (selectedContacts.length > 0) {
				const contactsArray = selectedContacts.map((item) => {
					const rawNumber = item?.phoneNumbers[0]?.number || "";
					return {
						name: getName(item),
						mobile_number: normalizeNumber(rawNumber),
					};
				});

				const data = {
					destination_id: destinationId,
					contacts: contactsArray,
				};

				const response = await Api.post(`user/add-destination-contact`, data);

				if (response.success) {
					setContactSearch("");
					setSelectedContacts([]);
					onSuccess(response.message);
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
			}
		} catch (error) {
			console.warn("Error: ", error);
		}
	};
	const normalizeNumber = (number) => {
		if (!number) return "";

		let cleaned = number
			.trim()
			.replace(/\s+/g, "")
			.replace(/[^+\d]/g, "");

		if (cleaned.startsWith("+") && cleaned.length > 11) {
			const phone = cleaned.slice(-10);
			const countryCode = cleaned.slice(0, cleaned.length - 10);
			return `${countryCode} ${phone}`;
		}

		if (!cleaned.startsWith("+")) {
			const digits = cleaned.replace(/\D/g, "");
			if (digits.length > 10) {
				const phone = digits.slice(-10);
				const countryCode = `+${digits.slice(0, digits.length - 10)}`;
				return `${countryCode} ${phone}`;
			}
			return `+91 ${digits}`;
		}

		return cleaned;
	};
	const onPressClose = () => {
		setContactSearch("");
		setSelectedContacts([]);
		onHide();
	};

	return (
		<Modal
			animationType={"slide"}
			transparent={true}
			visible={show}
			onRequestClose={onPressClose}
		>
			<View style={[styles.flex, { marginTop: 36 }]}>
				<View style={[MapStyle.contactModal]}>
					<View style={styles.headerContainer}>
						<View style={MapStyle.contactMHeader}>
							<TouchableOpacity onPress={onPressClose}>
								<Icons
									iconSetName={"Ionicons"}
									iconName={"close"}
									iconColor={Colors.labelBlack}
									iconSize={24}
								/>
							</TouchableOpacity>
							<Text
								style={{
									color: Colors.labelBlack,
									fontSize: 18,
									fontFamily: FontFamily.PoppinsMedium,
								}}
							>
								{"Add Trusted Contact"}
							</Text>
						</View>
						<View style={[styles.searchContainer, {}]}>
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
								style={styles.searchInput}
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
					<FlatList
						ref={listRef}
						data={filteredContacts}
						keyExtractor={(item) => item.recordID}
						renderItem={renderContact}
						showsVerticalScrollIndicator={false}
						scrollEventThrottle={16}
						onEndReached={handleEndReached}
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
					{selectedContacts.length > 0 && (
						<View style={styles.bottomContainer}>
							<Text
								style={styles.selectedTxt}
							>{`${selectedContacts.length} Selected`}</Text>
							<View style={styles.addBtn}>
								<Button
									onPress={() => handleAddContact()}
									btnName={"Add"}
									btnColor={Colors.secondary}
									btnLabelColor={Colors.white}
								/>
							</View>
						</View>
					)}
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	headerContainer: {
		backgroundColor: "#e7e7e7",
		paddingBottom: 50,
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20,
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
});
