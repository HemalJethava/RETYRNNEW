import React, { useEffect } from "react";
import {
	Image,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import ComponentStyles from "../../../../styles/ComponentStyles";
import { styles } from "../MainPanel/styles";
import Colors from "../../../../styles/Colors";
import { Icons } from "../../../../components";
import CommonStyles from "../../../../styles/CommonStyles";
import { noImgUrl } from "../../../../config/CommonFunctions";
import LayoutStyle from "../../../../styles/LayoutStyle";
import FontFamily from "../../../../assets/fonts/FontFamily";
import Icon from "react-native-vector-icons/Ionicons";
import { deviceHeight } from "../../../../utils/DeviceInfo";

export const ReviewDetailModal = ({ show, onHide, detail }) => {
	useEffect(() => {
		if (detail) {
			// detail
		}
	}, [detail]);

	const StarRating = ({ rating, size = 20, color = "#fe7002" }) => {
		const maxStars = 5;
		const fullStars = Math.floor(rating);
		const halfStar = rating - fullStars >= 0.5;
		const emptyStars = maxStars - fullStars - (halfStar ? 1 : 0);

		const stars = [];

		for (let i = 0; i < fullStars; i++) {
			stars.push(
				<Icon key={`full-${i}`} name="star" size={size} color={color} />
			);
		}

		if (halfStar) {
			stars.push(
				<Icon key="half" name="star-half" size={size} color={color} />
			);
		}

		for (let i = 0; i < emptyStars; i++) {
			stars.push(
				<Icon
					key={`empty-${i}`}
					name="star-outline"
					size={size}
					color={color}
				/>
			);
		}

		return <View style={{ flexDirection: "row" }}>{stars}</View>;
	};

	return (
		<Modal
			animationType={"slide"}
			transparent={true}
			visible={show}
			presentationStyle={"overFullScreen"}
			onRequestClose={onHide}
		>
			<View style={reviewStyle.modal}>
				<ScrollView
					style={[styles.endRouteModal, { maxHeight: deviceHeight / 1.3 }]}
					contentContainerStyle={{ ...LayoutStyle.paddingBottom20 }}
					showsVerticalScrollIndicator={false}
				>
					<View style={reviewStyle.headerRow}>
						<TouchableOpacity onPress={onHide}>
							<Icons
								iconSetName={"Feather"}
								iconName={"arrow-left"}
								iconColor={Colors.labelBlack}
								iconSize={20}
							/>
						</TouchableOpacity>
						<View style={reviewStyle.profileImg}>
							<Image
								source={{ uri: detail?.profile_photo_url || noImgUrl }}
								style={reviewStyle.profile}
							/>
						</View>
						<View style={{ ...LayoutStyle.marginLeft10, flex: 1 }}>
							<Text numberOfLines={1} style={reviewStyle.authorName}>
								{detail?.author_name || ""}
							</Text>
							<Text numberOfLines={1} style={reviewStyle.subDetail}>
								{`${detail?.rating || ""} Rating • ${
									detail?.relative_time_description
								}`}
							</Text>
						</View>
					</View>
					<View style={reviewStyle.placeContainer}>
						<Text style={reviewStyle.placeName}>{detail?.main_text}</Text>
						<Text style={reviewStyle.placeDetail}>{detail?.types}</Text>
						<Text style={reviewStyle.placeDetail}>{detail?.distance}</Text>
					</View>
					<View style={{ ...LayoutStyle.paddingVertical10 }}>
						<View style={{ ...CommonStyles.directionRowCenter }}>
							<StarRating rating={detail?.rating} size={14} color="#faab0c" />
							<Text style={reviewStyle.timeSmallTxt}>
								{detail?.relative_time_description}
							</Text>
						</View>
						<Text style={reviewStyle.review}>{detail?.text || ""}</Text>
					</View>
				</ScrollView>
			</View>
		</Modal>
	);
};

const reviewStyle = StyleSheet.create({
	modal: {
		...ComponentStyles.loaderHorizontal,
		backgroundColor: "rgba(0,0,0,0.4)",
	},
	headerRow: {
		...CommonStyles.directionRowCenter,
		...LayoutStyle.paddingBottom10,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E5E5",
	},
	profileImg: {
		height: 34,
		width: 34,
		borderRadius: 17,
		justifyContent: "center",
		alignItems: "center",
		marginLeft: 7,
	},
	profile: {
		height: "100%",
		width: "100%",
		resizeMode: "cover",
	},
	authorName: {
		color: Colors.labelBlack,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsSemiBold,
		width: "80%",
	},
	subDetail: {
		color: Colors.labelDarkGray,
		fontSize: 12,
		fontFamily: FontFamily.PoppinsMedium,
		width: "90%",
	},
	placeName: {
		color: Colors.labelBlack,
		fontSize: 16,
		fontFamily: FontFamily.PoppinsMedium,
	},
	placeDetail: {
		color: Colors.labelDarkGray,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsMedium,
	},
	placeContainer: {
		...LayoutStyle.paddingVertical10,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E5E5",
	},
	timeSmallTxt: {
		color: Colors.labelBlack,
		fontSize: 11,
		fontFamily: FontFamily.PoppinsRegular,
		textAlignVertical: "center",
		top: 2,
		marginLeft: 7,
	},
	review: {
		color: Colors.labelBlack,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsMedium,
		...LayoutStyle.marginTop10,
	},
});
