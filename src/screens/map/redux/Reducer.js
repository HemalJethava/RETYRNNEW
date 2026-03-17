import * as Type from "./Type";

const initialState = {
	isLoading: false,

	recentSearchLocationList: [],
	saveDestination: {},

	libraryList: [],
	savePlace: {},

	pinnedPlaceList: [],

	mapLayoutType: "standard",
};

const MapReducer = (state = initialState, action) => {
	switch (action.type) {
		case Type.SET_RECENET_LOCATION_LIST:
			return { ...state, recentSearchLocationList: action.payload };

		case Type.REMOVE_RECENET_LOCATION_LIST_ITEM:
			return {
				...state,
				recentSearchLocationList: state.recentSearchLocationList.filter(
					(item, index) => index !== action.payload
				),
			};

		case Type.REMOVE_RECENET_LOCATION_LIST_ITEMS:
			return {
				...state,
				recentSearchLocationList: state.recentSearchLocationList.filter(
					(item) => !action.payload.includes(item.id)
				),
			};

		// Library
		case Type.SET_LIBRARY_PLACE:
			return { ...state, libraryList: action.payload };

		case Type.REMOVE_LIBRARY_PLACE:
			return {
				...state,
				libraryList: state.libraryList.filter(
					(item) => !action.payload.includes(item.place_id)
				),
			};

		case Type.PINNED_PLACE_LIST_REQUEST:
			return {
				...state,
				isLoading: true,
			};
		case Type.PINNED_PLACE_LIST_SUCCESS:
			return {
				...state,
				pinnedPlaceList: action.payload,
				isLoading: false,
			};
		case Type.PINNED_PLACE_LIST_FAIL:
			return {
				...state,
				isLoading: false,
			};
		case Type.MAP_LAYOUT_TYPE:
			return {
				...state,
				mapLayoutType: action.payload || "standard",
			};
		default:
			return state;
	}
};
export default MapReducer;
