import * as Type from "./Type";

export const updateProfileRequest = (param, navigation) => ({
	type: Type.UPDATE_PROFILE_REQUEST,
	payload: { data: param, nav: navigation },
});

export const removeProfileRequest = (param, navigation) => ({
	type: Type.REMOVE_PROFILE_REQUEST,
	payload: { data: param, nav: navigation },
});

export const sendOTPWithTokenRequest = (params, navigation) => ({
	type: Type.SEND_OTP_TOKEN_REQUEST,
	payload: { data: params, nav: navigation },
});

export const verify2FAWithTokenRequest = (params, navigation) => ({
	type: Type.VERIFY_2FA_TOKEN_REQUEST,
	payload: { data: params, nav: navigation },
});

export const addTrustContactRequest = (params, navigation) => {
	return {
		type: Type.ADD_TRUST_CONTACT_REQUEST,
		payload: { data: params, nav: navigation },
	};
};

export const listOfContactRequest = (params, navigation) => ({
	type: Type.TRUST_CONTACT_LIST_REQUEST,
	payload: { data: params, nav: navigation },
});

export const getPolicyRequest = (navigation) => ({
	type: Type.POLICY_LIST_REQUEST,
	payload: { nav: navigation },
});

export const policyDetailsRequest = (params, navigation) => ({
	type: Type.POLICY_DETAILS_REQUEST,
	payload: { data: params, nav: navigation },
});

export const verifyPasswdRequest = (params, navigation) => ({
	type: Type.VERIFY_PASSWD_REQUEST,
	payload: { data: params, nav: navigation },
});
