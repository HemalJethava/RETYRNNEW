import React, { useEffect } from "react";
import {
	Modal,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import Colors from "../../../../styles/Colors";
import { Icons } from "../../../../components";
import { styles } from "../MainPanel/styles";
import CommonStyles from "../../../../styles/CommonStyles";

export const RecentSelected = ({
	show,
	onHide,
	data,
	handleDirection,
	handleCall,
	handleHomePage,
	handleShareLocation,
}) => {
	useEffect(() => {
		// data
	}, [data]);

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
					<View style={styles.recentPreview}>
						<View style={[styles.previewCard, { marginTop: 160 }]}>
							<View style={styles.alignCenter}>
								<View style={{ ...CommonStyles.directionRowCenter }}>
									<View style={[styles.directionCircle]}>
										<Icons
											iconSetName={"Feather"}
											iconName={"corner-up-right"}
											iconColor={Colors.white}
											iconSize={18}
										/>
									</View>
									<View style={styles.flex}>
										<Text numberOfLines={2} style={styles.recentDestination}>
											{data?.destinationLocation?.destinationLocationName}
										</Text>
										<Text numberOfLines={2} style={[styles.fromLocationTxt]}>
											{data?.secondary_text || "From My Location"}
										</Text>
									</View>
								</View>
							</View>
						</View>
						<View style={styles.recentPrevOption}>
							<TouchableOpacity
								style={styles.recentPrevRow}
								onPress={handleDirection}
							>
								<Text style={[styles.prevEditTxt, { fontSize: 14 }]}>
									{"Direction"}
								</Text>
								<Icons
									iconSetName={"Feather"}
									iconName={"corner-up-right"}
									iconColor={Colors.labelBlack}
									iconSize={20}
								/>
							</TouchableOpacity>
							<View style={[styles.recentPrevDiv]} />
							{data?.phoneNumber && (
								<>
									<TouchableOpacity
										style={styles.recentPrevRow}
										onPress={handleCall}
									>
										<Text style={[styles.prevEditTxt, { fontSize: 15 }]}>
											{"Call"}
										</Text>
										<Icons
											iconSetName={"Ionicons"}
											iconName={"call-outline"}
											iconColor={Colors.labelBlack}
											iconSize={20}
										/>
									</TouchableOpacity>
									<View style={[styles.recentPrevDiv]} />
								</>
							)}
							{data?.website && (
								<>
									<TouchableOpacity
										style={styles.recentPrevRow}
										onPress={handleHomePage}
									>
										<Text style={[styles.prevEditTxt, { fontSize: 15 }]}>
											{"Open Home Page"}
										</Text>
										<Icons
											iconSetName={"Ionicons"}
											iconName={"compass-outline"}
											iconColor={Colors.labelBlack}
											iconSize={20}
										/>
									</TouchableOpacity>
									<View style={[styles.recentPrevDiv]} />
								</>
							)}
							<TouchableOpacity
								style={styles.recentPrevRow}
								onPress={handleShareLocation}
							>
								<Text style={[styles.prevEditTxt, { fontSize: 15 }]}>
									{"Share Location"}
								</Text>
								<Icons
									iconSetName={"Ionicons"}
									iconName={"share-outline"}
									iconColor={Colors.labelBlack}
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
