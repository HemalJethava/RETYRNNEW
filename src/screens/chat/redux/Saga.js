import { takeLatest, put } from "redux-saga/effects";
import * as Type from "./Type";
import { showMessage } from "react-native-flash-message";
import Api from "../../../utils/Api";

function* callTrustContactListAPI(action) {
	try {
		const contactListRes = yield get(
			"user/list-trusted-contact",
			action.payload.data
		).then((res) => {
			return res;
		});

		if (contactListRes.success) {
			yield put({
				type: Type.TRUST_CONTACT_LIST_SUCCESS,
				payload: contactListRes,
			});
		} else {
			yield put({ type: Type.TRUST_CONTACT_LIST_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.TRUST_CONTACT_LIST_FAIL });
	}
}

function* callCompanyEmployeeList(action) {
	try {
		const companyId = action?.payload?.data;

		const employeeListRes = yield Api.get(
			`user/get-employee/${companyId}`
		).then((res) => {
			return res;
		});

		if (employeeListRes.success) {
			yield put({
				type: Type.COMPANY_EMPLOYEE_LIST_SUCCESS,
				payload: employeeListRes,
			});
		} else {
			yield put({ type: Type.COMPANY_EMPLOYEE_LIST_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.COMPANY_EMPLOYEE_LIST_FAIL });
	}
}

function* callPinnedContactList(action) {
	try {
		const pinnedListRes = yield Api.get(`user/get-pinned-contact`);

		if (pinnedListRes.success) {
			yield put({
				type: Type.PINNED_CONTACT_LIST_SUCCESS,
				payload: pinnedListRes,
			});
		} else {
			yield put({ type: Type.PINNED_CONTACT_LIST_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.PINNED_CONTACT_LIST_FAIL });
	}
}

function* callAdminDetail(action) {
	try {
		const adminRes = yield Api.get(`user/get-admin-details`);

		if (adminRes.success) {
			yield put({
				type: Type.ADMIN_DETAIL_SUCCESS,
				payload: adminRes,
			});
		} else {
			yield put({ type: Type.ADMIN_DETAIL_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.ADMIN_DETAIL_FAIL });
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

export default function* watchAccountSaga() {
	yield takeLatest(Type.TRUST_CONTACT_LIST_REQUEST, callTrustContactListAPI);
	yield takeLatest(Type.COMPANY_EMPLOYEE_LIST_REQUEST, callCompanyEmployeeList);
	yield takeLatest(Type.PINNED_CONTACT_LIST_REQUEST, callPinnedContactList);
	yield takeLatest(Type.ADMIN_DETAIL_REQUEST, callAdminDetail);
	yield takeLatest(Type.PASSES_LIST_REQUEST, callGetPassesAPI);
}
