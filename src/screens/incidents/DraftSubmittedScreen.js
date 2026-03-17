import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Button } from "../../components";
import IncidentStyle from "../../styles/IncidentStyles";
import Colors from "../../styles/Colors";
import IMAGES from "../../assets/images/Images";
import { deviceHeight, deviceWidth } from "../../utils/DeviceInfo";
import { CommonActions } from "@react-navigation/native";
import LayoutStyle from "../../styles/LayoutStyle";

const DraftSubmittedScreen = (props) => {
	const gotoHomeScreen = () => {
		props.navigation.dispatch(
			CommonActions.reset({
				index: 0,
				routes: [{ name: "Tab" }],
			})
		);
	};
	const gotoIncidentScreen = () => {
		props.navigation.dispatch(
			CommonActions.reset({
				index: 0,
				routes: [
					{
						name: "Tab",
						params: {
							screen: "Incident",
							params: { fromNavigation: true },
						},
					},
				],
			})
		);
	};
	return (
		<View style={{ flex: 1, backgroundColor: Colors.primary }}>
			<View style={[IncidentStyle.submittedTitleBox]}>
				<Text style={[IncidentStyle.bigTitle, { ...LayoutStyle.fontSize14 }]}>
					{"Your claim has been saved as draft!"}
				</Text>

				<View style={{ marginTop: 50, ...LayoutStyle.marginBottom20 }}>
					<Text style={[IncidentStyle.smallLabel]}>
						{"You can check the progress in the"}
					</Text>
					<TouchableOpacity onPress={() => gotoIncidentScreen()}>
						<Text
							style={[IncidentStyle.smallLabel, { color: Colors.secondary }]}
						>
							{"Incidents Tab"}
						</Text>
					</TouchableOpacity>
				</View>
				<Button
					onPress={() => gotoHomeScreen()}
					btnLabelColor={Colors.white}
					btnColor={Colors.secondary}
					btnName={"Retyrn"}
					isBtnActive={true}
				/>
			</View>

			<View
				style={{
					justifyContent: "flex-end",
					position: "relative",
					flex: 1,
				}}
			>
				<Image
					style={{
						height: deviceHeight / 2,
						width: deviceWidth + 20,
						resizeMode: "contain",
						transform: [{ rotate: "15deg" }],
						position: "absolute",
						bottom: -50,
						left: "-6%",
						opacity: 0.6,
						tintColor: Colors.darkBGColor,
					}}
					source={IMAGES.appWhiteLogo}
				/>
			</View>
		</View>
	);
};

export default DraftSubmittedScreen;
