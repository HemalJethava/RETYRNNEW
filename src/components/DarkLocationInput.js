import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import ComponentStyles from "../styles/ComponentStyles";
import LayoutStyle from "../styles/LayoutStyle";
import Colors from "../styles/Colors";
import Icons from "./Icons";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_MAPS_APIKEY } from "../config/BaseUrl";
import { NewMapStyle } from "../styles/NewMapStyle";

const DarkLocationInput = ({
	isDarkBG,
	forwardRef,
	value,
	placeholder,
	maxLength,
	secureTextEntry,
	onChangeText,
	onSubmitEditing,
	multiline,
	numberOfLines,
	iconName,
	iconSetName,
	isValidationShow,
	validationMessage,
	keyboardType,
	returnKeyType,
	blurOnSubmit,
	onFocus,
	onBlur,
	isPressOut,
	inputMainStyle,
	iconMainstyle,
	onKeyPress,
	editable,
	onPressLocation,
	onPressClear,
	location,
	locationSelection,
	country,
	disabledBtn,
	listHeight,
}) => {
	const inputValue = value?.trim();

	useEffect(() => {
		if (inputValue && forwardRef) {
			forwardRef.current?.setAddressText(inputValue);
		}
	}, [isPressOut]);

	return (
		<View
			style={[inputMainStyle, { opacity: disabledBtn ? 0.5 : 1 }]}
			pointerEvents={disabledBtn ? "none" : "auto"}
		>
			<View
				style={[
					isValidationShow && isPressOut
						? styles.pressOutErrorContainer
						: isPressOut
						? styles.pressOutContainer
						: styles.pressInContainer,
				]}
			>
				<View style={{ top: 12 }}>
					{!isPressOut ? (
						<Text
							style={[
								ComponentStyles.inputLabel,
								{ ...LayoutStyle.fontSize12, top: 2 },
							]}
						>
							{placeholder + ":  "}
						</Text>
					) : (
						<View>
							<Icons
								iconName={iconName}
								iconSetName={iconSetName}
								iconColor={isDarkBG ? Colors.inputIconDark : Colors.inputIcon}
								iconSize={22}
								iconMainstyle={iconMainstyle}
							/>
						</View>
					)}
				</View>
				<GooglePlacesAutocomplete
					ref={forwardRef}
					placeholder={placeholder}
					enablePoweredByContainer={false}
					predefinedPlaces={[]}
					predefinedPlacesAlwaysVisible={false}
					currentLocation={false}
					enableHighAccuracyLocation={true}
					fetchDetails={true}
					minLength={3}
					numberOfLines={1}
					timeout={2000}
					autoFocus={false}
					returnKeyType={"default"}
					keyboardShouldPersistTaps="always"
					onPress={(data, details = null) => {
						if (details && details.geometry) {
							const latLng = {
								latitude: details.geometry.location.lat,
								longitude: details.geometry.location.lng,
							};
							onPressLocation(data?.description, latLng);
						}
					}}
					query={{
						key: GOOGLE_MAPS_APIKEY,
						language: "en",
						components: country,
					}}
					styles={{
						textInput: {
							backgroundColor: Colors.transparent,
							color: isDarkBG ? Colors.inputWhiteText : Colors.inputBlackText,
							top: 1,
							paddingHorizontal: isPressOut ? 10 : 0,
						},
						row: {
							backgroundColor: "transparent",
						},
						description: { color: Colors.white },
						listView: {
							minHeight: value.length >= 3 ? listHeight : "auto",
							maxHeight: value.length >= 3 ? listHeight : "auto",
						},
						textInputContainer: { maxWidth: "100%" },
					}}
					textInputProps={{
						selection: locationSelection,
						clearButtonMode: "never",
						value: value,
						onChangeText: onChangeText,
						placeholderTextColor: isDarkBG
							? Colors.placeholder70
							: Colors.placeholder,
						onFocus: onFocus,
						onBlur: onBlur,
						onKeyPress: onKeyPress,
						editable: editable,
						blurOnSubmit: blurOnSubmit,
						secureTextEntry: secureTextEntry,
						onSubmitEditing: onSubmitEditing,
						multiline: multiline,
						numberOfLines: numberOfLines,
						keyboardType: keyboardType,
						returnKeyType: returnKeyType,
						cursorColor: isDarkBG
							? Colors.inputWhiteText
							: Colors.inputBlackText,
					}}
					renderRightButton={() =>
						value && !disabledBtn ? (
							<TouchableOpacity
								style={[{ top: 13, paddingLeft: 2 }]}
								onPress={() => onPressClear()}
							>
								<Icons
									iconName={"close-circle-outline"}
									iconSetName={"MaterialCommunityIcons"}
									iconColor={isDarkBG ? Colors.inputIconDark : Colors.inputIcon}
									iconSize={20}
								/>
							</TouchableOpacity>
						) : null
					}
				/>
			</View>
			{isValidationShow ? (
				<Text style={[ComponentStyles.validationMsg]}>{validationMessage}</Text>
			) : null}
		</View>
	);
};

export default DarkLocationInput;

const styles = StyleSheet.create({
	pressOutErrorContainer: {
		flexDirection: "row",
		borderBottomColor: Colors.errorBoxRed,
		borderBottomWidth: 1,
	},
	pressOutContainer: {
		flexDirection: "row",
		borderBottomColor: Colors.inputBorder,
		borderBottomWidth: 1,
	},
	pressInContainer: {
		flexDirection: "row",
		backgroundColor: Colors.inputfillBG,
		borderRadius: 26,
		paddingHorizontal: 20,
	},
});
