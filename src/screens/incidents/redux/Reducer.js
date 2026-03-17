import { stat } from "react-native-fs";
import * as Type from "./Type";

const initialState = {
	isLoading: false,
	error: null,
	stateList: [],
	vehicleList: [],
	incidentList: [],
	claimTalkList: [],
	incidentDetails: [],
	firstVideo: [],
	incidentAdded: "",
	draftAdded: "",
	driverList: [],
	incidentTypes: {},
};

const IncidentReducer = (state = initialState, action) => {
	switch (action.type) {
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
		case Type.VEHICLE_LIST_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.VEHICLE_LIST_SUCCESS:
			return {
				...state,
				isLoading: false,
				vehicleList: action.payload,
			};
		case Type.VEHICLE_LIST_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.INCIDENT_LIST_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.INCIDENT_LIST_SUCCESS:
			return {
				...state,
				isLoading: false,
				incidentList: action.payload,
			};
		case Type.INCIDENT_LIST_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.CLAIM_TALK_LIST_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.CLAIM_TALK_LIST_SUCCESS:
			return {
				...state,
				isLoading: false,
				claimTalkList: action.payload,
			};
		case Type.CLAIM_TALK_LIST_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.INCIDENT_DETAILS_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.INCIDENT_DETAILS_SUCCESS:
			return {
				...state,
				isLoading: false,
				incidentDetails: action.payload,
			};
		case Type.INCIDENT_DETAILS_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.ADD_INCIDENT_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.ADD_INCIDENT_SUCCESS:
			return {
				...state,
				incidentAdded: action.payload.data,
				isLoading: false,
			};
		case Type.ADD_INCIDENT_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.SAVE_DRAFT_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.SAVE_DRAFT_SUCCESS:
			return {
				...state,
				draftAdded: action.payload.data,
				isLoading: false,
			};
		case Type.SAVE_DRAFT_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.CLAIM_TALK_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.CLAIM_TALK_SUCCESS:
			return {
				...state,
				isLoading: false,
			};
		case Type.CLAIM_TALK_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.FIRST_VIDEO:
			return {
				...state,
				firstVideo: action.payload,
			};
		case Type.DRIVER_LIST_REQUEST:
			return {
				...state,
				isLoading: true,
				error: null,
			};
		case Type.DRIVER_LIST_SUCCESS:
			return {
				...state,
				driverList: action.payload,
				isLoading: false,
				error: null,
			};
		case Type.DRIVER_LIST_FAIL:
			return {
				...state,
				isLoading: false,
				error: action.error,
			};
		case Type.INCIDENT_TYPE_LIST_REQUEST:
			return {
				...state,
				isLoading: true,
				error: null,
			};
		case Type.INCIDENT_TYPE_LIST_SUCCESS:
			return {
				...state,
				incidentTypes: action.payload,
				isLoading: false,
				error: null,
			};
		case Type.INCIDENT_TYPE_LIST_FAIL:
			return {
				...state,
				isLoading: false,
				error: action.error,
			};
		default:
			return state;
	}
};

export default IncidentReducer;
