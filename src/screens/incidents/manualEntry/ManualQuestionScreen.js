import React, { useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ImageBackground,
	BackHandler,
	ScrollView,
	Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import IncidentStyle from "../../../styles/IncidentStyles";
import Colors from "../../../styles/Colors";
import { Button, DarkHeader, Icons, Loader } from "../../../components";
import moment from "moment";
import LayoutStyle from "../../../styles/LayoutStyle";
import { QuestionType } from "../Components/QuestionType";
import ImagePicker from "react-native-image-crop-picker";
import Api from "../../../utils/Api";
import { showMessage } from "react-native-flash-message";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import {
	checkCameraPermission,
	compressImage,
	convertToISODate,
	getCityStateCountry,
	getTruckKeyFromSide,
	hapticVibrate,
	MAX_FILE_SIZE_BYTES,
} from "../../../config/CommonFunctions";
import MESSAGE from "../../../utils/Messages";
import CommonStyles from "../../../styles/CommonStyles";
import ImageResizer from "react-native-image-resizer";
import { checkArrayKey, checkForMultipleKeys } from "../../../utils/Validation";
import { stat } from "react-native-fs";
import {
	getCurrentLocation,
	locationPermission,
} from "../../../utils/Location";
import { SaveDraftPanel } from "../Components/SaveDraftPanel";
import { saveDraftRequest } from "../redux/Action";

import TextRecognition from "react-native-text-recognition"; // iOS
// import TextRecognition from "@react-native-ml-kit/text-recognition"; // android
// import MlkitOcr from "react-native-mlkit-ocr"; // testing

const ManualQuestionScreen = (props) => {
	const incidentType = props.route.params?.incidentData;
	const draftData = props.route.params?.draftData;
	const MAX_IMAGES = 4;

	const userData = useSelector((state) => state.Auth.userData);
	const stateList = useSelector((state) => state.Incident.stateList);
	const vehicleList = useSelector((state) => state.Incident.vehicleList);
	const driverList = useSelector((state) => state.Incident.driverList);
	const dispatch = useDispatch();
	const historyRef = useRef([]);
	const inlineQuestionsHistoryRef = useRef([]);

	const [isLoading, setIsLoading] = useState(false);
	const [mainIndex, setMainIndex] = useState(0);
	const [incidentData, setIncidentData] = useState([]);
	const [inlineQuestions, setInlineQuestions] = useState([]);
	const [answers, setAnswers] = useState(null);

	//  for incident date
	const [incidentDate, setIncidentDate] = useState("");
	const [incidentDateMsg, setIncidentDateMsg] = useState("");
	const [incidentDateOpen, setIncidentDateOpen] = useState(false);
	const [isIncidentDate, setIsIncidentDate] = useState(false);
	const [incidentDatePress, setIncidentDatePress] = useState(true);

	//  for incident time
	const [incidentTime, setIncidentTime] = useState("");
	const [incidentTimeMsg, setIncidentTimeMsg] = useState("");
	const [incidentTimeOpen, setIncidentTimeOpen] = useState(false);
	const [isIncidentTime, setIsIncidentTime] = useState(false);
	const [incidentTimePress, setIncidentTimePress] = useState(true);

	//  for incident state/place data in dropdown
	const [incidentState, setIncidentState] = useState("");
	const [incidentStateID, setIncidentStateID] = useState("");
	const [incidentStateMsg, setIncidentStateMsg] = useState("");
	const [isIncidentState, setIsIncidentState] = useState(false);
	const [incidentStatePress, setIncidentStatePress] = useState(true);

	// for driver list/place data in dropdown
	const [driverData, setDriverData] = useState([]);
	const [driverValue, setDriverValue] = useState("");
	const [driverMessage, setDriverMessage] = useState("");
	const [isDriverFocus, setIsDriverFocus] = useState(false);
	const [driverPress, setDriverPress] = useState(true);

	//  for vehicle data in dropdown
	const [vehicle, setVehicle] = useState("");
	const [vehicleID, setVehicleID] = useState("");
	const [vehicleMsg, setVehicleMsg] = useState("");
	const [isVehicle, setIsVehicle] = useState(false);
	const [vehiclePress, setVehiclePress] = useState(true);
	const [scanValue, setScanValue] = useState("");

	// option list
	const [listValidationErrors, setListValidationErrors] = useState({});

	// upload images
	const [images, setImages] = useState([]);
	const [incidentImgAPI, setIncidentImgAPI] = useState("");
	const [isImages, setIsImages] = useState(false);
	const [imagesMsg, setImagesMsg] = useState(false);
	const [isSelectedLayout, setIsSelectedLayout] = useState(false);

	// critical info
	const [criticalInfo, setCriticalInfo] = useState("");
	const [criticalInfoMsg, setCriticalInfoMsg] = useState("");
	const [iscriticalInfo, setIsCriticalInfo] = useState(false);
	const [criticalInfoPress, setCriticalInfoPress] = useState(true);

	// init truck accident position
	const [updatedTruck, setUpdateTruck] = useState({
		truckTop: false,
		truckMiddleLeft: false,
		truckMiddleRight: false,
		truckFront: false,
		truckFrontLeft: false,
		truckFrontRight: false,
		truckBack: false,
		truckBackLeft: false,
		truckBackRight: false,
	});

	const [damageSides, setDamageSides] = useState([]);
	const [isDamageSide, setIsDamageSide] = useState(false);
	const [damageSideMsg, setDamageSideMsg] = useState("");

	const [isShowDraftPanel, setIsShowDraftPanel] = useState(false);
	const [isShowDraftBtn, setIsShowDraftBtn] = useState(true);
	const [isButtonDisabled, setIsButtonDisabled] = useState(true);
	const [isDraftApplied, setIsDraftApplied] = useState(false);

	useEffect(() => {
		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			gotoPreviousQuestion
		);
		return () => backHandler.remove();
	}, [mainIndex, incidentData.length, props.navigation]);

	useEffect(() => {
		if (incidentType?.questions && incidentType?.questions.length > 0) {
			setIncidentData(incidentType?.questions);
			updateAnswer("incident_type_id", incidentType.id);
			updateAnswer("incident_name", incidentType?.name);
		}
	}, []);

	useEffect(() => {
		if (driverList.length > 0) {
			const driverArray = driverList.map((driver) => ({
				value: driver?.id,
				label: driver?.name,
			}));
			setDriverData(driverArray);
		}
	}, [driverValue]);

	useEffect(() => {
		if (!draftData) {
			const getCurrentState = async () => {
				try {
					const hasPermission = await locationPermission();
					if (!hasPermission) return;

					const { latitude, longitude } = await getCurrentLocation();
					const { state1 } = await getCityStateCountry(latitude, longitude);

					if (state1 && stateList?.data.length > 0) {
						const selectedState = stateList.data.find(
							(item) => item?.name === state1
						);
						if (selectedState) {
							stateOnChange(selectedState);
						}
						// else {
						// 	stateOnChange({ id: "", name: state1, code: "" });
						// }
					}
				} catch (error) {
					console.warn("Error: ", error);
				}
			};

			getCurrentState();

			const currentDateTime = new Date();
			confirmIncidentDate(currentDateTime);

			const timeAnswerExists = incidentData[mainIndex]?.answers.some(
				(answer) => answer?.type === "time"
			);

			if (timeAnswerExists) {
				confirmIncidentTime(currentDateTime);
			}
		}
	}, [incidentData]);

	useEffect(() => {
		const disabled = isAllowNext();
		setIsButtonDisabled(disabled);
		const isOnlyInitialValue =
			answers &&
			Object.keys(answers).length === 2 &&
			"incident_type_id" in answers &&
			"incident_name" in answers;

		setIsShowDraftBtn(!isOnlyInitialValue);
	}, [answers, mainIndex, isShowDraftBtn]);

	useEffect(() => {
		if (
			isDraftApplied ||
			!draftData?.incident_data ||
			!incidentData?.[mainIndex]
		)
			return;

		const data = draftData.incident_data;

		updateAnswer("incident_id", draftData.display_id);

		const findById = (list, id) =>
			list?.data?.find((i) => i.id === parseInt(id));
		const findByName = (list, name) => list?.find((i) => i.name === name);

		if (data.incident_date) confirmIncidentDate(data.incident_date);

		if (
			data.incident_time &&
			(incidentData[mainIndex]?.answers.some((a) => a.type === "time") ||
				inlineQuestions.some((q) => q.answers.some((a) => a.type === "time")))
		) {
			confirmIncidentTime(moment(data.incident_time, "hh:mm A"));
		}

		const state = findById(stateList, data.state_id);
		if (state) stateOnChange(state);

		const vehicle = findById(vehicleList, data.vehicle_id);
		if (vehicle) onVehicleChange(vehicle);

		if (data?.driver_name === userData?.name) {
			onPressIWasDriving();
		}
		const driver = findByName(driverList, data.driver_name);
		if (driver) onChangeDriver(driver);

		data?.damage_area
			?.split(",")
			.map((a) => a.trim())
			.forEach((area) => {
				const key = getTruckKeyFromSide(area);
				if (key) toggleDamageSide(area, key);
			});

		if (draftData?.incident_images?.length) {
			populateImagesFromDraft(draftData.incident_images);
		}

		if (data.other_info) {
			setCriticalInfo(data.other_info);
			updateAnswer("other_info", data.other_info);
			setCriticalInfoPress(false);
		}

		setIsDraftApplied(true);
	}, [incidentData]);

	useEffect(() => {
		if (!draftData?.incident_data || !incidentData?.[mainIndex]) return;
		const data = draftData.incident_data;

		const applyDraftToQuestion = (questionObj) => {
			if (!questionObj) return;
			const questionId = questionObj.question.id;

			questionObj.answers.forEach((answer) => {
				const draftValue = data[answer.value];

				if (answer.type === "options" && draftValue && !answers[answer.value]) {
					const matched = answer.options?.find(
						(opt) => opt.Text === draftValue
					);
					if (matched) handleOptionSelect(matched, answer, questionId);
				}
			});
		};

		applyDraftToQuestion(incidentData[mainIndex]);
		inlineQuestions?.forEach(applyDraftToQuestion);
	}, [inlineQuestions, mainIndex]);

	const populateImagesFromDraft = (draftImages) => {
		const currentTimestamp = Date.now();

		const imgAPI = draftImages.map((img, index) => {
			const uri = img.photo_path;
			const fileExt = uri.split(".").pop();

			return {
				size: 0,
				type: "image/jpeg",
				uri,
				localPath: img.photo,
				name: `${currentTimestamp}_${index}.${fileExt}`,
			};
		});

		const displayImages = imgAPI.map((img) => ({
			...img,
			isImage: true,
		}));

		if (displayImages.length < MAX_IMAGES) {
			displayImages.push({ isImage: false });
		}

		setIncidentImgAPI(imgAPI);
		setImages(displayImages);
		updateAnswer("photo", imgAPI);
		setIsSelectedLayout(true);
	};
	const isAllowNext = () => {
		if (incidentData.length > 0) {
			const requiredKeys =
				incidentData[mainIndex]?.answers?.map((answer) => answer?.value) || [];

			return !requiredKeys.every(
				(key) => answers && answers.hasOwnProperty(key)
			);
		}
		return true;
	};
	const fetchNextQuestion = () => {
		const currentQuestionId =
			inlineQuestions.length > 0
				? inlineQuestions[inlineQuestions.length - 1]?.question?.id
				: incidentData[mainIndex]?.question?.id;

		const currentQuestionData = incidentData.find(
			(q) => q.question.id === currentQuestionId
		);

		const currentQuestion = currentQuestionData?.question;
		const currentAnswers = currentQuestionData?.answers;

		const requiredKeys = currentAnswers.map((answer) => answer?.value);
		const missingKeys = requiredKeys.filter(
			(key) => !answers || !answers.hasOwnProperty(key)
		);

		if (missingKeys.length > 0) {
			handleMissingKeys(missingKeys, currentQuestion.id);
			return;
		}

		let selectedAnswer = currentAnswers.find((answer) => {
			if (!answer.options) {
				return false;
			}

			let foundOption = answer.options.find((option) => option.isSelected);
			return foundOption !== undefined;
		});

		let displayOnNextPage = 1;
		let nextQuestionId = null;

		if (selectedAnswer) {
			const selectedOption = selectedAnswer.options.find(
				(option) => option.isSelected
			);
			nextQuestionId = selectedOption?.next_question_id;
			displayOnNextPage = selectedOption?.display_on_next_page ?? 1;
		} else {
			let nextAnswerWithQuestion = currentAnswers.find(
				(answer) => answer.next_question_id
			);
			nextQuestionId = nextAnswerWithQuestion?.next_question_id;
			displayOnNextPage = nextAnswerWithQuestion?.display_on_next_page ?? 1;
		}

		if (nextQuestionId !== null) {
			if (displayOnNextPage === 0) {
				// Display next question inline
				addInlineQuestion(nextQuestionId);
			} else {
				// Navigate to the next question
				navigateToNextQuestion(nextQuestionId);
			}
		} else {
			gotoIncidentReviewScreen();
		}
	};
	const addInlineQuestion = (nextQuestionId) => {
		// Find the next question in the incidentData array
		const nextQuestion = incidentData.find(
			(q) => q.question.id === nextQuestionId
		);

		if (nextQuestion !== -1) {
			setInlineQuestions((prev) => [...prev, nextQuestion]);
			inlineQuestionsHistoryRef.current.push(nextQuestion);

			hapticVibrate();
		}
	};
	const navigateToNextQuestion = (nextQuestionId) => {
		const nextQuestionIndex = incidentData.findIndex(
			(q) => q.question.id === nextQuestionId
		);

		if (nextQuestionIndex !== -1) {
			setInlineQuestions([]);
			setMainIndex((prevIndex) => {
				historyRef.current.push({
					currentIndex: prevIndex,
					nextQuestionId: nextQuestionId,
				});
				return nextQuestionIndex;
			});
			hapticVibrate();
		} else {
			gotoIncidentReviewScreen();
			hapticVibrate();
		}
	};
	const handleOptionMissing = () => {
		// setIsSelectedOption(true);
		// setSelectedOptionMsg(MESSAGE.selectOption);
	};
	const handleMissingKeys = (missingKeys, questionId) => {
		if (checkArrayKey(missingKeys, "incident_date")) {
			setIsIncidentDate(true);
			setIncidentDateMsg(MESSAGE.incidentDate);
			return false;
		}
		if (checkArrayKey(missingKeys, "incident_time")) {
			setIsIncidentTime(true);
			setIncidentTimeMsg(MESSAGE.incidentTime);
			return false;
		}
		if (checkArrayKey(missingKeys, "state_id")) {
			setIsIncidentState(true);
			setIncidentStateMsg(MESSAGE.state);
			return false;
		}
		if (checkArrayKey(missingKeys, "vehicle_id")) {
			setIsVehicle(true);
			setVehicleMsg(MESSAGE.vehicle);
			return false;
		}
		if (checkArrayKey(missingKeys, "driver_name")) {
			setIsDriverFocus(true);
			setDriverMessage("Please select driver");
			return false;
		}
		if (checkArrayKey(missingKeys, "damage_area")) {
			setIsDamageSide(true);
			setDamageSideMsg(MESSAGE.selectOption);
			return false;
		}
		if (checkForMultipleKeys(missingKeys, handleOptionMissing)) {
			setListValidationErrors((prev) => ({
				...prev,
				[questionId]: MESSAGE.selectOption,
			}));
			return false;
		}
		if (checkArrayKey(missingKeys, "photo")) {
			setIsImages(true);
			setImagesMsg(MESSAGE.uploadImages);
			return false;
		}
		if (checkArrayKey(missingKeys, "other_info")) {
			setIsCriticalInfo(true);
			setCriticalInfoMsg(MESSAGE.criticalMsg);
			return false;
		}
	};
	const gotoPreviousQuestion = () => {
		const currentQuestionId =
			inlineQuestions.length > 0
				? inlineQuestions[inlineQuestions.length - 1]?.question?.id
				: incidentData[mainIndex]?.question?.id;

		const currentQuestionData = incidentData.find(
			(q) => q.question.id === currentQuestionId
		);

		const currentAnswers = currentQuestionData?.answers;
		const requiredKeys = currentAnswers?.map((answer) => answer.value) || [];

		// Remove inline question answers using history
		if (inlineQuestionsHistoryRef.current.length > 0) {
			const lastInlineQuestion = inlineQuestionsHistoryRef.current.pop();
			const inlineAnswerKeys = lastInlineQuestion.answers?.map(
				(answer) => answer.value
			);

			const shouldUpdateAnswers = inlineAnswerKeys.some((key) =>
				currentAnswers.some((answer) => answer.value === key)
			);

			if (shouldUpdateAnswers) {
				setAnswers((prevAnswers) => {
					const updatedAnswers = { ...prevAnswers };
					inlineAnswerKeys.forEach((key) => {
						delete updatedAnswers[key];
					});
					return updatedAnswers;
				});
			}
		}

		const isFilledKeys = requiredKeys.filter(
			(key) => !answers || answers.hasOwnProperty(key)
		);

		if (isFilledKeys.length > 0) {
			handleClearCurrentQuestion(isFilledKeys);
		}

		if (inlineQuestions.length > 0) {
			setInlineQuestions((prev) => prev.slice(0, -1));
			return;
		}

		if (historyRef.current.length > 0) {
			const lastHistoryItem = historyRef.current.pop();
			setMainIndex(lastHistoryItem.currentIndex);
		} else {
			props.navigation.goBack();
		}
		return true;
	};
	const handleClearCurrentQuestion = (isFilledKeys) => {
		const updatedAnswers = { ...answers };
		isFilledKeys.forEach((key) => {
			clearQuestion(key, updatedAnswers);
		});
		setAnswers(updatedAnswers);
	};
	const clearQuestion = (key, updatedAnswers) => {
		if (key === "incident_date") {
			delete updatedAnswers["incident_date"];
			setIncidentDate("");
			setIncidentDateMsg("");
			setIncidentDateOpen(false);
			setIsIncidentDate(false);
			setIncidentDatePress(true);
		} else if (key === "incident_time") {
			delete updatedAnswers["incident_time"];
			setIncidentTime("");
			setIncidentTimeMsg("");
			setIncidentTimeOpen(false);
			setIsIncidentTime(false);
			setIncidentTimePress(true);
		} else if (key === "state_id") {
			delete updatedAnswers["state_id"];
			delete updatedAnswers["state"];
			setIncidentState("");
			setIncidentStateID("");
			setIncidentStateMsg("");
			setIsIncidentState(false);
			setIncidentStatePress(true);
		} else if (key === "vehicle_id") {
			delete updatedAnswers["vehicle_id"];
			delete updatedAnswers["vehicle"];
			setVehicle("");
			setVehicleID("");
			setVehicleMsg("");
			setIsVehicle(false);
			setVehiclePress(true);
		} else if (key === "driver_name") {
			delete updatedAnswers["driver_name"];
			setDriverValue("");
			setDriverMessage("");
			setIsDriverFocus(false);
			setDriverPress(true);
		} else if (key === "photo") {
			delete updatedAnswers["photo"];
			setImages([]);
			setIncidentImgAPI("");
			setIsImages(false);
			setImagesMsg("");
			setIsSelectedLayout(false);
		} else if (key === "other_info") {
			delete updatedAnswers["other_info"];
			setCriticalInfo("");
			setCriticalInfoMsg("");
			setIsCriticalInfo(false);
			setCriticalInfoPress(true);
		} else if (key === "damage_area") {
			delete updatedAnswers["damage_area"];
			setDamageSides([]);
			setDamageSideMsg("");
			setIsDamageSide(false);
			setUpdateTruck({
				truckTop: false,
				truckMiddleLeft: false,
				truckMiddleRight: false,
				truckFront: false,
				truckFrontLeft: false,
				truckFrontRight: false,
				truckBack: false,
				truckBackLeft: false,
				truckBackRight: false,
			});
		} else {
			delete updatedAnswers[key];
		}
	};
	const updateAnswer = (key, value) => {
		setAnswers((prevAnswers) => ({
			...prevAnswers,
			[key]: value,
		}));
	};
	const getPreviousAnswer = (currentIndex) => {
		if (currentIndex > 0) {
			const previousQuestion = incidentData[currentIndex - 1];
			const selectedAnswer = previousQuestion.answers.find((answer) =>
				answer.options.some((option) => option.isSelected)
			);

			if (selectedAnswer) {
				const selectedOption = selectedAnswer.options.find(
					(option) => option.isSelected
				);
				return ` ${selectedOption?.Text}` || "";
			}
		}
		return "";
	};
	// Option list
	const handleOptionSelect = (item, answer, questionId) => {
		// remove all elements that come after questionId in the inlineQuestions
		const questionIndex = inlineQuestions.findIndex(
			(q) => q.question.id === questionId
		);

		let updatedInlineQuestions = [...inlineQuestions];
		if (questionIndex !== -1) {
			updatedInlineQuestions = updatedInlineQuestions.slice(
				0,
				questionIndex + 1
			);
		} else if (inlineQuestions.length > 0) {
			updatedInlineQuestions = [];
		}

		const removedQuestionIds = new Set(
			inlineQuestions.slice(questionIndex + 1).map((q) => q.answers[0].value)
		);

		// Remove answers corresponding to removed questions
		const updatedAnswers = Object.keys(answers)
			.filter((key) => !removedQuestionIds.has(key))
			.reduce((obj, key) => {
				obj[key] = answers[key];
				return obj;
			}, {});

		setInlineQuestions(updatedInlineQuestions);
		setAnswers(updatedAnswers);

		const updatedOptions = answer?.options.map((option) => {
			return {
				...option,
				isSelected: option.Text === item.Text,
			};
		});

		const updatedIncidentData = incidentData.map((q) => {
			if (q.question.id === questionId) {
				return {
					...q,
					answers: q.answers?.map((a) =>
						a.value === answer.value ? { ...a, options: updatedOptions } : a
					),
				};
			}
			return q;
		});

		setIncidentData(updatedIncidentData);
		updateAnswer(answer.value, item.Text);

		setListValidationErrors((prev) => {
			const updatedErrors = { ...prev };
			delete updatedErrors[questionId];
			return updatedErrors;
		});
	};
	// Date picker
	const openIncidentDate = () => {
		setIncidentDateOpen(true);
		setIncidentDatePress(true);
		setIsIncidentDate(false);
	};
	const confirmIncidentDate = (date) => {
		const formattedDate = moment(date).format("MM/DD/YYYY");
		setIncidentDate(formattedDate);
		updateAnswer("incident_date", formattedDate);
		setIncidentDatePress(false);
		setIncidentDateOpen(false);
	};
	const hideIncidentDate = () => {
		setIncidentDateOpen(false);
		if (incidentDate) {
			setIncidentDate("");
			setIncidentDatePress(true);

			setAnswers((prevAnswers) => {
				const updatedAnswers = { ...prevAnswers };
				if ("incident_date" in updatedAnswers) {
					delete updatedAnswers["incident_date"];
				}
				return updatedAnswers;
			});
		}
	};
	// Time picker
	const openIncidentTime = () => {
		setIncidentTimeOpen(true);
		setIncidentTimePress(true);
		setIsIncidentTime(false);
	};
	const confirmIncidentTime = (time) => {
		const formattedTime = moment(time).format("hh:mm A");
		setIncidentTime(formattedTime);
		updateAnswer("incident_time", formattedTime);
		setIncidentTimePress(false);
		setIncidentTimeOpen(false);
	};
	const hideIncidentTime = () => {
		setIncidentTimeOpen(false);
		if (incidentTime) {
			setIncidentTime("");
			setIncidentTimePress(true);
			setAnswers((prevAnswers) => {
				const updatedAnswers = { ...prevAnswers };
				if ("incident_time" in updatedAnswers) {
					delete updatedAnswers["incident_time"];
				}
				return updatedAnswers;
			});
		}
	};
	// State
	const stateOnChange = (item) => {
		setIsIncidentState(false);
		setIncidentState(item.name);
		updateAnswer("state", item.name);
		setIncidentStateID(item.id.toString());
		updateAnswer("state_id", item.id.toString());
		setIncidentStatePress(false);
	};
	// Driver
	const onChangeDriver = (item) => {
		setIsDriverFocus(false);
		setDriverValue(item.label || item.name);
		updateAnswer("driver_name", item.label || item.name);
		setDriverPress(false);
	};
	const onPressIWasDriving = () => {
		setIsDriverFocus(false);
		setDriverValue(userData?.name);
		updateAnswer("driver_name", userData?.name);
		setDriverPress(false);
	};
	// Select or scan vehicle
	const getOcrImage = async () => {
		try {
			const permissionGranted = await checkCameraPermission();
			if (!permissionGranted) return;

			const image = await ImagePicker.openCamera({
				width: 400,
				height: 400,
				cropping: false,
				includeBase64: false,
			});

			if (image?.path) {
				await fetchOcrText(image.path);
			}
		} catch (err) {
			console.warn("Camera error: ", err);
		}
	};
	const fetchOcrText = async (file) => {
		// testing
		// const textRecognition = await MlkitOcr.detectFromFile(file);
		// console.log("textRecognition: ", textRecognition[0].text);

		// iOS
		const textRecognition = await TextRecognition.recognize(file);
		console.log("textRecognition: ", textRecognition);

		// For android install -> @react-native-ml-kit/text-recognition
		// Remove -> react-native-text-recognition
		// const result = await TextRecognition.recognize(file);
		// console.log("Recognized text:", result.text);

		setScanValue(textRecognition[0]);

		try {
			setIsLoading(true);
			const vinRes = await Api.get(`user/get-vehicle/${textRecognition[0]}`);

			if (vinRes.success) {
				onVehicleChange(vinRes.data);
			} else {
				setIsLoading(false);
				showMessage({
					message: "No vehicle found with this VIN number",
					type: "danger",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
				setScanValue("");
				setIsVehicle(true);
				setVehicle("");
				updateAnswer("vehicle", "");
				setVehicleID("");
				updateAnswer("vehicle_id", "");
				setVehiclePress(true);
			}
		} catch (error) {
			setIsLoading(false);
			console.warn(error);
		}
	};
	const onVehicleChange = (item) => {
		setIsLoading(false);
		setIsVehicle(false);
		setVehicle(item?.name);
		updateAnswer("vehicle", item?.name);
		setVehicleID(item?.id.toString());
		updateAnswer("vehicle_id", item?.id.toString());
		setVehiclePress(false);
	};
	// Incident Images
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
					// Filter images based on allowed MIME types
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
									size: tempImgs[i].fileSize,
									type: tempImgs[i].type,
									uri: tempImgs[i].uri,
									name: currentTimestamp + [i] + "." + fileExt,
								};
								tempImgs[i]["isImage"] = true;
								imgAPI.push(tempImgAPI);
							}
							setIncidentImgAPI(imgAPI);
							updateAnswer("photo", imgAPI);
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
						updateAnswer("photo", newImgAPI);
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
			ImagePicker.openCamera({
				width: 400,
				height: 400,
				cropping: false,
				mediaType: "photo",
			})
				.then(async (image) => {
					const resizedImage = await ImageResizer.createResizedImage(
						image.path,
						800,
						800,
						"JPEG",
						80,
						0
					);
					const fileInfo = await stat(resizedImage.path);
					if (fileInfo.size > MAX_FILE_SIZE_BYTES) {
						showMessage({
							message: MESSAGE.maxImageSize,
							type: "danger",
							icon: "auto",
							duration: 3000,
							floating: true,
							statusBarHeight: 40,
						});
						return false;
					}

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
					updateAnswer("photo", newImgAPI);
					setImages(newImages);
				})
				.catch((error) => {
					setIsModal(false);
				});
		}
	};
	const deleteIncidentImgs = (imgItems, index) => {
		const imgResultAPI = incidentImgAPI.filter((item, i) => {
			return i != index;
		});
		setIncidentImgAPI(imgResultAPI);
		updateAnswer("photo", imgResultAPI);
		const imgResult = images.filter((item, i) => {
			return i != index;
		});

		if (imgResult.length === 1) {
			setIsSelectedLayout(false);
			setImages([]);
			setIncidentImgAPI("");
			setAnswers((prev) => {
				const { photo, ...rest } = prev || {};
				return rest;
			});
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
	// Critical info
	const onChangeCriticalInfo = (text) => {
		setCriticalInfo(text);
		updateAnswer("other_info", text);
		setIsCriticalInfo(false);
	};
	// Damage Area
	const toggleDamageSide = (sideKey, truckKey) => {
		setIsDamageSide(false);

		setDamageSides((prev) => {
			let updatedSides;

			if (prev.includes(sideKey)) {
				updatedSides = prev.filter((item) => item !== sideKey);
			} else {
				updatedSides = [...prev, sideKey];
			}

			updateAnswer("damage_area", updatedSides.join(", "));

			if (updatedSides.length === 0) {
				setAnswers((prev) => {
					const { damage_area, ...rest } = prev || {};
					return rest;
				});
			}

			return updatedSides;
		});

		setUpdateTruck((prev) => ({
			...prev,
			[truckKey]: !prev[truckKey],
		}));
	};
	const handleAccidentSideTop = () => {
		setIsDamageSide(false);
		toggleDamageSide("Top", "truckTop");
	};
	const handleAccidentSideMiddleLeft = () => {
		setIsDamageSide(false);
		toggleDamageSide("Middle Left", "truckMiddleLeft");
	};
	const handleAccidentSideMiddleRight = () => {
		setIsDamageSide(false);
		toggleDamageSide("Middle Right", "truckMiddleRight");
	};
	const handleAccidentSideFront = () => {
		setIsDamageSide(false);
		toggleDamageSide("Front", "truckFront");
	};
	const handleAccidentSideFrontLeft = () => {
		setIsDamageSide(false);
		toggleDamageSide("Front Left", "truckFrontLeft");
	};
	const handleAccidentSideFrontRight = () => {
		setIsDamageSide(false);
		toggleDamageSide("Front Right", "truckFrontRight");
	};
	const handleAccidentSideBack = () => {
		setIsDamageSide(false);
		toggleDamageSide("Back", "truckBack");
	};
	const handleAccidentSideBackLeft = () => {
		setIsDamageSide(false);
		toggleDamageSide("Back Left", "truckBackLeft");
	};
	const handleAccidentSideBackRight = () => {
		setIsDamageSide(false);
		toggleDamageSide("Back Right", "truckBackRight");
	};
	// Submit incident
	const gotoIncidentReviewScreen = () => {
		props.navigation.navigate("ManualIncidentReview", {
			reviewScreen: answers,
		});
	};
	const onPressSaveDraft = async () => {
		const excludedKeys = ["state", "vehicle"];
		const data = Object.fromEntries(
			Object.entries(answers).filter(([key]) => !excludedKeys.includes(key))
		);
		const formData = new FormData();
		formData.append("type", "draft");
		for (const [key, value] of Object.entries(data)) {
			if (key === "incident_date") {
				formData.append(
					"incident_date",
					moment(value, "MM-DD-YYYY").format("YYYY-MM-DD")
				);
			} else if (key === "state_id" || key === "vehicle_id") {
				formData.append(key, parseInt(value));
			} else if (key === "photo") {
				await Promise.all(
					value.map(async (image, index) => {
						let uri = image.uri;

						if (!uri.startsWith("https")) {
							const compressed = await compressImage(image);
							uri = compressed.uri;
						}

						const fileExt = image.name?.split(".").pop() || "jpg";

						formData.append(`photo[${index}]`, {
							uri,
							type: image.type || `image/${fileExt}`,
							name: `${Date.now()}_${index}.${fileExt}`,
						});
					})
				);
			} else {
				formData.append(key, value);
			}
		}
		dispatch(saveDraftRequest(formData, props.navigation));
	};

	return (
		<View style={[IncidentStyle.mainContainer, IncidentStyle.backgroundWhite]}>
			<Loader show={isLoading} />
			<DarkHeader
				isLogo={true}
				iconName={"angle-left"}
				iconSetName={"FontAwesome6"}
				iconColor={Colors.backArrowWhite}
				iconSize={24}
				onPress={() => gotoPreviousQuestion()}
			/>
			{!isLoading && (
				<ScrollView
					style={{ flex: 1 }}
					overScrollMode={"never"}
					nestedScrollEnabled={true}
				>
					<View
						style={[
							IncidentStyle.backgroundColorBlue,
							IncidentStyle.paddingFormContainer,
						]}
					>
						<View>
							{incidentData[mainIndex]?.question && (
								<View>
									<View style={[CommonStyles.directionRowSB]}>
										<Text style={[IncidentStyle.darkQusText]}>
											{incidentData[mainIndex]?.question?.white_label_question}
											<Text style={[IncidentStyle.lightQusText]}>
												{incidentData[mainIndex]?.question
													?.grey_label_question !== "  previous_selected?"
													? incidentData[mainIndex]?.question
															?.grey_label_question
													: getPreviousAnswer(mainIndex)}
											</Text>
										</Text>

										{incidentData[mainIndex]?.question?.grey_label_question ===
											"Pictures (up to 4)" && (
											<TouchableOpacity
												disabled={incidentImgAPI.length === 4}
												onPress={() => handleOpenCamera()}
											>
												<Icons
													iconName={"camera-outline"}
													iconSetName={"MaterialCommunityIcons"}
													iconColor={Colors.labelWhite}
													iconSize={24}
												/>
											</TouchableOpacity>
										)}
									</View>

									{incidentData[mainIndex]?.answers.map((answer, index) => (
										<QuestionType
											key={`question-${index}`}
											type={answer.type}
											// Date Picker
											isVisible={incidentDateOpen}
											value={incidentDate}
											onPickerOpen={() => openIncidentDate()}
											onConfirm={(date) => confirmIncidentDate(date)}
											onCancel={() => hideIncidentDate()}
											onPressFocus={() => openIncidentDate()}
											isValidationShow={isIncidentDate}
											validationMessage={incidentDateMsg}
											isPressOut={incidentDatePress}
											// Time picker
											timeIsVisible={incidentTimeOpen}
											timeValue={incidentTime}
											timeOnPickerOpen={() => openIncidentTime()}
											confirmIncidentTime={(time) => confirmIncidentTime(time)}
											timeOnCancel={() => hideIncidentTime()}
											timeOnPressFocus={() => openIncidentTime()}
											timeIsValidationShow={isIncidentTime}
											timeValidationMessage={incidentTimeMsg}
											timeIsPressOut={incidentTimePress}
											// State List dropdown
											stateData={stateList?.length !== 0 ? stateList?.data : []}
											stateValue={incidentState}
											stateIsPressOut={incidentStatePress}
											stateIsValidationShow={isIncidentState}
											stateValidationMessage={incidentStateMsg}
											stateOnFocus={() => {
												setIsIncidentState(false);
											}}
											stateOnPressFocus={() => {
												setIncidentStatePress(true);
												setIsIncidentState(false);
											}}
											stateOnBlur={() => setIsIncidentState(false)}
											stateOnChange={(item) => stateOnChange(item)}
											// Driver list dropdown
											driverData={driverData?.length > 0 ? driverData : []}
											driverValue={driverValue}
											driverIsPressOut={driverPress}
											driverIsValidationShow={isDriverFocus}
											driverValidationMessage={driverMessage}
											driverOnFocus={() => {
												setIsDriverFocus(true);
											}}
											driverOnPressFocus={() => {
												setDriverPress(true);
												setIsDriverFocus(false);
											}}
											driverOnBlur={() => setIsDriverFocus(false)}
											driverOnChange={(item) => onChangeDriver(item)}
											driverOnPressIWasDriving={() => onPressIWasDriving()}
											// Vehicle list dropdown with VIN
											vehicleData={vehicleList.data}
											vehicleValue={vehicle}
											vehicleIsPressOut={vehiclePress}
											vehicleIsValidationShow={isVehicle}
											vehicleValidationMessage={vehicleMsg}
											vehicleOnFocus={() => {
												setIsVehicle(false);
											}}
											vehicleOnPressFocus={() => {
												setVehiclePress(true);
												setIsVehicle(false);
											}}
											vehicleOnBlur={() => setIsVehicle(false)}
											vehicleOnChange={(item) => {
												setIsVehicle(false);
												setVehicle(item.name);
												updateAnswer("vehicle", item.name);
												setVehicleID(item.id.toString());
												updateAnswer("vehicle_id", item.id.toString());
												setVehiclePress(false);
											}}
											getOcrImage={() => getOcrImage()}
											// Option list
											OptionListData={
												Array.isArray(answer?.options) ? answer?.options : []
											}
											OptionSelectItem={(item) =>
												handleOptionSelect(
													item,
													answer,
													incidentData[mainIndex]?.question.id
												)
											}
											selectedAnswer={answers?.[answer.value]}
											OptionIsValidationShow={
												!!listValidationErrors[
													incidentData[mainIndex]?.question.id
												]
											}
											OptionValidationMessage={
												listValidationErrors[
													incidentData[mainIndex]?.question.id
												]
											}
											// Photos
											isSelectedLayout={isSelectedLayout}
											imagesArray={images}
											renderSelectedImg={renderSelectedImg}
											openImagePicker={() => openImagePicker()}
											imageIsValidationShow={isImages}
											imageValidationMessage={imagesMsg}
											// Critical Information
											infoValue={criticalInfo}
											onChangeCriticalInfo={onChangeCriticalInfo}
											infoIsValidationShow={iscriticalInfo}
											infoValidationMessage={criticalInfoMsg}
											infoOnFocus={() => setCriticalInfoPress(true)}
											infoOnBlur={() => setCriticalInfoPress(false)}
											infoIsPressOut={criticalInfoPress}
											infoOnPressFocus={() => setCriticalInfoPress(true)}
											// Damage Area
											updatedTruck={updatedTruck}
											handleAccidentSideFront={() => handleAccidentSideFront()}
											handleAccidentSideFrontLeft={() =>
												handleAccidentSideFrontLeft()
											}
											handleAccidentSideMiddleLeft={() =>
												handleAccidentSideMiddleLeft()
											}
											handleAccidentSideBackLeft={() =>
												handleAccidentSideBackLeft()
											}
											handleAccidentSideTop={() => handleAccidentSideTop()}
											handleAccidentSideFrontRight={() =>
												handleAccidentSideFrontRight()
											}
											handleAccidentSideMiddleRight={() =>
												handleAccidentSideMiddleRight()
											}
											handleAccidentSideBackRight={() =>
												handleAccidentSideBackRight()
											}
											handleAccidentSideBack={() => handleAccidentSideBack()}
											damageIsValidationShow={isDamageSide}
											damageValidationMessage={damageSideMsg}
										/>
									))}
								</View>
							)}
							{inlineQuestions.map((q, index) => (
								<View style={{ marginTop: 20 }} key={index}>
									<Text style={[IncidentStyle.darkQusText]}>
										{q.question.white_label_question}
										<Text style={[IncidentStyle.lightQusText]}>
											{q.question.grey_label_question}
										</Text>
									</Text>
									{q.answers.map((answer, idx) => (
										<QuestionType
											key={`subQuestion-${idx}`}
											type={answer.type}
											// Date Picker
											isVisible={incidentDateOpen}
											value={incidentDate}
											onPickerOpen={() => openIncidentDate()}
											onConfirm={(date) => confirmIncidentDate(date)}
											onCancel={() => hideIncidentDate()}
											onPressFocus={() => openIncidentDate()}
											isValidationShow={isIncidentDate}
											validationMessage={incidentDateMsg}
											isPressOut={incidentDatePress}
											// Time picker
											timeIsVisible={incidentTimeOpen}
											timeValue={incidentTime}
											timeOnPickerOpen={() => openIncidentTime()}
											confirmIncidentTime={(time) => confirmIncidentTime(time)}
											timeOnCancel={() => hideIncidentTime()}
											timeOnPressFocus={() => openIncidentTime()}
											timeIsValidationShow={isIncidentTime}
											timeValidationMessage={incidentTimeMsg}
											timeIsPressOut={incidentTimePress}
											// State List dropdown
											stateData={stateList?.length !== 0 ? stateList?.data : []}
											stateValue={incidentState}
											stateIsPressOut={incidentStatePress}
											stateIsValidationShow={isIncidentState}
											stateValidationMessage={incidentStateMsg}
											stateOnFocus={() => {
												setIsIncidentState(true);
											}}
											stateOnPressFocus={() => {
												setIncidentStatePress(true);
												setIsIncidentState(false);
											}}
											stateOnBlur={() => setIsIncidentState(false)}
											stateOnChange={(item) => {
												setIsIncidentState(false);
												setIncidentState(item.name);
												updateAnswer("state", item.name);
												setIncidentStateID(item.id.toString());
												updateAnswer("state_id", item.id.toString());
												setIncidentStatePress(false);
											}}
											// Driver list dropdown
											driverData={driverData?.length > 0 ? driverData : []}
											driverValue={driverValue}
											driverIsPressOut={driverPress}
											driverIsValidationShow={isDriverFocus}
											driverValidationMessage={driverMessage}
											driverOnFocus={() => {
												setIsDriverFocus(true);
											}}
											driverOnPressFocus={() => {
												setDriverPress(true);
												setIsDriverFocus(false);
											}}
											driverOnBlur={() => setIsDriverFocus(false)}
											driverOnChange={(item) => {
												setIsDriverFocus(false);
												setDriverValue(item.label);
												updateAnswer("driver_name", item.label);
												setDriverPress(false);
											}}
											driverOnPressIWasDriving={() => {
												setIsDriverFocus(false);
												setDriverValue(userData?.name);
												updateAnswer("driver_name", userData?.name);
												setDriverPress(false);
											}}
											// Vehicle list dropdown with VIN
											vehicleData={vehicleList.data}
											vehicleValue={vehicle}
											vehicleIsPressOut={vehiclePress}
											vehicleIsValidationShow={isVehicle}
											vehicleValidationMessage={vehicleMsg}
											vehicleOnFocus={() => {
												setIsVehicle(true);
											}}
											vehicleOnPressFocus={() => {
												setVehiclePress(true);
												setIsVehicle(false);
											}}
											vehicleOnBlur={() => setIsVehicle(false)}
											vehicleOnChange={(item) => {
												setIsVehicle(false);
												setVehicle(item.name);
												updateAnswer("vehicle", item.name);
												setVehicleID(item.id.toString());
												updateAnswer("vehicle_id", item.id.toString());
												setVehiclePress(false);
											}}
											getOcrImage={() => getOcrImage()}
											// Option list
											OptionListData={
												Array.isArray(answer?.options) ? answer?.options : []
											}
											OptionSelectItem={(item) =>
												handleOptionSelect(item, answer, q.question.id)
											}
											selectedAnswer={answers?.[answer.value]}
											OptionIsValidationShow={
												!!listValidationErrors[q.question.id]
											}
											OptionValidationMessage={
												listValidationErrors[q.question.id]
											}
											// Photos
											isSelectedLayout={isSelectedLayout}
											imagesArray={images}
											renderSelectedImg={renderSelectedImg}
											openImagePicker={() => openImagePicker()}
											imageIsValidationShow={isImages}
											imageValidationMessage={imagesMsg}
											// Critical Information
											infoValue={criticalInfo}
											onChangeCriticalInfo={onChangeCriticalInfo}
											infoIsValidationShow={iscriticalInfo}
											infoValidationMessage={criticalInfoMsg}
											infoOnFocus={() => setCriticalInfoPress(true)}
											infoOnBlur={() => setCriticalInfoPress(false)}
											infoIsPressOut={criticalInfoPress}
											infoOnPressFocus={() => setCriticalInfoPress(true)}
											// Damage Area
											updatedTruck={updatedTruck}
											handleAccidentSideFront={() => handleAccidentSideFront()}
											handleAccidentSideFrontLeft={() =>
												handleAccidentSideFrontLeft()
											}
											handleAccidentSideMiddleLeft={() =>
												handleAccidentSideMiddleLeft()
											}
											handleAccidentSideBackLeft={() =>
												handleAccidentSideBackLeft()
											}
											handleAccidentSideTop={() => handleAccidentSideTop()}
											handleAccidentSideFrontRight={() =>
												handleAccidentSideFrontRight()
											}
											handleAccidentSideMiddleRight={() =>
												handleAccidentSideMiddleRight()
											}
											handleAccidentSideBackRight={() =>
												handleAccidentSideBackRight()
											}
											handleAccidentSideBack={() => handleAccidentSideBack()}
											damageIsValidationShow={isDamageSide}
											damageValidationMessage={damageSideMsg}
										/>
									))}
								</View>
							))}
						</View>
					</View>
					{incidentData[mainIndex]?.answers.map((answer, index) => (
						<>
							{answer.type === "select_driver" && (
								<View
									style={{
										...LayoutStyle.marginHorizontal20,
										...LayoutStyle.marginTop20,
									}}
								>
									<Button
										btnLabelColor={Colors.secondary}
										isBtnActive={true}
										btnBorderColor={Colors.secondary}
										btnColor={Colors.white}
										btnName={"I was driving"}
										btnWidth={1}
										onPress={() => {
											setIsDriverFocus(false);
											setDriverValue(userData?.name);
											updateAnswer("driver_name", userData?.name);
											setDriverPress(false);
										}}
									/>
								</View>
							)}
						</>
					))}

					<View style={{ ...LayoutStyle.margin20 }}>
						<View style={{ ...CommonStyles.directionRowSB }}>
							{isShowDraftBtn && (
								<View style={{ width: "48%" }}>
									<Button
										onPress={() => setIsShowDraftPanel(!isShowDraftPanel)}
										btnLabelColor={Colors.white}
										isBtnActive={true}
										btnColor={Colors.primary}
										btnName={"Save as Draft"}
									/>
								</View>
							)}
							<View style={{ width: isShowDraftBtn ? "48%" : "100%" }}>
								{/* <View style={{ width: "100%" }}> */}
								<Button
									onPress={() => fetchNextQuestion()}
									btnLabelColor={Colors.white}
									isBtnActive={true}
									btnColor={Colors.secondary}
									btnName={"Next"}
								/>
							</View>
						</View>
						{/* <View style={{ ...LayoutStyle.marginTop20 }}>
							<Button
								onPress={() => {
									console.log("Answer: ", answers);
								}}
								btnLabelColor={Colors.white}
								isBtnActive={true}
								btnColor={Colors.primary}
								btnName={"Answer Log"}
							/>
						</View> */}
					</View>
				</ScrollView>
			)}
			{isShowDraftPanel && (
				<SaveDraftPanel
					show={isShowDraftPanel}
					onHide={() => setIsShowDraftPanel(false)}
					snapHeight={"30%"}
					onPressSave={() => onPressSaveDraft()}
				/>
			)}
		</View>
	);
};

export default ManualQuestionScreen;
