import { stat } from "react-native-fs";
import * as Type from "./Type";

const initialState = {
	isLoading: false,
	error: null,
	errorEditPass: null,
	passList: [],
	archivePassList: [],
	passDetails: [],
	passCreate: {},
	passEdit: {},
	stateList: [],
};

const PassReducer = (state = initialState, action) => {
	switch (action.type) {
		case Type.CREATE_PASS_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.CREATE_PASS_SUCCESS:
			return {
				...state,
				passCreate: action.payload,
				isLoading: false,
			};
		case Type.CREATE_PASS_FAIL:
			return {
				...state,
				error: action.payload,
				isLoading: false,
			};
		case Type.EDIT_PASS_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.EDIT_PASS_SUCCESS:
			return {
				...state,
				passEdit: action.payload,
				isLoading: false,
			};
		case Type.EDIT_PASS_FAIL:
			return {
				...state,
				errorEditPass: action.payload,
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
		case Type.ARCHIVE_PASSSES_LIST_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.ARCHIVE_PASSES_LIST_SUCCESS:
			return {
				...state,
				isLoading: false,
				archivePassList: action.payload,
			};
		case Type.ARCHIVE_PASSES_LIST_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.PASS_DETAILS_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.PASS_DETAILS_SUCCESS:
			return {
				...state,
				passDetails: action.payload,
				isLoading: false,
			};
		case Type.PASS_DETAILS_FAIL:
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
		default:
			return state;
	}
};

export default PassReducer;
