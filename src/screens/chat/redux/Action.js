import * as Type from "./Type";

export const listOfContactRequest = (params, navigation) => ({
	type: Type.TRUST_CONTACT_LIST_REQUEST,
	payload: { data: params, nav: navigation },
});

export const companyEmployeeRequest = (params, navigation) => ({
	type: Type.COMPANY_EMPLOYEE_LIST_REQUEST,
	payload: { data: params, nav: navigation },
});

export const getPinnedContactList = (params, navigation) => ({
	type: Type.PINNED_CONTACT_LIST_REQUEST,
	payload: { data: params, nav: navigation },
});

export const getAdminDetail = (params, navigation) => ({
	type: Type.ADMIN_DETAIL_REQUEST,
	payload: { data: params, nav: navigation },
});

export const getPassRequest = (navigation) => ({
	type: Type.PASSES_LIST_REQUEST,
	payload: { nav: navigation },
});

export const setChatUpdateEvent = (event) => ({
	type: Type.SET_CHAT_EVENT,
	payload: event,
});

export const setChatUserStatusEvent = (event) => ({
	type: Type.SET_CHAT_USER_STATUS,
	payload: event,
});

export const setChatUserMarkReadEvent = (event) => ({
	type: Type.SET_CHAT_USER_MARKREAD_STATUS,
	payload: event,
});

export const setChatUnreadCount = (event) => ({
	type: Type.SET_CHAT_UNREAD_COUNT,
	payload: event,
});
