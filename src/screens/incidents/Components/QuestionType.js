import React from "react";
import { FlatList, Platform, Text, View } from "react-native";
import {
	AddImagePicker,
	AnswerOptions,
	DamagePartImg,
	DateTimePicker,
	DropDown,
	Icons,
	Input,
	ValidationText,
	ImageOptions,
} from "../../../components";
import Colors from "../../../styles/Colors";
import { deviceHeight } from "../../../utils/DeviceInfo";
import { TouchableOpacity } from "react-native-gesture-handler";
import IncidentStyle from "../../../styles/IncidentStyles";
import LayoutStyle from "../../../styles/LayoutStyle";
import momentTimeZone from "moment-timezone";
import { US_TIMEZONE } from "../../../config/CommonFunctions";

export const QuestionType = ({
	type,
	index,

	// Date Picker
	isVisible,
	value,
	onPickerOpen,
	onConfirm,
	onCancel,
	onPressFocus,
	isValidationShow,
	validationMessage,
	isPressOut,

	// Time Picker
	timeIsVisible,
	timeValue,
	timeOnPickerOpen,
	confirmIncidentTime,
	timeOnCancel,
	timeOnPressFocus,
	timeIsValidationShow,
	timeValidationMessage,
	timeIsPressOut,

	// State list dropdown
	stateData,
	stateValue,
	stateIsPressOut,
	stateIsValidationShow,
	stateValidationMessage,
	stateOnFocus,
	stateOnPressFocus,
	stateOnBlur,
	stateOnChange,

	// Driver list dropdown
	driverData,
	driverValue,
	driverIsPressOut,
	driverIsValidationShow,
	driverValidationMessage,
	driverOnFocus,
	driverOnPressFocus,
	driverOnBlur,
	driverOnChange,
	driverOnPressIWasDriving,

	// Vehicle list dropdown with VIN
	vehicleData,
	vehicleValue,
	vehicleIsPressOut,
	vehicleIsValidationShow,
	vehicleValidationMessage,
	vehicleOnFocus,
	vehicleOnPressFocus,
	vehicleOnBlur,
	vehicleOnChange,
	getOcrImage,

	// Option list
	OptionListData,
	OptionSelectItem,
	OptionIsValidationShow,
	OptionValidationMessage,
	selectedAnswer,

	// Photos
	isSelectedLayout,
	imagesArray,
	renderSelectedImg,
	openImagePicker,
	imageIsValidationShow,
	imageValidationMessage,

	// Critical Information
	infoValue,
	onChangeCriticalInfo,
	infoIsValidationShow,
	infoValidationMessage,
	infoOnFocus,
	infoOnBlur,
	infoIsPressOut,
	infoOnPressFocus,

	// Damage Area
	updatedTruck,
	handleAccidentSideFront,
	handleAccidentSideFrontLeft,
	handleAccidentSideMiddleLeft,
	handleAccidentSideBackLeft,
	handleAccidentSideTop,
	handleAccidentSideFrontRight,
	handleAccidentSideMiddleRight,
	handleAccidentSideBackRight,
	handleAccidentSideBack,
	damageIsValidationShow,
	damageValidationMessage,
}) => {
	const today = momentTimeZone().tz(US_TIMEZONE).startOf("day").toDate();

	return (
		<View key={index}>
			{type === "date" ? (
				<DateTimePicker
					isVisible={isVisible}
					value={value}
					placeholder={"Date"}
					iconName={"calendar-blank-outline"}
					iconSetName={"MaterialCommunityIcons"}
					mode="date"
					maximumDate={today}
					onPickerOpen={onPickerOpen}
					onConfirm={onConfirm}
					onCancel={onCancel}
					onPressFocus={onPressFocus}
					isValidationShow={isValidationShow}
					validationMessage={validationMessage}
					isPressOut={isPressOut}
				/>
			) : type === "time" ? (
				<DateTimePicker
					isVisible={timeIsVisible}
					value={timeValue}
					placeholder={"Time"}
					iconName={"clock-time-ten-outline"}
					iconSetName={"MaterialCommunityIcons"}
					mode="time"
					onPickerOpen={timeOnPickerOpen}
					onConfirm={confirmIncidentTime}
					onCancel={timeOnCancel}
					onPressFocus={timeOnPressFocus}
					isValidationShow={timeIsValidationShow}
					validationMessage={timeValidationMessage}
					isPressOut={timeIsPressOut}
				/>
			) : type === "select_state" ? (
				<DropDown
					dropdownData={stateData}
					search
					placeholder="Select State"
					labelText="State"
					maxHeight={deviceHeight / 3}
					labelField="name"
					valueField="name"
					searchPlaceholder="Search..."
					value={stateValue}
					isPressOut={stateIsPressOut}
					isValidationShow={stateIsValidationShow}
					validationMessage={stateValidationMessage}
					onFocus={stateOnFocus}
					onPressFocus={stateOnPressFocus}
					onBlur={stateOnBlur}
					onChange={stateOnChange}
					renderLeftIcon={() => (
						<Icons
							iconName={"map-marker"}
							iconSetName={"MaterialCommunityIcons"}
							iconColor={Colors.inputIconDark}
							iconSize={18}
						/>
					)}
					renderRightIcon={() => (
						<Icons
							iconName={"caret-down"}
							iconSetName={"FontAwesome6"}
							iconColor={Colors.inputIconDark}
							iconSize={18}
						/>
					)}
					mainDropdownStyle={{ ...LayoutStyle.marginTop20 }}
				/>
			) : type === "select_driver" ? (
				<View style={{ ...LayoutStyle.marginTop20 }}>
					<DropDown
						dropdownData={driverData}
						search
						placeholder="Select driver"
						labelText="Driver"
						maxHeight={deviceHeight / 3}
						labelField="label"
						valueField="label"
						searchPlaceholder="Search..."
						value={driverValue}
						isPressOut={driverIsPressOut}
						isValidationShow={driverIsValidationShow}
						validationMessage={driverValidationMessage}
						onFocus={driverOnFocus}
						onPressFocus={driverOnPressFocus}
						onBlur={driverOnBlur}
						onChange={driverOnChange}
						renderLeftIcon={() => (
							<Icons
								iconName={"account-outline"}
								iconSetName={"MaterialCommunityIcons"}
								iconColor={Colors.inputIconDark}
								iconSize={18}
							/>
						)}
						renderRightIcon={() => (
							<Icons
								iconName={"caret-down"}
								iconSetName={"FontAwesome6"}
								iconColor={Colors.inputIconDark}
								iconSize={18}
							/>
						)}
					/>
					{/* <View
						style={{
							...LayoutStyle.marginHorizontal20,
							...LayoutStyle.marginTop20,
						}}
					>
						<Button
							btnLabelColor={Colors.secondary}
							isBtnActive={true}
							btnBorderColor={Colors.secondary}
							btnColor={Colors.white}
							btnName={"I was driving"}
							btnWidth={1}
							onPress={driverOnPressIWasDriving}
						/>
					</View> */}
				</View>
			) : type === "select_vehicle" ? (
				<>
					<DropDown
						dropdownData={vehicleData.map((item) => ({
							...item,
							label: `${item.name} ${
								item?.vehicle_number ? `(${item?.vehicle_number})` : ""
							}`,
						}))}
						search
						placeholder="Select Vehicle"
						labelText="Vehicle"
						maxHeight={deviceHeight / 3}
						labelField={"label"}
						valueField="name"
						searchPlaceholder="Search..."
						value={vehicleValue}
						isPressOut={vehicleIsPressOut}
						isValidationShow={vehicleIsValidationShow}
						validationMessage={vehicleValidationMessage}
						onFocus={vehicleOnFocus}
						onPressFocus={vehicleOnPressFocus}
						onBlur={vehicleOnBlur}
						onChange={vehicleOnChange}
						renderLeftIcon={() => (
							<Icons
								iconName={"truck-outline"}
								iconSetName={"MaterialCommunityIcons"}
								iconColor={Colors.inputIconDark}
								iconSize={18}
							/>
						)}
						renderRightIcon={() => (
							<Icons
								iconName={"caret-down"}
								iconSetName={"FontAwesome6"}
								iconColor={Colors.inputIconDark}
								iconSize={18}
							/>
						)}
						mainDropdownStyle={{ ...LayoutStyle.marginTop20 }}
					/>
					<TouchableOpacity
						onPress={getOcrImage}
						style={[IncidentStyle.flexEnd]}
					>
						<View style={[IncidentStyle.scanIcon]}>
							<Text style={[IncidentStyle.scanText]}>{"Scan VIN #"}</Text>
							<Icons
								iconName={"qrcode-scan"}
								iconSetName={"MaterialCommunityIcons"}
								iconColor={Colors.secondary}
								iconSize={18}
							/>
						</View>
					</TouchableOpacity>
				</>
			) : type === "options" ? (
				<View>
					<FlatList
						data={OptionListData.map((option) => ({
							...option,
							isSelected: option.Text === selectedAnswer,
						}))}
						renderItem={({ item, index }) => (
							<>
								{item?.image_name ? (
									<ImageOptions
										keyIndex={index}
										isIcon={false}
										onPress={() => OptionSelectItem(item, index)}
										isSelected={item.isSelected}
										optionLabel={item.Text}
										imageName={item?.image_name}
									/>
								) : (
									<AnswerOptions
										keyIndex={index}
										isIcon={false}
										onPress={() => OptionSelectItem(item, index)}
										isSelected={item.isSelected}
										optionLabel={item.Text}
									/>
								)}
							</>
						)}
						keyExtractor={(item, index) => `image-${index.toString()}`}
						scrollEnabled={false}
					/>
					{OptionIsValidationShow && (
						<ValidationText
							isValidationShow={OptionIsValidationShow}
							validationMessage={OptionValidationMessage}
						/>
					)}
				</View>
			) : type === "photo" ? (
				<View>
					{isSelectedLayout ? (
						<AddImagePicker
							data={imagesArray}
							renderItem={({ item: imgItems, index }) =>
								renderSelectedImg(imgItems, index)
							}
							keyExtractor={(item) => item.id}
						/>
					) : (
						<View
							style={[IncidentStyle.uploadImg, IncidentStyle.selectImgsBig]}
						>
							<TouchableOpacity onPress={openImagePicker}>
								<View style={{ alignItems: "center" }}>
									<Icons
										iconName={"plus"}
										iconSetName={"FontAwesome6"}
										iconColor={Colors.secondary}
										iconSize={18}
									/>
									<Text style={[IncidentStyle.textGallery]}>
										{"Image Gallery"}
									</Text>
								</View>
							</TouchableOpacity>
						</View>
					)}
					<ValidationText
						isValidationShow={imageIsValidationShow}
						validationMessage={imageValidationMessage}
					/>
				</View>
			) : type === "string" ? (
				<Input
					isDarkBG={true}
					value={infoValue}
					placeholder={"ie. Other Party information, weather, etc."}
					maxLength={100}
					onChangeText={(text) => onChangeCriticalInfo(text)}
					multiline={true}
					// numberOfLines={3}
					iconName={"alert-outline"}
					iconSetName={"MaterialCommunityIcons"}
					isValidationShow={infoIsValidationShow}
					validationMessage={infoValidationMessage}
					keyboardType={"default"}
					blurOnSubmit={true}
					onFocus={infoOnFocus}
					onBlur={infoOnBlur}
					isPressOut={infoIsPressOut}
					onPressFocus={infoOnPressFocus}
					inputMainStyle={{
						...LayoutStyle.paddingVertical20,
					}}
					iconMainstyle={{
						alignSelf: "flex-start",
						marginTop: Platform.OS === "ios" ? "2%" : "3%",
						padding: 7,
					}}
					inputStyle={{
						textAlignVertical: "top",
						fontSize: 13,
					}}
					focusLabelMainStyle={{ height: 170 }}
					inputLabelStyle={{
						flexDirection: "column",
						alignItems: "flex-start",
					}}
				/>
			) : type === "damage_area" ? (
				<View>
					<DamagePartImg
						truckFront={updatedTruck.truckFront}
						handleAccidentSideFront={handleAccidentSideFront}
						truckFrontLeft={updatedTruck.truckFrontLeft}
						handleAccidentSideFrontLeft={handleAccidentSideFrontLeft}
						truckMiddleLeft={updatedTruck.truckMiddleLeft}
						handleAccidentSideMiddleLeft={handleAccidentSideMiddleLeft}
						truckBackLeft={updatedTruck.truckBackLeft}
						handleAccidentSideBackLeft={handleAccidentSideBackLeft}
						truckTop={updatedTruck.truckTop}
						handleAccidentSideTop={handleAccidentSideTop}
						truckFrontRight={updatedTruck.truckFrontRight}
						handleAccidentSideFrontRight={handleAccidentSideFrontRight}
						truckMiddleRight={updatedTruck.truckMiddleRight}
						handleAccidentSideMiddleRight={handleAccidentSideMiddleRight}
						truckBackRight={updatedTruck.truckBackRight}
						handleAccidentSideBackRight={handleAccidentSideBackRight}
						truckBack={updatedTruck.truckBack}
						handleAccidentSideBack={handleAccidentSideBack}
					/>
					<ValidationText
						isValidationShow={damageIsValidationShow}
						validationMessage={damageValidationMessage}
					/>
				</View>
			) : null}
		</View>
	);
};
