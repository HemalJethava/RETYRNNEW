import * as Type from "./Type";

export const getStateListRequest = () => ({
	type: Type.STATE_LIST_REQUEST,
	payload: {},
});

export const getVehicleListRequest = () => ({
	type: Type.VEHICLE_LIST_REQUEST,
	payload: {},
});

export const getIncidentListRequest = (params, navigation) => ({
	type: Type.INCIDENT_LIST_REQUEST,
	payload: { data: params, nav: navigation },
});

export const getClaimTalkListRequest = (params, navigation) => ({
	type: Type.CLAIM_TALK_LIST_REQUEST,
	payload: { data: params, nav: navigation },
});

export const getIncidentDetailsRequest = (params, navigation) => ({
	type: Type.INCIDENT_DETAILS_REQUEST,
	payload: { data: params, nav: navigation },
});

export const addIncidentRequest = (params, navigation) => ({
	type: Type.ADD_INCIDENT_REQUEST,
	payload: { data: params, nav: navigation },
});

export const saveDraftRequest = (params, navigation) => ({
	type: Type.SAVE_DRAFT_REQUEST,
	payload: { data: params, nav: navigation },
});

export const addclaimTalkRequest = (params, navigation) => ({
	type: Type.CLAIM_TALK_REQUEST,
	payload: { data: params, nav: navigation },
});

export const videoStoreRequest = (params, navigation) => ({
	type: Type.FIRST_VIDEO,
	payload: { data: params, nav: navigation },
});

export const getDriverListRequest = (params, navigation) => ({
	type: Type.DRIVER_LIST_REQUEST,
	payload: { data: params, nav: navigation },
});

export const getIncidentTypeListRequest = (params, navigation) => ({
	type: Type.INCIDENT_TYPE_LIST_REQUEST,
	payload: { data: params, nav: navigation },
});
