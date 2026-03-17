import { combineReducers } from "redux";

import AuthReducer from "../screens/auth/redux/Reducer";
import PassReducer from "../screens/passes/redux/Reducer";
import IncidentReducer from "../screens/incidents/redux/Reducer";
import AccountReducer from "../screens/account/redux/Reducer";
import ChatReducer from "../screens/chat/redux/Reducer";
import MapReducer from "../screens/map/redux/Reducer";
import { RESET_APP } from "../screens/account/redux/Type";

const appReducer = combineReducers({
	Auth: AuthReducer,
	Pass: PassReducer,
	Incident: IncidentReducer,
	Account: AccountReducer,
	Chat: ChatReducer,
	Map: MapReducer,
});

const rootReducer = (state, action) => {
	if (action.type === RESET_APP) {
		state = undefined;
	}
	return appReducer(state, action);
};

export default rootReducer;
