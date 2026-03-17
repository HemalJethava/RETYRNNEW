import { BASE_URL, GOOGLE_MAPS_APIKEY } from "../config/BaseUrl";

function isEmpty(value) {
	if (!value.trim()) {
		return true;
	}
}

const isEmailValidate = (email) => {
	// General email regex to match common patterns
	const emailPattern = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	// Disallow '+' symbol in the email
	if (email.includes("+")) {
		return false;
	}

	// Split the email into local part (before '@') and domain (after '@')
	const [localPart, domain] = email.split("@");
	if (!domain || !localPart) {
		return false;
	}

	// Ensure local part is not made up of only underscores
	if (/^_+$/.test(localPart)) {
		return false; // Invalid: only underscores
	}

	// Ensure domain contains a valid structure (e.g., "example.com")
	const domainPattern = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/; // TLD between 2 to 6 characters
	const isDomainValid = domainPattern.test(domain);

	// Ensure domain is not an IP address
	const isIP = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(domain);
	if (!isDomainValid || isIP) {
		return false;
	}

	// Split domain into parts (e.g., "example" and "com" for "example.com")
	const domainLevels = domain.split(".");
	if (domainLevels.length > 3) {
		return false; // Too many subdomains
	}

	// Check the domain name length constraints
	const domainName = domainLevels.slice(0, -1).join(".");
	if (
		domainName.length > 63 || // Ensure the domain part isn't too long
		domainLevels[domainLevels.length - 1].length < 2 // Ensure the TLD isn't too short
	) {
		return false;
	}

	// Validate local part: no leading or trailing dots, no consecutive dots/hyphens
	if (
		localPart.startsWith(".") ||
		localPart.endsWith(".") ||
		/\.{2,}|\-{2,}/.test(localPart) // No consecutive dots or hyphens
	) {
		return false;
	}

	// Gmail-specific rule: Underscores are allowed as long as there is another character
	if (domain.toLowerCase() === "gmail.com") {
		if (/^_+$/.test(localPart)) {
			return false; // Only underscores → invalid
		}
	}

	// If all checks pass, validate against the general email regex
	return emailPattern.test(email);
};

function isPasswdValidate(inputValue) {
	password = inputValue.trim();
	const check =
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
	if (password.match(check)) {
		return true;
	} else {
		return false;
	}
}

function formatMobileNumber(inputText, backSpace) {
	if (!inputText) return;
	const text = inputText.replace(/[,\.\-\s]/g, "");
	if (backSpace === "backspace") {
		if (text.charAt(text.length - 1) === "-") {
			return text.slice(0, -1);
		} else {
			return text;
		}
	} else if (backSpace === "write") {
		let cleaned = text.replace(/\D/g, ""); // remove non-digit characters
		let match = null;
		if (cleaned.length > 0 && cleaned.length < 2) {
			return `(${cleaned}`;
		} else if (cleaned.length == 3) {
			return `(${cleaned}) `;
		} else if (cleaned.length > 3 && cleaned.length < 5) {
			match = cleaned.match(/(\d{3})(\d{1,3})$/);
			if (match) {
				return `(${match[1]}) ${match[2]}`;
			}
		} else if (cleaned.length == 6) {
			match = cleaned.match(/(\d{3})(\d{3})$/);
			if (match) {
				return `(${match[1]}) ${match[2]}-`;
			}
		} else if (cleaned.length > 6) {
			match = cleaned.match(/(\d{3})(\d{3})(\d{4})$/);
			if (match) {
				return `(${match[1]}) ${match[2]}-${match[3]}`;
			}
		}
		return text;
	}
}

function formatedMobileNumb(text) {
	var cleaned = ("" + text).replace(/\D/g, "");
	var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
	if (match) {
		var intlCode = match[1] ? "+1 " : "",
			number = [intlCode, "(", match[2], ") ", match[3], "-", match[4]].join(
				""
			);

		return number;
	}
}

