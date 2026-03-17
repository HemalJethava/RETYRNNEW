import { takeLatest, put, take } from "redux-saga/effects";
import * as Type from "./Type";
import Api from "../../../utils/Api";
import { showMessage } from "react-native-flash-message";
import { CommonActions } from "@react-navigation/native";

// Saga.js

function* callCreatePassAPI(action) {
	const token = global.userToken;
	const navigation = action.payload.nav;

	try {
		const addPassRes = yield Api.post("user/create-pass", action.payload.data);

		if (addPassRes.success) {
			showMessage({
				message: addPassRes.message,
				type: "success",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				duration: 3000,
				autoHide: true,
			});
			yield put({ type: Type.CREATE_PASS_SUCCESS, payload: addPassRes });
			navigation.navigate("PassesScreen");
		} else {
			yield put({
				type: Type.CREATE_PASS_FAIL,
				payload: addPassRes.data.data,
			});
		}
	} catch (error) {
		yield put({
			type: Type.CREATE_PASS_FAIL,
			payload: error.response ? error.response.data : error.message,
		});
	}
}
function* callEditPassAPI(action) {
	const navigation = action.payload.nav;

	try {
		const editPassRes = yield Api.post("user/edit-pass", action.payload.data);

		if (editPassRes.success) {
			showMessage({
				message: editPassRes.message,
				type: "success",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				duration: 3000,
				autoHide: true,
			});
			yield put({ type: Type.EDIT_PASS_SUCCESS, payload: editPassRes });
			navigation.dispatch(
				CommonActions.reset({
					index: 0,
					routes: [{ name: "PassesScreen" }],
				})
			);
		} else {
			yield put({
				type: Type.EDIT_PASS_FAIL,
				payload: editPassRes.data.data,
			});
		}
	} catch (error) {
		yield put({
			type: Type.EDIT_PASS_FAIL,
			payload: error.response ? error.response.data : error.message,
		});
	}
}
function* callGetPassesAPI(action) {
	const navigation = action.payload.nav;
	try {
		const passRes = yield Api.get("user/get-all-pass").then((res) => {
			return res;
		});
		if (passRes.success) {
			yield put({ type: Type.PASSES_LIST_SUCCESS, payload: passRes });
		} else {
			yield put({ type: Type.PASSES_LIST_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.PASSES_LIST_FAIL, error });
	}
}
function* callGetArchivePassesAPI(action) {
	const navigation = action.payload.nav;
	try {
		const response = yield Api.get("user/get-archieved-pass").then((res) => {
			return res;
		});
		if (response?.data?.length > 0) {
			yield put({
				type: Type.ARCHIVE_PASSES_LIST_SUCCESS,
				payload: response?.data,
			});
		} else {
			yield put({ type: Type.ARCHIVE_PASSES_LIST_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.ARCHIVE_PASSES_LIST_FAIL, error });
	}
}
function* callGetPassDetailsAPI(action) {
	const navigation = action.payload.nav;

	try {
		const passDetailsRes = yield Api.post(
			"user/pass-detail",
			action.payload.data
		).then((res) => {
			return res;
		});

		if (passDetailsRes.success) {
			yield put({ type: Type.PASS_DETAILS_SUCCESS, payload: passDetailsRes });
		} else {
			yield put({ type: Type.PASS_DETAILS_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.PASS_DETAILS_FAIL, error });
	}
}
function* callGetStatesListAPI() {
	try {
		const stateListRes = yield call(Api.get, "user/state-list");

		if (stateListRes.success) {
			yield put({ type: Type.STATE_LIST_SUCCESS, payload: stateListRes });
		} else {
			yield put({ type: Type.STATE_LIST_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.STATE_LIST_FAIL });
	}
}

export default function* watchPassSaga() {
	yield takeLatest(Type.CREATE_PASS_REQUEST, callCreatePassAPI);
	yield takeLatest(Type.EDIT_PASS_REQUEST, callEditPassAPI);
	yield takeLatest(Type.PASSES_LIST_REQUEST, callGetPassesAPI);
	yield takeLatest(Type.ARCHIVE_PASSSES_LIST_REQUEST, callGetArchivePassesAPI);
	yield takeLatest(Type.PASS_DETAILS_REQUEST, callGetPassDetailsAPI);
	yield takeLatest(Type.STATE_LIST_REQUEST, callGetStatesListAPI);
}
