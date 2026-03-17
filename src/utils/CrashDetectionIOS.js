import React, { useRef, useEffect } from "react";
import {
	accelerometer,
	SensorTypes,
	setUpdateIntervalForType,
} from "react-native-sensors";
import { map, filter } from "rxjs/operators";
import notifee from "@notifee/react-native";

const CrashDetectionIOS = ({ enabled }) => {
	const CRASH_THRESHOLD_G = 2;
	const subscriptionRef = useRef(null);

	const startCrashDetection = () => {
		setUpdateIntervalForType(SensorTypes.accelerometer, 500);

		subscriptionRef.current = accelerometer
			.pipe(
				map(({ x, y, z }) => {
					const totalG = Math.sqrt(x ** 2 + y ** 2 + z ** 2);

					// console.log(
					// 	`Accelerometer → X: ${x.toFixed(2)} | Y: ${y.toFixed(
					// 		2
					// 	)} | Z: ${z.toFixed(2)} | G-Force: ${totalG.toFixed(2)}g`
					// );

					return totalG;
				})
			)
			.subscribe({
				next: async (totalG) => {
					if (totalG > CRASH_THRESHOLD_G) {
						const channelId = await notifee.createChannel({
							id: "retyrn",
							name: "Retyrn",
							sound: "default",
						});

						await notifee.displayNotification({
							title: "Crash Detected",
							body: `A crash has been detected.`,
							ios: { sound: "default" },
							android: {
								channelId,
								smallIcon: "ic_notification",
								pressAction: { id: "crash-detected" },
							},
							data: {
								type: "crash",
								gForce: totalG.toString(),
							},
						});
					}
				},
				error: (error) => console.error("Accelerometer error:", error),
			});
	};

	const stopCrashDetection = () => {
		if (subscriptionRef.current) {
			subscriptionRef.current.unsubscribe();
			subscriptionRef.current = null;
			console.log("Stopped accelerometer logging");
		}
	};

	useEffect(() => {
		if (enabled) startCrashDetection();
		else stopCrashDetection();

		return () => stopCrashDetection();
	}, [enabled]);

	return null;
};

export default CrashDetectionIOS;
