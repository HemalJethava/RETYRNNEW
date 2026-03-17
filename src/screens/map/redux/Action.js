import * as Type from "./Type";

export const storeRecentLocationArray = (array) => ({
	type: Type.STORE_RECENET_LOCATION_LIST,
	payload: array,
});

export const fetchRecentLocationArray = () => ({
	type: Type.FETCH_RECENET_LOCATION_LIST,
});

export const setRecentLocationArray = (array) => ({
	type: Type.SET_RECENET_LOCATION_LIST,
	payload: array,
});

export const removeRecentLocationArrayItem = (id) => ({
	type: Type.REMOVE_RECENET_LOCATION_LIST_ITEM,
	payload: id,
});

export const removeRecentLocationArrayItems = (ids) => ({
	type: Type.REMOVE_RECENET_LOCATION_LIST_ITEMS,
	payload: ids,
});

// Add place to library
export const storeLibraryPlace = (array) => ({
	type: Type.STORE_LIBRARY_PLACE,
	payload: array,
});

export const fetchLibraryPlace = () => ({
	type: Type.FETCH_LIBRARY_PLACE,
});

export const setLibraryPlace = (array) => ({
	type: Type.SET_LIBRARY_PLACE,
	payload: array,
});

export const removeLibraryPlace = (ids) => ({
	type: Type.REMOVE_LIBRARY_PLACE,
	payload: ids,
});

export const pinnedPlaceListRequest = (params, navigation) => ({
	type: Type.PINNED_PLACE_LIST_REQUEST,
	payload: { data: params, nav: navigation },
});

export const setMapLayoutType = (event) => ({
	type: Type.MAP_LAYOUT_TYPE,
	payload: event,
});
