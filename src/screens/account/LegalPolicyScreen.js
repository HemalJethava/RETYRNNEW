import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Button, LightHeader, TextIcon } from "../../components";
import LayoutStyle from "../../styles/LayoutStyle";
import AccountStyle from "../../styles/AccountStyle";
import Colors from "../../styles/Colors";

const LegalPolicyScreen = (props) => {
	const legalData = {
		id: 1,
		whiteLabel: "Lagel",
		grayLabel: "Privacy Policy",
		aliasName: "Copyright",
		legalDate: "Last Updated August 1st",
		description:
			"This Legal Terms (“Terms”) is between you and Retyrn, and outlines the terms related to your use of the application (“Application”) provided to you by Retyrn. This is a non-transferrable license to use the Application on any iOS mobile device you own or control, as permitted by the Apple Media Services Terms and Conditions and the Volume Content Terms. \n This Legal Privacy Policy (“Policy”) is between you and Retyrn, and outlines the terms related to your use of the application (“Application”) provided to you by Retyrn. This is a non-transferrable license to use the Application on any iOS mobile device you own or control, as permitted by the Apple Media Services Terms and Conditions and the Volume Content Terms. This Legal Privacy Policy (“Policy”) is between you and Retyrn, and outlines the terms related to your use of the application (“Application”) provided to you by Retyrn. This is a non-transferrable license to use the Application on any iOS mobile device you own or control, as permitted by the Apple Media Services Terms and Conditions and the Volume Content Terms.",
	};

	const gotoBack = () => {
		props.navigation.goBack();
	};
	const gotoLegalDataScreen = () => {
		props.navigation.navigate("LegalDescription", {
			legalData: legalData?.aliasName,
		});
	};
	const onPressNotification = () => {
		props.navigation.navigate("LocationPermission");
	};
	const gotoNotifPermissionScreen = () => {
		props.navigation.navigate("NotifPermission");
	};
	const gotoDataShareScreen = () => {
		props.navigation.navigate("DataShare");
	};

	return (
		<>
			<View style={[AccountStyle.mainContainer, AccountStyle.backgroundWhite]}>
				<LightHeader
					isLogo={false}
					isBackIcon={true}
					iconName={"angle-left"}
					iconSize={24}
					iconSetName={"FontAwesome6"}
					iconColor={Colors.backArrowBlack}
					headerText={"Legal Privacy Policy"}
					headerBG={Colors.lightGrayBG}
					statusBG={Colors.lightGrayBG}
					onPress={() => gotoBack()}
				/>
				<View style={[AccountStyle.securityMainContainer]}>
					<Text style={[AccountStyle.policyTitle]}>
						{"Take control of your privacy and learn how we protect it."}
					</Text>
					<View style={{ ...LayoutStyle.marginVertical20 }}>
						<Button
							onPress={() => gotoLegalDataScreen()}
							isBtnActive={true}
							btnLabelColor={Colors.white}
							btnName={"View Policy"}
							btnColor={Colors.secondary}
						/>
					</View>
				</View>
				<View style={{ ...LayoutStyle.padding20 }}>
					<View
						style={[
							AccountStyle.borderBottomGrayLoop,
							{ ...LayoutStyle.paddingBottom20 },
						]}
					>
						<TouchableOpacity onPress={() => onPressNotification()}>
							<TextIcon
								textIconMainStyle={[AccountStyle.optionContainer]}
								textName={"Location"}
								textColor={Colors.labelBlack}
								iconColor={Colors.iconBlack}
								iconName={"map-marker-outline"}
								iconSetName={"MaterialCommunityIcons"}
								iconSize={24}
								textStyle={[AccountStyle.optionsLabel]}
							/>
						</TouchableOpacity>
					</View>
					<View
						style={[
							AccountStyle.borderBottomGrayLoop,
							{ ...LayoutStyle.paddingBottom20 },
						]}
					>
						<TouchableOpacity onPress={() => gotoNotifPermissionScreen()}>
							<TextIcon
								textIconMainStyle={[AccountStyle.optionContainer]}
								textName={"Notification"}
								textColor={Colors.labelBlack}
								iconColor={Colors.iconBlack}
								iconName={"bell-outline"}
								iconSetName={"MaterialCommunityIcons"}
								iconSize={24}
								textStyle={[AccountStyle.optionsLabel]}
							/>
						</TouchableOpacity>
					</View>
					<View
						style={[
							AccountStyle.borderBottomGrayLoop,
							{ ...LayoutStyle.paddingBottom20 },
						]}
					>
						<TouchableOpacity onPress={() => gotoDataShareScreen()}>
							<TextIcon
								textIconMainStyle={[AccountStyle.optionContainer]}
								textName={"Emergency Data Sharing"}
								textColor={Colors.labelBlack}
								iconColor={Colors.iconBlack}
								iconName={"flash-outline"}
								iconSetName={"Ionicons"}
								iconSize={24}
								textStyle={[AccountStyle.optionsLabel]}
							/>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</>
	);
};

export default LegalPolicyScreen;
