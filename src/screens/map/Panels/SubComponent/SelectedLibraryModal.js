import React, { useEffect } from "react";
import {
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import Colors from "../../../../styles/Colors";
import { Icons } from "../../../../components";
import { truncateText } from "../../../../config/CommonFunctions";
import { styles } from "../MainPanel/styles";

export const SelectedLibraryModal = ({
	show,
	onHide,
	data,
	handleUnpin,
	handleDetails,
}) => {
	useEffect(() => {
		// data
	}, [data]);

	const iconConfig = {
		home: { name: "home", color: "#33d0eb", set: "Ionicons" },
		work: { name: "briefcase", color: "#94694f", set: "Ionicons" },
		school: { name: "school", color: "#94694f", set: "Ionicons" },
	};

	const pin = iconConfig[data?.pinnedType];

	return (
		<Modal
			transparent
			animationType={"fade"}
			visible={show}
			presentationStyle={"overFullScreen"}
			onRequestClose={onHide}
		>
			<TouchableWithoutFeedback onPress={onHide}>
				<View style={styles.prevPinContainer}>
					<View style={styles.previewContainer}>
						<View style={styles.previewCard}>
							<View style={styles.alignCenter}>
								<View
									style={[
										styles.libraryIcon,
										{ backgroundColor: pin ? pin.color : "#E5E5E5" },
									]}
								>
									<Icons
										iconSetName={pin ? pin.set : "MaterialDesignIcons"}
										iconName={pin ? pin.name : "record-circle"}
										iconColor={pin ? Colors.white : "#667cf1"}
										iconSize={pin ? 18 : 38}
									/>
								</View>
								<Text style={[styles.libraryTag, { marginTop: 5 }]}>
									{truncateText(data?.label, 12)}
								</Text>

								<Text style={{ color: Colors.blueActiveBtn }}>
									{data?.distanceMiles != null
										? `${data.distanceMiles.toFixed(0)} mi`
										: "0 mi"}
								</Text>
							</View>
						</View>

						<View style={[styles.previewCard, { marginTop: 14 }]}>
							<TouchableOpacity
								style={styles.prevActionRow}
								onPress={handleDetails}
							>
								<Text style={styles.prevEditTxt}>{"Edit Details"}</Text>
								<Icons
									iconSetName={"Ionicons"}
									iconName={"information-circle"}
									iconColor={Colors.labelDarkGray}
									iconSize={20}
								/>
							</TouchableOpacity>
							<View style={styles.prevDiv} />
							<TouchableOpacity
								style={styles.prevActionRow}
								onPress={handleUnpin}
							>
								<Text
									style={[styles.prevEditTxt, { color: Colors.errorBoxRed }]}
								>
									{"Unpin"}
								</Text>
								<Icons
									iconSetName={"MaterialDesignIcons"}
									iconName={"pin-off"}
									iconColor={Colors.errorBoxRed}
									iconSize={20}
								/>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</TouchableWithoutFeedback>
		</Modal>
	);
};
