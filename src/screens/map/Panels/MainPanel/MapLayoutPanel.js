import React, { useMemo } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { BottomSheetScrollView, BottomSheetModal } from "@gorhom/bottom-sheet";
import { styles } from "../MainPanel/styles";
import LayoutStyle from "../../../../styles/LayoutStyle";
import { Icons } from "../../../../components";
import CommonStyles from "../../../../styles/CommonStyles";
import IMAGES from "../../../../assets/images/Images";
import { useDispatch } from "react-redux";
import { setMapLayoutType } from "../../redux/Action";

export const MapLayoutPanel = ({
	layoutPanelRef,
	// snapPoints,
	renderBackdrop,
	handleLayoutClosePanel,
	mapLayoutType,
}) => {
	const dispatch = useDispatch();
	const snapPoints = useMemo(() => ["42%"]);

	const handleMapType = (type) => {
		dispatch(setMapLayoutType(type));
		handleLayoutClosePanel();
	};

	return (
		<BottomSheetModal
			ref={layoutPanelRef}
			snapPoints={snapPoints}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={true}
			enableDynamicSizing={false}
			backgroundStyle={styles.backgroundStyle}
		>
			<BottomSheetScrollView
				style={{ ...LayoutStyle.paddingHorizontal20 }}
				showsVerticalScrollIndicator={false}
			>
				<View style={[{ ...CommonStyles.directionRowSB }]}>
					<Text style={styles.chooseMap}>{"Choose Map"}</Text>
					<TouchableOpacity
						style={[styles.closeBtn]}
						onPress={handleLayoutClosePanel}
					>
						<Icons
							iconSetName={"MaterialCommunityIcons"}
							iconName={"window-close"}
							iconSize={16}
							iconColor={"#888"}
						/>
					</TouchableOpacity>
				</View>
				<View style={styles.mapLayoutRow}>
					<TouchableOpacity
						style={[
							styles.layoutOption,
							{ borderWidth: mapLayoutType === "standard" ? 2 : 0 },
						]}
						onPress={() => handleMapType("standard")}
					>
						<View style={styles.layoutImgBox}>
							<Image source={IMAGES.ExploreMap} style={styles.layoutImg} />
						</View>
						<Text style={styles.layoutTxt}>{"Explore"}</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.layoutOption,
							{ borderWidth: mapLayoutType === "hybrid" ? 2 : 0 },
						]}
						onPress={() => handleMapType("hybrid")}
					>
						<View style={styles.layoutImgBox}>
							<Image source={IMAGES.DrivingMap} style={styles.layoutImg} />
						</View>
						<Text style={styles.layoutTxt}>{"Driving"}</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.mapLayoutRow}>
					<TouchableOpacity
						style={[
							styles.layoutOption,
							{ borderWidth: mapLayoutType === "terrain" ? 2 : 0 },
						]}
						onPress={() => handleMapType("terrain")}
					>
						<View style={styles.layoutImgBox}>
							<Image source={IMAGES.TransitMap} style={styles.layoutImg} />
						</View>
						<Text style={styles.layoutTxt}>{"Transit"}</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.layoutOption,
							{ borderWidth: mapLayoutType === "satellite" ? 2 : 0 },
						]}
						onPress={() => handleMapType("satellite")}
					>
						<View style={styles.layoutImgBox}>
							<Image source={IMAGES.SatelliteMap} style={styles.layoutImg} />
						</View>
						<Text style={styles.layoutTxt}>{"Satellite"}</Text>
					</TouchableOpacity>
				</View>
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
};
