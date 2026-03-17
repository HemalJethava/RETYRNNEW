import * as Type from "./Type";

const initialState = {
	isLoading: false,
	error: null,
	verify2FA: false,
	addContactError: [],
	sendOTPerror: [],
	contactList: [],
	LegalList: [],
};

const AccountReducer = (state = initialState, action) => {
	switch (action.type) {
		case Type.UPDATE_PROFILE_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.UPDATE_PROFILE_SUCCESS:
			return {
				...state,
				isLoading: false,
			};
		case Type.UPDATE_PROFILE_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.REMOVE_PROFILE_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.REMOVE_PROFILE_SUCCESS:
			return {
				...state,
				isLoading: false,
			};
		case Type.REMOVE_PROFILE_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.SEND_OTP_TOKEN_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.SEND_OTP_TOKEN_SUCCESS:
			return {
				...state,
				isLoading: false,
			};
		case Type.SEND_OTP_TOKEN_FAIL:
			return {
				...state,
				sendOTPerror: action.payload.data.data,
				isLoading: false,
			};
		case Type.VERIFY_2FA_TOKEN_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.VERIFY_2FA_TOKEN_SUCCESS:
			return {
				...state,
				verify2FA: true,
				isLoading: false,
			};
		case Type.VERIFY_2FA_TOKEN_FAIL:
			return {
				...state,
				isLoading: false,
			};

		case Type.ADD_TRUST_CONTACT_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.ADD_TRUST_CONTACT_SUCCESS:
			return {
				...state,
				isLoading: false,
			};
		case Type.ADD_TRUST_CONTACT_FAIL:
			return {
				...state,
				addContactError: action.payload,
				isLoading: false,
			};

		case Type.TRUST_CONTACT_LIST_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.TRUST_CONTACT_LIST_SUCCESS:
			return {
				...state,
				contactList: action.payload.data,
				isLoading: false,
			};
		case Type.TRUST_CONTACT_LIST_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.POLICY_LIST_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.POLICY_LIST_SUCCESS:
			return {
				...state,
				isLoading: false,
				LegalList: action.payload.data,
			};
		case Type.POLICY_LIST_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.POLICY_DETAILS_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.POLICY_DETAILS_SUCCESS:
			return {
				...state,
				isLoading: false,
				LegalList: action.payload.data,
			};
		case Type.POLICY_DETAILS_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.VERIFY_PASSWD_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.VERIFY_PASSWD_SUCCESS:
			return {
				...state,
				isLoading: false,
			};
		case Type.VERIFY_PASSWD_FAIL:
			return {
				...state,
				isLoading: false,
			};
		default:
			return state;
	}
};

export default AccountReducer;
