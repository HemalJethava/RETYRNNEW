import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Colors from "../styles/Colors";

export const OTPTimer = ({
	isTimerActive,
	setIsTimerActive,
	timeLeft,
	setTimeLeft,
}) => {
	useEffect(() => {
		let timer;
		if (isTimerActive && timeLeft > 0) {
			timer = setInterval(() => {
				setTimeLeft((prevTime) => prevTime - 1);
			}, 1000);
		} else {
			setIsTimerActive(false);
		}

		return () => clearInterval(timer);
	}, [isTimerActive, timeLeft]);

	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
	};

	return (
		<View style={{ alignItems: "center", marginTop: 20 }}>
			{isTimerActive && (
				<Text style={{ fontSize: 12, color: Colors.iconLightGray }}>
					{formatTime(timeLeft)}
					<Text>{`${timeLeft > 59 ? " minutes" : " seconds"}`}</Text>
				</Text>
			)}
		</View>
	);
};
