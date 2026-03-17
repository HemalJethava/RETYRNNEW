import React, { useState, useRef, useEffect } from "react";
import {
	TouchableOpacity,
	View,
	Text,
	UIManager,
	findNodeHandle,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import CommonStyles from "../styles/CommonStyles";
import LayoutStyle from "../styles/LayoutStyle";
import ComponentStyles from "../styles/ComponentStyles";
import Colors from "../styles/Colors";
import FontFamily from "../assets/fonts/FontFamily";
import { deviceHeight } from "../utils/DeviceInfo";

const DropDown = ({
	isDarkBG = true,
	placeholder,
	searchPlaceholder,
	dropdownData,
	onChange,
	renderLeftIcon,
	renderRightIcon,
	value,
	onFocus,
	onBlur,
	labelField,
	valueField,
	labelText,
	maxHeight = 200,
	isPressOut,
	mainDropdownStyle,
	onPressFocus,
	isValidationShow,
	validationMessage,
	disable,
	disableBtn,
}) => {
	const dropdownRef = useRef();
	const [hasOpened, setHasOpened] = useState(false);

	const dropDownOnFocus = async () => {
		if (!hasOpened) {
			await new Promise((resolve) => setTimeout(resolve, 300));
			setHasOpened(true);
			dropdownRef.current?.open();
			onFocus?.();
		}
	};

	const handleBlur = () => {
		setHasOpened(false);
		onBlur?.();
	};

	return (
		<View style={[mainDropdownStyle]}>
			<View>
				{isPressOut ? (
					<Dropdown
						ref={dropdownRef}
						containerStyle={{
							borderBottomRightRadius: 20,
							borderBottomLeftRadius: 20,
							borderTopRightRadius: 0,
							borderTopLeftRadius: 0,
							paddingBottom: 10,
							marginBottom: 0,
						}}
						activeColor={Colors.lightBlue}
						itemTextStyle={[ComponentStyles.listStyle, {}]}
						style={[ComponentStyles.dropdown, { marginTop: 0 }]}
						placeholderStyle={[
							ComponentStyles.placeholderStyle,
							{ color: isDarkBG ? Colors.placeholder70 : Colors.placeholder },
						]}
						selectedTextStyle={[
							ComponentStyles.selectedTextStyle,
							{
								color: isDarkBG ? Colors.inputWhiteText : Colors.inputBlackText,
							},
						]}
						inputSearchStyle={ComponentStyles.inputSearchStyle}
						itemContainerStyle={{
							paddingHorizontal: 10,
							borderBottomWidth: 0.5,
							borderBottomColor: isDarkBG
								? Colors.inputBorderDark
								: Colors.inputBorder,
						}}
						data={dropdownData}
						search
						maxHeight={maxHeight}
						labelField={labelField}
						valueField={valueField}
						placeholder={placeholder}
						searchPlaceholder={searchPlaceholder}
						value={value}
						onFocus={dropDownOnFocus}
						onBlur={handleBlur}
						// onFocus={onFocus}
						// onBlur={onBlur}
						onChange={onChange}
						renderLeftIcon={renderLeftIcon}
						renderRightIcon={renderRightIcon}
						fontFamily={FontFamily.PoppinsRegular}
						disable={disable}
					/>
				) : (
					<TouchableOpacity
						onPress={onPressFocus}
						style={[ComponentStyles.dropdownFocusOutView, { marginTop: 0 }]}
						disabled={disableBtn}
					>
						<View
							style={{
								...CommonStyles.directionRowCenter,
								opacity: disableBtn ? 0.6 : 1,
							}}
						>
							<Text
								style={[
									ComponentStyles.dateLabel,
									{ ...LayoutStyle.fontSize12 },
								]}
							>
								{labelText + ":  "}
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
					</TouchableOpacity>
				)}
			</View>
			{isValidationShow && (
				<Text style={[ComponentStyles.validationMsg]}>{validationMessage}</Text>
			)}
		</View>
	);
};

export default DropDown;
