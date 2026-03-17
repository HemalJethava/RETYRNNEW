import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Platform,
	FlatList,
	Alert,
	ToastAndroid,
} from "react-native";
import { Icons } from "../../../components";
import ChatStyle from "../../../styles/ChatStyle";
import Colors from "../../../styles/Colors";
import RNFS from "react-native-fs";
import CircularProgress from "react-native-circular-progress-indicator";
import { openFileByThirdPartyApp } from "../../../config/CommonFunctions";
import CommonStyles from "../../../styles/CommonStyles";

export const FileMessage = ({ chatItem, userData }) => {
	const [fileExistsMap, setFileExistsMap] = useState({});
	const [downloadProgressMap, setDownloadProgressMap] = useState({});

	const isSender = chatItem.senderId
		? chatItem.senderId === userData.id
		: chatItem.sender_id === userData.id;

	useEffect(() => {
		const checkFileExists = async () => {
			if (chatItem?.chat_files?.length) {
				const newFileExistsMap = {};

				await Promise.all(
					chatItem.chat_files.map(async (file) => {
						const fileName = file?.file_name
							? file?.file_name
							: file?.file_url.split("/").pop();

						const downloadPath =
							Platform.OS === "android"
								? `${RNFS.DownloadDirectoryPath}/${fileName}`
								: `${RNFS.DocumentDirectoryPath}/${fileName}`;

						try {
							const exists = await RNFS.exists(downloadPath);
							newFileExistsMap[file?.file_url] = exists;
						} catch (error) {
							console.warn("Error checking file existence:", error);
							newFileExistsMap[file?.file_url] = false;
						}
					})
				);

				setFileExistsMap(newFileExistsMap);
			}
		};

		checkFileExists();
	}, [chatItem]);

	const handleOpenFile = async (file) => {
		const fileURL = file.uri ? file.uri : file.file_url;
		const fileName = file?.file_name ? file?.file_name : file?.fileName;

		try {
			setDownloadProgressMap((prev) => ({
				...prev,
				[fileURL]: { isDownloading: true, progress: 0 },
			}));

			const downloadDest =
				Platform.OS === "android"
					? `${RNFS.DownloadDirectoryPath}/${fileName}`
					: `${RNFS.DocumentDirectoryPath}/${fileName}`;

			const options = {
				fromUrl: fileURL,
				toFile: downloadDest,
				background: true,
				progressDivider: 1,
				begin: (res) => {
					console.log("Download started:", res);
				},
				progress: (res) => {
					let progress = (res.bytesWritten / res.contentLength) * 100;
					setDownloadProgressMap((prev) => ({
						...prev,
						[fileURL]: { isDownloading: true, progress: progress.toFixed(0) },
					}));
				},
			};

			const downloadResult = RNFS.downloadFile(options);
			await downloadResult.promise;

			setFileExistsMap((prev) => ({
				...prev,
				[file.file_url]: true,
			}));

			setDownloadProgressMap((prev) => ({
				...prev,
				[fileURL]: { isDownloading: false, progress: 100 },
			}));

			if (Platform.OS === "android") {
				ToastAndroid.showWithGravity(
					"File Downloaded Successfully!",
					ToastAndroid.LONG,
					ToastAndroid.CENTER
				);
			} else {
				Alert.alert("Downloaded Successfully!");
			}
		} catch (error) {
			setDownloadProgressMap((prev) => ({
				...prev,
				[fileURL]: { isDownloading: false, progress: 0 },
			}));
			console.warn("Download failed:", error);
			Alert.alert("Download Error", "Failed to download the file.");
		}
	};

	return (
		<View style={[{ borderBottomWidth: 0 }]}>
			{chatItem?.chat_files && (
				<FlatList
					data={chatItem?.chat_files}
					keyExtractor={(itemFiles, index) => index.toString()}
					renderItem={({ item, i }) => {
						const isLastItem = i === chatItem?.chat_files.length - 1;
						const fileURL = item?.file_url;
						const fileExists = fileExistsMap[item?.file_url] || false;
						const { isDownloading, progress } =
							downloadProgressMap[fileURL] || {};
						return (
							<TouchableOpacity
								style={{
									marginBottom:
										i !== 0 && chatItem?.chat_files.length > 1 && !isLastItem
											? 5
											: 5,
								}}
								onPress={() =>
									!isSender && !fileExists
										? handleOpenFile(item)
										: openFileByThirdPartyApp(item)
								}
							>
								<View
									style={[
										ChatStyle.fileMsg,
										{
											backgroundColor: isSender ? "#253850" : "#f7f7f7",
										},
									]}
								>
									<View style={{ ...CommonStyles.directionRowCenter }}>
										<Icons
											iconSetName={"MaterialCommunityIcons"}
											iconName={"file-outline"}
											iconSize={20}
											iconColor={isSender ? Colors.white : Colors.black}
										/>
										<Text
											numberOfLines={2}
											style={{
												width: isSender ? "85%" : "75%",
												marginLeft: 3,
												color: isSender ? Colors.labelWhite : Colors.labelBlack,
											}}
										>
											{(() => {
												const fileName = item?.file_name || item?.name || "";
												if (!fileName) return "";

												const dotIndex = fileName.lastIndexOf(".");
												const namePart =
													dotIndex !== -1
														? fileName.slice(0, dotIndex)
														: fileName;
												const extPart =
													dotIndex !== -1 ? fileName.slice(dotIndex) : "";

												if (namePart.length > 15) {
													return `${namePart.slice(0, 15)}...${extPart}`;
												} else {
													return `${namePart}${extPart}`;
												}
											})()}
										</Text>
									</View>
									{!isSender && !fileExists && (
										<TouchableOpacity onPress={() => handleOpenFile(item)}>
											{isDownloading ? (
												<CircularProgress
													value={parseFloat(progress)}
													maxValue={100}
													radius={11}
													textColor="#000"
													activeStrokeColor={Colors.labelBlack}
													inActiveStrokeColor={Colors.black}
													inActiveStrokeOpacity={0.5}
													progressValueStyle={[ChatStyle.fileDownloadTxt]}
													activeStrokeWidth={2.5}
													inActiveStrokeWidth={2.5}
													valueSuffix="%"
													valueSuffixStyle={[ChatStyle.valueSuffix]}
												/>
											) : (
												<Icons
													iconSetName={"Ionicons"}
													iconName={"download-outline"}
													iconColor={Colors.labelBlack}
													iconSize={22}
												/>
											)}
										</TouchableOpacity>
									)}
								</View>
							</TouchableOpacity>
						);
					}}
				/>
			)}
			{chatItem.message_text && (
				<View>
					<Text
						style={[
							ChatStyle.messageText,
							isSender
								? { color: Colors.labelWhite }
								: { color: Colors.labelBlack },
						]}
					>
						{chatItem.message_text}
					</Text>
				</View>
			)}
		</View>
	);
};
