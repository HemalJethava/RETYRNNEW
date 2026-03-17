import React from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { Overlay } from "../components";
import IMAGES from "../assets/images/Images";
import NoInternetStyle from "../styles/NoInternetStyle";
import Colors from "../styles/Colors";

export const NoInternetPopup = ({ show, onHide, onPressAgain, isTryAgain }) => {
	const onRequestClose = () => {
		onHide();
	};

	return (
		<Overlay visible={show}>
			<View style={NoInternetStyle.mainContainer}>
				<Image
					source={IMAGES.NoInternet}
					style={{ height: 80, width: "100%" }}
					resizeMode="contain"
				/>

				<View style={NoInternetStyle.textContainer}>
					<Text style={NoInternetStyle.title}>{"Lost Connection"}</Text>
					<Text style={NoInternetStyle.discription}>
						{
							"Whoops, no internet connection found. please check your connection"
						}
					</Text>
					<TouchableOpacity
						style={NoInternetStyle.againBtn}
						onPress={onPressAgain}
						disabled={isTryAgain}
					>
						{isTryAgain && <ActivityIndicator size={22} color={Colors.white} />}
						<Text
							style={[
								NoInternetStyle.againText,
								isTryAgain ? { opacity: 0.8, marginLeft: 5 } : null,
							]}
						>
							{"Try Again"}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Overlay>
	);
};
