import { takeLatest, put, retry, call } from "redux-saga/effects";
import { showMessage } from "react-native-flash-message";
import { CommonActions } from "@react-navigation/native";
import * as Type from "./Type";
import Api from "../../../utils/Api";
import { storeData } from "../../../utils/LocalData";
import { getHashCode } from "../../../config/CommonFunctions";
import { Platform } from "react-native";
import { getDeviceId, getUniqueId } from "react-native-device-info";

function* callInitAppAPI(action) {
	const navigation = action.payload.nav;
	try {
		const initRes = yield Api.get("user/init-app").then((res) => {
			return res;
		});

		if (initRes.success) {
			yield put({ type: Type.INIT_SUCCESS, payload: initRes });
			navigation.dispatch(
				CommonActions.reset({
					index: 1,
					routes: [{ name: "Tab" }],
				})
			);
		} else {
			yield put({ type: Type.INIT_FAIL, error });
			navigation.dispatch(
				CommonActions.reset({
					index: 1,
					routes: [{ name: "Login" }],
				})
			);
		}
	} catch (error) {
		yield put({ type: Type.INIT_FAIL, error });
		navigation.dispatch(
			CommonActions.reset({
				index: 1,
				routes: [{ name: "Login" }],
				// routes: [{ name: "Tab" }],
			})
		);
	}
}

function* callCrashDetection(action) {
	const navigation = action.payload.nav;
	try {
		const crashRes = yield Api.get("user/get-notifications").then((res) => {
			return res;
		});

		if (crashRes.success) {
			yield put({ type: Type.CRSAH_DETECTION_SUCCESS, payload: crashRes });
		} else {
			yield put({ type: Type.CRSAH_DETECTION_FAIL, error });
		}
	} catch (error) {
		yield put({ type: Type.CRSAH_DETECTION_FAIL, error });
	}
}

