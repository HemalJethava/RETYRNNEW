import React, { forwardRef, useImperativeHandle, useMemo } from "react";
import { Text, StyleSheet, View, Image, TouchableOpacity } from "react-native";

import ProgressCircle from "../components/progressCircle";
import useAnimatedValue from "../hooks/useAnimatedValue";
import COLORS from "../utils/colors";
import type { CircularProgressProps, ProgressRef } from "../types";
import ProgressValue from "../components/progressValue";

import styles from "./styles";
import IMAGES from "../../../../assets/images/Images";

const CircularProgress = forwardRef<ProgressRef, CircularProgressProps>(
	(props, ref) => {
		const {
			value,
			initialValue = 0,
			circleBackgroundColor = COLORS.TRANSPARENT,
			radius = 60,
			duration = 500,
			delay = 0,
			maxValue = 100,
			strokeLinecap = "round",
			onAnimationComplete = () => null,
			activeStrokeColor = COLORS.GREEN,
			activeStrokeSecondaryColor = null,
			activeStrokeWidth = 10,
			inActiveStrokeColor = COLORS.BLACK_30,
			inActiveStrokeWidth = 10,
			inActiveStrokeOpacity = 1,
			clockwise = true,
			startInPausedState = false,
			rotation = 0,
			title = "",
			titleStyle = {},
			titleColor,
			titleFontSize,
			progressValueColor,
			progressValueStyle = {},
			progressValueFontSize,
			valuePrefix = "",
			valueSuffix = "",
			showProgressValue = true,
			subtitle = "",
			subtitleStyle = {},
			subtitleColor,
			subtitleFontSize,
			progressFormatter = (v: number) => {
				"worklet";

				return Math.round(v);
			},
			allowFontScaling = true,
			dashedStrokeConfig = { count: 0, width: 0 },
			valuePrefixStyle = {},
			valueSuffixStyle = {},
			strokeColorConfig = undefined,
			onPressTitle = () => {},
		} = props;

		const {
			animatedCircleProps,
			animatedTextProps,
			progressValue,
			play,
			pause,
			reAnimate,
		} = useAnimatedValue({
			initialValue,
			radius,
			maxValue,
			clockwise,
			startInPausedState,
			delay,
			value,
			duration,
			onAnimationComplete,
			activeStrokeWidth,
			inActiveStrokeWidth,
			progressFormatter,
			strokeColorConfig,
		});

		useImperativeHandle(ref, () => ({
			play,
			pause,
			reAnimate,
		}));

		const styleProps = useMemo(
			() => ({
				radius,
				rotation,
				progressValueColor,
				progressValueFontSize,
				progressValueStyle,
				activeStrokeColor,
				titleStyle,
				titleColor,
				titleFontSize,
				showProgressValue,
				subtitleColor,
				subtitleFontSize,
				subtitleStyle,
			}),
			[
				radius,
				rotation,
				progressValueColor,
				progressValueFontSize,
				progressValueStyle,
				activeStrokeColor,
				titleStyle,
				titleColor,
				titleFontSize,
				showProgressValue,
				subtitleColor,
				subtitleFontSize,
				subtitleStyle,
			]
		);
		return (
			<View style={styles(styleProps).container} testID="progress-bar">
				<View style={styles(styleProps).rotatingContainer}>
					<View>
						<ProgressCircle
							circleBackgroundColor={circleBackgroundColor}
							radius={radius}
							strokeLinecap={strokeLinecap}
							activeStrokeColor={activeStrokeColor}
							activeStrokeSecondaryColor={activeStrokeSecondaryColor}
							activeStrokeWidth={activeStrokeWidth}
							inActiveStrokeColor={inActiveStrokeColor}
							inActiveStrokeWidth={inActiveStrokeWidth}
							inActiveStrokeOpacity={inActiveStrokeOpacity}
							animatedCircleProps={animatedCircleProps}
							dashedStrokeConfig={dashedStrokeConfig}
						/>
					</View>
				</View>
				<View
					style={[
						StyleSheet.absoluteFillObject,
						styles(styleProps).valueContainer,
						{ borderWidth: 1, borderRadius: radius, borderColor: "#4CA7DA" },
					]}
				>
					<View
						style={{
							borderWidth: 1,
							borderRadius: radius,
							borderColor: "#4CA7DA",
						}}
					>
						<View
							style={{
								borderRadius: radius,
								borderWidth: 15,
								width: radius * 1.5,
								height: radius * 1.5,
								borderColor: "#dbedf7",
								justifyContent: "center",
							}}
						>
							<Image
								style={{
									height: 20,
									width: 20,
									alignSelf: "center",
									resizeMode: "contain",
								}}
								source={IMAGES.blueLogo}
							/>
							<Text
								style={{
									fontSize: 11,
									fontFamily: "Poppins-Regular",
									color: "#252525",
									alignSelf: "center",
									marginTop: 10,
								}}
							>
								{"Overall Driving Score"}
							</Text>
							{showProgressValue && (
								<View
									style={[
										styles(styleProps).valueContainerRow,
										{
											justifyContent: "center",
											alignContent: "center",
											alignSelf: "center",
										},
									]}
								>
									{!!valuePrefix && (
										<Text
											testID="progress-bar-value-prefix"
											style={[
												styles(styleProps).input,
												styles(styleProps).fromProps,
												valuePrefixStyle,
											]}
											allowFontScaling={allowFontScaling}
										>
											{valuePrefix}
										</Text>
									)}
									<View>
										<ProgressValue
											initialValue={initialValue}
											radius={radius}
											activeStrokeColor={activeStrokeColor}
											progressValueColor={progressValueColor}
											progressValueStyle={progressValueStyle}
											progressValueFontSize={progressValueFontSize}
											progressValue={progressValue}
											animatedTextProps={animatedTextProps}
											allowFontScaling={allowFontScaling}
										/>
									</View>
									{!!valueSuffix && (
										<Text
											testID="progress-bar-value-suffix"
											style={[
												styles(styleProps).input,
												progressValueStyle,
												styles(styleProps).fromProps,
												valueSuffixStyle,
											]}
											allowFontScaling={allowFontScaling}
										>
											{valueSuffix}
										</Text>
									)}
								</View>
							)}
							{title && title !== "" ? (
								<TouchableOpacity onPress={onPressTitle}>
									<Text
										testID="progress-title-text"
										style={{
											textAlign: "center",
											padding: 0,
											margin: 0,
											fontSize: 12,
											textDecorationLine: "underline",
										}}
										numberOfLines={1}
										allowFontScaling={allowFontScaling}
									>
										{title}
									</Text>
								</TouchableOpacity>
							) : null}
							{/* {subtitle && subtitle !== '' ? (
            <Text
              testID="progress-subtitle-text"
              style={[
                styles(styleProps).title,
                styles(styleProps).subtitle,
                subtitleStyle,
              ]}
              numberOfLines={1}
              allowFontScaling={allowFontScaling}>
              {subtitle}
            </Text>
          ) : null} */}
						</View>
					</View>
				</View>
			</View>
		);
	}
);

export default CircularProgress;
