import Realm from "realm";

// Define the Counter schema to keep track of the last used ID for each schema
const CounterSchema = {
	name: "Counter",
	primaryKey: "id",
	properties: {
		id: "string", // Schema name (e.g., 'User', 'Product', etc.)
		lastUsedID: "int", // Last used ID for this schema
	},
};

// Define schema for Image
const ImageSchema = {
	name: "Image",
	primaryKey: "id", // You can use 'uri' or any other unique identifier as the primary key
	properties: {
		id: "int",
		name: "string",
		size: "int",
		type: "string",
		uri: "string",
		incidentID: "int?", // Foreign key reference to IncidentSchema
		typeID: "int?", // Foreign key reference to Incident Type Schema
	},
};

// Define schema for Incident
const IncidentSchema = {
	name: "Incident",
	primaryKey: "incidentID", // Define the primary key
	properties: {
		incidentID: "int", // Primary Key
		incidentTypeID: "int", // Common fields
		incidentTypeName: "string", // Common fields
		incidentDate: "string?", // Common fields
		incidentTime: "string?",
		incidentState: "string?", // Common fields
		incidentVehicleID: "string?", // Common fields
		vehicleName: "string?", // Common fields
		driverName: "string?",
		safeDrive: "string?",
		damagePart: "string?",
		glassClip: "string?",
		dollar: "string?",
		criticalInfo: "string?", // Common fields
		images: "Image[]", // Array of binary data // Common fields
	},
};

// Define schema for IncidentType
const IncidentTypeSchema = {
	name: "IncidentType",
	primaryKey: "typeID",
	properties: {
		typeID: "int",
		incidentID: "int", // Foreign Key reference to Incident Schema
		incidentSubTypeID: "int?",
		incidentSubTypeName: "string?",
		involved: "string?",
		position: "string?",
		movingVehicle: "string?",
		changeLane: "string?",
		tailLightVehicle: "string?",
		position2: "string?",
		impact: "string?",
		vehiclePush: "string?",
		damageSide: "string?",
	},
};

const realm = new Realm({
	schema: [CounterSchema, ImageSchema, IncidentSchema, IncidentTypeSchema],
	schemaVersion: 1, // Increment the schema version
	migration: (oldRealm, newRealm) => {
		// Migration for CounterSchema
		if (oldRealm.schemaVersion < 2) {
			const oldCounters = oldRealm.objects("Counter");
			const newCounters = newRealm.objects("Counter");
			for (let i = 0; i < oldCounters.length; i++) {
				newCounters[i].id = oldCounters[i].id;
				newCounters[i].lastUsedID = oldCounters[i].lastUsedID;
			}
		}

		// Migration for ImageSchema
		if (oldRealm.schemaVersion < 2) {
			const oldImages = oldRealm.objects("Image");
			const newImages = newRealm.objects("Image");
			for (let i = 0; i < oldImages.length; i++) {
				newImages[i].id = oldImages[i].id;
				newImages[i].name = oldImages[i].name;
				newImages[i].size = oldImages[i].size;
				newImages[i].type = oldImages[i].type;
				newImages[i].uri = oldImages[i].uri;
				newImages[i].incidentID = oldImages[i].incidentID;
				newImages[i].typeID = oldImages[i].typeID;
			}
		}

		// Migration for IncidentSchema
		if (oldRealm.schemaVersion < 2) {
			const oldIncidents = oldRealm.objects("Incident");
			const newIncidents = newRealm.objects("Incident");
			for (let i = 0; i < oldIncidents.length; i++) {
				const oldObject = oldIncidents[i];
				const newObject = newIncidents[i];

				// Remove old fields if they exist (delete operation should be done conditionally)
				// if (newObject.hasOwnProperty("incidentLocation")) {
				// 	delete newObject.incidentLocation;
				// }

				// Change type of dollar from string to double
				// if (oldObject.dollar && typeof oldObject.dollar === "string") {
				// 	newObject.dollar = parseFloat(oldObject.dollar);
				// } else {
				// 	newObject.dollar = oldObject.dollar;
				// }

				// Initialize new fields with default values if necessary
				// if (!newObject.incidentSubTypeID) {
				// 	newObject.incidentSubTypeID = "";
				// }

				newObject.incidentID = oldObject.incidentID;
				newObject.incidentTypeID = oldObject.incidentTypeID;
				newObject.incidentTypeName = oldObject.incidentTypeName;
				newObject.incidentDate = oldObject.incidentDate;
				newObject.incidentTime = oldObject.incidentTime;
				newObject.incidentState = oldObject.incidentState;
				newObject.incidentVehicleID = oldObject.incidentVehicleID;
				newObject.vehicleName = oldObject.vehicleName;
				newObject.driverName = oldObject.driverName;
				newObject.safeDrive = oldObject.safeDrive;
				newObject.damagePart = oldObject.damagePart;
				newObject.glassClip = oldObject.glassClip;
				newObject.dollar = oldObject.dollar;
				newObject.criticalInfo = oldObject.criticalInfo;
				newObject.images = oldObject.images;
			}
		}

		// Migration for IncidentTypeSchema
		if (oldRealm.schemaVersion < 2) {
			const oldIncidentTypes = oldRealm.objects("IncidentType");
			const newIncidentTypes = newRealm.objects("IncidentType");
			for (let i = 0; i < oldIncidentTypes.length; i++) {
				const oldObject = oldIncidentTypes[i];
				const newObject = newIncidentTypes[i];

				newObject.typeID = oldObject.typeID;
				newObject.incidentID = oldObject.incidentID;
				newObject.incidentSubTypeID = oldObject.incidentSubTypeID;
				newObject.incidentSubTypeName = oldObject.incidentSubTypeName;
				newObject.involved = oldObject.involved;
				newObject.position = oldObject.position;
				newObject.movingVehicle = oldObject.movingVehicle;
				newObject.changeLane = oldObject.changeLane;
				newObject.tailLightVehicle = oldObject.tailLightVehicle;
				newObject.position2 = oldObject.position2;
				newObject.impact = oldObject.impact;
				newObject.vehiclePush = oldObject.vehiclePush;
				newObject.damageSide = oldObject.damageSide;
			}
		}
	},
});
export default realm;
