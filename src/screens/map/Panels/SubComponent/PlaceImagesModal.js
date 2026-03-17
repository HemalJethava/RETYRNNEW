// PlaceImagesModal.js
import React, { useEffect, useState, useRef } from "react";
import {
	Modal,
	View,
	Text,
	TouchableOpacity,
	Image,
	ScrollView,
	Dimensions,
	StyleSheet,
	SafeAreaView,
	TouchableWithoutFeedback,
	Platform,
	Animated,
	ActivityIndicator,
} from "react-native";
import Colors from "../../../../styles/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FontFamily from "../../../../assets/fonts/FontFamily";
import { Icons } from "../../../../components";
import LayoutStyle from "../../../../styles/LayoutStyle";
import IncidentSkeleton from "../../../../components/LoaderComponents/IncidentSkeleton";
import { deviceWidth } from "../../../../utils/DeviceInfo";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const H_PADDING = 16;
const GAP = 10;
const COLUMN_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - GAP) / 2;
const MAX_TOP_IMAGE_HEIGHT = 350;

export const PlaceImagesModal = ({
	show,
	onHide = () => {},
	photos = [],
	placeName = "",
}) => {
	const [meta, setMeta] = useState([]);
	const [viewerVisible, setViewerVisible] = useState(false);
	const [viewerIndex, setViewerIndex] = useState(0);
	const [loading, setLoading] = useState(true);

	const opacity = useRef(new Animated.Value(0)).current;
	const viewerRef = useRef(null);
	const insets = useSafeAreaInsets();

	useEffect(() => {
		let mounted = true;
		if (!photos || photos.length === 0) {
			setMeta([]);
			return () => (mounted = false);
		}

		const loadSize = (uri) =>
			new Promise((resolve) => {
				Image.getSize(
					uri,
					(w, h) => resolve({ uri, w, h, aspect: w / h || 1 }),
					() => {
						resolve({ uri, w: 1, h: 1, aspect: 1 });
					}
				);
			});

		(async () => {
			try {
				const results = await Promise.all(photos.map((p) => loadSize(p)));
				if (mounted) setMeta(results);
			} catch (e) {
				if (mounted)
					setMeta(photos.map((p) => ({ uri: p, w: 1, h: 1, aspect: 1 })));
			}
		})();

		return () => (mounted = false);
	}, [photos]);

	useEffect(() => {
		if (viewerVisible && viewerRef.current) {
			viewerRef.current.scrollTo({
				x: viewerIndex * SCREEN_WIDTH,
				y: 0,
				animated: false,
			});
		}
	}, [viewerVisible, viewerIndex]);

	if (!show) return null;

	const topImageMeta = meta[0] || null;
	const bottomMeta = meta.slice(1);

	const handleLoad = () => {
		setLoading(false);
		Animated.timing(opacity, {
			toValue: 1,
			duration: 300,
			useNativeDriver: true,
		}).start();
	};
	const FadeInImage = ({ uri, style, resizeMode = "cover" }) => (
		<View style={[{ justifyContent: "center", alignItems: "center" }, style]}>
			{loading && (
				<ActivityIndicator
					size="small"
					color={Colors.secondary}
					style={{ position: "absolute", zIndex: 2 }}
				/>
			)}
			<Animated.Image
				source={{ uri }}
				style={[style, { opacity }]}
				resizeMode={resizeMode}
				onLoad={handleLoad}
			/>
		</View>
	);
	const renderTopImage = () => {
		if (!topImageMeta) return null;
		const aspect = topImageMeta.aspect || 1;
		const height = Math.min(MAX_TOP_IMAGE_HEIGHT, SCREEN_WIDTH / aspect);
		return (
			<TouchableOpacity
				activeOpacity={0.9}
				onPress={() => {
					setViewerIndex(0);
					setViewerVisible(true);
				}}
			>
				<FadeInImage
					uri={topImageMeta.uri}
					style={[styles.topImage, { height }]}
				/>
			</TouchableOpacity>
		);
	};
	const renderGrid = () => {
		return (
			<View style={styles.gridContainer}>
				{bottomMeta.map((m, idx) => {
					const aspect = m.aspect || 1;
					let height = COLUMN_WIDTH / aspect;
					if (height > 300) height = 300;
					if (height < 80) height = 80;
					const absoluteIndex = idx + 1;
					const isRight = (idx + 1) % 2 === 0;
					return (
						<TouchableOpacity
							key={`${m.uri}-${idx}`}
							style={[styles.gridItem, { width: COLUMN_WIDTH + 21, height }]}
							onPress={() => {
								setTimeout(() => {
									setViewerIndex(absoluteIndex);
									setViewerVisible(true);
								}, 300);
							}}
							activeOpacity={0.9}
						>
							<FadeInImage
								uri={m.uri}
								style={[
									styles.gridImage,
									{ borderRightWidth: isRight ? 0 : 2 },
								]}
								resizeMode={"cover"}
							/>
						</TouchableOpacity>
					);
				})}
			</View>
		);
	};

	return (
		<Modal
			visible={show}
			animationType="slide"
			presentationStyle="overFullScreen"
			onRequestClose={onHide}
		>
			<View style={styles.safe}>
				<ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
					<View style={styles.positionReletive}>
						{renderTopImage()}
						<View
							style={[
								styles.header,
								{ top: Platform.OS === "ios" ? insets.top : 0 },
							]}
						>
							<View style={styles.flex}>
								<Text style={styles.title}>{"Photos from Visitors"}</Text>
								{placeName ? (
									<Text style={styles.subtitle}>
										{placeName} · {photos?.length || 0} photos
									</Text>
								) : null}
							</View>
							<TouchableOpacity onPress={onHide} style={styles.closeBtn}>
								<Icons
									iconSetName={"Ionicons"}
									iconName={"close"}
									iconColor={Colors.white}
									iconSize={20}
								/>
							</TouchableOpacity>
						</View>
					</View>
					{bottomMeta.length > 0 ? renderGrid() : null}
				</ScrollView>

				<Modal
					visible={viewerVisible}
					animationType="fade"
					onRequestClose={() => setViewerVisible(false)}
					statusBarTranslucent={true}
				>
					<SafeAreaView style={styles.viewerContainer}>
						<View style={[styles.viewerTop, { top: insets.top }]}>
							<TouchableOpacity
								onPress={() => setViewerVisible(false)}
								style={styles.viewerClose}
							>
								<Icons
									iconSetName={"FontAwesome6"}
									iconName={"chevron-left"}
									iconColor={Colors.blueActiveBtn}
									iconSize={22}
								/>
							</TouchableOpacity>

							<Text style={styles.viewerCounter}>{`${viewerIndex + 1} of ${
								meta.length
							}`}</Text>
							<View />
						</View>

						<ScrollView
							horizontal
							pagingEnabled
							ref={viewerRef}
							showsHorizontalScrollIndicator={false}
							contentOffset={{ x: viewerIndex * SCREEN_WIDTH, y: 0 }}
							onMomentumScrollEnd={(e) => {
								const page = Math.round(
									e.nativeEvent.contentOffset.x / SCREEN_WIDTH
								);
								setViewerIndex(page);
							}}
							style={[styles.imgScrollSlider]}
						>
							{meta.map((m, i) => (
								<TouchableWithoutFeedback
									key={`view-${i}`}
									onPress={() => setViewerVisible(false)}
								>
									<View style={styles.sliderImgView}>
										<Image source={{ uri: m.uri }} style={styles.sliderImg} />
									</View>
								</TouchableWithoutFeedback>
							))}
						</ScrollView>
					</SafeAreaView>
				</Modal>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	safe: {
		flex: 1,
		backgroundColor: "#fff",
	},
	flex: {
		flex: 1,
	},
	header: {
		paddingHorizontal: H_PADDING,
		paddingTop: 12,
		paddingBottom: 8,
		flexDirection: "row",
		alignItems: "center",
		position: "absolute",
		left: 0,
		right: 0,
	},
	positionReletive: {
		position: "relative",
	},
	title: {
		color: Colors.white,
		fontSize: 22,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
	subtitle: {
		color: Colors.white,
		fontSize: 14,
		fontFamily: FontFamily.PoppinsMedium,
		marginTop: 4,
	},
	closeBtn: {
		backgroundColor: Colors.labelDarkGray,
		padding: 5,
		borderRadius: 20,
	},
	scroll: {
		flex: 1,
		backgroundColor: Colors.white,
	},
	topImage: {
		width: "100%",
		borderBottomWidth: 2,
		borderBottomColor: Colors.white,
	},
	gridContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	gridItem: {
		borderRadius: 0,
		overflow: "hidden",
	},
	gridImage: {
		width: "100%",
		height: "100%",
		borderBottomWidth: 2,
		borderBottomColor: Colors.white,
		borderRightWidth: 2,
		borderRightColor: Colors.white,
	},
	viewerContainer: {
		flex: 1,
		backgroundColor: Colors.lightGrayBG,
	},
	viewerTop: {
		position: "absolute",
		zIndex: 10,
		left: 0,
		right: 0,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: Colors.lightGrayBG,
		...LayoutStyle.paddingVertical10,
		...LayoutStyle.paddingHorizontal20,
		borderBottomWidth: 1,
		borderBottomColor: "#d6d6d6",
	},
	viewerCounter: {
		color: Colors.labelBlack,
		fontSize: 16,
		fontFamily: FontFamily.PoppinsSemiBold,
		textAlign: "left",
		left: -10,
	},
	viewerClose: {},
	imgScrollSlider: {
		flex: 1,
		backgroundColor: Colors.white,
	},
	sliderImgView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	sliderImg: {
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT / 1.4,
		// backgroundColor: "#ccc",
		resizeMode: "contain",
	},
});
