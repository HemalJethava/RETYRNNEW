// NavigationCalculation.js

import { runOnJS } from "react-native-reanimated";

const metersPerDegLat = 111320;
export const metersPerDegLonAt = (lat) =>
	111320 * Math.cos((lat * Math.PI) / 180);

export function distMeters(a, b) {
	const mx = metersPerDegLonAt((a.latitude + b.latitude) / 2);
	const dx = (b.longitude - a.longitude) * mx;
	const dy = (b.latitude - a.latitude) * metersPerDegLat;
	return Math.hypot(dx, dy);
}

function projectOnSegment(P, A, B) {
	const mx = metersPerDegLonAt((A.latitude + B.latitude + P.latitude) / 3);

	const Ax = A.longitude * mx,
		Ay = A.latitude * metersPerDegLat;
	const Bx = B.longitude * mx,
		By = B.latitude * metersPerDegLat;
	const Px = P.longitude * mx,
		Py = P.latitude * metersPerDegLat;

	const ABx = Bx - Ax,
		ABy = By - Ay;
	const APx = Px - Ax,
		APy = Py - Ay;

	const ab2 = ABx * ABx + ABy * ABy || 1e-9;
	let t = (APx * ABx + APy * ABy) / ab2;
	t = Math.max(0, Math.min(1, t));

	const Qx = Ax + t * ABx;
	const Qy = Ay + t * ABy;

	const dx = Px - Qx,
		dy = Py - Qy;
	const crossTrack = Math.hypot(dx, dy);

	return { t, Qx, Qy, crossTrack };
}

export function getPolylineProgressMeters(points, pos) {
	if (!points || points.length < 2) {
		return {
			total: 0,
			progress: 0,
			crossTrack: distMeters(pos, points?.[0] || pos),
		};
	}

	let total = 0;
	for (let i = 0; i < points.length - 1; i++) {
		total += distMeters(points[i], points[i + 1]);
	}

	let best = { crossTrack: Infinity, progress: 0 };
	let accum = 0;

	for (let i = 0; i < points.length - 1; i++) {
		const A = points[i],
			B = points[i + 1];
		const segLen = distMeters(A, B);
		if (segLen === 0) continue;

		const { t, crossTrack } = projectOnSegment(pos, A, B);
		const progressHere = accum + t * segLen;

		if (crossTrack < best.crossTrack) {
			best = { crossTrack, progress: progressHere };
		}
		accum += segLen;
	}

	return { total, progress: best.progress, crossTrack: best.crossTrack };
}

export const distMetersWorklet = (a, b) => {
	"worklet";
	const mx =
		111320 * Math.cos(((a.latitude + b.latitude) / 2) * (Math.PI / 180));
	const dx = (b.longitude - a.longitude) * mx;
	const dy = (b.latitude - a.latitude) * 111320;
	return Math.hypot(dx, dy);
};

const projectOnSegmentWorklet = (P, A, B) => {
	"worklet";
	const mx =
		111320 *
		Math.cos(((A.latitude + B.latitude + P.latitude) / 3) * (Math.PI / 180));

	const Ax = A.longitude * mx,
		Ay = A.latitude * 111320;
	const Bx = B.longitude * mx,
		By = B.latitude * 111320;
	const Px = P.longitude * mx,
		Py = P.latitude * 111320;

	const ABx = Bx - Ax,
		ABy = By - Ay;
	const APx = Px - Ax,
		APy = Py - Ay;

	const ab2 = ABx * ABx + ABy * ABy || 1e-9;
	let t = (APx * ABx + APy * ABy) / ab2;
	t = Math.max(0, Math.min(1, t));

	const Qx = Ax + t * ABx;
	const Qy = Ay + t * ABy;

	const dx = Px - Qx,
		dy = Py - Qy;
	const crossTrack = Math.hypot(dx, dy);

	return { t, crossTrack };
};

export const getPolylineProgressMetersWorklet = (points, pos) => {
	"worklet";
	if (!points || points.length < 2) {
		return {
			total: 0,
			progress: 0,
			crossTrack: distMetersWorklet(pos, points?.[0] || pos),
		};
	}

	let total = 0;
	for (let i = 0; i < points.length - 1; i++) {
		total += distMetersWorklet(points[i], points[i + 1]);
	}

	let best = { crossTrack: Infinity, progress: 0 };
	let accum = 0;

	for (let i = 0; i < points.length - 1; i++) {
		const A = points[i],
			B = points[i + 1];
		const segLen = distMetersWorklet(A, B);
		if (segLen === 0) continue;

		const { t, crossTrack } = projectOnSegmentWorklet(pos, A, B);
		const progressHere = accum + t * segLen;

		if (crossTrack < best.crossTrack) {
			best = { crossTrack, progress: progressHere };
		}
		accum += segLen;
	}

	return { total, progress: best.progress, crossTrack: best.crossTrack };
};

export default {
	distMeters,
	getPolylineProgressMeters,
	distMetersWorklet,
	getPolylineProgressMetersWorklet,
};
