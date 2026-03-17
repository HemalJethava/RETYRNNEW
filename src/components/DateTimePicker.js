import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ComponentStyles from "../styles/ComponentStyles";
import CommonStyles from "../styles/CommonStyles";
import LayoutStyle from "../styles/LayoutStyle";
import Colors from "../styles/Colors";
import { Icons } from ".";
import { convertToISODate } from "../config/CommonFunctions";

const DateTimePicker = ({
	isDarkBG = true,
	isVisible,
	value,
	placeholder,
	iconName,
	iconSetName,
	mode,
	maximumDate,
	minimumDate,
	onPickerOpen,
	onPressFocus,
	onConfirm,
	onCancel,
	isValidationShow,
	validationMessage,
	isPressOut,
	datePickerMainStyle,
	props,
}) => {
	return (
		<View style={[datePickerMainStyle]}>
			<View>
				{isPressOut ? (
					<TouchableOpacity onPress={onPickerOpen}>
						<View
							style={[
								ComponentStyles.dateContainer,
								{
									borderBottomColor: isValidationShow
										? Colors.errorBoxRed
										: isDarkBG
										? Colors.inputBorderDark
										: Colors.inputBorder,
								},
							]}
						>
							<View style={[ComponentStyles.iconTextContainer]}>
								<Icons
									iconName={iconName}
									iconSetName={iconSetName}
									iconColor={isDarkBG ? Colors.inputIconDark : Colors.inputIcon}
									iconSize={22}
								/>
								<Text
									style={[
										ComponentStyles.datePlaceholder,
										{
											color: isDarkBG
												? Colors.placeholder70
												: Colors.inputBlackText,
										},
									]}
								>
									{placeholder}
								</Text>
							</View>
							<DateTimePickerModal
								isVisible={isVisible}
								mode={mode}
								onConfirm={onConfirm}
								onCancel={onCancel}
								maximumDate={maximumDate}
								minimumDate={minimumDate}
								date={new Date()}
							/>
						</View>
					</TouchableOpacity>
				) : (
					<TouchableOpacity onPress={onPressFocus}>
						<View style={[ComponentStyles.dateFocusOutView]}>
							<View style={{ ...CommonStyles.directionRowCenter }}>
								<Text
									style={[
										ComponentStyles.dateLabel,
										{
											...LayoutStyle.fontSize12,
											color: isDarkBG ? Colors.secondary : Colors.secondary,
										},
									]}
								>
									{placeholder + ":  "}
								</Text>
								<Text
									style={[
										ComponentStyles.dateLabel,
										{
											color: isDarkBG
												? Colors.inputWhiteText
												: Colors.inputBlackText,
										},
									]}
								>
									{value}
								</Text>
							</View>
						</View>
					</TouchableOpacity>
				)}
			</View>
			{isValidationShow ? (
				<Text style={[ComponentStyles.validationMsg]}>{validationMessage}</Text>
			) : null}
		</View>
	);
};

export default DateTimePicker;
