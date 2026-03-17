import {
	View,
	Text,
	PermissionsAndroid,
	TouchableOpacity,
	FlatList,
	Platform,
	Image,
	KeyboardAvoidingView,
} from "react-native";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import FastImage from "react-native-fast-image";
import { Button, Icons, Input, LightHeader, Loader } from "../../components";
import { PassesColors } from "../../json/PassesColors";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";
import { addTrustContactRequest, listOfContactRequest } from "./redux/Action";
import CommonStyles from "../../styles/CommonStyles";
import CountryPicker from "react-native-country-picker-modal";
import {
	parsePhoneNumberFromString,
	getCountries,
	getCountryCallingCode,
} from "libphonenumber-js";
import ListSkeleton from "../../components/LoaderComponents/ListSkeleton";
import { SelectAllButton } from "../../components/SelectAllButton";
import LayoutStyle from "../../styles/LayoutStyle";
import IMAGES from "../../assets/images/Images";
import {
	countryCodes,
	hapticVibrate,
	truncateText,
} from "../../config/CommonFunctions";
import Api from "../../utils/Api";
import { showMessage } from "react-native-flash-message";
import Contacts from "react-native-contacts/src/NativeContacts";
import { AddNewContactPanel } from "./Components/AddNewContactPanel";
import { ConfirmAddContactPopup } from "./Components/ConfirmAddContactPopup";
import Swipeable from "react-native-gesture-handler/Swipeable";

