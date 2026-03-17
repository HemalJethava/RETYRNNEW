import * as Type from "./Type";

export const createPassRequest = (param, navigation) => ({
	type: Type.CREATE_PASS_REQUEST,
	payload: { data: param, nav: navigation },
});

export const editPassRequest = (param, navigation) => ({
	type: Type.EDIT_PASS_REQUEST,
	payload: { data: param, nav: navigation },
});

export const getPassRequest = (navigation) => ({
	type: Type.PASSES_LIST_REQUEST,
	payload: { nav: navigation },
});

export const getArchivePassRequest = (navigation) => ({
	type: Type.ARCHIVE_PASSSES_LIST_REQUEST,
	payload: { nav: navigation },
});

export const getPassDeatilsRequest = (param, navigation) => ({
	type: Type.PASS_DETAILS_REQUEST,
	payload: { data: param, nav: navigation },
});

export const getStateListRequest = () => ({
	type: Type.STATE_LIST_REQUEST,
	payload: {},
});
