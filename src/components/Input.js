import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React from "react";
import ComponentStyles from "../styles/ComponentStyles";
import LayoutStyle from "../styles/LayoutStyle";
import Colors from "../styles/Colors";
import Icons from "./Icons";

const Input = ({
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
	onChange,
	onFocus,
	onBlur,
	isPressOut,
	onPressFocus,
	isRightIcon,
	rightIconColor,
	rightIconName,
	rightIconSetName,
	onPressRightIcon,
	inputMainStyle,
	inputStyle,
	iconMainstyle,
	focusLabelMainStyle,
	inputLabelStyle,
	onKeyPress,
	editable,
	props,
	disabledBtn,
	textContentType,
	autoComplete,
	autoCapitalize,
	autoCorrect,
}) => {
	const inputValue = value?.trim();
	return (
		<View style={[inputMainStyle]}>
			<View>
				{isPressOut ? (
					<View
						style={[
							ComponentStyles.textInputContainer,
							{
								borderBottomColor: isValidationShow
									? Colors.errorBoxRed
									: isDarkBG
									? Colors.inputBorderDark
									: Colors.inputBorder,
							},
						]}
					>
						<Icons
							iconName={iconName}
							iconSetName={iconSetName}
							iconColor={isDarkBG ? Colors.inputIconDark : Colors.inputIcon}
							iconSize={22}
							iconMainstyle={iconMainstyle}
						/>

						<TextInput
							style={[
								ComponentStyles.textInput,
								{
									color: isDarkBG
										? Colors.inputWhiteText
										: Colors.inputBlackText,
									height: !multiline ? 50 : "auto",
									width: isRightIcon ? "85%" : "90%",
								},
								inputStyle,
							]}
							cursorColor={
								isDarkBG ? Colors.inputWhiteText : Colors.inputBlackText
							}
							ref={forwardRef}
							value={value}
							placeholder={placeholder}
							placeholderTextColor={
								isDarkBG ? Colors.placeholder70 : Colors.placeholder
							}
							maxLength={maxLength}
							secureTextEntry={secureTextEntry}
							onChangeText={onChangeText}
							onSubmitEditing={onSubmitEditing}
							multiline={multiline}
							numberOfLines={numberOfLines}
							keyboardType={keyboardType}
							returnKeyType={returnKeyType}
							blurOnSubmit={blurOnSubmit}
							onChange={onChange}
							onFocus={onFocus}
							onBlur={onBlur}
							onKeyPress={onKeyPress}
							editable={editable}
							textContentType={textContentType}
							autoComplete={autoComplete}
							autoCapitalize={autoCapitalize}
							autoCorrect={autoCorrect ?? false}
						/>
						{isRightIcon ? (
							<TouchableOpacity
								// style={{ right: 15 }}
								onPress={onPressRightIcon}
							>
								<Icons
									iconColor={rightIconColor}
									iconName={rightIconName}
									iconSetName={rightIconSetName}
									iconSize={20}
								/>
							</TouchableOpacity>
						) : null}
					</View>
				) : (
					<TouchableOpacity
						ref={forwardRef}
						onPress={onPressFocus}
						disabled={disabledBtn}
					>
						<View
							style={[
								ComponentStyles.focusOutView,
								focusLabelMainStyle,
								isRightIcon ? { justifyContent: "space-between" } : null,
								{
									opacity: disabledBtn ? 0.6 : 1,
								},
							]}
						>
							<View
								style={[
									ComponentStyles.inputLableKey,
									inputLabelStyle,
									{
										height: 130,
										width: "100%",
									},
								]}
							>
								<Text
									style={[
										ComponentStyles.inputLabel,
										{ ...LayoutStyle.fontSize12 },
									]}
								>
									{placeholder + ":  "}
								</Text>
								<Text
									style={[
										ComponentStyles.inputLabel,
										{
											color: isDarkBG
												? Colors.inputWhiteText
												: Colors.inputBlackText,
											flex: 1,
										},
									]}
									numberOfLines={multiline ? numberOfLines : 1}
								>
									{secureTextEntry && `${inputValue}`
										? "*".repeat(inputValue.length)
										: multiline
										? `${value}`
										: placeholder.length > 10
										? inputValue?.length > 20
											? `${inputValue.substring(0, 20)}...`
											: `${inputValue}`
										: placeholder.length < 10
										? inputValue?.length > 26
											? `${inputValue.substring(0, 26)}...`
											: `${inputValue}`
										: `${inputValue}`}
								</Text>
							</View>
							{isRightIcon ? (
								<TouchableOpacity
									style={{ right: 15 }}
									onPress={onPressRightIcon}
								>
									<Icons
										iconColor={rightIconColor}
										iconName={rightIconName}
										iconSetName={rightIconSetName}
										iconSize={20}
									/>
								</TouchableOpacity>
							) : null}
						</View>
					</TouchableOpacity>
				)}
			</View>
			{isValidationShow ? (
				<Text style={[ComponentStyles.validationMsg, { marginTop: 5 }]}>
					{validationMessage}
				</Text>
			) : (
				numberOfLines
			)}
		</View>
	);
};

export default Input;