function formatCodeWithMobileNumber(mobile) {
	if (!mobile) return "";

	const digits = mobile.replace(/\D/g, "");
	let countryCode, firstPart, secondPart, thirdPart;

	if (digits.length === 11) {
		countryCode = digits.slice(0, 1);
		firstPart = digits.slice(1, 4);
		secondPart = digits.slice(4, 7);
		thirdPart = digits.slice(7);
		return `+${countryCode} (${firstPart}) ${secondPart}-${thirdPart}`;
	} else if (digits.length === 12) {
		countryCode = digits.slice(0, 2);
		firstPart = digits.slice(2, 5);
		secondPart = digits.slice(5, 8);
		thirdPart = digits.slice(8);
		return `+${countryCode} (${firstPart}) ${secondPart}-${thirdPart}`;
	} else if (digits.length === 13) {
		countryCode = digits.slice(0, 3);
		firstPart = digits.slice(3, 6);
		secondPart = digits.slice(6, 9);
		thirdPart = digits.slice(9);
		return `+${countryCode} (${firstPart}) ${secondPart}-${thirdPart}`;
	} else {
		return mobile;
	}
}

function isMobileValidate(text) {
	if (/^\d{10}$/.test(text)) {
		return false;
	} else {
		return true;
	}
}

function isZipCode(text) {
	if (/^\d{5,9}$/.test(text)) {
		return false;
	} else {
		return true;
	}
}

function isOTP(text) {
	if (/^\d{5}$/.test(text)) {
		return false;
	} else {
		return true;
	}
}

function isURLValidate(text) {
	const pattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;
	return pattern.test(text);
}

function lineLoop(startNumb, loopSize) {
	const lineSize = [startNumb];
	for (var i = 0; i <= loopSize; i++) {
		const randomHeight = Math.floor(Math.random() * 50) + startNumb;
		lineSize.push(randomHeight);
	}
	return lineSize;
}

function isValidteSpacialChar(inputText) {
	const regex = inputText.replace(/[^a-zA-Z0-9 ]/g, "");
	return regex;
}

function isValidteSpacialCharNumb(inputText) {
	const regex = inputText.replace(/[^a-zA-Z ]/g, "");
	return regex;
}

