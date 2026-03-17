import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { styles } from "./styles";
import CommonStyles from "../../../../styles/CommonStyles";
import { Icons, Loader } from "../../../../components";
import Colors from "../../../../styles/Colors";
import Api from "../../../../utils/Api";
import { showMessage } from "react-native-flash-message";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import LayoutStyle from "../../../../styles/LayoutStyle";

export const NotePanel = ({
	notePanelRef,
	snapPoints,
	renderBackdrop,
	handleNoteClosePanel,
	notePlaceId,
}) => {
	const [isPageLoader, setIsPageLoader] = useState(false);

	const [isLoading, setIsLoading] = useState(false);
	const [note, setNote] = useState("");
	const [selectecNote, setSelectedNote] = useState("");
	const [selection, setSelection] = useState({ start: 0, end: 0 });

	useEffect(() => {
		if (notePlaceId) {
			getNotes();
		}
	}, [notePlaceId]);

	const getNotes = async () => {
		try {
			setIsLoading(true);
			const response = await Api.get(`user/get-notes`);
			setIsLoading(false);
			if (response.success && notePlaceId) {
				const found = response.data.find(
					(item) => item.place_id === notePlaceId
				);
				setSelectedNote(found);

				if (found && found.notes !== note) {
					setNote(found.notes);
				}
			}
		} catch (error) {
			setIsLoading(false);
			console.warn("Error: ", error);
		}
	};
	const onChangeNote = (text) => {
		setNote(text);
	};
	const onPressDelete = async () => {
		try {
			setIsPageLoader(true);
			const data = {
				action: "delete",
				place_id: notePlaceId,
				note: note,
			};

			const response = await Api.post(`user/update-note`, data);
			setIsPageLoader(false);

			if (response.success) {
				handleClose({ isReload: true });
			} else {
				showMessage({
					message: response.message,
					type: "danger",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			}
		} catch (error) {
			setIsPageLoader(false);
			console.warn("Error: ", error);
		}
	};
	const handleClose = ({ isReload }) => {
		handleNoteClosePanel(isReload ? isReload : false);
		setNote("");
		setSelectedNote(null);
	};
	const onPressDone = async () => {
		try {
			if (!notePlaceId) return;
			setIsPageLoader(true);
			const payload = {
				action:
					selectecNote && !note
						? "delete"
						: selectecNote && note
						? "update"
						: "insert",
				place_id: notePlaceId,
				note: note,
			};

			const response = await Api.post(`user/update-note`, payload);
			setIsPageLoader(false);

			if (response.success) {
				handleClose({ isReload: true });
				showMessage({
					message: response.message,
					type: "success",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			} else {
				showMessage({
					message: response.message,
					type: "danger",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			}
		} catch (error) {
			setIsPageLoader(false);
			console.warn("Error: ", error);
		}
	};
	const NoteLoader = () => {
		const array = Array(1).fill(0);
		return (
			<View style={{ flex: 1 }}>
				{array.map((i, index) => (
					<View key={index} style={{ ...LayoutStyle.marginVertical10 }}>
						<SkeletonPlaceholder speed={800} backgroundColor={"#E1E9EE"}>
							<SkeletonPlaceholder.Item
								width={"100%"}
								height={280}
								borderRadius={8}
							/>
						</SkeletonPlaceholder>
					</View>
				))}
			</View>
		);
	};
	return (
		<BottomSheetModal
			ref={notePanelRef}
			snapPoints={["90%"]}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={true}
			enableDynamicSizing={false}
			backgroundStyle={styles.backgroundStyle}
		>
			<Loader show={isPageLoader} />
			<BottomSheetScrollView
				style={styles.flex}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.addNoteScrollbar}
			>
				<View style={styles.flex}>
					<View style={[{ ...CommonStyles.directionRowSB }]}>
						<TouchableOpacity style={{}} onPress={handleClose}>
							<Text style={styles.headerCancelTxt}>{"Cancel"}</Text>
						</TouchableOpacity>
						<Text style={styles.reportPanelTitle}>{"Add a Note"}</Text>
						<TouchableOpacity style={{}} onPress={onPressDone}>
							<Text style={[styles.headerSend]}>{"Done"}</Text>
						</TouchableOpacity>
					</View>
					{isLoading ? (
						<NoteLoader />
					) : (
						<TextInput
							style={styles.noteInput}
							value={note}
							onChangeText={(text) => onChangeNote(text)}
							selection={selection}
							onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
							placeholder="What do you want to remember about this place?"
							placeholderTextColor={Colors.labelDarkGray}
							multiline
						/>
					)}
				</View>
				{selectecNote && (
					<TouchableOpacity
						style={styles.deleteNoteBtn}
						onPress={onPressDelete}
					>
						<View style={styles.deleteIcon}>
							<Icons
								iconSetName={"MaterialDesignIcons"}
								iconName={"delete"}
								iconColor={Colors.red}
								iconSize={20}
							/>
						</View>
						<Text style={styles.deleteTxt}>{"Delete Note"}</Text>
					</TouchableOpacity>
				)}
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
};
