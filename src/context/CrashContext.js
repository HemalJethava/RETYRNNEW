import React, { createContext, useState, useContext, useEffect } from "react";

const CrashContext = createContext();

export const CrashProvider = ({ children }) => {
	const [showCrashPopup, setShowCrashPopup] = useState(false);
	const [force, setForce] = useState(null);

	const showPopup = (forceValue) => {
		setForce(forceValue);
		setShowCrashPopup(true);
	};

	const hidePopup = () => {
		setShowCrashPopup(false);
		setForce(null);
	};

	return (
		<CrashContext.Provider
			value={{ showCrashPopup, showPopup, hidePopup, force }}
		>
			{children}
		</CrashContext.Provider>
	);
};

export const useCrash = () => useContext(CrashContext);
