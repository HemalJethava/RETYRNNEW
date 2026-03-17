import {
	View,
	Text,
	StatusBar,
	ScrollView,
	TouchableOpacity,
	SafeAreaView,
	Platform,
	Animated,
	Easing,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { Button, Icons, KeyValue } from "../../components";
import LayoutStyle from "../../styles/LayoutStyle";
import IncidentStyle from "../../styles/IncidentStyles";
import Colors from "../../styles/Colors";

const ReimbursementScreen = (props) => {
	const animatedWidth = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		animatedWidth.stopAnimation();
		Animated.timing(animatedWidth, {
			toValue: Math.min(100, 100),
			duration: 800,
			easing: Easing.inOut(Easing.ease),
			useNativeDriver: false,
		}).start();
	}, []);

	const widthInterpolate = animatedWidth.interpolate({
		inputRange: [0, 100],
		outputRange: ["0%", "100%"],
	});

	const gotoBack = () => {
		props.navigation.goBack();
	};
	const gotoIncidentScreen = () => {
		props.navigation.navigate("IncidentList");
	};

	return (
		<View style={[IncidentStyle.mainContainer]}>
			<SafeAreaView style={[IncidentStyle.darkContainer]}>
				<StatusBar
					translucent
					barStyle={"dark-content"}
					animated={true}
					backgroundColor={Colors.primaryBG20}
					networkActivityIndicatorVisible={true}
				/>
			</SafeAreaView>
			<View
				style={[
					IncidentStyle.headerContainer,
					{
						paddingTop:
							Platform.OS === "ios" ? StatusBar.currentHeight + 20 : 0,
					},
				]}
			>
				<TouchableOpacity onPress={() => gotoBack()}>
					<View style={[IncidentStyle.backArrow]}>
						<Icons
							iconName={"angle-left"}
							iconSetName={"FontAwesome6"}
							iconColor={Colors.backArrowBlack}
							iconSize={24}
						/>
					</View>
				</TouchableOpacity>
				<View style={{ ...LayoutStyle.paddingTop10 }}>
					<Text style={[IncidentStyle.headerTextBlack]}>{"Reimbursement"}</Text>
					<Text style={[IncidentStyle.headerSmallText]}>{"09/02/2022"}</Text>
				</View>
			</View>
			<View style={[IncidentStyle.tabBarContainer]}>
				<View style={[IncidentStyle.darkTabview]}>
					<View style={[IncidentStyle.darkLayout]}>
						<Animated.View
							style={[
								IncidentStyle.animReimbursement,
								{ width: widthInterpolate },
							]}
						/>

						<Text style={[IncidentStyle.totalLabel]}>
							{"Total Reimbursement"}
						</Text>
					</View>
					<View style={[IncidentStyle.lightLayout]}>
						<Text style={[IncidentStyle.totalPriceText]}>{"$280.00"}</Text>
					</View>
				</View>
			</View>
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{
					flexGrow: 1,
					flexDirection: "column",
					justifyContent: "space-between",
				}}
			>
				<View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 10 }}>
					<Text style={[IncidentStyle.detailsLabel]}>{"Details"}</Text>

					<KeyValue
						keyLabel={"Vehicle"}
						valueLabel={"2022 LR Electric"}
						keyColor={Colors.labelBlack}
					/>

					<KeyValue
						keyLabel={"Driver"}
						valueLabel={"John Doe"}
						keyColor={Colors.labelBlack}
					/>

					<KeyValue
						keyLabel={"Retyrn Claim ID"}
						valueLabel={"#123456789"}
						keyColor={Colors.labelBlack}
					/>

					<KeyValue
						keyLabel={"Incident"}
						valueLabel={"Glass Only"}
						keyColor={Colors.labelBlack}
					/>

					<KeyValue
						keyLabel={"Date Submitted"}
						valueLabel={"08/31/2022"}
						keyColor={Colors.labelBlack}
					/>

					<KeyValue
						keyLabel={"Status"}
						valueLabel={"Pending"}
						keyColor={Colors.labelBlack}
					/>
				</View>
				<View style={[IncidentStyle.continueDraft, { paddingVertical: 20 }]}>
					<Button
						onPress={() => gotoIncidentScreen()}
						btnColor={Colors.secondary}
						isBtnActive={true}
						btnLabelColor={Colors.white}
						btnName={"Submit"}
					/>
				</View>
			</ScrollView>
		</View>
	);
};

export default ReimbursementScreen;
