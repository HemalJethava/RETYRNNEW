import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import ComponentStyles from "../../../../styles/ComponentStyles";
import { styles } from "../MainPanel/styles";
import Colors from "../../../../styles/Colors";

export const EndRouteModal = ({ show, onHide, onConfirm }) => {
	return (
		<Modal
			animationType={"slide"}
			transparent={true}
			visible={show}
			presentationStyle={"overFullScreen"}
			onRequestClose={onHide}
		>
			<View
				style={[
					ComponentStyles.loaderHorizontal,
					{ backgroundColor: "rgba(0,0,0,0.4)" },
				]}
			>
				<View style={styles.endRouteModal}>
					<Text style={[styles.removePlaceTxt, { fontSize: 14 }]}>
						{"End Route"}
					</Text>
					<Text style={styles.removePlaceDes}>
						{"Are you want to sure? Trip detail will be saved."}
					</Text>
					<View style={[styles.divDark, { marginTop: 14 }]} />
					<View style={styles.endRouteBtnRow}>
						<TouchableOpacity style={styles.endRouteMBtn} onPress={onHide}>
							<Text style={styles.swipeBtnTxt}>{"Cancel"}</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.endRouteMBtn,
								{ backgroundColor: Colors.errorBoxRed },
							]}
							onPress={onConfirm}
						>
							<Text style={styles.swipeBtnTxt}>{`Confirm`}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};
