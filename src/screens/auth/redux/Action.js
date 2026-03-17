import * as Type from "./Type";

export const initAppRequest = (navigation) => ({
	type: Type.INIT_REQUEST,
	payload: { nav: navigation },
});

export const crashDetectionRequest = (navigation) => ({
	type: Type.CRSAH_DETECTION_REQUEST,
	payload: { nav: navigation },
});

export const crashDetectionSuccess = (payload) => ({
	type: Type.CRSAH_DETECTION_SUCCESS,
	payload,
});

export const loginRequest = (params, navigation) => ({
	type: Type.LOGIN_REQUEST,
	payload: { data: params, nav: navigation },
});

export const loginWithCodeRequest = (params, navigation) => ({
	type: Type.LOGIN_CODE_REQUEST,
	payload: { data: params, nav: navigation },
});

export const loginDetailsRequest = (params, navigation) => ({
	type: Type.LOGININFO_UPDATE_REQUEST,
	payload: { data: params, nav: navigation },
});

export const signUpRequest = (params, navigation) => ({
	type: Type.USER_REGISTER_REQUEST,
	payload: { data: params, nav: navigation },
});

export const policyRequest = (params, navigation) => ({
	type: Type.POLICY_REQUEST,
	payload: { data: params, nav: navigation },
});

export const sendOTPRequested = (params, navigation) => ({
	type: Type.OTP_REQUEST,
	payload: { data: params, nav: navigation },
});

export const resendOTPRequest = (params, navigation) => ({
	type: Type.RESEND_OTP_REQUEST,
	payload: { data: params, nav: navigation },
});

export const verifyOTPRequested = (params, navigation) => ({
	type: Type.VERIFY_OTP_REQUEST,
	payload: { data: params, nav: navigation },
});

export const getStateListRequest = () => ({
	type: Type.STATE_LIST_REQUEST,
	payload: {},
});

export const createClientPasswordRequest = (params, navigation) => ({
	type: Type.CREATE_CLIENT_PASSWORD_REQUEST,
	payload: { data: params, nav: navigation },
});

export const getVersionDetails = () => ({
	type: Type.VERSION_DETAIL_REQUEST,
	payload: {},
});
