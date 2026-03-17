import * as Type from "./Type";

const initialState = {
	isLoading: false,
	token: "",
	userData: [],
	isEnableCrashDetection: false,
	loginError: null,
	loginCodeError: null,
	loginInfo: [],
	registerError: [],
	policyDesc: "",
	sendOTPerror: [],
	loginInfoError: [],
	stateList: [],
	versionDetail: null,
};

const AuthReducer = (state = initialState, action) => {
	switch (action.type) {
		case Type.INIT_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.INIT_SUCCESS:
			return {
				...state,
				userData: action.payload.data.user,
				isLoading: false,
			};
		case Type.INIT_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.CRSAH_DETECTION_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.CRSAH_DETECTION_SUCCESS:
			return {
				...state,
				isEnableCrashDetection: action.payload.isEnabled
					? true
					: action.payload.data?.crash_detaction?.notification_permission?.[0]
							?.is_enabled === 1
					? true
					: false,

				isLoading: false,
			};
		case Type.CRSAH_DETECTION_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.LOGIN_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.LOGIN_SUCCESS:
			return {
				...state,
				token: action.payload.data.token,
				userData: action.payload.data.user,
				isLoading: false,
			};
		case Type.LOGIN_FAIL:
			return {
				...state,
				loginError: action.payload,
				isLoading: false,
			};

		case Type.LOGIN_CODE_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.LOGIN_CODE_SUCCESS:
			return {
				...state,
				loginInfo: action.payload.data,
				isLoading: false,
			};
		case Type.LOGIN_CODE_FAIL:
			return {
				...state,
				loginCodeError: action.payload,
				isLoading: false,
			};

		case Type.LOGININFO_UPDATE_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.LOGININFO_UPDATE_SUCCESS:
			return {
				...state,
				isLoading: false,
			};
		case Type.LOGININFO_UPDATE_FAIL:
			return {
				...state,
				isLoading: false,
				loginInfoError: action.payload.data,
			};
		case Type.USER_REGISTER_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.USER_REGISTER_SUCCESS:
			return {
				...state,
				isLoading: false,
			};
		case Type.USER_REGISTER_FAIL:
			return {
				...state,
				registerError: action.payload.data.data,
				isLoading: false,
			};

		case Type.POLICY_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.POLICY_SUCCESS:
			return {
				...state,
				policyDesc: action.payload.data,
				isLoading: false,
			};
		case Type.POLICY_FAIL:
			return {
				...state,
				isLoading: false,
			};

		case Type.OTP_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.OTP_SUCCESS:
			return {
				...state,
				isLoading: false,
			};
		case Type.OTP_FAIL:
			return {
				...state,
				sendOTPerror: action.payload.data.data,
				isLoading: false,
			};

		case Type.RESEND_OTP_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.RESEND_OTP_SUCCESS:
			return {
				...state,
				isLoading: false,
			};
		case Type.RESEND_OTP_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.VERIFY_OTP_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.VERIFY_OTP_SUCCESS:
			return {
				...state,
				userData: action.payload.data.user,
				isLoading: false,
			};
		case Type.VERIFY_OTP_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.CREATE_CLIENT_PASSWORD_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.CREATE_CLIENT_PASSWORD_SUCCESS:
			return {
				...state,
				isLoading: false,
			};
		case Type.CREATE_CLIENT_PASSWORD_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.STATE_LIST_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.STATE_LIST_SUCCESS:
			return {
				...state,
				isLoading: false,
				stateList: action.payload,
			};
		case Type.STATE_LIST_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.VERSION_DETAIL_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.VERSION_DETAIL_SUCCESS:
			return {
				...state,
				isLoading: false,
				versionDetail: action.payload,
			};
		case Type.VERSION_DETAIL_FAIL:
			return {
				...state,
				isLoading: false,
			};

		default:
			return state;
	}
};

export default AuthReducer;
