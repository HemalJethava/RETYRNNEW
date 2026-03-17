import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import ComponentStyles from "../../../../styles/ComponentStyles";
import { styles } from "../MainPanel/styles";

export const RemovePinModal = ({ show, onHide, onPress }) => {
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
				<View style={styles.callModal}>
					<View style={styles.removePlaceWhite}>
						<Text style={styles.removePlaceTxt}>{"Remove this Place?"}</Text>
						<Text style={styles.removePlaceDes}>
							{"Removing place from your library will also unpin it."}
						</Text>
						<View style={[styles.divDark, { marginTop: 14 }]} />
						<TouchableOpacity style={styles.removePlaceBtn} onPress={onPress}>
							<Text style={styles.removeTxt}>{"Remove"}</Text>
						</TouchableOpacity>
					</View>
					<TouchableOpacity
						style={[styles.callBtn, { justifyContent: "center" }]}
						onPress={onHide}
					>
						<Text style={[styles.headerSend]}>{`Cancel`}</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};
