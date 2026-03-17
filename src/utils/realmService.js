import realm from "./realmConfig";

// "getNextId" funcation mentioned "write" method of realm
export function getNextId(schemaName) {
	let nextID = 1;

	realm.write(() => {
		// Retrieve the counter object for the specified schema
		const counter = realm.objectForPrimaryKey("Counter", schemaName);

		if (counter) {
			// Increment the last used ID
			nextID = counter.lastUsedID + 1;
			counter.lastUsedID = nextID;
		} else {
			// Create a new counter object if it does not exist
			realm.create("Counter", { id: schemaName, lastUsedID: nextID });
		}
	});

	return nextID;
}

// "getNextIdWithOutWrite" funcation not mention "write" method of realm
export function getNextIdWithOutWrite(schemaName) {
	let nextID = 1;

	// Retrieve the counter object for the specified schema
	const counter = realm.objectForPrimaryKey("Counter", schemaName);
	if (counter) {
		// Increment the last used ID
		nextID = counter.lastUsedID + 1;
		counter.lastUsedID = nextID;
	} else {
		// Create a new counter object if it does not exist
		realm.create("Counter", { id: schemaName, lastUsedID: nextID });
	}

	return nextID;
}

// Function to create a new record
export const createIncidentRecord = (id, name) => {
	let incrementID = getNextId("Incident");
	realm.write(() => {
		realm.create("Incident", {
			incidentID: incrementID,
			incidentTypeID: id,
			incidentTypeName: name,
		});
	});
};

// Function to create a new record
export const createIncidentTypeRecord = (
	incidentID,
	subTypeID,
	subTypeName
) => {
	let incrementID = getNextId("IncidentType");
	realm.write(() => {
		realm.create("IncidentType", {
			typeID: incrementID,
			incidentID: incidentID,
			incidentSubTypeID: subTypeID, // Add incident sub type ID
			incidentSubTypeName: subTypeName, // Add incident sub type name
		});
	});
};

// Function to read all incidents records
export const readIncidentRecords = () => {
	const IncidentData = realm.objects("Incident");
	return IncidentData;
};

// Function to read all sub incidents types records
export const readIncidentTypesRecords = () => {
	const incidentSubType = realm.objects("IncidentType");
	return incidentSubType;
};

// Function to read all incidents records
export const readIncidentImgsRecords = () => {
	const imgsData = realm.objects("Image");
	return imgsData;
};
