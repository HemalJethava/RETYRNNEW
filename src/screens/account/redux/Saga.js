import { takeLatest, put } from "redux-saga/effects";
import * as Type from "./Type";
import * as AuthType from "../../auth/redux/Type";
import { showMessage, hideMessage } from "react-native-flash-message";
import Api from "../../../utils/Api";
import { getHashCode } from "../../../config/CommonFunctions";
import { Platform } from "react-native";

function* callUpdateProfileAPI(action) {
	const navigation = action.payload.nav;
	try {
		const updateProfileRes = yield Api.post(
			"user/edit-profile",
			action.payload.data
		).then((res) => {
			return res;
		});

		if (updateProfileRes?.success) {
			showMessage({
				message: updateProfileRes.message,
				type: "success",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				duration: 3000,
				autoHide: true,
			});

			const initRes = yield Api.get("user/init-app").then((res) => {
				return res;
			});
			if (initRes.success) {
				yield put({ type: AuthType.INIT_SUCCESS, payload: initRes });
				navigation.goBack();
			}
			yield put({ type: Type.UPDATE_PROFILE_FAIL });
		} else {
			yield put({ type: Type.UPDATE_PROFILE_FAIL, error });
		}
	} catch (error) {
		yield put({ type: Type.UPDATE_PROFILE_FAIL, error });
	}
}
function* callRemoveProfileImgAPI(action) {
	const navigation = action.payload.nav;

	try {
		const removeProfileImgRes = yield Api.post("user/remove-profile").then(
			(res) => res
		);

		if (removeProfileImgRes.success) {
			showMessage({
				message: removeProfileImgRes.message,
				type: "success",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				duration: 3000,
				autoHide: true,
			});
			yield put({ type: Type.REMOVE_PROFILE_SUCCESS });

			const initRes = yield Api.get("user/init-app")
				.then((res) => res)
				.catch((error) => {
					console.error("Error in init-app API:", error);
					return { success: false };
				});
			if (initRes.success) {
				yield put({ type: AuthType.INIT_SUCCESS, payload: initRes });
				navigation.navigate("Setting");
			} else {
				console.error("Failed to initialize app after profile image removal.");
			}
		} else {
			yield put({ type: Type.REMOVE_PROFILE_FAIL });
		}
	} catch (error) {
		console.error("Error in callRemoveProfileImgAPI:", error);
	}
}
function* callSendOtpWithTokenAPI(action) {
	const navigation = action.payload.nav;
	try {
		if (!action.payload || !action.payload.data) {
			throw new Error("Invalid action payload: Missing data");
		}

		// fetch the hash code
		const hashCode = yield getHashCode();
		const updatedPayload = {
			...action.payload.data,
			hash:
				Platform.OS === "ios"
					? ""
					: typeof hashCode === "string"
					? hashCode
					: "",
		};
		const sendOTPRes = yield Api.post(
			"user/user-send-otp",
			updatedPayload
		).then((res) => {
			return res;
		});

		if (sendOTPRes.success) {
			yield put({ type: Type.SEND_OTP_TOKEN_SUCCESS, payload: "" });
			navigation.navigate("Verify2FA", {
				type: "Account",
				params: action.payload.data,
			});
		} else {
			yield put({ type: Type.SEND_OTP_TOKEN_FAIL, payload: sendOTPRes });
			navigation.navigate("EditProfile");
		}
	} catch (error) {
		yield put({ type: Type.VERIFY_2FA_TOKEN_FAIL, error });
	}
}
function* callVerifyOtpWithTokenAPI(action) {
	const navigation = action.payload.nav;
	try {
		const verifyRes = yield Api.post(
			"user/user-otp-verify",
			action.payload.data
		).then((res) => {
			return res;
		});
		if (verifyRes.success) {
			if (action.payload.data.type === "2FA") {
				const params = {
					is_verify: global.isToogle ? "on" : "off",
				};
				try {
					const update2FA = yield Api.post(
						"user/update-2fa-setting",
						params
					).then((res) => {
						return res;
					});
					if (update2FA.success) {
						try {
							const initRes = yield Api.get("user/init-app").then((res) => {
								return res;
							});
							if (initRes.success) {
								yield put({ type: AuthType.INIT_SUCCESS, payload: initRes });
								showMessage({
									message: "Update 2FA setting successfully",
									type: "success",
									floating: true,
									statusBarHeight: 40,
									icon: "auto",
									duration: 3000,
									autoHide: true,
								});
								navigation.navigate("Security");
							}
						} catch (error) {}
					}
				} catch (error) {}
			} else {
				navigation.goBack();
				showMessage({
					message: verifyRes.message,
					type: "success",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					duration: 3000,
					autoHide: true,
				});
			}
			yield put({ type: Type.VERIFY_2FA_TOKEN_SUCCESS, payload: verifyRes });
		} else {
			showMessage({
				message: verifyRes.message,
				type: "danger",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				autoHide: true,
			});
			yield put({ type: Type.VERIFY_2FA_TOKEN_FAIL, error });
		}
	} catch (error) {
		yield put({ type: Type.VERIFY_2FA_TOKEN_FAIL, error });
	}
}
function* callAddTrustContactAPI(action) {
	const navigation = action.payload.nav;
	try {
		// console.log("action.payload.data: ", ...action.payload.data);

		const trustRes = yield Api.post(
			"user/add-trusted-contact",
			action.payload.data
		);

		if (trustRes.success) {
			showMessage({
				message: trustRes.message,
				type: "success",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				duration: 3000,
				autoHide: true,
			});

			yield put({ type: Type.ADD_TRUST_CONTACT_SUCCESS, payload: trustRes });
			yield new Promise((resolve) => setTimeout(resolve, 500));
			navigation.goBack();
		} else {
			if (trustRes.data.message) {
				showMessage({
					message: trustRes.data.message,
					type: "danger",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					duration: 3000,
					autoHide: true,
				});
			}
			yield put({
				type: Type.ADD_TRUST_CONTACT_FAIL,
				payload: trustRes.data.data,
			});
		}
	} catch (error) {
		yield put({ type: Type.ADD_TRUST_CONTACT_FAIL, payload: error });
	}
}
function* callTrustContactListAPI(action) {
	const navigation = action.payload.nav;
	try {
		const contactListRes = yield Api.get(
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
function* callPolicyListAPI(action) {
	const navigation = action.payload.nav;
	try {
		const policylistRes = yield Api.get("user/cms-pages").then((res) => {
			return res;
		});
		if (policylistRes.success) {
			yield put({
				type: Type.POLICY_LIST_SUCCESS,
				payload: policylistRes,
			});
		} else {
			yield put({ type: Type.POLICY_LIST_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.POLICY_LIST_FAIL });
	}
}
function* callVerifyPasswdAPI(action) {
	const navigation = action.payload.nav;
	try {
		const verifyPasswdRes = yield Api.post(
			"user/check-password",
			action.payload.data.passwdParams
		).then((res) => {
			return res;
		});
		if (verifyPasswdRes.success) {
			try {
				if (!action.payload || !action.payload.data) {
					throw new Error("Invalid action payload: Missing data");
				}

				// fetch the hash code
				const hashCode = yield getHashCode();

				const updatedPayload = {
					...action.payload.data.otpParams,
					hash: typeof hashCode === "string" ? hashCode : "",
				};

				const sendOTPRes = yield Api.post(
					"user/user-send-otp",
					updatedPayload
				).then((res) => {
					return res;
				});
				if (sendOTPRes.success) {
					navigation.navigate("Verify2FA", {
						type: "2FA",
						params: action.payload.data.otpParams,
					});
					// showMessage({
					// 	message: sendOTPRes.message + "  " + sendOTPRes.data[0].otp,
					// 	type: "info",
					// 	floating: true,
					// 	statusBarHeight: 40,
					// 	icon: "auto",
					// 	duration: 5000,
					// 	autoHide: false,
					// });
					yield put({ type: Type.SEND_OTP_TOKEN_SUCCESS, payload: "" });
				} else {
					yield put({ type: Type.SEND_OTP_TOKEN_FAIL });
				}
			} catch (error) {
				yield put({ type: Type.SEND_OTP_TOKEN_FAIL });
			}
			yield put({
				type: Type.VERIFY_PASSWD_SUCCESS,
			});
		} else {
			showMessage({
				message: verifyPasswdRes.message,
				type: "danger",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				duration: 3000,
				autoHide: true,
			});
		}
		yield put({ type: Type.VERIFY_PASSWD_FAIL });
	} catch (error) {
		yield put({ type: Type.VERIFY_PASSWD_FAIL });
	}
}

export default function* watchAccountSaga() {
	yield takeLatest(Type.UPDATE_PROFILE_REQUEST, callUpdateProfileAPI);
	yield takeLatest(Type.REMOVE_PROFILE_REQUEST, callRemoveProfileImgAPI);
	yield takeLatest(Type.SEND_OTP_TOKEN_REQUEST, callSendOtpWithTokenAPI);
	yield takeLatest(Type.VERIFY_2FA_TOKEN_REQUEST, callVerifyOtpWithTokenAPI);
	yield takeLatest(Type.ADD_TRUST_CONTACT_REQUEST, callAddTrustContactAPI);
	yield takeLatest(Type.TRUST_CONTACT_LIST_REQUEST, callTrustContactListAPI);
	yield takeLatest(Type.POLICY_LIST_REQUEST, callPolicyListAPI);
	yield takeLatest(Type.VERIFY_PASSWD_REQUEST, callVerifyPasswdAPI);
}
