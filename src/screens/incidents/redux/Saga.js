import { takeLatest, put } from "redux-saga/effects";
import { showMessage } from "react-native-flash-message";
import * as Type from "./Type";
import Api from "../../../utils/Api";
import { CommonActions } from "@react-navigation/native";

const extractErrors = (data) => {
	if (!Array.isArray(data)) return "";

	const step1 = data.map((item) => Object.values(item));
	const step2 = step1.flatMap((messages) =>
		Array.isArray(messages)
			? messages.flatMap((msg) =>
					typeof msg === "object" ? Object.values(msg) : msg
			  )
			: [messages]
	);
	const step3 = step2.filter(
		(message) => typeof message === "string" && message.trim() !== ""
	);
	const result = step3.join("\n ");
	return result;
};

function* callGetStatesListAPI() {
	try {
		const stateListRes = yield Api.get("user/state-list").then((res) => {
			return res;
		});
		if (stateListRes.success) {
			yield put({ type: Type.STATE_LIST_SUCCESS, payload: stateListRes });
		} else {
			yield put({ type: Type.STATE_LIST_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.STATE_LIST_FAIL });
	}
}
function* callGetVehicleListAPI() {
	try {
		const vehicleListRes = yield Api.get("user/get-vehicle-list").then(
			(res) => {
				return res;
			}
		);
		if (vehicleListRes.success) {
			yield put({ type: Type.VEHICLE_LIST_SUCCESS, payload: vehicleListRes });
		} else {
			yield put({ type: Type.VEHICLE_LIST_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.VEHICLE_LIST_FAIL });
	}
}
function* callGetIncidentListAPI(action) {
	try {
		const incidentListRes = yield Api.post(
			"user/incident-list",
			action.payload.data
		).then((res) => {
			return res;
		});
		if (incidentListRes.success) {
			yield put({ type: Type.INCIDENT_LIST_SUCCESS, payload: incidentListRes });
		} else {
			yield put({ type: Type.INCIDENT_LIST_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.INCIDENT_LIST_FAIL });
	}
}
function* callGetClaimTalkListAPI(action) {
	try {
		const claimTalkListRes = yield Api.get("user/get-claim-talk").then(
			(res) => {
				return res;
			}
		);
		if (claimTalkListRes.data.length && claimTalkListRes.data.length > 0) {
			yield put({
				type: Type.CLAIM_TALK_LIST_SUCCESS,
				payload: claimTalkListRes,
			});
		} else {
			yield put({ type: Type.CLAIM_TALK_LIST_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.CLAIM_TALK_LIST_FAIL });
	}
}
function* callGetIncidentDetails(action) {
	try {
		const detailsRes = yield Api.post(
			"user/incident-detail",
			action.payload.data
		).then((res) => {
			return res;
		});
		if (detailsRes.success) {
			yield put({ type: Type.INCIDENT_DETAILS_SUCCESS, payload: detailsRes });
		} else {
			yield put({ type: Type.INCIDENT_DETAILS_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.INCIDENT_DETAILS_FAIL });
	}
}
function* callAddIncidentAPI(action) {
	const navigation = action.payload.nav;

	try {
		const addIncidentRes = yield Api.post(
			"user/report-incident",
			action.payload.data
		);
		if (addIncidentRes.success) {
			showMessage({
				message: addIncidentRes.message,
				type: "success",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				duration: 3000,
				autoHide: true,
			});
			navigation.dispatch(
				CommonActions.reset({
					index: 0,
					routes: [{ name: "Submitted" }],
				})
			);
			yield put({ type: Type.ADD_INCIDENT_SUCCESS, payload: addIncidentRes });
		} else {
			const messagesString = extractErrors(addIncidentRes?.data?.data);

			showMessage({
				message: messagesString
					? messagesString
					: `Something went wrong \n Please try again`,
				type: "danger",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				autoHide: true,
			});
			yield put({ type: Type.ADD_INCIDENT_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.ADD_INCIDENT_FAIL });
	}
}
function* callSaveDraftAPI(action) {
	const navigation = action.payload.nav;
	try {
		const draftIncidentRes = yield Api.post(
			"user/report-incident",
			action.payload.data
		);

		if (draftIncidentRes.success) {
			showMessage({
				message: draftIncidentRes.message,
				type: "success",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				duration: 3000,
				autoHide: true,
			});
			navigation.dispatch(
				CommonActions.reset({
					index: 0,
					routes: [{ name: "DraftSubmitted" }],
				})
			);
			yield put({ type: Type.SAVE_DRAFT_SUCCESS, payload: draftIncidentRes });
		} else {
			const messagesString = extractErrors(draftIncidentRes?.data?.data);
			showMessage({
				message: messagesString
					? messagesString
					: `Something went wrong \n Please try again`,
				type: "danger",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				autoHide: true,
			});
			yield put({ type: Type.SAVE_DRAFT_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.SAVE_DRAFT_FAIL });
	}
}
function* callClaimTalkAPI(action) {
	const navigation = action.payload.nav;

	try {
		const claimRes = yield Api.post(
			"user/claim-talk",
			action.payload.data
		).then((res) => {
			return res;
		});

		if (claimRes.success) {
			yield put({ type: Type.CLAIM_TALK_SUCCESS });
			global.firstVideo = "";
			global.secondVideo = "";
			global.thirdVideo = "";
			navigation.dispatch(
				CommonActions.reset({
					index: 0,
					routes: [{ name: "Submitted" }],
				})
			);
		} else {
			const extractMessages = (messagesArray) => {
				return messagesArray
					.flatMap((item) => Object.values(item))
					.flat()
					.join(", ");
			};
			const messagesString = extractMessages(claimRes.data.data);

			showMessage({
				message: messagesString,
				type: "danger",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				autoHide: true,
			});

			yield put({ type: Type.CLAIM_TALK_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.CLAIM_TALK_FAIL });
	}
}
function* callGetDriverListAPI(action) {
	try {
		const driverListRes = yield Api.get("user/get-driver-list").then((res) => {
			return res;
		});
		if (driverListRes.success) {
			yield put({
				type: Type.DRIVER_LIST_SUCCESS,
				payload: driverListRes.data,
			});
		} else {
			yield put({ type: Type.DRIVER_LIST_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.DRIVER_LIST_FAIL });
	}
}
function* callGetIncidentTypeListAPI(action) {
	try {
		const typeListRes = yield Api.get("user/get-incident-type-list").then(
			(res) => {
				return res;
			}
		);
		if (typeListRes.success) {
			yield put({
				type: Type.INCIDENT_TYPE_LIST_SUCCESS,
				payload: typeListRes,
			});
		} else {
			yield put({ type: Type.INCIDENT_TYPE_LIST_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.INCIDENT_TYPE_LIST_FAIL });
	}
}
export default function* watchIncidentSaga() {
	yield takeLatest(Type.STATE_LIST_REQUEST, callGetStatesListAPI);
	yield takeLatest(Type.VEHICLE_LIST_REQUEST, callGetVehicleListAPI);
	yield takeLatest(Type.INCIDENT_LIST_REQUEST, callGetIncidentListAPI);
	yield takeLatest(Type.CLAIM_TALK_LIST_REQUEST, callGetClaimTalkListAPI);
	yield takeLatest(Type.INCIDENT_DETAILS_REQUEST, callGetIncidentDetails);
	yield takeLatest(Type.ADD_INCIDENT_REQUEST, callAddIncidentAPI);
	yield takeLatest(Type.SAVE_DRAFT_REQUEST, callSaveDraftAPI);
	yield takeLatest(Type.CLAIM_TALK_REQUEST, callClaimTalkAPI);
	yield takeLatest(Type.DRIVER_LIST_REQUEST, callGetDriverListAPI);
	yield takeLatest(Type.INCIDENT_TYPE_LIST_REQUEST, callGetIncidentTypeListAPI);
}