function* callLoginAPI(action) {
	const deviceId = yield getDeviceId();
	const devicePlatform = Platform.OS === "android" ? "android" : "ios";
	const params = {
		email: action.payload.data.email,
		password: action.payload.data.password,
		fcmToken: action.payload.data.fcmToken,
		device_id: deviceId,
		platform: devicePlatform,
	};

	const navigation = action.payload.nav;

	try {
		console.log("payload: ", params);
		const loginRes = yield Api.post("user/login", params);
		console.log("loginRes: ", loginRes);

		if (loginRes.success) {
			const userData = loginRes.data.user;

			if (userData.is_2fa_verification === "on") {
				// fetch the hash code
				const hashCode = yield getHashCode();
				const otpParams = {
					mobile: userData.mobile,
					email: params.email,
					type: "2FA",
					hash: typeof hashCode === "string" ? hashCode : "",
				};

				const otpRes = yield Api.post("user/send-otp", otpParams);

				// showMessage({
				// 	message: otpRes.message + "  " + otpRes?.data[0].otp,
				// 	type: "info",
				// 	floating: true,
				// 	statusBarHeight: 40,
				// 	icon: "auto",
				// 	duration: 5000,
				// 	autoHide: false,
				// });

				navigation.navigate("VerifyAccount", {
					mobile: userData.mobile,
					email: params.email,
					type: "2FA",
				});

				yield put({ type: Type.OTP_SUCCESS });
			} else {
				yield put({ type: Type.LOGIN_SUCCESS, payload: loginRes });

				storeData("token", loginRes.data.token);
				storeData("userName", userData.name);
				storeData("modal", userData.is_first_time_login === "yes");

				global.userToken = loginRes.data.token;
				global.userName = userData.name;
				global.modal = userData.is_first_time_login === "yes";

				showMessage({
					message: loginRes.message,
					type: "success",
					floating: true,
					statusBarHeight: 40,
					duration: 3000,
					icon: "auto",
					autoHide: true,
				});

				navigation.dispatch(
					CommonActions.reset({
						index: 1,
						routes: [{ name: "Tab" }],
					})
				);
			}
		} else {
			yield put({ type: Type.LOGIN_FAIL, payload: loginRes.data });
			if (loginRes?.data?.error) {
				showMessage({
					message: loginRes?.data?.error,
					type: "danger",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			}
		}
	} catch (error) {
		console.warn("Login API Error: ", error);

		yield put({ type: Type.LOGIN_FAIL, error });

		showMessage({
			message: "An error occurred! Please try again.",
			type: "danger",
			floating: true,
			statusBarHeight: 40,
			icon: "auto",
			autoHide: true,
		});
	}
}

function* callLoginWithCodeAPI(action) {
	const navigation = action.payload.nav;
	const deviceId = yield getDeviceId();
	const devicePlatform = Platform.OS === "android" ? "android" : "ios";

	const updatedPayload = {
		...action.payload.data,
		device_id: deviceId,
		platform: devicePlatform,
	};

	try {
		const loginCodeRes = yield Api.post(
			"user/client-login",
			updatedPayload
		).then((res) => {
			return res;
		});

		if (loginCodeRes.success) {
			yield put({ type: Type.LOGIN_CODE_SUCCESS, payload: loginCodeRes });
			navigation.navigate("LoginDetail");
		} else {
			if (loginCodeRes?.message) {
				showMessage({
					message: loginCodeRes?.message,
					type: "danger",
					floating: true,
					statusBarHeight: 40,
					icon: "auto",
					autoHide: true,
				});
			}
			yield put({ type: Type.LOGIN_CODE_FAIL, payload: loginCodeRes.data });
		}
	} catch (error) {
		yield put({ type: Type.LOGIN_CODE_FAIL, error });
	}
}

function* callLoginInfoUpdateAPI(action) {
	const navigation = action.payload.nav;
	try {
		const loginInfoRes = yield Api.post(
			"user/save-login-info",
			action.payload.data
		).then((res) => {
			return res;
		});
		if (loginInfoRes.success) {
			navigation.navigate("BusinessInfo");
			yield put({ type: Type.LOGININFO_UPDATE_SUCCESS, payload: "" });
		} else {
			yield put({ type: Type.LOGININFO_UPDATE_FAIL, payload: loginInfoRes });
		}
	} catch (error) {
		yield put({ type: Type.LOGININFO_UPDATE_FAIL });
	}
}

function* callRegisterAPI(action) {
	const navigation = action.payload.nav;

	try {
		const registerRes = yield Api.post(
			"user/register",
			action.payload.data
		).then((res) => res);

		if (registerRes.success) {
			showMessage({
				message: registerRes.message,
				type: "success",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				duration: 3000,
				autoHide: true,
			});
			yield put({
				type: Type.USER_REGISTER_SUCCESS,
			});
			navigation.dispatch(
				CommonActions.reset({
					index: 0,
					routes: [
						{
							name: "TandC",
							params: {
								email: action.payload.data.email,
								password: action.payload.data.password,
								fcmToken: action.payload.data.fcmToken,
								isRegister: true,
							},
						},
					],
				})
			);
		} else {
			yield put({ type: Type.USER_REGISTER_FAIL, payload: registerRes.data });
			const extractMessages = (messagesObj) => {
				if (typeof messagesObj === "object" && messagesObj !== null) {
					return Object.values(messagesObj).flat().join(", ");
				}
				return "Unknown error occurred";
			};
			const messagesString = registerRes?.data?.data
				? extractMessages(registerRes.data.data)
				: registerRes?.message || "An error occurred";

			showMessage({
				message: messagesString,
				type: "danger",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				autoHide: true,
			});
		}
	} catch (error) {
		yield put({ type: Type.USER_REGISTER_FAIL, error });
		showMessage({
			message: error.message || "An error occurred",
			type: "danger",
			floating: true,
			statusBarHeight: 40,
			icon: "auto",
			autoHide: true,
		});
	}
}

function* callPolicyAPI(action) {
	const navigation = action.payload.nav;
	try {
		const policyRes = yield Api.post(
			"user/get-page-by-slug",
			action.payload.data
		).then((res) => {
			return res;
		});

		if (policyRes.success) {
			yield put({ type: Type.POLICY_SUCCESS, payload: policyRes });
		} else {
			yield put({ type: Type.POLICY_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.POLICY_FAIL, error });
	}
}

function* callResendOTPRequestedAPI(action) {
	const navigation = action.payload.nav;
	try {
		if (!action.payload || !action.payload.data) {
			throw new Error("Invalid action payload: Missing data");
		}

		// fetch the hash code
		const hashCode = yield getHashCode();

		const updatedPayload = {
			...action.payload.data,
			hash: typeof hashCode === "string" ? hashCode : "",
		};

		const optRes = yield Api.post("user/send-otp", updatedPayload).then(
			(res) => {
				return res;
			}
		);
		if (optRes.success) {
			// showMessage({
			// 	message: optRes.message + "  " + optRes?.data[0].otp,
			// 	type: "info",
			// 	floating: true,
			// 	statusBarHeight: 40,
			// 	icon: "auto",
			// 	duration: 5000,
			// 	autoHide: false,
			// });
			yield put({ type: Type.RESEND_OTP_SUCCESS });
		} else {
			yield put({ type: Type.RESEND_OTP_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.RESEND_OTP_FAIL, error });
	}
}

function* callOTPRequestedAPI(action) {
	const navigation = action.payload.nav;
	const data = action.payload.data;
	try {
		if (!action.payload || !data) {
			throw new Error("Invalid action payload: Missing data");
		}

		const hashCode = yield getHashCode();

		const updatedPayload = {
			...data.params,
			hash:
				Platform.OS === "ios"
					? ""
					: typeof hashCode === "string"
					? hashCode
					: "",
		};

		const optRes = yield Api.post("user/send-otp", updatedPayload);
		if (optRes.success) {
			if (data.type == "SIGNUP" || data.type == "CODE") {
				navigation.navigate("VerifyAccount", {
					mobile: data.params?.mobile,
					email: data.params?.email,
					type:
						data.type == "SIGNUP"
							? "SIGNUP"
							: data.type == "CODE"
							? "CODE"
							: "",
				});
			}
			yield put({ type: Type.OTP_SUCCESS });
		} else {
			yield put({ type: Type.OTP_FAIL, payload: optRes });
		}
	} catch (error) {
		yield put({ type: Type.OTP_FAIL, error });
	}
}

function* callVerifyOTPRequestedAPI(action) {
	const navigation = action.payload.nav;

	try {
		const verifyRes = yield Api.post(
			"user/otp-verify",
			action.payload.data.params
		).then((res) => {
			return res;
		});

		if (verifyRes.success) {
			yield put({ type: Type.VERIFY_OTP_SUCCESS, payload: verifyRes });
			if (action.payload.data.type === "SIGNUP") {
				navigation.navigate("Password", { isLoginWithCode: false });
			} else if (action.payload.data.type === "CODE") {
				navigation.navigate("Password", {
					isLoginWithCode: true,
					user: verifyRes?.data?.user,
				});
			} else if (action.payload.data.type === "2FA") {
				if (verifyRes.data.token) {
					storeData("token", verifyRes.data.token);
					global.userToken = verifyRes.data.token;
					global.userName = verifyRes?.data?.user?.name;
					navigation.dispatch(
						CommonActions.reset({
							index: 1,
							routes: [{ name: "Tab" }],
						})
					);
					yield put({ type: Type.VERIFY_OTP_SUCCESS, payload: verifyRes });
				} else {
					navigation.dispatch(
						CommonActions.reset({
							index: 1,
							routes: [{ name: "Login" }],
						})
					);
				}
			}
		} else {
			showMessage({
				message: verifyRes.message,
				type: "danger",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				autoHide: true,
			});
			yield put({ type: Type.VERIFY_OTP_FAIL, error });
		}
	} catch (error) {
		yield put({ type: Type.VERIFY_OTP_FAIL, error });
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

function* callGetVersionDetailAPI() {
	try {
		const versionResponse = yield call(Api.get, "user/get-app-version");

		if (versionResponse.success) {
			yield put({
				type: Type.VERSION_DETAIL_SUCCESS,
				payload: versionResponse,
			});
		} else {
			yield put({ type: Type.VERSION_DETAIL_FAIL });
		}
	} catch (error) {
		yield put({ type: Type.VERSION_DETAIL_FAIL });
	}
}

function* callCreateClientPasswordAPI(action) {
	const navigation = action.payload.nav;

	try {
		const createPassRes = yield Api.post(
			"user/create-password",
			action.payload.data.payload
		).then((res) => {
			return res;
		});

		if (createPassRes.success) {
			yield put({
				type: Type.CREATE_CLIENT_PASSWORD_SUCCESS,
				payload: createPassRes,
			});
			navigation.dispatch(
				CommonActions.reset({
					index: 0,
					routes: [
						{
							name: "TandC",
							params: {
								email: createPassRes.data.email,
								password: createPassRes.data.password,
								authToken: createPassRes.data.token,
								name: action.payload.data.name,
							},
						},
					],
				})
			);
		} else {
			yield put({
				type: Type.CREATE_CLIENT_PASSWORD_SUCCESS,
				payload: createPassRes,
			});
			showMessage({
				message: createPassRes.message,
				type: "danger",
				floating: true,
				statusBarHeight: 40,
				icon: "auto",
				autoHide: true,
			});
		}
	} catch (error) {
		yield put({ type: Type.CREATE_CLIENT_PASSWORD_FAIL, error });
	}
}

export default function* watchAuthSaga() {
	yield takeLatest(Type.INIT_REQUEST, callInitAppAPI);
	yield takeLatest(Type.CRSAH_DETECTION_REQUEST, callCrashDetection);
	yield takeLatest(Type.LOGIN_REQUEST, callLoginAPI);
	yield takeLatest(Type.LOGIN_CODE_REQUEST, callLoginWithCodeAPI);
	yield takeLatest(Type.LOGININFO_UPDATE_REQUEST, callLoginInfoUpdateAPI);
	yield takeLatest(Type.USER_REGISTER_REQUEST, callRegisterAPI);
	yield takeLatest(Type.POLICY_REQUEST, callPolicyAPI);
	yield takeLatest(Type.OTP_REQUEST, callOTPRequestedAPI);
	yield takeLatest(Type.RESEND_OTP_REQUEST, callResendOTPRequestedAPI);
	yield takeLatest(Type.VERIFY_OTP_REQUEST, callVerifyOTPRequestedAPI);
	yield takeLatest(Type.STATE_LIST_REQUEST, callGetStatesListAPI);
	yield takeLatest(
		Type.CREATE_CLIENT_PASSWORD_REQUEST,
		callCreateClientPasswordAPI
	);
	yield takeLatest(Type.VERSION_DETAIL_REQUEST, callGetVersionDetailAPI);
}
