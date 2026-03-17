import React, { useState } from "react";
import AppContext from "./AppContext";

const AppState = (props) => {
	const [contextData, setContextData] = useState(null);

	return (
		<AppContext.Provider value={{ contextData, setContextData }}>
			{props.children}
		</AppContext.Provider>
	);
};
export default AppState;
