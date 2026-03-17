const MESSAGE = {
	// Auth module
	email: "Enter email address",
	officeCode: "Enter office code",
	validateEmail: "Enter valid email address",
	officeCodeLength: "The office code must be 5 digits long",

	fullName: "Enter full name",
	title: "Enter position/title",
	phone: "Enter cell phone",
	validatePhone: "Please enter valid cell phone number",
	verify2FA: "First verify 2FA",

	otp: "Enter OTP",
	validateOTP: "OTP have 5 digit",
	passwd: "Please Enter password", //requested message by QA
	validatePasswd:
		"Password should be 8 characters contain digit, uppercase, lowecase & special characters",
	confirmPasswd: "Enter confirm password",
	comparePasswd: "Confirm password does not match",

	companyName: "Enter company name",
	companyAddr: "Please Enter company address",
	city: "Enter city",
	state: "Select state",
	zip: "Enter zip",
	validateZip: "ZIP code must be 5 or 9 digits only",

	passName: "Enter pass name",
	passImg: "Upload pass image",
	policyID: "Enter policy ID",
	insured: "Enter insured name",
	type: "Enter type",
	effectiveDate: "Enter effective date",
	expirationDate: "Expiration date greater than of effective date",
	disclaimer: "Enter disclaimer",
	website: "Enter website",
	validateURL: "Enter valid URL",

	// Incident validation messages

	incidentDate: "Select incident date",
	incidentTime: "Select incident time",
	incidentState: "Select incident state",
	vehicle: "Select vehicle or scan vehicle QR code",
	selectOption: "Select option",
	criticalMsg: "Enter critical message",
	uploadImages: "Please add images",
	uploadDoc: "Upload document",
	incidentDateValid: "You can't select the future date",
	location: "Enter location",

	// video 1 display message 1
	modalText1:
		"Read the teleprompter to help us gather the necessary information for your claim.",
	modalLabel1: "First",
	videoMsg1Line1: "Hello! My name is ",
	videoMsg1Line2: "and I was recently in an incident.",

	videoPlaseholder1Q1: "(Your name)",

	// video 1 display message 2

	videoMsg1Line3: "The driver of the vehicle was",
	videoMsg1Line4: "and the vehicle in reference is a",
	videoPlaseholder1Q2: "(Name)",
	videoPlaseholder1Q3: "(Year/Make/Model)",

	// video 1 display message 3
	videoMsg1Line5: "The incident occurred on",
	videoMsg1Line6: "There were",
	videoMsg1Line7: "people injured in",
	videoMsg1Line8: "the incident at the time of reporting.",
	videoPlaseholder1Q4: "(Date)",
	videoPlaseholder1Q5: "(Number)",

	// video 2 display message 1
	modalLabel2: "Second",
	modalText2:
		"Next, please explain in your words what occurred in this incident.",
	videoMsg2Line1: "Explain the type of incident",
	videoMsg2Line2: "Explain the Weather",
	videoMsg2Line3: "Any other critical information",

	// video 3 display message 1
	modalLabel3: "Third",
	modalText3: "Next, please provide video evidence of damages to all vehicles",
	videoMsg3Line1: "Film My Car Damages",
	videoMsg3Line2: "Film Other Car Damages",

	// Empty flatlist messages
	noIncidentImgs: "No Incident Images Found",
	noIncidentVideos: "No Incident Videos Found",
	noContactNumb: "No Contact Number Found",
	noPass: "No Passes Found",
	noCompanyPass: "No Company Passes Found",
	noPersonalPass: "No Personal Passes Found",
	noArchivePass: "No Archive Passes Found",
	noData: "No Data Found",
	noIncident: "No Incident found",
	profileNotSet: "Profile is not set yet",

	maxImageSize: "Image too large, Maximum allowed size is 10 MB.",
	maxFileSize: "File too large, Maximum allowed size is 10 MB.",
};

export default MESSAGE;

export const LOCATION_PERMISSION_STATUS = {
	GRANTED: "GRANTED",
	DENIED: "DENIED",
	BLOCKED: "BLOCKED",
	RESTRICTED: "RESTRICTED",
	UNAVAILABLE: "UNAVAILABLE",
};
