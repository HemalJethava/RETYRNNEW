import { View, Modal } from "react-native";
import React from "react";
import ComponentStyles from "../styles/ComponentStyles";

const Overlay = ({
	visible,
	onBackdropPress,
	onRequestClose,
	onModalClose,
	...props
}) => {
	return (
		<View style={[ComponentStyles.mainModal]}>
			<Modal
				animationType="slide"
				transparent={true}
				visible={visible}
				onRequestClose={onRequestClose}
			>
				<View
					onStartShouldSetResponder={onRequestClose}
					style={[ComponentStyles.modalContainer]}
				>
					<View
						onStartShouldSetResponder={() => true}
						style={[ComponentStyles.modalView]}
						{...props}
					/>
				</View>
			</Modal>
		</View>
	);
};

export default Overlay;
