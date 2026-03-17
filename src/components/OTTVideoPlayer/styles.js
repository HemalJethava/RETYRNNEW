import { StyleSheet, Dimensions } from "react-native";
import Colors from "../../styles/Colors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		// backgroundColor: Colors.black,
	},
	videoWrapper: {
		// backgroundColor: Colors.black,
		justifyContent: "center",
		alignItems: "center",
	},

	fullscreenVideo: {
		width: screenHeight,
		height: screenWidth,
	},
	video: {
		width: "100%",
		height: "100%",
	},
	loadingContainer: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.4)",
	},
	controlsOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.35)",
		justifyContent: "space-between",
		paddingVertical: 10,
	},
	topControls: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		width: "100%",
		paddingHorizontal: 12,
	},
	videoTitle: {
		color: Colors.white,
		fontSize: 16,
		flex: 1,
		textAlign: "center",
		marginHorizontal: 10,
	},
	centerControls: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	bottomControls: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 10,
	},
	timeText: {
		color: Colors.white,
		fontSize: 12,
	},
	speedText: {
		color: Colors.white,
		fontSize: 13,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	menuContainer: {
		backgroundColor: "#222",
		borderRadius: 8,
		padding: 15,
		width: 200,
	},
	menuTitle: {
		color: Colors.white,
		fontSize: 16,
		marginBottom: 10,
		textAlign: "center",
	},
	menuItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 6,
	},
	menuItemText: {
		color: "#ccc",
		fontSize: 14,
	},
	menuItemSelected: {
		color: Colors.white,
		fontWeight: "bold",
	},
	leftHalf: {
		position: "absolute",
		left: -14,
		top: 0,
		bottom: 0,
		width: "50%",
		zIndex: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	rightHalf: {
		position: "absolute",
		right: -14,
		top: 0,
		bottom: 0,
		width: "50%",
		zIndex: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	doubleTapAnim: {
		position: "absolute",
		top: "40%",
		zIndex: 20,
		alignItems: "center",
		justifyContent: "center",
		opacity: 0.9,
	},
	leftAnim: {
		left: "15%",
	},
	rightAnim: {
		right: "15%",
	},
	gestureOverlay: {
		position: "absolute",
		top: -"50%",
		alignItems: "center",
		justifyContent: "center",
	},
	volumeGestureOverlay: {
		position: "absolute",
		top: -"50%",
		alignItems: "center",
		justifyContent: "center",
	},
	gestureBarContainer: {
		width: 7,
		height: 100,
		backgroundColor: "rgba(255,255,255,0.2)",
		borderRadius: 4,
		overflow: "hidden",
		marginTop: 6,
	},
	gestureBarFill: {
		width: "100%",
		backgroundColor: "#E50914",
		position: "absolute",
		bottom: 0,
	},
});
