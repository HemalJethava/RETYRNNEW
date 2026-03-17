import React from "react";
import { View, Text, Pressable, Linking, Image } from "react-native";
import PassesStyle from "../../../styles/PassesStyle";
import Colors from "../../../styles/Colors";
import LayoutStyle from "../../../styles/LayoutStyle";
import IMAGES from "../../../assets/images/Images";
import { CardDetailRow } from "./CardDetailRow";
import { Overlay } from "../../../components";
import { getFileType } from "../../../config/CommonFunctions";
import { startsWithHash } from "../../../utils/Validation";

export const ViewCardPopup = ({ show, onHide, passDetails }) => {
	const onRequestClose = () => {
		onHide();
	};

	return (
		<Overlay onRequestClose={() => onRequestClose()} visible={show}>
			<View style={{ ...LayoutStyle.paddingBottom30 }}>
				<View style={[PassesStyle.cameraModal]}>
					<View style={[PassesStyle.alignCenter]}>
						<View
							style={[
								PassesStyle.cardImg,
								{
									borderColor:
										passDetails?.code && startsWithHash(passDetails?.code)
											? passDetails?.code
											: Colors.inputBlackText,
								},
							]}
						>
							<Image
								style={{ height: "100%", width: "100%", resizeMode: "contain" }}
								source={
									getFileType(passDetails?.image) !== "pdf"
										? { uri: passDetails?.image }
										: IMAGES.pdfImg
								}
							/>
						</View>
					</View>
					<View style={[{ marginVertical: 10 }]}>
						<CardDetailRow
							title1={"Name"}
							detail1={passDetails?.name}
							onPressDetail1={() => {}}
							title2={"Company Name"}
							detail2={passDetails?.company_name}
							onPressDetail2={() => {}}
							code={passDetails?.code}
						/>
						<CardDetailRow
							title1={"Policy ID"}
							detail1={`#${passDetails?.policy_id}`}
							onPressDetail1={() => {}}
							title2={"Type"}
							detail2={passDetails?.type}
							onPressDetail2={() => {}}
							isMore={true}
							title3={"State"}
							detail3={passDetails?.state}
							onPressDetail3={() => {}}
							code={passDetails?.code}
						/>
						<CardDetailRow
							title1={"Cell Phone"}
							detail1={passDetails?.mobile}
							onPressDetail1={() => {
								if (passDetails?.mobile) {
									Linking.openURL(`tel:${passDetails?.mobile}`);
								}
							}}
							title2={"Email"}
							detail2={passDetails?.email}
							onPressDetail2={() => {
								if (passDetails?.email) {
									Linking.openURL(`mailto:${passDetails?.email}`);
								}
							}}
							isMore={true}
							title3={"Website"}
							detail3={passDetails?.web_url}
							onPressDetail3={() => {
								if (passDetails.web_url) {
									Linking.canOpenURL(passDetails.web_url).then((supported) => {
										if (supported) {
											Linking.openURL(passDetails.web_url);
										}
									});
								}
							}}
							code={passDetails?.code}
						/>
						<CardDetailRow
							title1={"Effective Date"}
							detail1={passDetails?.effective_date}
							onPressDetail1={() => {}}
							title2={"Expiration Date"}
							detail2={passDetails?.expiration_date}
							onPressDetail2={() => {}}
							code={passDetails?.code}
							isLast={true}
						/>
					</View>
				</View>
				<Pressable
					onPress={() => onHide()}
					style={[PassesStyle.btnGoContainer]}
				>
					<Text style={[PassesStyle.btnTextGo]}>{"Close"}</Text>
				</Pressable>
			</View>
		</Overlay>
	);
};
