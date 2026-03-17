import React, { useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import LayoutStyle from "../../../../styles/LayoutStyle";
import AccountStyle from "../../../../styles/AccountStyle";

const INDICATOR_RADIUS = 24; // TODO support shapes other than a circle

export const AlphabetList = ({
	data,
	itemHeight,
	itemStyle,
	onItemSelect,
	containerStyle,
	indicatorStyle,
	indicatorTextStyle,
	parentHeight,
}) => {
	const [selectedItem, setSelectedItem] = useState(data[0]);
	const [indicatorActive, setIndicatorActive] = useState(false);

	const dragY = new Animated.Value(0);

	const onPanGestureEvent = (e) => {
		const positionY = e.nativeEvent.y;
		calculateAndUpdateSelectedItem(positionY);
		dragY.setValue(positionY - INDICATOR_RADIUS);
	};

	const calculateAndUpdateSelectedItem = (positionY) => {
		const itemIndex = Math.floor(positionY / itemHeight);
		if (itemIndex >= 0 && itemIndex < data.length) {
			onItemSelected(data[itemIndex], itemIndex);
		}
	};

	const onItemSelected = (newItem, index) => {
		setSelectedItem((prevState) => {
			if (prevState !== newItem) {
				onItemSelect(newItem, index);
				return newItem;
			}
			return prevState;
		});
	};

	const onPanGestureStateChange = (e) => {
		const nativeEvent = e.nativeEvent;
		setTimeout(
			() => setIndicatorActive(nativeEvent.state === State.ACTIVE),
			50
		);
	};

	return (
		<View
			style={{
				flexDirection: "row",
				alignItems: "flex-start",
			}}
		>
			{indicatorActive && (
				<Animated.View
					style={[
						{
							width: INDICATOR_RADIUS * 1.5,
							height: INDICATOR_RADIUS * 1.5,
							marginRight: 24,
							alignItems: "center",
							justifyContent: "center",
						},
						{
							transform: [
								{
									translateY: dragY.interpolate({
										inputRange: [0, parentHeight - INDICATOR_RADIUS * 1.5],
										outputRange: [0, parentHeight - INDICATOR_RADIUS * 1.5],
										extrapolate: "clamp", // Restrict movement
									}),
								},
							],
						},
					]}
				>
					<View
						style={[
							{
								position: "absolute",
								width: INDICATOR_RADIUS * 1.5,
								height: INDICATOR_RADIUS * 1.5,
								borderRadius: INDICATOR_RADIUS,
								alignSelf: "stretch",
								flex: 1,
								opacity: 0.5,
								backgroundColor: "#4CA7DA",
							},
							indicatorStyle,
						]}
					/>
					<Text style={[AccountStyle.indicatorFontStyle, indicatorTextStyle]}>
						{selectedItem}
					</Text>
				</Animated.View>
			)}
			<PanGestureHandler
				onGestureEvent={onPanGestureEvent}
				onHandlerStateChange={onPanGestureStateChange}
			>
				<View
					style={[
						{
							alignItems: "flex-start",
						},
						// containerStyle,
					]}
				>
					{data.map((item, index) => (
						<TouchableOpacity
							// style={{ height: itemHeight }}
							key={item}
							onPress={() => onItemSelected(item, index)}
						>
							<Text
								style={[AccountStyle.AZFontSize, { maxHeight: itemHeight }]}
							>
								{item}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			</PanGestureHandler>
		</View>
	);
};
