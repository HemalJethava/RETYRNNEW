import {
	View,
	Text,
	SafeAreaView,
	StatusBar,
	FlatList,
	TouchableOpacity,
} from "react-native";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPolicyRequest } from "./redux/Action";
import { Icons, Loader } from "../../components";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";

const LegalScreen = (props) => {
	const dispatch = useDispatch();

	const policyData = useSelector((state) => state.Account);
	const isLoading = policyData.isLoading;

	useEffect(() => {
		(async () => {
			dispatch(getPolicyRequest(props.navigation));
		})();
	}, []);

	const gotoBack = () => {
		props.navigation.goBack();
	};
	const gotoLegalDataScreen = (legalData) => {
		props.navigation.navigate("LegalDescription", {
			legalData: legalData.slug,
		});
	};
	const renderLegalList = (item) => {
		return (
			<View style={[AccountStyle.legalLsitContainer]}>
				<TouchableOpacity onPress={() => gotoLegalDataScreen(item)}>
					<Text style={[AccountStyle.legalLsitText]}>{item.page_title}</Text>
				</TouchableOpacity>
			</View>
		);
	};

	return (
		<>
			<Loader show={isLoading} />
			<View style={[AccountStyle.mainContainer]}>
				<SafeAreaView style={[AccountStyle.safetyStatusBar]}>
					<StatusBar
						translucent
						barStyle={"dark-content"}
						animated={true}
						backgroundColor={Colors.lightGrayBG}
						networkActivityIndicatorVisible={true}
					/>
				</SafeAreaView>
				<View style={[AccountStyle.safetyheaderBar]}>
					<TouchableOpacity onPress={() => gotoBack()}>
						<View style={[AccountStyle.leftIcon]}>
							<Icons
								iconName={"angle-left"}
								iconSetName={"FontAwesome6"}
								iconColor={Colors.backArrowBlack}
								iconSize={24}
							/>
						</View>
					</TouchableOpacity>
					<Text style={[AccountStyle.safetyHeaderText]}>{"Legal"}</Text>
					<View>
						<Icons
							iconName={"arrow-up-from-bracket"}
							iconSetName={"FontAwesome6"}
							iconColor={Colors.lightGrayBG}
							iconSize={20}
						/>
					</View>
				</View>
				<View style={[AccountStyle.legalListStyle, AccountStyle.mainContainer]}>
					<FlatList
						data={policyData.LegalList}
						renderItem={({ item: LegalItem }) => renderLegalList(LegalItem)}
						scrollEnabled={false}
						keyExtractor={(item) => item.id}
					/>
				</View>
			</View>
		</>
	);
};

export default LegalScreen;
