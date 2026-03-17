import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	FlatList,
	PermissionsAndroid,
	Platform,
	Alert,
	StyleSheet,
	ActivityIndicator,
} from "react-native";
import ChatStyle from "../../../styles/ChatStyle";
import Colors from "../../../styles/Colors";
import { Icons } from "../../../components";
import RNFS from "react-native-fs";
import { showMessage } from "react-native-flash-message";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { deviceWidth } from "../../../utils/DeviceInfo";
import FastImage from "react-native-fast-image";
import { noProfilePic } from "../../../config/CommonFunctions";

export const ImageMessage = ({
	chatItem,
	userData,
	setShowImagesPopup,
	setSelectedMessage,
}) => {
	const [fileExists, setFileExists] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const [imageError, setImageError] = useState(false);
	const [errorIndexes, setErrorIndexes] = useState([]);

	const isSender = chatItem.senderId
		? chatItem.senderId === userData.id
		: chatItem.sender_id === userData.id;

	useEffect(() => {
		const checkFileExists = async () => {
			if (chatItem?.chat_files[0]?.file_url) {
				const fileName = chatItem.chat_files[0].file_url.split("/").pop();

				const filePath =
					Platform.OS === "android"
						? `${RNFS.DownloadDirectoryPath}/${fileName}`
						: `${RNFS.DocumentDirectoryPath}/${fileName}`;
				try {
					const exists = await RNFS.exists(filePath);
					setFileExists(exists);
				} catch (error) {
					console.warn("Error checking file existence:", error);
				}
			}
		};
		checkFileExists();
	}, [chatItem, fileExists]);

	async function requestStoragePermission() {
		if (Platform.OS === "android") {
			try {
				if (Platform.Version < 33) {
					const granted = await PermissionsAndroid.request(
						PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
						{
							title: "Storage Permission",
							message:
								"This app needs access to your storage to download files",
						}
					);
					return granted === PermissionsAndroid.RESULTS.GRANTED;
				} else {
					return true;
				}
			} catch (err) {
				console.warn(err);
				return false;
			}
		}
		return true;
	}
	const downloadFile = async (chatItem) => {
		if (!chatItem?.chat_files?.length) return;

		setIsDownloading(true);

		const permissionGranted = await requestStoragePermission();
		if (!permissionGranted) {
			Alert.alert(
				"Permission Denied",
				"Storage permission is required to download files."
			);
			setIsDownloading(false);
			return;
		}

		try {
			for (const file of chatItem.chat_files) {
				const { file_url: fileUrl, base64, file_type: fileType } = file;

				const fileName = fileUrl
					? fileUrl.split("/").pop()
					: `downloaded_file.${fileType?.split("/")[1] || "jpg"}`;

				const downloadPath =
					Platform.OS === "android"
						? `${RNFS.DownloadDirectoryPath}/${fileName}`
						: `${RNFS.DocumentDirectoryPath}/${fileName}`;

				if (Platform.OS === "ios") {
					if (base64) {
						await RNFS.writeFile(downloadPath, base64, "base64");
					} else {
						await RNFS.downloadFile({
							fromUrl: fileUrl,
							toFile: downloadPath,
						}).promise;
					}

					const fileUri = `file://${downloadPath}`;
					try {
						await CameraRoll.save(fileUri, {
							type: fileType?.startsWith("video") ? "video" : "photo",
						});
					} catch (err) {
						console.error("CameraRoll save error:", err);
					}
				} else {
					await RNFS.downloadFile({
						fromUrl: fileUrl,
						toFile: downloadPath,
					}).promise;

					try {
						await RNFS.scanFile(downloadPath);
					} catch (scanErr) {
						console.warn("scanFile failed:", scanErr);
					}
				}
			}

			setFileExists(true);
			showMessage({
				type: "success",
				message: `${
					chatItem.chat_files.length > 1 ? "Images" : "Image"
				} downloaded successfully`,
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				duration: 3000,
				autoHide: true,
			});
		} catch (error) {
			console.warn("Error downloading files:", error);
			showMessage({
				type: "danger",
				message: "Failed to download file(s)",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				duration: 3000,
				autoHide: true,
			});
		} finally {
			setIsDownloading(false);
		}
	};
	const handleImageError = (index) => {
		setErrorIndexes((prev) => [...new Set([...prev, index])]);
	};
	const renderSubImgs = ({ item, index }) => {
		const ImgsI = index + 1;
		const hasError = errorIndexes.includes(index);
		return (
			<View
				key={index}
				style={{
					paddingRight: ImgsI % 2 == 0 ? 0 : 10,
					paddingTop: ImgsI > 2 ? 10 : 0,
				}}
			>
				<FastImage
					source={{
						uri: item?.file_url
							? item?.file_url
							: `data:${item?.fileType};base64,${item?.base64}`,
					}}
					style={[ChatStyle.multipleImgs]}
					onError={() => handleImageError(index)}
				/>
				{hasError && (
					<>
						<View
							style={[
								StyleSheet.absoluteFill,
								{ backgroundColor: "rgba(0,0,0,0.5)" },
							]}
						/>
						<View style={styles.subImgError}>
							<Icons
								iconSetName={"MaterialIcons"}
								iconName={"error"}
								iconColor={Colors.errorBoxRed}
								iconSize={22}
							/>
						</View>
					</>
				)}
			</View>
		);
	};

	const singleImageHasError = errorIndexes.includes(0);

	return (
		<>
			{chatItem?.chat_files?.length > 1 ? (
				<TouchableOpacity
					style={[ChatStyle.multipleImgsContainer, {}]}
					onPress={() => {
						setShowImagesPopup(true);
						setSelectedMessage(chatItem);
					}}
				>
					<FlatList
						data={chatItem?.chat_files}
						numColumns={2}
						renderItem={renderSubImgs}
						keyExtractor={(itemImgs, index) => index.toString()}
						scrollEnabled={false}
					/>
					{chatItem?.chat_files && !isSender && !fileExists && (
						<>
							<View
								style={[
									StyleSheet.absoluteFill,
									{ backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 5 },
								]}
							/>
							<View style={[styles.overlayMultiImg, {}]}>
								<TouchableOpacity
									style={styles.downloadButton}
									onPress={() => downloadFile(chatItem)}
								>
									{isDownloading ? (
										<ActivityIndicator size={"small"} color={Colors.white} />
									) : (
										<Icons
											iconSetName={"Ionicons"}
											iconName={"download-outline"}
											iconColor={Colors.white}
											iconSize={26}
										/>
									)}
								</TouchableOpacity>
							</View>
						</>
					)}
				</TouchableOpacity>
			) : (
				<TouchableOpacity
					style={[styles.imageContainer, {}]}
					onPress={() => {
						setShowImagesPopup(true);
						setSelectedMessage(chatItem);
					}}
				>
					<FastImage
						source={{
							uri: chatItem?.chat_files[0]?.file_url
								? chatItem?.chat_files[0]?.file_url
								: `data:${chatItem?.chat_files[0]?.fileType};base64,${chatItem?.chat_files[0]?.base64}`,
						}}
						style={[
							ChatStyle.messageImg,
							{
								borderTopLeftRadius: chatItem?.message_text ? 0 : 8,
								borderTopRightRadius: chatItem?.message_text ? 0 : 8,
								resizeMode: "contain",
							},
						]}
						onError={() => handleImageError(0)}
					/>
					{chatItem?.chat_files && !isSender && !fileExists && (
						<>
							<View
								style={[
									StyleSheet.absoluteFill,
									{ backgroundColor: "rgba(0,0,0,0.5)" },
								]}
							/>
							<View style={[styles.overlay, {}]}>
								<TouchableOpacity
									style={[styles.downloadButton, {}]}
									onPress={() => downloadFile(chatItem)}
								>
									{isDownloading ? (
										<ActivityIndicator size={"small"} color={Colors.white} />
									) : (
										<Icons
											iconSetName={"Ionicons"}
											iconName={"download-outline"}
											iconColor={Colors.white}
											iconSize={22}
										/>
									)}
								</TouchableOpacity>
							</View>
						</>
					)}
					{singleImageHasError && (
						<>
							<View
								style={[
									StyleSheet.absoluteFill,
									{ backgroundColor: "rgba(0,0,0,0.5)" },
								]}
							/>
							<View style={[styles.overlay, { padding: 5 }]}>
								<Icons
									iconSetName={"MaterialIcons"}
									iconName={"error"}
									iconColor={Colors.errorBoxRed}
									iconSize={22}
								/>
							</View>
						</>
					)}
				</TouchableOpacity>
			)}
			{chatItem?.message_text && (
				<View style={[{ paddingTop: 5 }]}>
					<Text
						style={[
							ChatStyle.messageText,
							isSender
								? { color: Colors.labelWhite }
								: { color: Colors.labelBlack },
						]}
					>
						{chatItem?.message_text}
					</Text>
				</View>
			)}
		</>
	);
};

const styles = StyleSheet.create({
	image: {
		width: 100,
		height: 100,
		margin: 5,
		borderRadius: 8,
	},
	imageContainer: {
		borderRadius: 8,
		overflow: "hidden",
		maxWidth: "98%",
	},
	overlay: {
		position: "absolute",
		top: 0,
		right: 0,
		justifyContent: "center",
		alignItems: "center",
	},
	overlayMultiImg: {
		position: "absolute",
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		justifyContent: "center",
		alignItems: "center",
	},
	downloadButton: {
		padding: 10,
	},
	subImgError: {
		padding: 5,
		position: "absolute",
		top: 0,
		right: 0,
		left: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
	},
});
