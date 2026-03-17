import { StyleSheet } from "react-native";
import Colors from "./Colors";
import FontFamily from "../assets/fonts/FontFamily";

const NoInternetStyle = StyleSheet.create({
	continer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	mainContainer: {
		padding: 20,
		backgroundColor: Colors.white,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -3 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 5,
		borderRadius: 7,
		borderWidth: 1,
		borderColor: "#ddd",
		justifyContent: "center",
		alignItems: "center",
	},
	textContainer: {
		marginTop: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		fontSize: 18,
		color: Colors.labelBlack,
		fontFamily: FontFamily.PoppinsBold,
	},
	discription: {
		fontSize: 14,
		color: Colors.labelDarkGray,
		textAlign: "center",
		marginBottom: 20,
	},
	againBtn: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.secondary,
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 25,
		width: 220,
		// width: "100%",
	},
	againText: {
		fontSize: 14,
		color: Colors.white,
		fontFamily: FontFamily.PoppinsSemiBold,
	},
});
export default NoInternetStyle;
