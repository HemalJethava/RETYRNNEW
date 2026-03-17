import { Platform, StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "./ResponsiveScreens";
import { RFPercentage } from "./ResponsiveFonts";

const LayoutStyle = StyleSheet.create({
	marginTop5: { marginTop: hp(0.5) },
	//margin 10 for all sides

	margin10: {
		margin: hp(1),
	},
	marginTop10: {
		marginTop: hp(1),
	},
	marginBottom10: {
		marginBottom: hp(1),
	},
	marginBottom15: {
		marginBottom: hp(1.5),
	},
	marginVertical10: {
		marginVertical: hp(1),
	},
	marginLeft10: {
		marginLeft: hp(1),
	},
	marginRight10: {
		marginRight: hp(1),
	},
	marginHorizontal10: {
		marginHorizontal: hp(1),
	},

	//margin 20 for all sides

	margin20: {
		margin: hp(2.5),
	},
	marginTop20: {
		marginTop: hp(2.5),
	},
	marginBottom20: {
		marginBottom: hp(2.5),
	},
	marginVertical20: {
		marginVertical: hp(2.5),
	},
	marginLeft20: {
		marginLeft: hp(2.5),
	},
	marginRight20: {
		marginRight: hp(2.5),
	},
	marginHorizontal20: {
		marginHorizontal: hp(2.5),
	},

	// Padding 10 for all sides

	padding10: {
		padding: hp(1),
	},
	paddingTop10: {
		paddingTop: hp(1),
	},
	paddingBottom10: {
		paddingBottom: hp(1),
	},
	paddingVertical10: {
		paddingVertical: hp(1.2),
	},
	paddingLeft10: {
		paddingLeft: hp(1),
	},
	paddingRight10: {
		paddingRight: hp(1),
	},
	paddingHorizontal10: {
		paddingHorizontal: hp(1),
	},

	// Padding 15 for all sides

	padding15: {
		padding: hp(1.5),
	},

	// Padding 20 for all sides

	padding20: {
		padding: hp(2.5),
	},
	paddingTop20: {
		paddingTop: hp(2.5),
	},
	paddingBottom20: {
		paddingBottom: hp(2.5),
	},
	paddingVertical20: {
		paddingVertical: hp(2.5),
	},
	paddingLeft20: {
		paddingLeft: hp(2.5),
	},
	paddingRight20: {
		paddingRight: hp(2.5),
	},
	paddingHorizontal20: {
		paddingHorizontal: hp(2.5),
	},

	// Padding 30 for all sides
	paddingBottom30: {
		paddingBottom: hp(3.5),
	},
	paddingVertical30: {
		paddingVertical: hp(3.5),
	},
	paddingTop30: {
		paddingTop: hp(3.5),
	},

	padding25: {
		padding: hp(3),
	},
	paddingBottom50: {
		paddingBottom: hp(5.5),
	},
	fontSize4: {
		fontSize: RFPercentage(1),
	},
	fontSize6: {
		fontSize: RFPercentage(1.2),
	},
	fontSize8: {
		fontSize: RFPercentage(1.4),
	},
	// Font size 10
	fontSize10: {
		// fontSize: Platform.OS === "android" ? RFPercentage(1.4) : RFPercentage(1.2),
		fontSize: RFPercentage(1.6),
	},
	fontSize12: {
		fontSize: RFPercentage(1.8),
	},
	fontSize14: {
		fontSize: RFPercentage(2),
	},
	fontSize16: {
		fontSize: RFPercentage(2.2),
	},
	fontSize18: {
		fontSize: RFPercentage(2.4),
	},
	fontSize20: {
		fontSize: RFPercentage(2.6),
	},
	fontSize22: {
		fontSize: RFPercentage(2.8),
	},
	fontSize24: {
		fontSize: RFPercentage(3),
	},
	fontSize26: {
		fontSize: RFPercentage(3.2),
	},
	fontSize28: {
		fontSize: RFPercentage(3.4),
	},
	fontSize34: {
		fontSize: RFPercentage(4),
	},
});

export default LayoutStyle;
