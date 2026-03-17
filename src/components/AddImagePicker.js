import { FlatList } from "react-native";
import React from "react";

const AddImagePicker = ({ data, renderItem }) => {
	return (
		<FlatList
			scrollEnabled={false}
			data={data}
			renderItem={renderItem}
			horizontal={false}
			columnWrapperStyle={{
				justifyContent: "space-between",
			}}
			numColumns={2}
		/>
	);
};

export default AddImagePicker;
