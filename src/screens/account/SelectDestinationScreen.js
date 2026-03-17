import { View, Text, TouchableOpacity, Linking, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { Button, Icons, LightHeader, Loader } from "../../components";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";
import { FlatList } from "react-native";
import WashingtonFilled from "../../assets/images/svg/washingtonfilled.svg";
import Api from "../../utils/Api";
import CommonStyles from "../../styles/CommonStyles";
import IMAGES from "../../assets/images/Images";
import { hapticVibrate } from "../../config/CommonFunctions";

const SelectDestinationScreen = (props) => {
	const { shareUser } = props.route.params;

	const [isLoading, setIsLoading] = useState(false);
	const [destinationList, setDestinationList] = useState([]);
	const [selectedItem, setSelectedItem] = useState(null);

	useEffect(() => {
		getDestionationList();
	}, []);

	const getDestionationList = async () => {
		try {
			setIsLoading(true);
			const response = await Api.get(`user/get-saved-destinations`);
			if (response.data.length > 0) {
				setIsLoading(false);
				const blankNameLocationArray = response.data.filter(
					(item) => item.name !== null
				);

				setDestinationList(blankNameLocationArray);
			} else {
				setIsLoading(false);
			}
		} catch (error) {
			setIsLoading(false);
			console.warn(error);
		}
	};
	const onPressSelect = (item) => {
		if (selectedItem && selectedItem.id === item.id) {
			setSelectedItem(null);
		} else {
			setSelectedItem(item);
			hapticVibrate();
		}
	};
	const renderDestination = (item) => {
		console.log("item: ", item);

		return (
			<View
				style={{
					paddingHorizontal: 20,
					backgroundColor:
						selectedItem?.id === item?.id
							? Colors.highlightSelected
							: Colors.white,
				}}
			>
				<TouchableOpacity style={[AccountStyle.listContainer]}>
					<View style={[AccountStyle.svgTextContain, { width: "85%" }]}>
						<View style={[AccountStyle.cityBG]}>
							<WashingtonFilled width={40} height={45} />
						</View>
						<View style={{ width: "85%" }}>
							<Text style={[AccountStyle.destinationLabel]}>
								{item?.name ? item?.name : ""}
							</Text>
							<Text style={[AccountStyle.destinationValue]}>
								{item?.destination_location_name
									? item?.destination_location_name
									: ""}
							</Text>
						</View>
					</View>
					<TouchableOpacity onPress={() => onPressSelect(item)}>
						<View style={[AccountStyle.actionIcon]}>
							<Icons
								iconName={
									selectedItem?.id === item?.id
										? "checkbox-marked-circle-outline"
										: "checkbox-blank-circle-outline"
								}
								iconSetName={"MaterialCommunityIcons"}
								iconColor={Colors.secondary}
								iconSize={20}
							/>
						</View>
					</TouchableOpacity>
				</TouchableOpacity>
				<View style={[AccountStyle.borderBottomGray]}></View>
			</View>
		);
	};
	const gotoBack = () => {
		props.navigation.goBack();
	};
	const sendSMSWithShortURL = async (
		phoneNumber,
		originLatitude,
		originLongitude,
		destinationLatitude,
		destinationLongitude
	) => {
		const url = `https://www.google.com/maps/dir/?api=1&origin=${originLatitude},${originLongitude}&destination=${destinationLatitude},${destinationLongitude}`;

		try {
			const response = await fetch(
				`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
			);
			const shortUrl = await response.text();

			const smsBody = `Check this route: ${shortUrl}`;
			Linking.openURL(`sms:${phoneNumber}?body=${encodeURIComponent(smsBody)}`);
		} catch (error) {
			console.error("Error shortening URL: ", error);
		}
	};
	const onPressShare = () => {
		const phoneNumber = shareUser.mobile;
		const originLatitude = selectedItem?.origin_latitude;
		const originLongitude = selectedItem?.origin_longitude;
		const destinationLatitude = selectedItem?.destination_latitude;
		const destinationLongitude = selectedItem?.destination_longitude;

		sendSMSWithShortURL(
			phoneNumber,
			originLatitude,
			originLongitude,
			destinationLatitude,
			destinationLongitude
		);
	};
	const RenderEmptyList = () => (
		<View style={[CommonStyles.emptyListContainer]}>
			<Image
				style={[CommonStyles.emptyImg, { marginTop: "40%" }]}
				source={IMAGES.NoDestination}
				resizeMode={"contain"}
			/>

			<Text style={CommonStyles.emptyTitle}>{"No Destination Found!"}</Text>
			<Text style={[CommonStyles.emptyDescription, { marginBottom: 0 }]}>
				{"No destination found, Please try again later."}
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
					headerText={"Select destination"}
					headerBG={Colors.lightGrayBG}
					statusBG={Colors.lightGrayBG}
					onPress={() => gotoBack()}
				/>
				{!isLoading && (
					<View
						style={[
							AccountStyle.listPaddingDestination,
							{ flex: 1, paddingHorizontal: 0 },
						]}
					>
						<FlatList
							data={destinationList}
							renderItem={({ item: destinationItem }) =>
								renderDestination(destinationItem)
							}
							ListEmptyComponent={() => <RenderEmptyList />}
							scrollEnabled={false}
							keyExtractor={(item) => item.id}
						/>
						{selectedItem && (
							<View style={AccountStyle.deleteContainer}>
								<Button
									onPress={() => onPressShare()}
									btnName={`Share Destination`}
									isBtnActive={true}
									btnColor={Colors.secondary}
									btnLabelColor={Colors.white}
								/>
							</View>
						)}
					</View>
				)}
			</View>
		</>
	);
};

export default SelectDestinationScreen;
