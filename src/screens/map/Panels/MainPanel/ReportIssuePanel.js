import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { styles } from "./styles";
import LayoutStyle from "../../../../styles/LayoutStyle";
import CommonStyles from "../../../../styles/CommonStyles";
import { Icons } from "../../../../components";
import Colors from "../../../../styles/Colors";
import { reportTypes } from "../../../../json/DummyData";

export const ReportIssuePanel = ({
	reportPanelRef,
	snapPoints,
	renderBackdrop,
	handleReportClosePanel,
}) => {
	const [selectedIssue, setSelectedIssue] = useState(null);

	const onPressIssue = (item) => {
		setSelectedIssue(item);
	};

	return (
		<BottomSheetModal
			ref={reportPanelRef}
			snapPoints={["90%"]}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={true}
			enableDynamicSizing={false}
			backgroundStyle={styles.backgroundStyle}
		>
			<BottomSheetScrollView
				style={{ ...LayoutStyle.paddingHorizontal20 }}
				showsVerticalScrollIndicator={false}
			>
				<View style={[{ ...CommonStyles.directionRowSB }]}>
					<TouchableOpacity style={{}} onPress={handleReportClosePanel}>
						<Text style={styles.headerCancelTxt}>{"Cancel"}</Text>
					</TouchableOpacity>
					<Text style={styles.reportPanelTitle}>{"Report an Issue"}</Text>
					<TouchableOpacity
						style={{}}
						onPress={() => {}}
						disabled={!selectedIssue}
					>
						<Text
							style={[
								styles.headerSend,
								selectedIssue && {
									color: Colors.blueActiveBtn,
									opacity: 1,
								},
							]}
						>
							{"Send"}
						</Text>
					</TouchableOpacity>
				</View>
				<Text style={styles.issueTitle}>
					{"What issue do you want to report about ISKCON Ahmedabad?"}
				</Text>
				<View style={styles.library}>
					{reportTypes.map((item, index) => (
						<View key={item?.id}>
							<TouchableOpacity
								style={{ ...CommonStyles.directionRowSB }}
								onPress={() => onPressIssue(item)}
							>
								<Text style={styles.issueTypeTxt}>{item.title}</Text>
								{selectedIssue && item?.id === selectedIssue?.id && (
									<Icons
										iconSetName={"FontAwesome6"}
										iconName={"check"}
										iconColor={Colors.blueActiveBtn}
										iconSize={20}
									/>
								)}
							</TouchableOpacity>
							{index !== reportTypes.length - 1 && <View style={styles.div} />}
						</View>
					))}
				</View>
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
};
