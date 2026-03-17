import React, { useCallback, useEffect, useState } from "react";
import {
	BackHandler,
	Image,
	ImageBackground,
	Platform,
	SafeAreaView,
	ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import IncidentStyle from "../../../styles/IncidentStyles";
import Colors from "../../../styles/Colors";
import {
	AddImagePicker,
	Button,
	Icons,
	Loader,
	TextIcon,
	ValidationText,
} from "../../../components";
import LayoutStyle from "../../../styles/LayoutStyle";
import CommonStyles from "../../../styles/CommonStyles";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import { pick } from "@react-native-documents/picker";
import { useDispatch } from "react-redux";
import MESSAGE from "../../../utils/Messages";
import { Video } from "react-native-compressor";
import ProgressBar from "../../../components/ProgressBar";
import Api from "../../../utils/Api";
import { showMessage } from "react-native-flash-message";
import RNFS, { stat } from "react-native-fs";
import ImageResizer from "react-native-image-resizer";
import {
	checkCameraPermission,
	compressImage,
	MAX_FILE_SIZE_BYTES,
} from "../../../config/CommonFunctions";
import IMAGES from "../../../assets/images/Images";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import { getClaimTalkListRequest } from "../redux/Action";

const UploadFileScreen = (props) => {
	const dispatch = useDispatch();
	const MAX_IMAGES = 4;

	var _props = props.route.params;

	const [mergeLoading, setMergeLoading] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [images, setImages] = useState([]);
	const [incidentImgAPI, setIncidentImgAPI] = useState("");
	const [isImages, setIsImages] = useState(false);
	const [imagesMsg, setImagesMsg] = useState(false);

	const [isDocumentPDF, setIsDocumentPDF] = useState(false);
	const [documentName, setDocumentName] = useState("");
	const [documentAPI, setDocumentAPI] = useState("");
	const [isDocValid, setIsDocValid] = useState("");
	const [documentMsg, setDocumentMsg] = useState(false);
	const [isSelectedLayout, setIsSelectedLayout] = useState(false);

	const [firstVideo, setFirstVideo] = useState("");
	const [secondVideo, setSecondVideo] = useState("");
	const [thirdVideo, setThirdVideo] = useState("");

	const [compressionProgress, setCompressionProgress] = useState(0);
	const [currentVideoIndex, setCurrentVideoIndex] = useState(1);

	const [claimerNameString, setClaimerNameString] = useState("");
	const [vehicleDetailString, setVehicleDetailString] = useState("");
	const [incidentDetailString, setIncidentDetailString] = useState("");

	const [isSendingVideo, setIsSendingVideo] = useState(false);
	const [uploadingPR, setUploadingPR] = useState(0);

	useFocusEffect(
		useCallback(() => {
			setIsSendingVideo(false);
		}, [])
	);

	useEffect(() => {
		// getClaimTalkList();

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			gotoBack
		);

		return () => {
			backHandler.remove();
		};
	}, [props.navigation]);

	useEffect(() => {
		const getData = async () => {
			const claimer = await global.incidentClaimerName;
			if (claimer) {
				setClaimerNameString(
					`Hello! My name is ${claimer} and I was recently in an incident.`
				);
			}
			const driverName = await global.driverName;
			const vehicleRef = await global.vehicleRef;
			if (driverName && vehicleRef) {
				setVehicleDetailString(
					`The driver of the vehicle was ${driverName} and the vehicle in reference is a ${vehicleRef}.`
				);
			}
			const incidentDate = await global.incidentDate;
			const peopleInjured = await global.peopleInjured;
			if (incidentDate && peopleInjured) {
				setIncidentDetailString(
					`The incident occurred on ${incidentDate}. There were ${peopleInjured} people injured in the incident at time of reporting.`
				);
			}
			const introVideo = await global.firstVideo;
			if (introVideo) {
				setFirstVideo(introVideo);
			}
			const infoVideo = await global.secondVideo;
			if (infoVideo) {
				setSecondVideo(infoVideo);
			}

			const damagesVideo = await global.thirdVideo;
			if (damagesVideo) {
				setThirdVideo(damagesVideo);
			}
		};
		getData();
	}, []);

	const gotoBack = () => {
		global.firstVideo = "";
		global.secondVideo = "";
		global.thirdVideo = "";
		props.navigation.goBack();
		return true;
	};
	const renderSelectedImg = (imgItems, index) => {
		return (
			<View key={index} style={{ ...LayoutStyle.marginTop20 }}>
				{imgItems.isImage ? (
					<View>
						<ImageBackground
							style={[IncidentStyle.selectImgs]}
							source={{ uri: imgItems.uri }}
							borderRadius={12}
						>
							<TouchableOpacity
								onPress={() => deleteIncidentImgs(imgItems, index)}
							>
								<Icons
									iconName={"delete"}
									iconSetName={"MaterialCommunityIcons"}
									iconColor={Colors.red}
									iconSize={12}
									iconMainstyle={[IncidentStyle.minusIcon]}
								/>
							</TouchableOpacity>
						</ImageBackground>
					</View>
				) : (
					<View
						style={[IncidentStyle.selectImgs, IncidentStyle.uploadImgSmall]}
					>
						<TouchableOpacity onPress={() => openImagePicker()}>
							<View style={{ alignItems: "center" }}>
								<Icons
									iconName={"plus"}
									iconSetName={"FontAwesome6"}
									iconColor={Colors.secondary}
									iconSize={18}
								/>
								<Text style={[IncidentStyle.textGallery]}>
									{"Image Gallery"}
								</Text>
							</View>
						</TouchableOpacity>
					</View>
				)}
			</View>
		);
	};
	const openImagePicker = async () => {
		const allowedMimeTypes = [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/svg+xml",
		];

		await launchImageLibrary({
			mediaType: "photo",
			selectionLimit: MAX_IMAGES - incidentImgAPI.length,
		})
			.then(async (image) => {
				const currentTimestamp = Date.now();
				setIsImages(false);

				if (image && image.assets) {
					const filteredImages = image.assets.filter((img) =>
						allowedMimeTypes.includes(img.type)
					);

					if (filteredImages.length !== image.assets.length) {
						setIsImages(true);
						setImagesMsg("Please select a jpg, jpeg, png, or svg image.");
						return;
					}

					const compressedImages = [];

					for (let i = 0; i < filteredImages.length; i++) {
						try {
							const img = filteredImages[i];
							const resizedImage = await ImageResizer.createResizedImage(
								img.uri,
								800,
								800,
								"JPEG",
								80,
								0
							);

							const fileInfo = await stat(resizedImage.uri);

							if (fileInfo.size <= 10 * 1024 * 1024) {
								compressedImages.push({
									...img,
									uri: resizedImage.uri,
									size: fileInfo.size,
								});
							} else {
								setIsImages(true);
								setImagesMsg(MESSAGE.maxImageSize);
							}
						} catch (error) {
							console.warn("Image resize error:", error);
						}
					}

					if (images.length === 0) {
						const tempImgs = compressedImages;
						if (image) {
							var imgAPI = [];
							var tempImgAPI;
							for (var i = 0; i < tempImgs.length; i++) {
								var fileExt = tempImgs[i].uri.split(".").pop();
								tempImgAPI = {
									size: tempImgs[i].size,
									type: tempImgs[i].type,
									uri: tempImgs[i].uri,
									name: currentTimestamp + [i] + "." + fileExt,
								};
								tempImgs[i]["isImage"] = true;
								imgAPI.push(tempImgAPI);
							}
							setIncidentImgAPI(imgAPI);
							if (tempImgs.length === MAX_IMAGES) {
								setImages(tempImgs);
								setIsSelectedLayout(true);
							} else {
								const blankJson = {
									isImage: false,
								};
								tempImgs.push(blankJson);
								setImages(tempImgs);
								setIsSelectedLayout(true);
							}
						}
					} else {
						var newTempImgAPI;
						var newTempImg;
						var newImgAPI = [];
						var newImg = [];
						const newTempImgs = compressedImages;
						const tempMergeImg = [...incidentImgAPI, ...newTempImgs];

						for (var j = 0; j < tempMergeImg.length; j++) {
							var fileExt = tempMergeImg[j].uri.split(".").pop();
							newTempImgAPI = {
								size: tempMergeImg[j].fileSize
									? tempMergeImg[j].fileSize
									: tempMergeImg[j].size,
								type: tempMergeImg[j].type,
								uri: tempMergeImg[j].uri,
								name: currentTimestamp + [j] + "." + fileExt,
							};
							newImgAPI.push(newTempImgAPI);

							newTempImg = {
								size: tempMergeImg[j].fileSize
									? tempMergeImg[j].fileSize
									: tempMergeImg[j].size,
								type: tempMergeImg[j].type,
								uri: tempMergeImg[j].uri,
								name: currentTimestamp + [j] + "." + fileExt,
								isImage: true,
							};
							newImg.push(newTempImg);
						}
						setIncidentImgAPI(newImgAPI);
						if (tempMergeImg.length === MAX_IMAGES) {
							setImages(newImg);
						} else {
							const blankJson = {
								isImage: false,
							};
							newImg.push(blankJson);
							setImages(newImg);
						}
					}
				}
			})
			.catch((error) => {
				console.warn("Error selecting images:", error);
			});
	};
	const handleOpenCamera = async () => {
		const isCameraPermission = checkCameraPermission();
		if (isCameraPermission) {
			await launchCamera({
				mediaType: "photo",
				quality: 1,
				saveToPhotos: true,
			}).then(async (res) => {
				if (!res.didCancel && res.assets && res.assets.length > 0) {
					const image = res.assets[0];

					try {
						const resizedImage = await ImageResizer.createResizedImage(
							image.uri,
							800,
							800,
							"JPEG",
							80,
							0
						);
						const currentTimestamp = Date.now();
						const fileExt = resizedImage.uri.split(".").pop();

						const newCameraImage = {
							size: resizedImage.size,
							type: "image/jpeg",
							uri: resizedImage.uri,
							name: currentTimestamp + "." + fileExt,
							isImage: true,
						};

						const tempMergeImg = [...incidentImgAPI, newCameraImage].slice(
							0,
							MAX_IMAGES
						);

						const newImgAPI = tempMergeImg.map((img, index) => ({
							size: img.size,
							type: img.type,
							uri: img.uri,
							name: currentTimestamp + [index] + "." + fileExt,
						}));

						const newImages = tempMergeImg.map((img) => ({
							...img,
							isImage: true,
						}));

						if (newImages.length < MAX_IMAGES) {
							newImages.push({ isImage: false });
							setIsSelectedLayout(true);
						}

						setIncidentImgAPI(newImgAPI);
						setImages(newImages);
					} catch (err) {
						console.error("Error compressing image:", err);
					}
				}
			});
		}
	};
	const deleteIncidentImgs = (imgItems, index) => {
		const imgResultAPI = incidentImgAPI.filter((item, i) => {
			return i != index;
		});
		setIncidentImgAPI(imgResultAPI);
		const imgResult = images.filter((item, i) => {
			return i != index;
		});

		if (imgResult.length === 1) {
			setIsSelectedLayout(false);
			setImages([]);
			setIncidentImgAPI("");
		} else {
			if (imgResult[imgResult.length - 1].isImage) {
				const blankJson = {
					isImage: false,
				};
				imgResult.push(blankJson);
			}
			setImages(imgResult);
		}
	};
	const removeSelectedFile = () => {
		setIsDocumentPDF(false);
		setDocumentName("");
		setDocumentAPI("");
		setIsDocValid("");
		setDocumentMsg(false);
	};
	const openFileManager = async () => {
		try {
			const [res] = await pick({
				type:
					Platform.OS === "android"
						? ["application/pdf"]
						: ["public.content", "public.data", "com.adobe.pdf"],
				allowMultiSelection: false,
			});
			if (res.size > MAX_FILE_SIZE_BYTES) {
				showMessage({
					message: `${
						res.name.length > 30 ? res.name.slice(0, 30) + "..." : res.name
					}\n${MESSAGE.maxFileSize}`,
					type: "danger",
					icon: "auto",
					duration: 3000,
					floating: true,
					statusBarHeight: 40,
				});
				return false;
			}
			const documentAPI = {
				size: res.size,
				type: res.type,
				uri: res.uri,
				name: res.name,
			};
			setIsDocValid(false);
			setIsDocumentPDF(true);
			setDocumentName(res.name);
			setDocumentAPI(documentAPI);
		} catch (err) {
			if (err.code === "DOCUMENT_PICKER_CANCELED") {
			} else {
				console.error("Document Picker Error:", err);
			}
		}
	};
	const compressVideo = async (videoUri, videoIndex) => {
		console.log("videoUri: ", videoUri);
		try {
			const compressedVideoUri = await Video.compress(
				videoUri,
				{
					compressionMethod: "auto",
					// maxSize: 5,
					quality: 0.5,
					progressDivider: 10,
					downloadProgress: (progress) => {
						console.log("progress: ", progress);
					},
				},
				(progress) => {
					const percentage = Math.round(progress * 10);
					setCompressionProgress(percentage);
				}
			);
			console.log(`Video ${videoIndex} compressed successfully:`, videoUri);
			return compressedVideoUri;
		} catch (error) {
			console.warn("Error compressing video:", error);
			showMessage({
				type: "danger",
				message: `Error while video compression`,
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				duration: 3000,
				autoHide: true,
			});
			return videoUri;
		}
	};
	const uploadChunkedVideo = async (videoUri, videoName) => {
		const fileStats = await RNFS.stat(videoUri);
		const fileSize = fileStats.size;

		const fileSizeInMB = (fileSize / (1024 * 1024)).toFixed(2);
		console.log("Total fileSize: ", fileSize, "bytes =", fileSizeInMB, "MB");

		const targetChunks = fileSizeInMB >= 5 ? 8 : 5;
		const CHUNK_SIZE = Math.ceil(fileSize / targetChunks);
		const CHUNK_SIZE_MB = (CHUNK_SIZE / (1024 * 1024)).toFixed(2);

		const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
		let chunks = [];

		const identifier = `${videoName}-${Date.now()}`;

		for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
			const start = chunkIndex * CHUNK_SIZE;
			const end = Math.min(start + CHUNK_SIZE, fileSize);
			const videoPath =
				Platform.OS === "android"
					? videoUri
					: decodeURIComponent(videoUri.replace("file://", ""));

			let chunkData = "";

			if (Platform.OS === "android") {
				chunkData = await RNFS.read(videoPath, end - start, start, "base64");
			} else {
				chunkData = await RNFS.readFile(videoPath, "base64");
			}

			console.log(
				`Chunk ${
					chunkIndex + 1
				}/${totalChunks} - CHUNK_SIZE: ${CHUNK_SIZE} bytes = ${CHUNK_SIZE_MB} MB`
			);

			chunks.push({
				uri: videoPath,
				type: "application/octet-stream",
				name: `${videoName}-chunk${chunkIndex + 1}`,
				data: chunkData,
				chunkSize: CHUNK_SIZE,
				totalSize: fileSize,
				identifier,
				totalChunks,
				chunkNumber: chunkIndex + 1,
			});
		}

		return chunks;
	};
	const gotoSubmitClaimAPI = async () => {
		try {
			if (!incidentImgAPI) {
				setIsImages(true);
				setImagesMsg("Please add images");
				return false;
			}

			setIsLoading(true);
			const currentTimestamp = Date.now();
			const locationCoords = {
				latitude: _props.locationCoords?.latitude,
				longitude: _props.locationCoords?.longitude,
			};

			const voice_notes = [
				{ claimer_name: claimerNameString },
				{ vehicle_details: vehicleDetailString },
				{ incident_details: incidentDetailString },
				{ incident_type: global.incidentTypeText },
				{ weather_detail: global.weatherText },
				{ critical_info: global.criticalInfotext },
			];

			const payload = new FormData();
			payload.append("time", _props.incidentTime);
			payload.append("incident_date", _props.incidentDate);
			payload.append("location", _props.location);
			payload.append("location_coords", JSON.stringify(locationCoords));
			payload.append("voice_notes", JSON.stringify(voice_notes));
			payload.append("is_first_request", 1);
			payload.append("total_videos", 3);

			if (documentAPI) payload.append("doc_files", documentAPI);

			if (incidentImgAPI) {
				const compressedImages = await Promise.all(
					incidentImgAPI.map((img) => compressImage(img))
				);
				compressedImages.forEach((image, i) => {
					const ext = image.uri.split(".").pop();
					payload.append("photo[]", {
						size: image.size,
						uri: image.uri,
						type: image.type,
						name: `${currentTimestamp}_${i}.${ext}`,
					});
				});
			}

			const payloadRes = await Api.post(`user/claim-talk`, payload);
			setIsLoading(false);

			if (!payloadRes?.status || !payloadRes?.incident_id)
				throw new Error("Initial payload failed");

			setMergeLoading(true);
			setCompressionProgress(0);

			const incident_id = payloadRes.incident_id;

			const allVideos = [
				{ file: firstVideo, label: "firstVideo", index: 0 },
				{ file: secondVideo, label: "secondVideo", index: 1 },
				{ file: thirdVideo, label: "thirdVideo", index: 2 },
			];

			for (const { file, label, index } of allVideos) {
				setCurrentVideoIndex(index + 1);

				const compressed = await compressVideo(file, index + 1);
				const chunks = await uploadChunkedVideo(compressed, label);

				for (const chunk of chunks) {
					const chunkForm = new FormData();
					chunkForm.append("is_first_request", 0);
					chunkForm.append("id", incident_id);
					chunkForm.append("resumable", true);
					chunkForm.append("total_videos", 3);
					chunkForm.append("video_index", index);
					chunkForm.append("chunkNumber", chunk.chunkNumber);
					chunkForm.append("totalChunks", chunk.totalChunks);
					chunkForm.append("identifier", chunk.identifier);

					chunkForm.append("video", {
						uri: chunk.uri,
						type: chunk.type,
						name: `${currentTimestamp}_${label}_${chunk.chunkNumber}.mp4`,
					});

					console.log(
						`Uploading ${label} chunk ${chunk.chunkNumber}/${chunk.totalChunks}`
					);
					setIsSendingVideo(true);
					const res = await Api.post("user/claim-talk", chunkForm);
					console.log("res >>>", res);

					setIsSendingVideo(false);

					if (res?.percentage) {
						setUploadingPR(res?.percentage);
					}
					if (
						res?.message === "Video 1 uploaded successfully" ||
						res?.message === "Video 2 uploaded successfully" ||
						res?.message === "Claim submitted successfully!"
					) {
						setUploadingPR(100);
					}
					if (!res?.status && !res?.success) {
						throw new Error(
							`Chunk upload failed for video ${index + 1}, chunk ${
								chunk.chunkNumber
							}`
						);
					}
				}
			}

			setCurrentVideoIndex(1);
			setMergeLoading(false);
			setIsSendingVideo(false);
			setCompressionProgress(0);
			setUploadingPR(0);
			showMessage({
				message: "Claim submitted successfully!",
				type: "success",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				autoHide: true,
			});
			gotoSubmitted();
		} catch (error) {
			console.warn("Error in gotoSubmitClaimAPI:", error);
			setIsLoading(false);
			setMergeLoading(false);
			setIsSendingVideo(false);
			setCompressionProgress(0);
			setUploadingPR(0);
			setCurrentVideoIndex(1);

			showMessage({
				message: "Something went wrong \n Please try again later",
				type: "danger",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				autoHide: true,
			});
		}
	};
	const gotoSubmitted = () => {
		global.firstVideo = "";
		global.secondVideo = "";
		global.thirdVideo = "";
		props.navigation.dispatch(
			CommonActions.reset({
				index: 0,
				routes: [{ name: "Submitted" }],
			})
		);
	};
	const getClaimTalkList = () => {
		const param = { status: "pending" };
		dispatch(getClaimTalkListRequest(param, props.navigation));
	};

	return (
		<View style={[IncidentStyle.mainContainer]}>
			<Loader show={isLoading} />
			<SafeAreaView
				style={[
					IncidentStyle.darkContainer,
					{ marginTop: Platform.OS === "ios" ? 70 : 0 },
				]}
			>
				<StatusBar
					translucent
					barStyle={"dark-content"}
					animated={true}
					backgroundColor={Colors.primaryBG20}
					networkActivityIndicatorVisible={true}
				/>
			</SafeAreaView>
			{!isLoading && (
				<>
					<View style={[IncidentStyle.headerContainer]}>
						<TouchableOpacity
							style={{ opacity: mergeLoading ? 0.5 : 1 }}
							disabled={mergeLoading}
							onPress={() => gotoBack()}
						>
							<View style={[IncidentStyle.backArrow]}>
								<Icons
									iconName={"angle-left"}
									iconSetName={"FontAwesome6"}
									iconColor={Colors.backArrowBlack}
									iconSize={24}
								/>
							</View>
						</TouchableOpacity>
						<Text style={[IncidentStyle.headerTextBlack]}>{"Claim Talk"}</Text>
					</View>
					{mergeLoading ? (
						<View style={IncidentStyle.progressContainer}>
							<View style={IncidentStyle.progressCard}>
								<Text
									style={{
										marginBottom: isSendingVideo ? 15 : 5,
										color: Colors.primary,
									}}
								>
									{`${isSendingVideo ? "Uploading" : "Processing"} video `}
									<Text style={{ fontWeight: "600" }}>{currentVideoIndex}</Text>
								</Text>
								<Text
									style={{
										marginBottom: 5,
										fontWeight: "700",
										color: Colors.primary,
									}}
								>
									{!isSendingVideo ? compressionProgress * 10 : uploadingPR}%
								</Text>
								{/* <ProgressLoader
									width={deviceWidth / 1.4}
									height={10}
									borderWidth={0}
									borderRadius={8}
									color={Colors.secondary}
									borderColor={"#e0e0e0"}
									unfilledColor={"#e0e0e0"}
									indeterminate
									indeterminateAnimationDuration={2000}
								/> */}

								<ProgressBar
									progress={
										!isSendingVideo
											? compressionProgress / 100
											: uploadingPR / 1000
									}
								/>
							</View>
						</View>
					) : (
						<ScrollView
							showsVerticalScrollIndicator={false}
							scrollToOverflowEnabled={true}
							enableOnAndroid={true}
						>
							<View
								style={[
									IncidentStyle.claimMainContainer,
									{ ...CommonStyles.mainPaddingH },
								]}
							>
								<Text style={[IncidentStyle.welcomeLabel]}>
									{"Please"}
									<Text style={[IncidentStyle.welcomeBold]}>{" add "}</Text>
									<Text>
										{
											"any other information (ie., police report, copy of driver’s license, etc.) with your claim."
										}
									</Text>
								</Text>
								<View
									style={{
										...LayoutStyle.marginVertical20,
									}}
								>
									{isDocumentPDF && (
										<View style={[IncidentStyle.document]}>
											<Image
												source={IMAGES.pdfImg}
												style={{
													height: 65,
													width: 65,
													resizeMode: "contain",
												}}
											/>
											<Text style={[IncidentStyle.documentText]}>
												{documentName}
											</Text>
										</View>
									)}
									<Button
										onPress={() =>
											documentAPI ? removeSelectedFile() : openFileManager()
										}
										btnBorderColor={
											documentAPI ? Colors.danger : Colors.secondary
										}
										btnLabelColor={Colors.white}
										isBtnActive={true}
										btnColor={Colors.primary}
										btnName={documentAPI ? "Remove" : "Add File"}
									/>
									<ValidationText
										isValidationShow={isDocValid}
										validationMessage={MESSAGE.uploadDoc}
									/>
								</View>
							</View>
							<View style={{ ...LayoutStyle.paddingHorizontal20 }}>
								<TextIcon
									textIconMainStyle={{
										...LayoutStyle.marginTop20,
										...LayoutStyle.marginBottom10,
									}}
									textName={"Add Pictures"}
									textColor={Colors.labelBlack}
									iconColor={Colors.iconBlack}
									iconName={"camera-outline"}
									iconSetName={"MaterialCommunityIcons"}
									iconSize={24}
									isOnPress={true}
									disabled={incidentImgAPI.length === 4}
									onPress={() => handleOpenCamera()}
								/>

								<View>
									{isSelectedLayout ? (
										<AddImagePicker
											data={images}
											renderItem={({ item: imgItems, index }) =>
												renderSelectedImg(imgItems, index)
											}
											keyExtractor={(item) => item.id}
										/>
									) : (
										<TouchableOpacity onPress={() => openImagePicker()}>
											<View
												style={[
													IncidentStyle.uploadImg,
													IncidentStyle.selectImgsBig,
												]}
											>
												<View style={{ alignItems: "center" }}>
													<Icons
														iconName={"plus"}
														iconSetName={"FontAwesome6"}
														iconColor={Colors.secondary}
														iconSize={18}
													/>
													<Text style={[IncidentStyle.textGallery]}>
														{"Image Gallery"}
													</Text>
												</View>
											</View>
										</TouchableOpacity>
									)}
									<ValidationText
										isValidationShow={isImages}
										validationMessage={imagesMsg}
									/>
									<View
										style={{
											...LayoutStyle.marginVertical20,
										}}
									>
										<Button
											onPress={() => gotoSubmitClaimAPI()}
											btnLabelColor={Colors.white}
											btnColor={Colors.secondary}
											btnName={"Submit Claim"}
											isBtnActive={true}
										/>
									</View>
								</View>
							</View>
						</ScrollView>
					)}

					{/* <VideoControls
							source={{ uri: global.firstVideo }}
							style={{
								width: "100%",
								height: 200,
							}}
							resizeMode="cover"
							autoplay={false}
							disableBack
							tapAnywhereToPause={true}
							playWhenInactive={true}
							disableFullscreen={false}
							disableSeekbar={false}
							disableVolume={false}
							disableTimer={false}
							onEnterFullscreen={() => {}}
						/> */}
				</>
			)}
		</View>
	);
};

export default UploadFileScreen;
