import moment from "moment-timezone";

export const formatLastSeen = (timestampInCST) => {
	if (!timestampInCST) return "Last seen unknown";

	const sourceTimezone = "America/Chicago";
	const targetTimezone = "Asia/Kolkata";

	const cstMoment = moment.tz(
		timestampInCST,
		"YYYY-MM-DD HH:mm:ss",
		sourceTimezone
	);

	if (!cstMoment.isValid()) return "Invalid timestamp";

	const istMoment = cstMoment.clone().tz(targetTimezone);

	const now = moment().tz(targetTimezone);
	const isToday = now.isSame(istMoment, "day");
	const isYesterday = now.subtract(1, "day").isSame(istMoment, "day");

	if (isToday) {
		return `today at ${istMoment.format("hh:mm A")}`;
	} else if (isYesterday) {
		return `yesterday at ${istMoment.format("hh:mm A")}`;
	} else {
		return `${istMoment.format("MM/DD/YYYY [at] hh:mm A")}`;
	}
};
