import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Icons, RadioButton } from ".";
import Colors from "../styles/Colors";
import IncidentStyle from "../styles/IncidentStyles";
import FastImage from "react-native-fast-image";
import IMAGES from "../assets/images/Images";

const ImageOptions = ({
	keyIndex,
	isSelected,
	optionLabel,
	imageName,
	onPress,
}) => {
	return (
		<TouchableOpacity key={keyIndex} onPress={onPress}>
			<Text style={[IncidentStyle.imgTextPaddingTop]}>{optionLabel}</Text>
			<View style={[IncidentStyle.carImgRadio]}>
				<View style={[IncidentStyle.mainFlex94]}>
					<FastImage
						style={[IncidentStyle.carFrontImg]}
						source={
							imageName === "car-front"
								? IMAGES.carFront
								: imageName === "car-back"
								? IMAGES.carBack
								: IMAGES.carMiddle
						}
						resizeMode={FastImage.resizeMode.contain}
					/>
				</View>
				{isSelected ? (
					<Icons
						iconName={"circle-dot"}
						iconSetName={"FontAwesome6"}
						iconColor={Colors.secondary}
						iconSize={18}
					/>
				) : (
					<Icons
						iconName={"circle-thin"}
						iconSetName={"FontAwesome"}
						iconColor={Colors.secondary}
						iconSize={20}
					/>
				)}
			</View>
		</TouchableOpacity>
	);
};

export default ImageOptions;
