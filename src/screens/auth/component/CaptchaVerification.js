import React, { useEffect, useState } from "react";
import {
	Modal,
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import ComponentStyles from "../../../styles/ComponentStyles";
import Colors from "../../../styles/Colors";
import LayoutStyle from "../../../styles/LayoutStyle";
import FontFamily from "../../../assets/fonts/FontFamily";
import CommonStyles from "../../../styles/CommonStyles";
import { Icons, Input } from "../../../components";
import FastImage from "react-native-fast-image";
import { isEmpty } from "../../../utils/Validation";
import Api from "../../../utils/Api";
import { noImgUrl } from "../../../config/CommonFunctions";

export const CaptchaVerification = ({
	show,
	onHide,
	timeZone,
	email,
	getCaptcha,
	captchaDetail,
	onSuccess,
}) => {
	const [captchaLoading, setCaptchaLoading] = useState(false);
	const [captcha, setCaptcha] = useState("");
	const [isCaptcha, setIsCaptcha] = useState(false);
	const [captchaPress, setCaptchaPress] = useState(true);
	const [captchaMsg, setCaptchaMsg] = useState("");

	const [captchaImg, setCaptchaImg] = useState("");

	useEffect(() => {
		if (show && captchaDetail) {
			setTimeout(() => setCaptchaImg(captchaDetail?.image), 300);
		}
	}, [show, captchaDetail]);

	const onChangeCaptcha = (text) => {
		setCaptcha(text);
		setIsCaptcha(false);
	};
	const captchaValidate = () => {
		let isValid = true;

		if (isEmpty(captcha)) {
			setIsCaptcha(true);
			setCaptchaMsg("Please enter captch");
			isValid = false;
		}

		return isValid;
	};
	const handleCaptcha = async () => {
		try {
			let isValid = captchaValidate();
			if (isValid) {
				setCaptchaLoading(true);
				const payload = {
					timezone: timeZone,
					email: email,
					captcha: captcha,
					captcha_key: captchaDetail?.key,
				};
				console.log("payload: ", payload);
				const response = await Api.post(`user/verify-captcha`, payload);
				console.log("response:", response);

				setCaptchaLoading(false);

				if (response.success) {
					onSuccess(response.message);
				} else {
					setIsCaptcha(true);
					setCaptchaMsg(response.message);
				}
			}
		} catch (error) {
			setCaptchaLoading(false);
			console.warn("Error: ", error);
		}
	};

	return (
		<Modal
			animationType={"slide"}
			transparent={true}
			visible={show}
			presentationStyle={"overFullScreen"}
			onRequestClose={onHide}
		>
			<View style={styles.modal}>
				<View style={styles.endRouteModal}>
					<View style={styles.header}>
						<Text style={styles.title}>{"Captcha Verification"}</Text>
						<TouchableOpacity style={styles.closeBtn} onPress={onHide}>
							<Icons
								iconSetName={"Ionicons"}
								iconName={"close"}
								iconSize={16}
								iconColor={Colors.labelDarkGray}
							/>
						</TouchableOpacity>
					</View>
					<View style={styles.captchaBox}>
						<View style={styles.captchaRow}>
							<FastImage
								style={styles.captchaImg}
								source={{ uri: captchaImg || noImgUrl }}
								resizeMode={FastImage.resizeMode.cover}
							/>
							<TouchableOpacity
								style={styles.refreshBtn}
								onPress={getCaptcha}
								disabled={captchaLoading}
							>
								<Icons
									iconSetName={"Ionicons"}
									iconName={"refresh"}
									iconColor={Colors.white}
									iconSize={20}
								/>
							</TouchableOpacity>
						</View>
						<View style={{ ...LayoutStyle.marginTop20 }}>
							<Input
								isDarkBG={false}
								value={captcha}
								placeholder={"captcha"}
								maxLength={5}
								onChangeText={(text) => onChangeCaptcha(text)}
								iconName={"alphabet-latin"}
								iconSetName={"MaterialDesignIcons"}
								isValidationShow={isCaptcha}
								validationMessage={captchaMsg}
								keyboardType={"default"}
								returnKeyType={"done"}
								blurOnSubmit={true}
								onFocus={() => setCaptchaPress(true)}
								onBlur={() => setCaptchaPress(false)}
								isPressOut={captchaPress}
								onPressFocus={() => setCaptchaPress(true)}
								inputMainStyle={{ ...LayoutStyle.marginBottom20 }}
							/>
							<TouchableOpacity
								style={[
									styles.commonBtn,
									{
										backgroundColor: captchaLoading
											? Colors.disableBtn
											: Colors.secondary,
									},
								]}
								disabled={captchaLoading}
								onPress={handleCaptcha}
							>
								{captchaLoading && (
									<ActivityIndicator color={Colors.white} size={"small"} />
								)}
								<Text
									style={[
										styles.btnTitle,
										{ marginLeft: captchaLoading ? 5 : 0 },
									]}
								>
									{captchaLoading ? "Loading" : "Verify"}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modal: {
		flex: 1,
		...ComponentStyles.loaderHorizontal,
		...LayoutStyle.paddingHorizontal20,
		backgroundColor: "rgba(0,0,0,0.4)",
	},
	endRouteModal: {
		width: "100%",
		backgroundColor: Colors.white,
		borderRadius: 16,
	},
	header: {
		...CommonStyles.directionRowSB,
		...LayoutStyle.paddingHorizontal20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#F5F5F5",
	},
	title: {
		color: Colors.labelBlack,
		fontSize: 16,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
	closeBtn: {
		padding: 5,
		borderRadius: 20,
		backgroundColor: Colors.lightGrayBG,
	},
	captchaBox: {
		...LayoutStyle.padding20,
	},
	captchaRow: {
		height: 70,
		borderWidth: 1,
		borderColor: "#F5F5F5",
		borderRadius: 5,
		flexDirection: "row",
		alignItems: "center",
		overflow: "hidden",
	},
	captchaImg: {
		height: "100%",
		flex: 1,
	},
	refreshBtn: {
		height: "100%",
		width: 60,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.secondary,
	},
	commonBtn: {
		...LayoutStyle.padding10,
		...CommonStyles.directionRowCenter,
		justifyContent: "center",
		width: "100%",
		borderRadius: 30,
	},
	btnTitle: {
		color: Colors.labelWhite,
		fontFamily: FontFamily.PoppinsMedium,
		alignSelf: "center",
		...LayoutStyle.fontSize14,
		padding: "1%",
	},
});
