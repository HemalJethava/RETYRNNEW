import React, { useEffect, useState } from "react";
import { SectionList, Text, View } from "react-native";
import sectionListGetItemLayout from "./sectionListGetItemLayout";
import { AlphabetList } from "../..";
import CommonStyles from "../../../../styles/CommonStyles";
import MESSAGE from "../../../../utils/Messages";

const LexicalSectionList = (props) => {
	const [sectionListRef, setSectionListRef] = useState();
	const [parentHeight, setParentHeight] = useState(0);

	useEffect(() => {
		if (
			!props.disableScrollToTopOnDataUpdate &&
			props.sections &&
			sectionListRef &&
			props.sections.length
		) {
			sectionListRef.scrollToLocation({
				sectionIndex: 0,
				itemIndex: 0,
			});
		}
	}, [props.sections]);
	const getItemLayoutParams = { getItemHeight: () => props.itemHeight };
	Object.assign(
		getItemLayoutParams,
		props.separatorHeight !== undefined && {
			getSeparatorHeight: () => props.separatorHeight,
		},
		props.sectionHeaderHeight !== undefined && {
			getSectionHeaderHeight: () => props.sectionHeaderHeight,
		},
		props.sectionFooterHeight !== undefined && {
			getSectionFooterHeight: () => props.sectionFooterHeight,
		},
		props.listHeaderHeight && { listHeaderHeight: props.listHeaderHeight }
	);
	const getItemLayout = sectionListGetItemLayout(getItemLayoutParams);

	return (
		<View style={[props.style]}>
			<SectionList
				contentContainerStyle={{ paddingBottom: "35%" }}
				showsVerticalScrollIndicator={false}
				style={props.listStyle}
				ref={(ref) => {
					setSectionListRef(ref);
				}}
				ListEmptyComponent={
					<View style={[CommonStyles.emptyDataAlign]}>
						<Text style={[CommonStyles.emptyDataBlack]}>{MESSAGE.noData}</Text>
					</View>
				}
				getItemLayout={(data, index) => getItemLayout(data, index)}
				stickySectionHeadersEnabled={true}
				maxToRenderPerBatch={100}
				initialNumToRender={100}
				{...props}
			/>
			<View
				style={{
					position: "absolute",
					alignSelf: "flex-end",
					// height: "65%",
					top: 100,
				}}
				onLayout={(event) => setParentHeight(event.nativeEvent.layout.height)}
			>
				<AlphabetList
					parentHeight={parentHeight}
					data={props.sections.map((section) => section.title)}
					onItemSelect={(item, index) => {
						if (sectionListRef) {
							sectionListRef.scrollToLocation({
								sectionIndex: index,
								itemIndex: 0,
							});
						}
					}}
					{...props.alphabetListOptions}
				/>
			</View>
		</View>
	);
};

export default LexicalSectionList;
