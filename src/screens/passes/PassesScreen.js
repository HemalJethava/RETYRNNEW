import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	ImageBackground,
	ScrollView,
	TouchableOpacity,
	FlatList,
	LayoutAnimation,
} from "react-native";
import { DarkHeader, Icons } from "../../components";
import PassesStyle from "../../styles/PassesStyle";
import LayoutStyle from "../../styles/LayoutStyle";
import Colors from "../../styles/Colors";
import { useDispatch, useSelector } from "react-redux";
import { getPassRequest, getArchivePassRequest } from "./redux/Action";
import CommonStyles from "../../styles/CommonStyles";
import { deviceHeight } from "../../utils/DeviceInfo";
import { startsWithHash } from "../../utils/Validation";
import IMAGES from "../../assets/images/Images";
import ListSkeleton from "../../components/LoaderComponents/ListSkeleton";

const PassesScreen = (props) => {
	const dispatch = useDispatch();

	const isLoading = useSelector((state) => state.Pass.isLoading);
	const passList = useSelector((state) => state.Pass.passList.data);
	const archivePassList = useSelector((state) => state.Pass.archivePassList);
	const employeePass = passList?.personal_passes;
	const ownerPass = passList?.company_passes;
	const emplyeePassCount = employeePass?.length;
	const archivePassCount = archivePassList?.length;
	const ownerPassCount = ownerPass?.length;
	const passCreate = useSelector((state) => state.Pass.passCreate);
	const userData = useSelector((state) => state.Auth.userData);

	const [isExpanded, setIsExpanded] = useState(true);

	useEffect(() => {
		dispatch(getPassRequest(props.navigation));
		dispatch(getArchivePassRequest(props.navigation));
	}, [passCreate]);

	const gotoPassDetails = (passItem) => {
		props.navigation.push("PassDetail", { ID: passItem.id });
	};
	const gotoAddPassScreen = (type) => {
		props.navigation.push("AddPasses", { type: type });
	};
	const renderOwnerPassList = (passItem, index) => {
		return (
			<View key={index} style={{ ...CommonStyles.mainPaddingH }}>
				{index === 0 ? (
					<TouchableOpacity
						style={{ backgroundColor: Colors.primary }}
						onPress={() => gotoPassDetails(passItem)}
					>
						<ImageBackground
							style={[PassesStyle.cardImage, { height: deviceHeight / 10.5 }]}
							source={{ uri: passItem?.background_image?.photo_path }}
							resizeMode="cover"
							borderTopLeftRadius={12}
							borderTopRightRadius={12}
							borderBottomLeftRadius={ownerPassCount > 1 ? 0 : 12}
							borderBottomRightRadius={ownerPassCount > 1 ? 0 : 12}
						>
							<View
								style={[
									PassesStyle.cardContainer,
									{
										height: deviceHeight / 10.5,
										borderTopLeftRadius: 12,
										borderTopRightRadius: 12,
										borderBottomLeftRadius: ownerPassCount > 1 ? 0 : 12,
										borderBottomRightRadius: ownerPassCount > 1 ? 0 : 12,
										backgroundColor: passItem?.code + "DB",
										borderColor: passItem?.code,
									},
								]}
							>
								<Text style={[PassesStyle.cardTitle]}>{passItem?.name}</Text>
							</View>
						</ImageBackground>
					</TouchableOpacity>
				) : (
					<TouchableOpacity
						style={{
							marginTop: -10,
							borderBottomLeftRadius: ownerPassCount - 1 === index ? 12 : 0,
							borderBottomRightRadius: ownerPassCount - 1 === index ? 12 : 0,
							borderTopRightRadius: 12,
							borderTopLeftRadius: 12,
						}}
						onPress={() => gotoPassDetails(passItem)}
					>
						<ImageBackground
							style={[
								PassesStyle.cardImage,
								{
									height:
										ownerPassCount - 1 === index
											? deviceHeight / 10.5
											: deviceHeight / 10,
								},
							]}
							source={{ uri: passItem?.background_image?.photo_path }}
							resizeMode="cover"
							borderBottomLeftRadius={ownerPassCount - 1 === index ? 12 : 0}
							borderBottomRightRadius={ownerPassCount - 1 === index ? 12 : 0}
							borderTopRightRadius={12}
							borderTopLeftRadius={12}
						>
							<View
								style={[
									PassesStyle.cardContainer,
									{
										height:
											ownerPassCount - 1 === index
												? deviceHeight / 10.5
												: deviceHeight / 10,
										borderColor: passItem?.code,
										backgroundColor: passItem?.code + "E6",
										borderTopLeftRadius: 12,
										borderTopRightRadius: 12,
										borderBottomLeftRadius:
											ownerPassCount - 1 === index ? 12 : 0,
										borderBottomRightRadius:
											ownerPassCount - 1 === index ? 12 : 0,
									},
								]}
							>
								<Text style={[PassesStyle.cardTitle]}>{passItem?.name}</Text>
							</View>
						</ImageBackground>
					</TouchableOpacity>
				)}
			</View>
		);
	};
	const renderEmplyeePassList = (passItem, index) => {
		return (
			<View key={index} style={{ ...CommonStyles.mainPaddingH }}>
				{index === 0 ? (
					<TouchableOpacity
						style={{ backgroundColor: Colors.primary }}
						onPress={() => gotoPassDetails(passItem)}
					>
						<ImageBackground
							style={[PassesStyle.cardImage, { height: deviceHeight / 10 }]}
							source={{ uri: passItem?.background_image?.photo_path }}
							resizeMode="cover"
							borderTopLeftRadius={12}
							borderTopRightRadius={12}
							borderBottomLeftRadius={emplyeePassCount > 1 ? 0 : 12}
							borderBottomRightRadius={emplyeePassCount > 1 ? 0 : 12}
						>
							<View
								style={[
									PassesStyle.cardContainer,
									{
										height: deviceHeight / 10,
										borderTopLeftRadius: 12,
										borderTopRightRadius: 12,
										borderBottomLeftRadius: emplyeePassCount > 1 ? 0 : 12,
										borderBottomRightRadius: emplyeePassCount > 1 ? 0 : 12,
										backgroundColor: passItem?.code + "DB",
										borderColor: passItem?.code,
									},
								]}
							>
								<Text style={[PassesStyle.cardTitle]}>{passItem?.name}</Text>
							</View>
						</ImageBackground>
					</TouchableOpacity>
				) : (
					<TouchableOpacity
						style={{
							marginTop: -10,
							borderBottomLeftRadius: emplyeePassCount - 1 === index ? 12 : 0,
							borderBottomRightRadius: emplyeePassCount - 1 === index ? 12 : 0,
							borderTopRightRadius: 12,
							borderTopLeftRadius: 12,
							borderColor: passItem?.code,
						}}
						onPress={() => gotoPassDetails(passItem)}
					>
						<ImageBackground
							style={[
								PassesStyle.cardImage,
								{
									height:
										emplyeePassCount - 1 === index
											? deviceHeight / 10.5
											: deviceHeight / 10,
								},
							]}
							source={{ uri: passItem?.background_image?.photo_path }}
							resizeMode="cover"
							borderBottomLeftRadius={emplyeePassCount - 1 === index ? 12 : 0}
							borderBottomRightRadius={emplyeePassCount - 1 === index ? 12 : 0}
							borderTopRightRadius={12}
							borderTopLeftRadius={12}
						>
							<View
								style={[
									PassesStyle.cardContainer,
									{
										height:
											emplyeePassCount - 1 === index
												? deviceHeight / 10.5
												: deviceHeight / 10,
										backgroundColor: passItem?.code + "E6",
										borderColor: passItem?.code,
										borderTopLeftRadius: 12,
										borderTopRightRadius: 12,
										borderBottomLeftRadius:
											emplyeePassCount - 1 === index ? 12 : 0,
										borderBottomRightRadius:
											emplyeePassCount - 1 === index ? 12 : 0,
									},
								]}
							>
								<Text style={[PassesStyle.cardTitle]}>{passItem?.name}</Text>
							</View>
						</ImageBackground>
					</TouchableOpacity>
				)}
			</View>
		);
	};
	const renderArchivePassList = (passItem, index) => {
		return (
			<View key={index} style={{ ...CommonStyles.mainPaddingH }}>
				{index === 0 ? (
					<TouchableOpacity
						style={{ backgroundColor: Colors.primary }}
						onPress={() => gotoPassDetails(passItem)}
					>
						<ImageBackground
							style={[PassesStyle.cardImage, { height: deviceHeight / 10 }]}
							source={
								passItem?.background_image?.photo_path
									? { uri: passItem?.background_image?.photo_path }
									: IMAGES.companyBG
							}
							resizeMode="cover"
							borderTopLeftRadius={12}
							borderTopRightRadius={12}
							borderBottomLeftRadius={archivePassCount > 1 ? 0 : 12}
							borderBottomRightRadius={archivePassCount > 1 ? 0 : 12}
						>
							<View
								style={[
									PassesStyle.cardContainer,
									{
										height: deviceHeight / 10,
										borderTopLeftRadius: 12,
										borderTopRightRadius: 12,
										borderBottomLeftRadius: archivePassCount > 1 ? 0 : 12,
										borderBottomRightRadius: archivePassCount > 1 ? 0 : 12,
										backgroundColor:
											passItem?.code && startsWithHash(passItem?.code)
												? passItem?.code + `DB`
												: Colors.transparent,
										borderColor:
											passItem?.code && startsWithHash(passItem?.code)
												? passItem?.code
												: Colors.transparent,
									},
								]}
							>
								<Text style={[PassesStyle.cardTitle]}>{passItem?.name}</Text>
							</View>
						</ImageBackground>
					</TouchableOpacity>
				) : (
					<TouchableOpacity
						style={{
							marginTop: -10,
							borderBottomLeftRadius: archivePassCount - 1 === index ? 12 : 0,
							borderBottomRightRadius: archivePassCount - 1 === index ? 12 : 0,
							borderTopRightRadius: 12,
							borderTopLeftRadius: 12,
							borderColor:
								passItem?.code && startsWithHash(passItem?.code)
									? passItem?.code
									: Colors.transparent,
						}}
						onPress={() => gotoPassDetails(passItem)}
					>
						<ImageBackground
							style={[
								PassesStyle.cardImage,
								{
									height:
										archivePassCount - 1 === index
											? deviceHeight / 10.5
											: deviceHeight / 10,
								},
							]}
							source={
								passItem?.background_image?.photo_path
									? { uri: passItem?.background_image?.photo_path }
									: IMAGES.companyBG
							}
							resizeMode="cover"
							borderBottomLeftRadius={archivePassCount - 1 === index ? 12 : 0}
							borderBottomRightRadius={archivePassCount - 1 === index ? 12 : 0}
							borderTopRightRadius={12}
							borderTopLeftRadius={12}
						>
							<View
								style={[
									PassesStyle.cardContainer,
									{
										height:
											archivePassCount - 1 === index
												? deviceHeight / 10.5
												: deviceHeight / 10,
										backgroundColor:
											passItem?.code && startsWithHash(passItem?.code)
												? passItem?.code + "E6"
												: Colors.transparent,
										borderColor:
											passItem?.code && startsWithHash(passItem?.code)
												? passItem?.code
												: Colors.transparent,
										borderTopLeftRadius: 12,
										borderTopRightRadius: 12,
										borderBottomLeftRadius:
											archivePassCount - 1 === index ? 12 : 0,
										borderBottomRightRadius:
											archivePassCount - 1 === index ? 12 : 0,
									},
								]}
							>
								<Text style={[PassesStyle.cardTitle]}>{passItem?.name}</Text>
							</View>
						</ImageBackground>
					</TouchableOpacity>
				)}
			</View>
		);
	};
	const gotoCompanyDetails = () => {
		props.navigation.navigate("CompanyDetail");
	};
	const gotoChatScreen = () => {
		props.navigation.navigate("Chats");
	};
	const toggleExpandCollapse = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setIsExpanded(!isExpanded);
	};
	const RenderEmptyList = ({ type }) => (
		<View style={[CommonStyles.emptyListContainer, { padding: 0 }]}>
			<Text style={[CommonStyles.emptyTitle, { color: Colors.white }]}>
				{"No Pass Found!"}
			</Text>
			<Text
				style={[
					CommonStyles.emptyDescription,
					{ color: Colors.white, marginBottom: 0 },
				]}
			>
				{type == "personal"
					? `No Pass found, Please add new pass.`
					: userData.user_type === 3 && type == "company"
					? "No Pass found, Please add new pass."
					: ""}
			</Text>
		</View>
	);

	return (
		<>
			<View style={[PassesStyle.mainContainer, PassesStyle.backgroundDarkBlue]}>
				<DarkHeader
					whiteLabel={"Passes"}
					DarkHeaderMainStyle={[LayoutStyle.paddingTop30]}
					isMsgIcon={true}
					onPressMsgIcon={() => gotoChatScreen()}
				/>
				<ScrollView showsVerticalScrollIndicator={false}>
					<View>
						<View style={[PassesStyle.passMainText]}>
							<View style={[PassesStyle.PassTextContainer]}>
								<Text style={[PassesStyle.passTextCompnay]}>{"Company"}</Text>
							</View>
							{userData.user_type === 3 && (
								<TouchableOpacity onPress={() => gotoAddPassScreen("company")}>
									<Icons
										iconColor={Colors.white}
										iconSetName={"MaterialCommunityIcons"}
										iconName={"plus"}
										iconSize={22}
									/>
								</TouchableOpacity>
							)}
						</View>
						<View style={{ ...LayoutStyle.paddingBottom30 }}>
							{isLoading ? (
								<FlatList
									style={{ ...CommonStyles.emptyList }}
									data={Array(2).fill(0)}
									keyExtractor={(item, index) =>
										`skeleton1-${index.toString()}`
									}
									renderItem={({ item, index }) => (
										<View key={index}>
											<ListSkeleton backgroundColor={Colors.inputfillBG} />
										</View>
									)}
									scrollEnabled={false}
								/>
							) : (
								<FlatList
									data={ownerPass}
									renderItem={({ item: passListItem, index }) =>
										renderOwnerPassList(passListItem, index)
									}
									scrollEnabled={false}
									ListEmptyComponent={() => (
										<RenderEmptyList type={"company"} />
									)}
									keyExtractor={(item, index) => `owner-${index.toString()}`}
								/>
							)}
						</View>
						<View style={{ ...LayoutStyle.paddingBottom30 }}>
							<View style={[PassesStyle.passMainText]}>
								<Text style={[PassesStyle.passTextCompnay]}>{"Personal"}</Text>
								<TouchableOpacity onPress={() => gotoAddPassScreen("personal")}>
									<Icons
										iconColor={Colors.white}
										iconSetName={"MaterialCommunityIcons"}
										iconName={"plus"}
										iconSize={22}
									/>
								</TouchableOpacity>
							</View>
							{isLoading ? (
								<FlatList
									style={{ ...CommonStyles.emptyList }}
									data={Array(2).fill(0)}
									keyExtractor={(item, index) => `skeleton2-${index}`}
									renderItem={({ item, index }) => (
										<View key={index}>
											<ListSkeleton backgroundColor={Colors.inputfillBG} />
										</View>
									)}
									scrollEnabled={false}
								/>
							) : (
								<FlatList
									data={employeePass}
									renderItem={({ item: passListItem, index }) =>
										renderEmplyeePassList(passListItem, index)
									}
									scrollEnabled={false}
									ListEmptyComponent={() => (
										<RenderEmptyList type={"personal"} />
									)}
									keyExtractor={(item, index) => `personal-${index}`}
								/>
							)}
						</View>
						<View style={{ ...LayoutStyle.paddingBottom30 }}>
							<View style={[PassesStyle.passMainText]}>
								<Text style={[PassesStyle.passTextCompnay]}>
									{"Archived Passes"}
								</Text>
								{archivePassList.length > 0 && (
									<TouchableOpacity onPress={toggleExpandCollapse}>
										<Icons
											iconColor={Colors.white}
											iconSetName={"MaterialCommunityIcons"}
											iconName={isExpanded ? "chevron-up" : "chevron-down"}
											iconSize={22}
										/>
									</TouchableOpacity>
								)}
							</View>
							{isLoading ? (
								<FlatList
									style={{ ...CommonStyles.emptyList }}
									data={Array(2).fill(0)}
									keyExtractor={(item, index) => `skeleton3-${index}`}
									renderItem={({ item, index }) => (
										<View key={index}>
											<ListSkeleton backgroundColor={Colors.inputfillBG} />
										</View>
									)}
									scrollEnabled={false}
								/>
							) : (
								<>
									{isExpanded && (
										<FlatList
											data={archivePassList}
											renderItem={({ item: passListItem, index }) =>
												renderArchivePassList(passListItem, index)
											}
											scrollEnabled={false}
											ListEmptyComponent={() => (
												<RenderEmptyList type={"archived"} />
											)}
											keyExtractor={(item, index) =>
												`archive-${index.toString()}`
											}
										/>
									)}
								</>
							)}
						</View>
					</View>
				</ScrollView>
			</View>
		</>
	);
};

export default PassesScreen;
