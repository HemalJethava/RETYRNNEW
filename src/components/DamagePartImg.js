import { View, TouchableOpacity, ImageBackground } from "react-native";
import React from "react";
import ComponentStyles from "../styles/ComponentStyles";
import Colors from "../styles/Colors";
import Icons from "./Icons";
import IMAGES from "../assets/images/Images";

const DamagePartImg = ({
	truckFront,
	handleAccidentSideFront,
	truckFrontLeft,
	handleAccidentSideFrontLeft,
	truckMiddleLeft,
	handleAccidentSideMiddleLeft,
	truckBackLeft,
	handleAccidentSideBackLeft,
	truckTop,
	handleAccidentSideTop,
	truckFrontRight,
	handleAccidentSideFrontRight,
	truckMiddleRight,
	handleAccidentSideMiddleRight,
	truckBackRight,
	handleAccidentSideBackRight,
	truckBack,
	handleAccidentSideBack,
}) => {
	return (
		<View>
			<TouchableOpacity
				style={[ComponentStyles.sideContainer]}
				onPress={handleAccidentSideFront}
			>
				<View
					style={[
						ComponentStyles.viewRoundSide,
						{
							backgroundColor: truckFront
								? Colors.secondary
								: Colors.transparent,
						},
					]}
				>
					<Icons
						iconName={"check-circle-outline"}
						iconSetName={"MaterialCommunityIcons"}
						iconColor={truckFront ? Colors.white : Colors.transparent}
						iconSize={20}
					/>
				</View>
			</TouchableOpacity>
			<View style={[ComponentStyles.displayCenter]}>
				<View style={[ComponentStyles.displayColumn]}>
					{/* left side button */}
					<TouchableOpacity onPress={handleAccidentSideFrontLeft}>
						<View
							style={[
								ComponentStyles.viewRoundSide,
								{
									backgroundColor: truckFrontLeft
										? Colors.secondary
										: Colors.transparent,
								},
							]}
						>
							<Icons
								iconName={"check-circle-outline"}
								iconSetName={"MaterialCommunityIcons"}
								iconColor={truckFrontLeft ? Colors.white : Colors.transparent}
								iconSize={20}
							/>
						</View>
					</TouchableOpacity>
					<TouchableOpacity onPress={handleAccidentSideMiddleLeft}>
						<View
							style={[
								ComponentStyles.viewRoundSide,
								{
									backgroundColor: truckMiddleLeft
										? Colors.secondary
										: Colors.transparent,
								},
							]}
						>
							<Icons
								iconName={"check-circle-outline"}
								iconSetName={"MaterialCommunityIcons"}
								iconColor={truckMiddleLeft ? Colors.white : Colors.transparent}
								iconSize={20}
							/>
						</View>
					</TouchableOpacity>
					<TouchableOpacity onPress={handleAccidentSideBackLeft}>
						<View
							style={[
								ComponentStyles.viewRoundSide,
								{
									backgroundColor: truckBackLeft
										? Colors.secondary
										: Colors.transparent,
								},
							]}
						>
							<Icons
								iconName={"check-circle-outline"}
								iconSetName={"MaterialCommunityIcons"}
								iconColor={truckBackLeft ? Colors.white : Colors.transparent}
								iconSize={20}
							/>
						</View>
					</TouchableOpacity>
				</View>
				{/* Main truck image */}
				<View>
					<ImageBackground
						source={IMAGES.fullTruck}
						style={[ComponentStyles.fullTruckImg]}
						resizeMode="contain"
					>
						<TouchableOpacity onPress={handleAccidentSideTop}>
							<View
								style={[
									ComponentStyles.viewRoundSide,
									{
										backgroundColor: truckTop
											? Colors.secondary
											: Colors.transparent,
									},
								]}
							>
								<Icons
									iconName={"check-circle-outline"}
									iconSetName={"MaterialCommunityIcons"}
									iconColor={truckTop ? Colors.white : Colors.transparent}
									iconSize={20}
								/>
							</View>
						</TouchableOpacity>
					</ImageBackground>
				</View>
				<View style={[ComponentStyles.displayColumn]}>
					{/* Right side button */}
					<TouchableOpacity onPress={handleAccidentSideFrontRight}>
						<View
							style={[
								ComponentStyles.viewRoundSide,
								{
									backgroundColor: truckFrontRight
										? Colors.secondary
										: Colors.transparent,
								},
							]}
						>
							<Icons
								iconName={"check-circle-outline"}
								iconSetName={"MaterialCommunityIcons"}
								iconColor={truckFrontRight ? Colors.white : Colors.transparent}
								iconSize={20}
							/>
						</View>
					</TouchableOpacity>
					<TouchableOpacity onPress={handleAccidentSideMiddleRight}>
						<View
							style={[
								ComponentStyles.viewRoundSide,
								{
									backgroundColor: truckMiddleRight
										? Colors.secondary
										: Colors.transparent,
								},
							]}
						>
							<Icons
								iconName={"check-circle-outline"}
								iconSetName={"MaterialCommunityIcons"}
								iconColor={truckMiddleRight ? Colors.white : Colors.transparent}
								iconSize={20}
							/>
						</View>
					</TouchableOpacity>
					<TouchableOpacity onPress={handleAccidentSideBackRight}>
						<View
							style={[
								ComponentStyles.viewRoundSide,
								{
									backgroundColor: truckBackRight
										? Colors.secondary
										: Colors.transparent,
								},
							]}
						>
							<Icons
								iconName={"check-circle-outline"}
								iconSetName={"MaterialCommunityIcons"}
								iconColor={truckBackRight ? Colors.white : Colors.transparent}
								iconSize={20}
							/>
						</View>
					</TouchableOpacity>
				</View>
			</View>
			<TouchableOpacity
				style={[ComponentStyles.sideContainer]}
				onPress={handleAccidentSideBack}
			>
				<View
					style={[
						ComponentStyles.viewRoundSide,
						{
							backgroundColor: truckBack
								? Colors.secondary
								: Colors.transparent,
						},
					]}
				>
					<Icons
						iconName={"check-circle-outline"}
						iconSetName={"MaterialCommunityIcons"}
						iconColor={truckBack ? Colors.white : Colors.transparent}
						iconSize={20}
					/>
				</View>
			</TouchableOpacity>
		</View>
	);
};

export default DamagePartImg;
