import { View, Text, StatusBar, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icons from "./Icons";
import ComponentStyles from "../styles/ComponentStyles";
import Colors from "../styles/Colors";
import IMAGES from "../assets/images/Images";
import CommonStyles from "../styles/CommonStyles";
import FontFamily from "../assets/fonts/FontFamily";
import { useSelector } from "react-redux";

const DarkHeader = ({
	whiteLabel,
	grayLabel,
	iconName,
	iconSetName,
	iconColor,
	iconSize,
	onPress,
	isLogo,
	DarkHeaderMainStyle,
	props,

	isSubIcon,
	subIconName,
	subIconSetName,
	subIconColor,
	subIconSize,
	onPressSubIcon,
	subIconMainStyle,

	isMsgIcon,
	onPressMsgIcon,
}) => {
	const chatUnreadCount = useSelector((state) => state.Chat?.chatUnreadCount);

	return (
		<View>
			<SafeAreaView style={[ComponentStyles.darkContainer]}>
				<StatusBar
					translucent
					barStyle={"light-content"}
					animated={true}
					backgroundColor={Colors.primary}
					networkActivityIndicatorVisible={true}
				/>
			</SafeAreaView>
			<View style={[ComponentStyles.headerContainer, DarkHeaderMainStyle]}>
				<View style={[CommonStyles.directionRowCenter]}>
					{isMsgIcon ? (
						<TouchableOpacity onPress={onPressMsgIcon}>
							<View style={[ComponentStyles.backArrow]}>
								<Icons
									iconName={"comment-multiple-outline"}
									iconSetName={"MaterialCommunityIcons"}
									iconColor={Colors.backArrowWhite}
									iconSize={24}
								/>
								{chatUnreadCount ? (
									<View style={[ComponentStyles.notiBadge]}>
										<Text style={[ComponentStyles.notiCount]}>
											{chatUnreadCount || 0}
										</Text>
									</View>
								) : null}
							</View>
						</TouchableOpacity>
					) : (
						<TouchableOpacity onPress={onPress}>
							<View style={[ComponentStyles.backArrow]}>
								<Icons
									iconName={iconName}
									iconSetName={iconSetName}
									iconColor={iconColor}
									iconSize={iconSize}
								/>
							</View>
						</TouchableOpacity>
					)}

					{isSubIcon && (
						<TouchableOpacity
							onPress={onPressSubIcon}
							style={{ marginRight: 10 }}
						>
							<Icons
								iconName={subIconName}
								iconSetName={subIconSetName}
								iconColor={subIconColor}
								iconSize={subIconSize}
								iconMainstyle={subIconMainStyle}
							/>
						</TouchableOpacity>
					)}
				</View>
				{isLogo ? (
					<View>
						<Image
							source={IMAGES.appWhiteLogo}
							style={[ComponentStyles.darkLogo]}
						/>
					</View>
				) : (
					<View>
						<View style={[ComponentStyles.labelContainer]}>
							<Text style={[ComponentStyles.headerTextWhite]}>
								{whiteLabel}
							</Text>
							{grayLabel ? (
								<Text style={[ComponentStyles.headerTextGray]}>
									{grayLabel}
								</Text>
							) : null}
						</View>
					</View>
				)}
			</View>
		</View>
	);
};

export default DarkHeader;