function isValidteAddress(inputText) {
	// Remove any invalid characters except for "@", "&", "-", "/", "%", and "."
	let sanitizedText = inputText.replace(/[^a-zA-Z0-9 /@,.\-#'%&]/g, "");

	// Ensure only one "@" is allowed
	const atIndex = sanitizedText.indexOf("@");
	if (atIndex !== -1) {
		sanitizedText =
			sanitizedText.slice(0, atIndex + 1) +
			sanitizedText.slice(atIndex + 1).replace(/@/g, "");
	}

	// Ensure only one "&" is allowed
	const ampersandIndex = sanitizedText.indexOf("&");
	if (ampersandIndex !== -1) {
		sanitizedText =
			sanitizedText.slice(0, ampersandIndex + 1) +
			sanitizedText.slice(ampersandIndex + 1).replace(/&/g, "");
	}

	// Ensure only one "-" is allowed
	const dashIndex = sanitizedText.indexOf("-");
	if (dashIndex !== -1) {
		sanitizedText =
			sanitizedText.slice(0, dashIndex + 1) +
			sanitizedText.slice(dashIndex + 1).replace(/-/g, "");
	}

	// Ensure only one "/" is allowed
	const slashIndex = sanitizedText.indexOf("/");
	if (slashIndex !== -1) {
		sanitizedText =
			sanitizedText.slice(0, slashIndex + 1) +
			sanitizedText.slice(slashIndex + 1).replace(/\//g, "");
	}

	// Ensure only one "%" is allowed
	const percentIndex = sanitizedText.indexOf("%");
	if (percentIndex !== -1) {
		sanitizedText =
			sanitizedText.slice(0, percentIndex + 1) +
			sanitizedText.slice(percentIndex + 1).replace(/%/g, "");
	}

	// Ensure only one "." is allowed
	const dotIndex = sanitizedText.indexOf(".");
	if (dotIndex !== -1) {
		sanitizedText =
			sanitizedText.slice(0, dotIndex + 1) +
			sanitizedText.slice(dotIndex + 1).replace(/\./g, "");
	}

	// Ensure only one "#" is allowed
	const hashIndex = sanitizedText.indexOf("#");
	if (hashIndex !== -1) {
		sanitizedText =
			sanitizedText.slice(0, hashIndex + 1) +
			sanitizedText.slice(hashIndex + 1).replace(/#/g, "");
	}

	return sanitizedText;
}

function isVerifyNumb(inputText) {
	const text = inputText.replace(/[,\.\-\s]/g, "");
	return text;
}

function renderIf(value) {
	if (value) {
		return true;
	} else {
		return false;
	}
}

function startsWithHash(inputText) {
	return inputText.charAt(0) === "#";
}

const checkLatestVersionURL = () => {
	const url = BASE_URL;
	return url.includes("v1");
};

const validateAddressWithGeocoding = async (address) => {
	const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
		address
	)}&key=${GOOGLE_MAPS_APIKEY}`;

	try {
		const response = await fetch(geocodeUrl);
		const data = await response.json();

		if (data.status === "OK" && data.results.length > 0) {
			return true; // Return true for valid address
		} else {
			return false; // Return false for invalid address
		}
	} catch (error) {
		console.error("Geocoding API error: ", error);
		return false; // Return false in case of an error
	}
};

const checkAddressValidity = async (latitude, longitude) => {
	const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_APIKEY}`;

	try {
		const response = await fetch(url);
		const data = await response.json();

		if (data.status === "OK" && data.results.length > 0) {
			return true;
		} else {
			return false;
		}
	} catch (error) {
		return false;
	}
};

const keysToCheck = [
	// Glass Only Incident
	"glass_damage_part_name",
	"no_of_chips_or_cracks",
	"is_larger_than_dollar",

	// Incident/Collision
	"is_vehicle_safe_to_drive",
	"option_for_desc_accident",

	"no_of_vehicle_involved_parking",
	"moving_vehicle_name_parking",
	"travelling_vehicle_parking",

	"no_of_vehicle_involved_backing",
	"moving_vehicle_name_backing",
	"see_other_vehicle_backing",
	"next_event_backing",

	"is_vehicle_stuck",

	"moving_vehicle_name_lane_change",
	"best_scenario_for_accident",
	"where_vehicle_travelling",
	"have_any_traffic_controls",
	"see_other_vehicle",
	"next_event_vehicle_entering_roadway",
	"single_vehicle_incident",
	"obj_vhcl_ran_pothole",
	"object_fall",
	"no_of_vehicle_involved_rear_end",
	"rear_end_position",
	"moving_vehicle_name_rear_end",
	"is_other_vehicle_change_lanes",
	"is_tail_light_working",
	"position_of_vehicle",
	"vehicle_impact_locationpushed_vehicle",
	"obj_stuck_offroad",
	"impact_to_other_vehicle",
	"vehicle_impact_location",
	"pushed_vehicle",
	,
	"no_of_vehicle_involved_lane_change",
	"object_moving",

	// Weather Incident
	"weather_type",
	"vehicle_slid_status",

	// Animal
	"next_event",

	// Unoccupied Incident
	"next_event",
	"hit_vehicle",
	"stolen_vehicle_part",
	"vehicle_rolled_away_occupied",

	// Stolen
	"next_event",
	"stolen_vehicle_part",
];

const checkForMultipleKeys = (array, callback) => {
	const isKeyFound = keysToCheck.some((key) => array.includes(key));
	if (isKeyFound && callback) {
		callback();
	}
	return isKeyFound;
};

const checkArrayKey = (array, key) => {
	return array.includes(key);
};

const isValidJSON = (value) => {
	try {
		const parsed = JSON.parse(value);
		return typeof parsed === "object" && parsed !== null;
	} catch (error) {
		return false;
	}
};

export {
	isEmpty,
	isEmailValidate,
	isPasswdValidate,
	formatMobileNumber,
	formatedMobileNumb,
	formatCodeWithMobileNumber,
	isURLValidate,
	isMobileValidate,
	isOTP,
	isVerifyNumb,
	isZipCode,
	lineLoop,
	isValidteSpacialChar,
	isValidteSpacialCharNumb,
	isValidteAddress,
	renderIf,
	startsWithHash,
	checkLatestVersionURL,
	validateAddressWithGeocoding,
	checkAddressValidity,
	checkForMultipleKeys,
	checkArrayKey,
	isValidJSON,
};