const AddContactScreen = (props) => {
	const dispatch = useDispatch();
	const userData = useSelector((state) => state.Auth.userData);
	const isLoading = useSelector((state) => state.Account.isLoading);
	const trustedContactList = useSelector((state) => state.Account.contactList);
	const screenName = props.route.params?.screenName || "contact";
	const swipeableRefs = useRef({});

	const [isListLoading, setIsListLoading] = useState(false);
	const [loading, setLoading] = useState(false);
	const [contactList, setContactList] = useState([]);
	const [search, setSearch] = useState("");
	const [baseContact, setBaseContact] = useState([]);
	const [displayContact, setDisplayContact] = useState([]);
	const [counter, setCounter] = useState(0);
	const [selectedData, setSelectedData] = useState([]);
	const [focus, setFocus] = useState(false);
	const [callingCode, setCallingCode] = useState("");
	const [countryCode, setCountryCode] = useState("");
	const [isMyContactAvailable, setIsMyContactAvailable] = useState(false);
	const [showContactPanel, setShowContactPanel] = useState(false);
	const [showConfirmPopup, setShowConfirmPopup] = useState(false);
	const [manualContacts, setManualContacts] = useState([]);
	const [isConfirmByManual, setIsConfirmByManual] = useState(false);

	const getTrustedContactList = async () => {
		await dispatch(listOfContactRequest(props.navigation));
	};
	const getCodes = async () => {
		try {
			const mobileNumber = userData?.mobile || "";
			const phoneNumber = parsePhoneNumberFromString(mobileNumber);

			if (phoneNumber) {
				setCallingCode(`+${phoneNumber.countryCallingCode}`);
				setCountryCode(phoneNumber.country || "US");
			}
		} catch (e) {
			console.warn("Error parsing phone number:", e);
		}
	};
	const fetchContacts = async () => {
		try {
			if (Platform.OS === "android") {
				const permission = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
					{
						title: "Contacts",
						message: "This app would like to view your contacts.",
						buttonPositive: "OK",
					}
				);

				if (permission !== "granted") {
					setIsListLoading(false);
					return;
				}
			}

			const contacts = await Contacts.getAll();
			processContacts(contacts);
		} catch (err) {
			console.warn("Contact fetch error:", err);
			setIsListLoading(false);
		}
	};
	const processContacts = (contacts) => {
		setIsListLoading(false);

		let filtered = contacts;
		if (trustedContactList.length > 0) {
			const trustedNumbers = new Set(
				trustedContactList.map((tc) => normalizePhoneNumber(tc.mobile))
			);

			filtered = contacts.filter((contact) =>
				contact?.phoneNumbers?.every(
					(phone) => !trustedNumbers.has(normalizePhoneNumber(phone?.number))
				)
			);
		}

		const formatted = filtered
			.map((contact) => ({
				...contact,
				phoneNumbers: contact?.phoneNumbers?.map((phone) => ({
					...phone,
					number: normalizePhoneNumber(phone?.number),
				})),
			}))
			.filter(
				(contact) =>
					Array.isArray(contact.phoneNumbers) && contact.phoneNumbers.length > 0
			);
		setContactList(formatted);
	};
	const normalizePhoneNumber = (number) => {
		if (!number) return "";
		const clean = number.replace(/\s+/g, "");
		const parsed = parsePhoneNumberFromString(clean);
		return parsed
			? `+${parsed.countryCallingCode} ${parsed.nationalNumber}`
			: clean.replace(/^\+/, "");
	};
	const getLast10Digits = (phone) => phone?.replace(/\D/g, "").slice(-10);
	const getCountryFromCallingCode = (code) => {
		return (
			getCountries().find(
				(country) => getCountryCallingCode(country) === code
			) || null
		);
	};
	const splitPhoneNumber = (number) => {
		if (!number)
			return { initCallingCode: null, phoneNumber: "", country: null };

		const clean = number.replace(/\s+/g, "");
		const parsed = parsePhoneNumberFromString(clean);

		if (parsed) {
			return {
				initCallingCode: `+${parsed.countryCallingCode}`,
				phoneNumber: parsed.nationalNumber,
				country:
					parsed.country ||
					getCountryFromCallingCode(parsed.countryCallingCode),
			};
		}

		const match = clean.match(/^(\+\d+)/);
		const callingCode = match ? match[1] : null;

		return {
			initCallingCode: callingCode,
			phoneNumber: getLast10Digits(clean),
			country: callingCode
				? getCountryFromCallingCode(callingCode.replace("+", ""))
				: null,
		};
	};

	useMemo(() => {
		if (!contactList.length) return;

		const formatted = contactList.map((contact, index) => {
			const { givenName, familyName, thumbnailPath, phoneNumbers } = contact;
			const firstLetter = givenName?.[0] || "";
			const secondLetter = familyName?.[0] || "";
			const colorName = PassesColors[Math.floor(Math.random() * 6)]?.color;

			const getName = () =>
				Platform.OS === "ios"
					? `${givenName} ${
							contact?.middleName ? `${contact.middleName} ` : ""
					  }${familyName}`
					: contact.displayName;

			const { initCallingCode, phoneNumber, country } = splitPhoneNumber(
				phoneNumbers[0]?.number
			);

			return {
				id: index + 1,
				name: getName(),
				phoneNumber: phoneNumber || "",
				fLetter: firstLetter,
				lLetter: secondLetter,
				photo: thumbnailPath || "",
				bgColor: `${colorName}99`,
				isSelected: false,
				callingCode: initCallingCode || callingCode,
				countryCode:
					initCallingCode === "+1"
						? "US"
						: initCallingCode === "+247"
						? "SH"
						: country || countryCode,
			};
		});

		const sortedFormatted = formatted.sort((a, b) =>
			a.name.localeCompare(b.name)
		);

		setBaseContact(sortedFormatted);
		setDisplayContact(sortedFormatted);
	}, [contactList]);

	useEffect(() => {
		if (userData) {
			setIsListLoading(true);
			getCodes();
			getTrustedContactList();
		}
	}, [userData]);

	useEffect(() => {
		fetchContacts();
	}, [trustedContactList]);

	const gotoBack = () => {
		props.navigation.goBack();
	};
	const onSelectCountry = (item, country) => {
		const updatedContacts = baseContact.map((contact) => {
			if (contact.id === item.id) {
				return {
					...contact,
					countryCode: country.cca2,
					callingCode: `+${country.callingCode[0]}`,
				};
			}
			return contact;
		});

		setBaseContact(updatedContacts);
		setDisplayContact(
			search
				? updatedContacts.filter((contact) => contact?.name?.includes(search))
				: updatedContacts
		); // Sync displayed list with search/filter
	};
	const selectContact = (item) => {
		const updatedContacts = baseContact.map((contact) => {
			if (contact.id === item.id) {
				if (!contact.isSelected) {
					hapticVibrate();
				}
				return {
					...contact,
					isSelected: !contact.isSelected,
				};
			}
			return contact;
		});
		setBaseContact(updatedContacts);
		setDisplayContact(
			search
				? updatedContacts.filter(
						(contact) => contact?.name && contact?.name.includes(search)
				  )
				: updatedContacts
		);

		const selectedContacts = updatedContacts.filter(
			(contact) => contact.isSelected
		);
		setSelectedData(selectedContacts);
		setCounter(selectedContacts.length);
		setFocus(selectedContacts.length > 0);
	};
	const toggleSelectAll = () => {
		const displayContactLength = isMyContactAvailable
			? displayContact.length - 1
			: displayContact.length;
		if (selectedData.length === displayContactLength) {
			const updatedContacts = displayContact.map((contact) => ({
				...contact,
				isSelected: false,
			}));
			setDisplayContact(updatedContacts);
			setSelectedData([]);
			setCounter(0);
			setFocus(false);
			// setMultiSelectMode(false);
		} else {
			const updatedContacts = displayContact.map((contact) => {
				const num = `${contact.callingCode} ${contact.phoneNumber}`.replace(
					/\s/g,
					""
				);
				if (num === userData.mobile.replace(/\s/g, "")) {
					setIsMyContactAvailable(true);
				}
				return {
					...contact,
					isSelected: num === userData.mobile.replace(/\s/g, "") ? false : true,
				};
			});

			const selectedContacts = updatedContacts.filter((contact) => {
				const num = `${contact.callingCode} ${contact.phoneNumber}`.replace(
					/\s/g,
					""
				);
				return num !== userData.mobile.replace(/\s/g, "");
			});

			setDisplayContact(updatedContacts);
			setSelectedData(selectedContacts);
			setCounter(selectedContacts.length);

			setFocus(selectedContacts.length > 0);
			hapticVibrate();
		}
	};
	const onChangeSearch = (text) => {
		setSearch(text);

		if (text) {
			const filteredContacts = baseContact.filter(
				(item) =>
					item?.name && item?.name.toLowerCase().includes(text.toLowerCase())
			);
			setDisplayContact(filteredContacts);
		} else {
			setDisplayContact(baseContact);
		}
	};
	const ListItem = ({ item, index }) => {
		let isMyContact = false;
		if (
			userData?.mobile ===
			`${item?.callingCode} ${item?.phoneNumber.replace(/\D/g, "")}`
		) {
			isMyContact = true;
		}
		return (
			<>
				<TouchableOpacity
					key={index}
					style={[
						AccountStyle.contactList,
						{
							backgroundColor: item.isSelected
								? Colors.highlightSelected
								: Colors.white,
							opacity: isMyContact ? 0.5 : 1,
						},
					]}
					onPress={() => selectContact(item)}
					disabled={isMyContact}
				>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
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
						<View style={{}}>
							<CountryPicker
								countryCode={item?.countryCode}
								withCallingCode
								withFilter
								withFlag
								onSelect={(country) => onSelectCountry(item, country)}
								containerButtonStyle={{
									justifyContent: "center",
									alignItems: "center",
									marginLeft: 10,
								}}
								preferredCountries={["US"]}
								countryCodes={countryCodes}
								withAlphaFilter={false}
								closeButtonImageStyle={AccountStyle.countryClose}
							/>
						</View>
						<View
							style={[AccountStyle.contactListContainer, { paddingLeft: 0 }]}
						>
							<Text numberOfLines={1} style={[AccountStyle.addContactName]}>
								{truncateText(item?.name, 20)}
							</Text>
							<Text
								style={AccountStyle.phoneNumber}
							>{`${item.callingCode} ${item?.phoneNumber}`}</Text>
						</View>
					</View>
					<TouchableOpacity
						style={{ padding: 10 }}
						onPress={() => selectContact(item)}
						disabled={isMyContact}
					>
						<Icons
							iconName={
								item.isSelected
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
			</>
		);
	};
	const LeftSwipeActions = (item, index) => {
		return (
			<TouchableOpacity
				style={[
					AccountStyle.swipeDeleteBtn,
					{
						backgroundColor: "#4CA7DA",
					},
				]}
				onPress={() => {
					selectContact(item);
					setShowConfirmPopup(true);
				}}
			>
				<Text style={[AccountStyle.swipeDltTxt, { textAlign: "center" }]}>
					{"Save"}
				</Text>
			</TouchableOpacity>
		);
	};
	const rightSwipeActions = (item, index) => {
		return <></>;
	};
	const renderContactList = (item, index) => {
		const key = item?.id || index;

		return (
			<>
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
			</>
		);
	};
	const AddTrustContact = () => {
		const selected = selectedData.flat();
		const trustedSet = new Set(
			trustedContactList.map((c) => c.mobile.replace(/\D/g, ""))
		);
		const currentTimestamp = Date.now();

		const filtered = selected.filter((c) => {
			const num = `${c.callingCode}${c.phoneNumber}`.replace(/\D/g, "");
			return !trustedSet.has(num);
		});

		if (!filtered.length) {
			showMessage({
				message:
					selected.length === 1
						? `${selected[0].name.slice(0, 30)}${
								selected[0].name.length > 30 ? "..." : ""
						  } is already in your trusted contacts.`
						: "All selected contacts are already added.",
				type: "danger",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				autoHide: true,
			});
			return cancelConfirm();
		}

		const formData = new FormData();
		filtered.forEach((c, i) => {
			formData.append(`name[${i}]`, c.name);
			formData.append(
				`mobile[${i}]`,
				`${c.callingCode} ${c.phoneNumber.replace(/\D/g, "")}`
			);
			if (c.photo)
				formData.append(`photo[${i}]`, {
					uri: c.photo,
					type: "image/jpeg",
					name: `${currentTimestamp}_${i}.jpeg`,
				});
		});

		dispatch(addTrustContactRequest(formData, props.navigation));
	};
	const onPressAddManualContact = () => {
		if (!manualContacts.length) return;

		const trustedSet = new Set(
			trustedContactList.map((c) => c.mobile.replace(/\D/g, ""))
		);
		const currentTimestamp = Date.now();

		const filtered = manualContacts.filter((c) => {
			const num = `${c.callingCode}${c.phone}`.replace(/\D/g, "");
			return !trustedSet.has(num);
		});

		if (!filtered.length) {
			showMessage({
				message:
					manualContacts.length === 1
						? `${manualContacts[0].contactName.slice(0, 30)}${
								manualContacts[0].contactName.length > 30 ? "..." : ""
						  } is already in your trusted contacts.`
						: "All selected contacts are already added.",
				type: "danger",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				autoHide: true,
			});
			return cancelConfirm();
		}

		const formData = new FormData();
		filtered.forEach((c, i) => {
			const phone = c.phone ? c.phone.replace(/\D/g, "") : "";
			formData.append(`name[${i}]`, c.contactName);
			formData.append(`mobile[${i}]`, `${c.callingCode} ${phone}`);
			if (c.imgAPI)
				formData.append(`photo[${i}]`, {
					uri: c.profileImg,
					type: "image/jpeg",
					name: `${currentTimestamp}_${i}.jpeg`,
				});
		});

		dispatch(addTrustContactRequest(formData, props.navigation));
	};
	const RenderEmptyList = () => (
		<View style={[CommonStyles.emptyListContainer]}>
			<Image
				style={CommonStyles.emptyImg}
				source={IMAGES.NoContactList}
				resizeMode={"contain"}
			/>

			<Text style={CommonStyles.emptyTitle}>{"No Contact Found!"}</Text>
		</View>
	);
	const closeAllSwipeables = () => {
		Object.values(swipeableRefs.current).forEach((ref) => {
			ref?.close?.();
		});
	};
	const cancelConfirm = () => {
		setShowConfirmPopup(false);

		const resetContacts = (contact) => ({
			...contact,
			isSelected: false,
		});

		const updatedDisplayContacts = displayContact.map(resetContacts);
		const updatedBaseContacts = baseContact.map(resetContacts);

		setDisplayContact(updatedDisplayContacts);
		setBaseContact(updatedBaseContacts);
		setSelectedData([]);
		setCounter(0);
		setFocus(false);
		closeAllSwipeables();
	};
	const AddUpdateVersion = async () => {
		try {
			const payload = {
				ios_data: {
					version: "1.1",
					build: 2,
					updateUrl: "https://www.apple.com/in/app-store/",
				},
				android_data: {
					version: "1.1",
					build: 2,
					updateUrl: "https://play.google.com/store/apps?hl=en_IN",
				},
				is_mandatory: "true",
				latest_features: [
					"Bug Fixes and Improved Performance",
					"Implement New Features",
					"This End User License Agreement (“Agreement”) is between you and Retyrn.",
					"This is a non-transferrable license to use the Application. ",
					"Map Navigation feature",
				],
			};
			const response = await Api.post(`user/add-app-version`, payload);
			if (response.success) {
				showMessage({
					message: response?.message ? response?.message : "",
					type: "success",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			} else {
				showMessage({
					message: response?.message ? response?.message : "",
					type: "danger",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			}
		} catch (e) {
			console.error("Error: ", e);
		}
	};

	return (
		<KeyboardAvoidingView
			style={{ ...CommonStyles.mainContainer }}
			behavior={"padding"}
			keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -40}
		>
			<Loader show={isLoading || loading} />
			<ConfirmAddContactPopup
				show={showConfirmPopup}
				onHide={() => cancelConfirm()}
				onConfirm={() => {
					setShowConfirmPopup(false);
					if (!isConfirmByManual) {
						AddTrustContact();
					} else {
						onPressAddManualContact();
					}
				}}
				isConfirmByManual={isConfirmByManual}
				onCancel={() => cancelConfirm()}
			/>
			<View style={[AccountStyle.mainContainer, AccountStyle.backgroundWhite]}>
				{(!isLoading || !loading) && (
					<>
						<LightHeader
							isLogo={false}
							isBackIcon={true}
							iconName={"angle-left"}
							iconSize={24}
							iconSetName={"FontAwesome6"}
							iconColor={Colors.backArrowBlack}
							headerText={"Add Trusted Contacts"}
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
								<TouchableOpacity
									style={[AccountStyle.addNewContact]}
									onPress={() => setShowContactPanel(!showContactPanel)}
								>
									<Text style={[AccountStyle.addNewTxt]}>{"Add New"}</Text>
								</TouchableOpacity>
							</View>
						)}
						{displayContact.length !== 0 && (
							<View
								style={{
									...LayoutStyle.marginRight20,
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "flex-end",
								}}
							>
								<SelectAllButton
									toggleSelectAll={toggleSelectAll}
									selectedItems={
										selectedData.length > 0 && isMyContactAvailable
											? selectedData - 1
											: selectedData
									}
									mainList={
										displayContact.length > 0 && isMyContactAvailable
											? displayContact - 1
											: displayContact
									}
								/>
							</View>
						)}
						{isListLoading ? (
							<FlatList
								style={{ ...CommonStyles.emptyList }}
								data={Array(7).fill(0)}
								keyExtractor={(item, index) => `skeleton-${index}`}
								renderItem={({ item, index }) => <ListSkeleton />}
							/>
						) : (
							<FlatList
								data={displayContact}
								renderItem={({ item, index }) => renderContactList(item, index)}
								keyExtractor={(item) => item.id.toString()}
								initialNumToRender={20}
								windowSize={10}
								maxToRenderPerBatch={10}
								removeClippedSubviews={true}
								showsVerticalScrollIndicator={false}
								updateCellsBatchingPeriod={50}
								ListEmptyComponent={() => <RenderEmptyList />}
							/>
						)}
						{focus ? (
							<View style={[AccountStyle.deleteContainer, {}]}>
								<Text style={[AccountStyle.counterSelected, { paddingTop: 0 }]}>
									{counter + " Selected"}
								</Text>
								<Button
									onPress={() => {
										setIsConfirmByManual(false);
										setShowConfirmPopup(true);
									}}
									btnName={"Add"}
									isBtnActive={true}
									btnColor={Colors.secondary}
									btnLabelColor={Colors.white}
								/>
								{/* <Button
								onPress={() => AddUpdateVersion()}
								btnName={"Update Version"}
								isBtnActive={true}
								btnColor={Colors.secondary}
								btnLabelColor={Colors.white}
							/> */}
							</View>
						) : null}
					</>
				)}
				<AddNewContactPanel
					show={showContactPanel}
					onHide={() => setShowContactPanel(false)}
					setShowConfirmPopup={setShowConfirmPopup}
					setIsConfirmByManual={setIsConfirmByManual}
					getContacts={(contacts) => {
						setManualContacts(contacts);
					}}
				/>
			</View>
		</KeyboardAvoidingView>
	);
};

export default AddContactScreen;
