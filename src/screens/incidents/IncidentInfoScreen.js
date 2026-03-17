import { View, Text, ScrollView } from "react-native";
import React from "react";
import { useSelector } from "react-redux";
import { Button, LightHeader, Loader } from "../../components";
import LayoutStyle from "../../styles/LayoutStyle";
import IncidentStyle from "../../styles/IncidentStyles";
import Colors from "../../styles/Colors";

const AddIncidentScreen = (props) => {
	const isLoading = useSelector((state) => state.Incident.isLoading);

	const gotoBack = () => {
		props.navigation.goBack();
	};
	const gotoIncidentListScreen = () => {
		props.navigation.navigate("IncidentList");
	};
	const gotoIncidentManualEntry = () => {
		props.navigation.navigate("ClaimTalkInfo");
	};

	return (
		<>
			<Loader show={isLoading} />
			<View style={[IncidentStyle.mainContainer]}>
				<LightHeader
					isLogo={false}
					isBackIcon={true}
					iconName={"angle-left"}
					iconSize={24}
					iconSetName={"FontAwesome6"}
					iconColor={Colors.backArrowBlack}
					headerText={"What is in store…"}
					headerBG={Colors.lightGrayBG}
					statusBG={Colors.lightGrayBG}
					onPress={() => gotoBack()}
				/>
				<ScrollView
					showsVerticalScrollIndicator={false}
					enableOnAndroid={true}
					contentContainerStyle={{ flexGrow: 1, flexDirection: "column" }}
				>
					<View style={[IncidentStyle.mainContainer]}>
						<View style={[IncidentStyle.addIncidentcontainer]}>
							<View
								style={[
									IncidentStyle.borderBottomGrayLoop,
									IncidentStyle.listIncident,
								]}
							>
								<Text style={[IncidentStyle.incidentInfoIndex]}>{"1."}</Text>
								<Text style={[IncidentStyle.incidentInfoText]}>
									{
										"Safety 1st: Injuries? Call 911 Immediately. Move car, if possible."
									}
								</Text>
							</View>
							<View
								style={[
									IncidentStyle.borderBottomGrayLoop,
									IncidentStyle.listIncident,
								]}
							>
								<Text style={[IncidentStyle.incidentInfoIndex]}>{"2."}</Text>
								<Text style={[IncidentStyle.incidentInfoText]}>
									{
										"Gather information using “Report Incident” from all involved."
									}
								</Text>
							</View>
							<View
								style={[
									IncidentStyle.borderBottomGrayLoop,
									IncidentStyle.listIncident,
								]}
							>
								<Text style={[IncidentStyle.incidentInfoIndex]}>{"3."}</Text>
								<Text style={[IncidentStyle.incidentInfoText]}>
									{"Notify your Trusted Contacts."}
								</Text>
							</View>
							<View
								style={[
									IncidentStyle.borderBottomGrayLoop,
									IncidentStyle.listIncident,
								]}
							>
								<Text style={[IncidentStyle.incidentInfoIndex]}>{"4."}</Text>
								<Text style={[IncidentStyle.incidentInfoText]}>
									{"Do not admit to anything."}
								</Text>
							</View>
							<View style={[IncidentStyle.listIncident]}>
								<Text style={[IncidentStyle.incidentInfoIndex]}>{"5."}</Text>
								<Text style={[IncidentStyle.incidentInfoText]}>
									{
										"We’ll report your claim and stay in constant contact with you as Retyrn handles the rest of the claims process on your behalf."
									}
								</Text>
							</View>
						</View>
					</View>
					<View style={[IncidentStyle.btnContainer]}>
						<Button
							onPress={() => gotoIncidentListScreen()}
							isBtnActive={true}
							btnName={"Manual Entry"}
							btnLabelColor={Colors.secondary}
							btnColor={Colors.transparent}
							btnBorderColor={Colors.secondary}
							btnWidth={1}
						/>
						<View style={{ ...LayoutStyle.paddingTop20 }}>
							<Button
								onPress={() => gotoIncidentManualEntry()}
								isBtnActive={true}
								btnName={"ClaimTalk"}
								btnColor={Colors.secondary}
								btnLabelColor={Colors.white}
							/>
						</View>
					</View>
				</ScrollView>
			</View>
		</>
	);
};

export default AddIncidentScreen;
