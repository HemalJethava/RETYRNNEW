import { View, StatusBar, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native-gesture-handler";
import FastImage from "react-native-fast-image";
import Icons from "./Icons";
import ComponentStyles from "../styles/ComponentStyles";
import IMAGES from "../assets/images/Images";
import Colors from "../styles/Colors";

const LightHeader = ({
	isLogo,
	isSmallText,
	smallLabel,
	headerText,
	headerBG,
	headerTextColor,
	statusBG,
	isBackIcon,
	iconName,
	iconSetName,
	iconColor,
	iconSize,
	onPress,
}) => {
	return (
		<View>
			<SafeAreaView
				style={[ComponentStyles.lightContainer, { backgroundColor: statusBG }]}
			>
				<StatusBar
					translucent
					barStyle={"dark-content"}
					animated={true}
					backgroundColor={statusBG}
					networkActivityIndicatorVisible={true}
				/>
			</SafeAreaView>
			<View
				style={[
					ComponentStyles.lightHeaderContainer,
					{ backgroundColor: headerBG },
				]}
			>
				<TouchableOpacity onPress={isBackIcon ? onPress : null}>
					<View style={[ComponentStyles.backArrow]}>
						<Icons
							iconName={iconName}
							iconSetName={iconSetName}
							iconColor={isBackIcon ? iconColor : Colors.iconBlack}
							iconSize={iconSize}
						/>
					</View>
				</TouchableOpacity>
				{isLogo ? (
					<FastImage
						style={[ComponentStyles.headerSmallLogo]}
						source={IMAGES.appLogo}
						resizeMode={FastImage.resizeMode.contain}
					/>
				) : (
					<View>
						<Text
							style={[
								ComponentStyles.lightHeaderText,
								{
									color: headerTextColor ? headerTextColor : Colors.labelBlack,
								},
							]}
						>
							{headerText}
						</Text>
						{isSmallText && (
							<Text style={[ComponentStyles.headerSmallText]}>
								{smallLabel}
							</Text>
						)}
					</View>
				)}
			</View>
		</View>
	);
};

export default LightHeader;
