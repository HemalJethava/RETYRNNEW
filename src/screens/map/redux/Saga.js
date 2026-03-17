import { takeLatest, put } from "redux-saga/effects";
import * as Type from "./Type";
import { setRecentLocationArray, setLibraryPlace } from "./Action";
import Api from "../../../utils/Api";
import { fetchPlaceDetail } from "../../../config/CommonFunctions";

function* storeRecentLocationList(action) {
	try {
		yield put(setRecentLocationArray(action.payload));
	} catch (error) {
		console.error("Error storing array:", error);
	}
}

function* fetchRecentLocationList() {
	try {
		yield put(setRecentLocationArray([]));
	} catch (error) {
		console.error("Error fetching array:", error);
	}
}

function* storeLibraryPlaceList(action) {
	try {
		yield put(setLibraryPlace(action.payload));
	} catch (error) {
		console.error("Error storing array:", error);
	}
}

function* fetchLibraryPlaceList() {
	try {
		yield put(setLibraryPlace([]));
	} catch (error) {
		console.error("Error fetching array:", error);
	}
}

function* callPinnedContactListAPI(action) {
	try {
		const response = yield Api.get("user/get-saved-library").then((res) => res);

		if (response.success && Array.isArray(response.data)) {
			yield put({
				type: Type.PINNED_PLACE_LIST_SUCCESS,
				payload: response.data,
			});
		} else {
			yield put({ type: Type.PINNED_PLACE_LIST_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.PINNED_PLACE_LIST_FAIL });
	}
}

export default function* watchMapSaga() {
	yield takeLatest(Type.STORE_RECENET_LOCATION_LIST, storeRecentLocationList);
	yield takeLatest(Type.FETCH_RECENET_LOCATION_LIST, fetchRecentLocationList);
	yield takeLatest(Type.STORE_LIBRARY_PLACE, storeLibraryPlaceList);
	yield takeLatest(Type.FETCH_LIBRARY_PLACE, fetchLibraryPlaceList);
	yield takeLatest(Type.PINNED_PLACE_LIST_REQUEST, callPinnedContactListAPI);
}
