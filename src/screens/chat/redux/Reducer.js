import * as Type from "./Type";

const initialState = {
	isLoading: false,
	contactList: [],

	companyEmployeeList: [],
	isEmployeeLoading: false,

	pinnedContactList: [],
	isPinnedLoading: false,

	adminDetail: null,
	passList: [],
	chatUpdateEvent: null,
	chatUserStatus: null,
	chatUserMarkReadStatus: null,
	chatUnreadCount: 0,
};

const ChatReducer = (state = initialState, action) => {
	switch (action.type) {
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
		case Type.COMPANY_EMPLOYEE_LIST_REQUEST:
			return {
				...state,
				isEmployeeLoading: true,
			};
		case Type.COMPANY_EMPLOYEE_LIST_SUCCESS:
			return {
				...state,
				companyEmployeeList: action.payload.data,
				isEmployeeLoading: false,
			};
		case Type.COMPANY_EMPLOYEE_LIST_FAIL:
			return {
				...state,
				isEmployeeLoading: false,
			};
		case Type.PINNED_CONTACT_LIST_REQUEST:
			return {
				...state,
				isPinnedLoading: true,
			};
		case Type.PINNED_CONTACT_LIST_SUCCESS:
			return {
				...state,
				pinnedContactList: action.payload.data,
				isPinnedLoading: false,
			};
		case Type.PINNED_CONTACT_LIST_FAIL:
			return {
				...state,
				isPinnedLoading: false,
			};
		case Type.ADMIN_DETAIL_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.ADMIN_DETAIL_SUCCESS:
			return {
				...state,
				adminDetail: action.payload.data,
				isLoading: false,
			};
		case Type.ADMIN_DETAIL_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.PASSES_LIST_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.PASSES_LIST_SUCCESS:
			return {
				...state,
				isLoading: false,
				passList: action.payload,
			};
		case Type.PASSES_LIST_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.SET_CHAT_EVENT:
			return {
				...state,
				chatUpdateEvent: action.payload || null,
			};
		case Type.SET_CHAT_USER_STATUS:
			return {
				...state,
				chatUserStatus: action.payload,
			};
		case Type.SET_CHAT_USER_MARKREAD_STATUS:
			return {
				...state,
				chatUserMarkReadStatus: action.payload,
			};
		case Type.SET_CHAT_UNREAD_COUNT:
			return {
				...state,
				chatUnreadCount: action.payload,
			};
		default:
			return state;
	}
};

export default ChatReducer;
